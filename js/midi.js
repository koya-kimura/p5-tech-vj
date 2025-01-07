/**
 * MIDIの出力デバイスを保持する変数
 * 初期化時はnull、デバイス接続後に有効なMIDI出力ポートが設定される
 */
let midiOutput = null;

/**
 * 8x8のグリッド状態を保持する2次元配列
 * gridState: ボタンが押されている間のみ1、離すと0になる（モメンタリー動作）
 * gridToggleState: ボタンを押すたびに0と1が切り替わる（トグル動作）
 */
let gridPressedState = Array(8).fill().map(() => Array(8).fill(0));
let gridPrevState = Array(8).fill().map(() => Array(8).fill(0));
let gridOneShotState = Array(8).fill().map(() => Array(8).fill(0));
let gridToggleState = Array(8).fill().map(() => Array(8).fill(0));
/**
 * グリッドの状態を保持する2次元配列
 * gridStateType: ボタンの種類（ONESHOT, TOGGLED, PRESSED）
 */
const gridStateType = [
    ["ONESHOT", "TOGGLED", "TOGGLED", "TOGGLED", "ONESHOT", "TOGGLED", "TOGGLED", "TOGGLED"],
    ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
    ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
    ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
    ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
    ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
    ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
    ["PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED", "PRESSED"],
]

/**
 * フェーダーの値を保持する配列（0-1の範囲）
 * faderValues: 現在のフェーダー位置を反映する値（ミュート状態を考慮した最終的な値）
 * faderValuesPrev: 前回のフェーダー位置を記録する値（ミュート解除時に復帰させる値）
 */
let faderValues = new Array(9).fill(0);
let faderValuesPrev = new Array(9).fill(0);

/**
 * フェーダーボタンの状態を保持する配列
 * faderButtonState: ボタンが押されている間のみ1（モメンタリー動作）
 * faderButtonToggleState: ボタンを押すたびに0/1切り替え（トグル動作）
 * 1の時はミュート（faderValue = 0）、0の時は直前の値を反映
 */
let faderButtonState = new Array(9).fill(0);
let faderButtonToggleState = new Array(9).fill(0);

/**
 * サイドボタンの状態を保持する配列
 * sideButtonState: ボタンが押されている間のみ1（モメンタリー動作）
 * sideButtonToggleState: ボタンを押すたびに0/1切り替え（トグル動作）
 */
let sideButtonState = new Array(8).fill(0);
let sideButtonToggleState = new Array(8).fill(0);

/**
 * フェーダー値を更新する関数
 * トグル状態に応じてフェーダー値を設定する
 * @param {number} index - フェーダーのインデックス
 */
function updateFaderValue(index) {
    // トグル状態が1（ミュート）の場合は0を設定
    // トグル状態が0の場合は直前の値を設定
    faderValues[index] = faderButtonToggleState[index] ? 0 : faderValuesPrev[index];
}

/**
 * MIDIメッセージを受信したときの処理
 * @param {MIDIMessageEvent} message - 受信したMIDIメッセージ
 */
function onMIDIMessage(message) {
    const [status, note, velocity] = message.data;

    // フェーダーボタンとサイドボタンの処理（ノートオンメッセージ）
    if (status === 144) {
        // フェーダーボタンの処理（ノート番号: 100-107）
        if (note >= 100 && note <= 107 || note == 122) {
            const buttonIndex = note >= 100 && note <= 107 ? note - 100 : 8;
            // モメンタリー動作の状態更新（押している間のみ1）
            faderButtonState[buttonIndex] = 1;
            // トグル動作の状態更新（押したときのみ切り替え）
            if (velocity > 0) {
                faderButtonToggleState[buttonIndex] = 1 - faderButtonToggleState[buttonIndex];
                // トグル状態が変更されたらフェーダー値を更新
                updateFaderValue(buttonIndex);
            }
        }
        // サイドボタンの処理（ノート番号: 112-119）
        else if (note >= 112 && note <= 119) {
            const buttonIndex = note - 112;
            sideButtonState[buttonIndex] = 1;
            if (velocity > 0) {
                sideButtonToggleState[buttonIndex] = 1 - sideButtonToggleState[buttonIndex];
            }
        }
    }

    // グリッドボタンの処理（ノートオン/オフメッセージ）
    if ((status === 144 || status === 128) && note >= 0 && note <= 63) {
        const row = Math.floor(note / 8);
        const col = note % 8;
        gridPressedState[row][col] = velocity > 0 ? 1 : 0;
        if (velocity > 0) {
            gridToggleState[row][col] = 1 - gridToggleState[row][col];
        }
    }
    // フェーダーの処理（コントロールチェンジメッセージ）
    else if (status === 176 && note >= 48 && note <= 56) {
        const faderIndex = note - 48;
        // フェーダー値を0-1の範囲に正規化
        const normalizedValue = velocity / 127;
        // 直前の値を保存
        faderValuesPrev[faderIndex] = normalizedValue;
        // トグル状態に応じてフェーダー値を更新
        updateFaderValue(faderIndex);
    }
}

