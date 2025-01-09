class MicAudioManager {
    constructor(bpm, debugOutput = false, dummyOutput = true) {
        this.bpm_ = bpm;
        this.mic_ = null;
        this.fft_ = null;
        this.spectrum_ = null;
        this.debugOutput_ = debugOutput;
        this.dummyOutput_ = dummyOutput;
        this.count_ = 0
        this.keyPressTimes_ = []; // キーボードを叩いた時刻を記録する配列
        this.maxTimeDiff_ = 2000; // 2秒以上経過したデータは捨てる
    }

    setup(fftAnalysisSize = 16) {
        this.mic_ = new p5.AudioIn();
        this.mic_.start();
        if (this.debugOutput_) this.mic_.connect();

        this.fft_ = new p5.FFT(0.8, fftAnalysisSize);
        this.fft_.setInput(this.mic_);

        if(this.dummyOutput_) terminal.log("mic audio dummy output enabled");
    }

    analyze() {
        this.count_ = this.beatCount(this.bpm_);
        this.spectrum_ = this.fft_.analyze();

        for (let i in this.spectrum_) {
            this.spectrum_[i] = map(this.spectrum_[i], 0, 255, 0, 1);
        }

        // Check and replace spectrum with noise if conditions are met
        this.dummyNoiseDataCheke();
    }

    dummyNoiseDataCheke() {
        if (this.dummyOutput_ && this.spectrum_.every(value => value <= 0.1)) {
            const noiseData = [];
            for (let i = 0; i < this.spectrum_.length; i++) {
                const baseValue = pow(i / this.spectrum_.length, 2);
                const gap = 0.3;
                const spectrumValue = max(map(noise(i, frameCount * 0.2), 0, 1, baseValue - gap * 0.5, baseValue + gap * 0.5), 0);
                noiseData.push(spectrumValue);
            }
            this.spectrum_ = noiseData;
        }
    }

    recordKeyPressTime() {
        const currentTimeMs = millis();
        this.keyPressTimes_.push(currentTimeMs);

        this.keyPressTimes_ = this.keyPressTimes_.filter(time => currentTimeMs - time <= this.maxTimeDiff_);

        // 直近の2つの時刻の差分からBPMを計算
        if (this.keyPressTimes_.length >= 5) {
            let totalDiffMs = 0;
            for (let i = 1; i < 5; i++) {
                totalDiffMs += this.keyPressTimes_[this.keyPressTimes_.length - i] - this.keyPressTimes_[this.keyPressTimes_.length - i - 1];
            }
            const averageDiffMs = totalDiffMs / 4;
            const bpm = 60000 / averageDiffMs;
            this.updateBpm(bpm);
        }
    }

    updateBpm(newBpm) {
        this.bpm_ = newBpm;
        terminal.log(`BPM updated to: ${this.bpm_}`);
    }

    beatCount(bpm) {
        const beatIntervalMs = (60 / bpm) * 1000;
        const currentTimeMs = millis();
        return currentTimeMs / beatIntervalMs;
    }
}
