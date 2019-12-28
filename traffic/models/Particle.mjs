
function Particle(sketch, x, y, lane, radius, sense, direction, life, margin) {
    this.init(sketch, x, y, lane, radius, sense, direction, life, margin);
}

const clone = o => JSON.parse(JSON.stringify(o));

const distance = (self, target) => {
    const {x, y} = self;
    const {v, h} = target;
    const distance =  Math.hypot(h, v);
    //distance < 30 && console.log(`x diff: ${h}, y diff: ${v}, distance: ${distance}`);
    return distance;
};

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
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
    const sameLane = h => Math.abs(Math.round(h)) === 0;
    mapped.front = translated.filter(t => sameLane(t.h) && t.v > 0 );
    mapped.back = translated.filter(t => sameLane(t.h) && t.v <= 0 );
    mapped.left = translated.filter(t => Math.round(t.h) < 0 );
    mapped.right = translated.filter(t => Math.round(t.h) > 0 );

    return mapped;
};

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
        const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);
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
        const postChange = (new Array(10)).fill(0);  // delay after change
        this.changing = (new Array(transitionLength))
            .fill(change / transitionLength)
            .concat(postChange);
    },
    move: function (LANES_COUNT, CAR_WIDTH) {
        const isChangingLane = this.changing && this.changing.length;
        if (isChangingLane) {
            const delta = this.changing.pop();

            // this should be worked out using local -> global conversion
            // incremental change in perpendicular direction
            if(Number(this.direction) === 270){ // north
                this.x += delta;
            }
            if(Number(this.direction) === 180){ // west
                this.y -= delta;
            }
            if(Number(this.direction) === 90){  // south
                this.x -= delta;
            }
            if(Number(this.direction) === 0){   // east
                this.y += delta;
            }

            if (!this.changing.length){
                this.changing = undefined;
            }
        } else {
            const senseResult = this.sense('proximity').result;
            const { neighbors, umvelt= {} } = senseResult;
            this.chunk = umvelt.chunk;
            const local = worldToLocal(this, neighbors);

            const carsInFront =  local.front && local.front.length &&
                local.front.sort((a,b)=>a.v - b.v)[0].v < 30;
            const safeOnRight = local.right.length === 0
                || !local.right.find(r => distance(this, r) < 40);
            const safeOnLeft = local.left.length === 0
                || !local.left.find(l => distance(this, l) < 40);;
            const safeOnSide = safeOnLeft && safeOnRight;

            if(carsInFront && safeOnSide){
                this.changeLane(LANES_COUNT, CAR_WIDTH);
                return;
            }
            if(carsInFront && !safeOnSide){
                //console.log('cannot pass')
                const frontBlocker = local.front.sort((a,b)=>a.v - b.v)[0];
                // TODO: would be nice to only temporarily change speed
                this.speed = clone(frontBlocker.speed);
                this.life = clone(frontBlocker.life) + (frontBlocker.v/frontBlocker.speed);
            }
        }

        // this should be worked out using local -> global conversion
        if(Number(this.direction) === 270){
            this.y -= this.speed;
        }
        if(Number(this.direction) === 180){
            this.x -= this.speed;
        }
        if(Number(this.direction) === 90){
            this.y += this.speed;
        }
        if(Number(this.direction) === 0){
            this.x += this.speed;
        }

        this.life -= 1;
        this.alive = this.life > 0;
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
