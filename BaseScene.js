// JavaScript source code

const depthLookup = {
    floor: 0,
    npc: 1,
    ceiling: 10000,
    actions: 20000,
    actionIcons: 21000
};

class BaseScene extends Phaser.Scene {
    constructor(id) {
        super(id);
        this.id = id;
        this.level = new LevelLoader(this);
        this.tileManager = new TileManager(this);
        this.turnSystem = new TurnSystem(this);
        this.playfield = new Playfield(this);
        this.camerafocus = new Vector2(8 * 32, 8 * 32);
        this.windowsize = new Vector2(0, 0);
        this.pixelsize = 1;
    }
    preload() {
        
        this.level.key = 'level';
        this.level.source = 'levels/level1.json';
        this.level.newTileset('main', 'img/tiles.png');
        this.level.newDynamicLayer('main', ['main']);
        this.level.newDynamicLayer('wall', ['main']);
        this.level.newDynamicLayer('deco', ['main']);
        this.load.image('brick-main', 'img/brick-main.png');
        this.load.image('brick-left', 'img/brick-left.png');
        this.load.image('brick-right', 'img/brick-right.png');
        this.load.image('unit-archer', 'img/unit-archer.png');
        this.load.image('select', 'img/select.png');
        this.load.image('action', 'img/action.png');
        this.load.image('action-no-icon', 'img/action-no-icon.png');
    }
    create() {
        this.level.make();
        this.touchContext = new TouchContext(this);

        // Randomise floor tiles

        this.tileManager.everyTile(this.level.layer('main'), function (tile, x, y) {
            if (tile.propdata.type == "floor") {
                tile.index = Math.floor(1 + Math.random() * 4);
            }
        }, this);

        this.tileManager.everyTile(this.level.layer('wall'), function (tile, x, y) {
            if (tile.propdata.type == "wall") {
                tile.index = Math.floor(9 + Math.random() * 4);
            }
        }, this);

        this.tileManager.registerAll();
        this.level.layer('deco').obj.setDepth(depthLookup.ceiling);

        this.map.filterObjects('units', function (object) {
            if (object.type === 'unit-player') {
                this.playfield.units.push(new Unit(this, this.tileManager.getAutoTile(object.x / 16, object.y / 16), {name: object.name}));
            }
        }, this);

        this.scale.on('resize', this.resize, this);
        
        const pixelSize = Math.ceil(Math.min(this.game.canvas.width / 480, this.game.canvas.height / 270)) * window.devicePixelRatio;
        this.windowsize.set(this.game.canvas.width / pixelSize, this.game.canvas.height / pixelSize);
        this.pixelsize = pixelSize;
        this.cameras.main.zoom = pixelSize;
    }
    update(time, delta) {
        //this.player.update();
        this.touchContext.update();
        this.tileManager.refreshAllInQueue();
        this.cameras.main.centerOn(Math.round(this.camerafocus.x), Math.round(this.camerafocus.y));
        this.playfield.updateUnits();
    }
    resize(gameSize, baseSize, displaySize, resolution) {
        const width = displaySize.width;
        const height = displaySize.height;

        const pixelSize = Math.ceil(Math.min(width / 480, height / 270)) * window.devicePixelRatio;

        this.cameras.resize(width, height);
        this.windowsize.set(width / pixelSize, height / pixelSize);
        this.pixelsize = pixelSize;
        this.cameras.main.zoom = pixelSize;
    }
}