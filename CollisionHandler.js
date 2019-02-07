// JavaScript source code
class CollisionHandler {
    constructor(scene) {
        this.scene = scene;
        this.registers = {};
    }
    register(a, b, f) {
        this.registers[a] = this.registers[a] || {};
        this.registers[a][b] = f;
    }
    make() {
        this.scene.matter.world.on('collisionstart', this.handle, this);
        this.scene.matter.world.on('collisionactive', this.handle, this);
    }
    handle(event) {
        event.pairs.forEach(this.matchPair, this);
    }
    matchPair(pair) {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        if (bodyA.gameObject && bodyA.gameObject.label) {
            let col = this.registers[bodyA.gameObject.label];
            if (col && bodyB.gameObject && bodyB.gameObject.label) {
                col = col[bodyB.gameObject.label];
                if (col)
                    col.call(this.scene, bodyA, bodyB);
            }
        }
        if (bodyB.gameObject && bodyB.gameObject.label) {
            let col = this.registers[bodyB.gameObject.label];
            if (col && bodyA.gameObject && bodyA.gameObject.label) {
                col = col[bodyA.gameObject.label];
                if (col)
                    col.call(this.scene, bodyB, bodyA);
            }
        }
    }
}