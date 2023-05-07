import type { AnimationFrame } from "@services/types";
import type { EventLogEvent } from "./eventlog";
import { WorkspaceLayout } from "./layout";

export class WorkspaceAnimation {
    animations: AnimationFrame[] = [];
    runtime: number = 1000;
    pause: number = 200;
    duration: number = 500;
    current: UIState = {
        elements: [],
        changes: {
            color: [],
            layout: [],
            copy: {}
        },
        viewbox: '',
        shaded: {},
        tinted: {},
        highlight: {
            cell: {},
            graph: {}
        },
    };
    staged: UIState;

    stats = {
        array: {
            total: 0,
            maxActive: 0,
            current: 0,
            length: 0,
            ref: [] as { id: number }[],
        },
        value: {
            total: 0,
            maxActive: 0,
            current: 0,
            maxValue: 0,
            ref: [] as { id: number; value: number }[],
        },
        sorting: {
            comparisons: 0,
            moves: 0,
        }
    }
    layout: WorkspaceLayout;
    constructor(
        private log: EventLogEvent[],
        config: SVGConfigInput
    ) {
        this.staged = Clone(this.current);
        this.analyze();
        this.layout = new WorkspaceLayout(config, { maxValue: this.stats.value.maxValue, length: this.stats.array.length })
        this.initialDimensions();
        this.shiftStage();
        this.animateEventLog();
    }

    analyze() {
        let initialized = false;
        let assigned = 0;
        for (let i = 0; i < this.log.length; i++) {
            const { event, detail } = this.log[i];
            if (event == 'call' && detail.call == 'initialize' && detail.progress == 'end') {
                initialized = true;
                this.stats.array.length = assigned;
            } else if (event == 'reference') {
                if (detail.action == 'added') {
                    this.stats[detail.type].total++;
                    this.stats[detail.type].current++;
                    this.staged.elements[detail.id] = {
                        id: detail.id,
                        type: detail.type,
                        dimensions: {
                            x: 0,
                            y: 0,
                            height: 0,
                            width: 0,
                            opacity: 0
                        },
                        color: 'fill',
                        value: detail.value,
                        ...(detail.type == 'array' ? { children: {} } : { parent: -1 })
                    } as ComponentUIState;

                    if (detail.type == 'value') {
                        this.stats.value.maxValue = Math.max(this.stats.value.maxValue, detail.value);
                        this.stats.value.ref.push({ id: detail.id, value: detail.value });
                    } else {
                        this.stats.array.ref.push({ id: detail.id });
                    }
                } else {
                    this.stats[detail.type].current--;
                }
                this.stats[detail.type].maxActive = Math.max(this.stats[detail.type].maxActive, this.stats[detail.type].current);
            } else if (!initialized && event == 'change' && detail.action == 'assigned') {
                assigned++;
            }
        }
    }

