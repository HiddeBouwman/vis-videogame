import { Actor, Vector, Color, CollisionType } from "excalibur";
import { FishTypes } from "./fish-config.js";
import { Resources } from "./resources.js";
import { cursorAndShadowFishGroup } from "./collisiongroups.js";
import { SurfacedFish } from "./surfacedfish.js";
import { settings } from "./settings.js";

export class ShadowFish extends Actor {
    constructor() {
        const weightedFish = [
            "smallFishBlue", "smallFishBlue", "smallFishBlue",
            "smallFishCyan", "smallFishCyan", "smallFishCyan",
            "smallFishGreen", "smallFishGreen", "smallFishGreen",
            "smallFishPink", "smallFishPink", "smallFishPink",
            "lavenderFish", "lavenderFish",
            "redFish", "redFish",
            "turtle"
        ];
        if (settings.allowTire) {
            weightedFish.push("tire");
        }
        const randomKey = weightedFish[Math.floor(Math.random() * weightedFish.length)];
        const fishType = FishTypes[randomKey];

        super({
            width: fishType.hitbox * 2,
            height: fishType.hitbox * 2,
            pos: new Vector(320, 448),
            color: Color.Transparent,
            collisionType: CollisionType.Active,
            collisionGroup: cursorAndShadowFishGroup,
            z: -3,
        });

        this.fishType = fishType;
        this.points = fishType.points;

        this.collider.useCircleCollider(fishType.hitbox);

        // Shadow sprite
        if (fishType.sprite === "turtle") {
            this.shadowSprite = Resources.turtleShadow.toSprite();
            this._isTurtle = true;
        } else if (fishType.sprite === "tire") {
            this.shadowSprite = Resources.tireShadow.toSprite();
            this._isTurtle = false;
            this._isTire = true;
        } else if (fishType.hitbox >= 12) {
            this.shadowSprite = Resources.bigFishShadow.toSprite();
            this._isTurtle = false;
            this._isTire = false;
        } else {
            this.shadowSprite = Resources.smallFishShadow.toSprite();
            this._isTurtle = false;
            this._isTire = false;
        }
        this.graphics.use(this.shadowSprite);


        // Willekeurige doelfade opacity tussen 0.4 en 0.6
        this._targetOpacity = 0.4 + Math.random() * 0.2;
        this.graphics.opacity = 0;


        // Fade-in/fade-out
        this._fadeInDelay = 1500 + Math.random() * 500;
        this._fadeInDelayTimer = 0;
        this._fadeInTimer = 0;
        this._fadeInDuration = 500;
        this._fadingOut = false;
        this._fadeOutTimer = 0;
        this._fadeOutDuration = 300;


        // Beweging-variabelen (zoals SurfacedFish)
        this._angle = Math.random() * Math.PI * 2;
        if (fishType.sprite === "turtle") {
            this._speed = 2 + Math.random() * 6;
            this._targetSpeed = this._speed;
        } else if (fishType.sprite === "tire") {
            this._speed = 0.5 + Math.random() * 1.5; // nog langzamer dan schildpad
            this._targetSpeed = this._speed;
        } else if (fishType.hitbox >= 12) {
            this._speed = 8 + Math.random() * 16;
            this._targetSpeed = this._speed;
        } else {
            this._speed = 16 + Math.random() * 32;
            this._targetSpeed = this._speed;
        }
        this._targetAngle = this._angle;
        this._changeDirTimer = 0;
        this._changeDirInterval = 0 + Math.random() * 1000;

        this._usingFishSprite = false;


        // Voor transitie naar surfacedFish
        this._moveTimer = 0;
        this._moveDuration = 3000 + Math.random() * 2000; // 3-5 seconden zichtbaar
        this._futureFishType = fishType;
    }



