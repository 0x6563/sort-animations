import type { Item } from "@services/workspace";
declare const { Move, Swap, Compare, List, Delete, Reindex, Unhighlight, NoAnimate, Animate, Custom }: ReturnType<import("@services/workspace").Workspace['scope']>;

export function HoareQuickSort(list: Item[]) {
    /*!
     FROM : https://en.wikipedia.org/wiki/Quicksort
       // Sorts a (portion of an) array, divides it into partitions, then sorts those
     algorithm quicksort(A, lo, hi) is 
     if lo >= 0 && hi >= 0 && lo < hi then
       p := partition(A, lo, hi) 
       quicksort(A, lo, p) // Note: the pivot is now included
       quicksort(A, p + 1, hi) 
    
     // Divides array into two partitions
     algorithm partition(A, lo, hi) is 
     // Pivot value
     pivot := A[ floor((hi - lo)/2) + lo ] // The value in the middle of the array
    
     // Left index
     i := lo - 1 
    
     // Right index
     j := hi + 1
    
     loop forever 
       // Move the left index to the right at least once and while the element at
       // the left index is less than the pivot
       do i := i + 1 while A[i] < pivot
    
       // Move the right index to the left at least once and while the element at
       // the right index is greater than the pivot
       do j := j - 1 while A[j] > pivot
    
       // If the indices crossed, return
       if i >= j then return j
    
       // Swap the elements at the left and right indices
       swap A[i] with A[j]
    */
    function QuickSort(A: Item[], low: number, high: number) {
        if (low >= 0 && low < high) {
            const p = Partition(A, low, high) as number;
            QuickSort(A, low, p);
            QuickSort(A, p + 1, high);
        }

    }

    function Partition(A: Item[], low: number, high: number) {
        const pivot = A[Math.floor((high - low) / 2) + low];
        let i = low - 1;
        let j = high + 1;

        // I hate this.
        while (1) {
            do {
                i++;
            } while (Compare(A[i], pivot) < 0);

            do {
                j--;
            } while (Compare(A[j], pivot) > 0);

            if (i >= j) {
                return j;
            }
            Swap(A[i], A[j]);
        }

    }
    return QuickSort(list, 0, list.length - 1);

}