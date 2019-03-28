// JavaScript source code

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

IMAGE_INSERT('image', `unit-skeleton`);