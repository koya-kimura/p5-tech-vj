/**
 * APC Mini MK2 MIDIコントローラーを管理するクラス
 * MIDIManagerクラスを継承し、APC Mini MK2の特定の機能を実装
 */
class APCMiniMK2Manager extends MIDIManager {
    constructor() {
        super();

        // グリッドの状態を管理する配列
        this.gridPressedState_ = Array(8).fill().map(() => Array(8).fill(0));  // 現在の押下状態
        this.gridPrevState_ = Array(8).fill().map(() => Array(8).fill(0));     // 前回の押下状態
        this.gridOneShotState_ = Array(8).fill().map(() => Array(8).fill(0));  // ワンショット状態
        this.gridToggleState_ = Array(8).fill().map(() => Array(8).fill(0));   // トグル状態

        // グリッドの各ボタンの動作タイプを定義
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

        // フェーダー関連の状態を管理する配列
        this.faderValues_ = new Array(9).fill(0);             // 現在のフェーダー値
        this.faderValuesPrev_ = new Array(9).fill(0);        // 前回のフェーダー値
        this.faderButtonState_ = new Array(9).fill(0);       // フェーダーボタンの押下状態
        this.faderButtonToggleState_ = new Array(9).fill(0); // フェーダーボタンのトグル状態

        // サイドボタンの状態を管理する配列
        this.sideButtonState_ = new Array(8).fill(0);        // サイドボタンの押下状態
        this.sideButtonToggleState_ = new Array(8).fill(0);  // サイドボタンのトグル状態
    }

    /**
     * グリッドの状態を取得するメソッド
     * @param {number} row - 行番号
     * @param {number} col - 列番号
     * @param {string} type - 状態タイプ（"TOGGLED", "ONESHOT", "PRESSED"）
     * @return {number} 指定された状態の値
     */
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

    /**
     * フレームごとの更新処理を行うメソッド
     */
    update() {
        // ワンショット状態の更新
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.gridOneShotState_[i][j] = max(this.gridPressedState_[i][j] - this.gridPrevState_[i][j], 0);
            }
        }

        // MIDI出力の送信
        if (this.midiSuccess_) {
            this.midiOutputSend();
        }

        // 前回の状態を保存
        this.gridPrevState_ = structuredClone(this.gridPressedState_);
    }

    /**
     * フェーダー値を更新するメソッド
     * @param {number} index - フェーダーのインデックス
     */
    updateFaderValue(index) {
        this.faderValues_[index] = this.faderButtonToggleState_[index] ? 0 : this.faderValuesPrev_[index];
    }

    /**
     * MIDIメッセージを受信した際の処理
     * @param {MIDIMessageEvent} message - 受信したMIDIメッセージ
     */
    onMIDIMessage(message) {
        const [status, note, velocity] = message.data;

        // フェーダーボタンとサイドボタンの処理
        if (status === 144) {
            if (note >= 100 && note <= 107 || note == 122) {
                const buttonIndex = note >= 100 && note <= 107 ? note - 100 : 8;
                this.faderButtonState_[buttonIndex] = 1;
                if (velocity > 0) {
                    this.faderButtonToggleState_[buttonIndex] = 1 - this.faderButtonToggleState_[buttonIndex];
                    this.updateFaderValue(buttonIndex);
                }
            }
            else if (note >= 112 && note <= 119) {
                const buttonIndex = note - 112;
                this.sideButtonState_[buttonIndex] = 1;
                if (velocity > 0) {
                    this.sideButtonToggleState_[buttonIndex] = 1 - this.sideButtonToggleState_[buttonIndex];
                }
            }
        }

        // グリッドボタンの処理
        if ((status === 144 || status === 128) && note >= 0 && note <= 63) {
            const row = Math.floor(note / 8);
            const col = note % 8;
            this.gridPressedState_[row][col] = velocity > 0 ? 1 : 0;
            if (velocity > 0) {
                this.gridToggleState_[row][col] = 1 - this.gridToggleState_[row][col];
            }
        }
        // フェーダーの処理
        else if (status === 176 && note >= 48 && note <= 56) {
            const faderIndex = note - 48;
            const normalizedValue = velocity / 127;
            this.faderValuesPrev_[faderIndex] = normalizedValue;
            this.updateFaderValue(faderIndex);
        }
    }

    /**
     * MIDI出力を送信するメソッド
     */
    midiOutputSend() {
        if (!this.midiOutput_) return;

        // フェーダーボタンの状態を送信
        for (let i = 0; i < 9; i++) {
            if (i < 8) {
                this.midiOutput_.send([0x90, 100 + i, this.faderButtonToggleState_[i] * 127]);
            } else {
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
}
