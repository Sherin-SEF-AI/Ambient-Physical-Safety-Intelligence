
import React, { useEffect, useState, useRef } from 'react';
import AgenticVideoWall from './AgenticVideoWall';
import IntelligentAlertFeed from './IntelligentAlertFeed';
import ActiveThreatOverlay from './ActiveThreatOverlay';
import ActiveEntityTracker from './ActiveEntityTracker';
import AudioAnalysisModule from './AudioAnalysisModule';
import DeescalationWidget from './DeescalationWidget';
import CrowdControlWidget from './CrowdControlWidget';
import { SecurityAlert, Severity, AgentState, BehavioralState, EnvironmentType } from '../types';
import { Shield, Power, BrainCircuit, Scan, Unlock, Lock, Target, Loader2, CheckCircle2, Building2, School, Hospital, Factory, Home, Landmark, Terminal, Zap } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

const Dashboard: React.FC = () => {
  const { 
    isArmed, setArmed, 
    alerts,
    cameras,
    agentState,
    lastThinkingProcess,
    globalLockdown, setGlobalLockdown,
    videoRef, initiateVisualReID,
    facilityType
  } = useSecurity();
  
  const [activeThreat, setActiveThreat] = useState<SecurityAlert | null>(null);
  const [isShutterActive, setIsShutterActive] = useState(false);
  const [capturePreview, setCapturePreview] = useState<string | null>(null);
  const [traceStatus, setTraceStatus] = useState<'IDLE' | 'LOCKING' | 'RE-ID_INVOKED'>('IDLE');
  
  // Terminal Logic
  const [inferenceLogs, setInferenceLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastThinkingProcess && isArmed) {
        setInferenceLogs(prev => {
            // Keep last 50 lines
            const newLog = `[${new Date().toISOString().split('T')[1].slice(0, -1)}] ${lastThinkingProcess}`;
            return [...prev, newLog].slice(-50);
        });
    }
  }, [lastThinkingProcess, isArmed]);

  useEffect(() => {
      if (terminalEndRef.current) {
          terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [inferenceLogs]);

  useEffect(() => {
    const criticalThreat = alerts.find(a => 
        (a.severity === Severity.CRITICAL || a.intent?.behavioralState === BehavioralState.AIMING_WEAPON) && 
        !activeThreat &&
        (Date.now() - new Date(a.timestamp).getTime() < 5000)
    );
    if (criticalThreat) setActiveThreat(criticalThreat);
  }, [alerts]);

  const latestAlert = alerts[0];
  const latestCrisis = latestAlert?.crisis;

  const handleManualTrace = () => {
    if (!videoRef.current) return;
    setIsShutterActive(true);
    setTraceStatus('LOCKING');
    setTimeout(() => setIsShutterActive(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        const snapshot = canvas.toDataURL('image/jpeg', 0.8);
        setCapturePreview(snapshot);
        setTimeout(() => {
            setTraceStatus('RE-ID_INVOKED');
            initiateVisualReID(snapshot);
            setTimeout(() => {
                setCapturePreview(null);
                setTraceStatus('IDLE');
            }, 1000);
        }, 1500);
    }
  };

  const getFacilityIcon = () => {
    switch (facilityType) {
        case EnvironmentType.CORPORATE: return <Building2 className="w-3 h-3 text-aegis-accent" />;
        case EnvironmentType.EDUCATION: return <School className="w-3 h-3 text-aegis-accent" />;
        case EnvironmentType.HEALTHCARE: return <Hospital className="w-3 h-3 text-aegis-accent" />;
        case EnvironmentType.INDUSTRIAL: return <Factory className="w-3 h-3 text-aegis-accent" />;
        case EnvironmentType.RESIDENTIAL: return <Home className="w-3 h-3 text-aegis-accent" />;
        case EnvironmentType.PUBLIC_SPACE: return <Landmark className="w-3 h-3 text-aegis-accent" />;
        default: return <Shield className="w-3 h-3 text-aegis-accent" />;
    }
  };

  // Helper to colorize log parts
  const renderLogText = (text: string) => {
      const parts = text.split(' ');
      return parts.map((part, i) => {
          if (part.startsWith('[')) return <span key={i} className="text-gray-600 font-bold mr-1">{part}</span>;
          if (part.includes('Analyzing') || part.includes('Scanning')) return <span key={i} className="text-blue-400 mr-1">{part}</span>;
          if (part.includes('DETECTED') || part.includes('Threat')) return <span key={i} className="text-red-500 font-bold mr-1">{part}</span>;
          if (part.includes('Normal') || part.includes('Routine')) return <span key={i} className="text-green-500 mr-1">{part}</span>;
          return <span key={i} className="text-gray-400 mr-1">{part}</span>;
      });
  };

  return (
    <div className="p-2 h-full overflow-hidden flex flex-col bg-[#05080F] relative">
      <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'linear-gradient(#2A3B5E 1px, transparent 1px), linear-gradient(90deg, #2A3B5E 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {isShutterActive && <div className="fixed inset-0 z-[100] bg-white animate-pulse pointer-events-none"></div>}

      {capturePreview && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
              <div className="w-80 bg-aegis-900 border-2 border-aegis-accent rounded-2xl shadow-[0_0_80px_rgba(0,240,255,0.4)] p-4 transform animate-in zoom-in-95 scale-110">
                  <div className="relative rounded-xl overflow-hidden border-2 border-aegis-accent/30 shadow-inner group">
                      <img src={capturePreview} className="w-full h-auto" alt="Preview" />
                      <div className="absolute inset-0 bg-aegis-accent/10 animate-scan-line pointer-events-none"></div>
                  </div>
                  <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${traceStatus === 'RE-ID_INVOKED' ? 'text-green-400' : 'text-aegis-accent'}`}>
                             {traceStatus === 'LOCKING' ? <><Loader2 className="w-3 h-3 animate-spin" /> Ingesting Signature...</> : <><CheckCircle2 className="w-3 h-3 text-green-400" /> Vector Analysis Active</>}
                          </span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className={`h-full bg-aegis-accent transition-all duration-1000 ${traceStatus === 'LOCKING' ? 'w-1/2' : 'w-full'}`}></div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeThreat && <ActiveThreatOverlay alert={activeThreat} onDismiss={() => setActiveThreat(null)} />}
      
      {/* Compact Header */}
      <div className="flex justify-between items-center mb-2 shrink-0 relative z-10 px-1">
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-aegis-accent" />
                <h1 className="text-sm font-black text-white tracking-widest uppercase">
                    Sentinel Core
                </h1>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase transition-colors ${agentState === AgentState.IDLE ? 'bg-gray-900 text-gray-500 border-gray-800' : 'bg-aegis-900 text-aegis-accent border-aegis-500/50'}`}>
                    {agentState}
                </span>
                <div className="flex items-center gap-1 text-[9px] text-gray-400 font-mono">
                    <span className="text-aegis-500">NET:</span> {cameras.length} NODES
                </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-gray-400 text-[9px] font-bold uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {getFacilityIcon()}
                {(facilityType || '').replace('_', ' ')}
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            {isArmed && (
                <button 
                    onClick={handleManualTrace}
                    disabled={traceStatus !== 'IDLE'}
                    className="px-3 py-1 rounded bg-aegis-accent/10 hover:bg-aegis-accent hover:text-black border border-aegis-accent/30 text-aegis-accent text-[9px] font-black flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                    <Target className={`w-3 h-3 ${traceStatus !== 'IDLE' ? 'animate-spin' : ''}`} />
                    TRACE
                </button>
            )}

            <button onClick={() => setGlobalLockdown(!globalLockdown)} className={`px-3 py-1 rounded border text-[9px] font-black flex items-center gap-1.5 transition-all ${globalLockdown ? 'bg-red-600 text-white border-red-500 animate-pulse' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                {globalLockdown ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {globalLockdown ? 'LOCKDOWN' : 'SECURE'}
            </button>

            <button 
                onClick={() => setArmed(!isArmed)}
                className={`px-3 py-1 rounded border text-[9px] font-black flex items-center gap-1.5 transition-all ${isArmed ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-aegis-600 text-white border-aegis-500 hover:bg-aegis-500'}`}
            >
                {isArmed ? <Power className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                {isArmed ? 'DISARM' : 'ARM SYSTEM'}
            </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2 relative z-10">
        {/* Left Column - Video Wall & Controls */}
        <div className="flex-1 lg:flex-[3] flex flex-col gap-2 min-h-0 min-w-0">
            {/* Video Wall - Maximized */}
            <div className="flex-1 min-h-0 bg-black rounded-lg border border-aegis-900 overflow-hidden relative shadow-2xl">
                <AgenticVideoWall />
            </div>
            
            {/* Bottom Controls - Compact */}
            <div className="h-32 shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <AudioAnalysisModule />
                {latestCrisis ? (
                    <DeescalationWidget crisis={latestCrisis} alert={latestAlert} />
                ) : (
                    <CrowdControlWidget />
                )}
            </div>
        </div>

        {/* Right Column - Intelligence Feed */}
        <div className="flex-1 lg:flex-[1] flex flex-col gap-2 min-h-0 min-w-0">
            {/* Neural Terminal (Top) */}
            <div className="h-28 shrink-0 bg-[#020408] rounded-lg border border-aegis-800 shadow-lg overflow-hidden flex flex-col relative group">
                <div className="px-2 py-1 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-aegis-accent" />
                        <h3 className="text-gray-300 font-bold text-[9px] uppercase tracking-widest">Inference_Log</h3>
                    </div>
                    <div className={`w-1 h-1 rounded-full ${isArmed ? 'bg-green-500 animate-ping' : 'bg-gray-700'}`}></div>
                </div>
                <div className="flex-1 p-2 overflow-y-auto custom-scrollbar font-mono text-[8px] space-y-0.5 opacity-80 hover:opacity-100 transition-opacity">
                    {isArmed ? (
                        <>
                            {inferenceLogs.map((log, i) => (
                                <div key={i} className="leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                    <span className="text-aegis-accent/40 mr-1">›</span>
                                    {renderLogText(log)}
                                </div>
                            ))}
                            <div ref={terminalEndRef} />
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-700 italic">SYSTEM_STANDBY</div>
                    )}
                </div>
            </div>

            {/* Alert Stream (Middle - Flex Grow) */}
            <div className="flex-1 min-h-0 bg-aegis-900/20 rounded-lg border border-aegis-800 overflow-hidden">
                <IntelligentAlertFeed />
            </div>

            {/* Entity Tracker (Bottom) */}
            <div className="h-48 shrink-0 bg-aegis-900/20 rounded-lg border border-aegis-800 overflow-hidden">
                <ActiveEntityTracker />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
