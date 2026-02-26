
import React, { useState, useEffect, useMemo } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { generatePatternInsights, generateOccupancyTrends, generateThreatSignatures } from '../services/geminiService';
import { PatternInsight, FeedbackType, OccupancyTrendPoint, ThreatSignature, Severity } from '../types';
import { TrendingUp, Target, Zap, UserX, Network, BrainCircuit, RefreshCw, BarChart3, Users, Clock, AlertTriangle, Book, Fingerprint, Activity, CheckCircle, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import InsiderThreatDashboard from './InsiderThreatDashboard';

const AnalyticsView: React.FC = () => {
  const { alerts, stats, threatSignatures, addThreatSignature, toggleThreatSignature } = useSecurity();
  const [activeTab, setActiveTab] = useState<'PATTERNS' | 'INSIDER' | 'OCCUPANCY' | 'LIBRARY'>('PATTERNS');
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvolvingLibrary, setIsEvolvingLibrary] = useState(false);
  
  // Occupancy State
  const [occupancyTrends, setOccupancyTrends] = useState<OccupancyTrendPoint[]>([]);

  // Dynamic Feedback Data from Real Alerts
  const feedbackData = useMemo(() => {
    return [
        { name: 'True Positive', value: alerts.filter(a => a.feedback === FeedbackType.TRUE_POSITIVE).length },
        { name: 'False Positive', value: alerts.filter(a => a.feedback === FeedbackType.FALSE_POSITIVE).length },
        { name: 'Correction', value: alerts.filter(a => a.feedback === FeedbackType.NEEDS_CORRECTION).length },
    ];
  }, [alerts]);

  // Dynamic Session Activity (Alerts per minute)
  const sessionActivityData = useMemo(() => {
    // Group alerts by minute
    const buckets: Record<string, number> = {};
    const now = new Date();
    // Initialize last 30 minutes with 0
    for(let i=29; i>=0; i--) {
        const d = new Date(now.getTime() - i * 60000);
        const key = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        buckets[key] = 0;
    }

    alerts.forEach(a => {
        const d = new Date(a.timestamp);
        const key = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        if (buckets[key] !== undefined) {
            buckets[key]++;
        }
    });

    return Object.keys(buckets).map(key => ({
        time: key,
        count: buckets[key]
    }));
  }, [alerts]);

  const handleGenerateInsights = async () => {
    if (alerts.length === 0) return;
    setIsGenerating(true);
    try {
        const results = await generatePatternInsights(alerts);
        setInsights(results);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleEvolveLibrary = async () => {
      setIsEvolvingLibrary(true);
      try {
          // Prioritize Critical and High severity alerts for signature generation
          // Get the last 20 most critical events to ensure high-fidelity threat modeling
          const criticalContext = alerts
            .filter(a => a.severity === Severity.CRITICAL || a.severity === Severity.HIGH)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) // Newest first
            .slice(0, 20);
          
          // Use critical context if available, otherwise fallback to recent history to avoid empty input
          const context = criticalContext.length > 0 ? criticalContext : alerts.slice(0, 20);

          const results = await generateThreatSignatures(context);
          results.forEach(sig => addThreatSignature(sig));
      } catch (e) {
          console.error("Evolution Failed", e);
      } finally {
          setIsEvolvingLibrary(false);
      }
  };

  useEffect(() => {
    if (alerts.length > 5 && activeTab === 'PATTERNS' && insights.length === 0) {
        handleGenerateInsights();
    }
    if (activeTab === 'OCCUPANCY' && occupancyTrends.length === 0) {
        setOccupancyTrends(generateOccupancyTrends());
    }
  }, [activeTab, alerts.length]);

  return (
    <div className="p-6 h-full overflow-y-auto flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="text-aegis-accent" />
            INTELLIGENCE CORE
          </h1>
          <p className="text-gray-400 text-sm">Continuous Learning & Strategic Analytics</p>
        </div>
        
        <div className="bg-aegis-800 p-1 rounded-lg border border-aegis-700 flex">
             <button 
                onClick={() => setActiveTab('PATTERNS')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'PATTERNS' ? 'bg-aegis-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
                <Network className="w-4 h-4" /> Global Patterns
            </button>
            <button 
                onClick={() => setActiveTab('LIBRARY')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'LIBRARY' ? 'bg-aegis-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
                <Book className="w-4 h-4" /> Threat Library
            </button>
            <button 
                onClick={() => setActiveTab('INSIDER')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'INSIDER' ? 'bg-aegis-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
                <UserX className="w-4 h-4" /> Insider Threat
            </button>
            <button 
                onClick={() => setActiveTab('OCCUPANCY')}
                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'OCCUPANCY' ? 'bg-aegis-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
                <BarChart3 className="w-4 h-4" /> Occupancy
            </button>
        </div>
      </div>

      {activeTab === 'PATTERNS' && (
        <div className="flex flex-col gap-6">
            <div className="flex justify-end">
                <button 
                    onClick={handleGenerateInsights}
                    disabled={isGenerating || alerts.length === 0}
                    className="px-4 py-2 bg-aegis-800 hover:bg-aegis-700 text-aegis-accent rounded border border-aegis-700 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    Run Pattern Analysis
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Model Performance */}
                <div className="bg-aegis-800 rounded-xl border border-aegis-700 p-6 flex flex-col min-h-[300px]">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase">
                        <Target className="w-4 h-4 text-green-400" />
                        Feedback Accuracy
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                            <BarChart data={feedbackData}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {feedbackData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4ade80' : index === 1 ? '#ef4444' : '#f59e0b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Session Activity */}
                <div className="bg-aegis-800 rounded-xl border border-aegis-700 p-6 flex flex-col lg:col-span-2 min-h-[300px]">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        Session Alert Volume (Last 30m)
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                            <AreaChart data={sessionActivityData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="count" stroke="#00F0FF" fillOpacity={1} fill="url(#colorCount)" name="Alerts" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Pattern Discovery Results */}
            <div className="bg-aegis-800 rounded-xl border border-aegis-700 flex flex-col overflow-hidden min-h-[300px]">
                <div className="p-4 border-b border-aegis-700 bg-aegis-900/50 flex justify-between items-center">
                    <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Emerging Pattern Discovery
                    </h3>
                    {isGenerating && <span className="text-xs text-aegis-accent animate-pulse">Running Deep Analysis...</span>}
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {insights.length === 0 && !isGenerating ? (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No emerging patterns detected.</p>
                            <p className="text-xs mt-1">
                                {alerts.length < 5 ? "Wait for more alerts to accumulate data." : "No anomalies found in current dataset."}
                            </p>
                        </div>
                    ) : (
                        insights.map((insight) => (
                            <div key={insight.id} className="bg-black/20 rounded-lg p-4 border border-aegis-700 hover:border-aegis-500 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        insight.type === 'NOVEL_THREAT' ? 'bg-red-500/20 text-red-400' :
                                        insight.type === 'BASELINE_DRIFT' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {insight.type.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs font-mono text-gray-500">{insight.confidence}% CONF</span>
                                </div>
                                <h4 className="text-white font-bold text-sm mb-1">{insight.title}</h4>
                                <p className="text-xs text-gray-400 mb-3 leading-relaxed">{insight.description}</p>
                                <div className="text-[10px] text-aegis-accent bg-aegis-500/10 p-2 rounded border border-aegis-500/20">
                                    <span className="font-bold">ADJUSTMENT:</span> {insight.recommendedAdjustment}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}

      {activeTab === 'LIBRARY' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-6">
                      <div className="bg-aegis-800 px-6 py-4 rounded-xl border border-aegis-700 shadow-xl">
                          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Knowledge Base Size</div>
                          <div className="text-3xl font-black text-white">{threatSignatures.length}</div>
                      </div>
                      <div className="bg-aegis-800 px-6 py-4 rounded-xl border border-aegis-700 shadow-xl">
                          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Active Protocols</div>
                          <div className="text-3xl font-black text-green-400">{threatSignatures.filter(s => s.active).length}</div>
                      </div>
                  </div>
                  
                  <button 
                    onClick={handleEvolveLibrary}
                    disabled={isEvolvingLibrary}
                    className="group bg-aegis-600 hover:bg-aegis-500 text-white px-8 py-6 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.2)] border border-aegis-400 transition-all flex flex-col items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                      {isEvolvingLibrary ? <Loader2 className="w-6 h-6 animate-spin" /> : <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                      <span className="text-xs font-black uppercase tracking-widest">Evolve Threat Library</span>
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                  {threatSignatures.length === 0 && (
                      <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-white/5 rounded-3xl">
                          <Book className="w-16 h-16 mb-4 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest">Library Empty</p>
                          <p className="text-xs mt-1">Run evolution to learn from alert history.</p>
                      </div>
                  )}
                  {threatSignatures.map(sig => (
                      <div key={sig.id} className={`bg-aegis-800 rounded-2xl border transition-all p-5 shadow-lg group relative ${sig.active ? 'border-aegis-500 ring-1 ring-aegis-500/20' : 'border-aegis-700 opacity-80 hover:opacity-100'}`}>
                          <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${sig.type === 'BEHAVIORAL' ? 'bg-blue-500/20 text-blue-400' : sig.type === 'SPATIAL' ? 'bg-orange-500/20 text-orange-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                      {sig.type === 'BEHAVIORAL' ? <Activity className="w-5 h-5" /> : sig.type === 'SPATIAL' ? <Target className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                  </div>
                                  <div>
                                      <h4 className="text-white font-bold text-sm leading-tight">{sig.name}</h4>
                                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">{sig.type}</span>
                                  </div>
                              </div>
                              <button onClick={() => toggleThreatSignature(sig.id)} className={`transition-all ${sig.active ? 'text-green-400' : 'text-gray-600 hover:text-white'}`}>
                                  {sig.active ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                              </button>
                          </div>
                          
                          <p className="text-xs text-gray-400 leading-relaxed mb-4 h-12 overflow-hidden">{sig.description}</p>
                          
                          <div className="space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                  <span>Maturity</span>
                                  <span className="text-white">{sig.maturity}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-aegis-600 to-aegis-400" style={{ width: `${sig.maturity}%` }}></div>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                  {sig.tags.map(tag => (
                                      <span key={tag} className="text-[9px] bg-white/5 px-2 py-1 rounded text-gray-400 font-mono border border-white/5">{tag}</span>
                                  ))}
                              </div>
                          </div>
                          
                          {sig.active && (
                              <div className="absolute top-0 right-0 p-2">
                                  <span className="flex h-2 w-2 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'INSIDER' && (
        <div className="flex-1 min-h-[500px]">
            <InsiderThreatDashboard />
        </div>
      )}

      {activeTab === 'OCCUPANCY' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4">
              {/* Real-time Metric */}
              <div className="lg:col-span-1 space-y-6">
                  <div className="bg-aegis-800 rounded-xl border border-aegis-700 p-6 relative overflow-hidden">
                      <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2 mb-4">
                          <Users className="w-4 h-4 text-blue-400" />
                          Real-Time Occupancy
                      </h3>
                      <div className="flex items-end gap-3 mb-2 relative z-10">
                          <span className="text-5xl font-bold text-white">{stats.occupancy}</span>
                          <span className="text-gray-500 mb-1 font-mono">/ 50 CAP</span>
                      </div>
                      <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden mb-4 relative z-10">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${stats.occupancy > 40 ? 'bg-red-500' : stats.occupancy > 25 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                            style={{width: `${Math.min(100, (stats.occupancy / 50) * 100)}%`}}
                          ></div>
                      </div>
                      {stats.occupancy > 40 && (
                          <div className="flex items-center gap-2 text-red-400 text-xs font-bold animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> OVERCROWDING RISK
                          </div>
                      )}
                      {/* Background Chart Element */}
                      <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                          <Users className="w-32 h-32" />
                      </div>
                  </div>

                  <div className="bg-aegis-800 rounded-xl border border-aegis-700 p-6">
                      <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2 mb-4">
                          <Clock className="w-4 h-4 text-aegis-accent" />
                          Utilization Metrics
                      </h3>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="text-gray-400 text-xs">Peak Hour</span>
                              <span className="text-white font-mono text-sm">13:00</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="text-gray-400 text-xs">Avg Dwell Time</span>
                              <span className="text-white font-mono text-sm">18m 30s</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="text-gray-400 text-xs">Flow Rate</span>
                              <span className="text-white font-mono text-sm">12 / min</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Trend Chart */}
              <div className="lg:col-span-2 bg-aegis-800 rounded-xl border border-aegis-700 p-6 flex flex-col min-h-[400px]">
                  <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2 mb-6">
                      <BarChart3 className="w-4 h-4 text-aegis-accent" />
                      Daily Occupancy Trend
                  </h3>
                  <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                          <LineChart data={occupancyTrends}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                              <Tooltip 
                                  contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #3B82F6', borderRadius: '8px' }}
                                  itemStyle={{ color: '#fff' }}
                              />
                              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} dot={{r:4, fill:'#0B1120', strokeWidth:2}} />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded text-xs text-blue-300">
                      <strong>Analysis:</strong> Occupancy peaks between 12:00 and 14:00. Utilization is 15% higher than last week average. Consider adjusting staffing during lunch hours.
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AnalyticsView;
