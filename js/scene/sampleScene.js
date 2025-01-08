class SampleScene {
    constructor(){
        this.layerAlpha_ = 0;
    }

    update(){

    }

    midiAssign(){
        this.layerAlpha_ = sceneManager.midiManager_.faderValues_[1] * 255;
    }

    draw(tex, spectrum){
        tex.noStroke();
        tex.fill(255, 0, 0, this.layerAlpha_);
        tex.circle(width / 2, height / 2, 100);
    }
}