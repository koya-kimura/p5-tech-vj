let count;
let squareCount;

const sceneManager = new SceneManager(130, true);
const terminal = new LogManager();

const COLOR_PALETTE_ALL = [
    "#FF0000",
    "#FFA500",
    "#FFFF00",
    "#008000",
    "#0000FF",
    "#4B0082",
    "#800080",
    "#00FFFF"
];
let COLOR_PALETTE;

let FLOW_LOGO;

let FONT_ARRAY = [];
let DSEG14_FONT;
let BEBAS_FONT;
let DMSERIF_FONT;
let PLAYWRITE_FONT;
let SIXTYFOUR_FONT;

const FULLSCREEN_KEY = 32;

function preload() {
    sceneManager.midiManager_.initializeMIDIDevices();
    sceneManager.loadPostShader("../shader/main.vert", "../shader/main.frag");

    FLOW_LOGO = loadImageSafely("../asset/image/flow.png");

    DSEG14_FONT = loadFont("../asset/font/DSEG14ClassicMini-BoldItalic.ttf");
    BEBAS_FONT = loadFont("../asset/font/BebasNeue-Regular.ttf");
    DMSERIF_FONT = loadFont("../asset/font/DMSerifText-Regular.ttf");
    PLAYWRITE_FONT = loadFont("../asset/font/PlaywriteAUSA-VariableFont_wght.ttf");
    SIXTYFOUR_FONT = loadFont("../asset/font/Sixtyfour-Regular.ttf");

    FONT_ARRAY = [DSEG14_FONT, BEBAS_FONT, DMSERIF_FONT, PLAYWRITE_FONT, SIXTYFOUR_FONT];
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    pixelDensity(2);
    noCursor();

    sceneManager.setup();
}

function draw() {
    colorPaletteUpdate();

    clear();

    terminal.fpsLog();

    sceneManager.update();

    count = sceneManager.micAudioManager_.count_;
    squareCount = calculateSquareCount(count);

    sceneManager.draw();
}

function colorPaletteUpdate() {
    COLOR_PALETTE = [];
    for (let i in sceneManager.midiManager_.sideButtonToggleState_) {
        if (sceneManager.midiManager_.sideButtonToggleState_[i] == 0) {
            COLOR_PALETTE.push(COLOR_PALETTE_ALL[i]);
        }
    }
    if (COLOR_PALETTE.length == 0) {
        COLOR_PALETTE.push("#ffffff");
    }
}

function calculateSquareCount(count) {
    return abs((count * 2) % 2 - 1)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    sceneManager.resize();
}

function keyPressed() {
    if (keyCode === FULLSCREEN_KEY) {
        let fs = fullscreen();
        fullscreen(!fs);
    }
    sceneManager.keyPressed(keyCode);
}

function loadImageSafely(path) {
    return loadImage(path,
        // 成功時のコールバック
        (img) => img,
        // 失敗時のコールバック
        () => {
            terminal.log(`Image not found: ${path}`);
            return null;
        }
    );
}

function mousePressed() {
    userStartAudio();
}