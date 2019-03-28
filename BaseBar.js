// JavaScript source code
class BaseBar {
    constructor(scene, name) {
        this.scene = scene;
        this.name = name;
        this.coordinates = Vector2.zero;
        this.counter = new Counter(0, 1, 1);

        this.sprites = {
            bg: this.scene.physics.add.sprite(0, 0, `bars-background`),
            fill: this.scene.physics.add.sprite(0, 0, `bars-${this.name}`),
            change: this.scene.physics.add.sprite(0, 0, `bars-change`),
            marks: [],
        }

        this.alpha = 1;
        this.changeAlpha = 0;
        this.changeCounter = new Counter(0, 0, 1);

        this.sprites.bg.depth = DEPTH.BARS_BG;
        this.sprites.fill.depth = DEPTH.BARS_FILL;
        this.sprites.change.depth = DEPTH.BARS_CHANGE;
    }
    updateMarks() {
        while (this.sprites.marks.length > 0) {
            this.sprites.marks[0].destroy();
            this.sprites.marks.splice(0, 1);
        }

        if (this.counter.max >= 10) {
            for (let i = 5; i < this.counter.max; i += 5) {
                const mark = this.scene.physics.add.sprite(this.position.x, this.position.y, `bars-${this.name}-mark`);
                mark.depth = DEPTH.BARS_MARK;
                mark.barOffset = i;
                mark.originalalpha = mark.alpha;
                this.sprites.marks.push(mark);
            }
        }
        else {
            for (let i = 1; i < this.counter.max; i++) {
                const mark = this.scene.physics.add.sprite(this.position.x, this.position.y, `bars-${this.name}-mark`);
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
        this.sprites.bg.x = this.position.x * 16 + 8;
        this.sprites.bg.y = this.position.y * 16 + 12;

        this.sprites.fill.alpha = this.alpha;
        this.sprites.fill.setScale(1, this.value / this.max);
        this.sprites.fill.x = this.barSprites.bg.x;
        this.sprites.fill.y = this.barSprites.bg.y - 8 * (1 - this.value / this.max);

        this.sprites.marks.forEach(function (a) {
            a.x = this.sprites.bg.x - 8 + a.barOffset * (16 / this.max);
            a.y = this.sprites.fill.y;
            a.alpha = a.originalalpha * this.alpha;
            if (a.barOffset >= this.value)
                a.alpha = 0;
        }, this);

        this.sprites.change.alpha = this.changeAlpha * this.alpha;
        this.sprites.change.setScale(1, this.chosenAction.cost / this.stamina.max);
        this.sprites.change.x = this.sprites.fill.x;
        this.sprites.change.y = this.sprites.fill.y + this.sprites.fill.width * (this.value / this.max / 2) - 8 * (this.changeCounter.value / this.max);
    }
    destroy() {

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