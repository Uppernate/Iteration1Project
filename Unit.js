class Unit {
    constructor(scene, autotile, config) {
        this.scene = scene;
        this.position = autotile;

        this.health = new Counter(0, 10, 10);
        this.stamina = new Counter(0, 3, 3);
        this.position.unit = this;

        // No actions yet

        this.actions = [
            new Action(this),
            new ActionMove(this)
        ];

        /// Import configs into this class

        const entries = Object.entries(config || {});
        entries.forEach(function (entry) {
            this[entry[0]] = entry[1];
        }, this);

        this.sprite = this.scene.physics.add.sprite(this.position.x, this.position.y, `unit-${this.name || 'unit'}`);
        this.sprite.x = this.position.x * 16 + 8;
        this.sprite.y = this.position.y * 16 + 8 - this.sprite.height / 2;
        this.sprite.setDepth(this.sprite.y + this.sprite.height / 2);
    }
    revealActions() {
        let angle = -Math.PI;
        this.actions.forEach(function (action) {
            angle += Math.PI / this.actions.length / 2;
            action.targetScale.set(1, 1);
            action.targetOffset.set(32, 0);
            action.targetOffset.angle = angle;
            angle += Math.PI / this.actions.length / 2;
        }, this);
    }
    hideActions() {
        this.actions.forEach(function (action) {
            action.targetScale.set(0, 0);
            action.targetOffset.set(0, 0);
        }, this);
    }
    update() {
        this.actions.forEach(function (action) {
            action.displayUpdate();
        });
    }
}