
function Particle(sketch, x, y, lane, radius, sense) {
    this.init(sketch, x, y, lane, radius, sense);
}

Particle.prototype = {
    init: function (sketch, x, y, lane, radius, sense) {
        this.sense = (view) => sense(this, view);
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
        this.life = sketch.height / speed;
        this.speed = speed;
    },
    changeLane: function (LANES_COUNT, CAR_WIDTH) {
        // if(Math.random() > 0.005){
        // 	return;
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
        const postChange = (new Array(10)).fill(0)
        this.changing = (new Array(transitionLength))
            .fill(change / transitionLength)
            .concat(postChange);
    },
    move: function (LANES_COUNT, CAR_WIDTH) {
        const isChangingLane = this.changing && this.changing.length;
        if (isChangingLane) {
            const delta = this.changing.pop();
            this.x += delta;
            if (!this.changing.length) {
                //console.log(this.lane)
                this.x = this.sketch.margin + ((this.lane - 1) * CAR_WIDTH) + (CAR_WIDTH / 2)
            }
        } else {
            const frontCar = this.sense('front');
            if (frontCar && this.y - frontCar.y <= (20 * this.speed)) {
                this.changeLane(LANES_COUNT, CAR_WIDTH);
                //console.log(`car in front at ${this.y - frontCar.y}`);
            }
        }

        //this.x += this.vx;
        // this.y -= this.changing && this.changing.length
        // 	? 1.5 * this.speed
        // 	: this.speed;
        this.y -= this.speed;
        //this.vx *= this.drag;
        //this.vy *= this.drag;
        //this.theta += random(-0.5, 0.5) * this.wander;
        //this.radius *= 0.99;
        this.life -= 1;
        this.alive = this.life > 0;
    },
    draw: function (ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
        ctx.fillStyle = this.changing && this.changing.length
            ? 'red'
            : this.color;
        ctx.fill();
    }
};

export default Particle;
