import type { Value, Workspace } from "@services/workspace/workspace"
declare const { Constant, List, Copy, Compare, Move, Swap, Delete, Unhighlight, BatchStart, BatchEnd, Animate, Custom, }: ReturnType<Workspace['scope']>;

export function NaiveQuickSort(list: Value[]) {
    if (list.length <= 1) {
        return list;
    }

    const pivot = list[0];
    BatchStart();
    const left: Value[] = List();
    const right: Value[] = List();
    BatchEnd();

    for (let i = 1; i < list.length; i++) {
        const item = list[i];
        if (Compare(item, pivot) < 0) {
            Move(left, item);
        } else {
            Move(right, item);
        }
    }
    // Unhighlight();
    NaiveQuickSort(left);
    NaiveQuickSort(right);

    Move(list, pivot, left.length);

    BatchStart();
    for (let i = 0; i < left.length; i++) {
        Move(list, left[i], i);
    }
    BatchEnd();


    BatchStart();
    for (let i = 0; i < right.length; i++) {
        Move(list, right[i], i + left.length + 1);
    }
    BatchEnd();

    BatchStart();
    Delete(left);
    Delete(right);
    BatchEnd();

    return list;
}