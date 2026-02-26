
import React, { useState, useEffect, useMemo } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { EmergencyService, SecurityAlert, Severity } from '../types';
import { Siren, MapPin, Navigation, Phone, Shield, ShieldAlert, Radio, Clock, Loader2, Send, CheckCircle2, AlertOctagon, X, Map as MapIcon, Satellite } from 'lucide-react';

const EmergencyDispatchView: React.FC = () => {
    const { alerts, duressTriggered, setDuressTriggered, isArmed } = useSecurity();
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [services, setServices] = useState<EmergencyService[]>([]);
    const [isDispatching, setIsDispatching] = useState(false);
    const [dispatchStatus, setDispatchStatus] = useState<'IDLE' | 'TRANSMITTING' | 'CONFIRMED'>('IDLE');
    const [selectedType, setSelectedType] = useState<'POLICE' | 'FIRE' | 'EMS' | 'ALL'>('ALL');

    // Recent Critical Alert for packet context
    const criticalAlert = useMemo(() => {
        return alerts.find(a => a.severity === Severity.CRITICAL || a.severity === Severity.HIGH) || alerts[0];
    }, [alerts]);

    useEffect(() => {
        // Real Location Ingestion
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    generateMockServices(pos.coords.latitude, pos.coords.longitude);
                },
                (err) => {
                    console.warn("Geolocation denied, using mock facility HQ.");
                    setLocation({ lat: 37.7749, lng: -122.4194 }); // Mock SF
                    generateMockServices(37.7749, -122.4194);
                }
            );
        }
    }, []);

    const generateMockServices = (lat: number, lng: number) => {
        const types: ('POLICE' | 'FIRE' | 'EMS')[] = ['POLICE', 'FIRE', 'EMS', 'POLICE', 'EMS'];
        const mockData: EmergencyService[] = types.map((type, i) => ({
            id: `SVC-${i + 1}`,
            name: `${type === 'POLICE' ? 'Precinct' : type === 'FIRE' ? 'Station' : 'Medical Unit'} ${10 + i}`,
            type,
            distance: Number((Math.random() * 5 + 0.5).toFixed(1)),
            status: Math.random() > 0.3 ? 'AVAILABLE' : 'BUSY',
            eta: Math.floor(Math.random() * 10) + 2
        }));
        setServices(mockData.sort((a, b) => a.distance - b.distance));
    };

    const handleCommitDispatch = () => {
        setIsDispatching(true);
        setDispatchStatus('TRANSMITTING');
        
        // Agentic Simulation: Building the Tactical Packet
        setTimeout(() => {
            setDispatchStatus('CONFIRMED');
            setIsDispatching(false);
        }, 3000);
    };

    const filteredServices = services.filter(s => selectedType === 'ALL' || s.type === selectedType);

    return (
        <div className="p-6 h-full flex flex-col gap-6 overflow-hidden bg-[#0A0000]">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FF0000 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>
            
            {/* Header / Strobe Overlay if Duress */}
            <div className={`flex justify-between items-center shrink-0 p-4 rounded-2xl border-2 transition-all ${duressTriggered ? 'bg-red-600 border-red-400 animate-pulse shadow-[0_0_50px_rgba(255,0,0,0.4)]' : 'bg-aegis-800 border-aegis-700'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${duressTriggered ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}>
                        <Siren className={`w-8 h-8 ${duressTriggered ? 'animate-bounce' : ''}`} />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-black tracking-tighter uppercase ${duressTriggered ? 'text-white' : 'text-white'}`}>
                            {duressTriggered ? 'ACTIVE DURESS DISPATCH' : 'TACTICAL EMERGENCY DISPATCH'}
                        </h1>
                        <div className="flex items-center gap-3 text-[10px] font-mono tracking-widest uppercase">
                            <span className={duressTriggered ? 'text-red-100 font-black' : 'text-gray-400'}>Facility_ID: SENTINEL_HQ_01</span>
                            <span className={duressTriggered ? 'text-red-100' : 'text-gray-500'}>|</span>
                            <span className={`flex items-center gap-1 ${duressTriggered ? 'text-white font-black' : 'text-red-400'}`}>
                                <MapPin className="w-3 h-3" /> {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'ACQUIRING_GPS...'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    {duressTriggered && (
                        <button 
                            onClick={() => setDuressTriggered(false)}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold border border-white/20 flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> DISMISS DURESS
                        </button>
                    )}
                    <div className="bg-black/40 px-6 py-2 rounded-xl border border-white/10 flex items-center gap-4 shadow-inner">
                        <div className="text-right">
                            <div className="text-[8px] text-gray-500 uppercase font-black">Dispatch Loop</div>
                            <div className="text-green-500 font-mono text-xs font-bold">ENCRYPTED_NG911</div>
                        </div>
                        <Radio className="text-green-500 w-5 h-5 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
                
                {/* Left: Tactical Radar Map */}
                <div className="col-span-8 bg-black rounded-3xl border border-red-500/20 relative overflow-hidden shadow-2xl flex flex-col">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-red-950/20">
                         <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                             <Satellite className="w-4 h-4" /> Proximity Radar Matrix
                         </h3>
                         <div className="flex bg-black/60 rounded-lg p-1 border border-white/5">
                             {['ALL', 'POLICE', 'FIRE', 'EMS'].map(t => (
                                 <button 
                                    key={t}
                                    onClick={() => setSelectedType(t as any)}
                                    className={`px-3 py-1 rounded text-[8px] font-black transition-all ${selectedType === t ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                 >
                                    {t}
                                 </button>
                             ))}
                         </div>
                    </div>
                    
                    <div className="flex-1 relative flex items-center justify-center p-10">
                        {/* Radar Simulation */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square border border-red-500/30 rounded-full"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square border border-red-500/20 rounded-full"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] aspect-square border border-red-500/10 rounded-full"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full bg-red-500/10"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1px] w-full bg-red-500/10"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full animate-spin-slow">
                                <div className="w-full h-1/2 bg-gradient-to-t from-red-500/10 to-transparent origin-bottom"></div>
                            </div>
                        </div>

                        {/* Central HQ Pin */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-red-600 border-4 border-red-400/50 shadow-[0_0_30px_red] flex items-center justify-center">
                                <ShieldAlert className="w-8 h-8 text-white" />
                            </div>
                            <span className="mt-2 bg-black/80 px-2 py-0.5 rounded border border-red-500/40 text-red-500 font-black text-[9px] uppercase tracking-widest">Aegis_SENTINEL_HQ</span>
                        </div>

                        {/* Service Markers */}
                        {filteredServices.map((svc, i) => {
                            const angle = (i * 72 + (svc.type === 'POLICE' ? 10 : 45)) * (Math.PI / 180);
                            const dist = svc.distance * 35; 
                            return (
                                <div 
                                    key={svc.id} 
                                    className="absolute group/marker cursor-pointer transition-all hover:scale-110"
                                    style={{ 
                                        left: `calc(50% + ${Math.cos(angle) * dist}px)`, 
                                        top: `calc(50% + ${Math.sin(angle) * dist}px)` 
                                    }}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 shadow-lg transition-colors ${
                                        svc.type === 'POLICE' ? 'bg-blue-600 border-blue-400' : 
                                        svc.type === 'FIRE' ? 'bg-orange-600 border-orange-400' : 
                                        'bg-red-500 border-red-300'
                                    }`}>
                                        {svc.type === 'POLICE' ? <Shield className="w-4 h-4 text-white" /> : 
                                         svc.type === 'FIRE' ? <AlertOctagon className="w-4 h-4 text-white" /> : 
                                         <Clock className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/90 border border-white/5 px-2 py-1 rounded opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap z-50">
                                        <div className="text-[10px] font-bold text-white uppercase">{svc.name}</div>
                                        <div className="text-[8px] text-gray-400 font-mono">DIST: {svc.distance}km | ETA: {svc.eta}m</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Dispatch Commitment HUD */}
                <div className="col-span-4 flex flex-col gap-6">
                    <div className="flex-1 bg-aegis-800/40 rounded-3xl border border-red-500/20 p-6 shadow-2xl flex flex-col overflow-hidden relative group">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                            <Send className="w-4 h-4 text-red-500" /> Dispatch Commitment
                        </h3>

                        <div className="flex-1 flex flex-col gap-5 min-h-0">
                            {/* Target Packet */}
                            <div className="bg-black/60 rounded-2xl p-4 border border-white/5 shadow-inner">
                                <div className="text-[8px] text-gray-500 font-black uppercase mb-2 tracking-tighter">Tactical Context Packet</div>
                                {criticalAlert ? (
                                    <div className="flex gap-3">
                                        <div className="w-16 h-16 bg-black rounded-lg border border-red-500/20 overflow-hidden shrink-0">
                                            <img src={criticalAlert.snapshot} className="w-full h-full object-cover grayscale opacity-60" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-bold text-white uppercase truncate">{criticalAlert.threatType}</div>
                                            <div className="text-[9px] text-gray-400 italic line-clamp-2">"{criticalAlert.description}"</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                                <span className="text-[8px] font-mono text-red-400 font-bold uppercase">Biometric_Signature_Attached</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-gray-600 font-mono text-center py-4">NO_ACTIVE_INCIDENT_CONTEXT</p>
                                )}
                            </div>

                            {/* Service Selection */}
                            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1">
                                <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Commitment Queue</div>
                                {filteredServices.slice(0, 3).map(svc => (
                                    <div key={svc.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${svc.type === 'POLICE' ? 'bg-blue-900/50 text-blue-400' : 'bg-red-900/50 text-red-400'}`}>
                                                {svc.type === 'POLICE' ? <Shield className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-white uppercase">{svc.name}</div>
                                                <div className="text-[8px] text-gray-500 font-mono">{svc.eta} MIN RESPONSE</div>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="w-4 h-4 text-green-500/20" />
                                    </div>
                                ))}
                            </div>

                            {/* COMMIT BUTTON */}
                            <div className="mt-auto pt-4 border-t border-white/5">
                                {dispatchStatus === 'IDLE' ? (
                                    <button 
                                        onClick={handleCommitDispatch}
                                        disabled={!isArmed}
                                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-500/20 uppercase text-xs tracking-widest active:scale-95 disabled:opacity-50"
                                    >
                                        <Siren className="w-5 h-5 animate-bounce" /> Commit Emergency Dispatch
                                    </button>
                                ) : dispatchStatus === 'TRANSMITTING' ? (
                                    <div className="w-full py-4 bg-red-900/40 text-red-400 font-black rounded-2xl flex items-center justify-center gap-3 border border-red-500/30">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Synchronizing Vector Data...
                                    </div>
                                ) : (
                                    <div className="w-full py-4 bg-green-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl animate-in zoom-in-95">
                                        <CheckCircle2 className="w-5 h-5" /> Dispatch Authenticated
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Agent Logic Console */}
                    <div className="bg-black/40 rounded-3xl border border-white/5 p-4 shrink-0">
                         <div className="flex items-center gap-2 mb-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-aegis-accent animate-pulse"></div>
                             <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Agentic_Intelligence_Narrative</span>
                         </div>
                         <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                            Aegis Orchestrator is committing a <span className="text-white font-bold">Multi-Agency Tactical Packet</span>. 
                            The packet includes High-Fidelity 2D Bounding Boxes, Suspect Visual DNA (Torso: Blue, Legs: Dark), and real-time GPS Facility Latency coordinates.
                         </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default EmergencyDispatchView;
