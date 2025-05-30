class Settings {
    constructor() {
        this.reset();
    }
    reset() {
        this.mode = "timer";
        this.timer = 60;
        this.scoreGoal = 100;
        this.spawnSpeed = 1;
        this.scoreboardType = "score";
        this.allowTire = true;
        this.allowNegativeScore = false;
    }
}
export const settings = new Settings();