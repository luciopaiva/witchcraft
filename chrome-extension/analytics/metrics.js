
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

    incrementHitCount(type) {
        if (type === EXT_JS) {
            this.#jsHitCount++;
        } else if (type === EXT_CSS) {
            this.#cssHitCount++;
        }
    }

    incrementErrorCount() {
        this.#errorCount++;
    }

    incrementFailCount() {
        this.#failCount++;
    }

    incrementIncludesHit(type) {
        if (type === EXT_JS) {
            this.#jsIncludesHitCount++;
        } else if (type === EXT_CSS) {
            this.#cssIncludesHitCount++;
        }
    }

    incrementIncludesNotFound(type) {
        if (type === EXT_JS) {
            this.#jsIncludesNotFoundCount++;
        } else if (type === EXT_CSS) {
            this.#cssIncludesNotFoundCount++;
        }
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
}
