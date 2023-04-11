import type { Item } from "@services/workspace"
declare const { Move, Swap, Compare, List, Delete, Reindex, Unhighlight, NoAnimate, Animate, Custom }: ReturnType<import("@services/workspace").Workspace['scope']>;
export function BubbleSort(list: Item[]) {
    let sorted = true;
    let max = list.length - 1;
    do {
        sorted = true;
        for (let i = 0; i < max; i++) {
            const c = Compare(list[i], list[i + 1]);
            if (c > 0) {
                sorted = false;
                Swap(list[i], list[i + 1]);
            }
        }
        max--;
    } while (!sorted);
}
