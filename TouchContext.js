class Touch {
    constructor(pointer) {
        this.identifier = pointer.identifier;
        this.position = new Vector2(pointer.x, pointer.y);
        this.startPosition = this.position.copy();
        this.swipeVector = new Vector2(0, 0);
        this.rawtime = new Date().getTime();
        this.type = 'basic';
    }
    copy(pointer) {
        this.position.set(pointer.x, pointer.y);
        this.swipeVector.set(this.position).sub(this.startPosition);
    }
    get x() {
        return this.position.x;
    }
    get y() {
        return this.position.y;
    }
    get lifetime() {
        return new Date().getTime() - this.rawtime;
    }
}

class ContextNone {
    constructor(parent) {
        this.name = 'None';
        this.parent = parent;
    }
    onPress(touch) {
        console.log('User pressed');
    }
    onHoldEnd(touch) {
        console.log('User held');
    }
    onHolding(touch) {
        console.log('Holding...');
    }
    onSwipeEnd(touch) {
        console.log('User swiped');
    }
    onSwiping(touch) {
        console.log('Swiping...');
        this.parent.parent.camerafocus.sub(touch.swipeVector.div(this.parent.parent.cameras.main.zoom));
        touch.startPosition.set(touch.position);
        touch.swipeVector.set(0, 0);
    }
}

class TouchContext {
    constructor(source) {
        this.parent = source;
        this.touches = [];
        this.state = new ContextNone(this);
        this.parent.input.on('pointerdown', this.handleStart, this);
        this.parent.input.on('pointerup', this.handleEnd, this);
        this.parent.input.on('pointermove', this.handleMove, this);
        this.parent.input.on('pointercancel', this.handleEnd, this);
    }
    // Creating a touch from given pointer
    handleStart(pointer) {
        this.touches.push(new Touch(pointer));
    }
    // Calling ending functions from the Context
    // Removing correct touch from this.touches
    handleEnd(pointer) {
        let touch = this.touches.find(function (a) { return pointer.identifier == a.identifier });
        if (touch.type == 'basic' && touch.lifetime <= 166) {
            this.state.onPress(touch);
        }
        else if (touch.type == 'basic' && touch.swipeVector.magnitude < 4) {
            this.state.onHoldEnd(touch);
        }
        else {
            this.state.onSwipeEnd(touch);
        }
        this.touches.splice(this.touches.findIndex(function (a) { return pointer.identifier == a.identifier }), 1);
    }
    // Updating correct touch with pointer data
    handleMove(pointer) {
        let touch = this.touches.find(function (a) { return pointer.identifier == a.identifier });
        if (touch)
            touch.copy(pointer);
    }
    // Calling continuous functions from Context
    touchUpdate(touch) {
        if (touch.type == 'basic' && touch.lifetime > 100 && touch.swipeVector.magnitude < 4) {
            this.state.onHolding(touch);
        }
        else if (touch.swipeVector.magnitude > 4) {
            this.state.onSwiping(touch);
            touch.type = "swipe";
        }
    }
    // Calling for each on all touches to execute touchUpdate
    update() {
        this.touches.forEach(this.touchUpdate, this);
    }
}