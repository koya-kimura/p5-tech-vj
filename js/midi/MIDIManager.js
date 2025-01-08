class MIDIManager {
    constructor() {
        this.midiOutput_ = null;
        this.midiSuccess_ = false;
    }

    initializeMIDIDevices() {
        setTimeout(() => navigator.requestMIDIAccess().then(
            this.onMIDISuccess.bind(this),
            this.onMIDIFailure.bind(this)
        ), 1000);
    }

    onMIDISuccess(midiAccess) {
        const inputs = midiAccess.inputs.values();
        const input = inputs.next();

        // 入力デバイスが見つからない場合
        if (input.done) {
            terminal.log("MIDI device not found");
            this.midiSuccess_ = false;
            return;
        }

        try {
            terminal.log("MIDI device ready!");
            // terminal.log("Manufacturer:", input.value.manufacturer);
            // terminal.log("Input:", input.value.name);

            // bindを使用してthisのコンテキストを保持
            input.value.onmidimessage = this.onMIDIMessage.bind(this);

            // 出力ポートの確認
            let outputs = Array.from(midiAccess.outputs.values());

            if (outputs.length > 0) {
                this.midiOutput_ = outputs[0];
                // terminal.log("MIDI output port:", this.midiOutput_.name);
                this.midiSuccess_ = true;
            } else {
                terminal.log("MIDI output port not found");
                this.midiSuccess_ = false;
            }
        } catch (error) {
            terminal.error("MIDI device access error:", error);
            this.midiSuccess_ = false;
        }
    }

    onMIDIFailure(msg) {
        terminal.log("MIDI access failed. - " + msg);
    }
}