import { unref } from 'vue';
import { OptionValue } from './Store';

/**
 * Clone the object and its inner properties.
 * @param obj The object to be clone.
 * @param attributes list of attributes to not clone.
 * @param refs internal reference to object to avoid cyclic references
 * @returns a copy of obj
 */
export function deepClone<T = any>(origObject: T, ignoreAttributes: string[] = [], refs: WeakMap<any, any> = new WeakMap()): T {
    const obj = unref(origObject);

    /* For circular references */
    if (refs.has(obj)) {
        return refs.get(obj);
    }

    if (typeof obj === 'object') {
        if (obj === null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            const ref: any[] = [];
            refs.set(obj, ref);
            obj.forEach((val, idx) => {
                ref[idx] = deepClone(val, ignoreAttributes, refs);
            });
            return ref as unknown as T;
        }

        if (obj instanceof RegExp) {
            const ref = new RegExp(obj.source, obj.flags);
            refs.set(obj, ref);
            return ref as unknown as T;
        }

        /* This should be an object */
        const ref: any = {};
        refs.set(obj, ref);
        for (const [key, val] of Object.entries(obj)) {
            if (ignoreAttributes.includes(key)) {
                ref[key] = val;
                continue;
            }

            ref[key] = deepClone(val, ignoreAttributes, refs);
        }
        return ref as unknown as T;
    }

    /* This should be a primitive */
    return obj;
}

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
export function convertToRegExp(name: string, flag = 'i'): RegExp {
    const pattern = name.replace(/[\\^$.+?(){}[\]|]/g, '\\$&')
                        .replace(/\*/g, '.*');

    return new RegExp(pattern, flag);
}

/** Does the same as Object.assign but does not replace if value is undefined */
export function assignObject<T>(obj: Partial<T>, ...sourceObjects: Array<Partial<T>>): T {
    const result = obj;
    for (const source of sourceObjects) {
        for (const key of Object.keys(source)) {
            const typedKey = key as keyof T;
            const value = source[typedKey];
            if (value === undefined) {
                continue;
            }
            result[typedKey] = value!;
        }
    }
    return result as T;
}

/** Compare 2 list of options.
 * @returns true if there are no difference
 */
export function compareOptions(oldOptions: OptionValue[], newOptions: OptionValue[]): boolean {
    if (oldOptions.length !== newOptions.length) {
        return false;
    }

    return oldOptions.every((oldOption, idx) => {
        const newOption = newOptions[idx];
        const keys = Object.keys(oldOption);
        if (keys.length !== Object.keys(newOption).length) {
            return false;
        }
        return keys.every((optionKey) => {
            const key = optionKey as keyof OptionValue;
            const oldValue = oldOption[key];
            const newValue = newOption[key];

            if (key === 'options') {
                return compareOptions(oldValue, newValue);
            }
            if (key === 'data') {
                return JSON.stringify(oldValue) === JSON.stringify(newValue);
            }
            return oldValue === newValue;
        });
    });
}

let displayLog = false;
export function debug(fName: string, step: string, ...args: any[]) {
    if (!displayLog) {
        return;
    }

    console.log('--%s-- [%s]', fName, step, ...args);
}
/** Enable logs for debugging */
debug.enable = (display: boolean) => {
    displayLog = display;
};
