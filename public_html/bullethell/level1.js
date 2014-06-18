function Level1() {
    var self = {};
    self.frame = 0;
    self.loop = function(game){
        var self = this;
        if (self.frame % 100 == 0) {
            game.addEnemy(basic(1,2,1,1));
        }
        self.frame++;
        return true;
    };
    return self;
}
