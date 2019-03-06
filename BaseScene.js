// JavaScript source code
class BaseScene extends Phaser.Scene {
    constructor(id) {
        super(id);
        this.id = id;
        this.level = new LevelLoader(this);
        this.tileManager = new TileManager(this);
        this.turnSystem;
        this.playfield;
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
    }
    update(time, delta) {
        //this.player.update();
        this.tileManager.refreshAllInQueue();
    }
}