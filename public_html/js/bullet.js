$(function() {
    var styles = ["rgb(200,0,0)", "rgba(0, 0, 204)", "rgba(153, 0, 76)"];
    var def = {
        pos : {
            x : 0,
            y : 0
        },
        v : {
            x : 0,
            y : 0
        },
        a : {
            x : 0,
            y : 0
        },
        r : 5,
        h : 5,
        fillStyle : "rgb(0,0,0)",
        move : move,
        draw : draw,
        frame : 0
    };

    var p = $.extend({}, def, {
        r : 10,
        pos : {
            x : 250,
            y : 250
        },
        v : {
            x : 0,
            y : 0
        },
        a : {
            x : 0,
            y : 0
        },
        action : {
            left : false,
            up : false,
            right : false,
            down : false,
            fire : false
        },
        fireRate: 20,
        lastFired: 0,
        execute : playerEx,
        draw : draw,
        move : playerMove,
        frame : 0,
        bullets : []
    });

    var keyMap = {
        left : 37,
        up : 38,
        right : 39,
        down : 40,
        z : 90
    };

    function playerMove(o) {
        setV(this);
        moveObj(this, {
            x : 500,
            y : 500
        });
    }

    function setV(o) {
        var action = o.action;
        if (action.left && !action.right) {
            o.v.x = -10;
        } else if (!action.left && action.right) {
            o.v.x = 10;
        } else {
            o.v.x = 0;
        }

        if (action.up && !action.down) {
            o.v.y = -10;
        } else if (!action.up && action.down) {
            o.v.y = 10;
        } else {
            o.v.y = 0;
        }
    }


    window.onkeydown = function(e) {
        console.log(e.which);
        action(e.which, true);
    };
    window.onkeyup = function(e) {
        action(e.which, false);
    };

    function playerEx(o) {
        this.draw(o);
        if (this.frame % this.fireRate == 0) {
            var bullet = {
                execute : playerBullet,
                parent : this
            };
            this.bullets.push(bullet);
            ary.push(bullet);
        }
        this.move(o);
        this.frame ++;
    }
    
    function playerBullet(o) {
        $.extend(true, this, def);
        this.pos = $.extend(true, {}, this.parent.pos);
        this.v = {
            x : this.parent.v.x + Math.random(0, 1),
            y : this.parent.v.y + Math.random(0, 1)
        };
        this.r = 2;
        this.move = move;
        this.draw = draw;
        this.execute = function(o) {
            this.move(o);
            this.draw(o);
        };
        this.execute(o);
    }

    function action(key, t) {
        switch (key) {
            case keyMap.left:
                p.action.left = t;
                break;
            case keyMap.up:
                p.action.up = t;
                break;
            case keyMap.right:
                p.action.right = t;
                break;
            case keyMap.down:
                p.action.down = t;
                break;
            case keyMap.z:
                p.action.fire = t;
        }
    }

    var canvas = document.getElementById('canvas');
    var fpsEl = document.getElementById("fps");
    var ctx = canvas.getContext('2d');
    var lvl = {
        execute : lvlInit
    };
    var ary = [lvl, p];
    var frame = 0;
    var now = Date.now();
    setInterval(function() {
        play({});
        frame++;
        if (frame % 120 == 0) {
            fpsEl.innerHTML = (120 / (Date.now() - now)) * 1000;
            now = Date.now();
        }
    }, 1000 / 60);

    function play(o) {
        ctx.clearRect(0, 0, 500, 500);
        for (var i = ary.length - 1; i > -1; i--) {
            ary[i].execute({
                ix : i,
                ary : ary,
                ctx : ctx
            });
        }
    }

    function lvl1(o) {
        var ary = o.ary;
        if (this.frame % 60 == 0) {
            o.ary.push({
                execute : InitEnemy1
            });
            o.ary.push({
                execute : InitArcEnemy
            });
        }

        if (this.frame == 1) {
            o.ary.push({
                execute : SakyunInit
            });
        }

        if (this.frame > 600) {
            o.ary.splice(o.ix, 1);
        }
        this.frame++;
    }

    function SakyunInit(o) {
        $.extend(true, this, def);
        this.bullets = [];
        this.frame = 0;
        this.execute = Sakyun;
        this.move = SakyunMove1;
        this.spawnRate = 5;
        this.laserRate = 240;
        this.laser = laser;
        this.bulletInit = BulletInit;
        this.draw = draw;
        this.destroy = destroyBoss;
        this.pos = {
            x : 400,
            y : 100
        };
        this.v = {
            x : -1,
            y : 0,
        };
    }

    function destroyBoss(o) {
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].move = destroy;
        }
        o.ary.splice(o.ix, 1);
    }

    function Sakyun(o) {
        if (this.frame % this.spawnRate == 0) {
            var bullet = {
                execute : this.bulletInit,
                parent : this
            };
            this.bullets.push(bullet);
            o.ary.push(bullet);
        }

        if (this.frame % this.laserRate == 0) {
            var laser = {
                execute : this.laser,
                parent : this
            };
            o.ary.push(laser);
        }

        if (this.frame > 600) {
            this.destroy(o);
        }
        this.move(o);
        this.draw(o);
        this.frame++;
    }

    function laser(o) {
        $.extend(true, this, def);
        $.extend(true, this.pos, this.parent.pos);

        this.pos2 = {
            x : 100,
            y : 600
        };
        deadly = false;
        this.draw = drawLaser;
        this.phase1 = 60;
        this.phase2 = 120;
        this.lineWidth = 1;
        this.execute = laser2;
        this.destroy = destroy;
        this.execute(o);
    }

    function laser2(o) {
        if (this.frame > this.phase2) {
            this.destroy(o);
        } else if (this.frame > this.phase1) {
            this.lineWidth = 10;
            deadly = true;
        }
        this.draw(o);
        this.frame++;

    }

    function drawLaser(o) {
        var ctx = o.ctx;
        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(this.pos2.x, this.pos2.y);
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
    }

    function moveObj(o, bounds) {
        o.pos.x += o.v.x;
        o.pos.y += o.v.y;
        o.v.x += o.a.x;
        o.v.y += o.a.y;
        if (bounds) {
            if (o.pos.x + o.r > bounds.x) {
                o.pos.x = bounds.x;
            } else if (o.pos.x - o.r < 0) {
                o.pos.x = 0;
            }
            if (o.pos.y + o.r > bounds.y) {
                o.pos.y = bounds.y;
            } else if (o.pos.y - o.r < 0) {
                o.pos.y = 0;
            }
        }
    }
    
    function destroyIx(ix) {
        ary.splice(ix,1);
    }

    function destroy(o) {
        o.ary.splice(o.ix, 1);
    }

    function SakyunMove1(o) {
        moveObj(this);
        if (this.pos.x < 10) {
            this.v.x = 10;
        } else if (this.pos.x > 400) {
            this.v.x = -1;
        }
    }

    function SakyunMove2(o) {

    }

    function lvlInit(o) {
        this.frame = 0;
        this.execute = lvl1;
        this.execute(o);
    }

    function InitEnemy1(o) {
        $.extend(true, this, def);
        this.frame = 0;
        this.pos = {
            x : 10,
            y : 0
        };
        this.v = {
            x : 1,
            y : 1
        };
        this.bulletInit = BulletInit;
        this.spawnRate = 10;
        this.r = 10;
        this.execute = Enemy;
        this.move = move;
        this.draw = draw;
        this.execute(o);
    }

    function InitArcEnemy(o) {
        $.extend(true, this, def);
        this.frame = 0;
        this.pos = {
            x : 510,
            y : 50 + Math.random(0, 10)
        };
        this.v = {
            x : -5 + Math.random(0, 2),
            y : 7 + Math.random(0, 2)
        };
        this.a.y = -.25;
        this.spawnRate = 10;
        this.bulletInit = BulletInit;
        this.execute = Enemy;
        this.execute(o);
    }

    function Enemy(o) {
        if ((this.frame % this.spawnRate) == 0) {
            o.ary.push({
                execute : this.bulletInit,
                parent : this,
            });
        }
        this.move(o);
        this.draw(o);
        this.frame++;
    }

    function BulletInit(o) {
        $.extend(true, this, def);
        this.pos = $.extend(true, {}, this.parent.pos);
        this.v = {
            x : this.parent.v.x + Math.random(0, 1),
            y : this.parent.v.y + Math.random(0, 1)
        };
        this.r = 2;
        //this.fillStyle = styles[2];
        //this.fillStyle = styles[this.parent.frame % styles.length];
        //this.fillStyle = styles[Math.floor(Math.random() * styles.length)];
        this.move = move;
        this.draw = draw;
        this.execute = function(o) {
            if (collision(this,p)) {
                ary.splice(o.ix,1);
            }
            this.move(o);
            this.draw(o);
        };
        this.isInit = true;
        this.execute(o);
    }
    
    function collision (o1,o2) {
        return (Math.pow(o1.pos.x - o2.pos.x,2) + Math.pow(o1.pos.y - o2.pos.y,2)) < Math.pow(o1.r + o2.r,2);
    }

    function randColor() {
        return "";
    }

    function move(o) {
        this.pos.x += this.v.x;
        this.pos.y += this.v.y;
        this.v.x += this.a.x;
        this.v.y += this.a.y;

        if (this.pos.x - this.r > 510 || this.pos.y - this.r > 510 || this.pos.x + this.r < -10 || this.pos.y + this.r < -10) {
            o.ary.splice(o.ix, 1);
            return;
        }
    }

    function draw(o) {
        var ctx = o.ctx;
        ctx.fillStyle = this.fillStyle;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }

});

