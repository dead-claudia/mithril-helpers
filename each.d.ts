/// <reference types="mithril" />
import * as Mithril from "mithril";

/**
 * Render a list by key.
 *
 * @param key A key selector function returning the key to use.
 * @param child A function returning the child vnode to render.
 * @returns A keyed fragment.
 */
export default function each<T>(
    list: ArrayLike<T> | Iterable<T>,
    by: (value: T, index: number) => PropertyKey,
    child: (value: T, index: number) => Mithril.Children
): Mithril.Vnode<any, any>;

/**
 * Render a list by key.
 *
 * @param key A property on each item representing the key to use.
 * @param child A function returning the child vnode to render.
 * @returns A keyed fragment.
 */
export default function each<T>(
    list: ArrayLike<T> | Iterable<T>,
    // Select keys whose values are property keys
    by: {[P in keyof T]: T[P] extends PropertyKey ? P : never}[keyof T],
    child: (value: T, index: number) => Mithril.Children
): Mithril.Vnode<any, any>;
