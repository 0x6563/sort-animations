import { browser } from "$app/environment";

export class Emitter {
    private emitter = browser ? document.createElement("div") : null;

    on(event: string, cb: (event: any) => void) {
        this.emitter?.addEventListener(event, (e: any) => cb(e.detail), false)
    }

    off(event: string, cb: (event: any) => void) {
        this.emitter?.removeEventListener(event, cb)
    }

    emit(event: string, data?: any) {
        this.emitter?.dispatchEvent(new CustomEvent(event, { detail: data }))
    }
}