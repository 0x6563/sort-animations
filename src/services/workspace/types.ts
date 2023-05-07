type List = Value[];
// Add dictionary
type Value = {
    get value(): any
};

// Create
/**
 * Returns a new constant that can be tracked. 
 * @param value 
 */
declare function Constant(value: number): Value;
/**
 * Returns a new array to track changes on.
 */
declare function List(): List;

/**
 * Creates a recursive copy of a list. 
 * @param list The list to be recursively copied
 */
declare function Copy(list: List): List;
/**
 * Copies a value
 * @param value The value to be copied
 */
declare function Copy(value: Value): Value;
// Read
/**
 * Returns the difference between two values
 * @param a 
 * @param b 
 */
declare function Compare(a: Value, b: Value): number;

// Update
/**
 * Removes an item from all tracked arrays and places it in the new target location
 * @param list Target array
 * @param value Value to be moved
 * @param index If provided the location to move it to, otherwise appended to the end
 */
declare function Move(list: List, value: Value, index?: number | undefined): void;
/**
 * Swaps two elements within an array
 * @param list Target array
 * @param a 
 * @param b 
 */
declare function Swap(list: List, a: Value, b: Value): void;

// Delete
/**
 * Deletes a value from being tracked.
 * @param source 
 */
declare function Untrack(source: Value): void;
/**
 * Deletes a list from being tracked.
 * @param source 
 */
declare function Untrack(source: List): void;


//Other

// Shade
/**
 * Set element(s) to Shade color
 * @param values elements to Shade
 */
declare function Shade(...values: (List | Value)[]): void;
/**
 * Set element(s) to Shade color
 * @param values elements to Shade
 */
declare function Shade(values: (List | Value)[]): void;
/**
 * Resets all elements to the Shade color.
 */
declare function Shade(): void;

// Tint
/**
 * Set element(s) to Tint color
 * @param values elements to Tint
 */
declare function Tint(...values: (List | Value)[]): void;
/**
 * Set element(s) to Tint color
 * @param values elements to Tint
 */
declare function Tint(values: (List | Value)[]): void;
/**
 * Resets all elements to the Tint color.
 */
declare function Tint(): void;

// Fill
/**
 * Set element(s) to fill color
 * @param values elements to Fill
 */
declare function Fill(...values: (List | Value)[]): void;
/**
 * Set element(s) to fill color
 * @param values elements to Fill
 */
declare function Fill(values: (List | Value)[]): void;
/**
 * Resets all elements to the fill color.
 */
declare function Fill(): void;


declare function Unhighlight(): void;

/**
 * Calling Highlight with no arguments clears highlighted items.
 */
declare function Highlight(): void;
/**
 * Highlights elements.
 * Subsequent calls override this
 * @param values elements to highlight
 */
declare function Highlight(...values: (List | Value)[]): void;
/**
 * Highlights elements
 * Subsequent calls override this
 * @param values elements to highlight
 */
declare function Highlight(values: (List | Value)[]): void;

/**
 * Queues all animation events.
 */
declare function BatchStart(): void;
/**
 * Animates any queued animation events.
 */
declare function BatchEnd(): void;
/**
 * Force animation, if any events have been animation events have been queued.
 */
declare function Animate(): void;
declare function Custom(message: string): void;

declare const list: List;

//---//

export type { List, Value };
export interface Scope {
    // Create
    Constant: typeof Constant;
    List: typeof List;
    Copy: typeof Copy;
    // Read
    Compare: typeof Compare;
    // Update
    Move: typeof Move;
    Swap: typeof Swap;
    // Delete
    Untrack: typeof Untrack;
    //Other
    Shade: typeof Shade;
    Tint: typeof Tint;
    Fill: typeof Fill;
    Unhighlight: typeof Unhighlight;
    Highlight: typeof Highlight;
    BatchStart: typeof BatchStart;
    BatchEnd: typeof BatchEnd;
    Animate: typeof Animate;
    Custom: typeof Custom;
}

