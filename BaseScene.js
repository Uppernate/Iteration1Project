// JavaScript source code
class BaseScene extends Phaser.Scene {
    constructor(id) {
        super(id);
        this.id = id;
        this.level = new LevelLoader(this);
        this.tileManager = new TileManager(this);
        this.turnSystem = new TurnSystem(this);
        this.playfield = new Playfield(this);
        this.camerafocus = new Vector2(8 * 32, 8 * 32);
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

        this.scale.on('resize', this.resize, this);
        
        const pixelSize = Math.ceil(Math.min(this.game.canvas.width / 480, this.game.canvas.height / 270)) * window.devicePixelRatio;
        this.cameras.main.zoom = pixelSize;
    }
    update(time, delta) {
        //this.player.update();
        this.touchContext.update();
        this.tileManager.refreshAllInQueue();
        this.cameras.main.centerOn(Math.round(this.camerafocus.x), Math.round(this.camerafocus.y));
    }
    resize(gameSize, baseSize, displaySize, resolution) {
        const width = displaySize.width;
        const height = displaySize.height;

        const pixelSize = Math.ceil(Math.min(width / 480, height / 270)) * window.devicePixelRatio;

        this.cameras.resize(width, height);
        this.cameras.main.zoom = pixelSize;
    }
}