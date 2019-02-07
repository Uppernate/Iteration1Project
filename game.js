var config = {
    type: Phaser.AUTO,
    width: 64*8,
    height: 64*12,
    pixelArt: false,
    input: {
        activePointers: 10
    },

    physics: {
        default: 'matter',
        matter: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },

    plugins: {
        scene: [{
            plugin: PhaserMatterCollisionPlugin,
            key: "matterCollision",
            mapping: "matterCollision"
        }]
    },

    scene: [BaseScene],
    callbacks: {
      postBoot: function() {
        resize();
      }
    }
};

var game = new Phaser.Game(config);
window.addEventListener("resize", resize, false);
function resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;

    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    } else {
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
