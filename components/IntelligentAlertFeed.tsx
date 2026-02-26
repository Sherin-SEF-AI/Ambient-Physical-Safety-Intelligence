
import React, { useState, useMemo } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { AlertCluster, Severity, FeedbackType, SecurityAlert, AgentAction } from '../types';
import { 
    Layers, CheckCircle, X, MapPin, 
    Zap, Fingerprint, Target, FileText,
    AlertTriangle, ShieldCheck, AlertOctagon, Info, Crosshair
} from 'lucide-react';

const AlertItem: React.FC<{ 
    alert: SecurityAlert; 
    isExpanded: boolean; 
    toggleExpand: () => void;
    onPin: (alert: SecurityAlert) => void;
    isPinned: boolean;
    onTrace: (snapshot: string) => void;
    onAddNote: (alertId: string) => void;
}> = ({ alert, isExpanded, toggleExpand, onPin, isPinned, onTrace, onAddNote }) => {
    const { updateAlertFeedback } = useSecurity();

    const getSeverityStyles = (s: Severity) => {
        switch(s) {
            case Severity.CRITICAL: return { accent: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-500/5' };
            case Severity.HIGH: return { accent: 'bg-orange-500', text: 'text-orange-500', bg: 'bg-orange-500/5' };
            case Severity.MEDIUM: return { accent: 'bg-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-500/5' };
            default: return { accent: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/5' };
        }
    };

    const styles = getSeverityStyles(alert.severity);

    return (
        <div className={`group border-b border-white/5 last:border-0 transition-all ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'} ${styles.bg}`}>
            <div 
                className="flex items-center gap-2 p-2 cursor-pointer relative"
                onClick={toggleExpand}
            >
                {/* Severity Indicator Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${styles.accent}`}></div>

                {/* Compact Thumbnail */}
                {alert.snapshot ? (
                    <div className="w-8 h-8 rounded bg-black border border-white/10 overflow-hidden shrink-0">
                        <img src={alert.snapshot} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-gray-600" />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center leading-none mb-1">
                        <span className={`text-[10px] font-bold uppercase truncate ${styles.text}`}>
                            {alert.threatType}
                        </span>
                        <span className="text-[8px] font-mono text-gray-600">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-gray-500">
                        <div className="flex items-center gap-1.5 truncate">
                            <span>{alert.location}</span>
                            {alert.weaponDetected && <span className="text-red-500 font-black flex items-center gap-0.5"><Crosshair className="w-2 h-2"/> WPN</span>}
                        </div>
                        <div className="font-mono">{Math.round(alert.confidence)}%</div>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-2 pb-2 pl-4">
                    <div className="bg-black/40 rounded p-2 border border-white/5 mb-2">
                        <div className="text-[9px] text-gray-300 italic leading-tight line-clamp-3">
                            "{alert.reasoning}"
                        </div>
                        
                        {alert.visualSignature && (
                            <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-2 gap-1 text-[8px] font-mono text-gray-500">
                                <div><span className="text-gray-600">UPR:</span> {alert.visualSignature.torso}</div>
                                <div><span className="text-gray-600">LWR:</span> {alert.visualSignature.legs}</div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-1.5 justify-end">
                        {alert.snapshot && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onTrace(alert.snapshot!); }}
                                className="px-2 py-1 bg-white/5 hover:bg-aegis-700 text-gray-400 hover:text-aegis-accent border border-white/10 rounded text-[8px] font-bold uppercase flex items-center gap-1"
                            >
                                <Target className="w-2.5 h-2.5" /> TRACE
                            </button>
                        )}
                        <button 
                            onClick={(e) => { e.stopPropagation(); updateAlertFeedback(alert.id, FeedbackType.TRUE_POSITIVE); }}
                            className="px-2 py-1 bg-green-900/30 hover:bg-green-600 text-green-500 hover:text-white border border-green-500/30 rounded text-[8px] font-bold uppercase flex items-center gap-1"
                        >
                            <CheckCircle className="w-2.5 h-2.5" /> VERIFY
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); updateAlertFeedback(alert.id, FeedbackType.FALSE_POSITIVE); }}
                            className="px-2 py-1 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 rounded text-[8px] font-bold uppercase flex items-center gap-1"
                        >
                            <X className="w-2.5 h-2.5" /> DISMISS
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const IntelligentAlertFeed: React.FC = () => {
  const { alertClusters, resolveCluster, pinnedEvidence, togglePin, initiateVisualReID, addLogEntry, currentUser } = useSecurity();
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAddNote = (alertId: string) => {
      const note = window.prompt("Enter log note for this alert:");
      if (note) {
          addLogEntry({
              id: `LOG-${Date.now()}`,
              timestamp: new Date().toISOString(),
              user: currentUser,
              type: 'ALERT_ANNOTATION',
              content: note,
              relatedAlertId: alertId
          });
      }
  };

  const filteredClusters = useMemo(() => {
      return alertClusters
        .filter(c => c.status === 'ACTIVE')
        .filter(c => filterSeverity === 'ALL' || c.severity === filterSeverity)
        .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
  }, [alertClusters, filterSeverity]);

  const isPinned = (id: string) => pinnedEvidence.some(p => p.id === id);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black/20">
        <div className="px-2 py-1.5 border-b border-aegis-800 bg-aegis-900/50 flex justify-between items-center shrink-0">
            <h3 className="text-white font-bold text-[10px] uppercase flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-aegis-accent" />
                Alert Stream
            </h3>
            <select 
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value as any)}
                className="bg-black/40 border border-white/5 text-[9px] font-bold rounded px-2 py-0.5 outline-none text-gray-400 focus:border-aegis-accent uppercase"
            >
                <option value="ALL">ALL</option>
                <option value={Severity.CRITICAL}>CRIT</option>
                <option value={Severity.HIGH}>HIGH</option>
                <option value={Severity.MEDIUM}>MED</option>
            </select>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredClusters.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-gray-700 gap-2">
                    <ShieldCheck className="w-8 h-8 opacity-20" />
                    <span className="text-[9px] font-mono uppercase tracking-widest">No Active Signals</span>
                </div>
            ) : (
                filteredClusters.map((cluster) => (
                    <div key={cluster.id} className="relative">
                        {cluster.alerts.length > 1 && (
                            <div className="px-2 py-1 bg-white/5 text-[8px] font-mono text-gray-500 border-b border-white/5 flex justify-between">
                                <span>CLUSTER_{cluster.id.slice(-4)}</span>
                                <span>{cluster.alerts.length} EVENTS</span>
                            </div>
                        )}
                        <AlertItem 
                            alert={cluster.alerts[0]} 
                            isExpanded={expandedId === cluster.alerts[0].id} 
                            toggleExpand={() => setExpandedId(expandedId === cluster.alerts[0].id ? null : cluster.alerts[0].id)}
                            onPin={togglePin}
                            isPinned={isPinned(cluster.alerts[0].id)}
                            onTrace={initiateVisualReID}
                            onAddNote={handleAddNote}
                        />
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default IntelligentAlertFeed;
