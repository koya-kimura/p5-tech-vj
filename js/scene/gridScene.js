class GridScene {
    constructor(){
        this.layerAlpha_ = 0;
        this.gridNum_ = 0;
        this.lineNum_ = 0;

        this.a_ = 0;
        this.b_ = 0;
        this.c_ = 0;
        this.d_ = 0;
        this.e_ = 0;
        this.f_ = 0;
        this.g_ = 0;
    }

    midiAssign() {
        this.layerAlpha_ = sceneManager.midiManager_.faderValues_[1] * 255;

        this.a_ = sceneManager.midiManager_.gridState(0, 6, "TOGGLED") == 1;
        this.b_ = sceneManager.midiManager_.gridState(0, 1, "TOGGLED");
        this.c_ = sceneManager.midiManager_.gridState(0, 2, "TOGGLED");
        this.d_ = sceneManager.midiManager_.gridState(0, 3, "TOGGLED");
        this.e_ = sceneManager.midiManager_.gridState(0, 0, "TOGGLED");
        this.f_ = sceneManager.midiManager_.gridState(0, 4, "ONESHOT");
        this.g_ = sceneManager.midiManager_.gridState(0, 5, "ONESHOT");
    }

    update(){
        this.gridNum_ += this.f_;
        this.lineNum_ += this.g_;
    }

    draw(tex, spectrum){
        tex.push();
        tex.translate(width / 2, height / 2);

        const n = (this.gridNum_ % 4) * 2 + 1;
        const grid = min(width, height) / n;

        for (let x = - max(width, height) * 0.7; x < max(width, height) * 0.7; x += grid) {
            for (let y = - max(width, height) * 0.7; y < max(width, height) * 0.7; y += grid) {
                const c = COLOR_PALETTE[floor(noise(x * 7628.3179, y * 6528.1287, floor(sceneManager.micAudioManager_.count_)) * 100) % COLOR_PALETTE.length];
                const type = (noise(x * 7628.3179, y * 6528.1287, floor(count)) > 0.5 && this.a_) ? 1 : 0;
                const s = grid;
                const m = this.lineNum_ % 3 + 1;
                const angle = floor(noise(x * this.b_, y * this.c_, floor(count)) * 4) * PI / 2 * this.d_;

                tex.push();
                tex.translate(x + s / 2, y + s / 2);
                tex.rotate(angle);
                if (type == 0) {
                    tex.stroke(red(c), green(c), blue(c), this.layerAlpha_);
                    for (let i = 0; i < m; i++) {
                        const ix = map(noise(x * this.e_, y * this.e_, i * 7429.3284 + floor(count)) * 1.4 - 0.2, 0, 1, -s / 2, s / 2);
                        const sw = map(noise(x * this.e_, y * this.e_, i * 9182.1297 + floor(count)) * 1.4 - 0.2, 0, 1, 0.1, s / 10);
                        const wx = map(sin(x * 8172.1038 + y * 9712.4872 + count * 2 + i * 0.1), -1, 1, -ix, ix);

                        tex.strokeCap(SQUARE);
                        tex.strokeWeight(sw);
                        tex.line(-s / 2, wx, s / 2, wx);
                    }
                } else {
                    tex.fill(red(c), green(c), blue(c), this.layerAlpha_);
                    tex.noStroke();
                    for (let i = 0; i < 100; i++) {
                        tex.arc(-s / 2, -s / 2, s * 2, s * 2, 0, PI * 0.5);
                    }
                }
                tex.pop();
            }
        }
        tex.pop();
    }
}