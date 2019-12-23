/**
 * A getter/setter store that invokes a redraw whenever it's set.
 */
export interface Store<T> {
    (): T;
    <U extends T>(newValue: U): U;
}

/**
 * Create a new store with an initial value of `undefined`.
 */
export default function makeStore<T>(): Store<T | undefined>;

/**
 * Create a new store with an initial value.
 */
export default function makeStore<T>(initial: T): Store<T>;

/**
 * Create a new store with an initial value and a change observer.
 */
export default function makeStore<T>(initial: T, onchange: (next: T, prev: T) => any): Store<T>;
