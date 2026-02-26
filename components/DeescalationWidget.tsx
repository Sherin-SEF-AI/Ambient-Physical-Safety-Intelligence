
import React, { useState, useEffect } from 'react';
import { SecurityAlert, CrisisProtocol } from '../types';
import { Radio, Volume2, Mic, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
    crisis: CrisisProtocol;
    alert: SecurityAlert;
}

const DeescalationWidget: React.FC<Props> = ({ crisis, alert }) => {
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isBroadcasting) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setIsBroadcasting(false);
                        return 100;
                    }
                    return prev + 2; // 5 seconds duration
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isBroadcasting]);

    return (
        <div className="bg-red-900/10 rounded-xl border border-red-500/30 overflow-hidden flex flex-col h-full shadow-[0_0_20px_rgba(239,68,68,0.1)] relative">
            {isBroadcasting && (
                <div className="absolute inset-0 bg-red-950/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
                    <div className="flex gap-1 items-end h-12 mb-2">
                        {[...Array(8)].map((_, i) => (
                            <div 
                                key={i} 
                                className="w-1.5 bg-red-500 rounded-full animate-pulse" 
                                style={{ 
                                    height: `${20 + Math.random() * 80}%`,
                                    animationDuration: `${0.2 + Math.random() * 0.5}s`
                                }}
                            ></div>
                        ))}
                    </div>
                    <h3 className="text-red-400 font-bold text-[10px] tracking-widest animate-pulse">BROADCASTING</h3>
                    <div className="w-48 h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-red-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            <div className="p-2 border-b border-red-500/20 flex justify-between items-center bg-red-900/20 shrink-0">
                <h3 className="text-red-400 font-bold text-[9px] uppercase flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" /> DE-ESCALATION
                </h3>
                <span className="text-[8px] font-mono text-red-500 animate-pulse bg-red-950/50 px-1.5 py-0.5 rounded border border-red-500/20">
                    URGENT
                </span>
            </div>

            <div className="p-3 flex flex-col gap-3 flex-1 min-h-0">
                <div className="flex items-start gap-2.5 shrink-0">
                    <div className="bg-red-500/10 p-1.5 rounded-full border border-red-500/20">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[8px] text-gray-500 uppercase tracking-wider">Trigger</span>
                            <span className="text-[8px] text-red-400 font-mono">{new Date(alert.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="text-[11px] font-bold text-white leading-none truncate">{alert.threatType}</div>
                        <div className="text-[8px] text-gray-500 mt-0.5 truncate">{alert.location}</div>
                    </div>
                </div>

                <div className="flex-1 bg-black/40 rounded border border-white/5 relative group overflow-hidden flex flex-col min-h-0">
                    <div className="absolute top-0 left-0 right-0 z-10 p-2 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                        <div className="bg-red-900 text-red-200 text-[7px] px-1.5 py-0.5 rounded border border-red-500/20 uppercase font-bold tracking-widest w-fit">
                            SCRIPT ({crisis.tone})
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 pt-7">
                        <p className="text-[10px] text-gray-300 font-mono italic leading-relaxed">
                            "{crisis.paAnnouncementScript}"
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => setIsBroadcasting(true)}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[10px] flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 shrink-0"
                >
                    <Radio className="w-3.5 h-3.5" /> 
                    INITIATE BROADCAST
                </button>
            </div>
        </div>
    );
};

export default DeescalationWidget;
