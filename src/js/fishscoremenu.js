import { Actor, Color, Vector, Label, FontUnit, Keys } from "excalibur";
import { FishTypes } from "./fish-config.js";
import { Resources } from "./resources.js";

export class FishScoreMenu extends Actor {
    constructor(engine, onBack) {
        super();
        this.engine = engine;
        this.onBack = onBack;
        this.selected = 0;
        this.fishScoreSettings = {
            small: FishTypes.smallFishBlue.points,
            big: FishTypes.lavenderFish.points,
            turtle: FishTypes.turtle.points
        };
    }

    onInitialize(engine) {
        this.labels = [
            new Label({
                text: "",
                pos: new Vector(40, 120),
                font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
                anchor: new Vector(0.5, 0.5)
            }),
            new Label({
                text: "",
                pos: new Vector(55, 180),
                font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
                anchor: new Vector(0.5, 0.5)
            }),
            new Label({
                text: "",
                pos: new Vector(55, 240),
                font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
                anchor: new Vector(0.5, 0.5)
            }),
            new Label({
                text: "Terug",
                pos: new Vector(250, 300),
                font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
                anchor: new Vector(0.5, 0.5)
            })
        ];
        this.labels.forEach(l => this.addChild(l));
        this.updateLabels();
    }

    updateLabels() {
        this.labels[0].text = `Kleine vis: ${this.fishScoreSettings.small} punt${this.fishScoreSettings.small === 1 ? "" : "en"}`;
        this.labels[1].text = `Grote vis: ${this.fishScoreSettings.big} punt${this.fishScoreSettings.big === 1 ? "" : "en"}`;
        this.labels[2].text = `Schildpad: ${this.fishScoreSettings.turtle} punt${this.fishScoreSettings.turtle === 1 ? "" : "en"}`;
        this.labels.forEach((label, i) => {
            label.color = (i === this.selected) ? Color.Yellow : Color.White;
        });
    }

    onPreUpdate(engine) {
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
        // Links/rechts om waarde te veranderen
        if (engine.input.keyboard.wasPressed(Keys.A) || engine.input.keyboard.wasPressed(Keys.Left)) {
            this.changeFishScore(-1);
        }
        if (engine.input.keyboard.wasPressed(Keys.D) || engine.input.keyboard.wasPressed(Keys.Right)) {
            this.changeFishScore(1);
        }
        // Enter of Spatie
        if (engine.input.keyboard.wasPressed(Keys.Enter) || engine.input.keyboard.wasPressed(Keys.Space)) {
            if (this.selected === 3) {
                // Opslaan in FishTypes
                FishTypes.smallFishBlue.points = this.fishScoreSettings.small;
                FishTypes.smallFishCyan.points = this.fishScoreSettings.small;
                FishTypes.smallFishGreen.points = this.fishScoreSettings.small;
                FishTypes.smallFishPink.points = this.fishScoreSettings.small;
                FishTypes.lavenderFish.points = this.fishScoreSettings.big;
                FishTypes.redFish.points = this.fishScoreSettings.big;
                FishTypes.turtle.points = this.fishScoreSettings.turtle;
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
        this.updateLabels();
    }
}