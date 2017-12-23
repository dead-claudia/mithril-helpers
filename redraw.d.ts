/**
 * A redraw wrapper
 */
export interface Redraw<V = never> {
    (): void;
    readonly ready: () => void;
}

/**
 * A redraw wrapper
 */
export interface RedrawWrap<V> {
    (vnode: V): void;
    readonly ready: () => void;
}

/**
 * A state wrapper. A `SelfSufficient` instance satisfies this.
 */
export interface RedrawState<V> {
    _redraw(vnode: V): void;
}


/**
 * Create a new redraw wrapper.
 */
export default function makeRedraw(): Redraw;
export default function makeRedraw<V>(state: RedrawState<V>): RedrawWrap<V>;
