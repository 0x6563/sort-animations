

import BubbleSort from "./algorithms/bubblesort?compiled"
import HoareQuickSort from "./algorithms/quicksort-hoare?compiled"
import JavaScriptSort from "./algorithms/javascript?compiled"
import LomutoQuickSort from "./algorithms/quicksort-lomuto?compiled"
import CustomQuickSort from "./algorithms/sample-quicksort?compiled"
import MergeSortTopDown from "./algorithms/mergesort-topdown?compiled"
import MergeSortBottomUp from "./algorithms/mergesort-bottomup?compiled"
import SelectionSort from "./algorithms/selectionsort?compiled"
export const SortMethods = {
    BubbleSort: BubbleSort,
    'QuickSort - Lomuto Edition': LomutoQuickSort,
    'QuickSort - Hoare Edition': HoareQuickSort,
    'MergeSort TopDown': MergeSortTopDown,
    'MergeSort BottomUp': MergeSortBottomUp,
    'Selection Sort': SelectionSort,
    'Sample QuickSort': CustomQuickSort,
    JavaScriptSort: JavaScriptSort,
}
