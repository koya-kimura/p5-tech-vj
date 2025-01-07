class Frame {
    constructor() {
        this.tex;
    }

    setup(){
        this.tex = createGraphics(width, height);
    }

    display(){
        this.tex.clear();

        const margin = min(width, height) * 0.1;
        const gap = height * 0.05;

        const w = width * 0.08;
        const h = w * FLOW_LOGO.height / FLOW_LOGO.width;
        this.tex.image(FLOW_LOGO, margin, margin, w, h);

        visualizeGridState(this.tex, gridPressedState, margin, margin+h+gap, w, w);

        visualizeButtonState(this.tex, sideButtonToggleState, margin, margin + h + gap*2 + w, w, w/8, "horizontal");

        visualizeButtonState(this.tex, faderButtonToggleState, margin, margin + h + gap * 3 + w + w/8, w, w/9, "horizontal");

        visualizeFaderValues(this.tex, faderValues, margin, margin + h + gap * 4 + w + w / 8 + w/9, w, w*0.7);

        drawSpectrum(this.tex, spectrum, margin, margin + h + gap * 5 + w + w / 8 + w / 9 + w * 0.7, w, w*0.6);

        drawFrequencyBands(this.tex, width-margin, margin, w*0.3);

        drawDateTime(this.tex, width - margin, height - margin, w*0.1, RIGHT);

        this.tex.noFill();
        this.tex.stroke(255, 50);
        this.tex.rect(margin*0.5, margin*0.5, width-margin, height-margin);

        for(let i = 0; i < 8; i ++){
            const scl = map(abs(getPhaseWithEasing(count+i, 8, 1)%2-1), 0, 1, 0.005, 0.01);
            const s = min(width, height) * scl;
            movingCircleOnRect(this.tex, millis() * 0.1 + i * 100, margin * 0.5, margin * 0.5, width - margin, height - margin, s);
        }
    }

    getFrame(){
        return this.tex;
    }
}

/**
 * グリッドの状態を可視化する関数
 * @param {Array<Array<number>>} gridState - グリッドの状態（0または1の2次元配列）
 * @param {number} x - 描画開始X座標
 * @param {number} y - 描画開始Y座標
 * @param {number} w - グリッド全体の幅
 * @param {number} h - グリッド全体の高さ
 */
function visualizeGridState(tex, gridState, x, y, w, h, c = color(255), scl = 0.8) {
    tex.push();
    tex.translate(x, y);

    const rows = gridState.length;
    const cols = gridState[0].length;
    const cellWidth = w / cols;
    const cellHeight = h / rows;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            tex.stroke(128);  // グレーの枠線
            if (gridState[i][j] === 0) {
                tex.stroke(c);
                tex.noFill();    // 黒
            } else {
                tex.noStroke();
                tex.fill(c);  // 白
            }
            tex.rectMode(CENTER);

            const k = map(i, 0, rows, rows, 0);
            tex.rect(j * cellWidth + cellWidth * 0.5, k * cellHeight + cellHeight * 0.5, cellWidth * scl, cellHeight * scl);
        }
    }
    tex.pop();
}

/**
 * ボタンの状態を可視化する関数
 * @param {Array<number>} buttonState - ボタンの状態（0または1の配列）
 * @param {number} x - 描画開始X座標
 * @param {number} y - 描画開始Y座標
 * @param {number} w - ボタン全体の幅
 * @param {number} h - ボタン全体の高さ
 * @param {string} orientation - 'horizontal'または'vertical'
 */
function visualizeButtonState(tex, buttonState, x, y, w, h, orientation, c = color(255), scl = 0.8) {
    tex.push();
    tex.translate(x, y);

    const buttonCount = buttonState.length;
    const buttonWidth = orientation === 'horizontal' ? w / buttonCount : w;
    const buttonHeight = orientation === 'horizontal' ? h : h / buttonCount;

    for (let i = 0; i < buttonState.length; i++) {
        tex.stroke(128);
        if (buttonState[i] === 0) {
            tex.stroke(c);
            tex.noFill();
        } else {
            tex.noStroke();
            tex.fill(c);
        }

        tex.rectMode(CENTER);
        if (orientation === 'horizontal') {
            tex.rect(i * buttonWidth + buttonWidth * 0.5, buttonHeight * 0.5, buttonWidth * scl, buttonHeight * scl);
        } else {
            tex.rect(buttonWidth * 0.5, i * buttonHeight + buttonHeight * 0.5, buttonWidth * scl, buttonHeight * scl);
        }
    }
    tex.pop();
}

/**
 * フェーダー値を可視化する関数
 * @param {Array<number>} faderValues - フェーダーの値（0-1の配列）
 * @param {number} x - 描画開始X座標（左上）
 * @param {number} y - 描画開始Y座標（左上）
 * @param {number} width - 全体の幅
 * @param {number} height - 全体の高さ
 */
