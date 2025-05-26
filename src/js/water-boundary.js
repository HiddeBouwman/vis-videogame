import { Actor, Vector, Color, CollisionType } from "excalibur";
// import { customGroup, customGroup2 } from "./collisiongroups.js"

export class WaterBoundary extends Actor {
    constructor(x, y, width, height) {
        super({
            pos: new Vector(x + width / 2, y + height / 2),
            width,
            height,
            color: Color.Transparent, 
            CollisionType: CollisionType.Fixed, 
        });
        // this.collider.useBoxCollider(width, height);
    }
}