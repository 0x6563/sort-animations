import type { Value, Scope } from "@services/workspace/types";
declare const { Constant, List, Copy, Compare, Move, Swap, Untrack, Unhighlight, BatchStart, BatchEnd, Animate, Custom, }: Scope;
declare const list: Value[];

function QuickSort(list: Value[]) {
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

    QuickSort(left);
    QuickSort(right);

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
    Untrack(left);
    Untrack(right);
    BatchEnd();
    return list;
}

QuickSort(list);