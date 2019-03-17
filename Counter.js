// Counter class
class Counter {
    constructor(min, current, max) {
        this.min = min;
        this.rawvalue = current;
        this.max = max;
    }
    get value() {
        return this.rawvalue > this.max ? this.max : this.rawvalue < this.min ? this.min : this.rawvalue;
    }
    set value(val) {
        this.rawvalue = val > this.max ? this.max : val < this.min ? this.min : val;
        return this.rawvalue;
    }
    fill() {
        this.rawvalue = this.max;
        return this.rawvalue;
    }
    empty() {
        this.rawvalue = this.min;
        return this.rawvalue;
    }
    get isFull() {
        return this.value == this.max;
    }
    get isEmpty() {
        return this.value == this.min;
    }
}
