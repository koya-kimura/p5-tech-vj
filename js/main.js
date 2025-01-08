let count;

const sceneManager = new SceneManager(130, true);
const terminal = new LogManager();

const COLOR_PALETTE = ["#10ed21", "#ed1938", "#0121ed", "#eded17", "#ed08ed", "#32eded"];

let FLOW_LOGO;

let FONT_ARRAY = [];
let DSEG14_FONT;
let BEBAS_FONT;
let DMSERIF_FONT;
let PLAYWRITE_FONT;
let SIXTYFOUR_FONT;

const FULLSCREEN_KEY = 32;

function preload(){
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

function setup(){
    createCanvas(windowWidth, windowHeight, WEBGL);
    pixelDensity(2);
    noCursor();

    sceneManager.setup();
}

function draw(){

    count = frameCount * 0.01;

    clear();

    terminal.fpsLog();

    sceneManager.update();
    sceneManager.draw();
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
    sceneManager.resize();
}

function keyPressed() {
    if (keyCode === FULLSCREEN_KEY) {
        let fs = fullscreen();
        fullscreen(!fs);
    }
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