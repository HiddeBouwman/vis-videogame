import { Actor, Vector, SpriteSheet, Animation } from "excalibur";
import { Resources } from "./resources.js";

export class BackgroundImage extends Actor {
    constructor() {
        super({
            pos: new Vector(320, 240),
            width: 640,
            height: 480,
            anchor: new Vector(0.5, 0.5)
        });
    }

    async onInitialize() {
        await Resources.Background.load();
        const sprite = Resources.Background.toSprite();
        sprite.anchor = new Vector(0.5, 0.5);
        const scaleX = 640 / sprite.width;
        const scaleY = 480 / sprite.height;
        sprite.scale = new Vector(scaleX, scaleY);
        this.graphics.use(sprite);
        this.z = -9;
    }
}

export class MenuBackground extends Actor {
    constructor() {
        super({
            pos: new Vector(320, 240),
            width: 640,
            height: 480,
            anchor: new Vector(0.5, 0.5)
        });
    }

    async onInitialize() {
        await Resources.MenuBackground.load();
        const sprite = Resources.MenuBackground.toSprite();
        sprite.anchor = new Vector(0.5, 0.5);
        const scaleX = 640 / sprite.width;
        const scaleY = 480 / sprite.height;
        sprite.scale = new Vector(scaleX, scaleY);
        this.graphics.use(sprite);
        this.z = -9;
    }
}

export class OptionsBackground extends Actor {
    constructor() {
        super({
            pos: new Vector(320, 240),
            width: 640,
            height: 480,
            anchor: new Vector(0.5, 0.5)
        });
    }

    async onInitialize() {
        await Resources.OptionsBackground.load();
        const sprite = Resources.OptionsBackground.toSprite();
        sprite.anchor = new Vector(0.5, 0.5);
        const scaleX = 640 / sprite.width;
        const scaleY = 480 / sprite.height;
        sprite.scale = new Vector(scaleX, scaleY);
        this.graphics.use(sprite);
        this.z = -9;
    }
}

export class Logo extends Actor {
    constructor() {
        super({
            pos: new Vector(320, 240),
            anchor: new Vector(0.5, 0.5),
            z: -8
        });
    }

    async onInitialize() {
        await Resources.Logo.load();
        const sprite = Resources.Logo.toSprite();
        sprite.anchor = new Vector(0.5, 0.5);
        this.graphics.use(sprite);
    }
}

export class animatedStar1 extends Actor {
    constructor(pos = new Vector(0, 0)) {
        super();
        this.pos = pos;
    }

    onInitialize() {
        const spriteSheet = SpriteSheet.fromImageSource({
            image: Resources.animatedStar1,
            grid: {
                rows: 9,
                columns: 1,
                spriteWidth: 16,
                spriteHeight: 16
            }
        });
        const anim = Animation.fromSpriteSheet(spriteSheet, [0, 1, 2, 3, 4, 5, 6, 7, 8], 100);
        this.graphics.use(anim);
    }
}

export class animatedStar2 extends Actor {
    constructor(pos = new Vector(0, 0)) {
        super();
        this.pos = pos;
    }

    onInitialize(){
        const spriteSheet2 = SpriteSheet.fromImageSource({
            image: Resources.animatedStar2,
            grid: {
                rows: 9,
                columns: 1,
                spriteWidth: 16,
                spriteHeight: 16
            }
        });
        const anim = Animation.fromSpriteSheet(spriteSheet2, [0, 1, 2, 3, 4, 5, 6, 7, 8], 100);
        this.graphics.use(anim)
    }
}