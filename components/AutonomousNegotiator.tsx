
import React, { useState, useEffect, useRef } from 'react';
import { useLiveNegotiation } from '../hooks/useLiveNegotiation';
import { NegotiationEntry, BehavioralState } from '../types';
import { Mic, Radio, Volume2, ShieldAlert, Activity, User, Bot, Power, AlertTriangle, MessageSquare } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

interface Props {
    targetBehavior: BehavioralState;
    onClose: () => void;
}

const AutonomousNegotiator: React.FC<Props> = ({ targetBehavior, onClose }) => {
    const { apiKey } = useSecurity();
    const [logs, setLogs] = useState<NegotiationEntry[]>([]);
    const [persona, setPersona] = useState<'AUTHORITATIVE' | 'HELPFUL' | 'DE_ESCALATION'>('AUTHORITATIVE');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Dynamic Instruction based on Persona
    const getSystemInstruction = () => {
        const base = "You are AEGIS, an autonomous security AI protecting a secure facility. Speak briefly and clearly.";
        switch(persona) {
            case 'AUTHORITATIVE': return `${base} The intruder is aggressive. Be firm, command them to stand down and exit immediately. Warn that authorities are en route.`;
            case 'HELPFUL': return `${base} The intruder seems confused. Be helpful but firm. Guide them to the nearest exit. Explain they are in a restricted zone.`;
            case 'DE_ESCALATION': return `${base} The situation is tense. Use calming language. Listen to their demands but maintain security integrity. Do not provoke.`;
            default: return base;
        }
    };

    const { connect, disconnect, isConnected, isSpeaking, volume, error } = useLiveNegotiation({
        apiKey,
        systemInstruction: getSystemInstruction(),
        onTranscript: (entry) => setLogs(prev => [...prev, entry])
    });

    useEffect(() => {
        // Auto-connect on mount
        connect();
        return () => disconnect();
    }, []); // Only on mount

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    // Auto-select persona based on detected behavior
    useEffect(() => {
        if (targetBehavior === BehavioralState.AGGRESSIVE || targetBehavior === BehavioralState.AIMING_WEAPON) {
            setPersona('AUTHORITATIVE');
        } else if (targetBehavior === BehavioralState.SEARCHING || targetBehavior === BehavioralState.NORMAL) {
            setPersona('HELPFUL');
        } else {
            setPersona('DE_ESCALATION');
        }
    }, [targetBehavior]);

    return (
        <div className="flex flex-col h-full bg-black/80 rounded-xl overflow-hidden border border-white/10 relative">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-aegis-900/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isConnected ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-gray-800 text-gray-500'}`}>
                        <Radio className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Autonomous Negotiator</h3>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>{isConnected ? 'LIVE CHANNEL OPEN' : 'DISCONNECTED'}</span>
                            <span>|</span>
                            <span>VOICE_MOD: {persona}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                    <Power className="w-4 h-4" />
                </button>
            </div>

            {/* Visualizer & Controls */}
            <div className="bg-aegis-900/30 p-6 flex flex-col items-center justify-center gap-4 border-b border-white/5 shrink-0">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Ripple Effect */}
                    {isConnected && (
                        <>
                            <div className={`absolute inset-0 rounded-full border-2 border-aegis-accent opacity-20 ${isSpeaking ? 'animate-ping' : ''}`}></div>
                            <div className={`absolute inset-4 rounded-full border border-aegis-accent opacity-40 ${isSpeaking ? 'animate-ping animation-delay-200' : ''}`}></div>
                        </>
                    )}
                    
                    <div className={`relative z-10 w-24 h-24 rounded-full bg-black border-4 flex items-center justify-center shadow-[0_0_30px_currentColor] transition-all duration-300 ${isSpeaking ? 'border-aegis-accent text-aegis-accent' : 'border-gray-700 text-gray-700'}`}>
                        {isSpeaking ? <Volume2 className="w-10 h-10 animate-pulse" /> : <Mic className="w-10 h-10" />}
                    </div>
                </div>

                <div className="flex gap-2 w-full max-w-xs">
                    <button onClick={() => setPersona('AUTHORITATIVE')} className={`flex-1 py-2 text-[9px] font-bold uppercase rounded border transition-all ${persona === 'AUTHORITATIVE' ? 'bg-red-600 border-red-500 text-white' : 'bg-black/40 border-white/10 text-gray-500 hover:text-white'}`}>
                        Authority
                    </button>
                    <button onClick={() => setPersona('DE_ESCALATION')} className={`flex-1 py-2 text-[9px] font-bold uppercase rounded border transition-all ${persona === 'DE_ESCALATION' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black/40 border-white/10 text-gray-500 hover:text-white'}`}>
                        Calm
                    </button>
                    <button onClick={() => setPersona('HELPFUL')} className={`flex-1 py-2 text-[9px] font-bold uppercase rounded border transition-all ${persona === 'HELPFUL' ? 'bg-green-600 border-green-500 text-white' : 'bg-black/40 border-white/10 text-gray-500 hover:text-white'}`}>
                        Guide
                    </button>
                </div>
            </div>

            {/* Transcript Log */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-[#05080F]" ref={scrollRef}>
                {logs.length === 0 && (
                    <div className="text-center py-10 text-gray-600 italic text-xs">
                        Negotiation channel initialized. Waiting for audio input...
                    </div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className={`flex gap-3 ${log.speaker === 'AI' ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${log.speaker === 'AI' ? 'bg-aegis-900 border-aegis-accent text-aegis-accent' : 'bg-red-900/20 border-red-500 text-red-500'}`}>
                            {log.speaker === 'AI' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-[80%] p-3 rounded-xl border text-xs leading-relaxed ${log.speaker === 'AI' ? 'bg-aegis-900/40 border-aegis-500/20 text-gray-200 rounded-tl-none' : 'bg-white/5 border-white/10 text-gray-400 rounded-tr-none'}`}>
                            {log.text}
                        </div>
                    </div>
                ))}
                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        Connection Error: {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutonomousNegotiator;
