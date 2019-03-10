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
    constructor(maincontext) {
        this.name = 'None';
        this.parent = maincontext;
    }
    onPress(touch) {
        // Clear previous selection
        if (exists(this.parent.storage.previousTile)) {
            this.parent.storage.previousTile.refresh();
            if (this.parent.storage.previousTile.unit) {
                this.parent.storage.previousTile.unit.hideActions();
            }
        }
        // Transform touch position into tile coordinates
        const tilepos = new Vector2(touch.x, touch.y);
        tilepos.div(this.parent.parent.cameras.main.zoom);
        tilepos.sub(this.parent.parent.windowsize.copy().div(2));
        tilepos.add(this.parent.parent.camerafocus);
        tilepos.div(16);
        // Fetch Auto Tile
        const tile = this.parent.parent.tileManager.getAutoTile(Math.floor(tilepos.x), Math.floor(tilepos.y));
        // Only do something when tile is a floor tile
        if (tile && !tile.info.wallType) {
            this.parent.storage.previousTile = tile; // Save for refresh
            tile.addSprite('select', 1); // Display selection sprite
            if (tile.tileDeco) {
                tile.tileDeco.alpha = 0.5; // Make decoration over this tile transparent
            }
            if (tile.unit) { // There's a unit on this tile
                tile.unit.revealActions();
                this.parent.storage.previousUnit = tile.unit;
                this.parent.switchState('unit');
            }
        }
    }
    onHoldEnd(touch) {
        this.onPress(touch);
    }
    onHolding(touch) {
    }
    onSwipeEnd(touch) {
    }
    onSwiping(touch) {
        this.parent.parent.camerafocus.sub(touch.swipeVector.div(this.parent.parent.cameras.main.zoom));
        touch.startPosition.set(touch.position);
        touch.swipeVector.set(0, 0);
    }
}

class ContextOnUnit extends ContextNone {
    constructor(maincontext) {
        super(maincontext);
        this.name = 'OnUnit';
        const unit = this.parent.storage.previousUnit;
        unit.actions.forEach(function (action) {
            action.circle.setInteractive();
            action.circle.on('pointerdown', function (pointer, x, y, event) {
                this.parent.storage.obj = action;
            }, this);
        }, this);
    }
    onPress(touch) {
        if (exists(this.parent.storage.obj)) {
            this.parent.storage.obj = undefined;
        }
        else {
            this.parent.storage.previousTile.refresh();
            this.parent.storage.previousUnit.hideActions();
            this.parent.switchState('none');
        }
    }
}

class TouchContext {
    constructor(source) {
        this.parent = source;
        this.touches = [];
        this.storage = {};
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
    switchState(name) {
        switch (name) {
            case 'none':
                this.state = new ContextNone(this);
                break;
            case 'unit':
                this.state = new ContextOnUnit(this);
                break;
        }
    }
}