class SoundObjectScene {
    constructor(){
        this.layerAlpha_ = 0;
        this.styleIndex_ = 0;
        this.styleIndexIncrement_ = 0;
        this.scaleWidth_ = 1;
        this.scaleHeight_ = 1;
        this.isPositionRandom_ = false;
        this.isCameraRandom_ = false;
        this.canvasAngle_ = 0;
    }

    midiAssign() {
        this.layerAlpha_ = sceneManager.midiManager_.faderValues_[0] * 255;
        this.layerAlpha_ = 255;

        this.scaleWidth_ = 1+map(pow(squareCount, 3), 0, 1, 0, sceneManager.midiManager_.gridState(7, 0, "LEAP")*4);
        this.scaleHeight_ = 1 + map(pow(squareCount, 3), 0, 1, 0, sceneManager.midiManager_.gridState(7, 1, "LEAP") * 4);
        this.isPositionRandom_ = sceneManager.midiManager_.gridState(7, 2, "LEAP");
        this.isCameraRandom_ = sceneManager.midiManager_.gridState(7, 3, "TOGGLED");
        this.styleIndexIncrement_ = sceneManager.midiManager_.gridState(7, 4, "ONESHOT");
        this.canvasAngle_ = sceneManager.midiManager_.gridState(7, 5, "LEAP") * PI;
    }

    update(){
        this.styleIndex_ += this.styleIndexIncrement_;
    }

    draw(tex, spectrum){
        tex.push();

        tex.translate(width / 2, height / 2);
        tex.scale(0.5);

        // gururun
        tex.rotate(this.canvasAngle_);

        // aspect ratio
        tex.scale(this.scaleWidth_, this.scaleHeight_);

        // camera
        tex.translate(this.isCameraRandom_ * map(noise(floor(count) + 9182.4828), 0, 1, -width / 2, width / 2), this.isCameraRandom_ * map(noise(floor(count) + 7436.89172), 0, 1, -height / 2, height / 2));
        tex.rotate(this.isCameraRandom_ * noise(floor(count)+1927.3197) * TAU);
        tex.scale(1 + this.isCameraRandom_ * (pow(noise(floor(count) + 9182.4828), 3) * 10), 1 + this.isCameraRandom_ * (pow(noise(floor(count) + 7436.89172), 3) * 10));

        const n = floor(map(noise(floor(count / 4)), 0, 1, 3, 8));
        const m = 10;

        for (let j = 0; j < m; j++) {
            const c = COLOR_PALETTE[j % COLOR_PALETTE.length];

            tex.push();

            const cx = this.isPositionRandom_ * interpolateNoiseWithEasing(count, 2, 1, -width*1.5, width*1.5, j * 1287.2874, p5.Easing.easeInOutCubic);
            const cy = this.isPositionRandom_ * interpolateNoiseWithEasing(count, 2, 1, -height*1.5, height*1.5, j * 3197.8572, p5.Easing.easeInOutCubic);

            tex.translate(cx, cy);
            tex.rotate(noise(j * 7318.1297) * TAU + count * 0.1);
            tex.scale(1 + noise(j + 1928.4297) * 5, 1);

            const initstyle = ["FILL", "STROKE", "MIX"][this.styleIndex_ % 3];
            const style = initstyle != "MIX" ? initstyle : (noise(j * 1927.4208) > 0.5 ? "FILL" : "STROKE");
            if (style == "FILL") {
                tex.fill(red(c), green(c), blue(c), map(this.layerAlpha_, 0, 255, 0, 200));
                tex.noStroke();
            } else if (style == "STROKE") {
                tex.noFill();
                tex.stroke(red(c), green(c), blue(c), this.layerAlpha_);
            }

            tex.beginShape();
            for (let i = 0; i < n; i++) {
                const radius = max(width, height) * 0.7 * map(pow(noise(count, j), 4), 0, 1, 0.1, 0.5 + spectrum[8] * 0.5);
                const angle = noise(j) * TAU + i * TAU / n;
                const x = cos(angle) * radius;
                const y = sin(angle) * radius;

                tex.vertex(x, y);
            }
            tex.endShape(CLOSE);
            tex.pop();
        }

        tex.pop();
    }
}