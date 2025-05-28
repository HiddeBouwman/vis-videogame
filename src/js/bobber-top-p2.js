import { Resources } from "./resources.js";
import { Vector, Actor, Keys, CollisionType } from "excalibur";
import { Bobber_Bottom } from './bobber-bottom.js'
// import { cursorAndShadowFishGroup } from "./collisiongroups.js"

export class Bobber extends Actor {
    constructor(startPos = new Vector(320, 320)) {
        super({ 
            width: 48, 
            height: 48, 
            collisionType: CollisionType.Active,
            z: 1
        });
        this.graphics.use(Resources.Bobber_Top_P2.toSprite());
        this.scale = new Vector(1, 1);
        this.pos = startPos.clone();
        this.basePos = startPos.clone();
        this.vel = new Vector(0, 0);

        this.floatTime = 0;
        this.floatDuration = 1.2;
        this.floatAmplitude = 1;
        this.bobberBottom = null;

        this.timer = 0;
        this.caughtFish = [];
        this.bobberOut = false;

        this._bounced = false;
        this._bounceAnim = null; // { time: 0, duration: 0.35, phase: 0 }
    }

    onInitialize(engine) {
        const bottompart = new Bobber_Bottom();
        bottompart.pos = new Vector(0, 0);
        bottompart.z = -1;
        this.addChild(bottompart);
        this.bobberBottom = bottompart;

        this.body.collisionType = CollisionType.Fixed;
        this.collider.useCircleCollider(18, new Vector(0, 5));

        this.on("collisionstart", (event) => {
            const fish = event.other.owner;
            if (
                fish &&
                fish.constructor.name === "SurfacedFish" &&
                !this._bounced
            ) {
                this._bounced = true;
                this._bounceAnim = { time: 0, duration: 0.35, phase: 0 }; // 0.35 seconde animatie
            }
            if (
                fish &&
                fish.constructor.name === "SurfacedFish" &&
                !this.caughtFish.includes(fish)
            ) {
                this.caughtFish.push(fish);
            }
        });
    }

    onPreUpdate(engine, delta) {
        this.floatTime += delta / 2000;
        const t = (this.floatTime % this.floatDuration) / this.floatDuration;
        const offset = Math.sin(t * Math.PI * 2) * this.floatAmplitude;

        // Bounce animatie
        let bounceOffset = 0;
        if (this._bounceAnim) {
            this._bounceAnim.time += delta / 1000;
            const progress = this._bounceAnim.time / this._bounceAnim.duration;
            if (progress < 1) {
                bounceOffset = Math.sin(progress * Math.PI) * 5; // max 12px omlaag
            } else {
                this._bounceAnim = null;
                this._bounced = false;
            }
        }

        this.pos.y = this.basePos.y + offset + bounceOffset;

        let targetScale = offset > 0 ? new Vector(1.15, 1.15) : new Vector(1, 1);
        const lerpSpeed = 0.05 * (delta / 16.67);

        if (this.bobberBottom) {
            let current = this.bobberBottom.scale;
            let newScale = new Vector(
                current.x + (targetScale.x - current.x) * lerpSpeed,
                current.y + (targetScale.y - current.y) * lerpSpeed
            );
            this.bobberBottom.scale = newScale;
        }
        this.timer += delta / 1000;

        if (engine.input.keyboard.wasPressed(Keys.E)) {
            if (!this.bobberOut) {
            } else {
                if (engine.bobber2 && typeof engine.bobber2.reelIn === "function") {
                    engine.bobber2.reelIn();
                }
                this.bobberOut = false;
            }
        }
    }

    reelIn() {
        if (!this.scene) return; // Stop als de dobber niet meer in een scene zit
        for (const actor of this.scene.actors) {
            if (
                actor.constructor.name === "SurfacedFish" &&
                actor !== this &&
                actor.pos &&
                this.pos &&
                Math.abs(actor.pos.x - this.pos.x) < 28 &&
                Math.abs(actor.pos.y - this.pos.y) < 28
            ) {
                if (!this.caughtFish.includes(actor)) {
                    this.caughtFish.push(actor);
                }
            }
        }
        for (const fish of this.caughtFish) {
            if (fish && typeof fish.tryCatch === "function") {
                fish.tryCatch(true);
            }
        }
        this.caughtFish = [];
        this.kill();
        if (this.scene && this.scene.engine) {
            this.scene.engine.bobber2 = null;
            if (this.scene.engine.cursor2) this.scene.engine.cursor2.scale = new Vector(1, 1);
        }
    }
}