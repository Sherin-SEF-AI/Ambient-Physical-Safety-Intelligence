import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { AcousticEvent, Severity, SecurityAlert } from '../types';
import { analyzeAcousticSignature } from '../services/geminiService';
import { 
    Music, Mic, ShieldAlert, Activity, 
    Radio, Clock, MapPin, Target, Zap, Volume2, 
    TrendingUp, Info, 
    AlertOctagon, Loader2, Play, Square,
    History, Search, Database, Fingerprint,
    ChevronRight, Link2, Eye, Scale
} from 'lucide-react';

const AudioForensicsView: React.FC = () => {
    const { alerts, audioMetrics, isArmed, audioContextState, resumeAudio } = useSecurity();
    const [events, setEvents] = useState<AcousticEvent[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<AcousticEvent | null>(null);
    const spectrogramRef = useRef<HTMLCanvasElement>(null);

    // Auto-analysis logic for high dB triggers
    useEffect(() => {
        if (isArmed && audioMetrics.decibelLevel > 65 && !isAnalyzing) {
            triggerForensicScan();
        }
    }, [audioMetrics.decibelLevel]);

    const triggerForensicScan = async () => {
        setIsAnalyzing(true);
        try {
            const results = await analyzeAcousticSignature(audioMetrics.decibelLevel, alerts);
            setEvents(prev => [...results, ...prev].slice(0, 50));
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Find correlated visual events for the selected acoustic event
    const correlatedVisuals = useMemo(() => {
        if (!selectedEvent) return [];
        const eventTime = new Date(selectedEvent.timestamp).getTime();
        return alerts.filter(a => {
            const alertTime = new Date(a.timestamp).getTime();
            const timeDiff = Math.abs(eventTime - alertTime);
            return timeDiff < 30000; // Correlate events within 30s
        }).slice(0, 3);
    }, [selectedEvent, alerts]);

    // Spectrogram Simulation
    useEffect(() => {
        const canvas = spectrogramRef.current;
        if (!canvas) return;
        // Fix for "willReadFrequently" warning
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        let animationFrame: number;
        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;
            
            // Shift image left
            const imageData = ctx.getImageData(1, 0, width - 1, height);
            ctx.putImageData(imageData, 0, 0);

            const x = width - 1;
            const factor = isArmed ? audioMetrics.decibelLevel / 100 : 0.01;
            
            // Draw new column of spectral data
            for (let i = 0; i < height; i++) {
                const noise = Math.random() * 20;
                const value = Math.max(0, factor * 255 - (i * 2) + noise);
                const hue = 200 + (value / 255) * 160;
                ctx.fillStyle = `hsla(${hue}, 80%, ${value / 3}%, 1)`;
                ctx.fillRect(x, height - i, 1, 1);
            }

            animationFrame = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animationFrame);
    }, [isArmed, audioMetrics.decibelLevel]);

    return (
        <div className="p-6 h-full flex flex-col gap-6 overflow-hidden bg-[#050810]">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center border border-white/10 shadow-xl shadow-purple-500/10">
                        <Music className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Advanced Audio Forensics</h1>
                        <p className="text-gray-500 text-xs font-mono tracking-widest uppercase mt-0.5 flex items-center gap-2">
                            Acoustic Signature Deconvolution Node :: v5.0
                            {isArmed && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3 shadow-2xl">
                         <TrendingUp className="w-4 h-4 text-purple-400" />
                         <div className="text-xs">
                             <div className="text-gray-500 uppercase font-black text-[9px]">Ambient Noise Floor</div>
                             <div className="text-white font-mono">{Math.round(audioMetrics.decibelLevel)} dB</div>
                         </div>
                    </div>
                    <button 
                        onClick={triggerForensicScan}
                        disabled={isAnalyzing || !isArmed}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 uppercase text-xs tracking-widest"
                    >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Manual Forensic Scan
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
                {/* Main Spectrogram & Analysis */}
                <div className="col-span-8 flex flex-col gap-6 min-h-0">
                    <div className="bg-aegis-800/40 rounded-3xl border border-purple-500/20 shadow-2xl flex flex-col min-h-0 overflow-hidden relative">
                        <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-4 h-4 text-purple-400" /> Continuous Frequency Heatmap
                            </h3>
                            <div className="flex items-center gap-4 text-[9px] text-gray-500 font-mono">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> HIGH FREQ</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-900"></div> LOW FREQ</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-black relative">
                            <canvas ref={spectrogramRef} width={1200} height={200} className="w-full h-full object-cover opacity-80" />
                        </div>
                    </div>

                    <div className="flex-1 bg-aegis-800/20 rounded-3xl border border-white/5 p-6 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <History className="w-4 h-4 text-purple-400" /> Forensic Incident Log
                            </h3>
                            <span className="text-[10px] font-mono text-gray-500 uppercase">{events.length} Signals Captured</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                            {events.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-50 border-2 border-dashed border-white/5 rounded-2xl">
                                    <Database className="w-12 h-12 mb-4" />
                                    <p className="text-sm">Standing by for acoustic triggers...</p>
                                </div>
                            ) : (
                                events.map((ev) => (
                                    <div 
                                        key={ev.id}
                                        onClick={() => setSelectedEvent(ev)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center gap-4 ${selectedEvent?.id === ev.id 
                                            ? 'bg-purple-600/20 border-purple-500 shadow-lg' 
                                            : 'bg-black/40 border-white/5 hover:border-purple-500/50'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110 ${ev.type === 'BALLISTIC' ? 'bg-red-600 text-white' : ev.type === 'SPEECH' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                                            {ev.type === 'BALLISTIC' ? <Target className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-white font-black text-sm uppercase group-hover:text-purple-400 transition-colors">{ev.type}: {ev.subType}</h4>
                                                    <div className="flex items-center gap-2 text-[9px] text-gray-500 font-mono mt-0.5">
                                                        <Clock className="w-3 h-3" /> {new Date(ev.timestamp).toLocaleTimeString()}
                                                        <span className="opacity-20">|</span>
                                                        <MapPin className="w-3 h-3" /> {ev.location || 'Distributed'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-lg font-black leading-none ${ev.isThreat ? 'text-red-500' : 'text-purple-400'}`}>{ev.decibels}dB</div>
                                                    <div className="text-[8px] text-gray-500 font-mono uppercase tracking-widest mt-1">Correlation: {ev.confidence}%</div>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-purple-400 transition-colors" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Signature Inspector */}
                <div className="col-span-4 flex flex-col gap-6">
                    <div className="bg-aegis-800/40 rounded-3xl border border-purple-500/20 p-6 shadow-2xl flex flex-col min-h-0 flex-1 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 group-hover:opacity-100 animate-scan-line"></div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                            <Fingerprint className="w-5 h-5 text-purple-400" /> Signature Inspector
                        </h3>

                        {selectedEvent ? (
                            <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="bg-black/60 rounded-2xl p-5 border border-white/10 shadow-inner">
                                    <div className="text-[9px] text-gray-500 font-black uppercase mb-2 tracking-tight">Deconvolution Narrative</div>
                                    <p className="text-xs text-gray-300 font-mono leading-relaxed italic">"{selectedEvent.rawAnalysis}"</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-[10px] font-black text-aegis-accent uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Link2 className="w-4 h-4" /> Visual Correlation
                                    </div>
                                    <div className="space-y-2">
                                        {correlatedVisuals.length === 0 ? (
                                            <div className="text-[10px] text-gray-600 font-mono py-4 border border-dashed border-white/5 rounded-xl text-center">NO_VISUAL_HANDOFF_CORRELATED</div>
                                        ) : (
                                            correlatedVisuals.map((v, i) => (
                                                <div key={i} className="bg-white/5 rounded-xl p-2 flex gap-3 border border-white/5 hover:border-aegis-500/50 transition-all cursor-pointer group/v">
                                                    <div className="w-14 h-14 bg-black rounded-lg overflow-hidden shrink-0 relative">
                                                        <img src={v.snapshot} className="w-full h-full object-cover opacity-60 group-hover/v:opacity-100" />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/v:opacity-100 transition-opacity">
                                                            <Eye className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[10px] font-bold text-white uppercase truncate">{v.threatType}</div>
                                                        <div className="text-[8px] text-gray-500 font-mono mt-1">{v.location}</div>
                                                        <div className="text-[8px] text-aegis-accent font-black mt-0.5">ΔT: {Math.round(Math.abs(new Date(selectedEvent.timestamp).getTime() - new Date(v.timestamp).getTime()) / 1000)}s</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 space-y-3">
                                    <button className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-[1.02] uppercase text-xs tracking-widest">
                                        <Scale className="w-5 h-5" /> Escalate to Incident
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-700 opacity-40">
                                <Mic className="w-20 h-20 mb-4 stroke-1" />
                                <p className="text-center font-bold uppercase tracking-widest text-xs">Select Signal for Analysis</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-black/60 rounded-3xl border border-white/5 p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Volume2 className="w-4 h-4 text-gray-500" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Environmental Monitor</span>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Ambient Noise Floor', value: '42dB', status: 'Optimal' },
                                { label: 'Echo Cancellation', value: 'Active', status: 'Stable' },
                                { label: 'Sensor Integrity', value: '99%', status: 'Online' }
                            ].map((m, i) => (
                                <div key={i} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                    <span className="text-gray-400 font-mono">{m.label}</span>
                                    <div className="flex gap-4">
                                        <span className="text-white font-bold">{m.value}</span>
                                        <span className="text-green-500 font-bold uppercase">{m.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioForensicsView;