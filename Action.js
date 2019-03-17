// JavaScript source code
class Action {
    constructor(unit, config) {
        this.icon = 'no-icon';
        this.phase = 'move';
        this.cost = 1;
        this.costPerDistance = 0;
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
        this.unit.barsAutoHide.fill();
    }
    getNearbyTiles(autotile, manager, g) {
        const closest = [];
        // Loop a 3x3 area around the auto tile
        for (let y = autotile.y - 1; y <= autotile.y + 1; y++) {
            for (let x = autotile.x - 1; x <= autotile.x + 1; x++) {
                // Get the tile in this position
                const tile = manager.getAutoTile(x, y);
                // Always check if the result is a valid tile!
                if (tile) {
                    // Skip if this iteration's tile is the original
                    if (tile === autotile) continue;
                    // Calculate distance from the original to this tile
                    let distance = new Vector2(tile).sub(autotile);
                    // This tile is a diagonal, check if at least one horizontal or vertical tile is empty (so unit can pass)
                    // A fix for code thinking units have no width and can magically pass through diagonally between two walls
                    if (distance.magnitude > 1) {
                        const horizontal = manager.getAutoTile(autotile.x, y); // Horizontal tile
                        const vertical = manager.getAutoTile(x, autotile.y); // Vertical tile
                        if (!horizontal.info.wallType || !vertical.info.wallType) { // No wall in either passes
                            closest.push({ tile: tile, g: g + distance.magnitude });
                        }
                    }
                        // Don't need a check for non-diagonal tiles
                    else
                        closest.push({ tile:tile, g: g + distance.magnitude });
                }
            }
        }
        return closest;
    }
    forEachNearbyTile(t) {
        // If a tile has a unit, is a target by a move action or has a wall, end the function
        if (t.tile.unit) return false;
        if (t.tile.movetarget) return false;
        if (t.tile.info.wallType) return false;
        // Find this tile within closed/open lists, if it is found, end the function
        const insideClosed = this.closed.find(function (a) { return a.tile === t.tile });
        const insideOpen = this.open.find(function (a) { return a.tile === t.tile });
        if (insideClosed) return false;
        if (insideOpen) return false;
        // Passing all of this allows it to be pushed into the open list
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

        // Get all nearby tiles, run them through the filter if to add them. Sort the results.
        this.getNearbyTiles(thisTile, tileManager, 0).forEach(this.forEachNearbyTile, this);
        open.sort(function (a, b) { return a.g - b.g });

        while (open.length > 0) {
            const current = open[0]; // First tile selected
            if (current.g <= range) { // Tile is in range
                confirmed.push(current); // This tile is now confirmed, it can go into the confirmed list/array and into the closed list
                closed.push(current); 
                open.splice(0, 1);
                // Since it is confirmed, this tile can now expand the open list
                this.getNearbyTiles(current.tile, tileManager, current.g).forEach(this.forEachNearbyTile, this);
            }
            else {
                // Tile is not in reach, get rid of it and put it into the closed list
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
        config.range = config.range || 5;
        config.selectableCount = config.selectableCount || 1;
        config.cost = config.cost || 0.5;
        config.costPerDistance = config.costPerDistance || 0.5;
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
        this.unit.scene.touchContext.storage.selectableTiles = this.getTilesInRange(Math.min(this.range, this.unit.stamina.value));
        this.unit.scene.touchContext.storage.currentAction = this;
        this.unit.barsAutoHide.fill();
    }
    onTileSelected(tile) {
        this.tile = tile.tile;
        this.cost = this.costPerDistance * tile.g;
        this.tile.movetarget = this;
        this.unit.chosenAction = this;
        this.unit.barsAutoHide.fill();
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
        config.cost = config.cost || 2.2;
        config.costPerDistance = config.costPerDistance || 2;
        super(unit, config);
    }
}

class ActionSwingSword extends ActionMove {
    constructor(unit, config) {
        config = config || {};
        config.icon = config.icon || 'swing-sword';
        config.phase = config.phase || 'swing-sword';
        config.range = config.range || 1;
        config.cost = config.cost || 1.5;
        config.selectableCount = config.selectableCount || 2;
        super(unit, config);
    }
    displayUpdate() {
        super.displayUpdate();
        if (this.unit.chosenAction === this) {
            this.selectionSprites[0].alpha = 1;
            this.selectionSprites[0].x = this.tile.x * 16 + 8;
            this.selectionSprites[0].y = this.tile.y * 16 + 8;
            this.selectionSprites[1].alpha = 1;
            this.selectionSprites[1].x = this.tile2.x * 16 + 8;
            this.selectionSprites[1].y = this.tile2.y * 16 + 8;
        }
        else {
            this.selectionSprites[0].alpha = 0;
            this.selectionSprites[1].alpha = 0;
        }
    }
    confirmTile(thisTile, x, y, confirmed) {
        const autotile = this.unit.scene.tileManager.getAutoTile(thisTile.x + x, thisTile.y + y);
        if (!autotile) return false;
        if (autotile.info.wallType) return false;
        if (autotile === thisTile) return false;
        confirmed.push({ tile: autotile, x: x, y: y });
    }
    getTilesInRange(range) {

        // Similar beginnings to the normal get Tiles in Range
        const confirmed = [];

        const thisTile = this.unit.position;
        const tileManager = this.unit.scene.tileManager;

        // Loop through the 4 corner neighbours
        this.confirmTile(thisTile, 1, 0, confirmed);
        this.confirmTile(thisTile, -1, 0, confirmed);
        this.confirmTile(thisTile, 0, -1, confirmed);
        this.confirmTile(thisTile, 0, 1, confirmed);
        return confirmed;
    }
    getTilesInRange2(range) {
        const confirmed = [];

        const thisTile = this.unit.position;
        const chosenTile = this.tile;
        const tileManager = this.unit.scene.tileManager;

        if (thisTile.x !== chosenTile.x) {
            this.confirmTile(chosenTile, 0, 1, confirmed);
            this.confirmTile(chosenTile, 0, -1, confirmed);
        }
        else if (thisTile.y !== chosenTile.y) {
            this.confirmTile(chosenTile, 1, 0, confirmed);
            this.confirmTile(chosenTile, -1, 0, confirmed);
        }
        return confirmed;
    }
    onPress() {
        this.unit.cancelAction();
        this.unit.scene.touchContext.storage.selectableTiles = this.getTilesInRange(this.range);
        this.unit.scene.touchContext.storage.currentAction = this;
        this.unit.scene.touchContext.storage.stage = 0;
        this.unit.barsAutoHide.fill();
    }
    onTileSelected(tile, event) {
        switch (this.unit.scene.touchContext.storage.stage) {
            case 0:
                this.tile = tile.tile;
                this.unit.scene.touchContext.storage.selectableTiles = this.getTilesInRange2(this.range);
                this.unit.scene.touchContext.storage.stage = 1;
                event.switchTo = 'select_tiles';
                this.unit.barsAutoHide.fill();
                break;
            case 1:
                this.tile2 = tile.tile;
                this.unit.chosenAction = this;
                this.barsGlobalAlpha = 0;
                this.unit.barsAutoHide.fill();
                break;
        }
    }
}

class ActionArrowShoot extends ActionMove {
    constructor(unit, config) {
        config = config || {};
        config.icon = config.icon || 'arrowshoot';
        config.phase = config.phase || 'arrowshoot';
        config.range = config.range || 6.3;
        config.cost = config.cost || 1;
        super(unit, config);
    }
    raycastTileCheck(manager, start, end, distance) {
        let result = true;
        // Need to check if x or y is greater, as the greatest will be used for step count
        if (Math.abs(distance.x) > Math.abs(distance.y)) {
            // Calculate how much Y has to move for every 1 X move
            let step = Math.abs(distance.y / distance.x);
            for (let i = 1; i <= Math.abs(distance.x) ; i++) {
                // Get autotile from:
                // X: Start position + iteration * (negate if x was negative)
                // Y: (Rounded because step is a float) Start position + iteration * (negate if y was negative) * step
                const tile = manager.getAutoTile(start.x + i * Math.sign(distance.x), Math.round(start.y + i * Math.sign(distance.y) * step));
                if (tile && tile.info.wallType) {
                    result = false;
                    break;
                }
            }
        }
        else {
            // The same as above but X and Y reversed
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

        // Similar beginnings to the normal get Tiles in Range
        const confirmed = [];

        const thisTile = this.unit.position;
        const tileManager = this.unit.scene.tileManager;

        // Loop through every auto tile
        tileManager.everyAutoTile(function (autotile) {
            // Skip if the tile has a wall or its the same tile the unit is standing on
            if (autotile.info.wallType) return false;
            if (autotile === thisTile) return false;
            // Calculate distance
            const distance = new Vector2(autotile).sub(thisTile);
            if (distance.magnitude <= range) { // Tile within range
                // Raycast through tiles from start to destination, if no obstacles in the way, returns true
                if (this.raycastTileCheck(tileManager, thisTile, autotile, distance)) 
                    confirmed.push({ tile: autotile });
            }
        }, this);
        return confirmed;
    }
    onTileSelected(tile) {
        this.tile = tile.tile;
        this.unit.chosenAction = this;
        this.unit.barsAutoHide.fill();
    }
}