class LevelLoader {
    constructor(scene) {
        this.scene = scene;
        this.key = 'unknown';
        this._source = '';
        this._tilesetsToMake = [];
        this._tilesets = [];
        this.layers = [];
    }
    set source(t) {
        this._source = t;
        this.scene.load.tilemapTiledJSON(this.key, this._source);
    }
    newTileset(name, source) {
        this.scene.load.image(name, source);
        this._tilesetsToMake.push({name: name});
    }
    get allTilesets() {
        return this._tilesets;
    }
    newStaticLayer(name, tilesets) {
        this.layers.push({ name: name, type: 'static', tilesets: tilesets });
    }
    newDynamicLayer(name, tilesets) {
        this.layers.push({ name: name, type: 'dynamic', tilesets: tilesets });
    }
    layer(name) {
        return this.layers.find(function (l) { if (l.name == name) return true;});
    }
    make() {
        this.scene.map = this.scene.make.tilemap({ key: this.key });
        for (let i = 0; i < this._tilesetsToMake.length; i++) {
            this._tilesetsToMake[i].obj = this.scene.map.addTilesetImage(this._tilesetsToMake[i].name, this._tilesetsToMake[i].name, 16, 16, 1, 2);
            this._tilesets.push(this._tilesetsToMake[i].obj);
        }
        for (let i = 0; i < this.layers.length; i++) {
            let tilesets = [];
            this.layers[i].tilesets.forEach(function (element) {
                tilesets.push(this._tilesets[this._tilesetsToMake.findIndex(function (t) {
                    if (t.name == element) return true;
                }, this)]);
            }, this);
            if (tilesets.length == 1)
                tilesets = tilesets[0];
            switch (this.layers[i].type) {
                case 'static':
                    this.layers[i].obj = this.scene.map.createStaticLayer(this.layers[i].name, tilesets, 0, 0);
                    break;
                case 'dynamic':
                    this.layers[i].obj = this.scene.map.createDynamicLayer(this.layers[i].name, tilesets, 0, 0);
                    break;
            }
        }
        this.scene.cameras.main.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
        //this.scene.matter.world.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
        return this.scene.map;
    }
    layerToMatter(name) {
        let index = this.layers.findIndex(function (element) {
            return element.name == name;
        });
        if (index >= 0) {
            this.layers[index].obj.setCollisionFromCollisionGroup();
            this.layers[index].obj.setCollisionByProperty({ collides: true });
            this.scene.matter.world.convertTilemapLayer(this.layers[index].obj);
        }
    }
}