
import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { NegotiationEntry } from '../types';

interface UseLiveNegotiationProps {
    apiKey: string;
    systemInstruction: string;
    onTranscript: (entry: NegotiationEntry) => void;
}

export const useLiveNegotiation = ({ apiKey, systemInstruction, onTranscript }: UseLiveNegotiationProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [volume, setVolume] = useState(0);
    const [error, setError] = useState<string | null>(null);
    
    // Audio Context Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputAnalyserRef = useRef<AnalyserNode | null>(null);
    const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    
    // Live API Session
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);

    const cleanup = useCallback(() => {
        setIsConnected(false);
        setIsSpeaking(false);
        setVolume(0);

        // Close Audio Contexts
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }

        // Stop all active audio sources
        activeSourcesRef.current.forEach(source => {
            try { source.stop(); } catch(e) {}
        });
        activeSourcesRef.current.clear();

        // Close Gemini Session (if possible via library, currently we just stop sending)
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => {
                try { session.close(); } catch(e) { console.error("Session close error", e); }
            });
            sessionPromiseRef.current = null;
        }
    }, []);

    const connect = useCallback(async () => {
        if (!apiKey) {
            setError("Missing API Key");
            return;
        }

        try {
            setError(null);
            const ai = new GoogleGenAI({ apiKey });
            
            // 1. Setup Audio Input
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const inputCtx = new AudioContextClass({ sampleRate: 16000 }); // Gemini prefers 16k input
            audioContextRef.current = inputCtx;

            const source = inputCtx.createMediaStreamSource(stream);
            inputSourceRef.current = source;

            const analyser = inputCtx.createAnalyser();
            inputAnalyserRef.current = analyser;
            source.connect(analyser);

            // Worklet or ScriptProcessor for raw PCM access
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            
            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Volume Meter Logic
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                    sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / inputData.length);
                setVolume(rms * 100);

                // Create Blob for Gemini
                const pcmBlob = createBlob(inputData);
                
                // Send to Gemini
                if (sessionPromiseRef.current) {
                    sessionPromiseRef.current.then(session => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                }
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);

            // 2. Setup Audio Output
            const outputCtx = new AudioContextClass({ sampleRate: 24000 }); // Gemini returns 24k
            outputAudioContextRef.current = outputCtx;
            nextStartTimeRef.current = outputCtx.currentTime;

            // 3. Connect to Gemini Live
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        setIsConnected(true);
                        console.log("Gemini Live Connected");
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        // Handle Audio Output
                        const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData) {
                            setIsSpeaking(true);
                            playAudioChunk(audioData, outputCtx);
                        }

                        // Handle Transcript (User or Model)
                        if (msg.serverContent?.modelTurn?.parts[0]?.text) {
                             onTranscript({
                                 id: `AI-${Date.now()}`,
                                 timestamp: new Date().toISOString(),
                                 speaker: 'AI',
                                 text: msg.serverContent.modelTurn.parts[0].text
                             });
                             setIsSpeaking(false);
                        }
                        
                        // User Transcript (if enabled in config, usually handled via `serverContent.interrupted` or specific events)
                        // Simplified for now: We focus on AI output transcription as primary feedback
                    },
                    onclose: () => {
                        setIsConnected(false);
                        cleanup();
                    },
                    onerror: (e) => {
                        console.error("Gemini Live Error", e);
                        setError("Connection Error");
                        cleanup();
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: systemInstruction,
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                    }
                }
            });

        } catch (err: any) {
            console.error("Negotiation Connection Failed", err);
            setError(err.message || "Failed to connect");
            cleanup();
        }
    }, [apiKey, systemInstruction, cleanup, onTranscript]);

    const playAudioChunk = async (base64Audio: string, ctx: AudioContext) => {
        try {
            const audioBuffer = await decodeAudioData(base64Audio, ctx);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            // Scheduling for gapless playback
            const now = ctx.currentTime;
            const start = Math.max(now, nextStartTimeRef.current);
            source.start(start);
            nextStartTimeRef.current = start + audioBuffer.duration;
            
            activeSourcesRef.current.add(source);
            source.onended = () => {
                activeSourcesRef.current.delete(source);
                if (activeSourcesRef.current.size === 0) setIsSpeaking(false);
            };
        } catch (e) {
            console.error("Audio Decode Error", e);
        }
    };

    return { connect, disconnect: cleanup, isConnected, isSpeaking, volume, error };
};

// --- Helpers ---

function createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: arrayBufferToBase64(int16.buffer),
        mimeType: 'audio/pcm;rate=16000',
    };
}

async function decodeAudioData(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Gemini 24kHz PCM - Simple Conversion or use decodeAudioData if headerless support exists (it usually doesn't for raw PCM)
    // We need to manually construct the AudioBuffer from raw 16-bit PCM
    const int16Data = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
    }

    const buffer = ctx.createBuffer(1, float32Data.length, 24000);
    buffer.copyToChannel(float32Data, 0);
    return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
