import { Resources } from "./resources.js";
import { Vector, Actor, Color, CollisionType, Keys } from "excalibur";
import { Bobber } from './bobber-top-p2.js';
import { cursorGroup } from "./collisiongroups.js"

export class Cursor2 extends Actor {
    constructor() {
        super({
            width: 48, height: 20, CollisionType: CollisionType.Active, //collisionGroup: cursorGroup
        });
        this.graphics.use(Resources.CursorPlayer2.toSprite());
        this.scale = new Vector(1, 1);
        this.pos = new Vector(280, 448);
        this.vel = new Vector(0, 0);
        this.bobberOut = false;

        this.collider.useBoxCollider(48, 20);
    }

    onInitialize(engine) {
        this.engine = engine;
    }

    onPostUpdate(engine) {
        let xspeed = 0;
        let yspeed = 0;
        // Alleen pijltjestoetsen voor speler 2
        if (engine.input.keyboard.isHeld(Keys.Left) && !this.bobberOut) {
            xspeed -= 375;
        }
        if (engine.input.keyboard.isHeld(Keys.Right) && !this.bobberOut) {
            xspeed += 375;
        }
        if (engine.input.keyboard.isHeld(Keys.Up) && !this.bobberOut) {
            yspeed -= 175;
        }
        if (engine.input.keyboard.isHeld(Keys.Down) && !this.bobberOut) {
            yspeed += 175;
        }

        this.vel = new Vector(xspeed, yspeed);

        // Alleen spatie voor bobber
        if (engine.input.keyboard.wasPressed(Keys.ShiftRight)) {
            if (!this.bobberOut) {
                if (!engine.bobber2) {
                    const bobber = new Bobber(this.pos.clone().add(new Vector(0, -6)));
                    engine.add(bobber);
                    engine.bobber2 = bobber;
                }
                this.bobberOut = true;
                this.scale = new Vector(0, 0);
            } else {
                if (engine.bobber2) {
                    engine.bobber2.kill();
                    engine.bobber2 = null;
                }
                this.bobberOut = false;
                this.scale = new Vector(1, 1);
            }
        }
    }
}