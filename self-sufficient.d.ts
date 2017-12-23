/**
 * mithril-helpers definitions, for your convenience
 */

/// <reference types="mithril" />
import * as Mithril from "mithril";

/**
 * An event-like object, mimicking Mithril's.
 */
export interface MithrilEvent extends Event {
    redraw?: boolean;
}

export interface SelfSufficientParams extends Mithril.Lifecycle<SelfSufficientParams, SelfSufficientState> {
    tag?: string;
    attrs?: Mithril.Attributes,
    view(vnode: Mithril.Vnode<this, SelfSufficientState>): Mithril.Vnode<this, SelfSufficientState>;
}

/**
 * The core component.
 */
export interface SelfSufficientState extends Mithril.Lifecycle<SelfSufficientParams, SelfSufficientState> {
    safe(): boolean;
    redraw(): void;
    redrawSync(): void;
    link<E extends MithrilEvent>(
        handler: ((event: E) => any) | {handleEvent(event: E): any}
    ): (event: E) => void;
}

export default const SelfSufficient: Mithril.ComponentTypes<SelfSufficientParams, SelfSufficientState>;
