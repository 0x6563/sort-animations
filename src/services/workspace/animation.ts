import type { AnimationFrame } from "@services/types";
import type { EventLogEvent } from "./eventlog";

export class WorkspaceAnimation {
    animations: AnimationFrame[] = [];
    runtime: number = 1000;
    pause: number = 200;
    duration: number = 500;
    current: Stage = {
        references: [],
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
    stage: Stage;

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
    settings: SVGConfig = {
        background: {
            fill: ''
        },
        column: {
            height: 0,
            fill: '',
            tint: '',
            shade: '',
            highlight: ''
        },
        graph: {
            width: 0,
            height: 0,
            margin: 0,
            padding: 0,
            outerHeight: 0,
            outerWidth: 0,
            radius: 0,
            fill: '',
            tint: '',
            shade: '',
            highlight: ''
        },
        cell: {
            height: 0,
            width: 0,
            margin: 0,
            outerHeight: 0,
            outerWidth: 0,
            radius: 0,
            fill: '',
            tint: '',
            shade: '',
            highlight: ''
        }
    }

    constructor(
        private log: EventLogEvent[],
        config: SVGConfigInput
    ) {
        this.stage = Clone(this.current);
        this.settings.background.fill = config.background.fill || 'none';
        this.settings.cell.fill = config.cell.fill || 'none';
        this.settings.cell.tint = config.cell.tint || config.cell.fill;
        this.settings.cell.shade = config.cell.shade || config.cell.fill;
        this.settings.cell.highlight = config.cell.highlight || config.cell.fill;
        this.settings.column.fill = config.column.fill || 'none';
        this.settings.column.tint = config.column.tint || config.column.fill;
        this.settings.column.shade = config.column.shade || config.column.fill;
        this.settings.column.highlight = config.column.highlight || config.column.fill;
        this.settings.graph.fill = config.graph.fill || 'none';
        this.settings.graph.tint = config.graph.tint || config.graph.fill;
        this.settings.graph.shade = config.graph.shade || config.graph.fill;
        this.settings.graph.highlight = config.graph.highlight || config.graph.fill;
        this.settings.cell.height = config.cell.height;
        this.settings.cell.width = config.cell.width;
        this.settings.cell.radius = config.cell.radius;
        this.settings.graph.radius = config.graph.radius;
        this.settings.cell.margin = config.cell.margin;
        this.settings.cell.outerHeight = this.settings.cell.height + this.settings.cell.margin;
        this.settings.cell.outerWidth = this.settings.cell.width + this.settings.cell.margin;
        this.analyze();
        this.settings.column.height = this.columnHeight(this.stats.value.maxValue);
        this.settings.graph.margin = config.graph.margin;
        this.settings.graph.padding = config.graph.padding;
        this.settings.graph.corner = config.graph.corner;
        this.settings.graph.height = this.settings.column.height;
        this.settings.graph.width = this.settings.cell.outerWidth * this.stats.array.length - this.settings.cell.margin;
        this.settings.graph.outerHeight = this.settings.graph.height + (this.settings.graph.padding * 2);
        this.settings.graph.outerWidth = this.settings.graph.width + (this.settings.graph.padding * 2);
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
                    this.stage.references[detail.id] = {
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
                        linked: detail.type == 'array' ? {} : -1
                    } as Layout;

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
                    this.stage.references[detail.id].dimensions.opacity = 1;
                } else {
                    this.stage.references[detail.id].dimensions.opacity = 0;
                }
                this.stage.changes.layout.push(detail.id);

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
                    this.stage.changes.copy[detail.data.target] = detail.data.source;
                    this.highlight(detail.data.target);
                }
            } else if (event == 'change') {
                const { current, previous, target, property } = detail;

                if ('previous' in detail && typeof previous == 'number') {
                    if (this.stage.references[target].linked[previous] == property) {
                        delete this.stage.references[target].linked[previous];
                        this.stage.references[previous].linked = -1;
                        this.stage.references[previous].dimensions.opacity = 0;
                        this.stage.changes.layout.push(previous);
                    }
                }

                if ('current' in detail && typeof current == 'number') {
                    const o = this.stage.references[current].linked as number;
                    if (o >= 0) {
                        delete this.stage.references[o].linked[current];
                    }
                    this.stage.references[current].linked = target;
                    this.stage.references[current].dimensions.opacity = 1;

                    this.stage.references[target].linked[current] = property;
                    this.stage.changes.layout.push(current);
                }

            } else if (event == 'animation') {
                if (detail.command == 'batch-start') {
                    callStack++;
                }
                if (detail.command == 'batch-end') {
                    callStack--;
                }
                if (detail.command == 'unhighlight') {
                    for (const id in this.stage.highlight.cell) {
                        this.stage.references[id].highlight = false;
                    }
                    for (const id in this.stage.highlight.graph) {
                        this.stage.references[id].highlight = false;
                    }
                }
            }

            if (callStack == 0 && (this.stage.changes.layout.length || this.stage.changes.color.length)) {
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
        if (this.stage.references[id].type == 'array') {
            for (const i in this.stage.references[id].linked as {}) {
                this.highlight(parseInt(i));
            }
        } else {
            this.stage.references[id].highlight = true;
            this.stage.highlight.cell[id] = 1;
            this.stage.changes.color.push(id);
        }
    }

    unhighlight() {
        for (const id in this.stage.highlight.cell) {
            this.stage.references[id].highlight = false;
            this.stage.changes.color.push(parseInt(id));
        }
        this.stage.highlight.cell = {};
    }

    adjustColors() {
        for (const id of this.stage.changes.color) {
            const staged = this.stage.references[id];
            const current = this.current.references[id];
            const t = staged.type == 'value' ? 'cell' : 'graph';
            const stagedColor = staged.highlight ? 'highlight' : staged.color;
            const currentColor = current.highlight ? 'highlight' : current.color;
            if (stagedColor != currentColor) {
                this.animateAttributes(id, { fill: this.settings[t][stagedColor] }, this.duration);
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

        const layoutIds = Array.from(new Set(this.stage.changes.layout));

        for (const id of layoutIds) {
            const stageRef = this.stage.references[id];
            const currentRef = this.current.references[id];
            const { dimensions: stageDims } = stageRef;
            const { dimensions: currentDims } = currentRef;
            const stageParent = stageRef.type == 'value' && stageRef.linked >= 0 ? this.stage.references[stageRef.linked] : undefined;
            const currentParent = currentRef.type == 'value' && currentRef.linked >= 0 ? this.current.references[currentRef.linked] : undefined;
            const stageIndex = stageParent ? stageParent.linked[id] : undefined;
            const currentIndex = currentParent ? currentParent.linked[id] : undefined;

            if (stageRef.type == 'value' && !stageDims.opacity) {
                changes.hideValues.push(id);
                continue;
            }
            if (stageRef.type == 'value' && (stageDims.opacity && currentDims.opacity) && (stageRef.linked != currentRef.linked || stageIndex != currentIndex)) {
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
        this.stage.changes.layout = [];
        this.stage.changes.color = [];
        this.current = Clone(this.stage);
        this.stage = Clone(this.current);
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
        const visible = this.stats.array.ref.filter(({ id }) => this.stage.references[id].dimensions.opacity || this.current.references[id].dimensions.opacity);
        this.setViewBox(visible.length);

        let changed = false;
        for (const id of ids) {
            const position = this.updateGraphPosition(this.stage.references[id] as LayoutArray, visible.findIndex(v => v.id == id), visible.length);
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
                const position = this.updateColumnPosition(this.stage.references[id] as LayoutValue);
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
                if (id in this.stage.changes.copy) {
                    const target = this.stage.changes.copy[id];
                    const { x, y } = this.stage.references[target].dimensions;
                    delete this.stage.changes.copy[id];
                    this.stage.references[id].dimensions.x = x;
                    this.stage.references[id].dimensions.y = y;
                    this.animateAttributes(id, { x, y }, 0);
                    if (this.stage.references[id].linked as number >= 0) {
                        const position = this.updateColumnPosition(this.stage.references[id] as LayoutValue);
                        this.animateAttributes(id, position.changes, this.duration);
                    }
                } else {
                    const position = this.updateColumnPosition(this.stage.references[id] as LayoutValue);
                    this.animateAttributes(id, position.changes, 0);
                }
                this.animateAttributes(id, { opacity: 1 });
            }
            this.incrementRuntime();
        }
    }

    hideArrays(ids: number[]) {
        const visible = this.stats.array.ref.filter(({ id }) => this.stage.references[id].dimensions.opacity);

        if (ids.length) {
            for (const id of ids) {
                this.animateAttributes(id, { opacity: 0 });
                for (const childId in this.stage.references[id].linked as { [key: number]: number }) {
                    if (this.stage.references[childId].linked == id) {
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
        const visible = this.stats.array.ref.filter(({ id }) => this.stage.references[id].dimensions.opacity)
        for (const { id } of visible) {
            const layout = this.stage.references[id] as LayoutArray;
            const position = this.updateGraphPosition(layout, visible.findIndex(v => v.id == id), visible.length);
            this.animateAttributes(id, position.changes);

            for (const cid in layout.linked) {
                const position = this.updateColumnPosition(this.stage.references[cid] as LayoutValue);
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
        for (const ref of this.stage.references) {
            if (ref.type === 'array') {
                ref.dimensions.height = this.settings.graph.height;
                ref.dimensions.width = this.settings.graph.width;
                this.animateAttributes(ref.id, { fill: this.settings.graph.fill }, 0);

            }
            if (ref.type === 'value') {
                ref.dimensions.height = this.columnHeight(ref.value);
                ref.dimensions.width = this.settings.cell.width;
                this.animateAttributes(ref.id, { fill: this.settings.cell.fill }, 0);
            }

        }
        this.stage.viewbox = this.getViewBox(1);
    }

    columnHeight(v: number) {
        let m = 0;
        if (v > 1) {
            m = this.settings.cell.margin * Math.ceil(v - 1);
        }
        return this.settings.cell.height * v + m;
    }

    updateColumnPosition(v: LayoutValue): { changed: boolean, changes: { [key: string]: number | string } } {
        let position = { x: -1, y: -1 };
        if (v.linked >= 0) {
            const array = this.stage.references[v.linked] as LayoutArray;
            const index = array.linked[v.id];
            position = {
                x: array.dimensions.x + index * this.settings.cell.outerWidth + this.settings.graph.padding,
                y: array.dimensions.y + this.settings.column.height - v.dimensions.height + this.settings.graph.padding
            }

        }
        const changes: { [key: string]: number | string } = {};

        let changed = false;
        if (v.dimensions.x != position.x) {
            v.dimensions.x = position.x;
            changes.x = position.x;
            changed = true;
        }

        if (v.dimensions.y != position.y) {
            v.dimensions.y = position.y;
            changes.y = position.y;
            changed = true;
        }
        return { changes, changed };
    }

    updateGraphPosition(v: LayoutArray, index: number, max: number): { changed: boolean, changes: { [key: string]: number | string } } {
        const columns = Math.ceil(Math.sqrt(max));
        const column = index % columns;
        const row = Math.floor(index / columns);
        const position = {
            x: column * (this.settings.graph.outerWidth + this.settings.graph.margin) + this.settings.graph.margin,
            y: row * (this.settings.graph.outerHeight + this.settings.graph.margin) + this.settings.graph.margin
        }
        const changes: { [key: string]: number | string } = {};

        const changed = v.dimensions.x != position.x || v.dimensions.y != position.y;

        if (v.dimensions.x != position.x) {
            v.dimensions.x = position.x;
            changes.x = position.x;
        }

        if (v.dimensions.y != position.y) {
            v.dimensions.y = position.y;
            changes.y = position.y;
        }
        return { changes, changed };
    }

    setViewBox(visibleArrays: number) {
        const viewBox = this.getViewBox(visibleArrays);
        if (viewBox != this.stage.viewbox) {
            this.animations.push({
                begin: this.runtime,
                duration: this.duration,
                set: { viewBox }
            });
            this.stage.viewbox = viewBox;
            this.incrementRuntime();
        }
    }
    getViewBox(visibleArrays: number) {
        const columns = Math.ceil(Math.sqrt(visibleArrays));
        const rows = Math.ceil(visibleArrays / columns);
        const height = this.settings.graph.outerHeight * rows + this.settings.graph.margin * (rows + 1);
        const width = this.settings.graph.outerWidth * columns + this.settings.graph.margin * (columns + 1);

        return `0 0 ${width} ${height}`;
    }
}

function Clone<T>(o: T): T {
    return JSON.parse(JSON.stringify(o));
}


interface Stage {
    references: Layout[];
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
type index = number;
type Layout = LayoutArray | LayoutValue;
interface LayoutArray {
    id: number;
    type: 'array';
    dimensions: Dimensions;
    linked: { [id: number]: index }
    highlight: boolean;
    color: 'tint' | 'shade' | 'fill';
}

interface LayoutValue {
    id: number;
    type: 'value';
    value: number
    dimensions: Dimensions;
    linked: number;
    highlight: boolean;
    color: 'tint' | 'shade' | 'fill';
}


interface Dimensions {
    x: number;
    y: number;
    height: number;
    width: number;
    opacity: number;
}
type SVGConfig = SVGConfigInput & SVGConfigInputComputed;
interface SVGConfigInputComputed {
    graph: {
        width: number;
        height: number;
        outerHeight: number;
        outerWidth: number;
    }
    cell: {
        outerHeight: number;
        outerWidth: number;
    }
    column: {
        height: number;
    }
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
        corner?: {
            height: number;
            width: number;
            stroke: number;
        }
    },
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