
function Particle(sketch, x, y, lane, radius, sense, direction, life, margin) {
    this.init(sketch, x, y, lane, radius, sense, direction, life, margin);
}

Particle.prototype = {
    init: function (sketch, x, y, lane, radius, sense, direction, life, margin) {
        this.sense = (view) => sense(this, view);
        this.direction = direction || 0;
        this.margin = margin;
        //console.log(`vehicle spawn at lane: ${lane}`)
        this.sketch = sketch;
        this.alive = true;
        this.radius = radius || 10;
        this.wander = 0;
        //this.theta = random(TWO_PI);
        //this.drag = 0.92;
        //this.color = '#fff';
        this.lane = lane;
        this.x = x || 0.0;
        this.y = y || 0.0;
        //this.vx = 0.0;
        //this.vy = 0.0;
        const speed = random(1, 2);
        this.life = life
            ? life/speed
            : (sketch.height / speed);
        this.speed = speed;
    },
    changeLane: function (LANES_COUNT, CAR_WIDTH) {
        // if(this.direction !== 270){
        //     //TODO: have not worked out lane change for other directions
        //     return;
        // }

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

            // last step (NOT NEEDED?)
            /*
            if (!this.changing.length) {
                //console.log(this.lane)
                //TODO: need to work out margin, does not work well!!!

                // north bound
                if(Number(this.direction) === 270){
                    this.x =
                    (this.margin || this.sketch.margin) +
                    ((this.lane - 1) * CAR_WIDTH) + (CAR_WIDTH / 2)
                }
                // west bound
                if(Number(this.direction) === 180){
                    this.y =
                        (this.margin || this.sketch.margin) +
                        ((this.lane - 1) * CAR_WIDTH) + (CAR_WIDTH / 2)
                }
                // south bound
                if(Number(this.direction) === 90){
                    this.x =
                        (this.margin || this.sketch.margin) +
                        ((this.lane - 1) * CAR_WIDTH) + (CAR_WIDTH / 2)
                }
                // east bound
                if(Number(this.direction) === 0){
                    this.y =
                        (this.margin || this.sketch.margin) +
                        ((this.lane - 1) * CAR_WIDTH) + (CAR_WIDTH / 2)
                }
            }
            */
        } else {
            const frontCar = this.sense('front');


            if(Number(this.direction) === 270){ // north
                if (frontCar && this.y - frontCar.y <= (10 * this.speed)) {
                    this.changeLane(LANES_COUNT, CAR_WIDTH);
                    //console.log(`car in front at ${this.y - frontCar.y}`);
                }
            }
            if(Number(this.direction) === 180){ // west
                if (frontCar && this.x - frontCar.x  <= (10 * this.speed)) {
                    this.changeLane(LANES_COUNT, CAR_WIDTH);
                    //console.log(`car in front at ${this.y - frontCar.y}`);
                }
            }
            if(Number(this.direction) === 90){  // south
                if (frontCar && frontCar.y - this.y <= (10 * this.speed)) {
                    this.changeLane(LANES_COUNT, CAR_WIDTH);
                    //console.log(`car in front at ${this.y - frontCar.y}`);
                }
            }
            if(Number(this.direction) === 0){   // east
                if (frontCar && frontCar.x - this.x  <= (10 * this.speed)) {
                    this.changeLane(LANES_COUNT, CAR_WIDTH);
                    //console.log(`car in front at ${this.y - frontCar.y}`);
                }
            }
        }

        //this.x += this.vx;
        // this.y -= this.changing && this.changing.length
        // 	? 1.5 * this.speed
        // 	: this.speed;

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

        //this.vx *= this.drag;
        //this.vy *= this.drag;
        //this.theta += random(-0.5, 0.5) * this.wander;
        //this.radius *= 0.99;
        this.life -= 1;
        this.alive = this.life > 0;
    },
    draw: function (ctx, center = {}) {
        ctx.beginPath();
        ctx.arc(this.x + (center.x || 0), this.y + (center.y || 0), this.radius, 0, TWO_PI);
        ctx.fillStyle = this.changing && this.changing.length
            ? 'red'
            : this.color;
        ctx.fill();
    }
};

export default Particle;
