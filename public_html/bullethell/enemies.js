//the logic of the enemy should be seperate from the actual drawing
//loop - mainloop and enemy logic, takes game as a parameter
e01 = basic = function(x,y,vx,vy,radius) {
    var self = {};
    self.particle = new Particle(new Vector2XY(x,y),new Vector2XY(vx,vy),null,radius || 10);
    return self;
};

e01rand = function() {
    return 
};
