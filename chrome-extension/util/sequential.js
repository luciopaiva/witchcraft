
export async function sequential(tasks) {
    for (const task of tasks) {
        if (typeof task === "function") {
            await task();
        } else if (task instanceof Promise) {
            await task;
        }
    }
}
