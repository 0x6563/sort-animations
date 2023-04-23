import { BubbleSort } from "./sorting/bubblesort"
import { HoareQuickSort } from "./sorting/quicksort-hoare"
import { JavaScriptSort } from "./sorting/javascript"
import { LomutoQuickSort } from "./sorting/quicksort-lomuto"
import { CustomQuickSort } from "./sorting/custom-quicksort"
import { MergeSortTopDown } from "./sorting/mergesort-topdown"

export const SortMethods = {
    BubbleSort: BubbleSort.toString(),
    'QuickSort Lomuto': LomutoQuickSort.toString(),
    'QuickSort Hoare': HoareQuickSort.toString(),
    'MergeSort TopDown':MergeSortTopDown.toString(),
    Custom: CustomQuickSort.toString(),
    JavaScriptSort: JavaScriptSort.toString(),
}
