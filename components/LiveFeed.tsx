import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { Maximize2, Activity, VideoOff, Brain, Scan, Zap } from 'lucide-react';
import { AgentState } from '../types';

const LiveFeed: React.FC = () => {
  const { videoRef, isArmed, agentState } = useSecurity();

  const getStateIcon = () => {
    switch (agentState) {
        case AgentState.PERCEIVING: return <Scan className="w-4 h-4 animate-pulse text-blue-400" />;
        case AgentState.REASONING: return <Brain className="w-4 h-4 animate-pulse text-aegis-accent" />;
        case AgentState.ACTING: return <Zap className="w-4 h-4 animate-pulse text-red-500" />;
        default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStateText = () => {
    switch (agentState) {
        case AgentState.PERCEIVING: return "ACQUIRING TARGETS...";
        case AgentState.REASONING: return "ANALYZING INTENT...";
        case AgentState.ACTING: return "EXECUTING PROTOCOLS...";
        default: return "STANDBY";
    }
  };

  const getStateColor = () => {
    switch (agentState) {
        case AgentState.PERCEIVING: return "border-blue-500 text-blue-500";
        case AgentState.REASONING: return "border-aegis-accent text-aegis-accent";
        case AgentState.ACTING: return "border-red-500 text-red-500";
        default: return "border-gray-500 text-gray-500";
    }
  };

  return (
    <div className={`relative rounded-lg overflow-hidden bg-black aspect-video group border-2 transition-all duration-300 ${isArmed ? 'border-aegis-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-aegis-700'}`}>
      
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted 
        className={`w-full h-full object-cover transform scale-x-[-1] ${!isArmed ? 'opacity-50 grayscale' : 'opacity-100'}`}
      />
      
      {!isArmed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <VideoOff className="w-12 h-12 mb-2 opacity-50" />
            <p className="font-mono text-sm uppercase">System Disarmed</p>
        </div>
      )}

      {/* Overlay UI */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isArmed ? 'bg-red-500 animate-ping' : 'bg-gray-500'}`} />
          <span className="text-xs font-mono text-white bg-black/50 px-2 py-0.5 rounded border border-white/10 backdrop-blur-md">
            CAM-01 [LOCAL]
          </span>
        </div>
        <div className={`text-xs font-bold shadow-sm uppercase tracking-wider bg-black/60 px-3 py-1 rounded border backdrop-blur-md flex items-center gap-2 ${getStateColor()}`}>
          {getStateIcon()}
          {isArmed ? getStateText() : "OFFLINE"}
        </div>
      </div>

      {/* Reticle / Scanning Effect when Armed */}
      {isArmed && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="w-full h-1 bg-aegis-accent absolute top-1/2 -translate-y-1/2 animate-scan-line shadow-[0_0_10px_#00F0FF]"></div>
              <div className="absolute top-10 left-10 w-8 h-8 border-l-2 border-t-2 border-white/50"></div>
              <div className="absolute top-10 right-10 w-8 h-8 border-r-2 border-t-2 border-white/50"></div>
              <div className="absolute bottom-10 left-10 w-8 h-8 border-l-2 border-b-2 border-white/50"></div>
              <div className="absolute bottom-10 right-10 w-8 h-8 border-r-2 border-b-2 border-white/50"></div>
          </div>
      )}

      {/* Bottom Data */}
      <div className="absolute bottom-0 left-0 w-full p-4 flex justify-between items-end bg-gradient-to-t from-black/90 to-transparent">
        <div className="text-xs font-mono text-aegis-accent flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>AEGIS AGENT CORE v4.1</span>
        </div>
        <button className="p-2 hover:bg-white/10 rounded text-white transition-colors">
            <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LiveFeed;
