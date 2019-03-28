class Unit {
    constructor(scene, autotile, config) {
        this.scene = scene;
        this.position = autotile;

        this.health = new BaseBar(this.scene, 'health');
        this.stamina = new BaseBar(this.scene, 'stamina');
        this.staminaRegen = 2.5;
        this.lastDamageTaken = 0;
        this.position.unit = this;
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
        this.barsAutoHide.fill();
    }
    hideActions() {
        this.actions.forEach(function (action) {
            action.targetScale.set(0, 0);
            action.targetOffset.set(0, 0);
        }, this);
    }
    update() {
        if (this.barsAutoHide.isEmpty)
            this.health.alpha = 0;
        else
            this.health.alpha = 1;

        this.sprite.x = this.position.x * 16 + 8;
        this.sprite.y = this.position.y * 16 + 8 - this.sprite.height / 2;
        this.sprite.setDepth(this.sprite.y + this.sprite.height / 2);

        //this.events.update.fire();

        this.actions.forEach(function (action) {
            action.displayUpdate();
        });

        this.barSprites.healthMarks.forEach(function (a) {
            a.x = this.barSprites.bg.x - 8 + a.barOffset * (16 / this.health.max);
            a.y = this.barSprites.health.y;
            a.alpha = a.originalalpha * this.barsGlobalAlpha;
            if (a.barOffset >= this.health.value)
                a.alpha = 0;
        }, this);

        this.barSprites.staminaMarks.forEach(function (a) {
            a.x = this.barSprites.bg.x - 8 + a.barOffset * (16 / this.stamina.max);
            a.y = this.barSprites.stamina.y;
            a.alpha = a.originalalpha * this.barsGlobalAlpha;
            if (a.barOffset >= this.stamina.value)
                a.alpha = 0;
        }, this);

        if (this.chosenAction) {
            this.barSprites.staminaChange.alpha = 1 * this.barsGlobalAlpha;
            this.barSprites.staminaChange.setScale(this.chosenAction.cost / this.stamina.max, 1);
            this.barSprites.staminaChange.x = this.barSprites.stamina.x + this.barSprites.stamina.width * (this.stamina.value / this.stamina.max / 2) - 8 * (this.chosenAction.cost / this.stamina.max);
            this.barSprites.staminaChange.y = this.barSprites.stamina.y;
        }
        else {
            this.barSprites.staminaChange.alpha = 0;
        }

        if (this.lastDamageTaken) {
            this.barSprites.healthChange.alpha = 1 * this.barsGlobalAlpha;
            this.barSprites.healthChange.setScale(Math.min(this.lastDamageTaken, this.health.value) / this.health.max, 1);
            this.barSprites.healthChange.x = this.barSprites.health.x + (this.health.value / this.health.max * 8) - (Math.min(this.lastDamageTaken, this.health.value) / this.health.max * 8);
            this.barSprites.healthChange.y = this.barSprites.health.y;
        }
        else {
            this.barSprites.healthChange.alpha = 0;
        }
        if (this.health.value - this.lastDamageTaken <= 0) {
            this.position.unit = undefined;
            this.health.destroy();
            this.stamina.destroy();
            this.sprite.destroy();
            this.scene.removeUnit(this);
        }
    }
    advance() {
        console.log(`${this.name} has advanced with action ${this.chosenAction.icon}`);
        this.chosenAction.advance();
    }
}