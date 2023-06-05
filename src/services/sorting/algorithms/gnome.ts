import type { Value, Scope } from "@services/workspace/types";
declare const { Constant, List, Copy, Compare, Move, Swap, Untrack, Unhighlight, BatchStart, BatchEnd, Animate, Custom, }: Scope;
declare const list: Value[];

let pos = 0;
while (pos < list.length) {
    if (pos == 0 || Compare(list[pos], list[pos - 1]) >= 0) {
        pos++;
    } else {
        Swap(list, list[pos], list[pos - 1]);
        pos--;
    }
}