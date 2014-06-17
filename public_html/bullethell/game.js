function Game(context, options) {
    var self = this;
    self.context = context;
    if (!context) return;
    self.margin = options.margin;
    self.width =  options.width;
    self.height = options.height;
    self.frame = 0;
    self.levelIdx = 0; //position in level array
    self.gameComplete = false; //set to true on completion of all levels
    self.levels = [];  //array of levels
    if (options.debug) {
        context.canvas.width = self.width + self.margin.x * 2;  //include margin as part of visible screen
        context.canvas.height = self.height + self.margin.y * 2;
        context.translate(options.margin.x,options.margin.y);   //origin will start at upper left of game screen.
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
        c.clearRect(-self.margin.x,-self.margin.y,self.width,self.height);
        c.fillStyle = "#FFF";
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
    this.pos = pos || Vector2();
    this.velocity = velocity || Vector2();
    this.acceleration = acceleration || Vector2();
    this.move = function() {
        var self = this;
        self.pos.add(self.velocity);
        self.velocity.add(self.acceleration);
    };
    return this;
}

//2 dimensional vector with addition
function Vector2(o) {
    if (!o) {
        this.x = 0;
        this.y = 0;
    }
    else {
        this.x = o.x || 0;
        this.x = o.y || 0;
    }
    this.add = function(v1) {
        var self = this;
        self.x += v1.x;
        self.y += v1.y;
        return self;
    }
    return this;
}
