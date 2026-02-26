
import React, { useMemo, useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { AgentState } from '../types';
import { CloudRain, Sun, Wind, Map as MapIcon, Link2, TrendingUp, RefreshCw, Footprints, Cpu, Target, Maximize2 } from 'lucide-react';
import CameraStream from './CameraStream';

const AgenticVideoWall: React.FC = () => {
  const { videoRef, isArmed, agentState, cameras, refreshCameras, alerts, attentionTargetId, setAttentionTargetId, detectionMode } = useSecurity();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const envContext = useMemo(() => {
    const latestEnv = alerts.find(a => a.environment)?.environment;
    return latestEnv || { weather: 'CLEAR', lighting: 'DAYLIGHT', facilityState: 'NORMAL' };
  }, [alerts]);

  const sortedCameras = useMemo(() => {
    return [...cameras].sort((a, b) => b.priorityScore - a.priorityScore);
  }, [cameras]);

  // Derive tracking chains from alert tracking data
  const trackingChains = useMemo(() => {
      const chains: Record<string, { cameras: string[], lastSeen: string, path: string[] }> = {};
      
      const recentAlerts = alerts.filter(a => 
          a.tracking?.entityId && 
          (Date.now() - new Date(a.timestamp).getTime() < 120000)
      );

      recentAlerts.forEach(a => {
          const eid = a.tracking!.entityId;
          if (!chains[eid]) {
              chains[eid] = { cameras: [], lastSeen: a.timestamp, path: [] };
          }
          if (!chains[eid].cameras.includes(a.location)) {
              chains[eid].cameras.push(a.location);
          }
      });

      Object.keys(chains).forEach(eid => {
          const entityAlerts = recentAlerts.filter(a => a.tracking?.entityId === eid).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          chains[eid].path = entityAlerts.map(a => a.location);
      });

      return chains;
  }, [alerts]);

  const getEntityColor = (id: string) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshCameras();
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const getEnvIcon = () => {
    switch (envContext.weather) {
      case 'RAIN': return <CloudRain className="w-3 h-3 text-blue-400" />;
      case 'CLEAR': return <Sun className="w-3 h-3 text-yellow-400" />;
      case 'WIND': return <Wind className="w-3 h-3 text-gray-400" />;
      default: return <Sun className="w-3 h-3 text-yellow-400" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-black relative group/wall">
        
        {/* Overlay Header - Appears on Hover or if Critical */}
        <div className="absolute top-0 left-0 right-0 z-50 p-2 flex justify-between items-start pointer-events-none opacity-0 group-hover/wall:opacity-100 transition-opacity bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-4 pointer-events-auto">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10">
                    {getEnvIcon()}
                    <span className="text-[9px] font-bold text-white uppercase">{envContext.weather}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
                 <button 
                    onClick={handleManualRefresh}
                    className="flex items-center gap-1.5 bg-black/60 hover:bg-aegis-900 text-gray-400 hover:text-white px-2 py-1 rounded border border-white/10 text-[9px] font-bold uppercase transition-all"
                 >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-aegis-accent' : ''}`} />
                    RESYNC
                 </button>
                 <div className="bg-black/60 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-gray-400 flex items-center gap-1.5">
                    <MapIcon className="w-3 h-3" />
                    {cameras.length} NODES
                </div>
                {Object.keys(trackingChains).length > 0 && (
                    <div className="flex items-center gap-1.5 bg-aegis-900/80 px-2 py-1 rounded border border-aegis-500/30 text-aegis-accent animate-pulse">
                        <Link2 className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase">{Object.keys(trackingChains).length} CHAINS</span>
                    </div>
                )}
            </div>
        </div>

        {/* Video Grid - Gap 1px for monitor wall effect */}
        <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-px bg-aegis-900">
        {sortedCameras.slice(0, 6).map((cam, index) => {
            const isHero = index === 0;
            const gridClass = isHero ? "col-span-3 row-span-3" : "col-span-1 row-span-1";
            
            const isAIFocused = attentionTargetId === cam.id && isArmed;
            const hasCriticalAlert = cam.priorityScore > 85;
            
            // Find if this camera is part of any active tracking chain
            const activeEntityId = Object.keys(trackingChains).find(eid => 
                trackingChains[eid].cameras.includes(cam.name)
            );
            
            const chainData = activeEntityId ? trackingChains[activeEntityId] : null;
            const entityColor = activeEntityId ? getEntityColor(activeEntityId) : null;

            return (
            <div key={cam.id} 
                className={`${gridClass} relative bg-black overflow-hidden group/cam`}
            >
                {/* Border Highlight for Events */}
                <div className={`absolute inset-0 pointer-events-none z-20 border-[2px] transition-colors duration-500 ${
                    activeEntityId ? 'border-transparent' : 
                    hasCriticalAlert ? 'border-red-500 animate-pulse' : 
                    isAIFocused ? 'border-aegis-accent' : 
                    'border-transparent group-hover/cam:border-white/10'
                }`} style={{ borderColor: activeEntityId ? entityColor! : undefined }}></div>

                <div className="w-full h-full relative">
                    <CameraStream 
                        deviceId={cam.deviceId}
                        isPrimary={cam.isPrimary}
                        globalRef={videoRef}
                        isArmed={isArmed}
                        isFocused={isAIFocused}
                        className="w-full h-full"
                    />

                    {/* Analysis Status Overlay */}
                    {isAIFocused && (
                        <div className="absolute top-0 left-0 p-1 bg-aegis-accent text-black font-mono text-[8px] font-black flex items-center gap-1 z-30">
                            <Cpu className="w-2.5 h-2.5 animate-spin" /> 
                            {agentState === AgentState.PERCEIVING ? 'INGEST' : 'INFERENCE'}
                        </div>
                    )}

                    {/* Correlation Overlay */}
                    {activeEntityId && chainData && (
                        <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-40">
                            <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10" style={{ borderColor: entityColor! }}>
                                <Target className="w-2.5 h-2.5 animate-pulse" style={{ color: entityColor! }} />
                                <span className="text-[8px] font-black text-white uppercase tracking-wider">{activeEntityId}</span>
                            </div>
                        </div>
                    )}

                    {/* Camera Info Footer - Always visible but subtle */}
                    <div className="absolute bottom-0 left-0 w-full p-1.5 bg-gradient-to-t from-black/90 to-transparent z-30 flex justify-between items-end pointer-events-none">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1 h-1 rounded-full ${cam.status === 'ACTIVE' ? 'bg-red-500' : 'bg-gray-700'}`} />
                            <span className="text-[9px] font-bold text-white uppercase font-mono tracking-tight leading-none shadow-black drop-shadow-md">
                                {cam.name}
                            </span>
                        </div>
                        {activeEntityId && chainData && chainData.path.includes(cam.name) && (
                             <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded border border-white/5 backdrop-blur-sm">
                                <Footprints className="w-2.5 h-2.5 text-white opacity-80" />
                                <span className="text-[8px] font-bold text-white leading-none">
                                    {chainData.path.indexOf(cam.name) + 1}/{chainData.path.length}
                                </span>
                             </div>
                        )}
                    </div>
                </div>

                {/* Hover Interaction Overlay */}
                <div className="absolute inset-0 bg-aegis-900/10 opacity-0 group-hover/cam:opacity-100 transition-opacity duration-200 flex items-center justify-center z-40 pointer-events-none">
                    <div className="flex gap-2 pointer-events-auto">
                        <button 
                            onClick={() => setAttentionTargetId(isAIFocused ? null : cam.id)}
                            className={`p-2 rounded-lg transition-all shadow-xl backdrop-blur-sm ${
                                isAIFocused 
                                ? 'bg-aegis-accent text-black hover:bg-white' 
                                : 'bg-black/60 text-white hover:bg-aegis-accent hover:text-black border border-white/10'
                            }`}
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            );
        })}
        </div>
    </div>
  );
};

export default AgenticVideoWall;
