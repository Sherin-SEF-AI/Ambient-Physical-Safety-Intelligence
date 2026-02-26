
import React, { useState } from 'react';
import { AlertOctagon, Phone, Lock, Eye, Siren, X, Mic, KeyRound, Link2, MessageSquare } from 'lucide-react';
import { SecurityAlert, BehavioralState } from '../types';
import AutonomousNegotiator from './AutonomousNegotiator';

interface Props {
    alert: SecurityAlert;
    onDismiss: () => void;
}

const ActiveThreatOverlay: React.FC<Props> = ({ alert, onDismiss }) => {
    const [showNegotiator, setShowNegotiator] = useState(false);

    // Check if we have multiple modalities
    const modalities = alert.modalitySource || ['VISUAL'];
    const isMultiModal = modalities.length > 1;
    const isAudioConfirmed = modalities.includes('AUDIO');
    const isIoTConfirmed = modalities.includes('IOT');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-aegis-900 border-2 border-red-500 rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300 max-h-[90vh]">
                {/* Manual Close Button */}
                <button 
                    onClick={onDismiss} 
                    className="absolute top-2 right-2 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
                    title="Close Overlay"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Flashing Header */}
                <div className="bg-red-600 p-4 flex items-center justify-between animate-pulse shrink-0">
                    <div className="flex items-center gap-3">
                        <Siren className="w-8 h-8 text-white animate-bounce" />
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-widest">CRITICAL THREAT DETECTED</h2>
                            <p className="text-red-100 font-mono text-sm">IMMEDIATE ACTION REQUIRED</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-white/20 rounded text-white font-bold text-xs border border-white/30">
                        CONFIDENCE: {Math.round(alert.confidence)}%
                    </div>
                </div>

                <div className="flex-1 flex min-h-0 overflow-hidden">
                    {/* Left: Evidence & Details */}
                    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                        {/* Evidence Snapshot */}
                        <div className="relative rounded-lg overflow-hidden border-2 border-red-500 group shrink-0">
                            {alert.snapshot ? (
                                <img src={alert.snapshot} className="w-full h-64 object-cover" alt="Threat Evidence" />
                            ) : (
                                <div className="w-full h-64 bg-gray-900 flex items-center justify-center">
                                    <Eye className="w-12 h-12 text-gray-700" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
                            <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                            </div>
                        </div>

                        {/* Threat Details */}
                        <div className="flex flex-col gap-4">
                            {/* Fusion Indicator */}
                            {isMultiModal && (
                                <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-3 animate-in slide-in-from-right-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Link2 className="w-4 h-4 text-purple-400" />
                                        <span className="text-purple-300 font-black text-xs uppercase tracking-widest">SENSORY FUSION MATCH</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="flex items-center gap-1 text-[9px] bg-purple-500/20 text-white px-2 py-1 rounded border border-purple-500/30">
                                            <Eye className="w-3 h-3" /> VISUAL
                                        </span>
                                        {isAudioConfirmed && (
                                            <span className="flex items-center gap-1 text-[9px] bg-purple-500/20 text-white px-2 py-1 rounded border border-purple-500/30">
                                                <Mic className="w-3 h-3" /> AUDIO
                                            </span>
                                        )}
                                        {isIoTConfirmed && (
                                            <span className="flex items-center gap-1 text-[9px] bg-purple-500/20 text-white px-2 py-1 rounded border border-purple-500/30">
                                                <KeyRound className="w-3 h-3" /> IOT/PACS
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-red-400 font-bold text-sm uppercase mb-1">Threat Classification</h3>
                                <div className="text-2xl font-bold text-white flex items-center gap-2">
                                    <AlertOctagon className="w-6 h-6 text-red-500" />
                                    {alert.weaponType || alert.threatType || 'HOSTILE EVENT'}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-gray-400 font-bold text-sm uppercase mb-1">Location</h3>
                                <div className="text-lg text-white font-mono bg-white/5 p-2 rounded border border-white/10">
                                    {alert.location}
                                </div>
                            </div>

                            <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
                                <span className="text-red-400 text-xs font-bold uppercase block mb-1">Analysis</span>
                                <p className="text-gray-300 text-sm italic">"{alert.reasoning}"</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Negotiator / Actions */}
                    <div className="w-[400px] border-l border-white/10 bg-black/20 flex flex-col">
                        {showNegotiator ? (
                            <AutonomousNegotiator 
                                targetBehavior={alert.intent?.behavioralState || BehavioralState.AGGRESSIVE} 
                                onClose={() => setShowNegotiator(false)}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col p-6 gap-4">
                                <h3 className="text-white font-bold text-sm uppercase tracking-widest border-b border-white/10 pb-4 mb-2">Tactical Response</h3>
                                
                                <button 
                                    className="py-6 bg-aegis-600 hover:bg-aegis-500 text-white font-bold rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg border border-aegis-400"
                                    onClick={() => setShowNegotiator(true)}
                                >
                                    <MessageSquare className="w-8 h-8" />
                                    <span>INITIATE AUTONOMOUS NEGOTIATOR</span>
                                </button>

                                <div className="grid grid-cols-1 gap-3">
                                    <button 
                                        className="py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-lg shadow-red-600/20"
                                        onClick={() => window.alert("FACILITY LOCKDOWN INITIATED. EMERGENCY SERVICES NOTIFIED.")}
                                    >
                                        <Lock className="w-5 h-5" />
                                        FULL LOCKDOWN
                                    </button>
                                    <button 
                                        className="py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg flex items-center justify-center gap-3 transition-all"
                                        onClick={onDismiss}
                                    >
                                        <Eye className="w-5 h-5" />
                                        MONITOR ONLY
                                    </button>
                                </div>

                                <div className="mt-auto bg-black/40 p-4 rounded-xl border border-white/5">
                                    <h4 className="text-gray-500 text-xs font-bold uppercase mb-2">Automated Protocol</h4>
                                    <p className="text-gray-400 text-xs font-mono">
                                        Use 'Negotiator' to de-escalate via PA system. 
                                        Use 'Lockdown' to seal sector doors.
                                        AI recommends <span className="text-aegis-accent font-bold">NEGOTIATION</span> first.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveThreatOverlay;
