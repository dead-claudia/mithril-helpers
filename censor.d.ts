/// <reference types="mithril" />
import {Attributes} from "mithril";

/**
 * Sanitize an attributes object of its lifecycle methods.
 */
export default function censor<T extends Attributes>(attrs: T): T;
