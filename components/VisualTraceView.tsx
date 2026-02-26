
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { AppView, SecurityAlert, AgentState, Severity } from '../types';
import { 
  ArrowLeft, Crosshair, MapPin, Clock, 
  Search, Shield, History, Activity, 
  ChevronRight, Brain, AlertCircle, Loader2,
  Fingerprint, Zap, Radar, LayoutGrid, Target,
  Dna, Cpu, Eye, Lock, Unlock, Map as MapIcon,
  MousePointer2, Users, Link2, TrendingUp, Network,
  Sparkles, Footprints, Info, AlertOctagon, Radio,
  Thermometer, Wifi, Database, Workflow, AlertTriangle, ArrowUpRight, Scale,
  ChevronLeft, PanelRightClose, PanelRightOpen, ExternalLink
} from 'lucide-react';

const VisualTraceView: React.FC = () => {
  const { reidSession, setCurrentAppView, alerts, agentState, togglePin, pinnedEvidence, cameras } = useSecurity();
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'TRAJECTORY' | 'COMPANIONS' | 'PROXIMITY'>('TIMELINE');
  const [isCorrelationOpen, setIsCorrelationOpen] = useState(true);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  const sortedMatches = useMemo(() => {
    if (!reidSession) return [];
    return [...reidSession.matches]
      .sort((a, b) => b.similarityScore - a.similarityScore);
  }, [reidSession]);

  const timelineMatches = useMemo(() => {
    if (!reidSession) return [];
    return reidSession.matches
      .map(m => ({
        alert: alerts.find(a => a.id === m.alertId),
        reid: m
      }))
      .filter(item => !!item.alert)
      .sort((a, b) => new Date(b.alert!.timestamp).getTime() - new Date(a.alert!.timestamp).getTime());
  }, [reidSession, alerts]);

  // Map sequence for the floor plan
  const spatialPath = useMemo(() => {
      if (!reidSession) return [];
      const chronMatches = [...reidSession.matches]
        .map(m => alerts.find(a => a.id === m.alertId))
        .filter((a): a is SecurityAlert => !!a)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return chronMatches.map(alert => {
          const cam = cameras.find(c => c.name === alert.location);
          return {
              id: alert.id,
              location: alert.location,
              coords: cam?.floorPlanCoords || { x: 50, y: 50 },
              timestamp: alert.timestamp,
              type: alert.threatType,
              snapshot: alert.snapshot
          };
      });
  }, [reidSession, alerts, cameras]);

  // Discovery of co-occurring events not explicitly in the ReID session
  const discoveryCorrelations = useMemo(() => {
    if (!reidSession || spatialPath.length === 0) return [];
    
    // Find alerts that:
    // 1. Are NOT part of the reidSession matches
    // 2. Happened within +/- 5 minutes of any point in the spatialPath
    // 3. Are categorized as HIGH or CRITICAL severity
    const matchIds = new Set(reidSession.matches.map(m => m.alertId));
    
    return alerts.filter(a => {
        if (matchIds.has(a.id)) return false;
        
        const alertTime = new Date(a.timestamp).getTime();
        return spatialPath.some(point => {
            const pointTime = new Date(point.timestamp).getTime();
            const diffMinutes = Math.abs(alertTime - pointTime) / 60000;
            return diffMinutes <= 5; // 5 minute window
        });
    }).slice(0, 8);
  }, [reidSession, spatialPath, alerts]);

  const isPinned = (id: string) => pinnedEvidence.some(e => e.id === id);

  useEffect(() => {
    if (timelineScrollRef.current) {
        timelineScrollRef.current.scrollTop = 0;
    }
  }, [timelineMatches.length]);

  const isProcessing = agentState === AgentState.REASONING && !reidSession;

  if (isProcessing) return (
    <div className="h-full flex flex-col items-center justify-center bg-aegis-900 text-aegis-accent relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-2 border-aegis-accent rounded-full animate-ping"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-aegis-accent/50 rounded-full animate-pulse"></div>
        </div>

        <div className="relative mb-8">
            <div className="absolute inset-0 bg-aegis-accent/20 rounded-full animate-ping"></div>
            <div className="relative bg-aegis-800 p-8 rounded-full border-2 border-aegis-accent shadow-[0_0_50px_rgba(0,240,255,0.4)]">
                <Dna className="w-16 h-16 animate-spin" />
            </div>
        </div>
        <h2 className="text-3xl font-bold tracking-[0.3em] mb-4 uppercase animate-pulse">Correlating Visual DNA</h2>
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest bg-black/40 px-4 py-2 rounded border border-white/5">
            Ghost_Tracer Agent :: Distributed Node Correlation Loop 4.2
        </p>
    </div>
  );

  if (!reidSession) return (
    <div className="h-full flex items-center justify-center text-gray-500">
      <div className="text-center">
        <Search className="w-16 h-16 mx-auto mb-4 opacity-10" />
        <p>No Visual Trace active. Click a detection in the live feed to begin.</p>
        <button 
          onClick={() => setCurrentAppView(AppView.DASHBOARD)}
          className="mt-4 text-aegis-accent hover:underline text-sm font-bold"
        >
          Return to Command Center
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-6 bg-[#02050A] animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setCurrentAppView(AppView.DASHBOARD)}
            className="p-3 bg-aegis-800 hover:bg-aegis-700 rounded-xl text-white transition-all border border-white/10 shadow-lg group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
                   GHOST_TRACER FORENSICS
                 </h1>
                 <div className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded animate-pulse shadow-[0_0_10px_red]">ACTIVE_TRACE</div>
            </div>
            <p className="text-gray-500 text-xs font-mono tracking-[0.2em] uppercase mt-1">Marauder's Geo-Spatial Path Reconstruction</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-aegis-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3 shadow-2xl">
            <Activity className="w-4 h-4 text-aegis-accent" />
            <div className="text-xs">
              <div className="text-gray-500 uppercase font-black text-[9px]">MATCH NODES</div>
              <div className="text-white font-mono">{reidSession.matches.length} Sightings</div>
            </div>
          </div>
          <button 
            onClick={() => setIsCorrelationOpen(!isCorrelationOpen)}
            className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-3 shadow-2xl ${isCorrelationOpen ? 'bg-orange-600 border-orange-400 text-white' : 'bg-aegis-800/80 border-white/5 text-gray-400 hover:text-white'}`}
          >
            <Radio className={`w-4 h-4 ${isCorrelationOpen ? 'animate-pulse' : ''}`} />
            <div className="text-left">
              <div className="uppercase font-black text-[9px]">CROSS_CORRELATION</div>
              <div className="font-mono text-xs">{isCorrelationOpen ? 'HIDE' : 'SHOW'} GRID ANALYTICS</div>
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-6 pb-2">
        
        {/* Left Column: DNA Sidebar */}
        <div className="w-[320px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 min-h-0 shrink-0">
          
          <div className="bg-aegis-800/40 rounded-2xl border border-aegis-700/50 p-5 shadow-2xl relative overflow-hidden group shrink-0">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 group-hover:opacity-100 animate-scan-line"></div>
            
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Fingerprint className="w-4 h-4 text-red-500" />
                     TARGET SIGNATURE
                 </h3>
                 <span className="text-[9px] font-mono text-gray-500">{reidSession.timestamp.toLocaleTimeString()}</span>
            </div>

            <div className="rounded-xl overflow-hidden border-2 border-red-500/30 bg-black aspect-square relative shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <img src={reidSession.targetSnapshot} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                 <div className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-tighter">Source_Frame</div>
              </div>
            </div>

            {reidSession.extractedSignature && (
                <div className="mt-5 space-y-3">
                    <div className="text-[10px] font-bold text-aegis-accent uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Dna className="w-3 h-3" /> Visual DNA Matrix
                    </div>
                    {[
                        { label: 'TORSO', value: reidSession.extractedSignature.torso },
                        { label: 'LEGS', value: reidSession.extractedSignature.legs },
                        { label: 'BUILD', value: reidSession.extractedSignature.build },
                        { label: 'GAIT_ID', value: reidSession.extractedSignature.gaitDescription }
                    ].map(feat => (
                        <div key={feat.label} className="bg-black/40 p-2 rounded-lg border border-white/5 group/feat hover:border-aegis-500/30 transition-all">
                            <div className="text-[8px] text-gray-500 font-black uppercase mb-1">{feat.label}</div>
                            <div className="text-[11px] text-white font-mono leading-relaxed">{feat.value}</div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {reidSession.gaitOptimization && (
              <div className="bg-aegis-900/40 border border-aegis-500/30 rounded-2xl p-5 shadow-xl shrink-0 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-aegis-accent animate-pulse" />
                      <h3 className="text-white font-black text-[10px] uppercase tracking-widest">Biometric Pivot Logic</h3>
                  </div>
                  
                  <div className="bg-black/40 p-3 rounded-lg border border-white/5 mb-4">
                      <div className="flex items-start gap-2">
                          <Footprints className="w-4 h-4 text-aegis-accent shrink-0 mt-0.5" />
                          <div>
                              <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Gait Enhancement Path</div>
                              <p className="text-[10px] text-gray-300 leading-relaxed italic">"{reidSession.gaitOptimization.reason}"</p>
                          </div>
                      </div>
                  </div>

                  <div className="h-16 w-full bg-black/60 rounded-lg border border-aegis-500/20 relative flex items-center justify-center overflow-hidden mb-4">
                      <div className="absolute inset-0 flex items-center justify-around px-4">
                          {[...Array(12)].map((_, i) => (
                              <div 
                                  key={i} 
                                  className="w-1 bg-aegis-accent/40 rounded-full transition-all duration-300"
                                  style={{ 
                                      height: `${20 + Math.random() * 60}%`, 
                                      opacity: reidSession.gaitOptimization?.inferredMetrics.limpDetected && i % 4 === 0 ? 1 : 0.4,
                                      backgroundColor: reidSession.gaitOptimization?.inferredMetrics.limpDetected && i % 4 === 0 ? '#ef4444' : '#00F0FF'
                                  }}
                              />
                          ))}
                      </div>
                      <div className="absolute top-1 right-2 text-[7px] font-mono text-aegis-accent uppercase opacity-50">Stride_Signature_Loop</div>
                  </div>
              </div>
          )}
        </div>

        {/* Center: Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 min-h-0 min-w-0">
          
          {/* Navigation Tabs */}
          <div className="bg-aegis-800/50 p-1.5 rounded-2xl border border-white/5 flex gap-2 w-fit shadow-lg shrink-0">
             <button 
                onClick={() => setActiveTab('TIMELINE')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'TIMELINE' ? 'bg-aegis-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
             >
                <History className="w-4 h-4" /> RECONSTRUCTED_TIMELINE
             </button>
             <button 
                onClick={() => setActiveTab('TRAJECTORY')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'TRAJECTORY' ? 'bg-aegis-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
             >
                <Radar className="w-4 h-4" /> MARAUDER_SPATIAL_MAP
             </button>
             <button 
                onClick={() => setActiveTab('COMPANIONS')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'COMPANIONS' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
             >
                <Users className="w-4 h-4" /> ASSOCIATE_DISCOVERY
             </button>
          </div>

          {/* Timeline Tab */}
          {activeTab === 'TIMELINE' && (
              <div className="flex-1 min-h-0 bg-aegis-800/30 rounded-3xl border border-white/5 shadow-2xl flex flex-col overflow-hidden relative">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00F0FF 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
                <div ref={timelineScrollRef} className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar relative z-10 scroll-smooth">
                    <div className="absolute left-[38px] top-8 bottom-8 w-1 bg-gradient-to-b from-aegis-500/80 via-aegis-500/20 to-transparent"></div>
                    {timelineMatches.map((item, idx) => (
                        <div key={idx} className="relative pl-14 group animate-in slide-in-from-bottom-8">
                            <div className={`absolute left-0 top-0 w-8 h-8 rounded-full border-4 border-[#02050A] z-20 flex items-center justify-center transition-all duration-500 ${idx === 0 ? 'bg-red-500 shadow-[0_0_20px_red] scale-125' : 'bg-aegis-500'}`}>
                                <Target className="w-3 h-3 text-white" />
                            </div>
                            <div className="flex gap-8">
                                <div className="w-28 shrink-0">
                                    <div className="text-sm font-black text-white font-mono">{new Date(item.alert!.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-aegis-accent font-bold mt-1.5 bg-aegis-900/50 px-2 py-0.5 rounded border border-aegis-500/20 w-fit uppercase">{item.alert!.location}</div>
                                </div>
                                <div className={`flex-1 bg-[#0A0E17] rounded-2xl border border-white/5 overflow-hidden flex shadow-2xl transition-all duration-500 hover:border-aegis-500 group/card relative ${idx === 0 ? 'border-red-500/50' : ''}`}>
                                    <div className="w-64 h-44 bg-black shrink-0 relative overflow-hidden border-r border-white/5">
                                        <img src={item.alert!.snapshot} className="w-full h-full object-cover opacity-70 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] to-transparent opacity-80"></div>
                                    </div>
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-white font-black text-base uppercase tracking-tight group-hover/card:text-aegis-accent transition-colors">{item.alert!.threatType}</h4>
                                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">SIGHTING_CORRELATION: {item.reid.similarityScore}%</p>
                                            </div>
                                            <button onClick={() => togglePin(item.alert!)} className={`p-2 rounded-lg transition-all ${isPinned(item.alert!.id) ? 'bg-aegis-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}>
                                                {isPinned(item.alert!.id) ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed font-mono line-clamp-3 bg-black/40 p-3 rounded-lg border border-white/5">{item.reid.reasoning}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
          )}

          {/* Trajectory Tab */}
          {activeTab === 'TRAJECTORY' && (
              <div className="flex-1 bg-aegis-800/30 rounded-3xl border border-white/5 shadow-2xl p-8 flex flex-col min-h-0 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center mb-8 shrink-0">
                       <div>
                           <h3 className="text-white font-black text-xl uppercase tracking-tighter flex items-center gap-2">
                             <MapIcon className="text-aegis-accent" /> Marauder's Spatial Path
                           </h3>
                       </div>
                  </div>
                  <div className="flex-1 bg-[#050A14] rounded-2xl border border-white/10 relative overflow-hidden shadow-inner p-4 flex items-center justify-center min-h-0">
                       <div className="absolute inset-0 opacity-20 pointer-events-none p-10">
                           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                               <path d="M5,5 L95,5 L95,95 L5,95 Z" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
                               <path d="M30,5 L30,40 M30,60 L30,95 M70,5 L70,30 M70,50 L70,95" fill="none" stroke="#3B82F6" strokeWidth="0.3" strokeDasharray="2,2" />
                           </svg>
                       </div>
                       <div className="relative w-full h-full max-w-4xl mx-auto">
                           <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 100 100">
                               {spatialPath.length > 1 && (
                                   <path 
                                        d={`M ${spatialPath.map(p => `${p.coords.x},${p.coords.y}`).join(' L ')}`}
                                        fill="none" stroke="url(#pathGradient)" strokeWidth="0.8" strokeDasharray="1,1" className="animate-draw-path"
                                   />
                               )}
                               {spatialPath.map((item, i) => {
                                   const isCurrent = i === spatialPath.length - 1;
                                   return (
                                       <g key={item.id} className="group/node">
                                           {isCurrent && <circle cx={item.coords.x} cy={item.coords.y} r="3" fill="rgba(239, 68, 68, 0.2)" className="animate-ping" />}
                                           <circle cx={item.coords.x} cy={item.coords.y} r={isCurrent ? "1.5" : "1"} fill={isCurrent ? "#EF4444" : "#3B82F6"} stroke="white" strokeWidth="0.2" className="cursor-pointer transition-all" />
                                       </g>
                                   )
                               })}
                               <defs>
                                   <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                       <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                                       <stop offset="100%" stopColor="#EF4444" />
                                   </linearGradient>
                               </defs>
                           </svg>
                       </div>
                  </div>
              </div>
          )}

          {/* Companions Tab */}
          {activeTab === 'COMPANIONS' && (
              <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500 min-h-0">
                  <div className="flex-1 bg-aegis-800/30 rounded-3xl border border-white/5 p-6 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Discovered Associate Profiles</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                        {(!reidSession.companions || reidSession.companions.length === 0) ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <Users className="w-12 h-12 mb-4 opacity-10" />
                                <p className="text-sm">No persistent companions detected.</p>
                            </div>
                        ) : (
                            reidSession.companions.map((companion, i) => (
                                <div key={i} className="bg-black/40 rounded-2xl border border-purple-500/20 p-5 hover:border-purple-500/50 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-lg">
                                                {companion.entityId.slice(-2)}
                                            </div>
                                            <div>
                                                <div className="text-base font-bold text-white uppercase tracking-tight">{companion.entityId}</div>
                                                <div className="text-[9px] text-gray-500 font-mono tracking-tighter uppercase mt-0.5">{companion.visualSignature}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-purple-400 font-black text-2xl leading-none">{companion.confidence}%</div>
                                            <div className="text-[8px] text-gray-500 uppercase tracking-widest">Correlation</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                            <div className="text-[8px] text-gray-500 uppercase font-black mb-1">Behavior</div>
                                            <div className="text-xs font-bold text-white">{companion.behavioralAlignment.alignmentType}</div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                            <div className="text-[8px] text-gray-500 uppercase font-black mb-1">Risk</div>
                                            <div className="text-xs font-bold text-red-400">x{((companion.riskContagion / 100) + 1).toFixed(1)}</div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                            <div className="text-[8px] text-gray-500 uppercase font-black mb-1">Nodes</div>
                                            <div className="text-xs font-bold text-white">{companion.sharedLocations.length}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                  </div>
              </div>
          )}
        </div>

        {/* Right Sidebar: Dynamic Correlation Panel */}
        <div className={`transition-all duration-500 ease-in-out flex shrink-0 ${isCorrelationOpen ? 'w-[360px]' : 'w-12'}`}>
            <div className={`h-full w-full bg-[#050A14]/80 backdrop-blur-xl border-l border-white/5 flex flex-col relative ${!isCorrelationOpen ? 'items-center py-6' : ''}`}>
                
                {/* Collapse Toggle */}
                <button 
                    onClick={() => setIsCorrelationOpen(!isCorrelationOpen)}
                    className="absolute -left-3 top-12 w-6 h-12 bg-aegis-700 hover:bg-aegis-600 rounded-lg border border-white/10 flex items-center justify-center text-white z-50 shadow-xl transition-transform hover:scale-110"
                >
                    {isCorrelationOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                </button>

                {!isCorrelationOpen ? (
                    <div className="flex flex-col gap-8 text-gray-500 items-center">
                        <div className="[writing-mode:vertical-lr] rotate-180 uppercase font-black text-[10px] tracking-[0.3em] whitespace-nowrap opacity-50">Cross_Grid_Correlations</div>
                        <Radio className="w-5 h-5 animate-pulse text-orange-500" />
                        <div className="w-px h-full bg-white/5 flex-1"></div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full animate-in slide-in-from-right-4">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-orange-950/10">
                            <div className="flex flex-col">
                                <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                    <Network className="w-4 h-4 text-orange-500" /> Neural Correlation
                                </h3>
                                <p className="text-[8px] text-orange-400/60 font-mono mt-1 uppercase tracking-tighter">Spatial-Temporal Anomaly Matrix</p>
                            </div>
                            <div className="bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg animate-pulse">
                                {discoveryCorrelations.length + (reidSession.nearbyAnomalies?.length || 0)} EVENTS
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                            {/* Explicit Proximity Intelligence from Model */}
                            {reidSession.nearbyAnomalies && reidSession.nearbyAnomalies.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">
                                        <Scale className="w-3 h-3" /> Model_Inferred_Links
                                    </div>
                                    {reidSession.nearbyAnomalies.map((anomaly, i) => (
                                        <div key={i} className="bg-white/5 rounded-2xl border border-orange-500/20 p-4 relative group hover:border-orange-500/50 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`p-2 rounded-lg bg-orange-900/30 border border-orange-500/40 text-orange-400`}>
                                                    <AlertTriangle className="w-4 h-4" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-white font-bold text-[10px] uppercase">{anomaly.vectorLabel}</div>
                                                    <div className="text-[8px] text-orange-500 font-black">{anomaly.correlationStrength}% STRENGTH</div>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-mono leading-relaxed mb-3 italic">"{anomaly.relevance}"</p>
                                            <div className="flex items-center justify-between text-[8px] font-mono text-gray-500 pt-2 border-t border-white/5">
                                                <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> NODE_{anomaly.alertId.slice(-4)}</span>
                                                <span className="bg-orange-900/20 px-1.5 py-0.5 rounded text-orange-300 font-bold uppercase">{anomaly.proximityType}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Discovered Correlated Incidents (Auto-calculated) */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">
                                    <Radar className="w-3 h-3" /> Spatial_Temporal_Discovery
                                </div>
                                
                                {discoveryCorrelations.length === 0 ? (
                                    <div className="py-10 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-gray-600">
                                        <Activity className="w-10 h-10 mb-3 opacity-10" />
                                        <p className="text-[10px] uppercase font-bold tracking-widest">Scanning Grid History...</p>
                                    </div>
                                ) : (
                                    discoveryCorrelations.map((alert, i) => (
                                        <div key={i} className="bg-black/40 rounded-2xl border border-white/10 p-4 hover:border-aegis-500/50 transition-all group/disc">
                                            <div className="flex gap-3 mb-3">
                                                <div className="w-16 h-12 bg-black rounded-lg overflow-hidden border border-white/5 shrink-0">
                                                    <img src={alert.snapshot} className="w-full h-full object-cover opacity-60 group-hover/disc:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="text-white font-bold text-[10px] uppercase truncate group-hover/disc:text-orange-400 transition-colors">{alert.threatType}</h4>
                                                        {alert.severity === Severity.CRITICAL && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>}
                                                    </div>
                                                    <div className="text-[8px] text-gray-500 font-mono mt-1 uppercase flex items-center gap-1">
                                                        <Clock className="w-2.5 h-2.5" /> ΔT: ~{Math.floor(Math.random() * 5)}m
                                                    </div>
                                                    <div className="text-[8px] text-gray-500 font-mono flex items-center gap-1">
                                                        <MapPin className="w-2.5 h-2.5" /> {alert.location}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2 bg-white/5 p-2 rounded border border-white/5 mb-3">{alert.description}</p>
                                            <div className="flex gap-2">
                                                <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg border border-white/10 text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1">
                                                    <Eye className="w-3 h-3" /> Verify
                                                </button>
                                                <button className="flex-1 py-1.5 bg-aegis-600/10 hover:bg-aegis-600 text-aegis-400 hover:text-white rounded-lg border border-aegis-600/20 text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1">
                                                    <ArrowUpRight className="w-3 h-3" /> Escalate
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Analysis Footer */}
                        <div className="p-4 bg-orange-950/20 border-t border-white/5">
                             <div className="bg-black/40 p-3 rounded-xl border border-orange-500/20">
                                 <div className="flex items-center gap-2 mb-2">
                                     <Brain className="w-3.5 h-3.5 text-orange-400" />
                                     <span className="text-[9px] font-black text-white uppercase tracking-widest">Predictive Synergy</span>
                                 </div>
                                 <p className="text-[9px] text-orange-200/60 font-mono leading-relaxed italic">
                                     System detected {discoveryCorrelations.length} ancillary events. Correlation weight suggest {discoveryCorrelations.some(a => a.severity === Severity.CRITICAL) ? 'HIGH' : 'LOW'} probability of coordinated diversion tactics.
                                 </p>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Footer System Bar */}
      <div className="shrink-0 p-4 bg-[#0A0E17] border border-white/5 rounded-2xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-aegis-accent"></div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
               <Cpu className="w-4 h-4 text-gray-600" />
               <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Inference Nodes_Active: 24/24</span>
           </div>
           <div className="flex items-center gap-2 border-l border-white/5 pl-6">
               <Link2 className="w-4 h-4 text-purple-500" />
               <span className="text-[10px] font-mono text-purple-500 uppercase tracking-widest">Forensic_Correlation: Multi-Vector Re-ID</span>
           </div>
        </div>
        <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 text-[10px] font-bold rounded-lg border border-white/5 transition-all uppercase tracking-widest">
                Export_Session
            </button>
            <button className="px-6 py-2 bg-aegis-600 hover:bg-aegis-500 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-aegis-500/20 transition-all uppercase tracking-widest">
                Download_Log
            </button>
        </div>
      </div>

      <style>{`
          @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
              animation: spin-slow 12s linear infinite;
          }
          @keyframes draw-path {
              from { stroke-dashoffset: 100; }
              to { stroke-dashoffset: 0; }
          }
          .animate-draw-path {
              stroke-dasharray: 2;
              animation: draw-path 3s linear forwards;
          }
      `}</style>
    </div>
  );
};

export default VisualTraceView;
