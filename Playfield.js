class Playfield {
    constructor(source) {
        this.tiles = [];
        this.units = [];
        this.stage = 'dash';
        this.advancing = false;
        this.timeToNextStage = new Counter(0, 60, 60);
    }
    updateUnits() {
        this.units.forEach(function (unit) {
            unit.update();
        });
        if (this.advancing) {
            this.timeToNextStage.value--;
            if (this.timeToNextStage.isEmpty) {
                let count;
                switch (this.stage) {
                    case 'dash':
                        count = this.advanceUnitsWithPhase(this.stage);
                        this.stage = 'block';
                        if (count)
                            this.timeToNextStage.fill();
                        break;
                    case 'block':
                        count = this.advanceUnitsWithPhase(this.stage);
                        this.stage = 'attack';
                        if (count)
                            this.timeToNextStage.fill();
                        break;
                    case 'attack':
                        count = this.advanceUnitsWithPhase(this.stage);
                        this.stage = 'move';
                        if (count)
                            this.timeToNextStage.fill();
                        break;
                    case 'move':
                        count = this.advanceUnitsWithPhase(this.stage);
                        this.advancing = false;
                        this.stage = 'dash';
                        this.timeToNextStage.fill();
                        break;
                }
            }
        }
    }
    advanceUnitsWithPhase(phasename) {
        let count = 0;
        this.units.forEach(function (unit) {
            if (unit.chosenAction && unit.chosenAction.phase == phasename) {
                unit.advance();
                count++;
            }
        });
        return count;
    } 
    prepareUnits() {
        if (this.advancing == false) {
            this.units.forEach(function (unit) {
                unit.health.value -= unit.lastDamageTaken;
                unit.lastDamageTaken = 0;
                if (!unit.chosenAction) {
                    unit.stamina.value += unit.staminaRegen;
                }
            }, this);
            this.advancing = true;
        }
    }
}