
export default class Debouncer {

    constructor(waitInMillis) {
        this.waitInMillis = waitInMillis;
        this.timeout = undefined;
    }

    debounce(action) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            console.info("acting");
            action();
        }, this.waitInMillis);
        console.info("debouncing");
    }
}
