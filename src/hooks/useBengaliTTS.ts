/**
 * useBengaliTTS — Optimized Bengali Text-to-Speech for Desktop + Mobile
 *
 * Strategy:
 *  1. On click: cancel existing speech, pick best Bengali voice, speak
 *  2. Chrome desktop fix: keepAlive interval (pause/resume every 10s)
 *  3. Mobile: trigger voiceschanged listener, then speak immediately
 *  4. Enhanced voice priority: Google bn-BD → Microsoft Hemant → Any bn-*
 */
import { useState, useRef, useCallback, useEffect } from "react";

// ─── Voice Priority Tiers ──────────────────────────────────────────────────
const VOICE_MATCHERS: Array<(v: SpeechSynthesisVoice) => boolean> = [
    // Tier 1: Google Bengali (Android / ChromeOS)
    (v) => /google\s*(bangladeshi|bangla|বাংলা)/i.test(v.name),
    (v) => /google.*bn/i.test(v.name) || (v.lang === "bn-BD" && /google/i.test(v.name)),
    (v) => /google.*bengali/i.test(v.name),

    // Tier 2: Microsoft Bengali (Windows Edge / Edge Android)
    (v) => /microsoft\s*(bashkar|hemant|narayanan)/i.test(v.name),
    (v) => /microsoft.*bn/i.test(v.name) || /microsoft.*bangla/i.test(v.name),

    // Tier 3: Any bn-BD voice
    (v) => v.lang === "bn-BD",

    // Tier 4: Any bn-* voice (Sinhala, Indian Bengali)
    (v) => v.lang.startsWith("bn"),

    // Tier 5: Any voice with Bengali in the name
    (v) => /bengali|bangla|বাংলা/i.test(v.name),
];

function getBengaliVoice(): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    for (const matcher of VOICE_MATCHERS) {
        const found = voices.find(matcher);
        if (found) return found;
    }
    return null;
}

// ─── Text cleaner ──────────────────────────────────────────────────────────
export function cleanForTTS(raw: string): string {
    return raw
        // Remove emojis
        .replace(
            /[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu,
            ""
        )
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, "")
        // Remove JSON objects
        .replace(/\{[\s\S]*?\}/g, "")
        // Remove JSON field names (English camelCase keys)
        .replace(
            /\b(isEmergency|emergencyWarning|immediateAdvice|specialistNeeded|specialistReason|followUp|hospitals|tests|name|type|location|estimatedCost|phone|address|recommendedDoctors|doctorName|qualification|specialization|designation|chamber)\b/gi,
            ""
        )
        // Remove JSON punctuation
        .replace(/[{}"[\]:,]/g, "")
        // Remove boolean/null literals
        .replace(/\btrue\b|\bfalse\b|\bnull\b/g, "")
        // Remove URLs
        .replace(/https?:\/\/\S+/g, "")
        // Remove long English words (keep short ones like "AI", "CT")
        .replace(/[a-zA-Z]{5,}/g, "")
        // Collapse multiple newlines
        .replace(/\n{3,}/g, "\n")
        // Collapse multiple spaces
        .replace(/  +/g, " ")
        .trim();
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export function useBengaliTTS() {
    const [speaking, setSpeaking] = useState(false);
    const keepAliveRef = useRef<number | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Eagerly load voices on mount
    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        window.speechSynthesis.getVoices(); // triggers load in Chrome
        window.speechSynthesis.addEventListener("voiceschanged", () =>
            window.speechSynthesis.getVoices()
            , { once: true });

        return () => {
            if (utteranceRef.current) {
                utteranceRef.current.onend = null;
                utteranceRef.current.onerror = null;
            }
            window.speechSynthesis.cancel();
            if (keepAliveRef.current) clearInterval(keepAliveRef.current);
        };
    }, []);

    const stopKeepAlive = useCallback(() => {
        if (keepAliveRef.current) {
            clearInterval(keepAliveRef.current);
            keepAliveRef.current = null;
        }
    }, []);

    const startKeepAlive = useCallback(() => {
        stopKeepAlive();
        // Chrome desktop fix: it stops speaking after ~15s unless we keep it alive
        keepAliveRef.current = window.setInterval(() => {
            if (!window.speechSynthesis.speaking) {
                stopKeepAlive();
                return;
            }
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
        }, 10_000);
    }, [stopKeepAlive]);

    const speak = useCallback(
        (text: string) => {
            if (!window.speechSynthesis) return;

            // Stop if already speaking
            if (speaking) {
                window.speechSynthesis.cancel();
                setSpeaking(false);
                stopKeepAlive();
                return;
            }

            const clean = cleanForTTS(text);
            if (!clean) return;

            const doSpeak = () => {
                window.speechSynthesis.cancel();

                // Short delay so cancel() fully flushes
                setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(clean);
                    utterance.lang = "bn-BD";
                    utterance.rate = 0.9;    // slightly slower for clarity
                    utterance.pitch = 1.05;
                    utterance.volume = 1;

                    const voice = getBengaliVoice();
                    if (voice) {
                        utterance.voice = voice;
                        utterance.lang = voice.lang; // use exact voice lang for best pronunciation
                    }

                    utterance.onstart = () => {
                        setSpeaking(true);
                        startKeepAlive();
                    };
                    utterance.onend = () => {
                        setSpeaking(false);
                        stopKeepAlive();
                    };
                    utterance.onerror = (e) => {
                        if (e.error !== "interrupted") setSpeaking(false);
                        stopKeepAlive();
                    };

                    utteranceRef.current = utterance;
                    window.speechSynthesis.speak(utterance);
                }, 60);
            };

            // If voices not loaded yet, wait
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) {
                window.speechSynthesis.addEventListener("voiceschanged", doSpeak, { once: true });
                window.speechSynthesis.getVoices(); // kick Chrome
            } else {
                doSpeak();
            }
        },
        [speaking, startKeepAlive, stopKeepAlive]
    );

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        stopKeepAlive();
    }, [stopKeepAlive]);

    return { speaking, speak, stop };
}
