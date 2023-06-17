
import {EXT_CSS, EXT_JS} from "../path/map-to-js-and-css.js";

export default class Metrics {
    #jsHitCount = 0;
    #cssHitCount = 0;
    #errorCount = 0;
    #failCount = 0;
    #jsIncludesHitCount = 0;
    #cssIncludesHitCount = 0;
    #jsIncludesNotFoundCount = 0;
    #cssIncludesNotFoundCount = 0;
    #hasData = false;

    incrementHitCount(type) {
        if (type === EXT_JS) {
            this.#jsHitCount++;
        } else if (type === EXT_CSS) {
            this.#cssHitCount++;
        }
        this.#hasData = true;
    }

    incrementErrorCount() {
        this.#errorCount++;
        this.#hasData = true;
    }

    incrementFailCount() {
        this.#failCount++;
        this.#hasData = true;
    }

    incrementIncludesHit(type) {
        if (type === EXT_JS) {
            this.#jsIncludesHitCount++;
        } else if (type === EXT_CSS) {
            this.#cssIncludesHitCount++;
        }
        this.#hasData = true;
    }

    incrementIncludesNotFound(type) {
        if (type === EXT_JS) {
            this.#jsIncludesNotFoundCount++;
        } else if (type === EXT_CSS) {
            this.#cssIncludesNotFoundCount++;
        }
        this.#hasData = true;
    }

    get jsHitCount() {
        return this.#jsHitCount;
    }

    get cssHitCount() {
        return this.#cssHitCount;
    }

    get errorCount() {
        return this.#errorCount;
    }

    get failCount() {
        return this.#failCount;
    }

    get jsIncludesHitCount() {
        return this.#jsIncludesHitCount;
    }

    get cssIncludesHitCount() {
        return this.#cssIncludesHitCount;
    }

    get jsIncludesNotFoundCount() {
        return this.#jsIncludesNotFoundCount;
    }

    get cssIncludesNotFoundCount() {
        return this.#cssIncludesNotFoundCount;
    }

    get hasData() {
        return this.#hasData;
    }
}
