import type { ChangeEvent } from "object-mutation-observer/dist/types";
import type { References } from "./references";

export class EventLog {
    events: EventLogEvent[] = [];
    constructor(private references: References<any>) {
        this.references.watch((e) => this.observerChangeHandler(e));
    }

    push<T extends EventLogEvent>(event: T['event'], detail: T['detail']) {
        this.events.push({ event, detail } as T);
    }

    private observerChangeHandler(e: ChangeEvent | ChangeEvent[]) {
        if (Array.isArray(e)) {
            e.forEach((e) => this.processChange(e))
        } else {
            this.processChange(e);
        }
    }

    private processChange(e: ChangeEvent) {
        if (e.target == this.references.tracked.array) {
            const action = e.type == 'delete' ? 'deleted' : 'added';
            this.push('reference', { action, id: parseInt(e.key as string), type: 'array', message: 'References ' + action + ' Array #' + (e.key as string) });
        } else if (e.target == this.references.tracked.value) {
            const action = e.type == 'delete' ? 'deleted' : 'added';
            let value;
            if (e.event == 'change' && e.type == 'set') {
                value = (e.current.value)
            }
            this.push('reference', { action, value, id: parseInt(e.key as string), type: 'value', message: 'References ' + action + ' Value #' + (e.key as string) });
        } else if (e.event == 'change' && /^\/array\/\d+\/\d+$/.test(e.paths[0])) {
            const [, t, id, n] = e.paths[0].split('/');
            const pid = this.references.id(e.previous)
            const cid = this.references.id((e as any).current)
            const pval = e.previous?.value;
            const cval = (e as any).current?.value;
            let from = '';
            let to = ' to undefined'
            if (e.previous) {
                from = ` from #${pid}(${pval})`;
            }
            if ('current' in e) {
                to = ` to #${cid}(${cval})`;
            }
            this.push('change', { action: 'assigned', target: parseInt(id), property: parseInt(n), previous: pid, current: cid, message: `Array #${id}[${n}] updated ${from}${to}` });
        } else {
            console.error(e);
        }
    }
}

export type EventLogEvent = EventLogEventCall | EventLogEventChangeAdd | EventLogEventChangeAssign | EventLogEventChangeDelete | EventLogEventAnimation | EventLogEventCustom | EventLogEventReferenceAdd | EventLogEventReferenceDelete;
type EventLogEventAnimation = EventLogEventAnimationGeneral | EventLogEventAnimationColor;
interface EventLogEventAnimationGeneral {
    event: 'animation'
    detail: {
        command: 'batch-start' | 'batch-end' | 'animate' | 'highlight' | 'unhighlight';
    }
}
interface EventLogEventAnimationColor {
    event: 'animation'
    detail: {
        command: 'color';
        target?: number;
        color: 'tint' | 'shade' | 'fill'
    }
}
interface EventLogEventCustom {
    event: 'custom'
    detail: {
        message: string;
    }
}

interface EventLogEventCall {
    event: 'call'
    detail: {
        call: string;
        progress?: 'start' | 'end';
        data?: any;
    }
}

interface EventLogEventChangeDelete {
    event: 'change';
    detail: {
        action: "deleted";
        target: number;
        message: string;
        property: number;
        previous: number;
        current?: undefined;

    }
}
interface EventLogEventChangeAdd {
    event: 'change';
    detail: {
        action: "added";
        target: number;
        message: string;
        property: number;
        current: number;
        previous?: undefined;
    }
}

interface EventLogEventChangeAssign {
    event: 'change';
    detail: {
        action: "assigned";
        target: number;
        message: string;
        property: number;
        previous?: number;
        current: number;
    }
}


interface EventLogEventReferenceDelete {
    event: 'reference';
    detail: {
        id: number;
        type: 'array' | 'value';
        action: "deleted";
        message: string;
    }
}
interface EventLogEventReferenceAdd {
    event: 'reference';
    detail: {
        id: number;
        type: 'array' | 'value';
        action: "added";
        value: number;
        message: string;
    }
}
