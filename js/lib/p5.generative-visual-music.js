/**
 * p5.generative-visual-music.js
 * A p5.js library for creating generative visual music
 * v1.0.0
 * 
 * This library provides tools for:
 * - Beat counting and timing
 * - Easing functions
 * - Noise interpolation
 * - Style management for visual elements
 */

(function (p5) {
    // Library version
    p5.prototype.GVM_VERSION = '1.0.0';

    p5.Easing = {
        // 線形
        linear: t => t,

        // サイン関数ベース
        easeInSine: t => 1 - Math.cos((t * Math.PI) / 2),
        easeOutSine: t => Math.sin((t * Math.PI) / 2),
        easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,

        // 二次関数ベース
        easeInQuad: t => t * t,
        easeOutQuad: t => 1 - (1 - t) * (1 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,

        // 三次関数ベース
        easeInCubic: t => t * t * t,
        easeOutCubic: t => 1 - Math.pow(1 - t, 3),
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

        // 五次関数ベース
        easeInQuint: t => t * t * t * t * t,
        easeOutQuint: t => 1 - Math.pow(1 - t, 5),
        easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,


        // 指数関数ベース
        easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
        easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
        easeInOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ?
            Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,

        // バウンス
        easeInBounce: t => 1 - p5.Easing.easeOutBounce(1 - t),
        easeOutBounce: t => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        },
        easeInOutBounce: t => t < 0.5 ?
            (1 - p5.Easing.easeOutBounce(1 - 2 * t)) / 2 :
            (1 + p5.Easing.easeOutBounce(2 * t - 1)) / 2
    };

    /**
     * Calculates beat count based on BPM
     * @param {number} bpm - Beats per minute
     * @returns {number} Current beat count
     * @throws {Error} If BPM is not a positive number
     */
    p5.prototype.calculateBeatCount = function (bpm) {
        if (typeof bpm !== 'number' || bpm <= 0) {
            throw new Error('BPM must be a positive number');
        }
        const beatIntervalMs = (60 / bpm) * 1000;
        const currentTimeMs = this.millis();
        return currentTimeMs / beatIntervalMs;
    };

    /**
     * Calculates phase with easing transition
     * @param {number} count - Current count/time
     * @param {number} cycleLength - Length of one complete cycle
     * @param {number} easeDuration - Duration of easing transition
     * @param {Function} easeFunction - Easing function to use
     * @returns {number} Current phase with easing
     * @throws {Error} If parameters are invalid
     */
    p5.prototype.getPhaseWithEasing = function (
        count,
        cycleLength = 64,
        easeDuration = 8,
        easeFunction = p5.Easing.easeInOutSine
    ) {
        if (typeof count !== 'number') {
            throw new Error('Count must be a number');
        }
        if (cycleLength <= 0 || easeDuration <= 0) {
            throw new Error('Cycle length and ease duration must be positive numbers');
        }
        if (easeDuration > cycleLength) {
            throw new Error('Ease duration must be shorter than cycle length');
        }

        const easeStartOffset = cycleLength - easeDuration;
        const basePhase = Math.floor(count / cycleLength);
        const cyclePosition = count % cycleLength;
        const easeProgress = (Math.max(easeStartOffset, cyclePosition) - easeStartOffset) / easeDuration;
        const easeValue = easeFunction(this.fract(easeProgress));

        return basePhase + easeValue;
    };

    /**
     * Sets visual style for shapes
     * @param {p5.Color} c - Color to apply
     * @param {string} mode - Style mode ('fill', 'stroke', or 'grad')
     * @throws {Error} If color is not provided or mode is invalid
     */
    p5.prototype.setStyle = function (c, mode = "fill", sw = 0.01) {
        if (!c) {
            throw new Error('Color must be specified');
        }

        switch (mode) {
            case "fill":
                this.noStroke();
                this.fill(c);
                break;
            case "stroke":
                this.noFill();
                this.strokeWeight(sw);
                this.stroke(c);
                break;
            case "grad":
                const ctx = this.drawingContext;
                const gradient = ctx.createLinearGradient(-0.5, -0.5, 0.5, 0.5);
                gradient.addColorStop(0, this.color(this.red(c), this.green(c), this.blue(c), 150));
                gradient.addColorStop(0.3, this.color(this.red(c) + 50, this.green(c) + 50, this.blue(c) + 50, 255));
                gradient.addColorStop(0.6, this.color(this.red(c), this.green(c), this.blue(c), 220));
                gradient.addColorStop(1, this.color(this.red(c) - 30, this.green(c) - 30, this.blue(c) - 30, 255));
                this.fill(255);
                this.noStroke();
                ctx.fillStyle = gradient;
                break;
            default:
                throw new Error('Invalid style mode');
        }
    };

    /**
     * Interpolates noise values with easing
     * @param {number} count - Current count/time
     * @param {number} cycleLength - Length of one complete cycle
     * @param {number} easeDuration - Duration of easing transition
     * @param {Function} easeFunction - Easing function to use
     * @param {number} minValue - Minimum output value
     * @param {number} maxValue - Maximum output value
     * @param {number} seed - Noise seed
     * @returns {number} Interpolated noise value
     * @throws {Error} If p5.js noise function is not available
     */
    p5.prototype.interpolateNoiseWithEasing = function (
        count,
        cycleLength,
        easeDuration,
        minValue = 0,
        maxValue = 1,
        seed = 4649,
        easeFunction = p5.Easing.easeInOutCubic,
    ) {
        if (!this.noiseSeed) {
            throw new Error('p5.js noise function is not available');
        }

        const currentPhase = Math.floor(count / cycleLength);
        const nextPhase = currentPhase + 1;

        this.noiseSeed(seed);
        const currentNoise = this.noise(currentPhase);
        const nextNoise = this.noise(nextPhase);

        const easeProgress = this.fract(this.getPhaseWithEasing(count, cycleLength, easeDuration, easeFunction));

        return this.map(
            this.lerp(currentNoise, nextNoise, easeProgress),
            0,
            1,
            minValue,
            maxValue
        );
    };

    /**
     * Generates stable noise values within 0-1 range
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate (optional)
     * @param {number} z - Z coordinate (optional)
     * @returns {number} Stable noise value between 0 and 1
     */
    p5.prototype.stableNoise = function (x, y = 0, z = 0) {
        return Math.max(
            Math.min(
                this.map(this.noise(x, y, z), 0, 1, -0.2, 1.2),
                1
            ),
            0
        );
    };

    /**
 * Draws an ellipse with adjusted position, size, and rotation
 * @param {number} x - Center X coordinate
 * @param {number} y - Center Y coordinate
 * @param {number} width - Width of the ellipse
 * @param {number} height - Height of the ellipse
 * @param {number} angle - Rotation angle in radians (optional)
 * @throws {Error} If parameters are not numbers
 */
    p5.prototype.adjustedEllipse = function (x, y, w, h, angle = 0) {
        if ([x, y, w, h, angle].some(param => typeof param !== 'number')) {
            throw new Error('All parameters must be numbers');
        }
        if (w < 0 || h < 0) {
            throw new Error('Width and height must be positive numbers');
        }

        this.push();
        this.translate(x, y);
        this.rotate(angle);
        this.scale(w, h);
        this.ellipse(0, 0, 1, 1);
        this.pop();
    };

    /**
   * Draws a rectangle with adjusted position, size, and rotation
   * @param {number} x - Center X coordinate
   * @param {number} y - Center Y coordinate
   * @param {number} width - Width of the rectangle
   * @param {number} height - Height of the rectangle
   * @param {number} angle - Rotation angle in radians (optional)
   * @throws {Error} If parameters are not numbers
   */
    p5.prototype.adjustedRect = function (x, y, w, h, angle = 0) {
        if ([x, y, w, h, angle].some(param => typeof param !== 'number')) {
            throw new Error('All parameters must be numbers');
        }
        if (w < 0 || h < 0) {
            throw new Error('Width and height must be positive numbers');
        }

        this.push();
        this.translate(x, y);
        this.rotate(angle);
        this.scale(w, h);
        this.rectMode(this.CENTER);
        this.rect(0, 0, 1, 1);
        this.pop();
    };

})(p5);