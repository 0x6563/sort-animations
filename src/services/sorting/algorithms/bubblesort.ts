import type { Value, Scope } from "@services/workspace/types";
declare const { Constant, List, Copy, Compare, Move, Swap, Untrack, Unhighlight, BatchStart, BatchEnd, Animate, Custom, }: Scope;
declare const list: Value[];

let sorted = true;
let max = list.length - 1;
do {
    sorted = true;
    for (let i = 0; i < max; i++) {
        const c = Compare(list[i], list[i + 1]);
        if (c > 0) {
            sorted = false;
            Swap(list, list[i], list[i + 1]);
        }
    }
    max--;
} while (!sorted);
