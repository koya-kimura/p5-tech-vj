class TextScene {
    constructor() {
        this.layerAlpha_ = 0;

        this.textArray_ = ["FLOW", "VOL4", "TKSM", "KMRK", "P5JS"];
        this.textIndex_ = 0;
        this.fontIndex_ = 0;
        this.horizontalNum_ = 2;
        this.verticalNum_ = 2;

        this.canvasPositionX_ = 0;
        this.canvasPositionY_ = 0;
        this.canvasAngle_ = 0;
        this.canvasScale_ = 1;
        this.canvasAspect_ = 1;

        this.isTextChange_ = 0;
        this.isFontChange_ = 0;
        this.horizontalNumChange_ = 0;
        this.verticalNumChange_ = 0;
        this.gridNumChange_ = 0;
        this.lineNumChange_ = 0;
        this.isTextArrayChange_ = 0;
        this.isTextColorChange_ = 0;
        this.isFontArrayChange_ = 0;
        this.isFontChange2_ = 0;
        this.isTextArraySelect_ = 0;
        this.isFontArraySelect_ = 0;
        this.isLayerAlphaChange_ = 0;
    }

    midiAssign() {
        // this.layerAlpha_ = 255;
        this.layerAlpha_ = sceneManager.midiManager_.faderValues_[2] * 255;

        this.isTextChange_ = sceneManager.midiManager_.gridState(4, 0, "ONESHOT");
        this.isFontChange_ = sceneManager.midiManager_.gridState(4, 1, "ONESHOT");
        this.horizontalNumChange_ = sceneManager.midiManager_.gridState(4, 2, "ONESHOT");
        this.verticalNumChange_ = sceneManager.midiManager_.gridState(4, 3, "ONESHOT");
        this.gridNumChange_ = sceneManager.midiManager_.gridState(4, 4, "ONESHOT");
        this.lineNumChange_ = sceneManager.midiManager_.gridState(4, 5, "ONESHOT");
        this.isTextArrayChange_ = sceneManager.midiManager_.gridState(4, 6, "TOGGLED");
        this.isTextColorChange_ = sceneManager.midiManager_.gridState(4, 7, "TOGGLED");
        this.isFontArrayChange_ = sceneManager.midiManager_.gridState(5, 0, "TOGGLED");
        this.isFontChange2_ = sceneManager.midiManager_.gridState(5, 1, "TOGGLED");
        this.isTextArraySelect_ = sceneManager.midiManager_.gridState(5, 2, "TOGGLED");
        this.isFontArraySelect_ = sceneManager.midiManager_.gridState(5, 3, "TOGGLED");
        this.isLayerAlphaChange_ = sceneManager.midiManager_.gridState(5, 4, "TOGGLED");
    }

    update() {
        this.textIndex_ += this.isTextChange_;
        this.fontIndex_ += this.isFontChange_;
        this.horizontalNum_ += this.horizontalNumChange_;
        this.verticalNum_ += this.verticalNumChange_;

        this.gridNum_ += this.gridNumChange_;
        this.lineNum_ += this.lineNumChange_;
    }

    draw(tex, spectrum) {
        this.canvasAngle_ = this.isLayerAlphaChange_ == 1 ? interpolateNoiseWithEasing(count, 16, 4, p5.Easing.easeInOutSine, -PI, PI) : 0;

        tex.push();
        tex.translate(width / 2, height / 2);
        tex.translate(this.canvasPositionX_, this.canvasPositionY_);
        tex.rotate(this.canvasAngle_);
        tex.scale(1.5, 0.7)

        const m = this.horizontalNum_ % 5;
        const n = (this.verticalNum_ % 3) * 10 + 3;

        for (let j = -m; j <= m; j++) {
            for (let i = 0; i < n; i++) {
                const index = floor(noise(i * 9422.1298, j * 3192.2493) * 100);
                const c = COLOR_PALETTE[index % COLOR_PALETTE.length];

                const x = m == 0 ? 0 : map(j, -m, m, -max(width, height) * 0.7, max(width, height) * 0.7);
                const y = (i * (max(width, height) * 0.7 * 2) / n + frameCount) % (max(width, height) * 0.7 * 2) - max(width, height) * 0.7;
                const s = min(width, height) / n;

                const textIndex = this.textIndex_ + i * this.isTextArrayChange_ + floor(count) * this.isTextColorChange_;
                const fontIndex = this.fontIndex_ + i * this.isFontArrayChange_ + floor(count) * this.isFontChange2_;

                const str = this.isTextArraySelect_ == 1 ? this.textArray_[0] : this.textArray_[textIndex % this.textArray_.length];
                const ft = this.isFontArraySelect_ == 1 ? FONT_ARRAY[0] : FONT_ARRAY[fontIndex % FONT_ARRAY.length];

                const gap = min(width, height) * 0.005;

                tex.textAlign(CENTER, CENTER);
                tex.textFont(ft);
                tex.textSize(s);
                tex.noStroke();

                const moveY = map(abs(getPhaseWithEasing(count, 2, 1) % 2 - 1), 0, 1, 0, (max(width, height) * 0.7 * 2) / n, p5.Easing.easeInQuint);
                tex.fill(100, this.layerAlpha_);
                tex.text(str, x + gap, y + gap + moveY);

                tex.fill(red(c), green(c), blue(c), this.layerAlpha_);
                tex.text(str, x, y);
            }
        }

        tex.pop();
    }
}
