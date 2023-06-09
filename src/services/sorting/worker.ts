import { Workspace } from "../workspace/workspace";

onmessage = (e) => {
    const workspace = new Workspace(e.data.array);
    SortEval(workspace, e.data.algorithm)
    postMessage({ array: e.data.array, log: workspace.log.events })
};

function SortEval(Workspace, algorithm) {
    const SortEval = undefined;
    const postMessage = undefined;
    const onmessage = undefined;
    const { Constant, List, Copy, Compare, Move, Swap, Untrack, Unhighlight, BatchStart, BatchEnd, Animate, Custom, Shade, Tint, Fill, Highlight } = Workspace.scope();
    const list = Workspace.main;
    Workspace = undefined;
    eval(`(function(list){${algorithm}})(list)`);
    // Prevent Tree Shaking
    return { list, SortEval, postMessage, onmessage, Constant, List, Copy, Compare, Move, Swap, Untrack, Unhighlight, BatchStart, BatchEnd, Animate, Custom, Shade, Tint, Fill, Highlight };
} 