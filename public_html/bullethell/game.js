var window = this;
var document = window.document;
//Returns an game instance.
//params
//canvas - the canvas that will be drawn on
//margin - space between playable area and out of bounds. this margin is not viewable
// except in debug mode.
//width - width of playable area, not including margin
//height - height of playable area
//loop - main loop executed by game
//delay - delay between frames
//start - starts the game
//pause - pauses the game
//frame - frame to start game at, default 0
//levels - array of levels
//levelIdx - 0-position in level array
//gameComplete - is the game complete?
//enemies - an array of enemies
//player - player object, defines its own movement
//keystate - stores the current keystate
//oob - function that defines out of bounds object. 
//majority of game functions should not need to be overridden, but functions will take input provided
//draw - function used to draw elements in game, default is to use each objects draw function if available,
//otherwise get picture position, and dimensions of object, attempt to draw object as box if witdth and height
//given, finally draw as circle.
//collision - are two objects in a state of collision function

var Game = function(canvas,radio,options) {
    var SPACE = 32;
    var SHIFT = 16;
    var LEFT = 37;
    var UP = 38;
    var RIGHT = 39;
    var DOWN = 40;
    var Z = 90;
 
    //declaration of 'private' variables
    var debugBroadcast = radio("changeDebug");
    var game = this;
    var seed = options.seed || 0;
    var canvas = canvas;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var margin = options.margin;
    var width =  options.width;
    var height = options.height;
    var interval;
    var isDebug;
    var state = "";
    var frame = 0;
    var enemies = [];
    var levelIdx = 0; //position in level array
    var gameComplete = false; //set to true on completion of all levels
    var levels = [];  //array of levels
    var playerBullets = [];
    var debugPanel;
    var trace;
    var player;
    var console = options.console || window.console;
    if (options.isDebug) {
        canvas.width = width + margin.x * 2;  //include margin as part of visible screen
        canvas.height = height + margin.y * 2;
        ctx.translate(options.margin.x,options.margin.y);   //origin will start at upper left of game screen.
        trace = 10;  //print trace every nth bullet 
        isDebug = true;
    }
    else {
        canvas.width = width;
        canvas.width = height;
    }
    var delay = options.delay || 30;
    var fps = Math.floor(1000 / delay);
    Object.defineProperty(game,"isDebug",{
        get: function() {return isDebug},
        set: function(val) {isDebug = val}
    });
    Object.defineProperties(game, {
        "width": {
            get: function() {return width}
        },
        "height": {
            get: function() {return height}
        },
        "player": {
        },
        "enemies": {
            length: function() {return enemies.length}
        },
        "state": {
            get: function() {return state}
        },
        "margin": {
            get: function() {return margin}
        }
    });
    game.getWidth = function() {return width};
    game.getHeight = function() {return height};
    game.getPlayer = function() {return player;};
    game.loopE =
        function(e) {
            var result;
            if (oob(e)) {
                return false;
            }
            result = e.move();
            if (!result) return false;
            var spawnObject = e.spawnObject;
            if (spawnObject) {
                if (typeof spawnObject.loop == "function") {
                    spawnObject.loop();
                }
                else {
                    game.spawn(spawnObject);
                }
            }
            return true;
        };
    game.spawn = function(o) {
        o.frame++;
        if (game.delay * o.frame > o.delay) {
            o.frame = 0;
            var enemy = o.spawn();
            if (enemy) {
                if (enemy instanceof Array) {
                    enemies = enemies.concat(enemy);
                }
                else{
                  game.addEnemy(enemy);
                }
            }
        }
    },
    game.start = game.resume = function() {
        player = initPlayer(options);
        state = "playing";
        interval = setInterval(function(){game.tick()},
        delay);
    };
    game.pause = function() {
        var self = this;
        state = "paused";
        clearInterval(interval);
    };
    game.togglePause = function() {
        var self = this;
        if (!state) {
            game.start();
        }
        else if (state == "paused") {
            game.resume();
        }
        else {
            game.pause();
        }
    };
    game.debug = function() {
        debugBroadcast.broadcast({
            player:player.position,
            fps:fps,
            enemyCount:enemies.length
        });
    };
    game.tick = function() {
        var self = this;
        if (isDebug && frame % fps == 0) {
            game.debug();
        }
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width,  canvas.height);
        ctx.restore();
        if (isDebug) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(0,0,width,height);
        }
        if (!levels[levelIdx].loop(self)) {
            levelIdx++;
            if (levelIdx > levels.length) {
                gameComplete = true;
            }
            return;
        }
        for (var i=enemies.length - 1; i > -1; i--) {
            var e = enemies[i];
            var success;
            if (typeof e.loop == "function") {
                success = e.loopE(self);
            }
            else {
                var success = game.loopE(e);
            }
            if (!success) {
                enemies.splice(i, 1);
            }
            if (e.draw) {
                e.draw(ctx,e);
            }
            else {
                draw(e);
            }
        }
        if (player) {
           if (typeof player.loop == "function") {
           }
           if (typeof player.draw == "function") {
           }
           else {
                drawPlayer();
           }
        }
        frame++;
    };
        
    game.addEnemy = function(e) {
        enemies.push(e);
    };
    game.addLevel = function(l) {
        levels.push(l); 
    };

    game.utils = { 
        addBasicLevel: function(e,delay) {
            var lvl = {};
            Math.seedrandom(1);
            lvl.eFunc = e;
            if (!(delay > 0)) lvl.delay = 100;
            lvl.frame = 0;
            lvl.loop = function(game){
                var lvl = this;
                if (lvl.frame % lvl.delay == 0) {
                    game.addEnemy(new lvl.eFunc());
                }
                lvl.frame++;
                return true;
            };
            game.addLevel(lvl);
        }
    };
    
    
    function oob(e) {
        var pos = e.position;
        return (pos.x < -margin.x || pos.y < -margin.y || 
                pos.x > width + margin.x || pos.y > height + margin.y);
    }

    function draw(o) {
        var self = this;
        var pos = o.position;
        drawCircle(ctx,pos.x,pos.y,o.radius);
        if (isDebug) {
            if (o.drawDebug == "function") {
                o.drawDebug(ctx,game);
            }
            else {
                drawDebug(ctx,o);
            }
        }
    }
    
    //helper functions
    function initPlayer() {
        var p = {};
        var pos = {x:width/2,y:height - 10};
        var r1 = 5;
        var r2 = 20;
        var currentState = null;
        var isFiring = false;
        var isBombing = false;
        var isShift = false;
        var keys = {};
        Object.defineProperties(p,{
            position: {
                get: function() {return pos;},
                set: function(val) {pos = val;}
            },
            innerRadius: {
                get: function() {return r1;}
            },
            outerRadius: {
                get: function() {return r2;}
            }
        });
        
        p.move = function() {
            
        };
        window.addEventListener('keyup', function (e) {
            //e.preventDefault();
            console.log(e.keyCode);   
        });
        
        window.addEventListener('keydown', function (e) {
            //e.preventDefault();
        });
        
        return p;
    }
    
    function drawPlayer() {
        drawCircle(ctx,player.position.x,player.position.y,player.outerRadius,"rgba(40, 40, 215, 0.3)");
        drawCircle(ctx,player.position.x,player.position.y,player.innerRadius,"rgba(40, 40, 215, 1)");
    }
    
    function drawDebug(ctx,o) {
        var v = o.velocity;
        if (v) {
            drawLine(ctx,o.pos.x,o.pos.y,o.v.x * 1000,o.v.y * 1000,"blue");
        }
        var a = o.acceleration;
        if (a) {
            drawLine(ctx,o.pos.x,o.pos.y,a.x * 1000 * 1000 ,a.y * 1000 * 1000,"red");
        }
    }
   
    function randInt(min,max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randNum(min,max) {
        return Math.random() * (max - min) + min;
    }
    
    function drawLine(ctx,startX,startY,lengthX,lengthY,color) {
        var color = color || "black";
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(startX,startY);
        ctx.lineTo(startX+lengthX,startY+lengthY);
        ctx.stroke();
    }

    function drawVector(ctx,x,y,v,color) {
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x+(v.x * 1000), y+(v.y * 1000));
          ctx.stroke();
    }

    function drawCircle(ctx,x,y,radius,fillStyle) {
        ctx.fillStyle = fillStyle || "black";
        ctx.beginPath();                    //begin path, I think fill might already closepath.
        ctx.arc(x,y,radius,0,Math.PI*2);
        ctx.closePath();
        ctx.fill();
    }
    
    
    function Enemy(spawnObject,delay,spawn,bullet,target) {
        var r = 10;
        var v = {x:0.1,y:0.1};
        var a = {x:0,y:-0.0005};
        var pos = {x:0,y:0};
        Object.defineProperties(this, {
            "radius": {
                get: function() {return r}
            },
            "velocity": {
                get: function() {return v}
            },
            "acceleration": {
                get: function() {return a}
            },
            "position": {
                get: function() {return pos}
            },
        });
    }
    
    function move(e) {
        pos.x += v.x * game.delay;
        pos.y += v.y * game.delay;
        if (typeof vFunc == "function") {
            vFunc();
        }
        else if (a) {
            v.x += a.x * game.delay;
            v.y += a.y * game.delay;
        }
        if (typeof aFunc == "function") {
            aFunc();
        }
        return true;
    }


}

