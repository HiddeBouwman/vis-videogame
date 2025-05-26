import { Resources } from "./resources.js";
import { Vector, Actor, Keys, CollisionType } from "excalibur";
import { Bobber_Bottom } from './bobber-bottom.js'
//import { customGroup } from "./collisiongroups.js"

export class Bobber extends Actor {
    constructor(startPos = new Vector(320, 320)) {
        super({ width: 48, height: 48, CollisionType: CollisionType.Active, collisionGroup: customGroup2, }); 
        this.graphics.use(Resources.Bobber_Top.toSprite());
        this.scale = new Vector(1, 1);
        this.pos = startPos.clone();
        this.basePos = startPos.clone(); // <-- sla basispositie op
        this.vel = new Vector(0, 0);

        this.floatTime = 0;
        this.floatDuration = 1.2; // seconden voor een volledige cyclus
        this.floatAmplitude = 1; // pixels op en neer
        this.bobberBottom = null;
    }

    onInitialize(engine) {
        const bottompart = new Bobber_Bottom();
        bottompart.pos = new Vector(0, 0);
        bottompart.z = -1;
        this.addChild(bottompart);
        this.bobberBottom = bottompart;

        this.body.collisionType = CollisionType.Fixed; // <-- zet op Fixed!
        this.collider.useBoxCollider(48, 48);

        this.on("collisionstart", (event) => {
            if (event.other.owner && typeof event.other.owner.tryCatch === "function") {
                event.other.owner.tryCatch();
            }
            this.eat(event);
        });
    }

    onPreUpdate(engine, delta) {
        this.floatTime += delta / 2000;
        const t = (this.floatTime % this.floatDuration) / this.floatDuration;
        const offset = Math.sin(t * Math.PI * 2) * this.floatAmplitude;

        this.pos.y = this.basePos.y + offset;

        // Doelschaal bepalen
        let targetScale = offset > 0 ? new Vector(1.15, 1.15) : new Vector(1, 1);

        // Interpolatie factor (hoe hoger, hoe sneller de overgang)
        const lerpSpeed = 0.05 * (delta / 16.67); // 0.1 is traag, 1 is direct

        if (this.bobberBottom) {
            // Huidige schaal ophalen
            let current = this.bobberBottom.scale;
            // Nieuwe schaal berekenen
            let newScale = new Vector(
                current.x + (targetScale.x - current.x) * lerpSpeed,
                current.y + (targetScale.y - current.y) * lerpSpeed
            );
            this.bobberBottom.scale = newScale;
        }
    }

    eat(event) {
        if (event.other.owner && typeof event.other.owner.tryCatch === "function") {
            event.other.owner.tryCatch();
        }
    }
}