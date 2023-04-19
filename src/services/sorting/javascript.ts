import type { Value, Workspace } from "@services/workspace/workspace"
declare const { Constant, List, Copy, Compare, Move, Swap, Delete, Unhighlight, BatchStart, BatchEnd, Animate, Custom, }: ReturnType<Workspace['scope']>;

export function JavaScriptSort(list: Value[]) {
    return list.sort((a, b) => Compare(a, b));
}