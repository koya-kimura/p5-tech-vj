let mainTexture;
let FrameTexture;

let theShader;

let FLOW_LOGO;

function preload(){
    theShader = loadShader("../shader/main.vert", "../shader/main.frag");
    FLOW_LOGO = loadImage("../asset/image/flow.png");
}

function setup(){
    createCanvas(windowWidth, windowHeight, WEBGL);
    background(0);

    mainTexture = createGraphics(width, height);
    FrameTexture = createGraphics(width, height);
}

function draw(){
    background(0);

    const t = millis() * 0.001;

    mainTexture.background(0);
    const s = 40
    for(let x = 0; x < width; x += s){
        for(let y = 0; y < height; y += s){
            mainTexture.noStroke();
            mainTexture.fill(255);
            mainTexture.ellipse(x, y, s*0.6, s*0.6);
        }
    }

    FrameTexture.background(0);
    FrameTexture.imageMode(CENTER);

    const w = width * 0.2;
    const h = w * FLOW_LOGO.height / FLOW_LOGO.width;
    FrameTexture.image(FLOW_LOGO, width/2, height/2, w, h);

    shader(theShader);

    theShader.setUniform("u_time", t);
    theShader.setUniform("u_mainTex", mainTexture);
    theShader.setUniform("u_frameTex", FrameTexture);

    rect(0, 0, width, height);
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);

    mainTexture.resizeCanvas(windowWidth, windowHeight);
    FrameTexture.resizeCanvas(windowWidth, windowHeight);
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