import type { Value, Scope } from "@services/workspace/types";
declare const { Constant, List, Copy, Compare, Move, Swap, Untrack, Unhighlight, BatchStart, BatchEnd, Animate, Custom, }: Scope;
declare const list: Value[];

let i = 1;
while (i < list.length) {
    let j = i;
    while (j > 0 && Compare(list[j - 1], list[j]) > 0) {
        Swap(list, list[j], list[j - 1]);
        j = j - 1;
    }
    i++;
}