import { Actor, Color, Vector, Label, FontUnit, Keys } from "excalibur";
import { FishTypes } from "./fish-config.js";
import { Resources } from "./resources.js";
import { settings } from "./settings.js";

class FishScoreSettings {
    constructor() {
        this.small = FishTypes.smallFishBlue.points;
        this.big = FishTypes.lavenderFish.points;
        this.turtle = FishTypes.turtle.points;
        this.tire = FishTypes.tire.points; // ik was die hele fietsband vergeten
    }
    applyToFishTypes() {
        FishTypes.smallFishBlue.points = this.small;
        FishTypes.smallFishCyan.points = this.small;
        FishTypes.smallFishGreen.points = this.small;
        FishTypes.smallFishPink.points = this.small;
        FishTypes.lavenderFish.points = this.big;
        FishTypes.redFish.points = this.big;
        FishTypes.turtle.points = this.turtle;
        FishTypes.tire.points = this.tire;
    }
}

export class FishScoreMenu extends Actor {
    constructor(engine, onBack) {
        super();
        this.engine = engine;
        this.onBack = onBack;
        this.selected = 0;
        this.fishScoreSettings = new FishScoreSettings();

        // Voor vasthouden van links/rechts
        this.holdDir = 0; // -1 voor links, 1 voor rechts, 0 voor niks
        this.holdTimer = 0;
        this.repeatDelay = 375; // ms tot auto-repeat start
        this.repeatInterval = 50;
        this.repeatTick = 0;


        this.leftHeldLast = false;
        this.rightHeldLast = false;
        this.leftHeldLastP2 = false;
        this.rightHeldLastP2 = false;
    }

    onInitialize(engine) {
        this.labels = [
            new Label({
                text: "",
                pos: new Vector(10, 120),
                font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
                anchor: new Vector(0.5, 0.5)
            }),
            new Label({
                text: "",
                pos: new Vector(10, 180),
                font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
                anchor: new Vector(0.5, 0.5)
            }),
            new Label({
                text: "",
                pos: new Vector(10, 240),
                font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
                anchor: new Vector(0.5, 0.5)
            }),
            new Label({
                text: "",
                pos: new Vector(10, 300),
                font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
                anchor: new Vector(0.5, 0.5)
            }),
            new Label({
                text: "Terug",
                pos: new Vector(250, 360),
                font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
                anchor: new Vector(0.5, 0.5)
            }),
        ];
        this.labels.forEach(l => this.addChild(l));
        this.updateLabels();
    }

    updateLabels() {
        this.labels[0].text = `Kleine vis: ${this.fishScoreSettings.small} punt${this.fishScoreSettings.small === 1 ? "" : "en"}`;
        this.labels[1].text = `Grote vis: ${this.fishScoreSettings.big} punt${this.fishScoreSettings.big === 1 ? "" : "en"}`;
        this.labels[2].text = `Schildpad: ${this.fishScoreSettings.turtle} punt${this.fishScoreSettings.turtle === 1 ? "" : "en"}`;
        this.labels[3].text = `Fietsband: ${this.fishScoreSettings.tire} punt${this.fishScoreSettings.tire === -1 ? "" : "en"}`;
        this.labels[4].text = "Terug";
        this.labels.forEach((label, i) => {
            label.color = (i === this.selected) ? Color.Yellow : Color.White;
        });
    }

