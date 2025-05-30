class FishType {
    constructor(sprite, points, hitbox) {
        this.sprite = sprite;
        this.points = points;
        this.hitbox = hitbox;
    }
}

class LavenderFish extends FishType {
    constructor() { super("lavenderFish", 3, 12); }
}
class RedFish extends FishType {
    constructor() { super("redFish", 3, 12); }
}
class SmallFishBlue extends FishType {
    constructor() { super("smallFishBlue", 1, 8); }
}
class SmallFishCyan extends FishType {
    constructor() { super("smallFishCyan", 1, 8); }
}
class SmallFishGreen extends FishType {
    constructor() { super("smallFishGreen", 1, 8); }
}
class SmallFishPink extends FishType {
    constructor() { super("smallFishPink", 1, 8); }
}
class Turtle extends FishType {
    constructor() { super("turtle", 8, 18); }
}

class Tire extends FishType {
    constructor() { super("tire", -5, 15)}
}

export const FishTypes = {
    lavenderFish: new LavenderFish(),
    redFish: new RedFish(),
    smallFishBlue: new SmallFishBlue(),
    smallFishCyan: new SmallFishCyan(),
    smallFishGreen: new SmallFishGreen(),
    smallFishPink: new SmallFishPink(),
    turtle: new Turtle(),
    tire: new Tire()
};