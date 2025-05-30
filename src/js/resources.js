import { ImageSource, Sound, Loader, FontSource } from 'excalibur'
const Resources = {

    // Foto's en kunst
    Background: new ImageSource('images/background.png'),
    MenuBackground: new ImageSource('images/menubackground.png'),
    Logo: new ImageSource('images/logo.png'),
    OptionsBackground: new ImageSource('images/options.png'),

    animatedStar1: new ImageSource('images/star1.png'),
    animatedStar2: new ImageSource('images/star2.png'),

    // Speler gerelateerde gameplay
    Cursor: new ImageSource('images/cursorPlayer1.png'),
    CursorPlayer2: new ImageSource('images/cursorPlayer2.png'),
    Bobber_Top: new ImageSource('images/bobber-top.png'),
    Bobber_Top_P2: new ImageSource('images/bobber-top-p2.png'),
    Bobber_Bottom: new ImageSource('images/bobber-bottom.png'),

    // Vangbare vissen
    lavenderFish: new ImageSource('images/lavenderfish.png'),
    redFish: new ImageSource('images/redfish.png'),
    smallFishBlue: new ImageSource('images/smallfishblue.png'),
    smallFishCyan: new ImageSource('images/smallfishcyan.png'),
    smallFishGreen: new ImageSource('images/smallfishgreen.png'),
    smallFishPink: new ImageSource('images/smallfishpink.png'),
    turtle: new ImageSource('images/turtle.png'),

    tire: new ImageSource('images/tire.png'),

    // Nog niet water vissen
    smallFishShadow: new ImageSource('images/smallfishshadow.png'),
    bigFishShadow: new ImageSource('images/bigfishshadow.png'),
    turtleShadow: new ImageSource('images/turtleshadow.png'),

    tireShadow: new ImageSource('images/tireshadow.png'),

    // Andere zaken
    nom: new Sound('sound/nom.mp3'),
    PixelFont: new FontSource('fonts/PressStart2P-Regular.ttf', 'PressStart')
}


const ResourceLoader = new Loader()
for (let res of Object.values(Resources)) {
    ResourceLoader.addResource(res)
}

export { Resources, ResourceLoader }