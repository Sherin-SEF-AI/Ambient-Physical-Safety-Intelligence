
import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { Settings, Cpu, Building2, School, Landmark, Home, Factory, Hospital, Clock, Gauge, Plus, Trash2, Key, Check } from 'lucide-react';
import { EnvironmentType, AdaptiveProfile } from '../types';

const SettingsView: React.FC = () => {
    const { detectionMode, setDetectionMode, facilityType, setFacilityType, adaptiveProfiles, addAdaptiveProfile, removeAdaptiveProfile, cameras, apiKey, setApiKey } = useSecurity();
    const [isCreatingProfile, setIsCreatingProfile] = useState(false);
    
    // API Key State
    const [tempKey, setTempKey] = useState(apiKey);
    const [keySaved, setKeySaved] = useState(false);

    // New Profile Form State
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileTarget, setNewProfileTarget] = useState('ALL');
    const [newProfileStart, setNewProfileStart] = useState('22:00');
    const [newProfileEnd, setNewProfileEnd] = useState('06:00');
    const [newProfileSensitivity, setNewProfileSensitivity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM'>('HIGH');

    const handleCreateProfile = () => {
        if (!newProfileName) return;
        const profile: AdaptiveProfile = {
            id: `PROF-${Date.now()}`,
            name: newProfileName,
            targetCameraId: newProfileTarget,
            schedule: { startTime: newProfileStart, endTime: newProfileEnd },
            sensitivity: newProfileSensitivity,
            isActive: true
        };
        addAdaptiveProfile(profile);
        setIsCreatingProfile(false);
        setNewProfileName('');
    };

    const handleSaveKey = () => {
        setApiKey(tempKey);
        setKeySaved(true);
        setTimeout(() => setKeySaved(false), 2000);
    }

    const facilityOptions = [
        { id: EnvironmentType.CORPORATE, label: 'Corporate / Office', icon: Building2, desc: 'Tailgating, data theft, after-hours access.' },
        { id: EnvironmentType.EDUCATION, label: 'School / Campus', icon: School, desc: 'Active shooter, fights/bullying, vaping, perimeter breach.' },
        { id: EnvironmentType.HEALTHCARE, label: 'Hospital / Clinic', icon: Hospital, desc: 'Aggressive patients, drug theft, infant abduction protocols.' },
        { id: EnvironmentType.INDUSTRIAL, label: 'Industrial / Plant', icon: Factory, desc: 'PPE violations, man-down, fire/smoke, machinery safety.' },
        { id: EnvironmentType.PUBLIC_SPACE, label: 'Public / Transit', icon: Landmark, desc: 'Crowd crush, unattended bags (IED), pickpocketing.' },
        { id: EnvironmentType.RESIDENTIAL, label: 'Residential / Gated', icon: Home, desc: 'Porch piracy, vehicle break-ins, home invasion.' },
    ];

    return (
        <div className="p-6 h-full overflow-y-auto">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="text-aegis-accent" />
                SYSTEM CONFIGURATION
            </h1>

            <div className="grid grid-cols-1 gap-8">
                
                {/* System Integrity & API Key */}
                <div className="bg-aegis-800 p-6 rounded-xl border border-aegis-700 shadow-2xl">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Key className="text-aegis-accent w-5 h-5" />
                        System Integrity & API Key
                    </h3>
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Gemini API Key</label>
                        <div className="flex gap-2">
                            <input 
                                type="password" 
                                value={tempKey} 
                                onChange={(e) => setTempKey(e.target.value)} 
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-aegis-accent outline-none font-mono"
                                placeholder="Enter your Gemini API Key"
                            />
                            <button 
                                onClick={handleSaveKey}
                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${keySaved ? 'bg-green-600 text-white' : 'bg-aegis-600 hover:bg-aegis-500 text-white'}`}
                            >
                                {keySaved ? <Check className="w-4 h-4" /> : 'Update Key'}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2">
                            Enter a valid Gemini API key to enable visual reasoning capabilities. This key is stored locally in your browser session.
                        </p>
                    </div>
                </div>

                {/* Adaptive Profiles Section */}
                <div className="bg-aegis-800 p-6 rounded-xl border border-aegis-700 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Clock className="text-aegis-accent w-5 h-5" />
                            Adaptive Intelligence Profiles
                        </h3>
                        <button 
                            onClick={() => setIsCreatingProfile(!isCreatingProfile)}
                            className="bg-aegis-600 hover:bg-aegis-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
                        >
                            <Plus className="w-3 h-3" /> New Profile
                        </button>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-6">
                        Configure time-based sensitivity rules for specific zones. The Agent uses these profiles to dynamically adjust threat detection thresholds.
                    </p>

                    {isCreatingProfile && (
                        <div className="bg-black/20 p-4 rounded-xl border border-aegis-500/30 mb-6 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Profile Name</label>
                                    <input value={newProfileName} onChange={e => setNewProfileName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-aegis-accent outline-none" placeholder="e.g. Night Shift Lobby" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Target Zone</label>
                                    <select value={newProfileTarget} onChange={e => setNewProfileTarget(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-aegis-accent outline-none">
                                        <option value="ALL">All Cameras</option>
                                        {cameras.map(cam => <option key={cam.id} value={cam.name}>{cam.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Active Schedule</label>
                                    <div className="flex items-center gap-2">
                                        <input type="time" value={newProfileStart} onChange={e => setNewProfileStart(e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-2 text-sm text-white outline-none" />
                                        <span className="text-gray-500 text-xs">to</span>
                                        <input type="time" value={newProfileEnd} onChange={e => setNewProfileEnd(e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-2 text-sm text-white outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Sensitivity Level</label>
                                    <div className="flex gap-2">
                                        {(['LOW', 'MEDIUM', 'HIGH', 'MAXIMUM'] as const).map(level => (
                                            <button 
                                                key={level}
                                                onClick={() => setNewProfileSensitivity(level)}
                                                className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${newProfileSensitivity === level ? 'bg-aegis-600 border-aegis-accent text-white' : 'bg-black/20 border-white/5 text-gray-500 hover:text-white'}`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsCreatingProfile(false)} className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                                <button onClick={handleCreateProfile} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded shadow-lg transition-all">Save Profile</button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adaptiveProfiles.map(profile => (
                            <div key={profile.id} className="bg-black/20 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group relative">
                                <button onClick={() => removeAdaptiveProfile(profile.id)} className="absolute top-2 right-2 p-1.5 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-white text-sm">{profile.name}</div>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                                        profile.sensitivity === 'HIGH' || profile.sensitivity === 'MAXIMUM' ? 'text-red-400 border-red-500/30 bg-red-900/10' :
                                        profile.sensitivity === 'LOW' ? 'text-green-400 border-green-500/30 bg-green-900/10' :
                                        'text-yellow-400 border-yellow-500/30 bg-yellow-900/10'
                                    }`}>
                                        {profile.sensitivity} SENS
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Clock className="w-3 h-3" /> {profile.schedule.startTime} - {profile.schedule.endTime}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Gauge className="w-3 h-3" /> Target: {profile.targetCameraId === 'ALL' ? 'Global Grid' : profile.targetCameraId}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Neural Config Section */}
                <div className="bg-aegis-800 p-6 rounded-xl border border-aegis-700 shadow-2xl">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Cpu className="text-aegis-accent w-5 h-5" />
                        Neural Engine Parameters
                    </h3>
                    
                    <div className="space-y-8">
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sentinel Mode</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { id: 'ULTRA_FAST', label: 'Ultra Fast', desc: '400ms latency / Speed optimized' },
                                    { id: 'BALANCED', label: 'Balanced', desc: '1.2s latency / Detailed HUD' },
                                    { id: 'DETAILED', label: 'Detailed', desc: '4s latency / Pro-3 Reasoning' }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setDetectionMode(mode.id as any)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all group ${
                                            detectionMode === mode.id 
                                            ? 'bg-aegis-600 border-aegis-accent shadow-[0_0_20px_rgba(0,240,255,0.2)]' 
                                            : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'
                                        }`}
                                    >
                                        <div className={`text-sm font-black mb-1 ${detectionMode === mode.id ? 'text-white' : 'text-gray-400'}`}>
                                            {mode.label.toUpperCase()}
                                        </div>
                                        <div className="text-[10px] opacity-60 font-mono">{mode.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Environmental Selection */}
                        <div className="flex flex-col gap-3 border-t border-white/5 pt-6">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Facility Intelligence Profile</label>
                            <p className="text-xs text-gray-400 mb-2">Changing this profile recalibrates the AI's threat logic (e.g., "running" is playful in a park but critical in a hospital).</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {facilityOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setFacilityType(opt.id)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all flex gap-4 items-center group ${
                                            facilityType === opt.id 
                                            ? 'bg-aegis-700/50 border-aegis-accent text-white shadow-lg' 
                                            : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${facilityType === opt.id ? 'bg-aegis-600' : 'bg-white/5'}`}>
                                            <opt.icon className={`w-6 h-6 ${facilityType === opt.id ? 'text-white' : 'text-gray-600'}`} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold uppercase tracking-tight">{opt.label}</div>
                                            <div className="text-[10px] opacity-60 italic leading-tight mt-1">{opt.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#050810] p-6 rounded-xl border border-white/5 font-mono text-[11px] text-gray-500 shadow-inner">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-aegis-accent font-bold mb-2 uppercase">Core Latency Stats</div>
                            <div className="space-y-1">
                                <div>Ingress Pipeline: Active</div>
                                <div>Context Window: Multi-Frame (5000 tokens)</div>
                                <div>Facility Awareness: {(facilityType || '').replace('_', ' ')}</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-purple-400 font-bold mb-2 uppercase">Neural Ingress Profile</div>
                            <div className="space-y-1">
                                <div>Frame Compression: 0.6 QP</div>
                                <div>Inference Backend: Gemini-3-Pro</div>
                                <div>Response Format: Strict_JSON_v2</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SettingsView;
