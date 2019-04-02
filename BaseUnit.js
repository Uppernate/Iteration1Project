class Unit {
    constructor(scene, autotile, config) {
        this.scene = scene;
        this.position = autotile;

        this.health = new BaseBar(this.scene, 'health', 6);
        this.stamina = new BaseBar(this.scene, 'stamina', 9);
        this.staminaRegen = 2.5;
        this.regenMultiplier = 1;
        this.lastDamageTaken = 0;
        this.position.unit = this;
        this.spritePosition = Vector2.zero;
        this.team = 'player';

        // No actions yet

        this.actions = [
            new ActionDash(this),
            new ActionArrowShoot(this),
            new ActionMove(this)
        ];

        /// Import configs into this class

        const entries = Object.entries(config || {});
        entries.forEach(function (entry) {
            this[entry[0]] = entry[1];
        }, this);

        this.sprite = this.scene.physics.add.sprite(this.position.x, this.position.y, `unit-${this.name || 'unit'}`);
    }
    cancelAction() {
        if (this.chosenAction) {
            this.chosenAction.cancel();
        }
        this.chosenAction = undefined;
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
        this.sprite.x = this.position.x * 16 + 8;
        this.sprite.y = this.position.y * 16 + 8 - this.sprite.height / 2;
        this.sprite.setDepth(this.sprite.y + this.sprite.height / 2);

        //this.events.update.fire();

        this.actions.forEach(function (action) {
            action.displayUpdate();
        });

        if (this.chosenAction) 
            this.stamina.changeCounter.value = this.chosenAction.cost;
        else 
            this.stamina.changeCounter.value = 0;

        if (this.lastDamageTaken)
            this.health.changeCounter.value = this.lastDamageTaken;
        else
            this.health.changeCounter.value = 0;

        this.health.coordinates.set(this.position.x * 16 - 1, this.position.y * 16 + 1);
        this.stamina.coordinates.set(this.position.x * 16 + 1, this.position.y * 16 + 1);

        this.health.update();
        this.stamina.update();

        if (this.health.value - this.lastDamageTaken <= 0)
            this.destroy();
    }
    destroy() {
        this.position.unit = undefined;
        this.health.destroy();
        this.stamina.destroy();
        this.sprite.destroy();
        this.scene.removeUnit(this);
        this.health.destroy();
        this.stamina.destroy();
    }
    standStill() {
        this.stamina.value += this.staminaRegen * this.regenMultiplier;
        this.regenMultiplier++;
    }
    hasAction() {
        this.regenMultiplier = 1;
    }
    advance() {
        console.log(`${this.name} has advanced with action ${this.chosenAction.icon}`);
        this.chosenAction.advance();
    }
}