import '../css/style.css'
import { Engine, Vector, DisplayMode, SolverStrategy, Label, Color, FontUnit, Actor } from "excalibur"
import { Resources, ResourceLoader } from './resources.js'
import { MainMenu, ScoresMenu, ModeSelectMenu } from './menu.js'
import { OptionsMenu } from './options.js'
import { settings } from './settings.js'
import { MenuBackground, OptionsBackground, Logo, BackgroundImage, animatedStar1, animatedStar2 } from './background.js'
import { Cursor } from './cursor.js'
import { WaterBoundary } from './water-boundary.js'
import { ShadowFish } from './shadowfish.js'
import { addHighScore, addFastestTime } from './highscores.js';


export class Game extends Engine {

    frameCounter

    constructor() {
        super({
            width: 640,
            height: 480,
            maxFps: 48,
            physics: {
                solver: SolverStrategy.Arcade,
                gravity: new Vector(0, 0),
            },
            displayMode: DisplayMode.FitScreen
        })
        
        //this.showDebug(true)
        
        this.start(ResourceLoader).then(() => this.showMenu())
        this.bobber = null;
        this.frameCounter = 0;
        this.shadowfishCount = 3;
        this.spawnedShadowfish = 0;
        this.gameState = "menu";
        this.timer = 0;
        this.timerLabel = null;
        this.scoreGoalLabel = null;
        this.inputCooldown = 0; // <-- nieuw
        this.gamemode = "versus"; // standaard
    }

    onPreUpdate(engine, delta) {
        if (this.inputCooldown > 0) {
            this.inputCooldown -= delta;
            if (this.inputCooldown < 0) this.inputCooldown = 0;
        }
    }

    showMenu() {
        this.currentScene.clear();
        this.gameState = "menu";
        this._lastTime = null;
        this.timer = 0;
        this.inputCooldown = 50;

        // Gebruik MenuBackground
        const bg = new MenuBackground();
        this.add(bg);

        // Voeg het logo toe
        const logo = new Logo();
        this.add(logo);

        // Let op: verander hier de callback voor spelen!
        this.menu = new MainMenu(
            this,
            () => this.showModeSelect(), // <-- laat eerst het modus-selectiescherm zien
            () => this.showOptions(),
            () => this.showScores()
        );
        this.add(this.menu);
    }

    showOptions() {
        this.currentScene.clear();
        this.gameState = "options";
        this._lastTime = null;
        this.timer = 0;
        this.inputCooldown = 300;

        // Gebruik OptionsBackground
        const bg = new OptionsBackground();
        this.add(bg);

        this.optionsMenu = new OptionsMenu(this, () => this.showMenu());
        this.add(this.optionsMenu);
    }

    showScores() {
        this.currentScene.clear();
        this.inputCooldown = 300;
        const bg = new Actor({
            pos: new Vector(320, 240),
            width: 640,
            height: 480,
            z: -10
        });
        bg.graphics.use(Resources.Background.toSprite());
        this.add(bg);

        this.scoresMenu = new ScoresMenu(this, () => this.showMenu());
        this.add(this.scoresMenu);
    }

    showModeSelect() {
        this.currentScene.clear();
        this.inputCooldown = 50;
        const bg = new MenuBackground();
        this.add(bg);
        const logo = new Logo();
        this.add(logo);

        this.modeMenu = new ModeSelectMenu(
            this,
            () => { this.gamemode = "single"; this.startGame(); },
            () => { this.gamemode = "versus"; this.startGame(); },
            () => this.showMenu()
        );
        this.add(this.modeMenu);
    }

