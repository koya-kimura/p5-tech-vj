class SoundObjectScene {
    constructor(){
        this.layerAlpha_ = 0;
    }

    midiAssign() {
        this.layerAlpha_ = sceneManager.midiManager_.faderValues_[0] * 255;
    }

    update(){

    }

    draw(tex, spectrum){
        tex.push();

        tex.translate(width / 2, height / 2);
        tex.scale(0.5);

        const n = floor(map(noise(floor(count / 4)), 0, 1, 3, 8));
        const m = 10;

        for (let j = 0; j < m; j++) {
            const c = COLOR_PALETTE[j % COLOR_PALETTE.length];

            tex.push();
            tex.rotate(noise(j * 7318.1297) * TAU + count * 0.1);
            tex.scale(1 + noise(j + 1928.4297) * 5, 1);

            if (noise(j * 1927.4208) > 0.5) {
                tex.fill(red(c), green(c), blue(c), map(this.layerAlpha_, 0, 255, 0, 200));
                tex.noStroke();
            } else {
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