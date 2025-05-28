import { Actor, Color, Vector, Label, FontUnit, Keys } from "excalibur";
import { settings, resetSettings } from "./settings.js";
import { Resources } from "./resources.js";
import { FishTypes } from "./fish-config.js";
import { FishScoreMenu } from "./fishscoremenu.js";

export class OptionsMenu extends Actor {
    constructor(engine, onBack) {
        super();
        this.engine = engine;
        this.onBack = onBack;
        this.selected = 0;
        this.options = [
            "Spelmodus",
            "Timer/Score",
            "Spawn-tempo",
            "Visscore aanpassen",
            "Reset",
            "Terug"
        ];
        this.timerOptions = [30, 60, 90];
        this.scoreOptions = [50, 75, 100, 150, 200, 250];
        this.spawnSpeeds = [0.5, 1, 1.5, 2, 2.5, 5];

        // Score settings per soort
        this.fishScoreSettings = {
            small: FishTypes.smallFishBlue.points,
            big: FishTypes.lavenderFish.points,
            turtle: FishTypes.turtle.points
        };
    }

    onInitialize(engine) {
        this.labels = [];
        for (let i = 0; i < this.options.length; i++) {
            const label = new Label({
                text: this.options[i],
                pos: new Vector(40, 60 + i * 60),
                font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
                anchor: new Vector(0.5, 0.5)
            });
            this.addChild(label);
            this.labels.push(label);
        }

        this.updateLabels();
    }

    updateLabels() {
        this.labels.forEach((label, i) => {
            label.color = (i === this.selected) ? Color.Yellow : Color.White;
            if (i === 0) {
                label.text = `Spelmodus: ${settings.mode === "timer" ? "< Timer >" : "< Score >"}`;
            }
            if (i === 1) {
                label.text = settings.mode === "timer"
                    ? `Tijd: < ${settings.timer} sec >`
                    : `Score: < ${settings.scoreGoal} >`;
            }
            if (i === 2) {
                label.text = `Spawn-tempo: < ${settings.spawnSpeed}x >`;
            }
        });
    }

    onPreUpdate(engine) {
        if (engine.inputCooldown > 0) return;

        // Navigatie hoofdmenu
        if (engine.input.keyboard.wasPressed(Keys.W) || engine.input.keyboard.wasPressed(Keys.Up)) {
            this.selected = (this.selected + this.options.length - 1) % this.options.length;
            this.updateLabels();
        }
        if (engine.input.keyboard.wasPressed(Keys.S) || engine.input.keyboard.wasPressed(Keys.Down)) {
            this.selected = (this.selected + 1) % this.options.length;
            this.updateLabels();
        }
        // Links/rechts om waarde te veranderen
        if (engine.input.keyboard.wasPressed(Keys.A) || engine.input.keyboard.wasPressed(Keys.Left)) {
            this.changeOption(-1);
        }
        if (engine.input.keyboard.wasPressed(Keys.D) || engine.input.keyboard.wasPressed(Keys.Right)) {
            this.changeOption(1);
        }
        // Enter of Spatie
        if (engine.input.keyboard.wasPressed(Keys.Enter) || engine.input.keyboard.wasPressed(Keys.Space)) {
            if (this.options[this.selected] === "Reset") {
                resetSettings();
                // Reset visscores ook
                FishTypes.smallFishBlue.points = 1;
                FishTypes.smallFishCyan.points = 1;
                FishTypes.smallFishGreen.points = 1;
                FishTypes.smallFishPink.points = 1;
                FishTypes.lavenderFish.points = 3;
                FishTypes.redFish.points = 3;
                FishTypes.turtle.points = 8;
                this.updateLabels();
            }
            if (this.options[this.selected] === "Terug") {
                this.onBack();
            }
            if (this.options[this.selected] === "Visscore aanpassen") {
                this.engine.currentScene.clear();
                this.engine.add(new FishScoreMenu(this.engine, () => this.engine.showOptions()));
                this.engine.inputCooldown = 300;
                return;
            }
        }
    }

    changeOption(dir) {
        if (this.selected === 0) {
            settings.mode = (settings.mode === "timer") ? "score" : "timer";
        }
        if (this.selected === 1) {
            if (settings.mode === "timer") {
                let idx = this.timerOptions.indexOf(settings.timer);
                idx = (idx + dir + this.timerOptions.length) % this.timerOptions.length;
                settings.timer = this.timerOptions[idx];
            } else {
                let idx = this.scoreOptions.indexOf(settings.scoreGoal);
                idx = (idx + dir + this.scoreOptions.length) % this.scoreOptions.length;
                settings.scoreGoal = this.scoreOptions[idx];
            }
        }
        if (this.selected === 2) {
            let idx = this.spawnSpeeds.indexOf(settings.spawnSpeed);
            idx = (idx + dir + this.spawnSpeeds.length) % this.spawnSpeeds.length;
            settings.spawnSpeed = this.spawnSpeeds[idx];
        }
        this.updateLabels();
    }
}