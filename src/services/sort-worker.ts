import { Workspace } from "./workspace";

onmessage = (e) => {
    const workspace = new Workspace(e.data.array, true);
    SortEval(workspace, e.data.algorithm)
    postMessage({ array: e.data.array, history: workspace.history })
};




function SortEval(Workspace, algorithm) {
    eval('let SortEval = undefined');
    eval('let postMessage = undefined');
    eval('let onmessage = undefined');
    eval('let { Move, Swap, Compare, List, Delete, Reindex, Unhighlight, NoAnimate, Animate, Custom } = Workspace.scope()');
    return eval(`(${algorithm})(Workspace.lists[0])`);
}