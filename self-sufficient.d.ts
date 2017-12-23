/**
 * mithril-helpers definitions, for your convenience
 */

/// <reference types="mithril" />
import * as Mithril from "mithril";

/**
 * An event-like object, mimicking Mithril's.
 */
export interface EventLike {
    redraw?: boolean;
    currentTarget: any;
    [p: string]: any;
}

/**
 * A renderable component. This is required for vnodes linked to self-sufficient
 * instances.
 */
export interface Renderable<Attrs, State extends Renderable<Attrs, State>>
        extends Mithril.Component<Attrs, State> {
    render(vnode: Mithril.Vnode<Attrs, State>): Mithril.Children | void;
}

/**
 * Create a self-sufficient component. The tag and attributes are optional.
 */
export default class SelfSufficient<Attrs, State extends Renderable<Attrs, State>> {
    constructor(tag?: string, attrs?: Mithril.Attributes);

    /**
     * Request a redraw for this vnode. This is always asynchronous.
     */
    readonly redraw: (vnode: Mithril.Vnode<Attrs, State>) => void;
    readonly _redraw: (vnode: Mithril.Vnode<Attrs, State>) => void;

    /**
     * Force an immediate redraw for this vnode. This is always synchronous, and
     * will throw if we're currently redrawing (within this module, since
     * Mithril doesn't provide an accessor we can use).
     */
    readonly forceRedraw: (vnode: Mithril.Vnode<Attrs, State>) => void;

    /**
     * A hook to cancel existing requests for this vnode on redraw.
     */
    readonly onbeforeupdate: (
        vnode: Mithril.Vnode<Attrs, State>,
        vnode: Mithril.Vnode<Attrs, State>
    ) => boolean;

    /**
     * Link a vnode to a callback to redraw like how they normally do with
     * `m.mount`.
     */
    readonly link: <T>(
        vnode: Mithril.Vnode<Attrs, State>,
        handler: (this: T, e: EventLike) => void
    ) => (this: T, e: EventLike) => void;

    /**
     * Link a vnode to a callback to redraw like how they normally do with
     * `m.mount`.
     */
    readonly link: (
        vnode: Mithril.Vnode<Attrs, State>,
        handler: {handleEvent(e: EventLike): void}
    ) => (e: EventLike) => void;

    /**
     * The resulting view to use.
     */
    readonly view(
        vnode: Mithril.Vnode<Attrs, State>
    ): void;
}
