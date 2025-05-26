import { Resources } from "./resources.js";
import { Vector, Actor, Keys } from "excalibur";

export class Bobber_Bottom extends Actor {
    constructor() {
        super({ width: 48, height: 48 });
        this.graphics.use(Resources.Bobber_Bottom.toSprite());
        this.scale = new Vector(1, 1);
        this.pos = new Vector(320, 320);
        this.vel = new Vector(0, 0);
    }
}