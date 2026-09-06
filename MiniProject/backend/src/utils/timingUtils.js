// timingUtils.js
import { performance } from 'node:perf_hooks';

/**
 * Measures the execution time of an asynchronous function.
 * @param {string} name - Name of the operation to measure
 * @param {Function} asyncFn - The async function to execute
 * @returns {Promise<{ result: any, durationMs: number }>}
 */
export const measureAsync = async (name, asyncFn) => {
    const start = performance.now();
    try {
        const result = await asyncFn();
        const end = performance.now();
        return {
            result,
            durationMs: parseFloat((end - start).toFixed(4))
        };
    } catch (error) {
        const end = performance.now();
        // Attach exact failure time measurement
        error.durationMs = parseFloat((end - start).toFixed(4));
        throw error;
    }
};

/**
 * Measures the execution time of a synchronous function.
 * @param {string} name - Name of the operation to measure
 * @param {Function} syncFn - The sync function to execute
 * @returns {{ result: any, durationMs: number }}
 */
export const measureSync = (name, syncFn) => {
    const start = performance.now();
    try {
        const result = syncFn();
        const end = performance.now();
        return {
            result,
            durationMs: parseFloat((end - start).toFixed(4))
        };
    } catch (error) {
        const end = performance.now();
        error.durationMs = parseFloat((end - start).toFixed(4));
        throw error;
    }
};
