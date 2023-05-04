import type { Value, Scope } from "@services/workspace/types";
declare const { Constant, List, Copy, Compare, Move, Swap, Untrack, Unhighlight, BatchStart, BatchEnd, Animate, Custom, }: Scope;
declare const list: Value[];

list.sort((a, b) => Compare(a, b));