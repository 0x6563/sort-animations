import type { Value, Workspace } from "@services/workspace/workspace"
declare const { Constant, List, Copy, Compare, Move, Swap, Delete, Unhighlight, BatchStart, BatchEnd, Animate, Custom, }: ReturnType<Workspace['scope']>;

export function MergeSortBottomUp(list: Value[]) {
    // function merge_sort(node head) is
    // // return if empty list
    // if head = nil then
    //     return nil
    // var node array[32]; initially all nil
    // var node result
    // var node next
    // var int  i
    // result := head
    // // merge nodes into array
    // while result ≠ nil do
    //     next := result.next;
    //     result.next := nil
    //     for (i = 0; (i < 32) && (array[i] ≠ nil); i += 1) do
    //         result := merge(array[i], result)
    //         array[i] := nil
    //     // do not go past end of array
    //     if i = 32 then
    //         i -= 1
    //     array[i] := result
    //     result := next
    // // merge array into single list
    // result := nil
    // for (i = 0; i < 32; i += 1) do
    //     result := merge(array[i], result)
    // return result

    function MergeSort() {

    }
}