    animateEventLog() {
        this.shiftStage();
        let callStack = 0;

        for (let i = 0; i < this.log.length; i++) {
            const { event, detail } = this.log[i];
            if (event == 'reference') {
                if (detail.action == 'added') {
                    this.staged.elements[detail.id].dimensions.opacity = 1;
                } else {
                    this.staged.elements[detail.id].dimensions.opacity = 0;
                }
                this.staged.changes.layout.push(detail.id);

            } else if (event == 'call') {
                if (detail.progress == 'start') {
                    callStack++;
                }
                if (detail.progress == 'end') {
                    callStack--;
                }
                if (detail.call == 'compare') {
                    this.unhighlight();
                    const { a, b } = detail.data;
                    this.highlight(a);
                    this.highlight(b);
                }
                if (detail.call == 'copied') {
                    this.unhighlight();
                    this.staged.changes.copy[detail.data.target] = detail.data.source;
                    this.highlight(detail.data.target);
                }
            } else if (event == 'change') {
                const { current, previous, target, property } = detail;
                const targetElement = this.staged.elements[target] as GraphUIState;

                if ('previous' in detail && typeof previous == 'number') {
                    const previousElement = this.staged.elements[previous] as ValueUIState;
                    if (targetElement.children[previous] == property) {
                        delete targetElement.children[previous];
                        previousElement.parent = -1;
                        previousElement.dimensions.opacity = 0;
                        this.staged.changes.layout.push(previous);
                    }
                }

                if ('current' in detail && typeof current == 'number') {
                    const currentElement = this.staged.elements[current] as ValueUIState;
                    const o = currentElement.parent as number;
                    if (o >= 0) {
                        delete (this.staged.elements[o] as GraphUIState).children[current];
                    }
                    currentElement.parent = target;
                    currentElement.dimensions.opacity = 1;

                    targetElement.children[current] = property;
                    this.staged.changes.layout.push(current);
                }

            } else if (event == 'animation') {
                if (detail.command == 'batch-start') {
                    callStack++;
                }
                if (detail.command == 'batch-end') {
                    callStack--;
                }
                if (detail.command == 'unhighlight') {
                    this.unhighlight();
                }
                if (detail.command == 'highlight') {
                    this.unhighlight();
                    if (detail.targets) {
                        for (const t of detail.targets) {
                            this.highlight(t);
                        }
                    }
                }
                if (detail.command == 'color') {
                    if (!(detail.targets?.length)) {
                        for (let i = 0; i < this.staged.elements.length; i++) {
                            this.colorElement(i, detail.color);
                        }
                    } else {
                        for (const t of detail.targets) {
                            this.colorElement(t, detail.color);
                        }
                    }
                }
            }

            if (callStack == 0 && (this.staged.changes.layout.length || this.staged.changes.color.length)) {
                this.applyStage();
            }
        }
        this.unhighlight();
        this.applyStage();
    }

    applyStage() {
        this.adjustColors();
        this.adjustLayout();
        this.shiftStage();
    }

    highlight(id: number) {
        if (this.staged.elements[id].type == 'array') {
            for (const i in (this.staged.elements[id] as GraphUIState).children) {
                this.highlight(parseInt(i));
            }
        } else {
            this.staged.elements[id].highlight = true;
            this.staged.highlight.cell[id] = 1;
            this.staged.changes.color.push(id);
        }
    }

    colorElement(id: number, color: 'tint' | 'shade' | 'fill') {
        this.staged.elements[id].color = color;
        this.staged.changes.color.push(id);
        if (this.staged.elements[id].type == 'array') {
            for (const i in (this.staged.elements[id] as GraphUIState).children) {
                this.colorElement(parseInt(i), color);
            }
        }
    }

    unhighlight() {
        for (const id in this.staged.highlight.cell) {
            this.staged.elements[id].highlight = false;
            this.staged.changes.color.push(parseInt(id));
        }
        for (const id in this.staged.highlight.graph) {
            this.staged.elements[id].highlight = false;
            this.staged.changes.color.push(parseInt(id));
        }
        this.staged.highlight.cell = {};
        this.staged.highlight.graph = {};
    }

    adjustColors() {
        for (const id of this.staged.changes.color) {
            const staged = this.staged.elements[id];
            const current = this.current.elements[id];
            const stagedColor = staged.highlight ? 'highlight' : staged.color;
            const currentColor = current.highlight ? 'highlight' : current.color;
            if (stagedColor != currentColor) {
                if (staged.type === 'value') {
                    this.animateAttributes(id, { fill: this.layout.settings.cell[stagedColor] }, this.duration);
                } else {
                    this.animateAttributes(id, { fill: this.layout.settings.graph[stagedColor], stroke: this.layout.settings.border[stagedColor] }, this.duration);
                }
            }
        }
        this.incrementRuntime();

    }

