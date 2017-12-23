/**
 * A getter/setter store.
 */
export interface Store<T> {
    get(): T;
    set<U extends T>(newValue: U): U;
}

/**
 * A store change observer.
 */
export interface OnChange<T> {
    (newValue: T, oldValue: T): any;
}

/**
 * Create a new store, optionally with a change observer.
 */
export default function makeStore<T>(
    initial?: void,
    onchange?: OnChange<T | void>
): Store<T | void>;

/**
 * Create a new store, optionally with a change observer.
 */
export default function makeStore<T>(initial: T, onchange?: OnChange<T>): Store<T>;
