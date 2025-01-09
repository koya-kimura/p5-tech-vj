class SceneManager {
    constructor(bpm = 130, debugOutput = false) {
        this.midiManager_ = new APCMiniMK2Manager();
        this.micAudioManager_ = new MicAudioManager(bpm, debugOutput);

        this.frame_ = new Frame();
        this.frameTex_ = null;

        this.scenes_ = [];
        this.sceneTex_ = null;

        this.postShader_ = null;
    }

    loadPostShader(vertFilePath, fragFilePath) {
        this.postShader_ = loadShader(vertFilePath, fragFilePath);
    }

    setup() {
        this.sceneTex_ = createGraphics(width, height);
        this.frameTex_ = createGraphics(width, height);

        this.scenes_ = [
            new GridScene(),
            new TextScene(),
            new AudioScene(),
            new SoundObjectScene(),
        ];

        this.micAudioManager_.setup();
    }

    resize() {
        this.sceneTex_.resizeCanvas(width, height);
        this.frameTex_.resizeCanvas(width, height);
    }

    keyPressed(keyCode) {
        if (keyCode == 13){
            this.micAudioManager_.recordKeyPressTime(); // Enter
        }
        if(keyCode == 16){
            this.midiManager_.midiButtonReset(); // Shift
        }
    }

    update() {
        this.micAudioManager_.analyze();
        this.midiManager_.update();

        for (const scene of this.scenes_) {
            scene.midiAssign();
            scene.update();
        }
    }

    draw() {
        const alpha = 255 - this.midiManager_.faderValues_[6] * 255;
        this.sceneTex_.background(0, alpha);
        for (const scene of this.scenes_) {
            scene.draw(this.sceneTex_, this.micAudioManager_.spectrum_);
        }

        const midiInfo = { gridPressedState: this.midiManager_.gridPressedState_, sideButtonToggleState: this.midiManager_.sideButtonToggleState_, faderButtonToggleState: this.midiManager_.faderButtonToggleState_, faderValues: this.midiManager_.faderValues_ };
        const audioInfo = { spectrum: this.micAudioManager_.spectrum_ };
        this.frame_.display(this.frameTex_, midiInfo, audioInfo);

        shader(this.postShader_);

        this.postShader_.setUniform("u_time", frameCount * 0.01);
        this.postShader_.setUniform("u_vol", this.micAudioManager_.spectrum_[floor(this.micAudioManager_.spectrum_.length / 2)]);
        this.postShader_.setUniform("u_flash", frameCount%8==0);
        this.postShader_.setUniform("u_squareCount", squareCount);
        this.postShader_.setUniform("u_time", millis() * 0.001);
        this.postShader_.setUniform("u_resolution", [width, height]);
        this.postShader_.setUniform("u_mainTex", this.sceneTex_);
        this.postShader_.setUniform("u_frameTex", this.frameTex_);

        this.midiShaderAssign();

        rect(0, 0, width, height);
    }

    midiShaderAssign() {
        // 座標系
        this.postShader_.setUniform("u_mirrorEnabled", this.midiManager_.gridState(2, 0, "TOGGLED") == 1);
        this.postShader_.setUniform("u_mosaicEnabled", this.midiManager_.gridState(2, 1, "TOGGLED") == 1);
        this.postShader_.setUniform("u_tileEnabled", this.midiManager_.gridState(2, 2, "TOGGLED") == 1);
        this.postShader_.setUniform("u_gridUVTransformEnabled", this.midiManager_.gridState(2, 3, "TOGGLED") == 1);
        this.postShader_.setUniform("u_rotateAngle", this.midiManager_.gridState(2, 4, "LEAP")*PI/3);
        this.postShader_.setUniform("u_dripEnabled", this.midiManager_.gridState(2, 5, "TOGGLED") == 1);
        this.postShader_.setUniform("u_threeSplitEnabled", this.midiManager_.gridState(2, 6, "TOGGLED") == 1);
        // this.postShader_.setUniform("u_monoEnabled", this.midiManager_.gridState(2, 7, "TOGGLED") == 1);

        // 色系
        this.postShader_.setUniform("u_monoEnabled", this.midiManager_.gridState(1, 0, "TOGGLED")==1);
        this.postShader_.setUniform("u_invertEnabled", this.midiManager_.gridState(1, 1, "TOGGLED") == 1);
        this.postShader_.setUniform("u_posterizationEnabled", this.midiManager_.gridState(1, 2, "TOGGLED") == 1);
        this.postShader_.setUniform("u_binaryEnabled", this.midiManager_.gridState(1, 3, "TOGGLED") == 1);
        this.postShader_.setUniform("u_strobeEnabled", this.midiManager_.gridState(1, 4, "TOGGLED") == 1);
        this.postShader_.setUniform("u_vignetteRadius", this.midiManager_.gridState(1, 5, "LEAP") * 0.5);
        this.postShader_.setUniform("u_rgbShiftScale", pow(this.midiManager_.gridState(1, 6, "LEAP"), 2) * 0.05);
        this.postShader_.setUniform("u_veryCropEnabled", this.midiManager_.gridState(1, 7, "TOGGLED") == 1);
    }
}