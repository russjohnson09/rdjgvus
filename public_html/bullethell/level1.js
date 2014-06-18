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
