import type { GraphUIState, SVGConfigInput, ValueUIState } from "./animation";

export class WorkspaceLayout {

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
        config: SVGConfigInput,
        stats: {
            maxValue: number,
            length: number,
        }
    ) {

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
        this.settings.column.height = this.columnHeight(stats.maxValue);
        this.settings.graph.margin = config.graph.margin;
        this.settings.graph.padding = config.graph.padding;
        this.settings.graph.corner = config.graph.corner;
        this.settings.graph.height = this.settings.column.height;
        this.settings.graph.width = this.settings.cell.outerWidth * stats.length - this.settings.cell.margin;
        this.settings.graph.outerHeight = this.settings.graph.height + (this.settings.graph.padding * 2);
        this.settings.graph.outerWidth = this.settings.graph.width + (this.settings.graph.padding * 2);
    }

    columnHeight(v: number) {
        let m = 0;
        if (v > 1) {
            m = this.settings.cell.margin * Math.ceil(v - 1);
        }
        return this.settings.cell.height * v + m;
    }

    updateColumnPosition(array: GraphUIState, v: ValueUIState): { changed: boolean, changes: { [key: string]: number | string } } {
        let position = { x: -1, y: -1 };
        if (v.parent >= 0) {
            const index = array.children[v.id];
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

    updateGraphPosition(v: GraphUIState, index: number, max: number): { changed: boolean, changes: { [key: string]: number | string } } {
        const { column, row } = this.getLayout(max, index);
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

    getViewBox(visibleArrays: number) {
        const { columns, rows } = this.getLayout(visibleArrays);
        const width = this.settings.graph.outerWidth * columns + this.settings.graph.margin * (columns + 1);
        const height = this.settings.graph.outerHeight * rows + this.settings.graph.margin * (rows + 1);

        return `0 0 ${width} ${height}`;
    }

    getLayout(total: number, index?: number) {
        const columns = total <= 2 ? 1 : Math.ceil(Math.sqrt(total));
        index = typeof index == 'number' ? index : total;
        const column = index % columns;
        const row = Math.floor(index / columns);
        const rows = Math.ceil(total / columns);
        return { columns, column, row, rows };
    }
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