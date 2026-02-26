
import React, { useMemo } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { Target, Search, ArrowUpRight, Activity } from 'lucide-react';
import { BehavioralState, Severity } from '../types';

const ActiveEntityTracker: React.FC = () => {
  const { alerts, initiateVisualReID, togglePin, pinnedEvidence } = useSecurity();

  const trackedEntities = useMemo(() => {
    const groups: Record<string, any> = {};
    
    alerts.forEach(alert => {
        const id = alert.tracking?.entityId;
        if (!id) return;
        
        if (!groups[id]) {
            groups[id] = {
                id: id,
                latestAlert: alert,
                path: [], 
                sightings: 0,
                firstSeen: alert.timestamp,
                riskScore: 0,
                visualDNA: alert.visualSignature,
                lastLocation: alert.location
            };
        }

        let bonusRisk = 0;
        if (alert.severity === Severity.CRITICAL) bonusRisk += 40;
        if (alert.severity === Severity.HIGH) bonusRisk += 20;
        if (alert.intent?.behavioralState === BehavioralState.RUNNING) bonusRisk += 15;
        if (alert.weaponDetected) bonusRisk += 50;

        const currentRisk = Math.min(100, Math.max(groups[id].riskScore, bonusRisk + (alert.confidence / 5)));
        groups[id].riskScore = currentRisk;
        
        groups[id].sightings++;
        
        if (new Date(alert.timestamp) > new Date(groups[id].latestAlert.timestamp)) {
            groups[id].latestAlert = alert;
            groups[id].visualDNA = alert.visualSignature;
            groups[id].lastLocation = alert.location;
        }
    });

    return Object.values(groups)
        .sort((a: any, b: any) => b.riskScore - a.riskScore) // Sort by risk
        .slice(0, 5); 
  }, [alerts]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black/20">
        <div className="px-2 py-1.5 border-b border-aegis-800 bg-aegis-900/50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-1.5">
                <Target className="w-3 h-3 text-aegis-accent" />
                <h3 className="text-white font-bold text-[10px] uppercase">Entity Overwatch</h3>
            </div>
            <span className="text-[9px] font-mono text-gray-500">{trackedEntities.length} ACTIVE</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-1">
            {trackedEntities.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-1 opacity-50">
                    <Search className="w-6 h-6" />
                    <p className="text-[9px] font-bold uppercase">No Tracks</p>
                </div>
            ) : (
                trackedEntities.map((entity: any) => (
                    <div key={entity.id} className="group flex items-center gap-2 p-1.5 rounded border border-white/5 bg-black/40 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => initiateVisualReID(entity.latestAlert.snapshot!)}>
                        {/* Avatar */}
                        <div className="relative w-8 h-8 rounded bg-gray-900 overflow-hidden border border-white/10 shrink-0">
                            {entity.latestAlert.snapshot && (
                                <img src={entity.latestAlert.snapshot} className="w-full h-full object-cover opacity-80" />
                            )}
                            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${entity.riskScore > 60 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-white truncate">{entity.id}</span>
                                <span className={`text-[9px] font-black ${entity.riskScore > 75 ? 'text-red-500' : 'text-gray-500'}`}>{Math.round(entity.riskScore)}% RISK</span>
                            </div>
                            <div className="flex justify-between items-center mt-0.5">
                                <span className="text-[8px] text-gray-500 font-mono truncate max-w-[80px]">{entity.lastLocation}</span>
                                <div className="flex items-center gap-1 text-[8px] text-gray-600">
                                    <Activity className="w-2.5 h-2.5" />
                                    <span>{entity.sightings} SIGHTINGS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default ActiveEntityTracker;
