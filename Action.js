// JavaScript source code
class Action {
    constructor(unit, config) {
        this.icon = 'no-icon';
        this.phase = 'move';
        this.unit = unit;
        this.scale = new Vector2(0, 0);
        this.targetScale = new Vector2(0, 0);
        this.offset = new Vector2(0, 0);
        this.targetOffset = new Vector2(0, 0);

        /// Import configs into this class

        const entries = Object.entries(config || {});
        entries.forEach(function (entry) {
            this[entry[0]] = entry[1];
        }, this);

        this.circle = this.unit.scene.physics.add.sprite(this.unit.position.x, this.unit.position.y, `action`);
        this.circleicon = this.unit.scene.physics.add.sprite(this.unit.position.x, this.unit.position.y, `action-${this.icon}`);

        this.circleicon.x = this.circle.x = this.unit.position.x * 16 + 8;
        this.circleicon.y = this.circle.y = this.unit.position.y * 16 + 8;
        this.circle.setScale(this.scale.x, this.scale.y);
        this.circleicon.setScale(this.scale.x, this.scale.y);
        this.circleicon.depth = this.circle.depth = depthLookup.actions;
    }
    displayUpdate() {
        this.scale.lerp(this.targetScale, 0.2);
        this.offset.lerp(this.targetOffset, 0.2);
        this.circleicon.x = this.circle.x = this.unit.position.x * 16 + 8 + this.offset.x;
        this.circleicon.y = this.circle.y = this.unit.position.y * 16 + 8 + this.offset.y;
        this.circle.setScale(this.scale.x, this.scale.y);
        this.circleicon.setScale(this.scale.x, this.scale.y);
    }
}