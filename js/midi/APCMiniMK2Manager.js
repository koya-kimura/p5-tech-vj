class APCMiniMK2Manager extends MIDIManager {
    constructor() {
        super();

        this.gridPressedState_ = Array(8).fill().map(() => Array(8).fill(0));
        this.gridPrevState_ = Array(8).fill().map(() => Array(8).fill(0));
        this.gridOneShotState_ = Array(8).fill().map(() => Array(8).fill(0));
        this.gridToggleState_ = Array(8).fill().map(() => Array(8).fill(0));
        this.gridStateType_ = [
            ["ONESHOT", "TOGGLED", "TOGGLED", "TOGGLED", "ONESHOT", "TOGGLED", "TOGGLED", "TOGGLED"],
            ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
            ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
            ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
            ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
            ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
            ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
            ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
        ]
        this.faderValues_ = new Array(9).fill(0);
        this.faderValuesPrev_ = new Array(9).fill(0);
        this.faderButtonState_ = new Array(9).fill(0);
        this.faderButtonToggleState_ = new Array(9).fill(0);
        this.sideButtonState_ = new Array(8).fill(0);
        this.sideButtonToggleState_ = new Array(8).fill(0);
    }

    update(){
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.gridOneShotState_[i][j] = max(this.gridPressedState_[i][j] - this.gridPrevState_[i][j], 0);
            }
        }

        if (this.midiSuccess_) {
            this.midiOutputSend();
        }

        this.gridPrevState_ = structuredClone(this.gridPressedState_);
    }

    updateFaderValue(index) {
        // トグル状態が1（ミュート）の場合は0を設定
        // トグル状態が0の場合は直前の値を設定
        this.faderValues_[index] = this.faderButtonToggleState_[index] ? 0 : this.faderValuesPrev_[index];
    }

    onMIDIMessage(message) {
        const [status, note, velocity] = message.data;

        // フェーダーボタンとサイドボタンの処理（ノートオンメッセージ）
        if (status === 144) {
            // フェーダーボタンの処理（ノート番号: 100-107）
            if (note >= 100 && note <= 107 || note == 122) {
                const buttonIndex = note >= 100 && note <= 107 ? note - 100 : 8;
                // モメンタリー動作の状態更新（押している間のみ1）
                this.faderButtonState_[buttonIndex] = 1;
                // トグル動作の状態更新（押したときのみ切り替え）
                if (velocity > 0) {
                    this.faderButtonToggleState_[buttonIndex] = 1 - this.faderButtonToggleState_[buttonIndex];
                    // トグル状態が変更されたらフェーダー値を更新
                    this.updateFaderValue(buttonIndex);
                }
            }
            // サイドボタンの処理（ノート番号: 112-119）
            else if (note >= 112 && note <= 119) {
                const buttonIndex = note - 112;
                this.sideButtonState_[buttonIndex] = 1;
                if (velocity > 0) {
                    this.sideButtonToggleState_[buttonIndex] = 1 - this.sideButtonToggleState_[buttonIndex];
                }
            }
        }

        // グリッドボタンの処理（ノートオン/オフメッセージ）
        if ((status === 144 || status === 128) && note >= 0 && note <= 63) {
            const row = Math.floor(note / 8);
            const col = note % 8;
            this.gridPressedState_[row][col] = velocity > 0 ? 1 : 0;
            if (velocity > 0) {
                this.gridToggleState_[row][col] = 1 - this.gridToggleState_[row][col];
            }
        }
        // フェーダーの処理（コントロールチェンジメッセージ）
        else if (status === 176 && note >= 48 && note <= 56) {
            const faderIndex = note - 48;
            // フェーダー値を0-1の範囲に正規化
            const normalizedValue = velocity / 127;
            // 直前の値を保存
            this.faderValuesPrev_[faderIndex] = normalizedValue;
            // トグル状態に応じてフェーダー値を更新
            this.updateFaderValue(faderIndex);
        }
    }

    midiOutputSend() {
        if (!this.midiOutput_) return;

        // フェーダーボタンの状態を送信
        for (let i = 0; i < 9; i++) {
            if (i < 8) {
                this.midiOutput_.send([0x90, 100 + i, this.faderButtonToggleState_[i] * 127]);
            } else {
                // 光らず...
                this.midiOutput_.send([0x90, 122, this.faderButtonToggleState_[i] * 127]);
            }
        }

        // サイドボタンの状態を送信
        for (let i = 0; i < 8; i++) {
            this.midiOutput_.send([0x90, 112 + i, this.sideButtonToggleState_[i] * 127]);
        }

        // グリッドの状態を送信
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const k = map(i, 0, 7, 7, 0);
                let state;
                if (this.gridStateType_[k][j] === "ONESHOT") {
                    state = this.gridOneShotState_[i][j];
                } else if (this.gridStateType_[k][j] === "TOGGLED") {
                    state = this.gridToggleState_[i][j];
                } else if (this.gridStateType_[k][j] === "PRESSED") {
                    state = this.gridPressedState_[i][j];
                } else {
                    state = 0;
                }
                this.midiOutput_.send([0x90, i * 8 + j, state * 127]);
            }
        }

        // フェーダー値の送信
        for (let i = 0; i < 9; i++) {
            this.midiOutput_.send([0xB0, 48 + i, Math.round(this.faderValues_[i] * 127)]);
        }
    }

    gridState(row, col, type = "TOGGLED") {
        if (type === "TOGGLED") {
            return this.gridToggleState_[row][col];
        } else if (type === "ONESHOT") {
            return this.gridOneShotState_[row][col];
        } else if (type === "PRESSED") {
            return this.gridPressedState_[row][col];
        } else {
            return 0;
        }
    }
}