    onPreUpdate(engine, delta) {
        if (engine.inputCooldown > 0) return;

        // Navigatie
        if (engine.input.keyboard.wasPressed(Keys.W) || engine.input.keyboard.wasPressed(Keys.Up)) {
            this.selected = (this.selected + this.labels.length - 1) % this.labels.length;
            this.updateLabels();
        }
        if (engine.input.keyboard.wasPressed(Keys.S) || engine.input.keyboard.wasPressed(Keys.Down)) {
            this.selected = (this.selected + 1) % this.labels.length;
            this.updateLabels();
        }

        const p1Left = engine.input.keyboard.isHeld(Keys.A);
        const p1Right = engine.input.keyboard.isHeld(Keys.D);
        const p2Left = engine.input.keyboard.isHeld(Keys.Left);
        const p2Right = engine.input.keyboard.isHeld(Keys.Right);

        // Detecteer eerste indrukken per speler
        if (engine.input.keyboard.wasPressed(Keys.A) && !this.leftHeldLastP1) {
            this.changeFishScore(-1);
            this.holdTimer = 0;
            this.repeatTick = 0;
        }
        if (engine.input.keyboard.wasPressed(Keys.D) && !this.rightHeldLastP1) {
            this.changeFishScore(1);
            this.holdTimer = 0;
            this.repeatTick = 0;
        }
        if (engine.input.keyboard.wasPressed(Keys.Left) && !this.leftHeldLastP2) {
            this.changeFishScore(-1);
            this.holdTimer = 0;
            this.repeatTick = 0;
        }
        if (engine.input.keyboard.wasPressed(Keys.Right) && !this.rightHeldLastP2) {
            this.changeFishScore(1);
            this.holdTimer = 0;
            this.repeatTick = 0;
        }

        // Richting bepalen
        let dir = 0;
        if ((p1Left && !p1Right) || (p2Left && !p2Right)) dir = -1;
        if ((p1Right && !p1Left) || (p2Right && !p2Left)) dir = 1;
        // Als beide spelers tegengestelde richting vasthouden: geen beweging
        if (((p1Left || p2Left) && (p1Right || p2Right))) {
            if ((p1Left || p2Left) && (p1Right || p2Right)) {
                // Turbo als beide spelers exact dezelfde richting vasthouden
                if ((p1Left && p2Left) && !(p1Right || p2Right)) {
                    dir = -1;
                } else if ((p1Right && p2Right) && !(p1Left || p2Left)) {
                    dir = 1;
                } else {
                    dir = 0;
                }
            }
        }

        // Turbo bepalen: alleen als beide spelers exact dezelfde richting vasthouden
        let turbo = false;
        if ((p1Left && p2Left) && !(p1Right || p2Right)) turbo = true;
        if ((p1Right && p2Right) && !(p1Left || p2Left)) turbo = true;

        // Vasthouden logica
        if (dir !== 0) {
            this.holdDir = dir;
            this.holdTimer += delta;
            let interval = turbo ? this.repeatInterval / 2 : this.repeatInterval;
            let delay = turbo ? this.repeatDelay / 2 : this.repeatDelay;
            if (this.holdTimer > delay) {
                this.repeatTick += delta;
                while (this.repeatTick > interval) {
                    this.repeatTick -= interval;
                    this.changeFishScore(this.holdDir);
                }
            }
        } else {
            this.holdDir = 0;
            this.holdTimer = 0;
            this.repeatTick = 0;
        }

        // Sla huidige held-status op voor volgende frame
        this.leftHeldLastP1 = p1Left;
        this.rightHeldLastP1 = p1Right;
        this.leftHeldLastP2 = p2Left;
        this.rightHeldLastP2 = p2Right;

        // Enter of Spatie
        if (engine.input.keyboard.wasPressed(Keys.Enter) || engine.input.keyboard.wasPressed(Keys.Space)) {
            if (this.selected === 4) {
                this.fishScoreSettings.applyToFishTypes();
                this.onBack();
            }
        }
    }

    changeFishScore(dir) {
        if (this.selected === 0) {
            this.fishScoreSettings.small = Math.max(1, Math.min(100, this.fishScoreSettings.small + dir));
        }
        if (this.selected === 1) {
            this.fishScoreSettings.big = Math.max(1, Math.min(100, this.fishScoreSettings.big + dir));
        }
        if (this.selected === 2) {
            this.fishScoreSettings.turtle = Math.max(1, Math.min(100, this.fishScoreSettings.turtle + dir));
        }
        if (this.selected === 3) {
            this.fishScoreSettings.tire = Math.max(-100, Math.min(-1, this.fishScoreSettings.tire + dir));
        }
        this.updateLabels();
    }
}