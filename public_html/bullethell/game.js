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
    var game = {};
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
        }
    });
    game.getWidth = function() {return width};
    game.getHeight = function() {return height};
    game.getPlayer = function() {return player;};
    game.loopE =
        function(o) {
            var self = this;
            var result;
            if (game.oob(o)) {
                return false;
            }
            if (typeof o.move == "function") {
                result = o.move(self);
            }
            else {
                result = game.move(o);
            }
            if (!result) return false;
            var spawnObject = o.spawnObject;
            if (spawnObject) {
                if (typeof spawnObject.loop == "function") {
                    spawnObject.loop(self);
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
    game.oob = function(o) {
        var pos = o.pos;
        return (pos.x < -margin.x || pos.y < -margin.y || 
                pos.x > width + margin.x || pos.y > height + margin.y);
    };
    game.move = function(o) {
        var self = this;
        var pos = o.pos;
        var v = o.v;
        pos.x += v.x * delay;
        pos.y += v.y * delay;
        var a = o.a;
        if (typeof o.vFunc == "function") {
            o.vFunc();
        }
        else if (a) {
            v.x += a.x * delay;
            v.y += a.y * delay;
        }
        if (typeof o.aFunc == "function") {
            o.aFunc();
        }
        return true;
    };
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
        if (!isDebug) return;
        if (console.log == "function") {
            console.log(enemies.length);
        }
        if (debugPanel) {
            debugPanel.text = 1;
        }
    };
    game.tick = function() {
        var self = this;
        if (frame % fps == 0) {
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
                game.draw(e);
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
        debugBroadcast.broadcast({
            player:player,
            
        });
    };
    game.draw = function(o) {
        var self = this;
        drawCircle(ctx,o.pos.x,o.pos.y,o.r);
        if (isDebug) {
            if (o.drawDebug == "function") {
                o.drawDebug(ctx,game);
            }
            else {
                drawDebug(ctx,o);
            }
        }
    }
        
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
            lvl.eFunc = e || simpleArc02;
            if (!(delay > 0)) lvl.delay = 100;
            lvl.frame = 0;
            lvl.spf = game.spf;
            lvl.loop = function(game){
                var lvl = this;
                if (lvl.frame % lvl.delay == 0) {
                    game.addEnemy(lvl.eFunc());
                }
                lvl.frame++;
                return true;
            };
            game.addLevel(lvl);
        }
    };
     
    return game;
    
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
        if (o.v) {drawLine(ctx,o.pos.x,o.pos.y,o.v.x * 1000,o.v.y * 1000,"blue");}
        if (o.a) {drawLine(ctx,o.pos.x,o.pos.y,o.a.x * 1000 * 1000 ,o.a.y * 1000 * 1000,"red");}
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
}

function simpleArc02(spawnObject,delay,spawn,bullet,target) {
    var self = {};
    self.r = 10;
    self.v = {x:0.1,y:0.1};
    self.pos = {x:0,y:0};
    self.a = {x:0,y:-0.00005};
    self.spawnObject = spawnObject || bs03(self,delay,spawn,bullet,target);
    return self;
}


//burst bullet returns array of five bullets
function rpBurst(o) {
    var result = [];
    for (var i=0; i<5; i++) {
        result.push(
            { r: 5,
            pos: {x:o.pos.x,y:o.pos.y},
            v: {x:(i-2)*0.1,y:0.1}
            }
        );
    }
    return result;
};

//construct that takes parent,delay,spawn, and bullet
function bs03(parent,delay,spawn,bullet,target) {
    return {
    parent: parent,
    frame: 0,
    delay: delay || 500,
    spawn : spawn || function() {
        if (typeof bullet == "function") {
            return bullet(this.parent,target);
        }
        else {
            return rp02(this.parent);
        }
    }
    }
}

function aimed(o,target) {
}

function bseek(o,target,vx,vy) {
    var self = {};
    self.r = 5;
    self.target = target;
    self.pos = {x:o.pos.x,y:o.pos.y};
    self.v = {};
    self.v.x = o.v.x;
    self.v.y = o.v.y;
    self.a = {x:0,y:0};
    self.aFunc = function() {
        var self = this;
        var mass = 1;
        var c = 30;
        var r2 = Math.pow((self.target.pos.x - self.pos.x),2) + Math.pow((self.target.pos.y - self.pos.y),2);
        var sum = Math.abs(self.target.pos.x - self.pos.x) + Math.abs((self.target.pos.y - self.pos.y));
        var ratioX = (self.target.pos.x - self.pos.x)/sum;
        var ratioY = (self.target.pos.y - self.pos.y)/sum;
        self.a.x = ratioX * 1/r2 * c;
        self.a.y = ratioY * 1/r2 * c;
    };
    return self;
}



function bseek02(o,target,vx,vy) {
    var self = {};
    self.r = 5;
    self.target = target;
    self.pos = {x:o.pos.x,y:o.pos.y};
    self.v = {};
    self.v.x = o.v.x;
    self.v.y = o.v.y;
    self.a = {x:0,y:0};
    self.aFunc = function() {
        var self = this;
        if (self.pos.x < self.target.pos.x) {
            self.a.x = 0.001;
        }
        else if (self.pos.x > self.target.pos.x) {
            self.a.x = -0.0001;
        }
    };
    return self;
}

function bseek01(o,target,vx,vy) {
    var self = {};
    self.r = 5;
    self.target = target;
    self.pos = {x:o.pos.x,y:o.pos.y};
    self.v = {};
    self.v.x = o.v.x;
    self.v.y = o.v.y;
    self.vFunc = function() {
        var self = this;
        if (self.pos.x < self.target.pos.x) {
            self.v.x = self.v.x + 0.01;
        }
        else if (self.pos.x > self.target.pos.x) {
            self.v.x = self.v.x - 0.01;
        }
    };
    return self;
}



function bs02(o) {
    return {
        parent: o,
        frame: 0,
        delay: 500, //delay in milliseconds
        spawn: function() {
            return rp02(this.parent);
        }
    };
}

function bs01(o) {
    return {
        parent: o,
        frame: 0,
        delay: 500, //delay in milliseconds
        spawn: function() {
            return rp01(this.parent);
        }
    };
}

//relative positioning no moves tangently
function rp01(o) {
    return {
        r: 5,
        pos: {x:o.pos.x,y:o.pos.y},
        v: {x:o.v.x,y:o.v.y}
    };
}

//add a little umph
function rp02(o) {
    var self = {};
    self.r = 5;
    self.pos = {x:o.pos.x,y:o.pos.y};
    self.v = {};
    self.v.x = o.v.x - 0.1;
    self.v.y = o.v.y - 0.1;
    if (self.v.x < 0.05) {
        self.v.x = 0.05;
    }
    if (self.v.y < 0.05) {
        self.v.y = 0.1;
    }
    return self;
}

function eb1() {
    return {
        r: 10,
        v: {x:0.1,y:0.1},
        pos: {x:0,y:0},
        a: {x:0,y:-0.00005}
    }
}
