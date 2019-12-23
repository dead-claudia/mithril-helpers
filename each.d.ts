/// <reference types="mithril" />
import * as Mithril from "mithril";

/**
 * Build a keyed fragment using separate key + child pairs.
 *
 * If `by` is a property key, it's sugar for passing `v => v[by]`. For `child`,
 * it's sugar for `v => "" + v[by]` - it's always rendered as a text node.
 */
export default function each<T>(
    list: ArrayLike<T>,
    by: keyof T | ((value: T, index: number) => PropertyKey),
    child: keyof T | ((value: T, index: number) => Mithril.Vnode<any, any>)
): Mithril.Vnode<any, any>
