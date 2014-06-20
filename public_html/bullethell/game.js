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
function Game(canvas, options) {
    var self = this;
    self.seed = options.seed || 0;
    self.canvas = canvas;
    self.context = canvas.getContext('2d');
    if (!self.context) return;
    self.margin = options.margin;
    self.width =  options.width;
    self.height = options.height;
    self.state = "";
    self.frame = 0;
    self.levelIdx = 0; //position in level array
    self.gameComplete = false; //set to true on completion of all levels
    self.levels = [];  //array of levels
    if (options.debug) {
        canvas.width = self.width + self.margin.x * 2;  //include margin as part of visible screen
        canvas.height = self.height + self.margin.y * 2;
        self.context.translate(options.margin.x,options.margin.y);   //origin will start at upper left of game screen.
        self.trace = 10;  //print trace every nth bullet 
        self.isDebug = true;
    }
    else {
        context.canvas.width = self.width;
        context.canvas.width = self.height;
    }
    self.player = player(self);
    self.delay = options.delay || 30;
    //self.mspf = self.delay / 1000;
    self.fps = Math.floor(1000 / self.delay);
    self.loopE = //loop executed by a basic enemy used if enemy does not define its own loop returns false if
                 //enemey should be removed
        function(o) {
            var self = this;
            var result;
            if (self.oob(o)) {  //game defines out of boundness for an object
                return false;
            }
            if (typeof o.move == "function") {
                result = o.move(self);
            }
            else {
                result = self.move(o);
            }
            if (!result) return false;
            var spawnObject = o.spawnObject;
            if (spawnObject) {
                if (typeof spawnObject.loop == "function") {
                    spawnObject.loop(self);
                }
                else {
                    self.spawn(spawnObject);
                }
            }
            return true;
        };
    self.spawn = function(o) {
        o.frame++;
        if (self.delay * o.frame > o.delay) {
            o.frame = 0;
            var enemy = o.spawn();
            if (enemy) {
                if (enemy instanceof Array) {
                    self.enemies = self.enemies.concat(enemy);
                }
                else{
                  self.addEnemy(enemy);
                }
            }
        }
    },
    self.oob = function(o) {
        var self = this;
        var pos = o.pos;
        return (pos.x < -self.margin.x || pos.y < -self.margin.y || 
                pos.x > self.width + self.margin.x || pos.y > self.height + self.margin.y);
    };
    self.move = function(o) {
        var self = this;
        var pos = o.pos;
        var v = o.v;
        pos.x += v.x * self.delay;
        pos.y += v.y * self.delay;
        var a = o.a;
        if (typeof o.vFunc == "function") {
            o.vFunc();
        }
        else if (a) {
            v.x += a.x * self.delay;
            v.y += a.y * self.delay;
        }
        if (typeof o.aFunc == "function") {
            o.aFunc();
        }
        return true;
    };
    self.enemies = [];
    self.start = self.resume = function() {
        var self = this;
        self.state = "playing";
        self.interval = setInterval(function(){self.loop();},
        self.delay);
    };
    self.pause = function() {
        var self = this;
        self.state = "paused";
        clearInterval(self.interval);
    };
    self.togglePause = function() {
        var self = this;
        if (!self.state) {
            self.start();
        }
        else if (self.state == "paused") {
            self.resume();
        }
        else {
            self.pause();
        }
    };
    self.debug = function() {
        console.log(self.enemies.length);
    };
    self.loop = function() {
        var self = this;
        if (self.frame % self.fps == 0) {
            self.debug();
        }
        var c = self.context;
        c.save();
        c.setTransform(1, 0, 0, 1, 0, 0);
        var width = self.canvas.width;
        var height = self.canvas.height;
        c.clearRect(0, 0, width, height);
        c.restore();
        if (self.isDebug) {
            c.strokeStyle = "black";
            c.strokeRect(0,0,self.width,self.height);
        }
        if (!self.levels[self.levelIdx].loop(self)) {
            self.levelIdx++;
            if (self.levelIdx > self.levels.length) {
                self.gameComplete = true;
            }
            return;
        }
        for (var i=self.enemies.length - 1; i > -1; i--) {
            var e = self.enemies[i];
            var success;
            if (typeof e.loop == "function") {
                success = e.loopE(self);
            }
            else {
                var success = self.loopE(e);
            }
            if (!success) {
                self.enemies.splice(i, 1);
            }
            if (e.draw) {
                e.draw(self.context,e);
            }
            else {
                self.draw(self.context,e);
            }
        }
        if (self.player) {
           var p = self.player;
           if (typeof p.loop == "function") {
           }
           if (typeof p.draw == "function") {
           }
           else {
                self.drawPlayer(c,p);
           }
        }
        self.frame++;
    };
    self.draw = function(ctx,o) {
        var self = this;
        drawCircle(ctx,o.pos.x,o.pos.y,o.r);
        if (self.isDebug) {
            if (o.drawDebug == "function") {
                o.drawDebug(ctx,game);
            }
            else {
                self.drawDebug(ctx,o);
            }
        }
    }
    
    self.drawDebug = function(ctx,o) {
        var self = this;
        if (o.v) {drawLine(ctx,o.pos.x,o.pos.y,o.v.x * 1000,o.v.y * 1000,"blue");}
        if (o.a) {drawLine(ctx,o.pos.x,o.pos.y,o.a.x * 1000 * 1000 ,o.a.y * 1000 * 1000,"red");}
    };
    
    self.drawPlayer = function(ctx,p) {
        drawCircle(ctx,p.pos.x,p.pos.y,p.r2,"rgba(40, 40, 215, 0.3)");
        drawCircle(ctx,p.pos.x,p.pos.y,p.r,"rgba(40, 40, 215, 1)");
    }
    
    self.addEnemy = function(e) {
        self.enemies.push(e);
    };
    self.addLevel = function(l) {
        self.levels.push(l); 
    };
    return self;
}

function player(game) {
    var self = {};
    self.pos = {x:game.width/2,y:game.height - 10};
    self.r = 5;
    self.r2 = 20;
    return self;
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

function Level01(game,e,delay) {
    Math.seedrandom(1);
    if (!game) return;
    self.eFunc = e || simpleArc02;
    if (!(delay > 0)) self.delay = 100;
    self.frame = 0;
    self.spf = game.spf;
    self.loop = function(game){
        var self = this;
        if (self.frame % self.delay == 0) {
            game.addEnemy(self.eFunc());
        }
        self.frame++;
        return true;
    };
    return self;
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


function randInt(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randNum(min,max) {
    return Math.random() * (max - min) + min;
}
