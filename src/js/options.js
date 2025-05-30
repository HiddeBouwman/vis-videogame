import { Actor, Color, Vector, Label, FontUnit, Keys } from "excalibur";
import { settings } from "./settings.js";
import { Resources } from "./resources.js";
import { FishTypes } from "./fish-config.js";
import { FishScoreMenu } from "./fishscoremenu.js";

let secretUnlocked = false;

export class OptionsMenu extends Actor {
    constructor(engine, onBack) {
        super();
        this.engine = engine;
        this.onBack = () => {
            if (!settings.allowNegativeScore) {
                secretUnlocked = false;
            }
            onBack();
        };
        this.selected = 0;
        this.options = [
            "Spelmodus",
            "Timer/Score",
            "Spawn-tempo",
            "Score aanpassen",
            "Reset",
            "Terug"
        ];
        this.timerOptions = [30, 60, 90];
        this.scoreOptions = [50, 75, 100, 150, 200, 250];
        this.spawnSpeeds = [0.5, 1, 1.5, 2, 2.5, 5];

        // Geheime opties
        this.secretVisible = secretUnlocked;
        this.secretPressCount = 0;
        this.secretPressTimer = 0;
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
        this.secretLabels = null;
        this.secretLabel = new Label({
            text: "",
            pos: new Vector(230, 420),
            font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 8, color: Color.White }),
            anchor: new Vector(0.5, 0.5)
        });
        this.addChild(this.secretLabel);

        this.updateLabels();
    }

    updateLabels() {
        const wasSecretVisible = this.secretVisible;
        const secretIndex = this.labels.length;
        const onSecret = this.selected === secretIndex || this.selected === secretIndex + 1;
        this.secretVisible = secretUnlocked || settings.allowNegativeScore || !settings.allowTire || onSecret;

        let maxIndex = this.labels.length - 1;
        if (this.secretVisible) maxIndex += 2;
        if (!this.secretVisible && this.selected > this.labels.length - 1) {
            this.selected = this.labels.length - 1;
        } else if (this.selected > maxIndex) {
            this.selected = maxIndex;
        }

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

        if (!this.secretLabels) {
            this.secretLabels = [
                new Label({
                    text: "",
                    pos: new Vector(230, 420),
                    font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 8, color: Color.White }),
                    anchor: new Vector(0.5, 0.5)
                }),
                new Label({
                    text: "",
                    pos: new Vector(230, 440),
                    font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 8, color: Color.White }),
                    anchor: new Vector(0.5, 0.5)
                })
            ];
            this.secretLabels.forEach(l => this.addChild(l));
        }
        if (this.secretVisible) {
            this.secretLabels[0].text = `Fietsband kan spawnen: ${settings.allowTire ? "[ JA ]" : "[ NEE ]"}`; // Ik wil uiteindelijk een verborgen menu maken waar je per vis kan selecteren of deze kan spawnen maar ik had daar nu geen tijd meer voor. Dit kostte al genoeg moeite.
            this.secretLabels[1].text = `Punten onder nul: ${settings.allowNegativeScore ? "[ AAN ]" : "[ UIT ]"}`;
            let secretIndex = this.labels.length;
            this.secretLabels[0].color = (this.selected === secretIndex) ? Color.Yellow : Color.White;
            this.secretLabels[1].color = (this.selected === secretIndex + 1) ? Color.Yellow : Color.White;
            this.secretLabels[0].visible = true;
            this.secretLabels[1].visible = true;
        } else {
            // Verberg geheime labels als ze bestaan
            if (this.secretLabels) {
                this.secretLabels[0].visible = false;
                this.secretLabels[1].visible = false;
            }
        }
        // Oude secretLabel niet meer gebruiken
        if (this.secretLabel) this.secretLabel.visible = false;
    }

    onPreUpdate(engine) {
        if (engine.inputCooldown > 0) return;

        // Timer voor geheime combo
        if (this.secretPressTimer > 0) {
            this.secretPressTimer -= engine.timescale * 16.67;
            if (this.secretPressTimer <= 0) {
                this.secretPressCount = 0;
            }
        }

        // Navigatie hoofdmenu
        let extraOptions = this.secretVisible ? 2 : 0;
        let maxOptions = this.labels.length + extraOptions;
        if (engine.input.keyboard.wasPressed(Keys.W) || engine.input.keyboard.wasPressed(Keys.Up)) {
            this.selected = (this.selected + maxOptions - 1) % maxOptions;
            this.updateLabels();
        }
        if (engine.input.keyboard.wasPressed(Keys.S) || engine.input.keyboard.wasPressed(Keys.Down)) {
            this.selected = (this.selected + 1) % maxOptions;
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
            // Geheime optie unlocken: 5x snel op "Reset" drukken
            if (this.options[this.selected] === "Reset" && !this.secretVisible) {
                this.secretPressCount++;
                this.secretPressTimer = 1000; // 1 seconde om 5x te drukken
                if (this.secretPressCount >= 5) {
                    secretUnlocked = true;
                    this.secretVisible = true;
                    this.updateLabels();
                }
                // Reset altijd uitvoeren, ook tijdens geheime combo
                settings.reset();
                FishTypes.smallFishBlue.points = 1;
                FishTypes.smallFishCyan.points = 1;
                FishTypes.smallFishGreen.points = 1;
                FishTypes.smallFishPink.points = 1;
                FishTypes.lavenderFish.points = 3;
                FishTypes.redFish.points = 3;
                FishTypes.turtle.points = 8;
                FishTypes.tire.points = -5;
                this.updateLabels();
            } else if (this.secretVisible && this.selected === this.labels.length) {
                // Fietsband-optie: alleen instelling wijzigen
                settings.allowTire = !settings.allowTire;
                this.updateLabels();
            } else if (this.secretVisible && this.selected === this.labels.length + 1) {
                // Punten onder nul-optie
                settings.allowNegativeScore = !settings.allowNegativeScore;
                this.updateLabels();
            } else {
                if (this.options[this.selected] === "Reset") {
                    settings.reset();
                    // Reset visscores ook
                    FishTypes.smallFishBlue.points = 1;
                    FishTypes.smallFishCyan.points = 1;
                    FishTypes.smallFishGreen.points = 1;
                    FishTypes.smallFishPink.points = 1;
                    FishTypes.lavenderFish.points = 3;
                    FishTypes.redFish.points = 3;
                    FishTypes.turtle.points = 8;
                    FishTypes.tire.points = -5;
                    this.updateLabels();
                }
                if (this.options[this.selected] === "Terug") {
                    this.onBack();
                }
                if (this.options[this.selected] === "Score aanpassen") {
                    this.engine.currentScene.clear();
                    this.engine.add(new FishScoreMenu(this.engine, () => this.engine.showOptions()));
                    this.engine.inputCooldown = 50;
                    return;
                }
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