/**
 * maskSensitive.js
 * Utility for masking sensitive cryptographic values (keys, IVs, ciphertexts)
 * for safe educational display in API responses.
 */

/**
 * Normalizes input to string representation.
 * @param {string|Buffer|Uint8Array|ArrayBuffer|Object} val 
 * @returns {string} Normalized string representation
 */
function normalizeToString(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (Buffer.isBuffer(val)) return val.toString('hex');
    if (val instanceof Uint8Array || val instanceof ArrayBuffer) {
        return Buffer.from(val).toString('hex');
    }
    if (typeof val === 'object') {
        try {
            return JSON.stringify(val);
        } catch {
            return String(val);
        }
    }
    return String(val);
}

/**
 * Masks a sensitive value by keeping the first N characters visible and appending '********'.
 * @param {string|Buffer|Uint8Array} value - The raw value to mask
 * @param {Object} options - { visibleChars: 4, maskLength: 8, returnObject: false }
 * @returns {string|{raw: string, display: string}} Masked value string or dual object
 */
export function maskSensitive(value, options = {}) {
    const visibleChars = options.visibleChars !== undefined ? options.visibleChars : 4;
    const returnObject = options.returnObject || false;

    const rawStr = normalizeToString(value);

    if (!rawStr) {
        const display = '********';
        return returnObject ? { raw: '', display } : display;
    }

    const visible = rawStr.substring(0, visibleChars);
    const display = `${visible}********`;

    if (returnObject) {
        return {
            raw: rawStr,
            display
        };
    }

    return display;
}

export default maskSensitive;
