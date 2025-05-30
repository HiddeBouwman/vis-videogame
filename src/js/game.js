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
import { highscoreManager } from './highscores.js';


class GameState {
    #score = 0;
    #score2 = 0;
    #timer = 0;
    #elapsedMs = 0;
    #gameState = "menu";
    #gamemode = "versus";
    #timerLabel = null;
    #scoreLabel = null;
    #scoreLabel2 = null;
    #scoreGoalLabel = null;
    #singleTimeLabel = null;
    #elapsedTimeLabel = null;

    constructor() {
        this.reset();
    }

    // alle instellingen worden alvast geinitialiseerd
    reset() {
        this.#score = 0;
        this.#score2 = 0;
        this.#timer = 0;
        this.#elapsedMs = 0;
        this.#gameState = "menu";
        this.#gamemode = "versus";
        this.#timerLabel = null;
        this.#scoreLabel = null;
        this.#scoreLabel2 = null;
        this.#scoreGoalLabel = null;
        this.#singleTimeLabel = null;
        this.#elapsedTimeLabel = null;
    }

    get score() { return this.#score; }
    set score(val) { this.#score = val; }
    get score2() { return this.#score2; }
    set score2(val) { this.#score2 = val; }
    get timer() { return this.#timer; }
    set timer(val) { this.#timer = val; }
}


export class Game extends Engine {

    frameCounter // moest van Erik

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
        
        // this.showDebug(true)
        
        this.start(ResourceLoader).then(() => this.showMenu()) // Start het laden van resources, toont daarna het hoofdmenu

        // Alle variabelen worden alvast geinitialiseerd
        this.bobber = null;
        this.frameCounter = 0; // Telt frames op, heeft te maken met het spawnen van de Shadowfish*
        this.shadowfishCount = 3; // Leugen
        this.spawnedShadowfish = 0;
        this.inputCooldown = 0; // Inputcooldown is op sommige plekken nodig, omdat je anders met 1 klik meerdere menu knoppen tegelijkertijd doet aangezien er geen laadschermen zijn
        this.state = new GameState();
        this.scoreManager = new ScoreManager();
    }

    // Dat gebeuren over de input cooldown wat ik als het goed is al uitgelegd heb
    onPreUpdate(engine, delta) {
        if (this.inputCooldown > 0) {
            this.inputCooldown -= delta;
            if (this.inputCooldown < 0) this.inputCooldown = 0;
        }
    }

    // Toont het hoofdmenu van het spel, en reset de gamestate
    showMenu() {
        this.currentScene.clear();
        this.state.reset(); // Reset alle state
        this.state.gameState = "menu";
        this._lastTime = null;
        this.inputCooldown = 50; // 50 milliseconden cooldown, anders zou je als je op de terug knop klikt gelijk in het singleplayer of versus keuzescherm terecht komen.

        // Gebruik MenuBackground
        const bg = new MenuBackground();
        this.add(bg);

        // Voeg het logo toe
        const logo = new Logo();
        this.add(logo);

        // Maakt het hoofdmenu aan en voegt het toe
        this.menu = new MainMenu(
            this,
            () => this.showModeSelect(), // gaat naar modus selectie
            () => this.showOptions(), // Gaat naar opties
            () => this.showScores() // Gaat naar scores
        );
        this.add(this.menu);
    }

    // Brengt je naar het opties / instellingen scherm, en zet de gamestate op "options"
    showOptions() {
        this.currentScene.clear();
        this.state.gameState = "options";
        this._lastTime = null;
        this.timer = 0;
        this.inputCooldown = 300;

        // Gebruik OptionsBackground
        const bg = new OptionsBackground();
        this.add(bg);

        // Maakt het opties menu aan en voegt het toe
        this.optionsMenu = new OptionsMenu(this, () => this.showMenu());
        this.add(this.optionsMenu);
    }

    // toont het score overzicht
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

    // Toont het scherm waar je de singleplayer of versus modus kiest.
    showModeSelect() {
        this.currentScene.clear();
        this.inputCooldown = 50;
        const bg = new MenuBackground();
        this.add(bg);
        const logo = new Logo();
        this.add(logo);

        this.modeMenu = new ModeSelectMenu(
            this,
            () => { this.gamemode = "single"; this.startGame(); }, // start singleplayer
            () => { this.gamemode = "versus"; this.startGame(); }, // start verus
            () => this.showMenu() // Terug naar het hoofdmenu
        );
        this.add(this.modeMenu);
    }



    // Start het spel, zet de gamestate op "game"
    startGame() {
        this.currentScene.clear();
        this.state.gameState = "game";
        this.bobber = null;
        this.bobber2 = null;

        let bg = new BackgroundImage();
        this.add(bg);
        

        // Onzichtbare muren, ik wou het om een of andere reden zo doen in plaats van door lijnen te tekenen.
        
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


        // Voegt de spelers cursors toe
        let cursor = new Cursor()
        this.add(cursor)
        this.cursor = cursor;

        if (this.gamemode === "versus") {
            let cursor2 = new Cursor(true); // true = speler 2
            this.add(cursor2);
            this.cursor2 = cursor2;
        }
        
        // Voegt de geanimeerde sterren toe aan de game achtergrond
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


        // Zet scores en labels klaar
        this.state.score = 0;
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
            this.state.score2 = 0;
            this.scoreLabel2 = new Label({
                text: `Score 2: 0`,
                pos: new Vector(this.drawWidth - 300, 20),
                font: Resources.PixelFont.toFont({
                    unit: FontUnit.Px,
                    size: 20,
                    color: Color.Yellow
                }),
                anchor: new Vector(1, 0)
            });
            this.add(this.scoreLabel2);
            this.scoreLabel2.text = `Score 2: 0`;
        } else {
            this.state.score2 = 0;
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
                this.scoreGoalLabel = new Label({
                    text: `Doel: ${settings.scoreGoal} punten`,
                    pos: new Vector(this.drawWidth - 300, 50),
                    font: Resources.PixelFont.toFont({
                        unit: FontUnit.Px,
                        size: 18,
                        color: Color.White
                    }),
                    anchor: new Vector(1, 0)
                });
                this.add(this.scoreGoalLabel);

                this.elapsedTimeLabel = null;
            }
        }
        this.elapsedMs = 0;
    }

    /* Wordt elke frame aangeroepen na het updaten van de game logica,
       Regelt het spawnen van de shadowfish, de timer of de scoregoal, en checkt of het spel moet eindigen. */ 
    onPostUpdate(engine) {
        if (this.state.gameState !== "game") return;
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

        // Timer functionaliteit, hier heb ik voornamelijk chatGPT / Copilot voor gebruikt
        if (settings.mode === "timer") { // Als spelmodus = timer

            // Ik heb geen idee wat dit allemaal betekent
            if (!this._lastTime) this._lastTime = Date.now();
            let now = Date.now();
            let deltaSec = (now - this._lastTime) / 1000;
            this._lastTime = now;
            this.timer -= deltaSec;

            // Als timer kleiner dan 0 dan timer is 0
            if (this.timer < 0) this.timer = 0;

            // Als label van timer er is gaat die de timer tekst plaatsen. 
            if (this.timerLabel) {
                this.timerLabel.text = `Tijd: ${Math.ceil(this.timer)}`;
            }

            // dit moet omdat ik dit pas naderhand had bedacht en moest toen haastig toevoegen, kon efficiënter
            if (this.gamemode === "single" && this.singleTimeLabel) {
                this.singleTimeLabel.text = `Tijd: ${Math.ceil(this.timer)}`;
            }
            if (this.timer <= 0) {
                this.endGame();
            }
        }

        // Scoregoal functionaliteit, hier heb ik ook voornamelijk chatGPT / Copilot voor gebruitk
        if (settings.mode === "score") {
            if (this.gamemode === "versus" && this.scoreGoalLabel && this.elapsedTimeLabel) {
                if (!this._lastTime) this._lastTime = Date.now();
                let now = Date.now();
                let deltaMs = now - this._lastTime;
                this._lastTime = now;
                this.elapsedMs += deltaMs;
                this.scoreGoalLabel.text = `Doel: ${settings.scoreGoal} punten`;
                this.elapsedTimeLabel.text = `Tijd: ${(this.elapsedMs / 1000).toFixed(2)}s`;
                if (this.state.score >= settings.scoreGoal || this.state.score2 >= settings.scoreGoal) {
                    this.endGame();
                }
            } else if (this.gamemode === "single" && this.singleTimeLabel) {
                if (!this._lastTime) this._lastTime = Date.now();
                let now = Date.now();
                let deltaMs = now - this._lastTime;
                this._lastTime = now;
                this.elapsedMs += deltaMs;
                
                this.singleTimeLabel.text = `Tijd: ${(this.elapsedMs / 1000).toFixed(2)}s`;
                if (this.state.score >= settings.scoreGoal) {
                    this.endGame();
                }
            }
        }
    }

    // punten toekennen aan speler 1
    addScore(points = 1) {
        if (settings.allowNegativeScore) {
            this.state.score += points;
        } else {
            this.state.score = Math.max(0, this.state.score + points); // je kan geen minpunten hebben, tenzij deze geheime setting aanstaat.
        }
        this.scoreLabel.text = `Score: ${this.state.score}`;
    }

    // punten toekennen aan speler 2
    addScorePlayer2(points = 1) {
        if (settings.allowNegativeScore) {
            this.state.score2 += points;
        } else {
            this.state.score2 = Math.max(0, this.state.score2 + points);
        }
        this.scoreLabel2.text = `Score 2: ${this.state.score2}`;
    }

    // eindigt het spel, toont de winnar of het resultaat, slaat eventuele highscores op
    endGame() {
        this.state.gameState = "ended";

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

        // Versus: bepaal winnaar
        if (this.gamemode === "versus") {
            winnerText = "Gelijkspel!";
            if (this.state.score > this.state.score2) winnerText = "Speler 1 wint!";
            else if (this.state.score2 > this.state.score) winnerText = "Speler 2 wint!";
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
        // Singleplayer: toon resultaat
            if (settings.mode === "timer") {
                // Toon behaalde score
                resultLabel = new Label({
                    text: `Score: ${this.state.score}`,
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
            if (this.state.score >= settings.scoreGoal || this.state.score2 >= settings.scoreGoal) {
                highscoreManager.addFastestTime(Math.floor(this.elapsedMs));
            }
        } else {
            // Hoogste score opslaan
            let eindscore = Math.max(this.state.score, this.state.score2);
            if (eindscore > 0) {
                highscoreManager.addHighScore(eindscore);
            }
        }

        // Laagste score opslaan (???)
        if (settings.allowNegativeScore) {
            let minscore = Math.min(this.state.score, this.state.score2);
            highscoreManager.addLowestScore(minscore);
        }

        // Ga na 4 seconden terug naar het hoofdmenu
        setTimeout(() => {
            this.showMenu();
        }, 4000);
    }
}

class ScoreManager {
    #score = 0;
    #score2 = 0;

    reset() {
        this.#score = 0;
        this.#score2 = 0;
    }
    addScore(points = 1) { this.#score += points; }
    addScorePlayer2(points = 1) { this.#score2 += points; }

    get score() { return this.#score; }
    get score2() { return this.#score2; }
}

new Game()