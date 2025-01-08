class MicAudioManager {
    constructor(bpm, debugOutput=false){
        this.bpm_ = bpm;
        this.mic_ = null;
        this.fft_ = null;
        this.spectrum_ = null;
        this.debugOutput_ = debugOutput;
    }

    setup(fftAnalysisSize=16){
        this.mic_ = new p5.AudioIn();
        this.mic_.start();
        if (this.debugOutput_) this.mic_.connect();

        this.fft_ = new p5.FFT(0.8, fftAnalysisSize);
        this.fft_.setInput(this.mic_);
    }

    analyze(){
        this.spectrum_ = this.fft_.analyze();

        for (let i in this.spectrum_) {
            this.spectrum_[i] = map(this.spectrum_[i], 0, 255, 0, 1);
        }
    }

    beatCount(bpm) {
        const beatIntervalMs = (60 / bpm) * 1000;
        const currentTimeMs = this.millis();
        return currentTimeMs / beatIntervalMs;
    }
}