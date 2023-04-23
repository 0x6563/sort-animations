import type { Value, Workspace } from "@services/workspace/workspace"
declare const { Constant, List, Copy, Compare, Move, Swap, Delete, Unhighlight, BatchStart, BatchEnd, Animate, Custom, }: ReturnType<Workspace['scope']>;

export function MergeSortTopDown(list: Value[]) {
    // // Array A[] has the items to sort; array B[] is a work array.
    // void TopDownMergeSort(A[], B[], n)
    // {
    //     CopyArray(A, 0, n, B);           // one time copy of A[] to B[]
    //     TopDownSplitMerge(B, 0, n, A);   // sort data from B[] into A[]
    // }

    // // Split A[] into 2 runs, sort both runs into B[], merge both runs from B[] to A[]
    // // iBegin is inclusive; iEnd is exclusive (A[iEnd] is not in the set).
    // void TopDownSplitMerge(B[], iBegin, iEnd, A[])
    // {
    //     if (iEnd - iBegin <= 1)                     // if run size == 1
    //         return;                                 //   consider it sorted
    //     // split the run longer than 1 item into halves
    //     iMiddle = (iEnd + iBegin) / 2;              // iMiddle = mid point
    //     // recursively sort both runs from array A[] into B[]
    //     TopDownSplitMerge(A, iBegin,  iMiddle, B);  // sort the left  run
    //     TopDownSplitMerge(A, iMiddle,    iEnd, B);  // sort the right run
    //     // merge the resulting runs from array B[] into A[]
    //     TopDownMerge(B, iBegin, iMiddle, iEnd, A);
    // }

    // //  Left source half is A[ iBegin:iMiddle-1].
    // // Right source half is A[iMiddle:iEnd-1   ].
    // // Result is            B[ iBegin:iEnd-1   ].
    // void TopDownMerge(A[], iBegin, iMiddle, iEnd, B[])
    // {
    //     i = iBegin, j = iMiddle;

    //     // While there are elements in the left or right runs...
    //     for (k = iBegin; k < iEnd; k++) {
    //         // If left run head exists and is <= existing right run head.
    //         if (i < iMiddle && (j >= iEnd || A[i] <= A[j])) {
    //             B[k] = A[i];
    //             i = i + 1;
    //         } else {
    //             B[k] = A[j];
    //             j = j + 1;
    //         }
    //     }
    // }

    // void CopyArray(A[], iBegin, iEnd, B[])
    // {
    //     for (k = iBegin; k < iEnd; k++)
    //         B[k] = A[k];
    // }

    function SplitMerge(B, low, high, A) {
        if (high - low <= 1)
            return;
        const mid = Math.floor((high + low) / 2);
        SplitMerge(A, low, mid, B);
        SplitMerge(A, mid, high, B);
        Merge(B, low, mid, high, A);
    }
    function Merge(A, low, mid, high, B) {
        let i = low;
        let j = mid;
        for (let k = low; k < high; k++) {
            if (i < mid && (j >= high || Compare(A[i], A[j]) <= 0)) {
                B[k] = A[i];
                i = i + 1;
            } else {
                B[k] = A[j];
                j = j + 1;
            }
        }
    }
    const temp = List();
    for (let i = 0; i < list.length; i++) {
        temp[i] = Copy(list[i]);
    }
    SplitMerge(temp, 0, temp.length, list);
    Delete(temp);
}