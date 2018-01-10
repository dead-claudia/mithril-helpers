/**
 * Sanitize an attributes object of its lifecycle methods.
 */
export default function censor<T extends object>(attrs: T, extras?: string[]): T;
