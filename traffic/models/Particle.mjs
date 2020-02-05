import RenderCar from '../render/car.mjs';

function Particle(sketch, x, y, lane, radius, sense, direction, life, margin) {
    this.init(sketch, x, y, lane, radius, sense, direction, life, margin);
}

const clone = o => JSON.parse(JSON.stringify(o));

const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);

const distance = (self, target) => {
    const {x, y} = self;
    const {v, h} = target;
    const distance =  Math.hypot(h, v);
    //distance < 30 && console.log(`x diff: ${h}, y diff: ${v}, distance: ${distance}`);
    return distance;
};

function rotate(centerX, centerY, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - centerX)) + (sin * (y - centerY)) + centerX,
        ny = (cos * (y - centerY)) - (sin * (x - centerX)) + centerY;
    return [nx, ny];
}

const worldToLocal = (self, others=[]) => {
    const mapped = {
        front: [],
        left: [],
        right: [],
        back: []
    };

    const translated = others.map(o => {
        const rot = self.direction === 270
            ? [o.x, o.y]
            : rotate(self.x, self.y, o.x, o.y, self.direction === 90
                ? 270 - self.direction
                : 90 - self.direction
            );
        return {
            h: Number((rot[0] - self.x).toFixed(5)),
            v: Number((self.y - rot[1]).toFixed(5)),
            speed: o.speed, life: o.life
        };
    });
    // if(others.length > 5){
    //     debugger
    // }
    const sameLane = h => Math.abs(Math.round(h)) === 0;
    mapped.front = translated.filter(t => sameLane(t.h) && t.v > 0 );
    mapped.back = translated.filter(t => sameLane(t.h) && t.v <= 0 );
    mapped.left = translated.filter(t => Math.round(t.h) < 0 );
    mapped.right = translated.filter(t => Math.round(t.h) > 0 );

    return mapped;
};

