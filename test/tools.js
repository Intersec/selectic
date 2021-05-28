
/* Create a promise from setTimeout */
function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

function deepExtend(destination, ...sources) {
    if (!destination) {
        if (Array.isArray(sources[0])) {
            destination = [];
        } else {
            destination = {};
        }
    }

    for (const source of sources) {
        /* ignore undefined or null */
        if (!source) {
            continue;
        }

        for (const key of Object.keys(source)) {
            const value = source[key];

            if (typeof value !== 'object' || value === null) {
                destination[key] = value;
            } else {
                if (Array.isArray(value)) {
                    /* override previous array value */
                    destination[key] = deepExtend([], value);
                } else
                    if (value instanceof RegExp) {
                        destination[key] = new RegExp(value.source, value.flags);
                    } else {
                        destination[key] = deepExtend(destination[key], value);
                    }
            }
        }
    }
    return destination;
}

function defer(f) {
    return setTimeout(f, 0);
}

async function deferPromise(promise, waitAtStart = false) {
    if (waitAtStart) {
        await sleep(0);
    }

    const result = await promise;
    await sleep(0);
    return result;
}

function nextVueTick(_vueComponent, afterPromise) {
    const promise = new Promise(async (resolve) => {
        if (afterPromise) {
            await afterPromise;
        }
        // next tick is now deprecated
        await sleep(0);
        resolve();
    });

    return promise;
}

module.exports = {
    sleep,
    deepExtend,
    defer,
    deferPromise,
    nextVueTick,
};
