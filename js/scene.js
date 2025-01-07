class Scene {
    constructor() {
        this.tex;
        this.textArrray = ["FLOW", "WOLF", "YEAH", "TAKASIMA", "KIMURA"];
        this.textIndex = 0;
        this.fontIndex = 0;
    }

    setup(){
        this.tex = createGraphics(width, height);
    }

    update(){
        this.textIndex += gridState(7, 0, "ONESHOT");
        this.fontIndex += gridState(7, 4, "ONESHOT");
    }

    display(){
        this.tex.clear();
        this.tex.background(0);

        const canvasSize = max(width, height);

        this.tex.push();
        this.tex.translate(width / 2, height / 2);

        for (let i = 0; i < 10; i++) {
            const textIndex = this.textIndex + i * gridState(7, 1, "TOGGLED") + floor(count) * gridState(7, 2, "TOGGLED");
            const fontIndex = this.fontIndex + i * gridState(7, 5, "TOGGLED") + floor(count) * gridState(7, 6, "TOGGLED");

            const str = gridState(7, 3, "TOGGLED") == 1 ? this.textArrray[0] : this.textArrray[textIndex % this.textArrray.length];
            const ft = gridState(7, 7, "TOGGLED") == 1 ? FONT_ARRAY[0] : FONT_ARRAY[fontIndex % FONT_ARRAY.length];

            const y = (i * (canvasSize + 400) * 0.1 + frameCount) % (canvasSize + 400) - 200 - canvasSize * 0.5;
            const gap = min(width, height) * 0.005;

            this.tex.textAlign(CENTER, CENTER);
            this.tex.textFont(ft);
            this.tex.textSize(100);
            this.tex.noStroke();

            this.tex.fill(100);
            this.tex.text(str, 0 + gap, y + gap);

            this.tex.fill(255);
            this.tex.text(str, 0, y);
        }

        this.tex.pop();
    }

    getScene(){
        return this.tex;
    }
}