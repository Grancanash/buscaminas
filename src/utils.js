export class Timer {
    #isH;
    #display;
    #totalTime;

    constructor(displayId, isH = false) {
        this.#isH = isH;
        this.#display = document.getElementById(displayId);

        this.startTime = 0;
        this.elapsed = 0;
        this.timer = null;
    }

    format(ms) {
        const cent = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
        const s = Math.floor(ms / 1000);
        const sec = (s % 60).toString().padStart(2, '0');
        const min = (Math.floor(s / 60) % 60).toString().padStart(2, '0');
        const hr = Math.floor(s / 3600).toString().padStart(2, '0');
        return `${this.#isH ? hr + ':' : ''}${min}:${sec}:${cent}`;
    }

    #tick() {
        const now = Date.now();
        this.#totalTime = this.elapsed + (now - this.startTime);
        this.#display.textContent = this.format(this.#totalTime);
    }

    getTimer() {
        return Date.now() - this.startTime;
    }

    start() {
        this.startTime = Date.now();
        this.timer = setInterval(() => this.#tick(), 25);
    }

    pause() {
        clearInterval(this.timer);
        this.#tick();
        this.elapsed += Date.now() - this.startTime;
        this.timer = null;
    }

    reset() {
        clearInterval(this.timer);
        this.startTime = 0;
        this.elapsed = 0;
        this.timer = null;
        this.#display.textContent = `00:00:00${this.#isH ? '.00' : ''}`;
    }

    get totalTime() {
        return this.#totalTime;
    }
}