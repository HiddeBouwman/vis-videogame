import { Actor, Color, Vector, Label, FontUnit, Keys } from "excalibur";
import { Resources } from "./resources.js";
import { highscoreManager } from './highscores.js';
import { settings } from './settings.js';

// regelt selectie van labels
class BaseMenu extends Actor {
    constructor() {
        super();
        this.labels = [];
        this.selected = 0;
    }
    // zet het geselecteerde label op geel, alle andere wit.
    updateSelection() {
        this.labels.forEach((label, i) => {
            label.color = (i === this.selected) ? Color.Yellow : Color.White;
        });
    }
}

export class MainMenu extends BaseMenu {
    constructor(engine, onPlay, onOptions, onScores) {
        super();
        this.engine = engine;
        this.onPlay = onPlay; // callback voor starten spel
        this.onOptions = onOptions; // callback voor opties menu
        this.onScores = onScores; // callback voor scores menu
    }

    onInitialize(engine) {
        // Knoppen
        const playLabel = new Label({
            text: "SPELEN",
            pos: new Vector(175, 300),
            font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 48, color: Color.White }),
            anchor: new Vector(0.5, 0.5)
        });
        const optionsLabel = new Label({
            text: "OPTIES",
            pos: new Vector(175, 360),
            font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 48, color: Color.White }),
            anchor: new Vector(0.5, 0.5)
        });
        const scoresLabel = new Label({
            text: "SCORES",
            pos: new Vector(250, 420),
            font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 24, color: Color.White }),
            anchor: new Vector(0.5, 0.5)
        });
        this.addChild(playLabel);
        this.addChild(optionsLabel);
        this.addChild(scoresLabel);
        this.labels = [playLabel, optionsLabel, scoresLabel];
        this.updateSelection();
    }

    onPreUpdate(engine) {
        if (engine.inputCooldown > 0) return;

        if (engine.input.keyboard.wasPressed(Keys.W) || engine.input.keyboard.wasPressed(Keys.Up)) {
            this.selected = (this.selected + this.labels.length - 1) % this.labels.length;
            this.updateSelection();
        }
        if (engine.input.keyboard.wasPressed(Keys.S) || engine.input.keyboard.wasPressed(Keys.Down)) {
            this.selected = (this.selected + 1) % this.labels.length;
            this.updateSelection();
        }
        if (engine.input.keyboard.wasPressed(Keys.Space) || engine.input.keyboard.wasPressed(Keys.Enter)) {
            if (this.selected === 0) this.onPlay();
            if (this.selected === 1) this.onOptions();
            if (this.selected === 2 && this.onScores) this.onScores();
        }
    }
}

export class ScoresMenu extends BaseMenu {
    constructor(engine, onBack) {
        super();
        this.engine = engine;
        this.onBack = onBack;
        this.labels = [];
        // "score" of "time" of "lowest"
        this.selectedType = settings.scoreboardType || "score";
    }

