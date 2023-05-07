import type { Value, Scope } from "@services/workspace/types";
declare const { Constant, List, Copy, Compare, Move, Swap, Untrack, Unhighlight, BatchStart, BatchEnd, Animate, Custom, Shade, Fill, Highlight }: Scope;
declare const list: Value[];

function QuickSort(sublist: Value[]) {
    if (sublist.length <= 1) {
        return sublist;
    }
    BatchStart();
    const pivot = sublist[0];
    const left = List();
    const right = List();
    Shade();
    Fill(left, right, sublist);
    BatchEnd();
    let l = 1;

    BatchStart();
    for (let i = 1; i < sublist.length; i++) {
        const item = sublist[i];
        BatchStart();
        const c = Compare(item, pivot);
        Highlight(pivot);
        BatchEnd();
        if (c == 0) {
            Move(sublist, item, l++);
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
    Shade();
    Fill(left, right);
    Highlight(sublist);
    BatchEnd();
    BatchStart();
    for (let i = l - 1; i >= 0; i--) {
        Move(sublist, sublist[i], left.length + i);
    }
    BatchEnd();

    BatchStart();
    for (let i = 0; i < left.length; i++) {
        Move(sublist, left[i], i);
    }
    BatchEnd();
    BatchStart();
    for (let i = 0; i < right.length; i++) {
        Move(sublist, right[i], i + left.length + l);
    }
    BatchEnd();
    BatchStart();
    Untrack(left);
    Untrack(right);
    BatchEnd();
    return sublist;
}

QuickSort(list);
Fill();