function move(self, LANES_COUNT, CAR_WIDTH){
    // will move in the proper direction
    // will stop at intersections
    // may change direction at intersection

    // will slow down if blocked from changing lanes
    // will resume speed if unblocked (+ will check if unblocked)
    // will change lane if blocked only in front

    const senseResult = self.sense('proximity').result;
    const { neighbors, umvelt= {} } = senseResult;
    if(self.chunk && umvelt.chunk && self.chunk.index === 121 && umvelt.chunk.index !== self.chunk.index){
        //debugger;
    }

    self.prevChunk = self.chunk;
    self.chunk = umvelt.chunk;
    const local = worldToLocal(self, neighbors);

    if(self.chunk && ["intersect", "curved"].includes(self.chunk.type)){
        self.x += self.CLIENT_WIDTH/2;
        self.y += self.CLIENT_HEIGHT/2;
    }

    if(
        self.chunk && self.chunk.type === "intersect"
        && self.chunk.index === 86
        && self.direction === 90
        && self.lane === 1
    ){
        const intersect = 180;
        self.reverseCurve = true;
        const transform = umvelt.chunk && umvelt.chunk.move(self, umvelt, intersect);
        self.x = transform.x;
        self.y = transform.y;

        self.rotate = transform.rotate;  //TODO: ugh!  a mess!!!;
        self.rotate = 180 -transform.rotate;

        self.life -= 1;
        if(self.alive){
            self.alive = self.life > 0;
        }
        self.turning = true;
        return;
    }

    if(
        self.chunk && self.chunk.type === "intersect"
        && self.chunk.index === 86
        && self.direction === 90
        && self.lane === 2
    ){
        const intersect = 90;
        //self.reverseCurve = true;
        const transform = umvelt.chunk && umvelt.chunk.move(self, umvelt, intersect);
        self.x = transform.x;
        self.y = transform.y;

        self.rotate = transform.rotate;  //TODO: ugh!  a mess!!!;
        self.rotate = 180 + transform.rotate;

        self.life -= 1;
        if(self.alive){
            self.alive = self.life > 0;
        }
        self.turning = true;
        return;
    }

    if(self.chunk && self.chunk.type === "intersect" && self.chunk.index === 121 /*&& self.lane === 1*/){
        //TODO: transform based on chunk should be used for all movements
        const intersect = self.lane === 1
            ? 0
            : 270;
        if(self.lane !== 1){
            self.reverseCurve = true;
        }
        const transform = umvelt.chunk && umvelt.chunk.move(self, umvelt, intersect);
        self.x = transform.x;
        self.y = transform.y;
        // console.log({
        //     x: self.x,
        //     y: self.y
        // });
        self.rotate = 180 - transform.rotate;  //TODO: ugh!  a mess!!!;
        if(self.lane !== 1){
            self.rotate = 180 + transform.rotate;
        }

        self.life -= 1;
        if(self.alive){
            self.alive = self.life > 0;
        }
        self.turning = true;
        self.reverseCurve = transform.reverseCurve;
        //self.direction = transform.reverseCurve ? -90 : 90; //because all turns are based from 90
        return;
    }

    if(self.chunk && self.chunk.type === "intersect" && self.chunk.index === 150){
        //TODO: transform based on chunk should be used for all movements
        const transform = umvelt.chunk && umvelt.chunk.move(self, umvelt, 90);

        self.x = transform.x;
        self.y = transform.y;
        self.rotate = transform.rotate;

        self.life -= 1;
        if(self.alive){
            self.alive = self.life > 0;
        }
        self.turning = true;
        self.reverseCurve = transform.reverseCurve;
        self.direction = transform.reverseCurve ? 90 : -90; //because all turns are based from 90
        return;
    }

    if(self.chunk && self.chunk.type === "intersect" && self.chunk.index === 118){
        //TODO: transform based on chunk should be used for all movements
        const transform = umvelt.chunk && umvelt.chunk.move(self, umvelt, 270);

        self.x = transform.x;
        self.y = transform.y;
        self.rotate = transform.rotate;

        self.life -= 1;
        if(self.alive){
            self.alive = self.life > 0;
        }
        self.turning = true;
        self.reverseCurve = transform.reverseCurve;
        self.direction = transform.reverseCurve ? 90 : -90; //because all turns are based from 90
        return;
    }

    if(self.chunk && self.chunk.type === "curved"){
        if(self.chunk.index === 149){
            self.reverseCurve = true;
        }

        //TODO: transform based on chunk should be used for all movements
        const transform = umvelt.chunk && umvelt.chunk.move(self, umvelt);

        self.x = transform.x;
        self.y = transform.y;
        self.rotate = transform.rotate;

        self.life -= 1;
        if(self.alive){
            self.alive = self.life > 0;
        }
        self.turning = true;
        self.reverseCurve = transform.reverseCurve;
        self.direction = transform.reverseCurve ? -90 : 90; //because all turns are based from 90
        return;
    }

    if(self.chunk && self.turning){
        self.turning = false;

        if(self.chunk && self.prevChunk.index !== self.chunk.index){
            if( self.chunk.north && self.chunk.north.index === self.prevChunk.index){
                self.direction = 90;
            }
            if( self.chunk.east && self.chunk.east.index === self.prevChunk.index){
                self.direction = 180;
            }
            if( self.chunk.south && self.chunk.south.index === self.prevChunk.index){
                self.direction = 270;
            }
            if( self.chunk.west && self.chunk.west.index === self.prevChunk.index){
                self.direction = 0;
            }
        }

        delete self.rotate;
        delete self.reverseCurve;
    }

    const isChangingLane = self.changing && self.changing.length;

    if (isChangingLane) {
        const delta = self.changing.pop();

        // this should be worked out using local -> global conversion
        // incremental change in perpendicular direction
        // TODO: change in x and y should relate to speed and triangular distance
        if(Number(self.direction) === 270){ // north
            self.x += delta;
            self.y -= self.speed;
        }
        if(Number(self.direction) === 180){ // west
            self.y -= delta;
            self.x -= self.speed;
        }
        if(Number(self.direction) === 90){  // south
            self.x -= delta;
            self.y += self.speed;
        }
        if(Number(self.direction) === 0){   // east
            self.y += delta;
            self.x += self.speed;
        }

        if (!self.changing.length){
            self.changing = undefined;
        }

        self.life -= 1;
        if(self.alive){
            self.alive = self.life > 0;
        }
        return;
    }

    // if(local.front && local.front.length){
    //     console.log(local.front);
    // }

    const carsInFront =  local.front && local.front.length &&
        local.front.sort((a,b)=>a.v - b.v)[0].v < 30;
    const safeOnRight = local.right.length === 0
        || !local.right.find(r => distance(self, r) < 40);
    const safeOnLeft = local.left.length === 0
        || !local.left.find(l => distance(self, l) < 40);;
    const safeOnSide = safeOnLeft && safeOnRight;

    if(carsInFront && safeOnSide){
        self.changeLane(LANES_COUNT, CAR_WIDTH);
        //TODO: why????
        self.move(LANES_COUNT, CAR_WIDTH);
        return;
    }
    if(carsInFront && !safeOnSide){
        //console.log('cannot pass')
        const frontBlocker = local.front.sort((a,b)=>a.v - b.v)[0];
        // TODO: would be nice to only temporarily change speed
        self.speed = clone(frontBlocker.speed);
        //self.life = clone(frontBlocker.life) + (frontBlocker.v/frontBlocker.speed);
        self.life -= 1;
        if(self.alive){
            self.alive = self.life > 0;
        }
        //
        return;
    }


    // this should be worked out using local -> global conversion
    if(Number(self.direction) === 270){
        self.y -= self.speed;
    }
    if(Number(self.direction) === 180){
        self.x -= self.speed;
    }
    if(Number(self.direction) === 90){
        self.y += self.speed;
    }
    if(Number(self.direction) === 0){
        self.x += self.speed;
    }

    // const newSenseResult = self.sense('proximity').result;
    // if(!newSenseResult.umvelt.chunk){
    //     self.alive = false;
    // };

    self.life -= 1;
    if(self.alive){
        self.alive = self.life > 0;
    }
}

