
import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { Cpu, Network, Clock, Database } from 'lucide-react';

const SystemStatusWidget: React.FC = () => {
    const { systemHealth, detectionMode } = useSecurity();

    const getLoadColor = (load: number) => {
        if (load > 80) return 'text-red-500 stroke-red-500';
        if (load > 50) return 'text-yellow-500 stroke-yellow-500';
        return 'text-aegis-accent stroke-aegis-accent';
    };

    return (
        <div className="bg-aegis-800 rounded-xl border border-aegis-700 p-4 flex flex-col justify-between h-full">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">System Diagnostics</h3>
            
            <div className="grid grid-cols-2 gap-4">
                {/* Neural Load Gauge */}
                <div className="flex flex-col items-center justify-center p-2 bg-black/20 rounded border border-white/5">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-800" />
                            <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" 
                                className={`${getLoadColor(systemHealth.neuralLoad)} transition-all duration-500`}
                                strokeDasharray={113}
                                strokeDashoffset={113 - (113 * systemHealth.neuralLoad) / 100}
                            />
                        </svg>
                        <Cpu className={`w-4 h-4 absolute ${getLoadColor(systemHealth.neuralLoad)}`} />
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 text-center">
                        <div>NEURAL LOAD</div>
                        <div className="text-white font-mono">{Math.round(systemHealth.neuralLoad)}%</div>
                    </div>
                </div>

                {/* Network Stats */}
                <div className="flex flex-col gap-2 justify-center">
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500 flex items-center gap-1"><Network className="w-3 h-3"/> LATENCY</span>
                        <span className="text-white font-mono">{systemHealth.latencyMs}ms</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1 rounded overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all duration-300" style={{width: `${Math.min(100, systemHealth.latencyMs)}%`}}></div>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500 flex items-center gap-1"><Database className="w-3 h-3"/> INTEGRITY</span>
                        <span className="text-green-400 font-mono">{Math.round(systemHealth.networkIntegrity)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1 rounded overflow-hidden">
                        <div className="bg-green-500 h-full transition-all duration-300" style={{width: `${systemHealth.networkIntegrity}%`}}></div>
                    </div>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-500 font-mono">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> UPTIME: {new Date(systemHealth.uptime * 1000).toISOString().substr(11, 8)}
                </span>
                <span className="uppercase text-aegis-500">MODE: {detectionMode}</span>
            </div>
        </div>
    );
};

export default SystemStatusWidget;
