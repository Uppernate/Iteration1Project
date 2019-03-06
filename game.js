var config = {
    type: Phaser.AUTO,
    width: 16*16,
    height: 16*16,
    pixelArt: true,
    input: {
        activePointers: 10
    },

    physics: {
        default: 'arcade'
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
