import { ImageSource, Sound, Loader, FontSource } from 'excalibur'

// Voeg hier jouw eigen resources toe
const Resources = {
    Background: new ImageSource('images/background.png'),
    Cursor: new ImageSource('images/cursorPlayer1.png'),
    CursorPlayer2: new ImageSource('images/cursorPlayer2.png'),
    Bobber_Top: new ImageSource('images/bobber-top.png'),
    Bobber_Top_P2: new ImageSource('images/bobber-top-p2.png'),
    Bobber_Bottom: new ImageSource('images/bobber-bottom.png'),

    lavenderFish: new ImageSource('images/lavenderfish.png'),
    redFish: new ImageSource('images/redfish.png'),
    smallFishBlue: new ImageSource('images/smallfishblue.png'),
    smallFishCyan: new ImageSource('images/smallfishcyan.png'),
    smallFishGreen: new ImageSource('images/smallfishgreen.png'),
    smallFishPink: new ImageSource('images/smallfishpink.png'),
    turtle: new ImageSource('images/turtle.png'),

    animatedStar1: new ImageSource('images/star1.png'),
    animatedStar2: new ImageSource('images/star2.png'),
    nom: new Sound('sound/nom.mp3'),
    PixelFont: new FontSource('fonts/PressStart2P-Regular.ttf', 'PressStart')
}


const ResourceLoader = new Loader()
for (let res of Object.values(Resources)) {
    ResourceLoader.addResource(res)
}

export { Resources, ResourceLoader }