
import React, { useMemo } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { Users, Wind, AlertTriangle, Zap, DoorOpen, Lightbulb, Activity, ArrowUpRight } from 'lucide-react';
import { Severity, AgentAction } from '../types';

const CrowdControlWidget: React.FC = () => {
    const { alerts, globalLockdown, setGlobalLockdown } = useSecurity();

    // Find the latest alert with crowd metrics
    const latestCrowdAlert = useMemo(() => {
        return alerts.find(a => a.crowdMetrics !== undefined) || null;
    }, [alerts]);

    const metrics = latestCrowdAlert?.crowdMetrics || {
        density: 15,
        flowVector: 'STAGNANT',
        sentiment: 'CALM',
        tensionLevel: 10,
        anomalyScore: 5
    };

    const isHighTension = metrics.tensionLevel > 70;
    const isCrushRisk = metrics.density > 80;

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'PANIC': return 'text-red-500 bg-red-900/20 border-red-500/30';
            case 'HOSTILE': return 'text-red-600 bg-red-950/40 border-red-600/50';
            case 'AGITATED': return 'text-orange-500 bg-orange-900/20 border-orange-500/30';
            case 'JOYOUS': return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
            default: return 'text-green-400 bg-green-900/20 border-green-500/30';
        }
    };

    const autonomousActions = useMemo(() => {
        const actions = [];
        if (isHighTension) actions.push({ icon: Lightbulb, label: 'STROBE DISPERSAL', active: true });
        if (isCrushRisk) actions.push({ icon: DoorOpen, label: 'EMERGENCY EGRESS', active: true });
        return actions;
    }, [isHighTension, isCrushRisk]);

    return (
        <div className={`rounded-xl border flex flex-col h-full overflow-hidden transition-all duration-500 ${isHighTension ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : 'bg-aegis-800 border-aegis-700 shadow-lg'}`}>
            <div className="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 ${isHighTension ? 'text-red-500 animate-bounce' : 'text-blue-400'}`} />
                    <h3 className="text-white font-bold text-xs uppercase tracking-widest">Crowd Dynamics</h3>
                </div>
                {isHighTension && (
                    <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded animate-pulse">PROTOCOL ACTIVE</span>
                )}
            </div>

            <div className="flex-1 p-3 flex flex-col gap-4">
                {/* Tension Gauge */}
                <div className="relative pt-2">
                    <div className="flex justify-between text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                        <span>Calm</span>
                        <span className={isHighTension ? 'text-red-500' : 'text-gray-500'}>Critical Tension</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ${isHighTension ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-green-500'}`}
                            style={{ width: `${metrics.tensionLevel}%` }}
                        ></div>
                    </div>
                    <div className="mt-1 text-right text-[10px] font-mono text-white">{metrics.tensionLevel}/100</div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2 rounded border flex flex-col items-center justify-center text-center ${getSentimentColor(metrics.sentiment)}`}>
                        <div className="text-[9px] font-black uppercase mb-1">Sentiment</div>
                        <div className="text-xs font-bold">{metrics.sentiment}</div>
                    </div>
                    <div className="bg-black/30 border border-white/10 p-2 rounded flex flex-col items-center justify-center text-center">
                        <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Flow Vector</div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                            <Wind className="w-3 h-3 text-blue-400" />
                            {metrics.flowVector}
                        </div>
                    </div>
                </div>

                {/* Autonomous Response */}
                <div className="mt-auto">
                    <div className="text-[9px] font-black text-gray-500 uppercase mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Autonomous Response
                    </div>
                    {autonomousActions.length > 0 ? (
                        <div className="space-y-2">
                            {autonomousActions.map((action, i) => (
                                <div key={i} className="flex items-center justify-between bg-red-900/30 border border-red-500/30 p-2 rounded animate-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-2 text-red-200 text-[10px] font-bold">
                                        <action.icon className="w-3 h-3" />
                                        {action.label}
                                    </div>
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-[10px] text-gray-600 italic text-center py-2 border border-dashed border-white/5 rounded">
                            Standby - No Intervention Required
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CrowdControlWidget;