    startGame() {
        this.currentScene.clear();
        this.gameState = "game";
        this.bobber = null;
        this.bobber2 = null;

        let bg = new BackgroundImage();
        this.add(bg);
        
        // Onzichtbare muren
        // Boven water
        this.add(new WaterBoundary(270, 340, 100, 50));
        

        // Onder water / onder scherm
        this.add(new WaterBoundary(0, 480, 640, 50));


        // Linker kade
        this.add(new WaterBoundary(285, 345, 10, 50));
        this.add(new WaterBoundary(260, 350, 25, 50));
        this.add(new WaterBoundary(180, 355, 80, 50));
        this.add(new WaterBoundary(150, 360, 30, 50));
        this.add(new WaterBoundary(100, 365, 50, 50));
        this.add(new WaterBoundary(135, 435, 10, 5));
        this.add(new WaterBoundary(40, 395, 95, 50));
        this.add(new WaterBoundary(0, 410, 40, 50));
        this.add(new WaterBoundary(-30, 430, 30, 100));


        // Rechter kade
        this.add(new WaterBoundary(350, 345, 70, 50));
        this.add(new WaterBoundary(415, 350, 50, 50));
        this.add(new WaterBoundary(435, 395, 50, 35));
        this.add(new WaterBoundary(410, 420, 25, 10));
        this.add(new WaterBoundary(400, 430, 70, 5));
        this.add(new WaterBoundary(450, 390, 35, 50));
        this.add(new WaterBoundary(475, 440, 5, 5));
        this.add(new WaterBoundary(480, 400, 40, 50));
        this.add(new WaterBoundary(520, 405, 40, 50));
        this.add(new WaterBoundary(560, 410, 80, 50));
        this.add(new WaterBoundary(640, 450, 50, 80));


        let cursor = new Cursor()
        this.add(cursor)
        this.cursor = cursor;

        if (this.gamemode === "versus") {
            let cursor2 = new Cursor(true); // true = speler 2
            this.add(cursor2);
            this.cursor2 = cursor2;
        }

        // let shark = new Shark()
        // this.add(shark)
        // for (let i = 0; i < 10; i++) {
            // let fish = new Fish()
            // this.add(fish)
        // }
        
        let star1 = new animatedStar1()
        this.add(star1)

        // Voeg meerdere sterren toe op verschillende plekken
        this.add(new animatedStar1(new Vector(50, 25)));
        this.add(new animatedStar1(new Vector(160, 55)));
        this.add(new animatedStar1(new Vector(300, 120)));
        this.add(new animatedStar1(new Vector(500, 80)));


        let star2 = new animatedStar2()
        this.add(star2)
        this.add(new animatedStar2(new Vector(80, 70)));
        this.add(new animatedStar2(new Vector(230, 40)));
        this.add(new animatedStar2(new Vector(380, 90)));
        this.add(new animatedStar2(new Vector(540, 50)));


        this.score = 0;
        this.scoreLabel = new Label({
            text: `Score: 0`,
            pos: new Vector(100, 20),
            font: Resources.PixelFont.toFont({
                unit: FontUnit.Px,
                size: 20,
                color: Color.Red
            })
        });
        this.add(this.scoreLabel);
        this.scoreLabel.text = `Score: 0`;

        if (this.gamemode === "versus") {
            this.score2 = 0;
            this.scoreLabel2 = new Label({
                text: `Score 2: 0`,
                pos: new Vector(this.drawWidth - 300, 20),
                font: Resources.PixelFont.toFont({
                    unit: FontUnit.Px,
                    size: 20,
                    color: Color.Yellow
                }),
                anchor: new Vector(1, 0) // Rechtsboven uitlijnen
            });
            this.add(this.scoreLabel2);
            this.scoreLabel2.text = `Score 2: 0`;
        } else {
            this.score2 = 0;
            this.scoreLabel2 = null;

            // In singleplayer: toon tijd rechtsboven waar anders score2 staat
            this.singleTimeLabel = new Label({
                text: `Tijd: 0.00s`,
                pos: new Vector(this.drawWidth - 300, 20),
                font: Resources.PixelFont.toFont({
                    unit: FontUnit.Px,
                    size: 20,
                    color: Color.White
                }),
                anchor: new Vector(1, 0)
            });
            this.add(this.singleTimeLabel);
        }

        // Timer of scoregoal label
        if (settings.mode === "timer") {
            this.timer = settings.timer;
            if (this.gamemode === "versus") {
                this.timerLabel = new Label({
                    text: `Tijd: ${this.timer}`,
                    pos: new Vector(this.drawWidth / 2.8, 40),
                    font: Resources.PixelFont.toFont({
                        unit: FontUnit.Px,
                        size: 20,
                        color: Color.White
                    }),
                    anchor: new Vector(0.5, 0)
                });
                this.add(this.timerLabel);
            } else {
                this.timerLabel = null;
            }
        } else if (settings.mode === "score") {
            if (this.gamemode === "versus") {
                this.scoreGoalLabel = new Label({
                    text: `Doel: ${settings.scoreGoal} punten`,
                    pos: new Vector(this.drawWidth / 4, 40),
                    font: Resources.PixelFont.toFont({
                        unit: FontUnit.Px,
                        size: 20,
                        color: Color.White
                    }),
                    anchor: new Vector(0.5, 0)
                });
                this.add(this.scoreGoalLabel);

                this.elapsedTimeLabel = new Label({
                    text: `Tijd: 0.00s`,
                    pos: new Vector(this.drawWidth / 4, 65),
                    font: Resources.PixelFont.toFont({
                        unit: FontUnit.Px,
                        size: 18,
                        color: Color.White
                    }),
                    anchor: new Vector(0.5, 0)
                });
                this.add(this.elapsedTimeLabel);
            } else {
                this.scoreGoalLabel = null;
                this.elapsedTimeLabel = null;
            }
        }
        this.elapsedMs = 0;
    }

