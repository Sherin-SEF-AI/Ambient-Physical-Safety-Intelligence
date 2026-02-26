
import React, { useState, useMemo } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { SecurityAlert, Severity, FeedbackType } from '../types';
import { 
  Search, Filter, Calendar, Download, CheckCircle, XCircle, 
  AlertTriangle, Eye, MapPin, Clock, Brain, ChevronRight, 
  ArrowUpRight, FileJson, Shield, Crosshair, User, Pin, PinOff, SearchCode,
  Trash2, BarChart2
} from 'lucide-react';

const AlertHistoryView: React.FC = () => {
  const { alerts, updateAlertFeedback, pinnedEvidence, togglePin, initiateVisualReID } = useSecurity();
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [filterText, setFilterText] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'ALL'>('ALL');
  const [filterFeedback, setFilterFeedback] = useState<FeedbackType | 'ALL' | 'PENDING'>('ALL');

  const filteredAlerts = useMemo(() => {
    const searchText = (filterText || '').toLowerCase();
    return alerts.filter(alert => {
      const threatType = (alert.threatType || '').toLowerCase();
      const location = (alert.location || '').toLowerCase();
      const id = (alert.id || '').toLowerCase();
      const description = (alert.description || '').toLowerCase();

      const matchesText = 
        threatType.includes(searchText) ||
        location.includes(searchText) ||
        id.includes(searchText) ||
        description.includes(searchText);

      const matchesSeverity = filterSeverity === 'ALL' || alert.severity === filterSeverity;
      
      const matchesFeedback = 
        filterFeedback === 'ALL' ? true :
        filterFeedback === 'PENDING' ? !alert.feedback :
        alert.feedback === filterFeedback;

      return matchesText && matchesSeverity && matchesFeedback;
    });
  }, [alerts, filterText, filterSeverity, filterFeedback]);

  const stats = useMemo(() => {
      return {
          total: alerts.length,
          critical: alerts.filter(a => a.severity === Severity.CRITICAL).length,
          verified: alerts.filter(a => a.feedback === FeedbackType.TRUE_POSITIVE).length,
          falsePositive: alerts.filter(a => a.feedback === FeedbackType.FALSE_POSITIVE).length
      }
  }, [alerts]);

  const getSeverityColor = (s: Severity) => {
      switch(s) {
          case Severity.CRITICAL: return 'text-red-500 bg-red-500/10 border-red-500/20';
          case Severity.HIGH: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
          case Severity.MEDIUM: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
          case Severity.LOW: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
          default: return 'text-gray-400 bg-gray-800 border-gray-700';
      }
  };

  const handleExport = () => {
      const dataStr = JSON.stringify(filteredAlerts, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aegis-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const isPinned = (id: string) => pinnedEvidence.some(e => e.id === id);

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-hidden">
      {/* Header & Stats HUD */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="text-aegis-accent" />
            INCIDENT ARCHIVE
          </h1>
          <p className="text-gray-400 text-sm">Forensic Log Review & Verification</p>
        </div>
        
        <div className="flex gap-4">
            <div className="bg-aegis-800 border border-aegis-700 px-4 py-2 rounded-xl flex items-center gap-3">
                <div className="text-[10px] text-gray-500 uppercase font-bold text-right">
                    Total Logs<br/>
                    <span className="text-lg text-white font-mono">{stats.total}</span>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="text-[10px] text-gray-500 uppercase font-bold">
                    Critical<br/>
                    <span className="text-lg text-red-500 font-mono">{stats.critical}</span>
                </div>
            </div>
            <button 
                onClick={handleExport}
                className="bg-aegis-700 hover:bg-aegis-600 text-white px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-sm font-bold transition-all shadow-lg"
            >
                <Download className="w-4 h-4" /> Export JSON
            </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-aegis-800/50 p-4 rounded-2xl border border-aegis-700 flex flex-wrap gap-4 items-center shrink-0 shadow-xl backdrop-blur-md">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search threats, nodes, or descriptions..."
            className="w-full bg-black/40 border border-aegis-600 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-aegis-accent outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as any)}
                className="bg-black/40 border border-aegis-600 text-gray-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-aegis-accent"
            >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
            </select>
        </div>

        <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-gray-500" />
            <select 
                value={filterFeedback}
                onChange={(e) => setFilterFeedback(e.target.value as any)}
                className="bg-black/40 border border-aegis-600 text-gray-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-aegis-accent"
            >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending Review</option>
                <option value="TRUE_POSITIVE">Verified Positive</option>
                <option value="FALSE_POSITIVE">False Positive</option>
                <option value="NEEDS_CORRECTION">Correction Req</option>
            </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-6">
        {/* Alerts List */}
        <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-aegis-900/50 p-4 border-b border-white/5 flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest shrink-0">
                <div className="flex gap-12">
                    <span className="w-32">Timestamp</span>
                    <span className="w-40">Threat Type</span>
                    <span className="w-32">Location</span>
                </div>
                <span>Status</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredAlerts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                        <SearchCode className="w-16 h-16 opacity-10" />
                        <p className="text-lg">No alerts match your filter criteria.</p>
                    </div>
                ) : (
                    filteredAlerts.map((alert) => (
                        <div 
                            key={alert.id}
                            onClick={() => setSelectedAlert(alert)}
                            className={`flex items-center justify-between p-4 border-b border-white/5 cursor-pointer transition-all group ${selectedAlert?.id === alert.id ? 'bg-aegis-600/20 border-aegis-500' : 'hover:bg-white/5'}`}
                        >
                            <div className="flex gap-12 items-center flex-1">
                                <div className="w-32 text-[11px] font-mono text-gray-400">
                                    {new Date(alert.timestamp).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="w-40 flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${alert.severity === Severity.CRITICAL ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                    <span className={`text-xs font-bold ${alert.severity === Severity.CRITICAL ? 'text-white' : 'text-gray-300'}`}>{alert.threatType}</span>
                                </div>
                                <div className="w-32 text-xs text-gray-400 flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3" />
                                    {alert.location}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {isPinned(alert.id) && <Pin className="w-3 h-3 text-aegis-accent" />}
                                {alert.feedback ? (
                                    <div className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${
                                        alert.feedback === FeedbackType.TRUE_POSITIVE ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                                        alert.feedback === FeedbackType.FALSE_POSITIVE ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                                        'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                                    }`}>
                                        {alert.feedback.replace('_', ' ')}
                                    </div>
                                ) : (
                                    <div className="px-2 py-1 rounded text-[9px] font-black uppercase border border-gray-600 text-gray-500">PENDING</div>
                                )}
                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedAlert?.id === alert.id ? 'translate-x-1 text-aegis-accent' : 'text-gray-700 group-hover:text-gray-400'}`} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Preview Panel */}
        <div className={`w-96 shrink-0 flex flex-col gap-6 transition-all duration-500 ${selectedAlert ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}>
             {selectedAlert && (
                 <>
                    <div className="bg-aegis-800 rounded-2xl border border-aegis-700 overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-right-4">
                        <div className="p-4 border-b border-aegis-700 bg-aegis-900/50 flex justify-between items-center">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Eye className="w-4 h-4 text-aegis-accent" />
                                Incident Intelligence
                            </h3>
                            <button onClick={() => setSelectedAlert(null)} className="text-gray-500 hover:text-white transition-colors">
                                <ArrowUpRight className="w-4 h-4 rotate-45" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                            <div className="rounded-xl overflow-hidden bg-black aspect-video relative group border border-white/10">
                                {selectedAlert.snapshot ? (
                                    <img src={selectedAlert.snapshot} className="w-full h-full object-cover" alt="Evidence" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-700 italic text-xs">No Visual Evidence Captured</div>
                                )}
                                <div className="absolute top-2 left-2 flex gap-1">
                                     <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${getSeverityColor(selectedAlert.severity)}`}>
                                         {selectedAlert.severity}
                                     </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Brain className="w-3 h-3 text-aegis-accent" /> Neural Assessment
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed font-mono italic">
                                        "{selectedAlert.reasoning}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="text-[8px] text-gray-500 uppercase font-black mb-1">Confidence</div>
                                        <div className="text-lg font-bold text-white font-mono">{Math.round(selectedAlert.confidence)}%</div>
                                    </div>
                                    <div className={`bg-black/20 p-3 rounded-lg border border-white/5 ${selectedAlert.weaponDetected ? 'border-red-500/30' : ''}`}>
                                        <div className="text-[8px] text-gray-500 uppercase font-black mb-1">Weapon Status</div>
                                        <div className={`text-xs font-bold uppercase ${selectedAlert.weaponDetected ? 'text-red-500' : 'text-green-500'}`}>
                                            {selectedAlert.weaponDetected ? (selectedAlert.weaponType || 'DETECTED') : 'NONE'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                     <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Contextual Relevance</div>
                                     <p className="text-[11px] text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
                                         {selectedAlert.contextualRelevance || 'No environment-specific notes available for this node event.'}
                                     </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => togglePin(selectedAlert)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                                        isPinned(selectedAlert.id)
                                        ? 'bg-red-900/20 border-red-500/50 text-red-400 hover:bg-red-900/40'
                                        : 'bg-aegis-700 border-white/10 text-white hover:bg-aegis-600'
                                    }`}
                                >
                                    {isPinned(selectedAlert.id) ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                                    {isPinned(selectedAlert.id) ? 'UNPIN EXHIBIT' : 'PIN TO CASE'}
                                </button>
                                <button 
                                    onClick={() => initiateVisualReID(selectedAlert.snapshot!)}
                                    disabled={!selectedAlert.snapshot}
                                    className="flex-1 py-3 bg-aegis-accent hover:bg-white text-black rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg uppercase tracking-widest disabled:opacity-50"
                                >
                                    <Crosshair className="w-4 h-4" /> FORENSIC TRACE
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-aegis-900/50 border-t border-aegis-700 grid grid-cols-3 gap-2">
                             <button 
                                onClick={() => updateAlertFeedback(selectedAlert.id, FeedbackType.TRUE_POSITIVE)}
                                className={`p-2 rounded-lg border text-[9px] font-bold flex flex-col items-center gap-1 transition-all ${selectedAlert.feedback === FeedbackType.TRUE_POSITIVE ? 'bg-green-600 text-white border-green-500' : 'bg-black/40 text-gray-500 border-white/5 hover:border-green-500/50'}`}
                             >
                                 <CheckCircle className="w-3.5 h-3.5" /> VERIFY
                             </button>
                             <button 
                                onClick={() => updateAlertFeedback(selectedAlert.id, FeedbackType.FALSE_POSITIVE)}
                                className={`p-2 rounded-lg border text-[9px] font-bold flex flex-col items-center gap-1 transition-all ${selectedAlert.feedback === FeedbackType.FALSE_POSITIVE ? 'bg-red-600 text-white border-red-500' : 'bg-black/40 text-gray-500 border-white/5 hover:border-red-500/50'}`}
                             >
                                 <XCircle className="w-3.5 h-3.5" /> DISMISS
                             </button>
                             <button 
                                onClick={() => updateAlertFeedback(selectedAlert.id, FeedbackType.NEEDS_CORRECTION)}
                                className={`p-2 rounded-lg border text-[9px] font-bold flex flex-col items-center gap-1 transition-all ${selectedAlert.feedback === FeedbackType.NEEDS_CORRECTION ? 'bg-yellow-600 text-white border-yellow-500' : 'bg-black/40 text-gray-500 border-white/5 hover:border-yellow-500/50'}`}
                             >
                                 <AlertTriangle className="w-3.5 h-3.5" /> CORRECT
                             </button>
                        </div>
                    </div>
                 </>
             )}
        </div>
      </div>
    </div>
  );
};

export default AlertHistoryView;
