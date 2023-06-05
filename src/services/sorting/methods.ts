

import BubbleSort from "./algorithms/bubblesort?compiled"
import HoareQuickSort from "./algorithms/quicksort-hoare?compiled"
import CombSort from "./algorithms/comb?compiled"
import LomutoQuickSort from "./algorithms/quicksort-lomuto?compiled"
import CustomQuickSort from "./algorithms/sample-quicksort?compiled"
import MergeSortTopDown from "./algorithms/mergesort-topdown?compiled"
import MergeSortBottomUp from "./algorithms/mergesort-bottomup?compiled"
import SelectionSort from "./algorithms/selection?compiled"
import InsertionSort from "./algorithms/insertion?compiled"
import Gnome from "./algorithms/gnome?compiled"

export const SortMethods = {
    BubbleSort: BubbleSort,
    'QuickSort - Lomuto Edition': LomutoQuickSort,
    'QuickSort - Hoare Edition': HoareQuickSort,
    'MergeSort TopDown': MergeSortTopDown,
    'MergeSort BottomUp': MergeSortBottomUp,
    'Selection Sort': SelectionSort,
    'QuickSort Fancy Animations': CustomQuickSort,
    'Insertion Sort': InsertionSort,
    'Comb Sort': CombSort,
    'Gnome Sort': Gnome
    // JavaScriptSort: JavaScriptSort,
}