    onPostUpdate(engine) {
        if (this.gameState !== "game") return;
        this.frameCounter++;
        let spawnInterval = Math.round(12 / (settings.spawnSpeed || 1));
        if (this.frameCounter > spawnInterval) {
            if (Math.random() < 0.25) {
                let shadowfish = new ShadowFish();
                this.add(shadowfish);
                this.spawnedShadowfish++;
            }
            this.frameCounter = 0;
        }

        // Timer functionaliteit
        if (settings.mode === "timer") {
            if (!this._lastTime) this._lastTime = Date.now();
            let now = Date.now();
            let deltaSec = (now - this._lastTime) / 1000;
            this._lastTime = now;
            this.timer -= deltaSec;
            if (this.timer < 0) this.timer = 0;

            if (this.timerLabel) {
                this.timerLabel.text = `Tijd: ${Math.ceil(this.timer)}`;
            }
            if (this.gamemode === "single" && this.singleTimeLabel) {
                this.singleTimeLabel.text = `Tijd: ${Math.ceil(this.timer)}`;
            }
            if (this.timer <= 0) {
                this.endGame();
            }
        }

        // Scoregoal functionaliteit
        if (settings.mode === "score") {
            if (this.gamemode === "versus" && this.scoreGoalLabel && this.elapsedTimeLabel) {
                if (!this._lastTime) this._lastTime = Date.now();
                let now = Date.now();
                let deltaMs = now - this._lastTime;
                this._lastTime = now;
                this.elapsedMs += deltaMs;
                this.scoreGoalLabel.text = `Doel: ${settings.scoreGoal} punten`;
                this.elapsedTimeLabel.text = `Tijd: ${(this.elapsedMs / 1000).toFixed(2)}s`;
                if (this.score >= settings.scoreGoal || this.score2 >= settings.scoreGoal) {
                    this.endGame();
                }
            } else if (this.gamemode === "single" && this.singleTimeLabel) {
                if (!this._lastTime) this._lastTime = Date.now();
                let now = Date.now();
                let deltaMs = now - this._lastTime;
                this._lastTime = now;
                this.elapsedMs += deltaMs;
                this.singleTimeLabel.text = `Tijd: ${(this.elapsedMs / 1000).toFixed(2)}s`;
                if (this.score >= settings.scoreGoal) {
                    this.endGame();
                }
            }
        }
    }

    addScore(points = 1) {
        this.score += points;
        this.scoreLabel.text = `Score: ${this.score}`;
    }

    addScorePlayer2(points = 1) {
        this.score2 += points;
        this.scoreLabel2.text = `Score 2: ${this.score2}`;
    }

    endGame() {
        this.gameState = "ended";

        // Stop alle vissen
        for (const actor of this.currentScene.actors) {
            if (actor.constructor && (actor.constructor.name === "ShadowFish" || actor.constructor.name === "SurfacedFish")) {
                actor.vel = new Vector(0, 0);
                actor.onPreUpdate = () => {}; // Blokkeer verdere beweging
            }
            // Stop cursors
            if (actor.constructor && (actor.constructor.name === "Cursor" || actor.constructor.name === "Cursor2")) {
                actor.vel = new Vector(0, 0);
                actor.onPreUpdate = () => {};
                actor.onPostUpdate = () => {};
            }
            // Stop bobbers
            if (actor.constructor && actor.constructor.name === "Bobber") {
                actor.vel = new Vector(0, 0);
                actor.onPreUpdate = () => {};
            }
        }

        let winnerText = "";
        let resultLabel = null;

        if (this.gamemode === "versus") {
            winnerText = "Gelijkspel!";
            if (this.score > this.score2) winnerText = "Speler 1 wint!";
            else if (this.score2 > this.score) winnerText = "Speler 2 wint!";
            if (winnerText) {
                const winLabel = new Label({
                    text: winnerText,
                    pos: new Vector(this.drawWidth / 6, this.drawHeight / 6),
                    font: Resources.PixelFont.toFont({
                        unit: FontUnit.Px,
                        size: 36,
                        color: Color.White
                    }),
                    anchor: new Vector(0.5, 0.5)
                });
                this.add(winLabel);
            }
        } else {
            // Singleplayer: toon resultaat gecentreerd en uitvergroot
            if (settings.mode === "timer") {
                // Toon behaalde score
                resultLabel = new Label({
                    text: `Score: ${this.score}`,
                    pos: new Vector(this.drawWidth / 10, this.drawHeight / 2),
                    font: Resources.PixelFont.toFont({
                        unit: FontUnit.Px,
                        size: 48,
                        color: Color.Yellow
                    }),
                    anchor: new Vector(0.5, 0.5)
                });
            } else if (settings.mode === "score") {
                // Toon verstreken tijd in seconden met 2 decimalen
                resultLabel = new Label({
                    text: `Tijd: ${(this.elapsedMs / 1000).toFixed(2)}s`,
                    pos: new Vector(this.drawWidth / 48, this.drawHeight / 2),
                    font: Resources.PixelFont.toFont({
                        unit: FontUnit.Px,
                        size: 48,
                        color: Color.Yellow
                    }),
                    anchor: new Vector(0.5, 0.5)
                });
            }
            if (resultLabel) this.add(resultLabel);
        }

        // Highscore opslaan
        if (settings.mode === "score") {
            // Snelste tijd opslaan
            if (this.score >= settings.scoreGoal || this.score2 >= settings.scoreGoal) {
                addFastestTime(Math.floor(this.elapsedMs));
            }
        } else {
            // Hoogste score opslaan
            let eindscore = Math.max(this.score, this.score2);
            if (eindscore > 0) {
                addHighScore(eindscore);
            }
        }

        setTimeout(() => {
            this.showMenu();
        }, 4000);
    }
}

new Game()