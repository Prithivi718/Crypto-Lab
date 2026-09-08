/**
 * useIntroAudio.js
 * 
 * Manages playback of iron_man_hammer.mp3 audio asset.
 * Guarantees iron_man_hammer.mp3 plays EXACTLY ONCE per forging sequence
 * and provides explicit stopAudio() for unmount/skip cleanup.
 */

import { useRef, useCallback, useEffect } from 'react';
import hammerAsset from '../assets/iron_man_hammer.mp3';

export function useIntroAudio() {
    const audioContextRef = useRef(null);
    const audioBufferRef = useRef(null);
    const fallbackAudioRef = useRef(null);
    const isUnlockedRef = useRef(false);

    // Reference to active playing source (Web Audio Node or HTML5 Audio) for safe stop/cleanup
    const activeSourceRef = useRef(null);
    const hasPlayedOnceRef = useRef(false);

    // Preload audio asset into Web Audio API buffer & HTML5 Audio element
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Fallback HTML5 Audio Element
        const fallbackAudio = new Audio(hammerAsset);
        fallbackAudio.preload = 'auto';
        fallbackAudioRef.current = fallbackAudio;

        // Web Audio API Context & Buffer Loader
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;

            fetch(hammerAsset)
                .then(res => res.arrayBuffer())
                .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
                .then(decodedData => {
                    audioBufferRef.current = decodedData;
                })
                .catch(err => {
                    console.warn('[SecureNet Audio] Web Audio API decode warning:', err);
                });
        }

        return () => {
            // Cleanup on hook unmount
            stopAudioInternal();
        };
    }, []);

    /**
     * Unlocks the AudioContext explicitly during user gesture without audible sound burst.
     */
    const unlockAudio = useCallback(() => {
        if (isUnlockedRef.current) return;

        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(err => {
                console.warn('[SecureNet Audio] AudioContext resume warning:', err);
            });
        }

        if (fallbackAudioRef.current) {
            try {
                const audio = fallbackAudioRef.current;
                audio.volume = 0;
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = 1.0;
                    }).catch(() => {
                        audio.volume = 1.0;
                    });
                }
            } catch (err) {
                // Ignore silent unlock exception
            }
        }

        isUnlockedRef.current = true;
    }, []);

    /**
     * Internal helper to safely stop any running audio source.
     */
    const stopAudioInternal = () => {
        if (activeSourceRef.current) {
            try {
                if (typeof activeSourceRef.current.stop === 'function') {
                    activeSourceRef.current.stop();
                } else if (typeof activeSourceRef.current.pause === 'function') {
                    activeSourceRef.current.pause();
                    activeSourceRef.current.currentTime = 0;
                }
            } catch (err) {
                // Ignore errors if source already finished naturally
            }
            activeSourceRef.current = null;
        }
    };

    /**
     * Stops any active hammer audio playback immediately.
     */
    const stopAudio = useCallback(() => {
        stopAudioInternal();
        hasPlayedOnceRef.current = false;
    }, []);

    /**
     * Plays iron_man_hammer.mp3 EXACTLY ONCE for the forging sequence.
     * Prevents overlapping audio, duplicate Web Audio nodes, or restart on re-renders.
     */
    const playHammerOnce = useCallback(() => {
        if (hasPlayedOnceRef.current) return;
        hasPlayedOnceRef.current = true;

        unlockAudio();
        stopAudioInternal();

        const ctx = audioContextRef.current;
        const buffer = audioBufferRef.current;

        // 1. Web Audio API Buffer Playback (Preferred)
        if (ctx && buffer) {
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => { });
            }

            try {
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.onended = () => {
                    if (activeSourceRef.current === source) {
                        activeSourceRef.current = null;
                    }
                };
                source.start(0);
                activeSourceRef.current = source;
                return;
            } catch (err) {
                console.warn('[SecureNet Audio] Web Audio play failed:', err);
            }
        }

        // 2. Fallback HTML5 Audio Playback (if Web Audio buffer is not decoded)
        if (fallbackAudioRef.current) {
            try {
                const audio = fallbackAudioRef.current;
                audio.currentTime = 0;
                audio.volume = 1.0;
                activeSourceRef.current = audio;
                audio.play().catch(err => {
                    console.warn('[SecureNet Audio] HTML5 Audio play restriction:', err.message);
                });
            } catch (err) {
                console.warn('[SecureNet Audio] Fallback audio exception:', err);
            }
        }
    }, [unlockAudio]);

    return {
        unlockAudio,
        playHammerOnce,
        stopAudio
    };
}
