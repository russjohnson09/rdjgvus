//this is the simplest example of a level, each enemy type is represented
//to the degree that it needs to be, there is a boss at the end and a
//big surprise
function Level1() {
    Math.seedrandom(2);
    var self = {};
    self.frame = 0;
    self.loop = function(game){
        var self = this;
        if (self.frame < 100 && self.frame % 10 == 0) {
            game.addEnemy(basicArcLeft());
        }
        else if (self.frame < 200 && self.frame % 10 == 0) {
            //game.addEnemy(chaoticE(game.width/2,-5));
        }
        self.frame++;
        return true;
    };
    return self;
}
