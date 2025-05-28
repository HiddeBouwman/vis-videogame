import { Resources } from "./resources.js";
import { Vector, Actor, Color, CollisionType, Keys } from "excalibur";
import { Bobber as Bobber1 } from './bobber-top.js';
import { Bobber as Bobber2 } from './bobber-top-p2.js';
import { cursorAndShadowFishGroup } from "./collisiongroups.js"

export class Cursor extends Actor {
    /**
     * @param {boolean} isPlayer2 - true voor speler 2, false voor speler 1
     */
    constructor(isPlayer2 = false) {
        super({
            width: 48,
            height: 20,
            collisionType: CollisionType.Active,
            collisionGroup: cursorAndShadowFishGroup,
            z: 0,
        });
        this.isPlayer2 = isPlayer2;
        this.graphics.use(isPlayer2 ? Resources.CursorPlayer2.toSprite() : Resources.Cursor.toSprite());
        this.scale = new Vector(1, 1);
        this.pos = isPlayer2 ? new Vector(360, 448) : new Vector(280, 448);
        this.vel = new Vector(0, 0);
        this.bobberOut = false;
        this.collider.useBoxCollider(48, 20);
    }

    onInitialize(engine) {
        this.engine = engine;
        if (engine.gamemode === "single" && !this.isPlayer2) {
            this.pos = new Vector(320, 448);
        } else if (!this.isPlayer2) {
            this.pos = new Vector(280, 448);
        } else {
            this.pos = new Vector(360, 448);
        }
    }

    onPostUpdate(engine) {
        let xspeed = 0;
        let yspeed = 0;

        if (this.isPlayer2) {
            // Speler 2: pijltjestoetsen
            if (engine.input.keyboard.isHeld(Keys.Left) && !this.bobberOut) xspeed -= 375;
            if (engine.input.keyboard.isHeld(Keys.Right) && !this.bobberOut) xspeed += 375;
            if (engine.input.keyboard.isHeld(Keys.Up) && !this.bobberOut) yspeed -= 175;
            if (engine.input.keyboard.isHeld(Keys.Down) && !this.bobberOut) yspeed += 175;
        } else {
            // Speler 1: WASD
            if (engine.input.keyboard.isHeld(Keys.A) && !this.bobberOut) xspeed -= 375;
            if (engine.input.keyboard.isHeld(Keys.D) && !this.bobberOut) xspeed += 375;
            if (engine.input.keyboard.isHeld(Keys.W) && !this.bobberOut) yspeed -= 175;
            if (engine.input.keyboard.isHeld(Keys.S) && !this.bobberOut) yspeed += 175;
        }

        this.vel = new Vector(xspeed, yspeed);

        // Bobber controls
        if (this.isPlayer2) {
            // Speler 2: ShiftRight
            if (engine.input.keyboard.wasPressed(Keys.ShiftRight)) {
                if (!this.bobberOut) {
                    if (!engine.bobber2) {
                        const bobber = new Bobber2(this.pos.clone().add(new Vector(0, -6)));
                        engine.add(bobber);
                        engine.bobber2 = bobber;
                    }
                    this.bobberOut = true;
                    this.scale = new Vector(0, 0);
                } else {
                    if (engine.bobber2 && typeof engine.bobber2.reelIn === "function") {
                        engine.bobber2.reelIn();
                    }
                    this.bobberOut = false;
                    this.scale = new Vector(1, 1);
                }
            }
        } else {
            // Speler 1: Q/E/Z/X/C/V
            if (
                engine.input.keyboard.wasPressed(Keys.Q) ||
                engine.input.keyboard.wasPressed(Keys.E) ||
                engine.input.keyboard.wasPressed(Keys.Z) ||
                engine.input.keyboard.wasPressed(Keys.X) ||
                engine.input.keyboard.wasPressed(Keys.C) ||
                engine.input.keyboard.wasPressed(Keys.V)
            ) {
                if (!this.bobberOut) {
                    if (!engine.bobber) {
                        const bobber = new Bobber1(this.pos.clone().add(new Vector(0, -6)));
                        engine.add(bobber);
                        engine.bobber = bobber;
                    }
                    this.bobberOut = true;
                    this.scale = new Vector(0, 0);
                } else {
                    if (engine.bobber && typeof engine.bobber.reelIn === "function") {
                        engine.bobber.reelIn();
                    }
                    this.bobberOut = false;
                    this.scale = new Vector(1, 1);
                }
            }
        }
    }
}