    adjustLayout() {

        // array changes 
        const changes: { [key: string]: number[] } = {
            hideValues: [],
            showArrays: [],
            moveExistingValues: [],
            newValues: [],
            hideArrays: [],
            other: []
        };

        const layoutIds = Array.from(new Set(this.staged.changes.layout));

        for (const id of layoutIds) {
            const stageRef = this.staged.elements[id];
            const currentRef = this.current.elements[id];
            const { dimensions: stageDims } = stageRef;
            const { dimensions: currentDims } = currentRef;
            const stageParent: GraphUIState | undefined = stageRef.type == 'value' && stageRef.parent >= 0 ? this.staged.elements[stageRef.parent] as GraphUIState : undefined;
            const currentParent: GraphUIState | undefined = currentRef.type == 'value' && currentRef.parent >= 0 ? this.current.elements[currentRef.parent] as GraphUIState : undefined;
            const stageIndex = stageParent ? stageParent.children[id] : undefined;
            const currentIndex = currentParent ? currentParent.children[id] : undefined;

            if (stageRef.type == 'value' && !stageDims.opacity) {
                changes.hideValues.push(id);
                continue;
            }
            if (stageRef.type == 'value' && (stageDims.opacity && currentDims.opacity) && (stageRef.parent != (currentRef as ValueUIState).parent || stageIndex != currentIndex)) {
                changes.moveExistingValues.push(id);
                continue;
            }

            if (stageRef.type == 'value' && stageDims.opacity && !currentDims.opacity) {
                changes.newValues.push(id);
                continue;
            }

            if (stageRef.type == 'array' && stageDims.opacity == 1 && !currentDims.opacity) {
                changes.showArrays.push(id);
                continue;
            }

            if (stageRef.type == 'array' && !stageDims.opacity) {
                changes.hideArrays.push(id);
                continue;
            }
            changes.other.push(id);
        }
        this.hideValues(changes.hideValues)
        this.showArrays(changes.showArrays);
        this.moveExistingValues(changes.moveExistingValues);
        this.showNewValues(changes.newValues);
        this.hideArrays(changes.hideArrays);
    }

    shiftStage() {
        this.staged.changes.layout = [];
        this.staged.changes.color = [];
        this.current = Clone(this.staged);
        this.staged = Clone(this.current);
    }

    hideValues(ids: number[]) {
        if (ids.length) {
            for (const id of ids) {
                this.animateAttributes(id, { opacity: 0 });
            }
            this.incrementRuntime();
        }
    }

    showArrays(ids: number[]) {
        const visible = this.stats.array.ref.filter(({ id }) => this.staged.elements[id].dimensions.opacity || this.current.elements[id].dimensions.opacity);
        this.setViewBox(visible.length);

        let changed = false;
        for (const id of ids) {
            const position = this.layout.updateGraphPosition(this.staged.elements[id] as GraphUIState, visible.findIndex(v => v.id == id), visible.length);
            if (position.changed) {
                changed = true;
                this.animateAttributes(id, position.changes, 0);
                this.animateAttributes(id, { opacity: 1 });
            }
        }
        if (changed) {
            this.incrementRuntime();
            this.redraw();
        }
    }

    moveExistingValues(ids: number[]) {
        if (ids.length) {
            let changed = false;
            for (const id of ids) {
                const element = this.staged.elements[id] as ValueUIState;
                const array = this.staged.elements[element.parent] as GraphUIState;
                const position = this.layout.updateColumnPosition(array, element);
                if (position.changed) {
                    changed = true;
                    this.animateAttributes(id, position.changes);
                }
            }

            if (changed) {
                this.incrementRuntime();
            }
        }
    }

    showNewValues(ids: number[]) {
        if (ids.length) {
            for (const id of ids) {
                const element = this.staged.elements[id] as ValueUIState;
                if (id in this.staged.changes.copy) {
                    const target = this.staged.changes.copy[id];
                    const { x, y } = this.staged.elements[target].dimensions;
                    delete this.staged.changes.copy[id];
                    element.dimensions.x = x;
                    element.dimensions.y = y;
                    this.animateAttributes(id, { x, y }, 0);
                    if (element.parent as number >= 0) {
                        const array = this.staged.elements[element.parent] as GraphUIState;
                        const position = this.layout.updateColumnPosition(array, element);
                        this.animateAttributes(id, position.changes, this.duration);
                    }
                } else {
                    const array = this.staged.elements[element.parent] as GraphUIState;
                    const position = this.layout.updateColumnPosition(array, element);
                    this.animateAttributes(id, position.changes, 0);
                }
                this.animateAttributes(id, { opacity: 1 });
            }
            this.incrementRuntime();
        }
    }

