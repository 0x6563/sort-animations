import { Emitter } from "./emitter";
import type { ComponentProps, ComponentType, SvelteComponentTyped } from "svelte";


export class Modal {
    private queue: ModalComponent<any>[] = [];
    events = new Emitter();
    get current() {
        return this.queue[this.queue.length - 1];
    }

    new<T extends SvelteComponentTyped>(component: ComponentType<T>, properties: ComponentProps<T>, blur: 'close' | 'hide' | 'none' = 'close') {
        if (component)
            this.queue.push({ component, properties, blur })
        this.show();
    }

    show() {
        if (this.queue.length) {
            this.events.emit('show');
        }
    }

    hide() {
        this.events.emit('hide');
    }

    close() {
        this.queue.pop()
        this.events.emit('close');
        this.show();
    }

    blur() {
        if (this.current.blur == 'hide') {
            this.hide();
        } else if (this.current.blur == 'close') {
            this.close();
        }
    }
}

export const ModalService = new Modal();

export type ModalComponent<T extends SvelteComponentTyped = any> = T extends SvelteComponentTyped ? {
    component: ComponentType<T>;
    properties: ComponentProps<T>;
    blur: 'close' | 'hide' | 'none'
} : never;