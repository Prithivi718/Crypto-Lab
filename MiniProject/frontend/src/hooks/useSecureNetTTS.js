/**
 * useSecureNetTTS.js
 * 
 * Modular Web Speech API Text-to-Speech (TTS) hook for SecureNet Intro.
 * Isolated from UI layout, animation, and loading progress logic.
 * 
 * Custom Defaults:
 * - Preferred Voice: "Andrew" (en-US) -> fallback to English -> fallback to browser default
 * - Rate: 1.1
 * - Pitch: 0.5
 * - Volume: 0.9
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'securenet-intro-voice';

// Configurable default options - easily edited for proper flow
export const DEFAULT_TTS_CONFIG = {
    voiceName: 'Andrew', // Preferred voice name substring (e.g. 'Andrew', 'Google US English', etc.)
    lang: 'en-US',       // Preferred language code
    rate: 1.1,           // Speed of speech (0.1 to 10, default 1.1)
    pitch: 0.5,          // Pitch of speech (0 to 2, default 0.5 for deeper tactical tone)
    volume: 0.9          // Volume (0 to 1)
};

export function useSecureNetTTS(customConfig = {}) {
    const configRef = useRef({ ...DEFAULT_TTS_CONFIG, ...customConfig });
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved !== null ? saved === 'false' : false; // Default: ON (not muted)
    });

    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    // Persist mute setting
    const toggleVoice = useCallback(() => {
        setIsMuted(prev => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, String(!next));
            if (next && isSupported) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
            return next;
        });
    }, [isSupported]);

    // Voice population algorithm matching user preference: "Andrew (en-US)" -> English -> Default
    const updateVoiceList = useCallback(() => {
        if (!isSupported) return;

        const availableVoices = window.speechSynthesis.getVoices();
        if (!availableVoices || availableVoices.length === 0) return;

        setVoices(availableVoices);

        const cfg = configRef.current;

        // 1. Match exact/partial name "Andrew" (e.g., "Microsoft Andrew Online (Natural) - English (United States)")
        let bestMatch = availableVoices.find(v =>
            v.name.toLowerCase().includes(cfg.voiceName.toLowerCase())
        );

        // 2. Fallback to en-US voice
        if (!bestMatch) {
            bestMatch = availableVoices.find(v => v.lang === cfg.lang || v.lang.replace('_', '-').startsWith('en-US'));
        }

        // 3. Fallback to any English voice
        if (!bestMatch) {
            bestMatch = availableVoices.find(v => v.lang.toLowerCase().startsWith('en'));
        }

        // 4. Browser default voice fallback
        if (!bestMatch) {
            bestMatch = availableVoices.find(v => v.default) || availableVoices[0];
        }

        setSelectedVoice(bestMatch || null);
    }, [isSupported]);

    useEffect(() => {
        if (!isSupported) return;

        updateVoiceList();

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = updateVoiceList;
        }

        return () => {
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, [isSupported, updateVoiceList]);

    // Cancel active speech
    const cancelSpeech = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [isSupported]);

    /**
     * Speaks a single sentence with exact lifecycle promises and callback handlers.
     * 
     * @param {string} text - The sentence to speak
     * @param {Object} options - Override parameters { rate, pitch, volume, voice }
     * @returns {Promise<boolean>} Resolves true when sentence finishes, false if failed/cancelled
     */
    const speakSentence = useCallback((text, options = {}) => {
        return new Promise((resolve) => {
            if (!isSupported || isMuted || !text) {
                resolve(false);
                return;
            }

            const synth = window.speechSynthesis;

            // Cancel any ongoing utterance before starting a new sentence
            synth.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            const cfg = { ...configRef.current, ...options };

            utterance.rate = cfg.rate ?? 1.1;
            utterance.pitch = cfg.pitch ?? 0.5;
            utterance.volume = cfg.volume ?? 0.9;

            const voiceToUse = options.voice || selectedVoice;
            if (voiceToUse) {
                utterance.voice = voiceToUse;
            }

            // Safety timeout to prevent hanging if browser fails to trigger onend
            const fallbackDurationMs = Math.max(2500, (text.length / 12) * 1000);
            let timeoutId = null;

            const handleDone = (success) => {
                if (timeoutId) clearTimeout(timeoutId);
                setIsSpeaking(false);
                resolve(success);
            };

            utterance.onstart = () => {
                setIsSpeaking(true);
            };

            utterance.onend = () => {
                handleDone(true);
            };

            utterance.onerror = (err) => {
                console.warn('[SecureNet TTS] Utterance error:', err);
                handleDone(false);
            };

            timeoutId = setTimeout(() => {
                console.warn('[SecureNet TTS] Fallback timeout reached for sentence:', text);
                handleDone(true);
            }, fallbackDurationMs);

            try {
                synth.speak(utterance);
            } catch (err) {
                console.error('[SecureNet TTS] Exception during speak():', err);
                handleDone(false);
            }
        });
    }, [isSupported, isMuted, selectedVoice]);

    return {
        speakSentence,
        cancelSpeech,
        isSpeaking,
        isMuted,
        toggleVoice,
        voices,
        selectedVoice,
        isSupported,
        setSelectedVoice
    };
}
