import { Constant } from "./constant";
import { GetType, References } from "./references";
import { EventLog } from "./eventlog";
import type { List, Scope, Value } from "./types";
export class Workspace {
    log: EventLog;
    references: References<List | Value> = new References();
    main: Value[] = [];

    constructor(
        public source: number[]) {
        this.log = new EventLog(this.references);
        this.reset();
    }

    // Create

    constant(value: number): Constant {
        return this.references.new(new Constant(value));
    }

    list(): List {
        return this.references.new<List>([]);
    }

    track(value: any) {
        if (GetType(value) == 'primitive') {
            return this.constant(value);
        }
        return this.references.new(value);
    }

    copy<T extends Value | List>(source: T): T {
        const itemId = this.references.id(source);
        if (typeof itemId != 'number') {
            const e = new Error();
            const hint = e.stack?.split('\n')[3].replace(/.*(\d:\d)\)$/, '$1')
            throw new Error(`Unable to Copy Value at ${hint}`);
        }
        const { value } = this.references.item(itemId);
        let result;
        if (Array.isArray(value)) {
            result = this.list();
            for (let i = 0; i < value.length; i++) {
                result[i] = this.copy(value[i]);
            }
        } else if (value instanceof Constant) {
            result = this.constant(value.value);

        } else if (value && typeof value == 'object') {
            // for (const key in value) {

            // }
        } else {
            // result = this.constant(value);
        }
        this.log.push('call', {
            call: 'copied',
            data: {
                source: this.references.id(source),
                target: this.references.id(result)
            }
        });
        return result;
    }

    // Read

    compare(a: Value, b: Value): number {
        const item1 = this.references.id(a);
        const item2 = this.references.id(b);
        if (typeof item1 != 'number' || typeof item2 != 'number') {
            const e = new Error();
            const hint = e.stack?.split('\n')[3].replace(/.*(\d:\d)\)$/, '$1')
            throw new Error(`Unable to Compare Values at ${hint}`);
        }
        return a.value - b.value;
    }

    // Update

    move(target: List, item: Value, index?: number) {
        this.detach(item);
        index = typeof index == 'number' ? index : target.length;
        target[index] = item;
    }

    swap(target: List, a: Value, b: Value) {
        const i1 = target.indexOf(a);
        const i2 = target.indexOf(b);
        target[i1] = b;
        target[i2] = a;
    }

    // Delete

    untrack(source: Value | List) {
        const itemId = this.references.id(source);
        this.detach(source);
        this.references.delete(this.references.item(itemId));
    }

    private detach(source: Value | List) {
        const parents = this.references.observer.getParents(source);
        for (const [parent, properties] of parents) {
            if (parent == this.references.tracked.array)
                continue;
            if (parent == this.references.tracked.value)
                continue;
            if (parent == this.references.tracked.object)
                continue;
            if (parent == this.references.tracked.primitive)
                continue;

            for (const property of properties) {
                // match immediate  parents only
                if ((property.match(/\//g) || []).length == 1) {
                    const prop = this.cleanPropName(property)
                    if ((parent)[prop] === source) {
                        delete parent[prop];
                    }
                }
            }
        }
    }

    cleanPropName(property: string) {
        return property.substring(1).replace(/~1/g, "/").replace(/~0/g, "~");
    }


    reset() {
        this.references = new References();
        this.log = new EventLog(this.references);
        this.log.push('call', { call: 'initialize', progress: 'start' });
        this.main = this.list();
        for (let i = 0; i < this.source.length; i++) {
            this.main[i] = this.constant(this.source[i]);
        }
        this.log.push('call', { call: 'initialize', progress: 'end' });
    }


    scope(): Scope {
        return {
            // Create
            Constant: this.wrap('constant'),
            List: this.wrap('list'),
            Copy: this.wrap('copy'),
            // Read
            Compare: (a: Value, b: Value) => {
                this.log.push('call', {
                    call: 'compare',
                    data: {
                        a: this.references.id(a),
                        b: this.references.id(b)
                    }
                })
                return this.compare(a, b)
            },
            // Update
            Move: this.wrap('move'),
            Swap: this.wrap('swap'),
            // Delete
            Untrack: this.wrap('untrack'),

            //Presentation
            Shade: this.color('shade'),
            Tint: this.color('tint'),
            Fill: this.color('fill'),
            Unhighlight: () => this.log.push('animation', { command: 'unhighlight' }),
            BatchStart: () => this.log.push('animation', { command: 'batch-start' }),
            BatchEnd: () => this.log.push('animation', { command: 'batch-end' }),
            Animate: () => this.log.push('animation', { command: 'animate' }),
            Custom: (message: string) => this.log.push('custom', { message }),

        }
    }

    private color(color: 'shade' | 'tint' | 'fill') {
        return (source?: List | Value) => {
            this.log.push('animation', { command: 'color', target: source ? this.references.id(source) : undefined, color })
        };
    }

    private wrap<T extends KeysMatching<Workspace, Function>>(call: T): Workspace[T] {
        return ((...args) => {
            this.log.push('call', { call, progress: 'start' });
            const r = (this[call] as Function)(...args);
            this.log.push('call', { call, progress: 'end' });

            return r;
        }) as any;
    }
}

type KeysMatching<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];