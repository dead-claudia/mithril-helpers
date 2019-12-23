/// <reference types="mithril" />
import * as Mithril from "mithril";

/**
 * Build a keyed fragment using separate key + child functions.
 */
export default function each<T>(
    list: ArrayLike<T>,
    by: (value: T) => PropertyKey,
    child: (value: T) => Mithril.Vnode<any, any>
): Mithril.Vnode<any, any>
