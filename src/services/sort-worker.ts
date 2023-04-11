import { Workspace } from "./workspace";

onmessage = (e) => {
    const workspace = new Workspace(e.data.array, true);
    SortEval(workspace, e.data.algorithm)
    postMessage({ array: e.data.array, history: workspace.history })
};




function SortEval(Workspace: Workspace, algorithm) {
    let SortEval = undefined;
    let postMessage = undefined;
    let onmessage = undefined;
    const { Move, Swap, Compare, List, Delete, Reindex, Unhighlight, NoAnimate, Animate, Custom } = Workspace.scope();
    return eval(`(${algorithm})(Workspace.lists[0])`);
}