/**
 * MIDIメッセージを出力デバイスに送信する関数
 * すべての状態をモメンタリー動作（非トグル）の値で送信
 */
function midiOutputSend() {
    if (!midiOutput) return;

    // フェーダーボタンの状態を送信
    for (let i = 0; i < 9; i++) {
        if(i < 8){
            midiOutput.send([0x90, 100 + i, faderButtonToggleState[i] * 127]);
        } else {
            // 光らず...
            midiOutput.send([0x90, 122, faderButtonToggleState[i] * 127]);
        }
    }

    // サイドボタンの状態を送信
    for (let i = 0; i < 8; i++) {
        midiOutput.send([0x90, 112 + i, sideButtonToggleState[i] * 127]);
    }

    // グリッドの状態を送信
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const k = map(i, 0, 7, 7, 0);
            let state;
            if(gridStateType[k][j] === "ONESHOT"){
                state = gridOneShotState[i][j];
            } else if(gridStateType[k][j] === "TOGGLED"){
                state = gridToggleState[i][j];
            } else if(gridStateType[k][j] === "PRESSED"){
                state = gridPressedState[i][j];
            } else {
                state = 0;
            }
            midiOutput.send([0x90, i * 8 + j, state * 127]);
        }
    }

    // フェーダー値の送信
    for (let i = 0; i < 9; i++) {
        midiOutput.send([0xB0, 48 + i, Math.round(faderValues[i] * 127)]);
    }
}

/**
 * MIDIデバイスの接続成功時の処理
 * @param {MIDIAccess} midiAccess - MIDIアクセスオブジェクト
 */
function onMIDISuccess(midiAccess) {
    const inputs = midiAccess.inputs.values();
    const input = inputs.next();

    // 入力デバイスが見つからない場合
    if (input.done) {
        console.log("MIDI device not found");
        midiSuccess = false;
        return;
    }

    try {
        console.log("MIDI device ready!");
        console.log("Manufacturer:", input.value.manufacturer);
        console.log("Input:", input.value.name);

        // MIDIメッセージ受信時のコールバック設定
        input.value.onmidimessage = onMIDIMessage;

        // 出力ポートの確認
        let outputs = Array.from(midiAccess.outputs.values());

        if (outputs.length > 0) {
            midiOutput = outputs[0];
            console.log("MIDI output port:", midiOutput.name);
            midiSuccess = true;
        } else {
            console.log("MIDI output port not found");
            midiSuccess = false;
        }
    } catch (error) {
        console.error("MIDI device access error:", error);
        midiSuccess = false;
    }
}

/**
 * MIDIデバイスの接続失敗時の処理
 * @param {string} msg - エラーメッセージ
 */
function onMIDIFailure(msg) {
    console.log("MIDIアクセスに失敗しました - " + msg);
}

function gridState(row, col, type="TOGGLED"){
    if(type === "TOGGLED"){
        return gridToggleState[row][col];
    } else if(type === "ONESHOT"){
        return gridOneShotState[row][col];
    } else if(type === "PRESSED"){
        return gridPressedState[row][col];
    } else {
        return 0;
    }
}