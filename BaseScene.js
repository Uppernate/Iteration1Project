// JavaScript source code

const depthLookup = {
    floor: 0,
    npc: 1,
    ceiling: 10000,
    tileOverlays: 15000,
    barsBG: 18000,
    barsFill: 19000,
    barsMark: 19500,
    barsChange: 19750,
    actions: 20000,
    actionIcons: 21000,
    UI: 30000,
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

        this.level.loadImages([
            'brick-main', 'brick-left', 'brick-right',
            'unit-archer',
            'unit-knight',
            'unit-skeleton',
            'select', 'tile-selectable',
            'select-move', 'action-move',
            'select-dash', 'action-dash',
            'select-stab', 'action-stab',
            'select-swing-sword', 'action-swing-sword',
            'select-arrowshoot', 'action-arrowshoot',
            'action-no-icon',
            'action',
            'play-turn',

            'bars-background', 'bars-health', 'bars-stamina', 'bars-redmark', 'bars-bluemark', 'bars-change'
        ]);
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
            const tile = this.tileManager.getAutoTile(object.x / 16, object.y / 16);
            if (object.type === 'unit-player') {
                switch (object.name) {
                    case 'archer':
                        this.playfield.units.push(new Unit(this, tile, { name: object.name }));
                        break;
                    case 'knight':
                        this.playfield.units.push(new UnitKnight(this, tile));
                        break;

                }
            }
            if (object.type === 'unit-enemy') {
                switch (object.name) {
                    case 'skeleton':
                        this.playfield.units.push(new UnitSkeleton(this, tile));
                        break;
                }
            }
        }, this);

        this.scale.on('resize', this.resize, this);
        
        const pixelSize = Math.ceil(Math.min(this.game.canvas.width / 480, this.game.canvas.height / 270)) * window.devicePixelRatio;
        this.windowsize.set(this.game.canvas.width / pixelSize, this.game.canvas.height / pixelSize);
        this.pixelsize = pixelSize;
        this.cameras.main.zoom = pixelSize;

        this.playturn = this.physics.add.sprite(this.cameras.main.x + this.windowsize.x / 2, this.cameras.main.y + this.windowsize.y / 2, 'play-turn');
        this.playturn.depth = depthLookup.UI;
        this.playturn.setInteractive();

        this.playturn.on('pointerdown', function () {
            this.playfield.prepareUnits();
            this.touchContext.switchState('advancing');
            this.playturn.alpha = 0.5;
        }, this);
    }
    update(time, delta) {
        //this.player.update();
        this.touchContext.update();
        this.tileManager.refreshAllInQueue();
        this.cameras.main.centerOn(Math.round(this.camerafocus.x), Math.round(this.camerafocus.y));
        this.playfield.updateUnits();

        this.playturn.x = Math.round(this.camerafocus.x) + this.windowsize.x / 2 - this.playturn.width / 2;
        this.playturn.y = Math.round(this.camerafocus.y) + this.windowsize.y / 2 - this.playturn.height / 2;

        if (!this.playfield.advancing) {
            this.playturn.alpha = 1;
            if (this.touchContext.state.name == "Advancing") {
                console.log('back');
                this.touchContext.switchState('none');
            }
        }
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
    removeUnit(unit) {
        this.playfield.units.splice(this.playfield.units.findIndex(function (a) { return a === unit}), 1);
    }
}