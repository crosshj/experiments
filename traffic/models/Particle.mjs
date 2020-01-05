
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

function chunkRotCenter(chunk){
    //TODO: change based on chunk attributes
    return {
        x: chunk.min.x,
        y: chunk.max.y
    }
};

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
    self.chunk = umvelt.chunk;
    const local = worldToLocal(self, neighbors);
    if(self.chunk && self.chunk.type === "curved"){
        const rotCenter = chunkRotCenter(self.chunk);
        //console.log(rotCenter)

        // TODO: not correct
        // need this to rotate car as it turns
        // const currentRotation = Math.atan(
        //     (self.y-rotCenter.y-umvelt.center.y)/(rotCenter.x-umvelt.center.x)
        // )* (180 / Math.PI);
        // console.log(currentRotation);

        const angle = 3.75 * (self.speed / 2);
        //console.log(angle);
        const newCoords = rotate(rotCenter.x-umvelt.center.x, rotCenter.y-umvelt.center.y, self.x, self.y, angle);
        // find center of rotation based on chunk
        // determine change in x, y, direction, and rotation based on speed and chunk rotation center
        self.x = newCoords[0];
        self.y = newCoords[1];
        self.life -= 1;
        self.alive = self.life > 0;
        self.turning = true;
        return;
    }

    if(self.turning){
        self.turning = false;
        self.direction = 180;
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
        self.alive = self.life > 0;
        return;
    }

    const carsInFront =  local.front && local.front.length &&
        local.front.sort((a,b)=>a.v - b.v)[0].v < 30;
    const safeOnRight = local.right.length === 0
        || !local.right.find(r => distance(self, r) < 40);
    const safeOnLeft = local.left.length === 0
        || !local.left.find(l => distance(self, l) < 40);;
    const safeOnSide = safeOnLeft && safeOnRight;

    if(carsInFront && safeOnSide){
        self.changeLane(LANES_COUNT, CAR_WIDTH);
        self.move(LANES_COUNT, CAR_WIDTH);
        return;
    }
    if(carsInFront && !safeOnSide){
        //console.log('cannot pass')
        const frontBlocker = local.front.sort((a,b)=>a.v - b.v)[0];
        // TODO: would be nice to only temporarily change speed
        self.speed = clone(frontBlocker.speed);
        self.life = clone(frontBlocker.life) + (frontBlocker.v/frontBlocker.speed);
        self.life -= 1;
        self.alive = self.life > 0;
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

    self.life -= 1;
    self.alive = self.life > 0;
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
        return move(this, LANES_COUNT, CAR_WIDTH);
    },
    draw: function (ctx, center = {}) {
        ctx.beginPath();
        if([0, 180].includes(this.direction)){
            //ctx.arc(this.x + (center.x || 0), this.y + (center.y || 0), this.radius, 0, TWO_PI);
            ctx.rect(
                this.x-this.radius*1.5 + (center.x || 0),
                this.y-this.radius*0.9 + (center.y || 0),
                this.radius*3, this.radius*1.8
            );
        } else {
            ctx.rect(
                this.x-this.radius*.9 + (center.x || 0),
                this.y-this.radius*1.5 + (center.y || 0),
                this.radius*1.8, this.radius*3
            );
        }
        ctx.fillStyle = this.changing && this.changing.length
            ? 'red'
            : this.color;
        ctx.strokeStyle = "#888";
        ctx.fill();
        ctx.stroke();
    }
};

export default Particle;
