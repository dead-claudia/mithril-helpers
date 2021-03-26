/**
 * mithril-helpers definitions, for your convenience
 */

/// <reference types="mithril" />
import * as Mithril from "mithril";

export interface SelfSufficientParams {
    root: Mithril.Vnode<any, any>;
    view(state: SelfSufficientState): Mithril.Children;
}

/**
 * The core component.
 */
export interface SelfSufficientState {
    safe(): boolean;
    redraw(): void;
    redrawSync(): void;
}

declare const SelfSufficient: Mithril.ComponentTypes<SelfSufficientParams, any>

export default SelfSufficient;
