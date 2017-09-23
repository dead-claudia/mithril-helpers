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
export interface Renderable<Attrs, State extends Mithril.Lifecycle<Attrs, State>>
        extends Mithril.Component<Attrs, State> {
    render(vnode: Mithril.Vnode<Attrs, State>): Mithril.Children | void;
}

// I could parameterize this more usefullly if TypeScript could infer types from
// usage, but sadly, it can't...
//
// (This is why each method is independently parameterized.)
/**
 * Create a self-sufficient component. The tag and attributes are optional.
 */
export class SelfSufficient {
    constructor(tag?: string, attrs?: Mithril.Attributes);

    /**
     * Request a redraw for this vnode. This is always asynchronous.
     */
    readonly redraw: <Attrs, State extends Renderable<Attrs, State>>(
        vnode: Mithril.Vnode<Attrs, State>
    ) => void;

    /**
     * Link a vnode to a callback to redraw like how they normally do with
     * `m.mount`.
     */
    readonly link: <Attrs, State extends Renderable<Attrs, State>>(
        vnode: Mithril.Vnode<Attrs, State>,
        handler: (e: EventLike) => void
    ) => (e: EventLike) => void;

    /**
     * The resulting view to use.
     */
    readonly view: <Attrs, State extends Renderable<Attrs, State>>(
        vnode: Mithril.Vnode<Attrs, State>
    ) => void;
}
