/**
 * A redraw wrapper
 */
export interface Redraw {
    (): void;
    readonly ready: () => void;
}

/**
 * A state wrapper. A `SelfSufficient` instance satisfies this, but it's weak
 * just to keep from being overly restrictive. (This is the only method we use.)
 */
export interface RedrawState {
    redraw(): void;
}


/**
 * Create a new redraw wrapper.
 */
export default function makeRedraw(state?: RedrawState): Redraw;
