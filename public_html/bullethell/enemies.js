//the logic of the enemy should be seperate from the actual drawing
//loop - mainloop and enemy logic, takes game as a parameter
var e02 = basic2 = function(x,y,vx,vy,ax,ay,radius) {
    var self = {};
    var x = x || 0;
    var y = y || 0;
    var vx = vx || 0;
    var radius = radius || 5;
    var ax = ax || 0;
    var ay = ay || 0;
    self.particle = new Particle(new Vector2XY(x,y),new Vector2XY(vx,vy),new Vector2XY(ax,ay),{radius:radius || 10});
    return self;
}

function basicArcLeft() {
    var x = -20;
    var y = randNum(100,250);
    var radius = 10;
    var scale = 0.5;
    var scale2 = scale * scale;
    var vx = 10 * scale;
    var vy = 10 * scale;
    var ax = 0;
    var ay = randNum(-0.8 * scale2,-0.5 * scale2);
    return {
        particle : new Particle(new Vector2XY(x,y),new Vector2XY(vx,vy),
        new Vector2XY(ax,ay),{radius:radius})};
}

function basicArc(x,MinY,MaxY,vx,vy,ay) {

}

var e01 = basic = function(x,y,vx,vy,radius) {
    var self = {};
    self.particle = new Particle(new Vector2XY(x,y),new Vector2XY(vx,vy),null,{radius:radius || 10});
    return self;
};

var e01rand = basicRandom = function() {
    var x = randNum(-5,10);
    var y = randNum(-5,-1);
    var radius = randNum(3,10);
    var vx = -x + randNum(1,5);
    var vy = randNum(1,10);
    return e01(x,y,vx,vy,radius);
};

//takes basic x, y, vx, vy, ax, ay, radius. any unspecified params are given a random value.
var e02rand = function(x,y,vx,vy,ax,ay,radius) {
    var x = randNum(-5,10);
    var y = randNum(-5,-1);
    var radius = radius || randNum(3,10);
    var vx = -x + randNum(1,5);
    var vy = randNum(1,10);
};

//takes some options and returns an enemy, called by any of the more simplified enemy
//constructors
function basicEnemy(options) {
    if (!options) return;
    var self = this;
    var pos = getVector(options.pos);
    self.particle = new Particle(pos,velocity,acceleration,type,radius);
    if (typeof options.x != 'number') {
    }
    if (typeof options.x == 'number' || typeof options.y == 'number') {
        var x = options.x || 0;
        var y = options.y || 0;
    }
    if (!options) {
        return {
            
        }
    }
}

function getVector(v) {
    if (typeof v.x != 'number') {
        if (typeof v.MinX == 'number') {
        
        }
        else {
            return;
        }
    }
}

var chaoticE = function(x,y) {
    return basic2(x,y);

};
