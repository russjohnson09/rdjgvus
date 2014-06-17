function Level1(game) {
    var self = this;
    self.game = game;
    self.frame = 0;
    self.loop = function(){
        var self = this;
        if (self.frame % 10 == 0) {
            self.game.addEnemy(basicEnemy(self.game));
        }
        self.frame++;
        return true;
    };
    return self;
}

function basicEnemy(game,opts) {
    if (!game) return;
    this.game = game;
    if (!opts) {
        this.partical = Partical();
    }
    else {
        this.partical = Partical(Vector2(opts.pos),
                   Vector2(opts.veloctiy),
                   Vector2(opts.acceleration));
    }
    this.loop = function() {
        var self = this;
        if (game.oob(partical.pos)) {
            return false;
        }
        else {
            partical.move();
        }
        return true;
    };
    return this;
}
