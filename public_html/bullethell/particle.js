//simulate a particle given postion, velocity and acceleration
//http://en.wikipedia.org/wiki/Particle
function Particle(pos,velocity,acceleration,radius,width,height) {
    var self = {};
    self.pos = pos || Vector2();
    self.velocity = velocity || Vector2();
    self.acceleration = acceleration || Vector2();
    self.radius = radius;
    self.width = width;
    self.height = height;
    self.move = function() {
        var self = this;
        self.pos.add(self.velocity);
        self.velocity.add(self.acceleration);
    };
    self.getPos = function() {return this.pos};
    return self;
}


function Vector2XY(x,y) {
    return Vector2({x:x,y:y});
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
