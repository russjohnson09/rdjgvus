

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
