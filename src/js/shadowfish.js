import { Actor, Vector, CollisionType, Color } from "excalibur";
import { cursorGroup } from "./collisiongroups.js"
import { Resources } from "./resources.js";

export class ShadowFish extends Actor {
    constructor() {
        super({
            width: 32,
            height: 16,
            pos: new Vector(320, 448),
            color: Color.Transparent,
            CollisionType: CollisionType.Active, 
            //collisionGroup: cursorGroup,
        });
        this.collider.useBoxCollider(32, 16);
        this.isCatchable = false;
        this._moveTimer = 0;
        this._moveDuration = 2000; // bijvoorbeeld 4 seconden
        this._bounceCount = 0;
        this._maxBounces = 5;
        this._catchableTimer = 0;
        this._usingFishSprite = false; // <-- voeg toe

        // Nieuw: variabelen voor geleidelijke versnelling en richting
        this._angle = Math.random() * Math.PI * 2;
        this._speed = 30 + Math.random() * 50;
        this._targetAngle = this._angle;
        this._targetSpeed = this._speed;
        this._changeDirTimer = 0;
        this._changeDirInterval = 1000 + Math.random() * 2000; // elke 1-3 seconden
    }

    onInitialize(engine) {
        this.engine = engine;
        this._setRandomMovement();

        this.on("collisionstart", (evt) => {
            const other = evt.other?.owner;
            if (!other || !other.constructor) return;

            // Interactie met andere shadowfish
            if (other.constructor.name === "ShadowFish" && other !== this) {
                // Bots af van elkaar: kies nieuwe random richting
                this._setRandomMovement();
                return;
            }

            // Interactie met WaterBoundary
            if (other.constructor.name === "WaterBoundary") {
                this._bounceCount++;
                if (this._bounceCount >= this._maxBounces) {
                    this.pos = new Vector(320, 448);
                    this._bounceCount = 0;
                    this._setRandomMovement();
                    return;
                }
                // Bereken de huidige bewegingshoek
                const currentAngle = Math.atan2(this.vel.y, this.vel.x);
                // Draai 180 graden (bounce)
                const awayAngle = currentAngle + Math.PI;
                // Stel alleen de _targetAngle in, niet direct de velocity!
                this._targetAngle = awayAngle + (Math.random() - 0.5) * (Math.PI / 3);
                // Optioneel: verander ook de snelheid een beetje
                this._targetSpeed = 30 + Math.random() * 70;
                this._changeDirTimer = 0;
                this._changeDirInterval = 1000 + Math.random() * 2000;
                return;
            }

            // Interactie met Bobber
            if (other.constructor.name === "Bobber") {
                // Niks doen, bobber regelt vangen
                return;
            }

            // Negeer alles wat geen shadowfish, waterBoundary of bobber is (zoals cursors)
            if (other.constructor.name === "Cursor" || other.constructor.name === "Cursor2") {
                return; // negeer botsing
            }
        });
    }

    _setRandomMovement(baseAngle = null, maxDeviation = Math.PI / 3) {
        let angle;
        if (baseAngle !== null) {
            angle = baseAngle + (Math.random() - 0.5) * 2 * maxDeviation;
        } else {
            if (Math.random() < 0.5) {
                angle = (Math.random() - 0.5) * (Math.PI / 3);
            } else {
                angle = Math.PI + (Math.random() - 0.5) * (Math.PI / 3);
            }
        }
        // Nieuw: stel targetAngle en targetSpeed in
        this._targetAngle = angle;
        this._targetSpeed = 30 + Math.random() * 70;
        this.isCatchable = false;
        this._moveTimer = 0;
        this._moveDuration = 4000; // altijd 4 seconden bewegen
        this._bounceCount = 0;
        this._catchableTimer = 0;
    }

    onPreUpdate(engine, delta) {
        if (this.pos.x < 0 || this.pos.x > 640 || this.pos.y < 390 || this.pos.y > 480) {
            this.pos = new Vector(320, 448);
            this._setRandomMovement();
            this._bounceCount = 0;
        }

        if (!this.isCatchable) {
            this._moveTimer += delta;
            // Richting en snelheid af en toe willekeurig aanpassen
            this._changeDirTimer += delta;
            if (this._changeDirTimer > this._changeDirInterval) {
                this._targetAngle = Math.random() * Math.PI * 2;
                this._targetSpeed = 30 + Math.random() * 70;
                this._changeDirTimer = 0;
                this._changeDirInterval = 1000 + Math.random() * 2000;
            }

            // Geleidelijke overgang naar nieuwe richting en snelheid
            // Interpoleer richting (angle)
            let angleDiff = ((this._targetAngle - this._angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
            this._angle += angleDiff * Math.min(1, delta / 1000); // hoe hoger, hoe sneller draaien

            // Interpoleer snelheid
            this._speed += (this._targetSpeed - this._speed) * Math.min(1, delta / 1000);

            // Zet velocity
            this.vel = new Vector(Math.cos(this._angle), Math.sin(this._angle)).scale(this._speed);

            if (this._moveTimer >= this._moveDuration) {
                this.vel = Vector.Zero;
                this.isCatchable = true;
                this._catchableTimer = 0;
            }
            // Zorg dat het sprite wordt verwijderd als hij weer beweegt
            if (this._usingFishSprite) {
                this.graphics.use(null); // <-- gebruik use(null) om het sprite te verwijderen
                this._usingFishSprite = false;
            }
        } else {
            this._catchableTimer += delta;
            // Kies een willekeurige vis sprite als hij stilstaat
            if (!this._usingFishSprite) {
                const fishSprites = [
                    Resources.lavenderFish,
                    Resources.redFish,
                    Resources.smallFishBlue,
                    Resources.smallFishCyan,
                    Resources.smallFishGreen,
                    Resources.smallFishPink,
                    Resources.turtle
                ];
                const randomIndex = Math.floor(Math.random() * fishSprites.length);
                this.graphics.use(fishSprites[randomIndex].toSprite());
                this._usingFishSprite = true;
            }
            if (this._catchableTimer >= 5000) {
                this.pos = new Vector(320, 448);
                this._setRandomMovement();
            }
        }
    }

    tryCatch() {
        if (this.isCatchable) {
            this.kill();
            if (this.scene && this.scene.engine && typeof this.scene.engine.addScore === "function") {
                this.scene.engine.addScore();
            }
        }
    }
}