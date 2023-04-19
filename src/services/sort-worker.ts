import { Workspace } from "./workspace/workspace";

onmessage = (e) => {
    const workspace = new Workspace(e.data.array);
    SortEval(workspace, e.data.algorithm)
    postMessage({ array: e.data.array, log: workspace.log.events })
};

function SortEval(Workspace: Workspace, algorithm) {
    let SortEval = undefined;
    let postMessage = undefined;
    let onmessage = undefined;
    let { Move, Swap, Compare, List, Delete, Unhighlight, BatchStart, BatchEnd, Animate, Custom } = Workspace.scope();
    eval(`(${algorithm})(Workspace.main)`);
    // Prevent Tree Shaking
    return { SortEval, postMessage, onmessage, Move, Swap, Compare, List, Delete, Unhighlight, BatchStart, BatchEnd, Animate, Custom };
} 