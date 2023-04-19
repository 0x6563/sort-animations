export function WorkerPromise(Worker: WorkerConstructor, payload: any): WorkerPromiseResult {
    const worker = new Worker();
    let resolve;
    let reject;

    const value: Promise<any> = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    worker.addEventListener('message', (r) => {
        resolve(r.data);
    });
    worker.addEventListener('error', (e) => {
        reject(e);
    });
    worker.addEventListener('messageerror', (e) => {
        reject(e);
    });
    worker.postMessage(payload);
    return {
        value,
        async resolve() {
            worker.terminate();
            resolve();
            await value;
        },
        async reject() {
            worker.terminate();
            reject();
            await value;
        },
    };
}
export interface WorkerPromiseResult {
    value: any;
    resolve: () => void;
    reject: () => void;
}
interface WorkerConstructor {
    new(): Worker
}