//this is the simplest example of a level, each enemy type is represented
//to the degree that it needs to be, there is a boss at the end and a
//big surprise
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
