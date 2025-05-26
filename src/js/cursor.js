import { Resources } from "./resources.js";
import { Vector, Actor, Color, CollisionType, Keys } from "excalibur";
import { Bobber } from './bobber-top.js'
import { cursorGroup } from "./collisiongroups.js"

export class Cursor extends Actor {
    constructor() {
        super({
            width: 48, height: 20, CollisionType: CollisionType.Active, //collisionGroup: cursorGroup,
        });
        this.graphics.use(Resources.Cursor.toSprite());
        this.scale = new Vector(1, 1);
        this.pos = new Vector(360, 448);
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
        // Alleen WASD voor speler 1
        if (engine.input.keyboard.isHeld(Keys.A) && !this.bobberOut) {
            xspeed -= 375;
        }
        if (engine.input.keyboard.isHeld(Keys.D) && !this.bobberOut) {
            xspeed += 375;
        }
        if (engine.input.keyboard.isHeld(Keys.W) && !this.bobberOut) {
            yspeed -= 175;
        }
        if (engine.input.keyboard.isHeld(Keys.S) && !this.bobberOut) {
            yspeed += 175;
        }

        this.vel = new Vector(xspeed, yspeed);

        // Alleen X voor bobber
        if (engine.input.keyboard.wasPressed(Keys.E)) {
            if (!this.bobberOut) {
                if (!engine.bobber) {
                    const bobber = new Bobber(this.pos.clone().add(new Vector(0, -6)));
                    engine.add(bobber);
                    engine.bobber = bobber;
                }
                this.bobberOut = true;
                this.scale = new Vector(0, 0);
            } else {
                if (engine.bobber) {
                    engine.bobber.kill();
                    engine.bobber = null;
                }
                this.bobberOut = false;
                this.scale = new Vector(1, 1);
            }
        }
    }
}