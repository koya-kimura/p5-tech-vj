class GridScene {
    constructor() {
        this.layerAlpha_ = 0;
        this.gridNum_ = 0;
        this.lineNum_ = 0
        
        this.noiseScaleX_ = 0;
        this.noiseScaleY_ = 0;
        this.enableRotation_ = 0;
        this.lineNoiseScale_ = 0;
        this.gridIncrement_ = 0;
        this.lineIncrement_ = 0;
    }

    midiAssign() {
        // this.layerAlpha_ = 255;
        this.layerAlpha_ = sceneManager.midiManager_.faderValues_[3] * 255;
        this.noiseScaleX_ = sceneManager.midiManager_.gridState(3, 1, "TOGGLED");
        this.noiseScaleY_ = sceneManager.midiManager_.gridState(3, 2, "TOGGLED");
        this.enableRotation_ = sceneManager.midiManager_.gridState(3, 3, "TOGGLED");
        this.lineNoiseScale_ = sceneManager.midiManager_.gridState(3, 4, "TOGGLED");
        this.gridIncrement_ = sceneManager.midiManager_.gridState(3, 5, "ONESHOT");
        this.lineIncrement_ = sceneManager.midiManager_.gridState(3, 6, "ONESHOT");
    }

    update() {
        this.gridNum_ += this.gridIncrement_;
        this.lineNum_ += this.lineIncrement_;
    }

    draw(tex, spectrum) {
        tex.push();
        tex.translate(width / 2, height / 2);

        const n = (this.gridNum_ % 4) * 2 + 1;
        const grid = min(width, height) / n;

        for (let x = - max(width, height) * 0.7; x < max(width, height) * 0.7; x += grid) {
            for (let y = - max(width, height) * 0.7; y < max(width, height) * 0.7; y += grid) {
                const c = COLOR_PALETTE[floor(noise(x * 7628.3179, y * 6528.1287, floor(sceneManager.micAudioManager_.count_)) * 100) % COLOR_PALETTE.length];
                const s = grid;
                const m = this.lineNum_ % 3 + 1;
                const angle = floor(noise(x * this.noiseScaleX_, y * this.noiseScaleY_, floor(count)) * 4) * PI / 2 * this.enableRotation_;

                tex.push();
                tex.translate(x + s / 2, y + s / 2);
                tex.rotate(angle);
                    tex.stroke(red(c), green(c), blue(c), this.layerAlpha_);
                    for (let i = 0; i < m; i++) {
                        const ix = map(noise(x * this.lineNoiseScale_, y * this.lineNoiseScale_, i * 7429.3284 + floor(count)) * 1.4 - 0.2, 0, 1, -s / 2, s / 2);
                        const sw = map(noise(x * this.lineNoiseScale_, y * this.lineNoiseScale_, i * 9182.1297 + floor(count)) * 1.4 - 0.2, 0, 1, 0.1, s / 10);
                        const wx = map(sin(x * 8172.1038 + y * 9712.4872 + count * 2 + i * 0.1), -1, 1, -ix, ix);

                        tex.strokeCap(SQUARE);
                        tex.strokeWeight(sw);
                        tex.line(-s / 2, wx, s / 2, wx);
                }
                tex.pop();
            }
        }
        tex.pop();
    }
}
