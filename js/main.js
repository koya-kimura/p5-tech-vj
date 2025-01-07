const BPM = 130;
let count;

const scene = new Scene();
const frame = new Frame();

let theShader;

let FLOW_LOGO;
let FLOWER_IMAGE;

let FONT_ARRAY = [];
let DSEG14_FONT;
let BEBAS_FONT;
let DMSERIF_FONT;
let JERSEY_FONT;
let PLAYWRITE_FONT;
let SIXTYFOUR_FONT;

let cellInfo;
let midiSuccess = false;

let mic;
let fft;
let spectrum;

function preload(){
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    theShader = loadShader("../shader/main.vert", "../shader/main.frag");

    FLOW_LOGO = loadImageSafely("../asset/image/flow.png");
    FLOWER_IMAGE = loadImageSafely("../asset/image/flower.jpg");

    DSEG14_FONT = loadFont("../asset/font/DSEG14ClassicMini-BoldItalic.ttf");
    BEBAS_FONT = loadFont("../asset/font/BebasNeue-Regular.ttf");
    DMSERIF_FONT = loadFont("../asset/font/DMSerifText-Regular.ttf");
    PLAYWRITE_FONT = loadFont("../asset/font/PlaywriteAUSA-VariableFont_wght.ttf");
    SIXTYFOUR_FONT = loadFont("../asset/font/Sixtyfour-Regular.ttf");

    FONT_ARRAY = [DSEG14_FONT, BEBAS_FONT, DMSERIF_FONT, PLAYWRITE_FONT, SIXTYFOUR_FONT];
}

function setup(){
    createCanvas(windowWidth, windowHeight, WEBGL);
    background(0);

    scene.setup();
    frame.setup();

    pixelDensity(2);

    mic = new p5.AudioIn();
    mic.start();
    mic.connect();

    fft = new p5.FFT(0.8, 16);
    fft.setInput(mic);
}

function draw(){
    count = calculateBeatCount(BPM) + faderValues[8];

    spectrum = fft.analyze();

    for(let i in spectrum){
        spectrum[i] = map(spectrum[i], 0, 255, 0, 1);
    }

    background(0);

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            gridOneShotState[i][j] = max(gridPressedState[i][j] - gridPrevState[i][j], 0);
        }
    }

    scene.update();
    scene.display();

    frame.display();

    shader(theShader);

    theShader.setUniform("u_time", millis() * 0.001);
    theShader.setUniform("u_resolution", [width, height]);
    theShader.setUniform("u_mainTex", scene.getScene());
    theShader.setUniform("u_frameTex", frame.getFrame());

    theShader.setUniform("u_monoEnabled", gridState(6, 0, "TOGGLED")==1);
    theShader.setUniform("u_invertEnabled", gridState(6, 1, "TOGGLED")==1);
    theShader.setUniform("u_posterizationEnabled", gridState(6, 2, "TOGGLED") == 1);

    rect(0, 0, width, height);

    if (midiSuccess) {
        midiOutputSend();
    }

    gridPrevState = structuredClone(gridPressedState);
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);

    scene.setup();
    frame.setup();
}

function keyPressed() {
    if (keyCode === 32) {
        let fs = fullscreen();
        fullscreen(!fs);
        if (fs) {
            cursor();
        } else {
            noCursor();
        }
    }
}

function loadImageSafely(path) {
    return loadImage(path,
        // 成功時のコールバック
        (img) => img,
        // 失敗時のコールバック
        () => {
            console.log(`Image not found: ${path}`);
            return null;
        }
    );
}

function mousePressed() {
    userStartAudio();
}