import type { Item } from "@services/workspace";
const { Move, Swap, Compare, List, Delete, Reindex, Unhighlight, NoAnimate, Animate, Custom } = {} as ReturnType<import("@services/workspace").Workspace['scope']>;

export function NaiveQuickSort(list: Item[]) {
    if (list.length <= 1) {
        return list;
    }

    const pivot = list[0];
    const left: Item[] = List();
    const right: Item[] = List();
    for (let i = 1; i < list.length; i++) {
        const item = list[i];
        if (Compare(item, pivot) < 0) {
            Move(left, item);
        } else {
            Move(right, item);
        }
    }
    Unhighlight();
    NaiveQuickSort(left);
    NaiveQuickSort(right);

    Move(list, pivot, left.length);
    NoAnimate();
    for (let i = 0; i < left.length; i++) {
        Move(list, left[i], i);
    }
    Animate();
    Delete(left);

    NoAnimate();
    for (let i = 0; i < right.length; i++) {
        Move(list, right[i], i + left.length + 1);
    }
    Animate();

    Delete(right);

    return list;
}