    onInitialize(engine) {
        this.titleLabel = new Label({
            text: "",
            pos: new Vector(30, 70),
            font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 32, color: Color.Yellow }),
            anchor: new Vector(0.5, 0.5)
        });
        this.addChild(this.titleLabel);

        this.scoreLabels = [];
        for (let i = 0; i < 5; i++) {
            const label = new Label({
                text: "",
                pos: new Vector(30, 140 + i * 40),
                font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
                anchor: new Vector(0.5, 0.5)
            });
            this.addChild(label);
            this.scoreLabels.push(label);
        }

        this.terugLabel = new Label({
            text: "TERUG",
            pos: new Vector(250, 420),
            font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
            anchor: new Vector(0.5, 0.5)
        });
        this.addChild(this.terugLabel);

        this.updateScores();
    }

    updateScores() {
        if (this.selectedType === "score") {
            this.titleLabel.text = "< HOOGSTE SCORES >";
            const scores = highscoreManager.getHighScores();
            for (let i = 0; i < 5; i++) {
                const score = scores[i] !== undefined ? scores[i] : "-";
                this.scoreLabels[i].text = `${i + 1}. ${score}`;
            }
        } else if (this.selectedType === "lowest") {
            this.titleLabel.text = "< LAAGSTE SCORES >";
            const lows = highscoreManager.getLowestScores();
            for (let i = 0; i < 5; i++) {
                const score = lows[i] !== undefined ? lows[i] : "/";
                this.scoreLabels[i].text = `${i + 1}. ${score}`;
            }
        } else {
            this.titleLabel.text = "< SNELSTE TIJDEN >";
            const times = highscoreManager.getFastestTimes();
            for (let i = 0; i < 5; i++) {
                if (typeof times[i] === "number") {
                    // Zet ms om naar seconden met 2 decimalen
                    const sec = (times[i] / 1000).toFixed(2);
                    this.scoreLabels[i].text = `${i + 1}. ${sec}s`;
                } else {
                    this.scoreLabels[i].text = `${i + 1}. -`;
                }
            }
        }
        this.terugLabel.color = Color.Yellow;
    }

    onPreUpdate(engine) {
        if (engine.inputCooldown > 0) return;
        // Wissel tussen score/tijd/laagste
        // Dit menu is gebugged.
        if (
            engine.input.keyboard.wasPressed(Keys.A) ||
            engine.input.keyboard.wasPressed(Keys.Left) ||
            engine.input.keyboard.wasPressed(Keys.D) ||
            engine.input.keyboard.wasPressed(Keys.Right)
        ) {
            if (settings.allowNegativeScore) {
                // Rechts: score > lowest > time
                if (engine.input.keyboard.wasPressed(Keys.D) || engine.input.keyboard.wasPressed(Keys.Right)) {
                    if (this.selectedType === "score") this.selectedType = "lowest";
                    else if (this.selectedType === "lowest") this.selectedType = "time";
                    else this.selectedType = "score";
                }
                // Links: score > time > lowest
                else if (engine.input.keyboard.wasPressed(Keys.A) || engine.input.keyboard.wasPressed(Keys.Left)) {
                    if (this.selectedType === "score") this.selectedType = "time";
                    else if (this.selectedType === "time") this.selectedType = "lowest";
                    else this.selectedType = "score";
                }
            } else {
                // Alleen score en tijd
                this.selectedType = this.selectedType === "score" ? "time" : "score";
            }
            settings.scoreboardType = this.selectedType;
            this.updateScores();
        }
        if (engine.input.keyboard.wasPressed(Keys.Space) || engine.input.keyboard.wasPressed(Keys.Enter)) {
            this.onBack();
        }
    }
}

export class ModeSelectMenu extends BaseMenu {
    constructor(engine, onSingle, onVersus, onBack) {
        super();
        this.engine = engine;
        this.onSingle = onSingle;
        this.onVersus = onVersus;
        this.onBack = onBack;
        this.selected = 1; // 0 = single, 1 = versus (standaard)
        this.labels = [];
    }

    onInitialize(engine) {
        const singleLabel = new Label({
            text: "SINGLEPLAYER",
            pos: new Vector(80, 300),
            font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 40, color: Color.White }),
            anchor: new Vector(0.5, 0.5)
        });
        const versusLabel = new Label({
            text: "VERSUS",
            pos: new Vector(200, 360),
            font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 40, color: Color.White }),
            anchor: new Vector(0.5, 0.5)
        });
        const terugLabel = new Label({
            text: "TERUG",
            pos: new Vector(245, 420),
            font: Resources.PixelFont.toFont({ unit: FontUnit.Px, size: 28, color: Color.White }),
            anchor: new Vector(0.5, 0.5)
        });
        this.addChild(singleLabel);
        this.addChild(versusLabel);
        this.addChild(terugLabel);
        this.labels = [singleLabel, versusLabel, terugLabel];
        this.updateSelection();
    }

    onPreUpdate(engine) {
        if (engine.inputCooldown > 0) return;
        if (engine.input.keyboard.wasPressed(Keys.W) || engine.input.keyboard.wasPressed(Keys.Up)) {
            this.selected = (this.selected + this.labels.length - 1) % this.labels.length;
            this.updateSelection();
        }
        if (engine.input.keyboard.wasPressed(Keys.S) || engine.input.keyboard.wasPressed(Keys.Down)) {
            this.selected = (this.selected + 1) % this.labels.length;
            this.updateSelection();
        }
        if (engine.input.keyboard.wasPressed(Keys.Space) || engine.input.keyboard.wasPressed(Keys.Enter)) {
            if (this.selected === 0) this.onSingle();
            if (this.selected === 1) this.onVersus();
            if (this.selected === 2) this.onBack();
        }
    }
}