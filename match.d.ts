/// <reference types="mithril" />
import * as Mithril from "mithril";

export function when(
    cond: boolean,
    then: () => Mithril.Children,
    orElse: () => Mithril.Children
): Mithril.Vnode<any, any>;

export function cond(
    ...cases: Array<{if: unknown, then: () => Mithril.Children}>
): Mithril.Vnode<any, any>;

export function match<T>(
    value: T,
    ...cases: Array<{if: T, then: () => Mithril.Children}>
): Mithril.Vnode<any, any>;
