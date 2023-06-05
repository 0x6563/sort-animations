import type { Value, Scope } from "@services/workspace/types";
declare const { Constant, List, Copy, Compare, Move, Swap, Untrack, Unhighlight, BatchStart, BatchEnd, Animate, Custom, Shade, Fill, Highlight }: Scope;
declare const list: Value[];

let gap = list.length;
let shrink = 1.3;
let sorted = false

while (!sorted) {
  gap = Math.floor(gap / shrink)

  if (gap <= 1) {
    gap = 1;
    sorted = true;
  }

  for (let i = 0; i + gap < list.length; i++) {
    if (Compare(list[i], list[i + gap]) > 0) {
      Swap(list, list[i], list[i + gap]);
      sorted = false;
    }
  }
}