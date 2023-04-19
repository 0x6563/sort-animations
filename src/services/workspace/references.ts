import { ObjectMutationObserver } from "object-mutation-observer";
import type { ChangeEvent } from "object-mutation-observer/dist/types";
import { Value } from "./value";
export class References<T> {
    private nextId = 0;
    private xmap: WeakMap<T & object | Item<T>, number> = new Map();
    private references: { [key: number]: Item<T> } = Object.create(null);
    tracked: {
        array: { [key: string]: T & [] },
        object: { [key: string]: T & object },
        primitive: { [key: string]: Item<T> },
        value: { [key: string]: Item<T> },
    };

    observer: ObjectMutationObserver = new ObjectMutationObserver({ emit: 'sync', greedyProxy: true, resolveChangeAncestors: 'early', tagFunctions: ['array-mutators'] });

    constructor() {
        const track = {
            array: Object.create(null),
            object: Object.create(null),
            primitive: Object.create(null),
            value: Object.create(null),
        }
        this.tracked = this.observer.watch(track);
    }

    new<T2 extends T>(value: T2): T2 {
        const t = GetType(value);
        const item: Item<T2> = { $: this.nextId++, value };
        if (t != 'primitive') {
            this.tracked[t][item.$] = value as any;
            item.value = this.tracked[t][item.$] as any;
            this.xmap.set(this.tracked[t][item.$], item.$);
        } else {
            throw Error('Can not track primitives');
        }
        this.references[item.$] = item;
        this.xmap.set(item, item.$);
        return item.value;
    }

    delete(item: Item<T>) {
        this.xmap.delete(item);
        this.xmap.delete(item.value as any);
        delete this.references[item.$];
        delete this.tracked[GetType(item.value)][item.$];
    }

    id(item: Item<T> | T & object) {
        return this.xmap.get(item) as number;
    }

    item(n: number) {
        return this.references[n];
    }
    watch(listener: (change: ChangeEvent | ChangeEvent[]) => void) {
        return this.observer.watch(this.tracked, listener);
    }
}

function GetType(o: any) {
    if (o instanceof Value) {
        return 'value'
    } else if (Array.isArray(o)) {
        return 'array';
    } else if (o !== Object(o)) {
        return 'object';
    }
    return 'primitive';
}

export interface Item<T> {
    $: number;
    value: T;
}
