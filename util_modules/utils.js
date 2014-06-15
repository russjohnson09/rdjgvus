module.exports = 
function(opts) {
    var self = {
        firstNames: ['Russ','John','Susan','Satsuki','Ira','Jennifer'],
        lastNames: ['Johnson','Smith','Sama','Eckles','Krieger'],
        getPatientList: function(length) {
            var self = this;
            var length = length || 10;
            var result = [];
            for (var i=0; i<length; i++) {
                result.push({first:self.getRandEl(self.firstNames),
                    last:self.getRandEl(self.lastNames)});
            }
            return result;
        },
        //if no seed given use time
        getRand: function(seed) {
            seed = seed || new Date().getTime();
            return ((seed * 9301 + 49297) % 233280) / 233280.0;
        },
        getRandInt: function(min,max,seed) {
            return Math.floor(min + this.getRand() * (max - min));
        },
        getRandEl: function(array,seed) {
            return array[this.getRandInt(0,array.length-1)];
        },
    }
    return self;
};
