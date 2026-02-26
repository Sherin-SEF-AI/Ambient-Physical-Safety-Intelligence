
import React, { useState, useEffect } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { Guard, PatrolDirective, AppView } from '../types';
import { generatePatrolDirectives } from '../services/geminiService';
import { Map, Radio, Navigation2, RefreshCw, ShieldAlert, Footprints, Plus, UserPlus, Heart, Video } from 'lucide-react';

const PatrolCommand: React.FC = () => {
    const { cameras } = useSecurity();
    const [optimizing, setOptimizing] = useState(false);
    
    // Persistent State
    const [guards, setGuards] = useState<Guard[]>(() => {
        try { return JSON.parse(localStorage.getItem('AEGIS_PATROL_GUARDS') || '[]'); } catch { return []; }
    });
    const [directives, setDirectives] = useState<PatrolDirective[]>(() => {
        try { return JSON.parse(localStorage.getItem('AEGIS_PATROL_DIRECTIVES') || '[]'); } catch { return []; }
    });

    useEffect(() => localStorage.setItem('AEGIS_PATROL_GUARDS', JSON.stringify(guards)), [guards]);
    useEffect(() => localStorage.setItem('AEGIS_PATROL_DIRECTIVES', JSON.stringify(directives)), [directives]);

    // Add Guard Form
    const [newGuardName, setNewGuardName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddGuard = () => {
        if (!newGuardName.trim()) return;
        const newGuard: Guard = {
            id: `G-${Date.now().toString().slice(-4)}`,
            name: newGuardName,
            currentZone: 'Stationary',
            status: 'STATIONARY',
            batteryLevel: 100,
            lastCheckIn: 'Now',
            heartRate: 75 + Math.floor(Math.random() * 10), // Simulated
            bodyCamActive: true
        };
        setGuards(prev => [...prev, newGuard]);
        setNewGuardName('');
        setIsAdding(false);
    };

    const handleOptimize = async () => {
        if (guards.length === 0) return;
        setOptimizing(true);
        try {
            const results = await generatePatrolDirectives(guards, cameras);
            setDirectives(results);
            
            // Simulate guards responding
            setGuards(prev => prev.map(g => {
                const directive = results.find(d => d.guardId === g.id);
                return directive ? { 
                    ...g, 
                    status: 'RESPONDING', 
                    currentZone: `Moving to ${directive.targetZone}`,
                    heartRate: (g.heartRate || 80) + 15 // Increased HR during response
                } : g;
            }));

        } catch (e) {
            console.error(e);
        } finally {
            setOptimizing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Map View */}
            <div className="bg-aegis-800 rounded-xl border border-aegis-700 p-6 flex flex-col relative overflow-hidden group">
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Map className="text-aegis-accent" />
                        Live Sector Map
                    </h3>
                    <span className="text-xs bg-black/40 px-2 py-1 rounded text-green-400 font-mono border border-green-500/30 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        LIVE TRACKING
                    </span>
                </div>

                {/* Simulated Grid Map - Dynamically reacts to guards */}
                <div className="flex-1 bg-aegis-900/50 rounded-lg border border-aegis-700/50 relative p-4 grid grid-cols-2 gap-4">
                     <div className="border border-white/10 rounded p-2 bg-white/5 relative hover:border-aegis-500 transition-colors">
                        <span className="text-[10px] text-gray-500 uppercase absolute top-2 left-2">ZONE A</span>
                        {guards.filter(g => g.currentZone.includes('A') || g.status === 'STATIONARY').map(g => (
                            <div key={g.id} className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white text-xs font-bold shadow-[0_0_10px_blue]" title={g.name}>
                                {g.name.charAt(0)}
                            </div>
                        ))}
                    </div>
                     <div className="border border-red-500/20 rounded p-2 bg-red-900/10 relative hover:border-red-500 transition-colors">
                        <span className="text-[10px] text-red-400 uppercase absolute top-2 left-2 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> CRITICAL</span>
                         {guards.filter(g => g.currentZone.includes('CRITICAL') || g.status === 'RESPONDING').map(g => (
                            <div key={g.id} className="absolute bottom-2 left-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white text-xs font-bold animate-pulse" title={g.name}>
                                {g.name.charAt(0)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Directives & Guard List */}
            <div className="bg-aegis-800 rounded-xl border border-aegis-700 flex flex-col">
                <div className="p-6 border-b border-aegis-700 flex justify-between items-center bg-aegis-900/30">
                     <h3 className="text-white font-bold flex items-center gap-2">
                        <Radio className="text-aegis-accent" />
                        Patrol Command
                    </h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsAdding(!isAdding)}
                            className="px-3 py-1.5 bg-aegis-700 hover:bg-aegis-600 text-white text-xs font-bold rounded flex items-center gap-2 transition-all"
                        >
                            <UserPlus className="w-3 h-3" />
                            ADD UNIT
                        </button>
                        <button 
                            onClick={handleOptimize}
                            disabled={optimizing || guards.length === 0}
                            className="px-3 py-1.5 bg-aegis-600 hover:bg-aegis-500 text-white text-xs font-bold rounded flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3 h-3 ${optimizing ? 'animate-spin' : ''}`} />
                            AI OPTIMIZE
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                    
                    {/* Add Guard Form */}
                    {isAdding && (
                        <div className="bg-aegis-900/50 p-3 rounded-lg border border-aegis-500/50 animate-in slide-in-from-top-2">
                            <h4 className="text-xs font-bold text-gray-400 mb-2">Register New Unit</h4>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newGuardName}
                                    onChange={(e) => setNewGuardName(e.target.value)}
                                    placeholder="Officer Name"
                                    className="flex-1 bg-black/30 border border-aegis-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-aegis-accent"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddGuard()}
                                />
                                <button onClick={handleAddGuard} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Active Directives */}
                    {directives.length > 0 && (
                        <div className="mb-6 space-y-2">
                            <h4 className="text-xs font-bold text-aegis-accent uppercase tracking-wider mb-2">Active Directives</h4>
                            {directives.map(dir => (
                                <div key={dir.id} className="bg-aegis-500/10 border border-aegis-500/30 p-3 rounded-lg flex items-start gap-3 animate-in slide-in-from-right-2">
                                    <div className="mt-1 bg-aegis-500/20 p-1.5 rounded-full">
                                        <Navigation2 className="w-4 h-4 text-aegis-accent" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-white font-bold flex items-center gap-2">
                                            {guards.find(g => g.id === dir.guardId)?.name} 
                                            <span className="text-gray-500">→</span> 
                                            <span className="text-aegis-accent">{dir.targetZone}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{dir.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Guard Roster */}
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Unit Status & Telemetry</h4>
                    {guards.length === 0 ? (
                        <div className="text-center text-gray-500 text-xs py-4">No active patrol units registered.</div>
                    ) : (
                        guards.map(guard => (
                            <div key={guard.id} className="bg-black/20 p-3 rounded-lg border border-white/5 flex justify-between items-center group hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${guard.status === 'PATROLLING' || guard.status === 'RESPONDING' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-200">{guard.name}</div>
                                        <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
                                            <Footprints className="w-3 h-3" />
                                            {guard.currentZone}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                     <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1 text-[10px] text-red-400 font-mono" title="Heart Rate">
                                            <Heart className="w-3 h-3" /> {guard.heartRate || '--'} BPM
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-blue-400 font-mono" title="Body Cam">
                                            <Video className="w-3 h-3" /> {guard.bodyCamActive ? 'REC' : 'OFF'}
                                        </div>
                                     </div>
                                    <div>
                                        <div className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white font-mono mb-1">{guard.status}</div>
                                        <div className="text-[9px] text-gray-500 text-right">BAT: {guard.batteryLevel}%</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatrolCommand;
