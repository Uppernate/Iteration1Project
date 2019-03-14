// JavaScript source code
class Action {
    constructor(unit, config) {
        this.icon = 'no-icon';
        this.phase = 'move';
        this.unit = unit;
        this.scale = new Vector2(0, 0);
        this.targetScale = new Vector2(0, 0);
        this.offset = new Vector2(0, 0);
        this.targetOffset = new Vector2(0, 0);
        this.selectableCount = 0;

        /// Import configs into this class

        const entries = Object.entries(config || {});
        entries.forEach(function (entry) {
            this[entry[0]] = entry[1];
        }, this);

        this.circle = this.unit.scene.physics.add.sprite(this.unit.position.x, this.unit.position.y, `action`);
        this.circleicon = this.unit.scene.physics.add.sprite(this.unit.position.x, this.unit.position.y, `action-${this.icon}`);

        this.selectionSprites = [];
        for (let i = 0; i < this.selectableCount; i++) {
            this.selectionSprites.push(this.unit.scene.physics.add.sprite(this.unit.position.x, this.unit.position.y, `select-${this.icon}`));
            this.selectionSprites[i].alpha = 0;
            this.selectionSprites[i].depth = depthLookup.tileOverlays;
        }

        this.circleicon.x = this.circle.x = this.unit.position.x * 16 + 8;
        this.circleicon.y = this.circle.y = this.unit.position.y * 16 + 8;
        this.circle.setScale(this.scale.x, this.scale.y);
        this.circleicon.setScale(this.scale.x, this.scale.y);
        this.circleicon.depth = this.circle.depth = depthLookup.actions;
    }
    displayUpdate() {
        this.scale.lerp(this.targetScale, 0.2);
        this.offset.lerp(this.targetOffset, 0.2);
        this.circleicon.x = this.circle.x = this.unit.position.x * 16 + 8 + this.offset.x;
        this.circleicon.y = this.circle.y = this.unit.position.y * 16 + 8 + this.offset.y;
        this.circle.setScale(this.scale.x, this.scale.y);
        if (this.unit.chosenAction === this) {
            this.circleicon.setScale(1, 1);
        }
        else {
            this.circleicon.setScale(this.scale.x, this.scale.y);
        }
    }
    onPress() {
        console.log('no icon action initialised');
        this.unit.hideActions();
        this.unit.position.refresh();
        this.unit.cancelAction();
        this.unit.scene.touchContext.storage.obj = undefined;
        this.unit.chosenAction = this;
    }
    getNearbyTiles(autotile, manager, g) {
        const closest = [];
        for (let y = autotile.y - 1; y <= autotile.y + 1; y++) {
            for (let x = autotile.x - 1; x <= autotile.x + 1; x++) {
                const tile = manager.getAutoTile(x, y);
                if (tile) {
                    let distance = new Vector2(tile).sub(autotile);
                    if (distance.magnitude > 1) {
                        const horizontal = manager.getAutoTile(autotile.x, y);
                        const vertical = manager.getAutoTile(x, autotile.y);
                        if (!horizontal.info.wallType || !vertical.info.wallType) {
                            closest.push({ tile: tile, g: g + distance.magnitude });
                        }
                    }
                    else
                        closest.push({ tile:tile, g: g + distance.magnitude });
                }
            }
        }
        return closest;
    }
    forEachNearbyTile(t) {
        if (t.tile.unit) return false;
        if (t.tile.movetarget) return false;
        if (t.tile.info.wallType) return false;
        const insideClosed = this.closed.find(function (a) { return a.tile === t.tile });
        const insideOpen = this.open.find(function (a) { return a.tile === t.tile });
        if (insideClosed) return false;
        if (insideOpen) return false;
        this.open.push(t);
    }
    getTilesInRange(range) {
        this.closed = [];
        this.open = [];
        const closed = this.closed;
        const open = this.open;
        const confirmed = [];

        const thisTile = this.unit.position;
        const tileManager = this.unit.scene.tileManager;

        this.getNearbyTiles(thisTile, tileManager, 0).forEach(this.forEachNearbyTile, this);
        open.sort(function (a, b) { return a.g - b.g });

        while (open.length > 0) {
            const current = open[0];
            if (current.g <= range) {
                confirmed.push(current);
                closed.push(current);
                open.splice(0, 1);
                this.getNearbyTiles(current.tile, tileManager, current.g).forEach(this.forEachNearbyTile, this);
            }
            else {
                closed.push(current);
                open.splice(0, 1);
            }
            open.sort(function (a, b) { return a.g - b.g });
        }
        return confirmed;
    }
    cancel() {
        this.unit.chosenAction = undefined;
        this.tile = undefined;
    }
}

