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

export interface SelfSufficientParams {
    tag?: string;
    attrs?: Mithril.Attributes,
    view<R extends Mithril.Vnode<any, any>>(state: SelfSufficientState): R;
}

/**
 * The core component.
 */
export interface SelfSufficientState {
    safe(): boolean;
    redraw(): void;
    redrawSync(): void;
    link<E>(
        handler: ((event: E & MithrilEvent) => any) |
            {handleEvent(event: E & MithrilEvent): any}
    ): (event: E) => void;
}

declare const SelfSufficient: Mithril.ComponentTypes<SelfSufficientParams, any>

export default SelfSufficient;
