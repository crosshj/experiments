import RenderCar from '../render/car.mjs';
import move from '../modules/move.mjs';
import { hashCode } from '../modules/utilities.mjs';

function Particle(sketch, x, y, lane, radius, sense, direction, life, margin, speed) {
    this.init({
        sketch, x, y, lane, radius, sense, direction, life, speed
    });
}

Particle.prototype = {
    init: function ({ sketch, x, y, lane, radius, sense, direction, life, speed }) {
        this.sense = (view) => sense(this, view);
        this.direction = direction || 0;
        this.sketch = sketch;
        this.alive = true;
        this.radius = radius || 10;
        this.lane = lane;
        this.x = x || 0.0;
        this.y = y || 0.0;
        const _speed = speed || random(1, 2);
        this.life = life
            ? life/_speed
            : (sketch.height / _speed);
        this.speed = _speed;
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
        const prev = ({x : this.x, y: this.y, type: this.chunk && this.chunk.type });
        move(this, LANES_COUNT, CAR_WIDTH);
        const change = {x : this.x - prev.x, y: this.y - prev.y };

        if((Math.abs(change.x) > 5 || Math.abs(change.y) > 5)) {
            //debugger
        }

        return;
    },
    draw: function(ctx){ RenderCar(ctx, this); }
};

export default Particle;