function visualizeFaderValues(tex, faderValues, x, y, w, h, c=color(255)) {
    tex.push();
    tex.rectMode(CENTER);
    tex.translate(x, y);

    const barWidth = w / faderValues.length * 0.8;
    const spacing = w / faderValues.length;

    for (let i = 0; i < faderValues.length; i++) {
        const barHeight = faderValues[i] * h;
        tex.fill(c);  // 白
        tex.noStroke();
        // バーの中心位置を計算
        const barCenterX = i * spacing + barWidth / 2;
        const barCenterY = h - barHeight / 2;
        tex.rect(barCenterX, barCenterY, barWidth, barHeight);

        tex.stroke(c);
        tex.line(barCenterX, 0, barCenterX, h);
        tex.line(barCenterX - barWidth * 0.2, 0, barCenterX + barWidth * 0.2, 0);
        tex.line(barCenterX - barWidth * 0.2, h, barCenterX + barWidth * 0.2, h);
    }
    tex.pop();
}

/**
 * 現在の日付と時刻を表示する関数
 * @param {p5.Graphics} tex - 描画先のテクスチャ
 * @param {number} x - X座標
 * @param {number} y - Y座標 
 * @param {number} s - 文字サイズ
 * @param {string} align - テキストの揃え方('LEFT', 'CENTER', 'RIGHT')
 */
function drawDateTime(tex, x, y, s, align, c = color(255)) {
    tex.push();
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekday = weekdays[date.getDay()];
    const h = date.getHours();
    const m = date.getMinutes();
    const sec = date.getSeconds();
    const pad = (num) => String(num).padStart(2, '0');
    const dateTimeStr = `${year}/${pad(month)}/${pad(day)}(${weekday}) ${pad(h)}:${pad(m)}:${pad(sec)}`;

    tex.textFont(DSEG14_FONT);
    tex.textSize(s);
    tex.textAlign(align);
    tex.fill(c);
    tex.noStroke();
    tex.text(dateTimeStr, x, y);
    tex.pop();
}

function movingCircleOnRect(tex, t, x, y, w, h, r, c = color(255)) {
    // 四角形の周囲の長さを計算
    const perimeter = 2 * (w + h);

    // 現在の位置を計算（0-1の範囲で正規化）
    let pos = (t % perimeter) / perimeter;

    let circleX, circleY;

    // 位置に応じて円の座標を計算
    if (pos < w / perimeter) {
        circleX = x + pos * perimeter;
        circleY = y;
    } else if (pos < (w + h) / perimeter) {
        circleX = x + w;
        circleY = y + (pos * perimeter - w);
    } else if (pos < (2 * w + h) / perimeter) {
        circleX = x + w - (pos * perimeter - (w + h));
        circleY = y + h;
    } else {
        circleX = x;
        circleY = y + h - (pos * perimeter - (2 * w + h));
    }

    tex.push();

    tex.noStroke();
    tex.fill(c);
    tex.circle(circleX, circleY, r);

    tex.pop();
}

function drawSpectrum(tex, spectrum, x, y, w, h, c=color(255)) {
    tex.push();
    // スペクトラムの各周波数帯域をループ処理
    for (let i = 0; i < spectrum.length; i++) {
        // 四角形の幅を計算
        let barWidth = w / spectrum.length;

        // 四角形の高さを計算（スペクトラム値に基づく）
        let barHeight = spectrum[i] * h;
        // 塗りつぶしの色を設定（オプション）

        // 四角形を描画
        tex.noStroke();
        tex.fill(c);
        tex.rect(x + i * barWidth, y + h - barHeight, barWidth, barHeight);
    }
    tex.pop();
}

function drawFrequencyBands(tex, x, y, w, c = color(255)) {
    const frequencyBands = ["bass", "lowMid", "mid", "highMid", "treble"];
    const thresholdScale = [1.0, 0.95, 0.9, 0.8, 0.7];
    const thresholdBasis = map(faderValues[7], 0, 1, 200, 255);

    const paddingScl = 0.9;

    tex.push();

    // デバッグ用の境界線
    // tex.stroke(255, 0, 0);
    // tex.noFill();
    // tex.rect(x - w, y, w, w * (1+paddingScl) * 5);

    for (let i = 0; i < frequencyBands.length; i++) {
        // バンドの位置計算（x座標を右端から左に向かって計算）
        let bandX = x;
        let bandY = i * w * (1 + paddingScl) + y;

        // エネルギー値の取得
        let energy = fft.getEnergy(frequencyBands[i]);

        // 描画スタイルの設定
        if (energy > thresholdBasis * thresholdScale[i]) {
            tex.fill(c);
            tex.noStroke();
        } else {
            tex.noFill();
            tex.stroke(c);
            tex.strokeWeight(2);
        }

        // 四角形の描画
        tex.rect(bandX-w, bandY, w, w);

        // テキストの描画
        tex.noStroke();
        tex.fill(c);
        tex.textFont(BEBAS_FONT);
        tex.textAlign(CENTER);
        tex.textSize(w * 0.3);
        tex.text(frequencyBands[i], bandX - w / 2, bandY + w * (1 + paddingScl*0.6));
    }

    tex.pop();
}
