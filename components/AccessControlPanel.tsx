
import React, { useState } from 'react';
import { Shield, KeyRound, AlertOctagon, CheckCircle2, DoorOpen, Users, AlertTriangle, Loader2, Play, Lock, Unlock } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { AccessAlarmType } from '../types';
import { correlateAccessEvent } from '../services/geminiService';

const AccessControlPanel: React.FC = () => {
  const { videoRef, accessEvents, addAccessEvent, globalLockdown, setGlobalLockdown } = useSecurity();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleSimulateAlarm = async (type: AccessAlarmType, label: string) => {
    if (!videoRef.current) return;
    setIsProcessing(type);

    try {
        // Capture Frame
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
             ctx.drawImage(videoRef.current, 0, 0);
             const base64 = canvas.toDataURL('image/jpeg', 0.8);

             // Create Initial Event
             const eventId = `ACS-${Date.now()}`;
             
             // Verify with AI
             const result = await correlateAccessEvent(type, base64);
             
             addAccessEvent({
                 id: eventId,
                 timestamp: new Date().toISOString(),
                 doorName: 'Main Entry / Lobby',
                 alarmType: type,
                 status: result.verdict,
                 confidence: result.confidence,
                 reasoning: result.reasoning,
                 snapshot: base64
             });
        }
    } catch (e) {
        console.error("PACS Simulation Failed", e);
    } finally {
        setIsProcessing(null);
    }
  };

  return (
    <div className="bg-aegis-800 rounded-xl border border-aegis-700 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-aegis-700 bg-aegis-900/50 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center gap-2">
                <KeyRound className="text-aegis-accent" />
                Access Intelligence (PACS)
            </h3>
            {globalLockdown ? (
                <span className="text-[10px] text-red-100 bg-red-600 px-2 py-1 rounded border border-red-400 font-bold animate-pulse">
                    GLOBAL LOCKDOWN ACTIVE
                </span>
            ) : (
                <span className="text-[10px] text-green-400 bg-green-900/30 px-2 py-1 rounded border border-green-500/30">
                    SYSTEM NORMAL
                </span>
            )}
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
            {/* Simulation Controls */}
            <div className="w-full lg:w-1/3 p-4 border-r border-aegis-700 bg-aegis-800/50 space-y-6 flex flex-col">
                <div>
                    <h4 className="text-xs text-gray-500 font-bold uppercase mb-2">Simulate Hardware Alarm</h4>
                    <p className="text-xs text-gray-400 mb-4">
                        Trigger a mock PACS alarm to test Ambient Intelligence correlation with the live camera feed.
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        <button 
                            onClick={() => handleSimulateAlarm('DOOR_FORCED', 'Door Forced')}
                            disabled={!!isProcessing}
                            className="p-3 bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 text-red-200 rounded flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <AlertOctagon className="w-4 h-4 text-red-500" />
                                <span className="font-bold text-sm">Door Forced</span>
                            </div>
                            {isProcessing === 'DOOR_FORCED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                        </button>

                        <button 
                            onClick={() => handleSimulateAlarm('TAILGATING', 'Tailgating')}
                            disabled={!!isProcessing}
                            className="p-3 bg-orange-900/20 border border-orange-500/30 hover:bg-orange-900/40 text-orange-200 rounded flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-orange-500" />
                                <span className="font-bold text-sm">Tailgating</span>
                            </div>
                            {isProcessing === 'TAILGATING' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                        </button>

                        <button 
                            onClick={() => handleSimulateAlarm('DOOR_HELD', 'Door Held Open')}
                            disabled={!!isProcessing}
                            className="p-3 bg-yellow-900/20 border border-yellow-500/30 hover:bg-yellow-900/40 text-yellow-200 rounded flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <DoorOpen className="w-4 h-4 text-yellow-500" />
                                <span className="font-bold text-sm">Door Held Open</span>
                            </div>
                            {isProcessing === 'DOOR_HELD' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                        </button>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                     <h4 className="text-xs text-red-400 font-bold uppercase mb-2">Emergency Override</h4>
                     <div className="grid grid-cols-2 gap-2">
                         <button 
                            onClick={() => setGlobalLockdown(true)}
                            className={`p-3 rounded text-xs font-bold flex flex-col items-center gap-2 shadow-lg transition-all ${globalLockdown ? 'bg-red-700 text-white cursor-not-allowed opacity-50' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                            disabled={globalLockdown}
                         >
                             <Lock className="w-5 h-5" />
                             LOCKDOWN ALL
                         </button>
                         <button 
                            onClick={() => setGlobalLockdown(false)}
                            className={`p-3 rounded text-xs font-bold flex flex-col items-center gap-2 shadow-lg transition-all ${!globalLockdown ? 'bg-aegis-800 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                            disabled={!globalLockdown}
                         >
                             <Unlock className="w-5 h-5" />
                             RELEASE ALL
                         </button>
                     </div>
                </div>
            </div>

            {/* Event Log */}
            <div className="flex-1 p-4 bg-black/20 overflow-y-auto">
                 <h4 className="text-xs text-gray-500 font-bold uppercase mb-4 sticky top-0 bg-transparent backdrop-blur-sm z-10 pb-2 border-b border-white/5">
                    Live Correlation Log
                 </h4>
                 
                 {accessEvents.length === 0 ? (
                     <div className="text-center text-gray-500 py-10">
                         <Shield className="w-12 h-12 mx-auto mb-2 opacity-20" />
                         <p>No access events detected.</p>
                     </div>
                 ) : (
                     <div className="space-y-4">
                         {accessEvents.map(event => (
                             <div key={event.id} className="bg-aegis-900/80 rounded-lg border border-aegis-700 overflow-hidden animate-in slide-in-from-right-4">
                                 <div className="flex">
                                     {/* Snapshot Preview */}
                                     <div className="w-24 h-24 bg-black relative shrink-0">
                                         <img src={event.snapshot} alt="Evidence" className="w-full h-full object-cover opacity-80" />
                                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-1">
                                             <span className="text-[9px] font-mono text-white truncate">{event.doorName}</span>
                                         </div>
                                     </div>
                                     
                                     {/* Details */}
                                     <div className="p-3 flex-1">
                                         <div className="flex justify-between items-start mb-2">
                                             <div>
                                                 <div className="text-sm font-bold text-white flex items-center gap-2">
                                                     {event.alarmType.replace('_', ' ')}
                                                     <span className="text-[10px] text-gray-500 font-normal">
                                                         {new Date(event.timestamp).toLocaleTimeString()}
                                                     </span>
                                                 </div>
                                             </div>
                                             <div className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 ${
                                                 event.status === 'AUTO_CLEARED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                 event.status === 'VERIFIED_THREAT' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                             }`}>
                                                 {event.status === 'AUTO_CLEARED' && <CheckCircle2 className="w-3 h-3" />}
                                                 {event.status === 'VERIFIED_THREAT' && <AlertOctagon className="w-3 h-3" />}
                                                 {event.status === 'NEEDS_REVIEW' && <AlertTriangle className="w-3 h-3" />}
                                                 {event.status.replace('_', ' ')}
                                             </div>
                                         </div>
                                         
                                         <p className="text-xs text-gray-300 leading-relaxed border-l-2 border-aegis-600 pl-2">
                                             {event.reasoning}
                                         </p>
                                         <div className="mt-2 text-[10px] text-gray-500 text-right">
                                             Confidence: {Math.round(event.confidence)}%
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
            </div>
        </div>
    </div>
  );
};

export default AccessControlPanel;
