//the logic of the enemy should be seperate from the actual drawing
//loop - mainloop and enemy logic, takes game as a parameter
e01 = basic = function(x,y,vx,vy,radius) {
    var self = {};
    self.particle = new Particle(new Vector2XY(x,y),new Vector2XY(vx,vy),null,radius || 10);
    return self;
    //var pos = new Particle(new Vector2(x,y),new Vector2(vx,vy)) //
    //this.draw = basicDraw; //enemy should not have to define its own draw function. falls back on game's
    //this.loop = //loop does not have to be explicitly defined for enemies following a regular
    //pattern. boss's will require this to be defined.
};

function basicEnemyDraw(ctx) {
        
}


function basicEnemy(game,opts) {
    var self = {};
    if (!game) return;
    self.game = game;
    self.radius = 5;
    self.fillStyle = "#000";
    if (!opts) {
        self.partical = Partical();
    }
    else {
        self.partical = Particle(Vector2(opts.pos),
                   Vector2(opts.velocity),
                   Vector2(opts.acceleration));
    }
    self.loop = function() {
        var self = this;
        if (game.oob(self.partical.pos)) {
            return false;
        }
        else {
            self.partical.move();
        }
        return true;
    };
    self.draw = function(context) {
        context.fillStyle = self.fillStyle;
        drawCircle(context,self.partical.pos.x,self.partical.pos.y,self.radius);
    };
    return self;
}

function drawCircle(ctx,x,y,radius) {
    ctx.beginPath();                    //begin path, I think fill might already closepath.
    ctx.arc(x,y,radius,0,Math.PI*2);
    ctx.closePath();
    ctx.fill();
}
