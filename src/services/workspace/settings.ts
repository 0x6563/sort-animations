import type { SVGConfigInput } from "./animation";

export const SVGLayout: SVGConfigInput = {
    background: {
        fill: '#111111',
    },
    cell: {
        height: 20,
        width: 20,
        radius: 2,
        margin: 4,
        fill: '#adcfaf',
        tint: '#5ba05f',
        shade: '#253126',
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
        fill: '',
        tint: '',
        shade: '',
        highlight: '',
    },
    border: {
        width: 0.125,
        height: 1,
        thickness: 10,
        fill: '#333333',
        tint: '',
        shade: '#151515',
        highlight: '#555555',
    },
};