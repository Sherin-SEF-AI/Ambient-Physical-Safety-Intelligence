
import React, { useState, useEffect } from 'react';
import { EmployeeProfile, InsiderRiskLevel } from '../types';
import { generateInsiderRiskReport } from '../services/geminiService';
import { UserX, Activity, Lock, FileWarning, ShieldAlert, Search, Terminal, ChevronRight, User } from 'lucide-react';

const InsiderThreatDashboard: React.FC = () => {
    // Persistent State
    const [profiles, setProfiles] = useState<EmployeeProfile[]>(() => {
        try { return JSON.parse(localStorage.getItem('AEGIS_INSIDER_PROFILES') || '[]'); } catch { return []; }
    });

    useEffect(() => localStorage.setItem('AEGIS_INSIDER_PROFILES', JSON.stringify(profiles)), [profiles]);

    const [selectedProfile, setSelectedProfile] = useState<EmployeeProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [logInput, setLogInput] = useState('');

    const handleAnalysis = async () => {
        if (!logInput.trim()) return;
        setLoading(true);
        try {
            const results = await generateInsiderRiskReport(logInput);
            setProfiles(results.sort((a, b) => b.riskScore - a.riskScore));
            if (results.length > 0) setSelectedProfile(results[0]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level: InsiderRiskLevel) => {
        switch(level) {
            case InsiderRiskLevel.CRITICAL: return 'text-red-400 border-red-500/50 bg-red-900/30';
            case InsiderRiskLevel.HIGH: return 'text-orange-400 border-orange-500/50 bg-orange-900/30';
            case InsiderRiskLevel.MODERATE: return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/30';
            default: return 'text-green-400 border-green-500/50 bg-green-900/30';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-red-500';
        if (score >= 70) return 'text-orange-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-green-500';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Input & Employee List */}
            <div className="bg-aegis-800 rounded-xl border border-aegis-700 flex flex-col overflow-hidden shadow-xl">
                <div className="p-4 border-b border-aegis-700 bg-aegis-900/50">
                    <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                        <UserX className="w-4 h-4 text-aegis-accent" />
                        Insider Risk Analysis
                    </h3>
                    
                    {/* Terminal Input */}
                    <div className="bg-black rounded-lg border border-aegis-700 p-2 font-mono text-xs relative overflow-hidden group focus-within:border-aegis-accent transition-colors">
                        <div className="absolute top-2 left-2 text-aegis-accent">$ ingest_logs</div>
                        <textarea
                            value={logInput}
                            onChange={(e) => setLogInput(e.target.value)}
                            placeholder="// Paste system logs here (Access, HR, Network)..."
                            className="w-full h-32 bg-transparent text-green-300 outline-none resize-none pt-6 pl-1 leading-relaxed placeholder:text-gray-700"
                        />
                        <button 
                            onClick={handleAnalysis}
                            disabled={loading || !logInput}
                            className="absolute bottom-2 right-2 bg-aegis-700 hover:bg-aegis-600 text-white text-[10px] font-bold px-3 py-1 rounded flex items-center gap-2 disabled:opacity-50 transition-all border border-aegis-600"
                        >
                            {loading ? <Search className="w-3 h-3 animate-spin" /> : <Terminal className="w-3 h-3" />}
                            {loading ? 'PROCESSING...' : 'RUN'}
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-black/20">
                    {profiles.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-xs text-center px-6">
                            <Activity className="w-8 h-8 mb-2 opacity-30" />
                            No active profiles. Ingest data to begin behavioral analysis.
                        </div>
                    )}
                    {profiles.map(profile => (
                        <div 
                            key={profile.id}
                            onClick={() => setSelectedProfile(profile)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center group ${
                                selectedProfile?.id === profile.id 
                                ? 'bg-aegis-700 border-aegis-accent shadow-lg scale-[1.02]' 
                                : 'bg-aegis-800/50 border-white/5 hover:bg-aegis-700/50 hover:border-white/20'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-black/40 border ${getScoreColor(profile.riskScore).replace('text', 'border')}`}>
                                    <span className={`text-xs font-bold ${getScoreColor(profile.riskScore)}`}>
                                        {profile.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white group-hover:text-aegis-accent transition-colors">{profile.name}</div>
                                    <div className="text-[10px] text-gray-400">{profile.role}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-lg font-bold leading-none ${getScoreColor(profile.riskScore)}`}>{profile.riskScore}</div>
                                <div className="text-[9px] text-gray-500 font-mono mt-1">RISK</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detailed Profile View */}
            <div className="lg:col-span-2 bg-aegis-800 rounded-xl border border-aegis-700 p-8 flex flex-col overflow-y-auto custom-scrollbar shadow-2xl">
                {selectedProfile ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-white/5 pb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">{selectedProfile.name}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wider flex items-center gap-1 ${getRiskColor(selectedProfile.riskLevel)}`}>
                                        <ShieldAlert className="w-3 h-3" />
                                        {selectedProfile.riskLevel} RISK
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 font-mono flex items-center gap-4">
                                    <span>ID: <span className="text-white">{selectedProfile.id}</span></span>
                                    <span>|</span>
                                    <span>DEPT: <span className="text-white">{selectedProfile.department.toUpperCase()}</span></span>
                                </p>
                            </div>
                            <div className="text-center bg-black/40 p-4 rounded-xl border border-white/10 shadow-inner">
                                <div className={`text-4xl font-bold ${getScoreColor(selectedProfile.riskScore)}`}>
                                    {selectedProfile.riskScore}
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase mt-1 tracking-widest">Aggregate Score</div>
                            </div>
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-aegis-900/30 p-5 rounded-xl border border-aegis-700/50">
                                <h4 className="text-gray-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-blue-400" /> Behavioral Baseline
                                </h4>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {selectedProfile.behavioralBaseline}
                                </p>
                            </div>
                            <div className="bg-aegis-900/30 p-5 rounded-xl border border-aegis-700/50">
                                <h4 className="text-gray-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-red-400" /> Anomaly Detection
                                </h4>
                                <p className="text-sm text-white leading-relaxed font-medium">
                                    {selectedProfile.anomalyAnalysis}
                                </p>
                            </div>
                        </div>

                        {/* Risk Factors Timeline */}
                        <div>
                            <h3 className="text-white font-bold text-sm uppercase mb-4 flex items-center gap-2">
                                <FileWarning className="w-4 h-4 text-orange-400" /> Detected Risk Factors
                            </h3>
                            <div className="space-y-3">
                                {selectedProfile.riskFactors.map(factor => (
                                    <div key={factor.id} className="bg-black/20 p-4 rounded-lg border border-white/10 flex gap-4 hover:border-white/20 transition-colors">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor] ${
                                            factor.severity === 'CRITICAL' ? 'bg-red-500 text-red-500' :
                                            factor.severity === 'HIGH' ? 'bg-orange-500 text-orange-500' : 'bg-yellow-500 text-yellow-500'
                                        }`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold text-gray-200 uppercase tracking-wide">{factor.type.replace('_', ' ')}</span>
                                                <span className="text-[10px] text-gray-500 font-mono">{new Date().toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-400">{factor.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Panel */}
                        <div className="bg-red-950/30 border border-red-500/20 p-5 rounded-xl flex justify-between items-center shadow-lg">
                            <div>
                                <h4 className="text-red-400 font-bold text-sm mb-1 uppercase tracking-wider">Recommended Response</h4>
                                <p className="text-sm text-gray-300">{selectedProfile.recommendedAction}</p>
                            </div>
                            <button className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-red-900/20">
                                <Lock className="w-4 h-4" /> EXECUTE PROTOCOL
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 flex-col">
                        <User className="w-16 h-16 mb-6 opacity-20" />
                        <p className="text-lg font-light">Select a profile to view deep analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InsiderThreatDashboard;
