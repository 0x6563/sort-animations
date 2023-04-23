import type { Value, Workspace } from "@services/workspace/workspace"
declare const { Constant, List, Copy, Compare, Move, Swap, Delete, Unhighlight, BatchStart, BatchEnd, Animate, Custom, }: ReturnType<Workspace['scope']>;

export function CustomQuickSort(list: Value[]) {
    if (list.length <= 1) {
        return list;
    }
    const pivot = list[0];
    BatchStart();
    const left = List();
    const right = List();
    BatchEnd();
    let l = 1;

    BatchStart();
    for (let i = 1; i < list.length; i++) {
        const item = list[i];
        const c = Compare(item, pivot);
        if (c == 0) {
            Move(list, item, l++);
        } else if (c < 0) {
            Move(left, item);
        } else {
            Move(right, item);
        }
    }
    BatchEnd();

    CustomQuickSort(left);
    CustomQuickSort(right);

    BatchStart();
    for (let i = l - 1; i >= 0; i--) {
        Move(list, list[i], left.length + i);
    }
    BatchEnd();

    BatchStart();
    for (let i = 0; i < left.length; i++) {
        Move(list, left[i], i);
    }
    BatchEnd();
    BatchStart();
    for (let i = 0; i < right.length; i++) {
        Move(list, right[i], i + left.length + l);
    }
    BatchEnd();
    BatchStart();
    Delete(left);
    Delete(right);
    BatchEnd();
    return list;
}