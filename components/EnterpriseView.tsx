
import React, { useState, useEffect } from 'react';
import { Globe, Shield, MapPin, Building2, UserCheck, AlertTriangle, Users, ArrowUpRight, Lock, Eye, Activity, Plus, Radar, Satellite } from 'lucide-react';
import { Site, Principal, GlobalThreat, ExecutiveReport } from '../types';
import { generateGlobalInsights, assessPrincipalSafety } from '../services/geminiService';

const EnterpriseView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'GLOBAL' | 'EXECUTIVE'>('GLOBAL');
    
    // Persistent States
    const [sites, setSites] = useState<Site[]>(() => {
        try { return JSON.parse(localStorage.getItem('AEGIS_ENT_SITES') || '[]'); } catch { return []; }
    });
    const [principals, setPrincipals] = useState<Principal[]>(() => {
        try { return JSON.parse(localStorage.getItem('AEGIS_ENT_PRINCIPALS') || '[]'); } catch { return []; }
    });

    // Effects
    useEffect(() => localStorage.setItem('AEGIS_ENT_SITES', JSON.stringify(sites)), [sites]);
    useEffect(() => localStorage.setItem('AEGIS_ENT_PRINCIPALS', JSON.stringify(principals)), [principals]);

    // Global Intel State
    const [globalThreats, setGlobalThreats] = useState<GlobalThreat[]>([]);
    const [intelInput, setIntelInput] = useState('');
    const [analyzingGlobal, setAnalyzingGlobal] = useState(false);

    // Executive Protection State
    const [selectedPrincipal, setSelectedPrincipal] = useState<Principal | null>(null);
    const [executiveReport, setExecutiveReport] = useState<ExecutiveReport | null>(null);
    const [analyzingPrincipal, setAnalyzingPrincipal] = useState(false);

    // Forms
    const [showSiteForm, setShowSiteForm] = useState(false);
    const [showPrincipalForm, setShowPrincipalForm] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemLoc, setNewItemLoc] = useState('');

    const handleAddSite = () => {
        if (!newItemName || !newItemLoc) return;
        const newSite: Site = {
            id: `SITE-${Date.now().toString().slice(-4)}`,
            name: newItemName,
            location: newItemLoc,
            status: 'NORMAL',
            alertCount: 0,
            coordinates: { lat: 50, lng: 50 } // Default center, allowing CSS to position loosely
        };
        setSites(prev => [...prev, newSite]);
        setNewItemName(''); setNewItemLoc(''); setShowSiteForm(false);
    };

    const handleAddPrincipal = () => {
        if (!newItemName || !newItemLoc) return;
        const newPrincipal: Principal = {
            id: `VIP-${Date.now().toString().slice(-4)}`,
            name: newItemName,
            title: newItemLoc,
            status: 'SECURE',
            currentLocation: { siteId: 'Transit', zone: 'Unknown' },
            protectionLevel: 'STANDARD',
            lastUpdate: 'Just now'
        };
        setPrincipals(prev => [...prev, newPrincipal]);
        setNewItemName(''); setNewItemLoc(''); setShowPrincipalForm(false);
    };

    const handleGlobalAnalysis = async () => {
        if (!intelInput.trim()) return;
        setAnalyzingGlobal(true);
        try {
            const threats = await generateGlobalInsights(intelInput);
            setGlobalThreats(threats);
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzingGlobal(false);
        }
    };

    const handleAnalyzePrincipal = async (p: Principal) => {
        setSelectedPrincipal(p);
        setAnalyzingPrincipal(true);
        try {
            const localContext = `Real-time assessment request for ${p.name}. Current status: ${p.status}.`;
            const report = await assessPrincipalSafety(p, localContext);
            setExecutiveReport(report);
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzingPrincipal(false);
        }
    };

    return (
        <div className="p-6 h-full overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Globe className="text-aegis-accent" />
                        ENTERPRISE OVERWATCH
                    </h1>
                    <p className="text-gray-400 text-sm">Global Security Operations & Executive Protection</p>
                </div>
                <div className="flex bg-aegis-800 rounded-lg p-1 border border-aegis-700">
                    <button 
                        onClick={() => setActiveTab('GLOBAL')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'GLOBAL' ? 'bg-aegis-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Satellite className="w-4 h-4" /> Global Ops
                    </button>
                    <button 
                        onClick={() => setActiveTab('EXECUTIVE')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'EXECUTIVE' ? 'bg-aegis-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Shield className="w-4 h-4" /> Executive Protection
                    </button>
                </div>
            </div>

            {activeTab === 'GLOBAL' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    {/* Map Visualization */}
                    <div className="lg:col-span-2 bg-black rounded-xl border border-aegis-700 relative overflow-hidden group min-h-[500px] shadow-2xl">
                        {/* Map Grid Background */}
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}></div>
                        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 pointer-events-none"></div>

                        {/* Central HUD Element */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-aegis-900/50 rounded-full animate-pulse opacity-20 pointer-events-none"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-aegis-500/20 rounded-full opacity-30 pointer-events-none"></div>
                        
                        {/* Site Markers */}
                        {sites.map((site, idx) => (
                            <div 
                                key={site.id}
                                className="absolute flex flex-col items-center group/marker cursor-pointer transition-transform hover:scale-110"
                                style={{ top: `${20 + (idx * 15)}%`, left: `${20 + (idx * 20)}%` }} // Simple distribution logic since we removed random
                            >
                                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-[0_0_15px_currentColor] ${
                                    site.status === 'ELEVATED' ? 'bg-orange-500 text-orange-500 animate-pulse' : 
                                    site.status === 'LOCKDOWN' ? 'bg-red-500 text-red-500 animate-ping' : 
                                    'bg-green-500 text-green-500'
                                }`}></div>
                                <div className="mt-2 bg-black/80 px-3 py-1.5 rounded border border-white/10 backdrop-blur-sm whitespace-nowrap text-center">
                                    <div className="text-white font-bold text-xs">{site.name}</div>
                                    <div className="text-[9px] text-gray-400 font-mono">{site.location.toUpperCase()}</div>
                                </div>
                            </div>
                        ))}

                        <div className="absolute top-4 left-4 z-10">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <Radar className="text-aegis-accent w-5 h-5" /> Live Site Status
                            </h3>
                            <button 
                                onClick={() => setShowSiteForm(!showSiteForm)}
                                className="mt-2 text-xs bg-aegis-600 px-3 py-1 rounded text-white flex items-center gap-1 hover:bg-aegis-500 shadow-lg"
                            >
                                <Plus className="w-3 h-3"/> Register Site
                            </button>
                        </div>

                        {showSiteForm && (
                            <div className="absolute top-24 left-4 bg-aegis-900/90 p-4 rounded-lg border border-aegis-500 backdrop-blur-md w-64 z-20 shadow-2xl animate-in slide-in-from-left-2">
                                <h4 className="text-white font-bold mb-3 text-sm flex items-center gap-2"><MapPin className="w-3 h-3" /> New Facility</h4>
                                <input className="w-full mb-2 bg-black/50 border border-white/20 rounded px-2 py-1.5 text-sm text-white focus:border-aegis-accent outline-none" placeholder="Site Name" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
                                <input className="w-full mb-3 bg-black/50 border border-white/20 rounded px-2 py-1.5 text-sm text-white focus:border-aegis-accent outline-none" placeholder="Region/City" value={newItemLoc} onChange={e => setNewItemLoc(e.target.value)} />
                                <button onClick={handleAddSite} className="w-full bg-aegis-500 hover:bg-aegis-400 text-white rounded py-2 text-sm font-bold shadow-lg">Confirm Registration</button>
                            </div>
                        )}
                    </div>

                    {/* Cross-Site Intelligence Feed */}
                    <div className="bg-aegis-800 rounded-xl border border-aegis-700 p-6 flex flex-col shadow-xl">
                        <div className="mb-4">
                             <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2 mb-2">
                                <Activity className="text-purple-400" /> Signal Intelligence
                             </h3>
                             <p className="text-xs text-gray-400 mb-3">Ingest unstructured reports from remote facilities to detect coordinated threats.</p>
                             <div className="flex flex-col gap-2">
                                 <textarea 
                                    value={intelInput}
                                    onChange={e => setIntelInput(e.target.value)}
                                    placeholder="// Paste field reports or regional intel..."
                                    className="w-full h-32 bg-black/30 border border-aegis-600 rounded p-3 text-xs text-white resize-none outline-none focus:border-purple-500"
                                 />
                                 <button 
                                    onClick={handleGlobalAnalysis}
                                    disabled={analyzingGlobal || !intelInput}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-3 rounded shadow-lg transition-all"
                                 >
                                     {analyzingGlobal ? 'Analyzing Correlations...' : 'Correlate Threat Vectors'}
                                 </button>
                             </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                            {globalThreats.length === 0 ? (
                                <div className="text-center text-gray-500 py-4 text-xs italic">
                                    No global threat correlations active.
                                </div>
                            ) : (
                                globalThreats.map(threat => (
                                    <div key={threat.id} className="bg-purple-900/10 border border-purple-500/30 p-4 rounded-lg animate-in slide-in-from-right-4 hover:bg-purple-900/20 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold border border-purple-500/30 uppercase tracking-wide">
                                                {threat.type.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] text-gray-500">{new Date(threat.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm text-white font-medium mb-3">{threat.description}</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {threat.affectedSites.map(site => (
                                                <span key={site} className="text-[10px] text-aegis-accent font-mono border border-aegis-700 px-1.5 py-0.5 rounded bg-aegis-900">
                                                    {site}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'EXECUTIVE' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    {/* Principal List */}
                    <div className="bg-aegis-800 rounded-xl border border-aegis-700 p-6 flex flex-col shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Users className="text-aegis-accent" /> VIP Roster
                            </h3>
                            <button onClick={() => setShowPrincipalForm(!showPrincipalForm)} className="bg-aegis-700 p-1.5 rounded hover:bg-aegis-600 transition-colors"><Plus className="w-4 h-4 text-white" /></button>
                        </div>

                        {showPrincipalForm && (
                            <div className="mb-4 bg-aegis-900/80 p-4 rounded-lg border border-aegis-600 animate-in slide-in-from-top-2">
                                <h4 className="text-white font-bold text-xs mb-2">New Principal</h4>
                                <input className="w-full mb-2 bg-black/40 border border-white/10 rounded p-2 text-xs text-white focus:border-aegis-accent outline-none" placeholder="Full Name" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
                                <input className="w-full mb-3 bg-black/40 border border-white/10 rounded p-2 text-xs text-white focus:border-aegis-accent outline-none" placeholder="Title/Role" value={newItemLoc} onChange={e => setNewItemLoc(e.target.value)} />
                                <button onClick={handleAddPrincipal} className="w-full bg-aegis-500 hover:bg-aegis-400 text-white rounded py-2 text-xs font-bold shadow-lg">Secure Profile</button>
                            </div>
                        )}

                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                            {principals.length === 0 && <p className="text-gray-500 text-xs text-center py-10 italic">No Principals registered.</p>}
                            {principals.map(p => (
                                <div 
                                    key={p.id} 
                                    onClick={() => handleAnalyzePrincipal(p)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                        selectedPrincipal?.id === p.id 
                                        ? 'bg-aegis-600 border-aegis-accent shadow-md transform scale-[1.02]' 
                                        : 'bg-black/20 border-white/5 hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-white text-sm">{p.name}</div>
                                            <div className="text-xs text-gray-300">{p.title}</div>
                                        </div>
                                        {p.status === 'SECURE' ? <UserCheck className="text-green-400 w-4 h-4" /> : <AlertTriangle className="text-orange-400 w-4 h-4" />}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-2 font-mono">
                                        <MapPin className="w-3 h-3" />
                                        {p.currentLocation.siteId.toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Threat Assessment Detail */}
                    <div className="lg:col-span-2 bg-aegis-800 rounded-xl border border-aegis-700 p-8 flex flex-col shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                             <h3 className="text-white font-bold flex items-center gap-2">
                                <Shield className="text-aegis-accent" /> Protective Intelligence Assessment
                             </h3>
                        </div>

                        {!selectedPrincipal ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                <Lock className="w-16 h-16 opacity-10 mb-4" />
                                <p>Select a Principal to initiate threat assessment</p>
                            </div>
                        ) : analyzingPrincipal ? (
                             <div className="flex-1 flex flex-col items-center justify-center text-aegis-accent">
                                <Eye className="w-16 h-16 animate-pulse mb-6" />
                                <p className="font-mono text-lg">Analyzing Proximity Threats...</p>
                            </div>
                        ) : executiveReport ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-black/30 p-5 rounded-xl border border-white/10">
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Dynamic Risk Score</span>
                                        <div className="flex items-end gap-2 mt-2">
                                            <span className={`text-4xl font-bold ${
                                                executiveReport.threatScore > 70 ? 'text-red-500' :
                                                executiveReport.threatScore > 40 ? 'text-orange-500' : 'text-green-500'
                                            }`}>
                                                {executiveReport.threatScore}
                                            </span>
                                            <span className="text-sm text-gray-500 mb-1">/ 100</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/30 p-5 rounded-xl border border-white/10">
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Status</span>
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className={`w-3 h-3 rounded-full ${selectedPrincipal.status === 'SECURE' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-orange-500 animate-pulse shadow-[0_0_10px_#f97316]'}`}></div>
                                            <span className="text-white font-bold text-lg">{selectedPrincipal.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-aegis-900/50 p-6 rounded-xl border border-aegis-700">
                                    <h4 className="text-aegis-accent font-bold mb-3 uppercase text-xs tracking-wider">Intelligence Narrative</h4>
                                    <p className="text-gray-300 leading-relaxed text-sm">
                                        {executiveReport.narrative}
                                    </p>
                                </div>

                                {executiveReport.nearbyThreats.length > 0 && (
                                    <div>
                                        <h4 className="text-white font-bold text-sm uppercase mb-3">Identified Proximity Threats</h4>
                                        <div className="space-y-2">
                                            {executiveReport.nearbyThreats.map((threat, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-red-900/10 border border-red-500/20 p-4 rounded-lg text-sm text-red-200">
                                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                                    {threat}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <button className="w-full py-4 bg-aegis-600 hover:bg-aegis-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.01]">
                                        <ArrowUpRight className="w-5 h-5" />
                                        EXECUTE: {executiveReport.recommendedAction}
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnterpriseView;
