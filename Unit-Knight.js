// JavaScript source code

class UnitKnight extends Unit {
    constructor(scene, autotile, config) {
        config = config || {};
        config.name = config.name || 'knight';
        super(scene, autotile, config);
        this.actions = [
            new ActionDash(this, { costPerDistance: 2.4, cost: 2.4 }),
            new ActionSwingSword(this),
            new ActionMove(this, { costPerDistance: 1, cost: 1, range: 2.8 })
        ];
    }
}

IMAGE_INSERT('image', `unit-knight`);