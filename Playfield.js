class Playfield {
    constructor(source) {
        this.tiles = [];
        this.units = [];
    }
    updateUnits() {
        this.units.forEach(function (unit) {
            unit.update();
        });
    }
}