Particle.prototype = {
    init: function (sketch, x, y, lane, radius, sense, direction, life, margin) {
        this.sense = (view) => sense(this, view);
        this.direction = direction || 0;
        this.margin = margin; //DEPRECATE
        this.sketch = sketch;
        this.alive = true;
        this.radius = radius || 10;
        this.wander = 0;
        this.lane = lane;
        this.x = x || 0.0;
        this.y = y || 0.0;
        const speed = random(1, 2);
        this.life = life
            ? life/speed
            : (sketch.height / speed);
        this.speed = speed;
        this.id = hashCode((new Date()).toString());
        this.CLIENT_WIDTH = sketch.CLIENT_WIDTH;
        this.CLIENT_HEIGHT = sketch.CLIENT_HEIGHT;
    },
    changeLane: function (LANES_COUNT, CAR_WIDTH) {
        const transitionLength = Math.floor(10 / this.speed);
        var changeDirection = (Math.random() >= 0.25
            ? -1 // pass left
            : 1  // pass right
        );
        if (this.lane === 1) {
            changeDirection = 1;
        }
        if (this.lane === LANES_COUNT) {
            changeDirection = -1;
        }
        this.lane += changeDirection;
        const change = changeDirection * CAR_WIDTH;
        const postChange = (new Array(1)).fill(0);  // (don't) delay after change
        this.changing = (new Array(transitionLength))
            .fill(change / transitionLength)
            .concat(postChange);
    },
    move: function (LANES_COUNT, CAR_WIDTH) {
        //TODO: this add, do, subtract should go away
        //TODO: also, car should only think in terms of itself - world should handle all else (see above)
        // this.x += this.CLIENT_WIDTH/2;
        // this.y += this.CLIENT_HEIGHT/2;
        const prev = ({x : this.x, y: this.y, type: this.chunk && this.chunk.type });
        move(this, LANES_COUNT, CAR_WIDTH);
        const isCurveOrIntersect = this.chunk && ["intersect", "curved"].includes(this.chunk.type);
        // this.x -= this.CLIENT_WIDTH/2;
        // this.y -= this.CLIENT_HEIGHT/2;
        if(isCurveOrIntersect){
            this.x -= this.CLIENT_WIDTH/2;
            this.y -= this.CLIENT_HEIGHT/2;
        }

        const change = {x : this.x - prev.x, y: this.y - prev.y };
        if((Math.abs(change.x) > 5 || Math.abs(change.y) > 5)) {
            //debugger
        }

        const senseResult = this.sense('proximity').result;
        const { umvelt= {} } = senseResult;
        if(!umvelt.chunk || !umvelt.chunk.type){
            this.alive = false;
        }
        return;
    },
    draw: function(ctx, center){ RenderCar(ctx, center, this); }
};

export default Particle;
