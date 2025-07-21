// 倒计时器组件
export class CountdownTimer {
    constructor() {
        this.countdownElement = document.getElementById('days-remaining');
    }

    updateCountdown(daysRemaining) {
        if (this.countdownElement) {
            this.countdownElement.textContent = daysRemaining.toLocaleString();
        }
    }
}
