import { Actor, Vector, Color, CollisionType } from "excalibur";
import { FishTypes } from "./fish-config.js";
import { Resources } from "./resources.js";
import { cursorAndShadowFishGroup } from "./collisiongroups.js"

export class SurfacedFish extends Actor {
    constructor(pos, fishType = null) {
        // Gebruik het fishType van shadowfish als meegegeven, anders random
        let chosenFishType = fishType;
        if (!chosenFishType) {
            const fishKeys = Object.keys(FishTypes);
            const randomKey = fishKeys[Math.floor(Math.random() * fishKeys.length)];
            chosenFishType = FishTypes[randomKey];
        }

        super({
            width: chosenFishType.hitbox * 2,
            height: chosenFishType.hitbox * 2,
            pos: pos.clone(),
            color: Color.Transparent,
            collisionType: CollisionType.Active,
            collisionGroup: cursorAndShadowFishGroup,
            z: -2
        });

        this.fishType = chosenFishType;
        this.points = chosenFishType.points;

        this.collider.useCircleCollider(chosenFishType.hitbox);

        this._usingFishSprite = false;
        this._catchableTimer = 0;

        // --- VANGTIJDPERIODE INSTELLEN ---
        // Klein: 8s, Groot: 5s, Schildpad: 3s
        if (chosenFishType.sprite === "turtle") {
            this.catchableDuration = 3000;
        } else if (chosenFishType.hitbox >= 12) {
            this.catchableDuration = 5000;
        } else {
            this.catchableDuration = 8000;
        }

        // Beweging-variabelen
        this._angle = Math.random() * Math.PI * 2;

        // Snelheid per soort
        if (chosenFishType.sprite === "turtle") {
            // Schildpad: langzaam
            this._speed = 2 + Math.random() * 6;
            this._targetSpeed = this._speed;
        } else if (chosenFishType.hitbox >= 12) {
            // Grote vis: huidige snelheid behouden
            this._speed = 8 + Math.random() * 16;
            this._targetSpeed = this._speed;
        } else {
            // Kleine vis: sneller
            this._speed = 16 + Math.random() * 32;
            this._targetSpeed = this._speed;
        }

        this._targetAngle = this._angle;
        this._changeDirTimer = 0;
        this._changeDirInterval = 0 + Math.random() * 1000; // minder vaak van richting veranderen

        this._fadingIn = true;
        this._fadeInTimer = 0;
        this._fadeInDuration = 100; // 0.1 seconden
        this._fadingOut = false;
        this._fadeTimer = 0;
    }

    onInitialize(engine) {
        // Gebruik het juiste sprite
        this.graphics.use(Resources[this.fishType.sprite].toSprite());
        this._usingFishSprite = true;
        this.graphics.opacity = 0; // Start volledig transparant
    }

    onPreUpdate(engine, delta) {
        this._catchableTimer += delta;

        // Fade-in logica
        if (this._fadingIn) {
            this._fadeInTimer += delta;
            let alpha = Math.min(1, this._fadeInTimer / this._fadeInDuration);
            this.graphics.opacity = alpha;
            const blueStrength = 0.5 * (1 - alpha);
            this.graphics.tint = Color.fromRGB(0, 0, 255, blueStrength);

            if (this._fadeInTimer >= this._fadeInDuration) {
                this._fadingIn = false;
                this.graphics.opacity = 1;
                this.graphics.tint = Color.White;
            }
            return;
        }

        // Fade-out logica
        if (this._fadingOut) {
            this._fadeTimer += delta;
            const fadeDuration = 100;
            let alpha = Math.max(0, 1 - this._fadeTimer / fadeDuration);
            this.graphics.opacity = alpha;
            if (this._fadeTimer >= fadeDuration) {
                this.kill();
            }
            return;
        }

        if (this._catchableTimer >= this.catchableDuration) {
            this._fadingOut = true;
            this._fadeTimer = 0;
            return;
        }

        // Richting veranderen
        this._changeDirTimer += delta;
        if (this._changeDirTimer > this._changeDirInterval) {
            let goToBobber = false;
            let bobberPos = null;

            // Zoek een actieve dobber
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

            if (bobber) {
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
                    this._targetSpeed = 2 + Math.random() * 6;
                    this._catchableTimer -= 500; // Schildpad: 0.5s extra
                } else if (this.fishType.hitbox >= 12) {
                    this._targetSpeed = 8 + Math.random() * 24;
                    this._catchableTimer -= 1250; // Grote vis: 1s extra
                } else {
                    this._targetSpeed = 16 + Math.random() * 48;
                    this._catchableTimer -= 2500; // Kleine vis: 2s extra
                }
                // Zorg dat de timer niet negatief wordt
                if (this._catchableTimer < 0) this._catchableTimer = 0;
            } else {
                // Normale random richting en snelheid
                this._targetAngle = Math.random() * Math.PI * 2;
                if (this.fishType.sprite === "turtle") {
                    this._targetSpeed = 2 + Math.random() * 6;
                } else if (this.fishType.hitbox >= 12) {
                    this._targetSpeed = 8 + Math.random() * 8;
                } else {
                    this._targetSpeed = 16 + Math.random() * 16;
                }
            }

            this._changeDirTimer = 0;
            this._changeDirInterval = 2000 + Math.random() * 3000;
        }

        // Interpoleer richting en snelheid langzaam
        let angleDiff = ((this._targetAngle - this._angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        this._angle += angleDiff * Math.min(1, delta / 500);
        this._speed += (this._targetSpeed - this._speed) * Math.min(1, delta / 50);

        // Zet velocity
        this.vel = new Vector(Math.cos(this._angle), Math.sin(this._angle)).scale(this._speed);

        // --- SPIEGELING LOGICA ---
        const isTurtle = this.fishType.sprite === "turtle";
        if (!isTurtle) {
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
    }

    tryCatch(byPlayer2 = false) {
        this.kill();
        if (this.scene && this.scene.engine) {
            const points = this.points || 1;
            if (byPlayer2 && typeof this.scene.engine.addScorePlayer2 === "function") {
                this.scene.engine.addScorePlayer2(points);
            } else if (typeof this.scene.engine.addScore === "function") {
                this.scene.engine.addScore(points);
            }
        }
    }
}