class ActionMove extends Action {
    constructor(unit, config) {
        config = config || {};
        config.icon = config.icon || 'move';
        config.phase = config.phase || 'move';
        config.range = config.range || 4;
        config.selectableCount = config.selectableCount || 1;
        super(unit, config);
    }
    displayUpdate() {
        super.displayUpdate();
        if (this.unit.chosenAction === this) {
            this.selectionSprites[0].alpha = 1;
            this.selectionSprites[0].x = this.tile.x * 16 + 8;
            this.selectionSprites[0].y = this.tile.y * 16 + 8;
        }
        else {
            this.selectionSprites[0].alpha = 0;
        }
    }
    onPress() {
        this.unit.cancelAction();
        this.unit.scene.touchContext.storage.selectableTiles = this.getTilesInRange(this.range);
        this.unit.scene.touchContext.storage.currentAction = this;
    }
    onTileSelected(tile) {
        this.tile = tile.tile;
        this.tile.movetarget = this;
        this.unit.chosenAction = this;
    }
    cancel() {
        if (this.tile) {
            this.tile.movetarget = undefined;
        }
        super.cancel();
    }
}

class ActionDash extends ActionMove {
    constructor(unit, config) {
        config = config || {};
        config.icon = config.icon || 'dash';
        config.phase = config.phase || 'dash';
        config.range = config.range || 1.8;
        super(unit, config);
    }
}

class ActionArrowShoot extends ActionMove {
    constructor(unit, config) {
        config = config || {};
        config.icon = config.icon || 'arrowshoot';
        config.phase = config.phase || 'arrowshoot';
        config.range = config.range || 6.3;
        super(unit, config);
    }
    raycastTileCheck(manager, start, end, distance) {
        let result = true;
        if (Math.abs(distance.x) > Math.abs(distance.y)) {
            let step = Math.abs(distance.y / distance.x);
            for (let i = 1; i <= Math.abs(distance.x) ; i++) {
                const tile = manager.getAutoTile(start.x + i * Math.sign(distance.x), Math.round(start.y + i * Math.sign(distance.y) * step));
                if (tile && tile.info.wallType) {
                    result = false;
                    break;
                }
            }
        }
        else {
            let step = Math.abs(distance.x / distance.y);
            for (let i = 1; i < Math.abs(distance.y) ; i++) {
                const tile = manager.getAutoTile(Math.round(start.x + i * Math.sign(distance.x) * step), start.y + i * Math.sign(distance.y));
                if (tile && tile.info.wallType) {
                    result = false;
                    break;
                }
            }
        }
        return result;
    }
    getTilesInRange(range) {
        const confirmed = [];

        const thisTile = this.unit.position;
        const tileManager = this.unit.scene.tileManager;

        tileManager.everyAutoTile(function (autotile) {
            if (autotile.info.wallType) return false;
            if (autotile === thisTile) return false;
            const distance = new Vector2(autotile).sub(thisTile);
            if (distance.magnitude <= range) {
                if (this.raycastTileCheck(tileManager, thisTile, autotile, distance)) 
                    confirmed.push({ tile: autotile });
            }
        }, this);
        return confirmed;
    }
}