/**
 * A getter/setter store.
 */
export interface Store<T> {
    (): T;
    <U extends T>(newValue: U): U;
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
export function makeStore<T>(initial: T, onchange?: OnChange<T>): Store<T>;
