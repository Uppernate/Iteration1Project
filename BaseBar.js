// JavaScript source code
class BaseBar {
    constructor(scene, name, max) {
        this.scene = scene;
        this.name = name;
        this.coordinates = Vector2.zero;
        this.counter = new Counter(0, max, max);
        this.smooth = new Counter(0, max, max);
        this.changeCounter = new Counter(0, 0, max);
        this.changeSmooth = new Counter(0, 0, max);

        this.sprites = {
            bg: this.scene.physics.add.sprite(0, 0, `bars-background`),
            fill: this.scene.physics.add.sprite(0, 0, `bars-${this.name}`),
            change: this.scene.physics.add.sprite(0, 0, `bars-change`),
            marks: [],
        }

        this.alpha = 1;

        this.sprites.bg.depth = DEPTH.BARS_BG;
        this.sprites.fill.depth = DEPTH.BARS_FILL;
        this.sprites.change.depth = DEPTH.BARS_CHANGE;
        this.updateMarks();
    }
    updateMarks() {
        console.log('updating marks...');
        while (this.sprites.marks.length > 0) {
            this.sprites.marks[0].destroy();
            this.sprites.marks.splice(0, 1);
        }

        if (this.counter.max >= 10) {
            for (let i = 5; i < this.counter.max; i += 5) {
                const mark = this.scene.physics.add.sprite(this.coordinates.x, this.coordinates.y, `bars-${this.name}-mark`);
                mark.depth = DEPTH.BARS_MARK;
                mark.barOffset = i;
                mark.originalalpha = mark.alpha;
                this.sprites.marks.push(mark);
            }
        }
        else {
            for (let i = 1; i < this.counter.max; i++) {
                const mark = this.scene.physics.add.sprite(this.coordinates.x, this.coordinates.y, `bars-${this.name}-mark`);
                mark.depth = DEPTH.BARS_MARK;
                mark.barOffset = i;
                mark.alpha = (i % 5) ? 0.5 : 1;
                mark.originalalpha = mark.alpha;
                this.sprites.marks.push(mark);
            }
        }
    }
    update() {
        this.sprites.bg.alpha = this.alpha;
        //this.sprites.bg.x = this.position.x * 16 + 8;
        this.sprites.bg.x = this.coordinates.x;
        //this.sprites.bg.y = this.position.y * 16 + 12;
        this.sprites.bg.y = this.coordinates.y;

        this.smooth.value += Math.max(Math.abs(this.value - this.smooth.value) * 0.2, 0.01) * Math.sign(this.value - this.smooth.value);
        this.changeSmooth.value += Math.max(Math.abs(this.changeCounter.value - this.changeSmooth.value) * 0.2, 0.01) * Math.sign(this.changeCounter.value - this.changeSmooth.value);

        this.sprites.fill.alpha = this.alpha;
        this.sprites.fill.setScale(1, this.smooth.value / this.max);
        this.sprites.fill.x = this.sprites.bg.x;
        this.sprites.fill.y = this.sprites.bg.y + 7 * (1 - this.smooth.value / this.max);

        this.sprites.marks.forEach(function (a) {
            a.y = this.sprites.bg.y + 7 - a.barOffset * (14 / this.max);
            a.x = this.sprites.fill.x;
            a.alpha = a.originalalpha * this.alpha;
            if (a.barOffset >= this.smooth.value)
                a.alpha = 0;
        }, this);

        this.sprites.change.alpha = this.alpha;
        this.sprites.change.setScale(1, this.changeSmooth.value / this.max);
        this.sprites.change.x = this.sprites.fill.x;
        this.sprites.change.y = this.sprites.fill.y - this.sprites.fill.height * (this.smooth.value / this.max / 2) + 7 * (this.changeSmooth.value / this.max);
    }
    destroy() {
        this.sprites.fill.destroy();
        this.sprites.bg.destroy();
        this.sprites.change.destroy();
        this.sprites.marks.forEach(function (a) {
            a.destroy();
        });
    }
    get value() {
        return this.counter.value;
    }
    get min() {
        return this.counter.min;
    }
    get max() {
        return this.counter.max;
    }
    set value(a) {
        this.counter.value = a;
    }
    set max(a) {
        this.counter.max = a;
        this.smooth.max = a;
        this.changeCounter = a;
        this.changeSmooth = a;
        this.updateMarks();
    }
    fill() {
        this.counter.value = this.counter.max;
        return this.counter.value;
    }
    empty() {
        this.counter.value = this.counter.min;
        return this.counter.value;
    }
    get isFull() {
        return this.counter.value == this.counter.max;
    }
    get isEmpty() {
        return this.counter.value == this.counter.min;
    }
}

IMAGE_INSERT('image', 'bars-change');
IMAGE_INSERT('image', 'bars-health');
IMAGE_INSERT('image', 'bars-health-mark');
IMAGE_INSERT('image', 'bars-stamina');
IMAGE_INSERT('image', 'bars-stamina-mark');
IMAGE_INSERT('image', 'bars-background');