import { BubbleSort } from "./sorting/bubblesort"
import { HoareQuickSort } from "./sorting/hoare-quicksort"
import { LomutoQuickSort } from "./sorting/lomuto-quicksort"
import { NaiveQuickSort } from "./sorting/naive-quicksort"

export const SortMethods = {
    BubbleSort: BubbleSort.toString(),
    LomutoQuickSort: LomutoQuickSort.toString(),
    HoareQuickSort: HoareQuickSort.toString(),
    NaiveQuickSort: NaiveQuickSort.toString()
}
