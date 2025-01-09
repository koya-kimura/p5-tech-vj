class AudioScene {
    constructor(){
        this.layerAlpha_ = 0;
        this.showCircle_ = false;
        this.showLine_ = false;
        this.circleScl_ = 0.01;
        this.strokeWeight_ = 0.5;
        this.isRotate_ = 0;
        this.lineLengthScl_ = 0;
    }

    midiAssign() {
        // this.layerAlpha_ = 255;
        this.layerAlpha_ = sceneManager.midiManager_.faderValues_[0] * 255;

        this.showCircle_ = map(sceneManager.midiManager_.gridState(6, 0, "TOGGLED"), 0, 1, 0.1, 1);
        this.showLine_ = map(sceneManager.midiManager_.gridState(6, 1, "TOGGLED"), 0, 1, 0.1, 1);
        this.circleScl_ = map(sceneManager.midiManager_.gridState(6, 2, "LEAP"), 0, 1, 0.01, 0.3);
        this.strokeWeight_ = map(sceneManager.midiManager_.gridState(6, 3, "TOGGLED"), 0, 1, 0.5, 50.0);
        this.isRotate_ = sceneManager.midiManager_.gridState(6, 4, "LEAP");
        this.lineLengthScl_ = map(pow(sceneManager.midiManager_.gridState(6, 5, "LEAP"), 3), 0, 1, 0.1, 1.0);
    }

    update(){

    }

    draw(tex, spectrum){
        tex.push();
        tex.translate(width / 2, height / 2);

        const w = max(width, height) * 0.7 * 2.0;

        for (let i in spectrum) {
            const c = COLOR_PALETTE[i % COLOR_PALETTE.length];
            const x = map(spectrum[i], 0, 1, 0, w);
            const l = this.lineLengthScl_ * max(width, height) * 0.7;

            tex.push();

            tex.rotate(this.isRotate_ * noise(i) * TAU);

            tex.stroke(red(c), green(c), blue(c), this.layerAlpha_);
            tex.noFill();
            tex.strokeWeight(this.strokeWeight_ * this.showLine_);
            tex.strokeCap(SQUARE);
            tex.line(x, -l, x, l);
            tex.line(-x, -l, -x, l);

            const y = map(sin(noise(i) * TAU + count * 0.5), -1, 1, -l, l);

            tex.fill(red(c), green(c), blue(c), this.layerAlpha_);
            tex.noStroke();
            tex.ellipse(x, y, min(width, height) * this.circleScl_ * this.showCircle_);
            tex.ellipse(-x, y, min(width, height) * this.circleScl_ * this.showCircle_);
            tex.pop();
        }
        tex.pop();
    }
}