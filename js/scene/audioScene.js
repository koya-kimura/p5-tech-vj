class AudioScene {
    constructor(){
        this.layerAlpha_ = 0;
    }

    midiAssign() {
        this.layerAlpha_ = sceneManager.midiManager_.faderValues_[3] * 255;
    }

    update(){

    }

    draw(tex, spectrum){
        tex.noStroke();
        tex.fill(255, 0, 0, this.layerAlpha_);
        tex.circle(width / 2, height / 2, 100);
    }
}