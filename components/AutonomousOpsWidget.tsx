
import React, { useMemo } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { AgentAction, ActionStatus, DecisionTier } from '../types';
import { Shield, CheckCircle, Clock, Ban, AlertTriangle, ChevronRight, Play } from 'lucide-react';

const AutonomousOpsWidget: React.FC = () => {
    const { alerts } = useSecurity();

    // Filter alerts that have meaningful actions attached
    const actionLog = useMemo(() => {
        return alerts
            .filter(a => a.autonomousAction !== AgentAction.NONE)
            .slice(0, 50); // Keep last 50
    }, [alerts]);

    const latestAction = actionLog[0];

    const getStatusIcon = (status: ActionStatus) => {
        switch(status) {
            case ActionStatus.EXECUTED: return <CheckCircle className="w-3 h-3 text-green-400" />;
            case ActionStatus.PENDING_APPROVAL: return <Clock className="w-3 h-3 text-yellow-400" />;
            case ActionStatus.REQUIRES_HUMAN: return <AlertTriangle className="w-3 h-3 text-red-400" />;
            default: return <Clock className="w-3 h-3 text-gray-400" />;
        }
    };

    const getStatusColor = (status: ActionStatus) => {
        switch(status) {
            case ActionStatus.EXECUTED: return 'text-green-400 bg-green-500/10 border-green-500/30';
            case ActionStatus.PENDING_APPROVAL: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            case ActionStatus.REQUIRES_HUMAN: return 'text-red-400 bg-red-500/10 border-red-500/30';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
        }
    };

    return (
        <div className="bg-aegis-800 rounded-xl border border-aegis-700 flex flex-col h-full shadow-lg overflow-hidden">
            <div className="p-3 border-b border-aegis-700 bg-aegis-900/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <h3 className="text-white font-bold text-xs uppercase">Autonomous Ops</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] text-gray-400 font-mono">DAEMON_ACTIVE</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 relative">
                {actionLog.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <Shield className="w-8 h-8 mb-2" />
                        <span className="text-[10px] uppercase">No Actions Logged</span>
                    </div>
                ) : (
                    actionLog.map((alert, idx) => (
                        <div key={alert.id} className={`p-2 rounded border transition-all ${idx === 0 ? 'bg-aegis-700/50 border-aegis-500/50 shadow-md' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] text-gray-400 font-mono">{new Date(alert.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
                                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${getStatusColor(alert.actionStatus)}`}>
                                    {getStatusIcon(alert.actionStatus)}
                                    {alert.actionStatus === ActionStatus.PENDING_APPROVAL ? 'PENDING' : 'DONE'}
                                </div>
                            </div>
                            
                            <div className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                                {alert.autonomousAction.replace(/_/g, ' ')}
                            </div>
                            
                            <div className="text-[9px] text-gray-400 flex justify-between items-center">
                                <span className="truncate max-w-[120px]">{alert.location}</span>
                                <span className="text-aegis-500 font-mono">{alert.decisionTier.replace('TIER_', '')}</span>
                            </div>

                            {/* Manual Override for Pending */}
                            {alert.actionStatus === ActionStatus.PENDING_APPROVAL && (
                                <div className="mt-2 flex gap-1">
                                    <button className="flex-1 bg-green-600 hover:bg-green-500 text-white text-[9px] font-bold py-1 rounded flex items-center justify-center gap-1">
                                        <Play className="w-2 h-2" /> APPROVE
                                    </button>
                                    <button className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[9px] font-bold py-1 rounded flex items-center justify-center gap-1">
                                        <Ban className="w-2 h-2" /> ABORT
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AutonomousOpsWidget;
