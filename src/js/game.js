import '../css/style.css'
import { Actor, Engine, Vector, DisplayMode, Label, FontUnit, Color, SolverStrategy } from "excalibur"
import { Resources, ResourceLoader } from './resources.js'
import { BackgroundImage, animatedStar1, animatedStar2 } from './background.js'
import { Cursor } from './cursor.js'
import { Cursor2 } from './cursor2.js'
import { Bobber } from './bobber-top.js'
import { WaterBoundary } from './water-boundary.js'
// import { Bobber_Bottom } from './bobber-bottom.js'
// import { Fish } from './fish.js'
// import { Shark } from './shark.js'
import { ShadowFish } from './shadowfish.js'


export class Game extends Engine {

    constructor() {
        super({
            width: 640,
            height: 480,
            maxFps: 48,
            physics: {
                solver: SolverStrategy.Arcade,
                gravity: new Vector(0, 800),
            },
            displayMode: DisplayMode.FitScreen
        })
        
        this.showDebug(true)
        
        this.start(ResourceLoader).then(() => this.startGame())
        this.bobber = null;
    }

    startGame() {

        let bg = new BackgroundImage();
        this.add(bg);

        const shadowfishCount = 3;
        let spawned = 0;

        const spawnShadowFish = () => {
            if (spawned < shadowfishCount) {
                let shadowfish = new ShadowFish();
                this.add(shadowfish);
                spawned++;
                // Pas de vertraging aan (hier 1 seconde = 1000 ms)
                setTimeout(spawnShadowFish, 1000);
            }
        };

        // Start het spawnen van shadowfish
        spawnShadowFish();
        
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
        this.add(new WaterBoundary(-30, 430, 30, 50));


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
        this.add(new WaterBoundary(640, 450, 50, 30));


        let cursor = new Cursor()
        this.add(cursor)

        let cursor2 = new Cursor2();
        this.add(cursor2);

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


        this.score = 0
        this.scoreLabel = new Label({
            text: `Score: 0`,
            pos: new Vector(100, 0),
            font: Resources.PixelFont.toFont({
                unit: FontUnit.Px,
                size: 20,
                color: Color.White
            })
        })
        this.add(this.scoreLabel)
        this.scoreLabel.text = `Score: 0`
    }
    addScore(points = 1) {
    this.score += points;
    this.scoreLabel.text = `Score: ${this.score}`;
}

}

new Game()