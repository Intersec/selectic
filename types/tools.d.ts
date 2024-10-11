import { OptionValue } from './Store';
/**
 * Clone the object and its inner properties.
 * @param obj The object to be clone.
 * @param attributes list of attributes to not clone.
 * @param refs internal reference to object to avoid cyclic references
 * @returns a copy of obj
 */
export declare function deepClone<T = any>(origObject: T, ignoreAttributes?: string[], refs?: WeakMap<any, any>): T;
/**
 * Escape search string to consider regexp special characters as they
 * are and not like special characters.
 * Consider * characters as a wildcards characters (meanings 0 or
 * more characters) and convert them to .* (the wildcard characters
 * in Regexp)
 *
 * @param  {String} name the original string to convert
 * @param  {String} [flag] mode to apply for regExp
 * @return {String} the string ready to use for RegExp format
 */
export declare function convertToRegExp(name: string, flag?: string): RegExp;
/** Does the same as Object.assign but does not replace if value is undefined */
export declare function assignObject<T>(obj: Partial<T>, ...sourceObjects: Array<Partial<T>>): T;
/** Compare 2 list of options.
 * @returns true if there are no difference
 */
export declare function compareOptions(oldOptions: OptionValue[], newOptions: OptionValue[]): boolean;
export declare function debug(fName: string, step: string, ...args: any[]): void;
export declare namespace debug {
    var enable: (display: boolean) => void;
}
