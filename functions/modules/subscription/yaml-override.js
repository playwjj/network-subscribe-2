/**
 * yaml-override.js — ClashParty-style YAML override for MiSub fork.
 *
 * Fork addition (not from upstream). Applies a user-supplied YAML patch onto the
 * generated Clash config object using deep-merge semantics compatible with
 * ClashParty's override:
 *
 *   - Plain key:     objects are merged recursively; scalars replace.
 *   - `key!:`        force-replace the whole value (no merge).
 *   - `+key:`        prepend array items to the existing array.
 *   - `key+:`        append array items to the existing array.
 *   - `<+key>:`      escape a literal leading/trailing `+` in the key name.
 *
 * Keys NOT mentioned in the override are left completely untouched, so MiSub's
 * generated proxy-groups / rules / etc. survive unless explicitly patched.
 */

import yaml from 'js-yaml';

function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Parse ClashParty key modifiers.
 * Returns { key, forceReplace, prepend, append }.
 */
function parseOverrideKey(rawKey) {
    let key = String(rawKey);
    let forceReplace = false;
    let prepend = false;
    let append = false;

    // `!` suffix: force replace whole value
    if (key.endsWith('!')) {
        forceReplace = true;
        key = key.slice(0, -1);
    }

    // `<>` escape for literal leading/trailing `+`
    // e.g. `<+.google.cn>`, `+<+.google.cn>`, `<+.google.cn>+`
    const escaped = key.match(/^(\+?)<(.+)>(\+?)$/);
    if (escaped) {
        if (escaped[1] === '+') prepend = true;
        if (escaped[3] === '+') append = true;
        key = escaped[2];
        return { key, forceReplace, prepend, append };
    }

    if (key.startsWith('+')) {
        prepend = true;
        key = key.slice(1);
    }
    if (key.endsWith('+')) {
        append = true;
        key = key.slice(0, -1);
    }
    return { key, forceReplace, prepend, append };
}

function deepMergeOverride(target, source) {
    if (!isPlainObject(source)) return target;
    for (const rawKey of Object.keys(source)) {
        const { key, forceReplace, prepend, append } = parseOverrideKey(rawKey);
        const srcVal = source[rawKey];
        const tgtVal = target[key];

        if ((prepend || append) && Array.isArray(tgtVal) && Array.isArray(srcVal)) {
            target[key] = prepend ? [...srcVal, ...tgtVal] : [...tgtVal, ...srcVal];
            continue;
        }
        if (forceReplace || !isPlainObject(srcVal) || !isPlainObject(tgtVal)) {
            // Scalars, arrays (plain key), or force-replace: overwrite.
            // NOTE: a plain array key REPLACES the whole array (ClashParty behavior).
            // Use `+key` / `key+` to prepend/append without losing existing items.
            target[key] = srcVal;
            continue;
        }
        deepMergeOverride(tgtVal, srcVal);
    }
    return target;
}

/**
 * Apply a YAML override patch onto a Clash config object (mutates & returns it).
 * Returns the config unchanged when the override text is empty or invalid.
 */
export function applyYamlOverride(config, overrideYamlText) {
    const raw = String(overrideYamlText || '').trim();
    if (!raw || !isPlainObject(config)) return config;
    let patch;
    try {
        patch = yaml.load(raw);
    } catch {
        return config; // invalid YAML: fail open, keep original config
    }
    if (!isPlainObject(patch)) return config;
    return deepMergeOverride(config, patch);
}
