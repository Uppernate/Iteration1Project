function ConstructMatrix(recipe, definitions) {
    this.matrix = [];
    recipe.forEach(function (spot) {
        this.matrix.push(definitions[spot]);
    });
    return matrix;
}

const depthLookup = {
    floor: 0,
    npc: 1,
    ceiling: 10000
};

class AutoTileData {
    constructor(tile, tileWall, tileDeco, x, y, parent) {
        this.tileFloor = tile;
        this.tileWall = tileWall;
        this.tileDeco = tileDeco;
        this.x = x;
        this.y = y;
        this.sprites = [];
        this.parent = parent;
        this.neighbours = [];
        this.refreshData();
    }
    change(state) {
        // Make changes here
        this.queueNeighbours();
    }
    queueNeighbours() {
        this.parent.queueAutoTiles(this.neighbours);
    }
    queue() {
        let queued = this.parent.autoTileQueue.find(function (a) { return a === this; }, this);
        if (!queued) {
            this.parent.autoTileQueue.push(this);
        }
    }
    refreshData() {
        this.info = {};
        if (this.tileFloor)
            this.info.floorType = this.tileFloor.propdata.type;
        if (this.tileWall)
            this.info.wallType = this.tileWall.propdata.type;
        if (this.tileDeco)
            this.info.decoType = this.tileDeco.propdata.type;
    }
    refresh() {
        this.refreshData();
        // Clear previous sprites

        while (this.sprites.length > 0) {
            this.sprites[0].destroy();
            this.sprites.splice(0, 1);
        }

        // Checking if the main tile is a wall
        let isAWall = false;
        if (this.info.wallType) {
            const belowTile = this.parent.getAutoTile(this.x, this.y + 1);
            isAWall = belowTile && typeof belowTile.info.wallType !== 'undefined';
            if (isAWall) {
                this.changeLook('wall', Math.floor(9 + Math.random() * 4));
                this.changeLook('deco', Math.floor(9 + Math.random() * 4));
            }
            else {
                this.changeLook('wall', Math.floor(5 + Math.random() * 4));
                this.addSprite('brick-main', this.y * 16 + 16);
            }
        }
        // Ceiling placement
        const belowTile = this.parent.getAutoTile(this.x, this.y + 1);
        const wallResult = belowTile && typeof belowTile.info.wallType !== 'undefined';
        if (wallResult)
            this.changeLook('deco', Math.floor(9 + Math.random() * 4));
        else
            this.removeLook('deco');
        // Deco calculation
        if (!wallResult) {
            const decoMatrix = ConstructMatrix([
                "a", "a", "a",
                "a", "a", "a",
                "a", "a", "a",
                "a", "a", "a",
                "a", "a", "a"
            ], {
                a: { wallType: "wall" }
            });
            const decoResolved = this.compare(decoMatrix);
            let nValue = 0; // Neighbour Value
            nValue += decoResolved[11] ? 1 : 0;
            nValue += decoResolved[7] ? 2 : 0;
            nValue += decoResolved[9] ? 4 : 0;
            nValue += decoResolved[13] ? 8 : 0;
            if (nValue == 0)
                this.removeLook('deco');
            else
                this.changeLook('deco', 13 + nValue);
            // Side sprites
            if (!decoResolved[7] && decoResolved[8] && !decoResolved[11])
                this.addSprite('brick-right', this.y * 16 + 16);
            if (!decoResolved[7] && decoResolved[6] && !decoResolved[9])
                this.addSprite('brick-left', this.y * 16 + 16);
        }
            
    }
    addSprite(name, depth) {
        this.parent.spawnSpriteTile(this.x, this.y, name, depth, this);
    }
    changeLook(layername, index) {
        this.parent.spawnTile(this.x, this.y, this.parent.parent.level.layer(layername).obj, index);
    }
    removeLook(layername) {
        this.parent.parent.level.layer(layername).obj.removeTileAt(this.x, this.y);
    }
    exactCompare(matrix) {
        let result = true;
        let current = 0;
        for (let y = this.y - 2; y <= this.y + 2; y++) {
            for (let x = this.x - 1; x <= this.x + 1; x++) {
                let autotile = this.parent.getAutoTile(x, y);
                if (autotile && matrix[current] && Object.entries(matrix[current]).length > 0) {
                    result = result && this.evaluateConditions(autotile, matrix[current]);
                    if (!result) return result;
                }
                else if (matrix[current] && Object.entries(matrix[current]).length > 0) {
                    return false;
                }
                current += 1;
            }
        }
        return result;
    }
    compare(matrix) {
        const newmatrix = [];
        let current = 0;
        for (let y = this.y - 2; y <= this.y + 2; y++) {
            for (let x = this.x - 1; x <= this.x + 1; x++) {
                let autotile = this.parent.getAutoTile(x, y);
                let matrixEntry = false;
                if (autotile && matrix[current] && Object.entries(matrix[current]).length > 0) {
                    matrixEntry = this.evaluateConditions(autotile, matrix[current]);
                }
                else if (matrix[current] && Object.entries(matrix[current]).length > 0) {
                    matrixEntry = false;
                }
                newmatrix.push(matrixEntry);
                current += 1;
            }
        }
        return newmatrix;
    }
    evaluateConditions(subject, conditions) {
        const info = subject.info;
        const entries = Object.entries(conditions);
        if (entries.length == 0) return true;
        return entries.every(function (entry) {
            //console.log(info[entry[0]], entry[1]);
            return info[entry[0]] == entry[1];
        });
    }
}