    onPreUpdate(engine, delta) {
        // Fade-out logica bij te veel bounces (bounces feature heb ik weggehaald omdat het niet pastte bij de rest van de gameplay)
        if (this._fadingOut) {
            this._fadeOutTimer += delta;
            let alpha = Math.max(0, this.graphics.opacity - (delta / this._fadeOutDuration) * this._targetOpacity);
            this.graphics.opacity = alpha;
            if (this._fadeOutTimer >= this._fadeOutDuration) {
                this.kill();
            }
            return;
        }


        // Bepaal of we in de "vlugge" onzichtbare fase zitten
        const isInvisible = this._fadeInDelayTimer < this._fadeInDelay;


        // Fade-in delay
        if (isInvisible) {
            this._fadeInDelayTimer += delta;
            this.graphics.opacity = 0;
            // Supersnel gedrag: snelheid en draaisnelheid * 3
            this._speedMultiplier = 3;
        } else {
            // Normale fade-in en daarna
            if (this._fadeInTimer < this._fadeInDuration) {
                this._fadeInTimer += delta;
                let alpha = Math.min(1, this._fadeInTimer / this._fadeInDuration);
                this.graphics.opacity = this._targetOpacity * alpha;
            } else {
                this.graphics.opacity = this._targetOpacity;
                this._moveTimer += delta;
            }
            // Normale snelheid
            this._speedMultiplier = 1;
        }


        // --- Bewegingsgedrag van SurfacedFish hieronder ---
        this._changeDirTimer += delta;


        // Als te lang onderin (> 470), forceer korte beweging omhoog
        if (this.pos.y > 470 && this.vel.y > 0) {
            this._targetAngle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 9); // iets omhoog, beetje spreiding, wiskunde zoals gewoonlijk niet zelf gedaan
            if (this.fishType.sprite === "turtle") {
                this._targetSpeed = 2 + Math.random() * 6;
            } else if (this.fishType.sprite === "tire") {
                this._targetSpeed = 0.5 + Math.random() * 1.5;
            } else if (this.fishType.hitbox >= 12) {
                this._targetSpeed = 8 + Math.random() * 8;
            } else {
                this._targetSpeed = 16 + Math.random() * 16;
            }
            this._changeDirTimer = 0;
            this._changeDirInterval = 500 + Math.random() * 500;
        }
        // Als te lang bovenin (< 410), forceer korte beweging omlaag
        else if (this.pos.y < 410 && this.vel.y < 0) {
            this._targetAngle = Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 9); // iets omlaag, beetje spreiding
            if (this.fishType.sprite === "turtle") {
                this._targetSpeed = 2 + Math.random() * 6;
            } else if (this.fishType.sprite === "tire") {
                this._targetSpeed = 0.5 + Math.random() * 1.5;
            } else if (this.fishType.hitbox >= 12) {
                this._targetSpeed = 8 + Math.random() * 8;
            } else {
                this._targetSpeed = 16 + Math.random() * 16;
            }
            this._changeDirTimer = 0;
            this._changeDirInterval = 500 + Math.random() * 500;
        }

        if (this._changeDirTimer > this._changeDirInterval) {
            let goToBobber = false;
            let bobberPos = null;

            // Zoek een actieve dobber in het spel
            let bobber = null;
            if (engine.bobber && !engine.bobber.isKilled()) bobber = engine.bobber;
            if (engine.bobber2 && !engine.bobber2.isKilled()) {
                if (!bobber) {
                    bobber = engine.bobber2;
                } else {
                    const dist1 = this.pos.distance(engine.bobber.pos);
                    const dist2 = this.pos.distance(engine.bobber2.pos);
                    if (dist2 < dist1) bobber = engine.bobber2;
                }
            }


            // De band is nooit geïnteresseerd in de dobber, het is een fietsband
            if (this.fishType.sprite === "tire") {
                goToBobber = false;
            } else if (bobber) {
                bobberPos = bobber.pos;
                // Kans bepalen per soort
                if (this.fishType.sprite === "turtle") {
                    if (Math.random() < 0.25) goToBobber = true;
                } else if (this.fishType.hitbox >= 12) {
                    if (Math.random() < 0.75) goToBobber = true;
                } else {
                    if (Math.random() < 0.9) goToBobber = true;
                }
            }

            if (goToBobber && bobberPos) {
                // Richting naar dobber
                const toBobber = bobberPos.sub(this.pos).normalize();
                this._targetAngle = Math.atan2(toBobber.y, toBobber.x);

                // Snelheid per soort
                if (this.fishType.sprite === "turtle") {
                    this._targetSpeed = 2 + Math.random() * 4;
                } else if (this.fishType.hitbox >= 12) {
                    this._targetSpeed = 8 + Math.random() * 20;
                } else {
                    this._targetSpeed = 16 + Math.random() * 24;
                }
            } else {
                // Normale random richting en snelheid
                this._targetAngle = Math.random() * Math.PI * 2;
                if (this.fishType.sprite === "turtle") {
                    this._targetSpeed = 2 + Math.random() * 6;
                } else if (this.fishType.sprite === "tire") {
                    this._targetSpeed = 0.5 + Math.random() * 1.5;
                } else if (this.fishType.hitbox >= 12) {
                    this._targetSpeed = 8 + Math.random() * 8;
                } else {
                    this._targetSpeed = 16 + Math.random() * 16;
                }
            }

            this._changeDirTimer = 0;
            this._changeDirInterval = 2000 + Math.random() * 3000;
        }

        // Interpoleer richting en snelheid langzaam, met multiplier als onzichtbaar, gedaan door github Copilot
        let angleDiff = ((this._targetAngle - this._angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        let angleLerp = Math.min(1, delta / 500) * (this._speedMultiplier || 1);
        let speedLerp = Math.min(1, delta / 50) * (this._speedMultiplier || 1);
        this._angle += angleDiff * angleLerp;
        this._speed += (this._targetSpeed - this._speed) * speedLerp;

        // Zet velocity, gedaan door github Copilot
        this.vel = new Vector(Math.cos(this._angle), Math.sin(this._angle)).scale(this._speed * (this._speedMultiplier || 1));


        // --- SPIEGELING LOGICA ---
        if (!this._isTurtle && !this._isTire) {
            if (this.vel.x < -0.1) {
                this.scale = new Vector(-1, 1);
            } else if (this.vel.x > 0.1) {
                this.scale = new Vector(1, 1);
            }
        } else {
            if (this.vel.x > 0.1) {
                this.scale = new Vector(-1, 1);
            } else if (this.vel.x < -0.1) {
                this.scale = new Vector(1, 1);
            }
        }

        
        // --- Transitie naar surfacedFish na moveDuration ---
        if (
            this._fadeInDelayTimer >= this._fadeInDelay &&
            this._fadeInTimer >= this._fadeInDuration &&
            this._moveTimer >= this._moveDuration
        ) {
            const surfacedFish = new SurfacedFish(this.pos, this.fishType);
            this.scene.add(surfacedFish);
            this.kill();
            return;
        }
    }
}