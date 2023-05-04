import type { Value, Scope } from "@services/workspace/types";
declare const { Constant, List, Copy, Compare, Move, Swap, Untrack, Unhighlight, BatchStart, BatchEnd, Animate, Custom, }: Scope;
declare const list: Value[];

function MergeSort(A: Value[], B: Value[], n: number) {
    for (let width = 1; width < n; width = 2 * width) {
        for (let i = 0; i < n; i = i + 2 * width) {
            Merge(A, i, Math.min(i + width, n), Math.min(i + 2 * width, n), B);
        }
        BatchStart();
        for (let i = 0; i < n; i++) {
            A[i] = Copy(B[i])
        }
        BatchEnd();
    }
}

function Merge(A: Value[], iLeft: number, iRight: number, iEnd: number, B: Value[]) {
    let i = iLeft
    let j = iRight;
    for (let k = iLeft; k < iEnd; k++) {
        if (i < iRight && (j >= iEnd || Compare(A[i], A[j]) <= 0)) {
            B[k] = A[i];
            i = i + 1;
        } else {
            B[k] = A[j];
            j = j + 1;
        }
    }
}
const temp = List();
MergeSort(list, temp, list.length);
Untrack(temp);

/*!
 // array A[] has the items to sort; array B[] is a work array
void BottomUpMergeSort(A[], B[], n)
{
    // Each 1-element run in A is already "sorted".
    // Make successively longer sorted runs of length 2, 4, 8, 16... until the whole array is sorted.
    for (width = 1; width < n; width = 2 * width)
    {
        // Array A is full of runs of length width.
        for (i = 0; i < n; i = i + 2 * width)
        {
            // Merge two runs: A[i:i+width-1] and A[i+width:i+2*width-1] to B[]
            // or copy A[i:n-1] to B[] ( if (i+width >= n) )
            BottomUpMerge(A, i, min(i+width, n), min(i+2*width, n), B);
        }
        // Now work array B is full of runs of length 2*width.
        // Copy array B to array A for the next iteration.
        // A more efficient implementation would swap the roles of A and B.
        CopyArray(B, A, n);
        // Now array A is full of runs of length 2*width.
    }
}

//  Left run is A[iLeft :iRight-1].
// Right run is A[iRight:iEnd-1  ].
void BottomUpMerge(A[], iLeft, iRight, iEnd, B[])
{
    i = iLeft, j = iRight;
    // While there are elements in the left or right runs...
    for (k = iLeft; k < iEnd; k++) {
        // If left run head exists and is <= existing right run head.
        if (i < iRight && (j >= iEnd || A[i] <= A[j])) {
            B[k] = A[i];
            i = i + 1;
        } else {
            B[k] = A[j];
            j = j + 1;    
        }
    } 
}

void CopyArray(B[], A[], n)
{
    for (i = 0; i < n; i++)
        A[i] = B[i];
}
*/