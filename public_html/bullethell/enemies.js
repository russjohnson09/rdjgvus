//the logic of the enemy should be seperate from the actual drawing

e01 = basic = function(x,y,vx,vy) {
    var self = this;
    this.draw = basicDraw;
    this.loop = 
};

//basicDraw function, takes a context and an object and attempts to 
//draw it according to information provided by the object
function basicDraw(ctx,o) {
    var pos = o.pos;
    if (pos) {
        var x = pos.x;
        var y = pos.y;
        var radius = o.radius;
        if(x && y && radius) {
            drawCircle(ctx,x,y,radius)
        }
    }
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
        self.partical = Partical(Vector2(opts.pos),
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
    context.beginPath();                    //begin path, I think fill might already closepath.
    context.arc(x,y,radius,0,Math.PI*2);
    context.closePath();
    context.fill();
}
