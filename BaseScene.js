// JavaScript source code
class BaseScene extends Phaser.Scene {
    constructor(id) {
        super(id);
        this.id = id;
        this.level = new LevelLoader(this);
        this.collision = new CollisionHandler(this);
    }
    preload() {
        this.level.key = 'level';
        this.level.source = 'levels/level1.json';
        this.level.newTileset('floor', 'img/floor.png');
        this.level.newDynamicLayer('main', ['floor']);
    }
    create() {
        this.level.make();
        this.level.layerToMatter('main');

        // Randomise floor tiles
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.width; y++) {
                let tile = this.level.layers[0].obj.getTileAt(x, y);
                if (typeof tile.randomised == 'undefined') {
                    let type = Math.floor(1 + Math.random() * 11);
                    if (type < 9) {
                        tile.index = type;
                        tile.randomised = true;
                    }
                    else if (type == 10) {
                        let tiles = [
                            this.level.layers[0].obj.getTileAt(x + 1, y),
                            this.level.layers[0].obj.getTileAt(x, y + 1),
                            this.level.layers[0].obj.getTileAt(x + 1, y + 1)
                        ];
                        if (tiles[0] && tiles[1] && tiles[2] &&
                            !tiles[0].randomised && !tiles[1].randomised && !tiles[2].randomised) {
                            tile.index = 9;
                            tiles[0].index = 10;
                            tiles[1].index = 13;
                            tiles[2].index = 14;
                            tile.randomised = true;
                            tiles[0].randomised = true;
                            tiles[1].randomised = true;
                            tiles[2].randomised = true;
                        }
                    }
                    else if (type == 11) {
                        let tiles = [
                            this.level.layers[0].obj.getTileAt(x + 1, y),
                            this.level.layers[0].obj.getTileAt(x, y + 1),
                            this.level.layers[0].obj.getTileAt(x + 1, y + 1)
                        ];
                        if (tiles[0] && tiles[1] && tiles[2] &&
                            !tiles[0].randomised && !tiles[1].randomised && !tiles[2].randomised) {
                            tile.index = 11;
                            tiles[0].index = 12;
                            tiles[1].index = 15;
                            tiles[2].index = 16;
                            tile.randomised = true;
                            tiles[0].randomised = true;
                            tiles[1].randomised = true;
                            tiles[2].randomised = true;
                        }
                    }
                }
            }
        }

        /*this.map.filterObjects('objects', function (object) {
            switch (object.type) {
                case 'coin':
                    new Coin(this, object.x, object.y);
                    break;
            }
        }, this);*/

        //this.player = new Player(this, this.map.widthInPixels / 2, this.map.heightInPixels / 2);
        //this.cameras.main.startFollow(this.player.sprite, false, 0.5, 0.5);

        // Collisions
        this.collision.register('player', 'coin', function (player, coin) {
            coin.gameObject.parent.destroy();
        });
        this.collision.make();
    }
    update(time, delta) {
        //this.player.update();
    }
}