class TileManager {
    constructor(source) {
        this.parent = source;
        this.autoTileQueue = [];
        this.autoTileData = [];
    }
    // Loop through every tile in a layer
    // Additionally, gives the properties of the tile into propdata
    everyTile(layer, f, scope) {
        for (let x = 0; x < this.parent.map.width; x++) {
            for (let y = 0; y < this.parent.map.width; y++) {
                let tile = layer.obj.getTileAt(x, y); // Get tile data
                if (tile) {
                    tile.propdata = {}; // Make space for properties
                    let properties = tile.tileset.tileData[tile.index].properties; // Get properties of correct index
                    properties.forEach(function (p) { tile.propdata[p.name] = p.value; }); // Insert properties into tile

                    f.call(scope, tile, x, y); // Call user's callback function
                }
            }
        }
    }
    // Loop through every autotile
    everyAutoTile(f, scope) {
        this.autoTileData.forEach(f, scope);
    }
    // Get an auto tile residing in the x and y coordinate
    getAutoTile(x, y) {
        return this.autoTileData.find(function (autotile) { return autotile.x == x && autotile.y == y; });
    }
    // Create all autotiles for this level
    // Automatically sets up neighbours
    registerAll() {
        let layerFloor = this.parent.level.layer('main');
        let layerWall = this.parent.level.layer('wall');
        let layerDeco = this.parent.level.layer('deco');
        this.everyTile(layerFloor, function (tile, x, y) {
            let wallTile = layerWall.obj.getTileAt(x, y);
            let decoTile = layerDeco.obj.getTileAt(x, y);
            this.autoTileData.push(new AutoTileData(tile, wallTile, decoTile, x, y, this));
        }, this);
        this.registerNeighbours();
        this.everyAutoTile(function (a) { a.queue();});
    }
    registerNeighbours() {
        this.everyAutoTile(function (autotile) {
            for (let y = autotile.y - 2; y <= autotile.y + 2; y++) {
                for (let x = autotile.x - 1; x <= autotile.x + 1; x++) {
                    let neighbour = this.getAutoTile(x, y);
                    if (neighbour && neighbour !== autotile) {
                        autotile.neighbours.push(neighbour);
                    }
                }
            }
        }, this);
    }
    // Start refreshing tiles from queue
    refreshAllInQueue() {
        while (this.autoTileQueue.length > 0) {
            this.autoTileQueue[0].refresh();
            this.autoTileQueue.splice(0, 1);
        }
    }
    // Queue a batch of autotiles, useful for queueing neighbours of a tile
    queueAutoTiles(autotiles) {
        if (typeof autotiles.length !== 'undefined') 
            autotiles.forEach(function (a) { a.queue() });
        else 
            autotiles.queue();
    }
    // Change the look of the tile found in the layer and coordinates
    spawnTile(x, y, layer, look) {
        layer.putTileAt(new Phaser.Tilemaps.Tile(layer, look, x, y, 16, 16, 16, 16), x, y);
    }
    // Create a specific sprite within tile coordinates
    spawnSpriteTile(x, y, name, depth, source) {
        let wall = this.parent.physics.add.sprite(x * 16 + 8, y * 16 + 8, name);
        wall.setDepth(depth);
        source.sprites = source.sprites || [];
        source.sprites.push(wall);
    }
}