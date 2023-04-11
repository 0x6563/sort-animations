import type { Item } from "@services/workspace";
const { Move, Swap, Compare, List, Delete, Reindex, Unhighlight, NoAnimate, Animate, Custom } = {} as ReturnType<import("@services/workspace").Workspace['scope']>;

export function LomutoQuickSort(list: Item[]) {
    // FROM : https://en.wikipedia.org/wiki/Quicksort
    // // Sorts a (portion of an) array, divides it into partitions, then sorts those
    // algorithm quicksort(A, lo, hi) is 
    //   // Ensure indices are in correct order
    //   if lo >= hi || lo < 0 then 
    //     return

    //   // Partition array and get the pivot index
    //   p := partition(A, lo, hi) 

    //   // Sort the two partitions
    //   quicksort(A, lo, p - 1) // Left side of pivot
    //   quicksort(A, p + 1, hi) // Right side of pivot

    // // Divides array into two partitions
    // algorithm partition(A, lo, hi) is 
    //   pivot := A[hi] // Choose the last element as the pivot

    //   // Temporary pivot index
    //   i := lo - 1

    //   for j := lo to hi - 1 do 
    //     // If the current element is less than or equal to the pivot
    //     if A[j] <= pivot then 
    //       // Move the temporary pivot index forward
    //       i := i + 1
    //       // Swap the current element with the element at the temporary pivot index
    //       swap A[i] with A[j]

    //   // Move the pivot element to the correct pivot position (between the smaller and larger elements)
    //   i := i + 1
    //   swap A[i] with A[hi]
    //   return i // the pivot index

    function QuickSort(A: Item[], low: number = 0, high: number = 0) {
        if (low >= high || low < 0) {
            return
        }
        const p = Partition(A, low, high);
        QuickSort(A, low, p - 1);
        QuickSort(A, p + 1, high);
    }
    function Partition(A: Item[], low: number = 0, high: number = 0) {
        const pivot = A[high];
        let i = low - 1;
        for (let j = low; j <= high - 1; j++) {
            if (Compare(A[j], pivot) <= 0) {
                i++;
                Swap(A[j], A[i]);
            }
        }
        i++;
        Swap(A[i], A[high])
        return i;
    }
    return QuickSort(list, 0, list.length - 1)
} 