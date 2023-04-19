"use strict";
var SortMethods = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/services/sort-methods.ts
  var sort_methods_exports = {};
  __export(sort_methods_exports, {
    SortMethods: () => SortMethods
  });

  // src/services/sorting/bubblesort.ts
  function BubbleSort(list) {
    let sorted = true;
    let max = list.length - 1;
    do {
      sorted = true;
      for (let i = 0; i < max; i++) {
        const c = Compare(list[i], list[i + 1]);
        if (c > 0) {
          sorted = false;
          Swap(list, list[i], list[i + 1]);
        }
      }
      max--;
    } while (!sorted);
  }

  // src/services/sorting/hoare-quicksort.ts
  function HoareQuickSort(list) {
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
    function QuickSort(A, low, high) {
      if (low >= 0 && low < high) {
        const p = Partition(A, low, high);
        QuickSort(A, low, p);
        QuickSort(A, p + 1, high);
      }
    }
    function Partition(A, low, high) {
      const pivot = A[Math.floor((high - low) / 2) + low];
      let i = low - 1;
      let j = high + 1;
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
        Swap(A, A[i], A[j]);
      }
    }
    return QuickSort(list, 0, list.length - 1);
  }

  // src/services/sorting/javascript.ts
  function JavaScriptSort(list) {
    return list.sort((a, b) => Compare(a, b));
  }

  // src/services/sorting/lomuto-quicksort.ts
  function LomutoQuickSort(list) {
    /*!
    FROM : https://en.wikipedia.org/wiki/Quicksort
    // Sorts a (portion of an) array, divides it into partitions, then sorts those
    algorithm quicksort(A, lo, hi) is 
        // Ensure indices are in correct order
        if lo >= hi || lo < 0 then 
        return
    
        // Partition array and get the pivot index
        p := partition(A, lo, hi) 
    
        // Sort the two partitions
        quicksort(A, lo, p - 1) // Left side of pivot
        quicksort(A, p + 1, hi) // Right side of pivot
    
    // Divides array into two partitions
    algorithm partition(A, lo, hi) is 
        pivot := A[hi] // Choose the last element as the pivot
    
        // Temporary pivot index
        i := lo - 1
    
        for j := lo to hi - 1 do 
        // If the current element is less than or equal to the pivot
        if A[j] <= pivot then 
            // Move the temporary pivot index forward
            i := i + 1
            // Swap the current element with the element at the temporary pivot index
            swap A[i] with A[j]
    
        // Move the pivot element to the correct pivot position (between the smaller and larger elements)
        i := i + 1
        swap A[i] with A[hi]
        return i // the pivot index
    */
    function QuickSort(A, low = 0, high = 0) {
      if (low >= high || low < 0) {
        return;
      }
      const p = Partition(A, low, high);
      QuickSort(A, low, p - 1);
      QuickSort(A, p + 1, high);
    }
    function Partition(A, low = 0, high = 0) {
      const pivot = A[high];
      let i = low - 1;
      for (let j = low; j <= high - 1; j++) {
        if (Compare(A[j], pivot) <= 0) {
          i++;
          Swap(A, A[j], A[i]);
        }
      }
      i++;
      Swap(A, A[i], A[high]);
      return i;
    }
    return QuickSort(list, 0, list.length - 1);
  }

  // src/services/sorting/naive-quicksort.ts
  function NaiveQuickSort(list) {
    if (list.length <= 1) {
      return list;
    }
    const pivot = list[0];
    BatchStart();
    const left = List();
    const right = List();
    BatchEnd();
    for (let i = 1; i < list.length; i++) {
      const item = list[i];
      if (Compare(item, pivot) < 0) {
        Move(left, item);
      } else {
        Move(right, item);
      }
    }
    NaiveQuickSort(left);
    NaiveQuickSort(right);
    Move(list, pivot, left.length);
    BatchStart();
    for (let i = 0; i < left.length; i++) {
      Move(list, left[i], i);
    }
    BatchEnd();
    BatchStart();
    for (let i = 0; i < right.length; i++) {
      Move(list, right[i], i + left.length + 1);
    }
    BatchEnd();
    BatchStart();
    Delete(left);
    Delete(right);
    BatchEnd();
    return list;
  }

  // src/services/sort-methods.ts
  var SortMethods = {
    BubbleSort: BubbleSort.toString(),
    LomutoQuickSort: LomutoQuickSort.toString(),
    HoareQuickSort: HoareQuickSort.toString(),
    NaiveQuickSort: NaiveQuickSort.toString(),
    JavaScriptSort: JavaScriptSort.toString()
  };
  return __toCommonJS(sort_methods_exports);
})();
