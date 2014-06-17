var $ = require('jquery');

module.exports = 
function(opts) {
    return extend({},{
        seed : new Date().getTime(),
        firstNames: ['Russ','John','Susan','Satsuki','Ira','Jennifer'],
        lastNames: ['Johnson','Smith','Sama','Eckles','Krieger',
        'Dickinson'],
        getPatientList: function() {
            var self = this;
            var result = [];
            var length = self.getRandInt(0,100);
            if ( length < 10) {
                return result;
            }
            for (var i=0; i<length; i++) {
                result.push({first:self.getRandEl(self.firstNames),
                    last:self.getRandEl(self.lastNames)});
            }
            return result;
        },
        getRand: function() {
            var self = this;
            self.seed = (self.seed * 9301 + 49297) % 233280;
            return self.seed / 233280.0;
        },
        getRandInt: function(min,max) {
            return Math.floor(min + this.getRand() * (max - min));
        },
        getRandEl: function(array) {
            return array[this.getRandInt(0,array.length-1)];
        },
    },
    opts);
};


function extend() {
    var src, copyIsArray, copy, name, options, clone, target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;
    if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && !jQuery.isFunction(target)) {
        target = {};
    }

    // extend jQuery itself if only one argument is passed
    if (length === i) {
        target = this;
        --i;
    }

    for (; i < length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {
            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && jQuery.isArray(src) ? src : [];

                    } else {
                        clone = src && jQuery.isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = jQuery.extend(deep, clone, copy);

                    // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
}
