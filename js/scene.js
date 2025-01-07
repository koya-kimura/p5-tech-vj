class Scene {
    constructor() {
        this.colorPalette = ["#10ed21", "#ed1938", "#0121ed", "#eded17", "#ed08ed", "#32eded"]


        this.paletteLength = this.colorPalette.length;

        this.tex;
        this.canvasSize;

        this.textArrray = ["FLOW", "VOL4", "TKSM", "KMRK", "P5JS"];
        this.textIndex = 0;
        this.fontIndex = 0;
        this.holNum = 2;
        this.verNum = 2;

        this.canvasPositonX = 0;
        this.canvasPositonY = 0;
        this.canvasAngle = 0;
        this.canvasScale = 1;
        this.canvasAspect = 1;

        this.gridNum = 0;
        this.lineNum = 0;

        this.alpha = 255;
    }

    setup(){
        this.tex = createGraphics(width, height);
        this.canvasSize = max(width, height) * 0.7;
    }

    update(){
        this.textIndex += gridState(7, 0, "ONESHOT");
        this.fontIndex += gridState(7, 4, "ONESHOT");
        this.holNum += gridState(5, 0, "ONESHOT");
        this.verNum += gridState(5, 1, "ONESHOT");

        this.gridNum += gridState(0, 4, "ONESHOT");
        this.lineNum += gridState(0, 5, "ONESHOT");
    }

    objLayer(layerAlpha) {
        this.tex.push();

        this.tex.translate(width / 2, height / 2);
        this.tex.scale(0.5);

        const n = floor(map(noise(floor(count / 4)), 0, 1, 3, 8));
        const m = 10;

        for (let j = 0; j < m; j++) {
            const c = this.colorPalette[j % this.paletteLength];

            this.tex.push();
            this.tex.rotate(noise(j * 7318.1297) * TAU + count * 0.1);
            this.tex.scale(1 + noise(j + 1928.4297) * 5, 1);

            if (noise(j * 1927.4208) > 0.5) {
                this.tex.fill(red(c), green(c), blue(c), map(layerAlpha, 0, 255, 0, 200));
                this.tex.noStroke();
            } else {
                this.tex.noFill();
                this.tex.stroke(red(c), green(c), blue(c), layerAlpha);
            }

            this.tex.beginShape();
            for (let i = 0; i < n; i++) {
                const radius = this.canvasSize * map(pow(noise(count, j), 4), 0, 1, 0.1, 0.5 + spectrum[8] * 0.5);
                const angle = noise(j) * TAU + i * TAU / n;
                const x = cos(angle) * radius;
                const y = sin(angle) * radius;

                this.tex.vertex(x, y);
            }
            this.tex.endShape(CLOSE);
            this.tex.pop();
        }

        this.tex.pop();
    }

    audioLayer(layerAlpha) {
        this.tex.push();
        this.tex.translate(width / 2, height / 2);

        const w = this.canvasSize * 2.0;
        const s = min(width, height) * 0.3;

        for (let i in spectrum) {
            const c = this.colorPalette[i % this.paletteLength];
            const x = map(spectrum[i], 0, 1, 0, w);
            const sw = map(x, 0, w, 0.5, 5);

            this.tex.stroke(red(c), green(c), blue(c), layerAlpha);
            this.tex.noFill();
            this.tex.strokeWeight(sw);
            this.tex.line(x, -this.canvasSize, x, this.canvasSize);
            this.tex.line(-x, -this.canvasSize, -x, this.canvasSize);

            const y = map(sin(noise(i) * TAU + count * 0.5), -1, 1, -this.canvasSize, this.canvasSize);

            this.tex.fill(red(c), green(c), blue(c), layerAlpha);
            this.tex.noStroke();
            this.tex.ellipse(x, y, s);
            this.tex.ellipse(-x, y, s);
        }
        this.tex.pop();
    }

    textLayer(layerAlpha) {
        this.canvasAngle = gridState(4, 0, "TOGGLED") == 1 ? interpolateNoiseWithEasing(count, 16, 4, p5.Easing.easeInOutSine, -PI, PI) : 0;

        this.tex.push();
        this.tex.translate(width / 2, height / 2);
        this.tex.translate(this.canvasPositonX, this.canvasPositonY);
        this.tex.rotate(this.canvasAngle);
        this.tex.scale(1.5, 0.7)

        const m = this.holNum % 5;
        const n = (this.verNum % 3) * 10 + 3;

        for (let j = -m; j <= m; j++) {
            for (let i = 0; i < n; i++) {
                const index = floor(noise(i*9422.1298, j*3192.2493)*100);
                const c = this.colorPalette[index%this.paletteLength];

                const x = m == 0 ? 0 : map(j, -m, m, -this.canvasSize, this.canvasSize);
                const y = (i * (this.canvasSize * 2) / n + frameCount) % (this.canvasSize * 2) - this.canvasSize;
                const s = min(width, height) / n;

                const textIndex = this.textIndex + i * gridState(7, 1, "TOGGLED") + floor(count) * gridState(7, 2, "TOGGLED");
                const fontIndex = this.fontIndex + i * gridState(7, 5, "TOGGLED") + floor(count) * gridState(7, 6, "TOGGLED");

                const str = gridState(7, 3, "TOGGLED") == 1 ? this.textArrray[0] : this.textArrray[textIndex % this.textArrray.length];
                const ft = gridState(7, 7, "TOGGLED") == 1 ? FONT_ARRAY[0] : FONT_ARRAY[fontIndex % FONT_ARRAY.length];

                const gap = min(width, height) * 0.005;

                this.tex.textAlign(CENTER, CENTER);
                this.tex.textFont(ft);
                this.tex.textSize(s);
                this.tex.noStroke();

                const moveY = map(abs(getPhaseWithEasing(count, 2, 1) % 2 - 1), 0, 1, 0, (this.canvasSize * 2) / n, p5.Easing.easeInQuint);
                this.tex.fill(100, layerAlpha);
                this.tex.text(str, x + gap, y + gap + moveY);

                this.tex.fill(red(c), green(c), blue(c), layerAlpha);
                this.tex.text(str, x, y);
            }
        }

        this.tex.pop();
    }

    gridLayer(layerAlpha){
        this.tex.push();
        this.tex.translate(width / 2, height / 2);

        const n = (this.gridNum % 4) * 2 + 1;
        const grid = min(width, height) / n;

        for(let x = - this.canvasSize; x < this.canvasSize; x += grid){
            for(let y = - this.canvasSize; y < this.canvasSize; y += grid){
                const c = this.colorPalette[floor(noise(x * 7628.3179, y * 6528.1287, floor(count)) * 100) % this.paletteLength];
                const type = (noise(x * 7628.3179, y * 6528.1287, floor(count)) > 0.5 && gridState(0, 6, "TOGGLED") == 1) ? 1 : 0;
                const s = grid;
                const m = this.lineNum % 3 + 1;
                const angle = floor(noise(x * gridState(0, 1, "TOGGLED"), y * gridState(0, 2, "TOGGLED"), floor(count)) * 4) * PI / 2 * gridState(0, 3, "TOGGLED");

                this.tex.push();
                this.tex.translate(x + s / 2, y + s / 2);
                this.tex.rotate(angle);
                if (type == 0) {
                    this.tex.stroke(red(c), green(c), blue(c), layerAlpha);
                    for(let i = 0; i < m; i++){
                        const ix = map(noise(x * gridState(0, 0, "TOGGLED"), y * gridState(0, 0, "TOGGLED"), i * 7429.3284 + floor(count))*1.4-0.2, 0, 1, -s/2, s/2);
                        const sw = map(noise(x * gridState(0, 0, "TOGGLED"), y * gridState(0, 0, "TOGGLED"), i * 9182.1297 + floor(count))*1.4-0.2, 0, 1, 0.1, s/10);
                        const wx = map(sin(x * 8172.1038 + y * 9712.4872 + count * 2 + i * 0.1), -1, 1, -ix, ix);

                        this.tex.strokeCap(SQUARE);
                        this.tex.strokeWeight(sw);
                        this.tex.line(-s / 2, wx, s / 2, wx);
                    }
                } else {
                    this.tex.fill(red(c), green(c), blue(c), layerAlpha);
                    this.tex.noStroke();
                    for(let i = 0; i < 100; i ++){
                        this.tex.arc(-s/2, -s/2, s*2, s*2, 0, PI*0.5);
                    }
                }
                this.tex.pop();
            }
        }
        this.tex.pop();
    }

    randomLayer(layerAlpha){
        const sceneNum = floor(count) % 4;
        if(sceneNum == 0){
            this.gridLayer(layerAlpha);
        } else if(sceneNum == 1){
            this.textLayer(layerAlpha);
        } else if(sceneNum == 2){
            this.audioLayer(layerAlpha);
        } else if(sceneNum == 3){
            this.objLayer(layerAlpha);
        }
    }

    display(){
        this.alpha = map(faderValues[6], 0, 1, 255, 0);
        this.tex.background(0, this.alpha);

        this.randomLayer(faderValues[4] * 255);
        this.gridLayer(faderValues[3] * 255);
        this.textLayer(faderValues[2] * 255);
        this.audioLayer(faderValues[1] * 255);
        this.objLayer(faderValues[0] * 255);
    }

    getScene(){
        return this.tex;
    }
}