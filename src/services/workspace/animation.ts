import type { AnimationFrame } from "@services/types";
import type { EventLogEvent } from "./eventlog";

export class WorkspaceAnimation {
    animations: AnimationFrame[] = [];
    runtime: number = 1000;
    pause: number = 200;
    duration: number = 500;
    current: { layout: Layout[], changes: number[], viewbox: string; } = { layout: [], changes: [], viewbox: '' };
    stage: { layout: Layout[], changes: number[], viewbox: string } = { layout: [], changes: [], viewbox: '' };

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
        svg: {
            fill: ''
        },
        column: {
            height: 0,
            fill: '',
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
            highlight: ''
        },
        cell: {
            size: 0,
            margin: 0,
            padding: 0,
            outerSize: 0,
            radius: 0,
            fill: '',
            highlight: ''
        }
    }

    constructor(
        private log: EventLogEvent[],
        config: SVGConfigInput
    ) {
        this.settings.svg.fill = config.background.fill || 'none';
        this.settings.cell.fill = config.cell.fill || 'none';
        this.settings.cell.highlight = config.cell.highlight || 'none';
        this.settings.column.fill = config.column.fill || 'none';
        this.settings.column.highlight = config.column.highlight || 'none';
        this.settings.graph.fill = config.graph.fill || 'none';
        this.settings.graph.highlight = config.graph.highlight || 'none';
        this.settings.cell.size = config.cell.size;
        this.settings.cell.radius = config.cell.radius;
        this.settings.graph.radius = config.graph.radius;
        this.settings.cell.margin = config.cell.margin;
        this.settings.cell.outerSize = this.settings.cell.size + this.settings.cell.margin;
        this.analyze();
        this.settings.column.height = this.columnHeight(this.stats.value.maxValue);
        this.settings.graph.margin = config.graph.margin;
        this.settings.graph.padding = config.graph.padding;
        this.settings.graph.height = this.settings.column.height;
        this.settings.graph.width = this.settings.cell.outerSize * this.stats.array.length - this.settings.cell.margin;
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
                    this.stage.layout[detail.id] = {
                        id: detail.id,
                        type: detail.type,
                        dimensions: {
                            x: 0,
                            y: 0,
                            height: 0,
                            width: 0,
                            opacity: 0
                        },
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
                    this.stage.layout[detail.id].dimensions.opacity = 1;
                } else {
                    this.stage.layout[detail.id].dimensions.opacity = 0;
                }
                this.stage.changes.push(detail.id);

            } else if (event == 'call') {
                if (detail.progress == 'start') {
                    callStack++;
                }
                if (detail.progress == 'end') {
                    callStack--;
                }
            } else if (event == 'change') {
                const { current, previous, target, property } = detail;

                if ('previous' in detail && typeof previous == 'number') {
                    if (this.stage.layout[target].linked[previous] == property) {
                        this.stage.layout[previous].linked = -1;
                        delete this.stage.layout[target].linked[previous];
                        this.stage.layout[previous].dimensions.opacity = 0;
                        this.stage.changes.push(previous);
                    }
                }

                if ('current' in detail && typeof current == 'number') {
                    const o = this.stage.layout[current].linked as number;
                    if (o >= 0) {
                        delete this.stage.layout[o].linked[current];
                    }
                    this.stage.layout[current].linked = target;
                    this.stage.layout[current].dimensions.opacity = 1;

                    this.stage.layout[target].linked[current] = property;
                    this.stage.changes.push(current);
                }

            } else if (event == 'animation') {
                if (detail.command == 'batch-start') {
                    callStack++;
                }
                if (detail.command == 'batch-end') {
                    callStack--;
                }
            }

            if (callStack == 0 && this.stage.changes.length) {
                this.applyStage();
                this.shiftStage();
            }
        }
        this.applyStage();
        this.shiftStage();
    }

    applyStage() {
        // array changes 
        const changes: { [key: string]: number[] } = {
            hideValues: [],
            showArrays: [],
            moveExistingValues: [],
            newValues: [],
            hideArrays: [],
            other: []
        };

        const ids = Array.from(new Set(this.stage.changes));
        for (const id of ids) {
            const stageRef = this.stage.layout[id];
            const currentRef = this.current.layout[id];
            const { dimensions: stageDims } = stageRef;
            const { dimensions: currentDims } = currentRef;
            const stageParent = stageRef.type == 'value' && stageRef.linked >= 0 ? this.stage.layout[stageRef.linked] : undefined;
            const currentParent = currentRef.type == 'value' && currentRef.linked >= 0 ? this.current.layout[currentRef.linked] : undefined;
            const stageIndex = stageParent ? stageParent.linked[id] : undefined;
            const currentIndex = currentParent ? currentParent.linked[id] : undefined;

            if (stageRef.type == 'value' && !stageDims.opacity) {
                changes.hideValues.push(id);
                continue;
            }
            if (stageRef.type == 'array' && stageDims.opacity == 1 && !currentDims.opacity) {
                changes.showArrays.push(id);
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
        this.stage.changes = [];
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
        const visible = this.stats.array.ref.filter(({ id }) => this.stage.layout[id].dimensions.opacity || this.current.layout[id].dimensions.opacity);
        this.setViewBox(visible.length);

        let changed = false;
        for (const id of ids) {
            const position = this.updateArrayPosition(this.stage.layout[id] as LayoutArray, visible.findIndex(v => v.id == id), visible.length);
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
                const position = this.updateColumnPosition(this.stage.layout[id] as LayoutValue);
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
                const position = this.updateColumnPosition(this.stage.layout[id] as LayoutValue);
                this.animateAttributes(id, position.changes, 0);
                this.animateAttributes(id, { opacity: 1 });
            }
            this.incrementRuntime();
        }
    }

    hideArrays(ids: number[]) {
        const visible = this.stats.array.ref.filter(({ id }) => this.stage.layout[id].dimensions.opacity);

        if (ids.length) {
            for (const id of ids) {
                this.animateAttributes(id, { opacity: 0 });
                for (const childId in this.stage.layout[id].linked as { [key: number]: number }) {
                    if (this.stage.layout[childId].linked == id) {
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
        const visible = this.stats.array.ref.filter(({ id }) => this.stage.layout[id].dimensions.opacity)
        for (const { id } of visible) {
            const layout = this.stage.layout[id] as LayoutArray;
            const position = this.updateArrayPosition(layout, visible.findIndex(v => v.id == id), visible.length);
            this.animateAttributes(id, position.changes);

            for (const cid in layout.linked) {
                const position = this.updateColumnPosition(this.stage.layout[cid] as LayoutValue);
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
        for (const ref of this.stage.layout) {
            if (ref.type === 'array') {
                ref.dimensions.height = this.settings.graph.height;
                ref.dimensions.width = this.settings.graph.width;
            }
            if (ref.type === 'value') {
                ref.dimensions.height = this.columnHeight(ref.value);
                ref.dimensions.width = this.settings.cell.size;
            }

        }
        this.stage.viewbox = this.getViewBox(1);
    }

    columnHeight(v: number) {
        let m = 0;
        if (v > 1) {
            m = this.settings.cell.margin * Math.ceil(v - 1);
        }
        return this.settings.cell.size * v + m;
    }

    updateColumnPosition(v: LayoutValue): { changed: boolean, changes: { [key: string]: number | string } } {
        let position = { x: -1, y: -1 };
        if (v.linked >= -0) {
            const array = this.stage.layout[v.linked] as LayoutArray;
            const index = array.linked[v.id];
            position = {
                x: array.dimensions.x + index * this.settings.cell.outerSize + this.settings.graph.padding,
                y: array.dimensions.y + this.settings.column.height - v.dimensions.height + this.settings.graph.padding
            }

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

    updateArrayPosition(v: LayoutArray, index: number, max: number): { changed: boolean, changes: { [key: string]: number | string } } {
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



type index = number;
type Layout = LayoutArray | LayoutValue;
interface LayoutArray {
    id: number;
    type: 'array';
    dimensions: Dimensions;
    linked: { [id: number]: index }
}

interface LayoutValue {
    id: number;
    type: 'value';
    value: number
    dimensions: Dimensions;
    linked: number;
}


interface Dimensions {
    x: number;
    y: number;
    height: number;
    width: number;
    opacity: number;
}

interface SVGConfig {
    svg: {
        fill: string;
    },
    graph: {
        width: number;
        height: number;
        margin: number;
        padding: number;
        outerHeight: number;
        outerWidth: number;
        fill: string;
        highlight: string;
        radius: number;
    }
    cell: {
        size: number;
        outerSize: number;
        margin: number;
        padding: number;
        fill: string;
        highlight: string;
        radius: number;
    }
    column: {
        height: number;
        fill: string;
        highlight: string;
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
        highlight: string;
    },
    cell: {
        fill: string;
        highlight: string;
        size: number;
        radius: number;
        margin: number;
    },
    column: {
        fill: string,
        highlight: string
    }
}