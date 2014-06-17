function Level1(game) {
    var self = {};
    self.game = game;
    self.frame = 0;
    self.loop = function(){
        var self = this;
        if (self.frame == 0) {
            self.game.addEnemy(basicEnemy(self.game,{pos:{x:10,y:10},velocity:{x:1,y:10}}));
        }
        self.frame++;
        return true;
    };
    return self;
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

function drawCircle(context,x,y,radius) {
    context.beginPath();                    //begin path, I think fill might already closepath.
    context.arc(x,y,radius,0,Math.PI*2);
    context.closePath();
    context.fill();
}