    hideArrays(ids: number[]) {
        const visible = this.stats.array.ref.filter(({ id }) => this.staged.elements[id].dimensions.opacity);

        if (ids.length) {
            for (const id of ids) {
                const element = this.staged.elements[id] as GraphUIState;

                this.animateAttributes(id, { opacity: 0 });
                for (const childId in element.children) {
                    if ((this.staged.elements[childId] as ValueUIState).parent == id) {
                        this.animateAttributes(childId, { opacity: 0 });
                    }
                }
            }
            this.incrementRuntime();
            this.redraw();
            this.setViewBox(visible.length);
        }
    }

    redraw() {
        const visible = this.stats.array.ref.filter(({ id }) => this.staged.elements[id].dimensions.opacity)
        for (const { id } of visible) {
            const layout = this.staged.elements[id] as GraphUIState;
            const position = this.layout.updateGraphPosition(layout, visible.findIndex(v => v.id == id), visible.length);
            this.animateAttributes(id, position.changes);

            for (const cid in layout.children) {
                const position = this.layout.updateColumnPosition(layout, this.staged.elements[cid] as ValueUIState);
                this.animateAttributes(cid, position.changes);
            }
        }
        this.incrementRuntime();
    }

    toSVGID(n: string | number) {
        return `ref-${n}`;
    }

    animateAttributes(id: number | string, attributes: { [key: string]: string | number }, duration?: number) {
        this.animations.push({
            id: this.toSVGID(id),
            begin: this.runtime,
            duration: typeof duration == 'number' ? duration : this.duration,
            set: attributes
        });
    }

    incrementRuntime() {
        this.runtime += this.duration + this.pause;
    }

    initialDimensions() {
        for (const ref of this.staged.elements) {
            if (ref.type === 'array') {
                ref.dimensions.height = this.layout.settings.graph.height;
                ref.dimensions.width = this.layout.settings.graph.width;
                this.animateAttributes(ref.id, { fill: this.layout.settings.graph.fill, stroke: this.layout.settings.border.fill }, 0);

            }
            if (ref.type === 'value') {
                ref.dimensions.height = this.layout.columnHeight(ref.value);
                ref.dimensions.width = this.layout.settings.cell.width;
                this.animateAttributes(ref.id, { fill: this.layout.settings.cell.fill }, 0);
            }

        }
        this.staged.viewbox = this.layout.getViewBox(1);
    }

    setViewBox(visibleArrays: number) {
        const viewBox = this.layout.getViewBox(visibleArrays);
        if (viewBox != this.staged.viewbox) {
            this.animations.push({
                begin: this.runtime,
                duration: this.duration,
                set: { viewBox }
            });
            this.staged.viewbox = viewBox;
            this.incrementRuntime();
        }
    }
}

function Clone<T>(o: T): T {
    return JSON.parse(JSON.stringify(o));
}


export interface UIState {
    elements: ComponentUIState[];
    changes: {
        color: number[];
        layout: number[];
        copy: { [id: number]: number }
    }
    tinted: { [id: number]: number };
    shaded: { [id: number]: number };
    highlight: {
        cell: { [id: number]: number }
        graph: { [id: number]: number }
    };
    viewbox: string;
}
export type ComponentUIState = GraphUIState | ValueUIState;
export interface GraphUIState {
    id: number;
    type: 'array';
    dimensions: Dimensions;
    children: { [id: number]: number }
    highlight: boolean;
    color: 'tint' | 'shade' | 'fill';
}

export interface ValueUIState {
    id: number;
    type: 'value';
    value: number
    dimensions: Dimensions;
    parent: number;
    highlight: boolean;
    color: 'tint' | 'shade' | 'fill';
}


export interface Dimensions {
    x: number;
    y: number;
    height: number;
    width: number;
    opacity: number;
}

export interface SVGConfigInput {
    background: {
        fill: string;
    }
    graph: {
        radius: number;
        margin: number;
        padding: number;
        fill: string;
        tint: string;
        shade: string;
        highlight: string;
    },
    border: {
        height: number;
        width: number;
        thickness: number;
        fill: string;
        tint: string;
        shade: string;
        highlight: string;
    }
    cell: {
        fill: string;
        tint: string;
        shade: string;
        highlight: string;
        radius: number;
        margin: number;
        height: number;
        width: number;
    },
    column: {
        fill: string;
        tint: string;
        shade: string;
        highlight: string;
    }
}