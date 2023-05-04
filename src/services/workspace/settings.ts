import type { SVGConfigInput } from "./animation";

export const SVGLayout: SVGConfigInput = {
    background: {
        fill: '',
    },
    cell: {
        height: 20,
        width: 20,
        radius: 2,
        margin: 4,
        fill: '#adcfaf',
        tint: '#5ba05f',
        shade: '#2f5931',
        highlight: '#861dbb',
    },
    column: {
        fill: '',
        tint: '',
        shade: '',
        highlight: '',
    },
    graph: {
        radius: 4,
        margin: 12,
        padding: 22,
        fill: '#333333',
        tint: '',
        shade: '',
        highlight: '',
        corner: {
            width: 0.125,
            height: 1,
            stroke: 20,
        },
    },
};