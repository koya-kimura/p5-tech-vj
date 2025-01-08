class SceneManager {
    constructor(bpm = 130, debugOutput = false) {
        this.midiManager_ = new APCMiniMK2Manager();
        this.micAudioManager_ = new MicAudioManager(bpm, debugOutput);

        this.frame_ = new Frame();
        this.frameTex_ = null;

        this.scenes_ = [
            new SoundObjectScene(),
            new SampleScene(),
            new SampleScene(),
            new SampleScene(),
        ];
        this.sceneTex_ = null;

        this.postShader_ = null;
    }

    loadPostShader(vertFilePath, fragFilePath) {
        this.postShader_ = loadShader(vertFilePath, fragFilePath);
    }

    setup() {
        this.sceneTex_ = createGraphics(width, height);
        this.frameTex_ = createGraphics(width, height);

        this.micAudioManager_.setup();
    }

    resize() {
        this.sceneTex_.resizeCanvas(width, height);
        this.frameTex_.resizeCanvas(width, height);
    }

    update() {
        this.micAudioManager_.analyze();
        this.midiManager_.update();

        for (const scene of this.scenes_) {
            scene.update();
            scene.midiAssign();
        }
    }

    draw() {
        this.sceneTex_.background(0);
        for (const scene of this.scenes_) {
            scene.draw(this.sceneTex_, this.micAudioManager_.spectrum_);
        }

        const midiInfo = { gridPressedState: this.midiManager_.gridPressedState_, sideButtonToggleState: this.midiManager_.sideButtonToggleState_, faderButtonToggleState: this.midiManager_.faderButtonToggleState_, faderValues: this.midiManager_.faderValues_ };
        const audioInfo = { spectrum: this.micAudioManager_.spectrum_ };
        this.frame_.display(this.frameTex_, midiInfo, audioInfo);

        shader(this.postShader_);

        this.postShader_.setUniform("u_time", frameCount * 0.01);
        this.postShader_.setUniform("u_time", millis() * 0.001);
        this.postShader_.setUniform("u_resolution", [width, height]);
        this.postShader_.setUniform("u_mainTex", this.sceneTex_);
        this.postShader_.setUniform("u_frameTex", this.frameTex_);

        this.midiShaderAssign();

        rect(0, 0, width, height);
    }

    midiShaderAssign() {

    }
}