import { unref } from 'vue';

/**
 * Clone the object and its inner properties.
 * @param obj The object to be clone.
 * @param attributes list of attributes to not clone.
 * @param refs internal reference to object to avoid cyclic references
 * @returns a copy of obj
 */
export function deepClone<T = any>(
    origObject: T,
    ignoreAttributes: string[] = [],
    refs: WeakMap<any, any> = new WeakMap()
): T {
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

/**
 * Ckeck whether a value is primitive.
 * @returns true if val is primitive and false otherwise.
 */
function isPrimitive<T = any>(val: T): boolean {
    /* The value null is treated explicitly because in JavaScript
     * `typeof null === 'object'` is evaluated to `true`.
     */
    return val === null || (typeof val !== 'object' && typeof val !== 'function');
}

/**
 * Performs a deep comparison between two objects to determine if they
 * should be considered equal.
 *
 * @param objA object to compare to objB.
 * @param objB object to compare to objA.
 * @param attributes list of attributes to not compare.
 * @param refs internal reference to object to avoid cyclic references
 * @returns true if objA should be considered equal to objB.
 */
export function isDeepEqual<T = any>(
    objA: T,
    objB: T,
    ignoreAttributes: string[] = [],
    refs: WeakMap<any, any> = new WeakMap()
): boolean {
    objA = unref(objA);
    objB = unref(objB);

    /* For primitive types */
    if (isPrimitive(objA)) {
        return isPrimitive(objB) && Object.is(objA, objB);
    }

    /* For functions (follow the behavior of _.isEqual and compare functions
     * by reference). */
    if (typeof objA === 'function') {
        return typeof objB === 'function' && objA === objB;
    }

    /* For circular references */
    if (refs.has(objA)) {
        return refs.get(objA) === objB;
    }
    refs.set(objA, objB);

    /* For objects */
    if (typeof objA === 'object') {
        if (typeof objB !== 'object') {
            return false;
        }

        /* For arrays */
        if (Array.isArray(objA)) {
            return Array.isArray(objB) &&
                   objA.length === objB.length &&
                   !objA.some((val, idx) => !isDeepEqual(val, (objB as unknown[])[idx], ignoreAttributes, refs));
        }

        /* For RegExp */
        if (objA instanceof RegExp) {
            return objB instanceof RegExp &&
                   objA.source === objB.source &&
                   objA.flags === objB.flags;
        }

        /* For Date */
        if (objA instanceof Date) {
            return objB instanceof Date && objA.getTime() === objB.getTime();
        }

        /* This should be an object */
        const aRec = objA as Record<string, any>;
        const bRec = objB as Record<string, any>;
        const aKeys = Object.keys(aRec).filter((key) => !ignoreAttributes.includes(key));
        const bKeys = Object.keys(bRec).filter((key) => !ignoreAttributes.includes(key));

        const differentKeyFound = aKeys.some((key) => {
            return !bKeys.includes(key) ||
                   !isDeepEqual(aRec[key], bRec[key], ignoreAttributes, refs);
        });

        return aKeys.length === bKeys.length && !differentKeyFound;
    }

    return true;
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
