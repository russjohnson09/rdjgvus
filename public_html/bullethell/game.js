function Game(canvas, options) {
    var self = this;
    self.canvas = canvas;
    self.context = canvas.getContext('2d');
    if (!self.context) return;
    self.margin = options.margin;
    self.width =  options.width;
    self.height = options.height;
    self.frame = 0;
    self.levelIdx = 0; //position in level array
    self.gameComplete = false; //set to true on completion of all levels
    self.levels = [];  //array of levels
    if (options.debug) {
        canvas.width = self.width + self.margin.x * 2;  //include margin as part of visible screen
        canvas.height = self.height + self.margin.y * 2;
        self.context.translate(options.margin.x,options.margin.y);   //origin will start at upper left of game screen.
        self.trace = 10;  //print trace every nth bullet 
    }
    else {
        context.canvas.width = self.width;
        context.canvas.width = self.height;
    }
    self.delay = options.delay || 30;
    self.enemies = [];
    self.start = function() {
        var self = this;
        setInterval(function(){self.loop();},
        self.delay);
    };
    self.loop = function() {
        var self = this;
        var c = self.context;
        // Store the current transformation matrix
        c.save();
        // Use the identity matrix while clearing the canvas
        c.setTransform(1, 0, 0, 1, 0, 0);
        var width = self.canvas.width;
        var height = self.canvas.height;
        c.clearRect(0, 0, width, height);
        // Restore the transform
        c.restore();
        c.strokeRect(0,0,self.width,self.height);
        if (!self.levels[self.levelIdx].loop()) {
            self.levelIdx++;
            if (self.levelIdx > self.levels.length) {
                self.gameComplete = true;
            }
            return;
        }
        for (var i=self.enemies.length - 1; i > -1; i--) {
            var e = self.enemies[i];
            var success = e.loop();
            if (!success) {
                self.enemies.splice(i, 1);
            }
            e.draw(self.context);
        }
    };
    self.oob = function(pos) {
        var self = this;
        return (pos.x < -self.margin.x || pos.y < -self.margin.y || 
                pos.x > self.width + self.margin.x || pos.y > self.height + self.margin.y);
    };
    self.addEnemy = function(e) {
        self.enemies.push(e);
    };
    self.addLevel = function(l) {
        self.levels.push(l); 
    };
    return self;
}

//simulate a particle given postion, velocity and acceleration
function Partical(pos,velocity,acceleration) {
    var self = {};
    self.pos = pos || Vector2();
    self.velocity = velocity || Vector2();
    self.acceleration = acceleration || Vector2();
    self.move = function() {
        var self = this;
        self.pos.add(self.velocity);
        self.velocity.add(self.acceleration);
    };
    return self;
}

//2 dimensional vector with addition
function Vector2(o) {
    var self = {};
    if (!o) {
        self.x = 0;
        self.y = 0;
    }
    else {
        self.x = o.x || 0;
        self.y = o.y || 0;
    }
    self.add = function(v1) {
        var self = this;
        self.x += v1.x;
        self.y += v1.y;
        return self;
    }
    return self;
}
