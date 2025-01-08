/**
 * ログメッセージを管理するクラス
 * ゲーム内のメッセージ表示やデバッグ情報の表示に使用
 */
class LogManager {
    /**
     * @param {number} lifetime - メッセージの表示時間（フレーム数）
     */
    constructor(fadetime = 15) {
        this.logMessages = [];  // ログメッセージを格納する配列
        this.fadetime = fadetime;  // デフォルトの表示時間
    }

    /**
     * 新しいログメッセージを追加
     * @param {string} msg - 表示するメッセージ
     */
    log(msg) {
        const timestamp = this.getCurrentTime();
        this.logMessages.push(new LogMessage(timestamp + " " + msg, this.fadetime));
    }

    fpsLog(){
        if(frameCount % 600 == 0) {
            this.log("FramePerSecond : " + frameRate().toFixed(2));
        }
    }

    /**
     * 現在時刻をHH:MM:SS.MMMの形式で取得する
     * @returns {string} HH:MM:SS.MMM形式の時刻文字列
     * @example
     * // 戻り値の例: "14:30:05.123"
     */
    getCurrentTime() {
        // 現在の日時オブジェクトを作成
        let now = new Date();

        // 時、分、秒、ミリ秒を取得して適切な桁数の文字列に変換
        let hours = String(now.getHours()).padStart(2, '0');
        let minutes = String(now.getMinutes()).padStart(2, '0');
        let seconds = String(now.getSeconds()).padStart(2, '0');
        let milliseconds = String(now.getMilliseconds()).padStart(3, '0');

        // HH:MM:SS.MMMの形式で返す
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }

    /**
     * すべてのログメッセージを表示
     * @param {number} x - 表示領域の左上X座標
     * @param {number} y - 表示領域の左上Y座標
     * @param {number} w - 表示領域の幅
     * @param {number} h - 表示領域の高さ
     * @param {object} tex - テキスト描画用のオブジェクト（オプション）
     */
    display(x, y, fsz, h, tex) {
        if (h < this.logMessages.length * fsz * 1.5){
            this.logMessages.splice(0, 1);
        }
        for (let i = this.logMessages.length - 1; i >= 0; i--) {
            const logMessage = this.logMessages[i];
            logMessage.update();

            // テキストの描画位置を計算
            const adjustedX = x;
            const adjustedY = y + (this.logMessages.length - i) * fsz * 1.5;

            logMessage.display(adjustedX, adjustedY, fsz, tex);
        }
    }
}

/**
 * 個別のログメッセージを管理するクラス
 */
class LogMessage {
    /**
     * @param {string} msg - 表示するメッセージ
     * @param {number} lifetime - メッセージの表示時間
     */
    constructor(msg, fadetime) {
        this.msg = msg;
        this.fadetime = fadetime;
        this.time = 0;
    }

    /**
     * メッセージの状態を更新
     */
    update() {
        this.time++
    }

    /**
     * メッセージを表示
     * @param {number} x - 表示位置X座標
     * @param {number} y - 表示位置Y座標
     * @param {object} tex - テキスト描画用のオブジェクト（オプション）
     */
    display(x, y, fsz, tex) {
        const alpha = pow(map(this.time, 0, this.fadetime, 0, 1), 1)*255;
        if (tex) {
            tex.push();
            tex.fill(255, alpha);
            tex.textSize(fsz);
            tex.text(this.msg, x, y);
            tex.pop();
        } else {
            push();
            fill(255, alpha);
            textSize(fsz);
            text(this.msg, x, y);
            pop();
        }
    }
}