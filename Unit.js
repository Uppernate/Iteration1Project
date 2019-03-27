class Unit {
    constructor(scene, autotile, config) {
        this.scene = scene;
        this.position = autotile;

        this.health = new Counter(0, 6, 6);
        this.stamina = new Counter(0, 6, 6);
        this.staminaRegen = 2.5;
        this.lastDamageTaken = 0;
        this.position.unit = this;
        this.team = 'player';
        this.barSprites = {
            bg: this.scene.physics.add.sprite(this.position.x, this.position.y, `bars-background`),
            health: this.scene.physics.add.sprite(this.position.x, this.position.y, `bars-health`),
            healthChange: this.scene.physics.add.sprite(this.position.x, this.position.y, `bars-change`),
            stamina: this.scene.physics.add.sprite(this.position.x, this.position.y, `bars-stamina`),
            staminaChange: this.scene.physics.add.sprite(this.position.x, this.position.y, `bars-change`),
            healthMarks: [],
            staminaMarks: []
        };
        this.barsGlobalAlpha = 0;
        this.barsAutoHide = new Counter(0, 200, 200);

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

        this.barSprites.bg.depth = depthLookup.barsBG;
        this.barSprites.health.depth = depthLookup.barsFill;
        this.barSprites.healthChange.depth = depthLookup.barsChange;
        this.barSprites.stamina.depth = depthLookup.barsFill;
        this.barSprites.staminaChange.depth = depthLookup.barsChange;
        if (this.health.max >= 10) {
            for (let i = 5; i < this.health.max; i += 5) {
                const mark = this.scene.physics.add.sprite(this.position.x, this.position.y, `bars-redmark`);
                mark.depth = depthLookup.barsMark;
                mark.barOffset = i;
                mark.originalalpha = mark.alpha;
                this.barSprites.healthMarks.push(mark);
            }
        }
        else {
            for (let i = 1; i < this.health.max; i++) {
                const mark = this.scene.physics.add.sprite(this.position.x, this.position.y, `bars-redmark`);
                mark.depth = depthLookup.barsMark;
                mark.barOffset = i;
                mark.alpha = (i % 5) ? 0.5 : 1;
                mark.originalalpha = mark.alpha;
                this.barSprites.healthMarks.push(mark);
            }
        }

        if (this.stamina.max >= 10) {
            for (let i = 5; i < this.stamina.max; i += 5) {
                const mark = this.scene.physics.add.sprite(this.position.x, this.position.y, `bars-bluemark`);
                mark.depth = depthLookup.barsMark;
                mark.barOffset = i;
                mark.originalalpha = mark.alpha;
                this.barSprites.staminaMarks.push(mark);
            }
        }
        else {
            for (let i = 1; i < this.stamina.max; i++) {
                const mark = this.scene.physics.add.sprite(this.position.x, this.position.y, `bars-bluemark`);
                mark.depth = depthLookup.barsMark;
                mark.barOffset = i;
                mark.alpha = (i % 5) ? 0.5 : 1;
                mark.originalalpha = mark.alpha;
                this.barSprites.staminaMarks.push(mark);
            }
        }

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

        
        if (this.barsAutoHide.isEmpty) {
            this.barsGlobalAlpha = 0;
        }
        else {
            this.barsGlobalAlpha = 1;
        }

        this.sprite.x = this.position.x * 16 + 8;
        this.sprite.y = this.position.y * 16 + 8 - this.sprite.height / 2;
        this.sprite.setDepth(this.sprite.y + this.sprite.height / 2);

        this.actions.forEach(function (action) {
            action.displayUpdate();
        });

        this.barSprites.bg.alpha = this.barsGlobalAlpha;
        this.barSprites.bg.x = this.position.x * 16 + 8;
        this.barSprites.bg.y = this.position.y * 16 + 12;

        this.barSprites.health.alpha = this.barsGlobalAlpha;
        this.barSprites.health.setScale(this.health.value / this.health.max, 1);
        this.barSprites.health.x = this.barSprites.bg.x - 8 * (1 - this.health.value / this.health.max);
        this.barSprites.health.y = this.barSprites.bg.y - 2;

        this.barSprites.stamina.alpha = this.barsGlobalAlpha;
        this.barSprites.stamina.setScale(this.stamina.value / this.stamina.max, 1);
        this.barSprites.stamina.x = this.barSprites.bg.x - 8 * (1 - this.stamina.value / this.stamina.max);
        this.barSprites.stamina.y = this.barSprites.bg.y + 1;

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
            this.barSprites.health.destroy();
            this.barSprites.stamina.destroy();
            this.barSprites.bg.destroy();
            this.barSprites.healthChange.destroy();
            this.barSprites.staminaChange.destroy();
            this.barSprites.healthMarks.forEach(function (a) {
                a.destroy();
            });
            this.barSprites.staminaMarks.forEach(function (a) {
                a.destroy();
            });
            this.sprite.destroy();
            this.scene.removeUnit(this);
        }
    }
    advance() {
        console.log(`${this.name} has advanced with action ${this.chosenAction.icon}`);
        this.chosenAction.advance();
    }
}

class UnitKnight extends Unit {
    constructor(scene, autotile, config) {
        config = config || {};
        config.name = config.name || 'knight';
        super(scene, autotile, config);
        this.actions = [
            new ActionDash(this, {costPerDistance: 2.4, cost: 2.4}),
            new ActionSwingSword(this),
            new ActionMove(this, {costPerDistance: 1, cost: 1, range: 2.8})
        ];
    }
}

class UnitSkeleton extends Unit {
    constructor(scene, autotile, config) {
        config = config || {};
        config.name = config.name || 'skeleton';
        config.team = config.team || 'player';
        super(scene, autotile, config);
        this.actions = [
            new ActionStab(this),
            new ActionMove(this, { costPerDistance: 0.8, range: 2.8 })
        ];
    }
}