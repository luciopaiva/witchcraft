
export async function until(conditionFunction, timeout = 2000) {
    const start = performance.now();
    while (performance.now() - start < timeout) {
        if (conditionFunction()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    return false;
}
