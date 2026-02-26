
import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { LogBookEntry, BoloSubject } from '../types';
import { ClipboardList, UserCheck, Clock, Plus, Save, Bell, AlertTriangle, Search, FileText } from 'lucide-react';

const ShiftLogbook: React.FC = () => {
    const { currentShift, startShift, endShift, logEntries, addLogEntry, bolos, addBolo, removeBolo, currentUser } = useSecurity();
    const [noteContent, setNoteContent] = useState('');
    const [officerName, setOfficerName] = useState('');
    const [boloName, setBoloName] = useState('');
    const [boloDesc, setBoloDesc] = useState('');
    const [activeTab, setActiveTab] = useState<'LOGS' | 'BOLO'>('LOGS');

    const handleStartShift = () => {
        if (officerName.trim()) startShift(officerName);
    };

    const handleAddNote = () => {
        if (!noteContent.trim()) return;
        addLogEntry({
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: currentUser,
            type: 'MANUAL_NOTE',
            content: noteContent
        });
        setNoteContent('');
    };

    const handleAddBolo = () => {
        if (!boloName || !boloDesc) return;
        addBolo({
            id: `BOLO-${Date.now()}`,
            name: boloName,
            description: boloDesc,
            reason: 'Manual Entry',
            active: true,
            addedBy: currentUser,
            timestamp: new Date().toISOString()
        });
        setBoloName('');
        setBoloDesc('');
    };

    return (
        <div className="h-full flex flex-col p-6 gap-6 bg-[#0B1221]">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ClipboardList className="text-aegis-accent w-8 h-8" />
                    DIGITAL LOGBOOK & SHIFT MANAGER
                </h1>
                
                {/* Shift Control */}
                <div className="bg-aegis-800 p-2 rounded-xl border border-aegis-700 flex items-center gap-4">
                    {currentShift.status === 'ACTIVE' ? (
                        <>
                            <div className="flex flex-col items-end px-2">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Officer On Duty</span>
                                <span className="text-white font-mono text-sm">{currentShift.officerOnDuty}</span>
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <div className="flex flex-col items-end px-2">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Shift Start</span>
                                <span className="text-green-400 font-mono text-sm">{new Date(currentShift.startTime).toLocaleTimeString()}</span>
                            </div>
                            <button onClick={endShift} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                END SHIFT
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <input 
                                value={officerName} 
                                onChange={e => setOfficerName(e.target.value)} 
                                placeholder="Enter Officer Name"
                                className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-aegis-accent outline-none"
                            />
                            <button onClick={handleStartShift} className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                START SHIFT
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Left: Main Log */}
                <div className="flex-[2] bg-aegis-800 rounded-xl border border-aegis-700 flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-4 bg-aegis-900/50 border-b border-aegis-700 flex justify-between items-center">
                        <div className="flex gap-2">
                            <button onClick={() => setActiveTab('LOGS')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'LOGS' ? 'bg-aegis-600 text-white' : 'text-gray-400 hover:text-white'}`}>SHIFT LOGS</button>
                            <button onClick={() => setActiveTab('BOLO')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'BOLO' ? 'bg-aegis-600 text-white' : 'text-gray-400 hover:text-white'}`}>BOLO LIST ({bolos.length})</button>
                        </div>
                    </div>

                    {activeTab === 'LOGS' && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/20">
                                {logEntries.length === 0 && <div className="text-center text-gray-500 py-10 text-xs">No logs for current shift.</div>}
                                {logEntries.map((log) => (
                                    <div key={log.id} className="flex gap-4 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex flex-col items-center min-w-[60px]">
                                            <span className="text-[10px] text-gray-500 font-mono">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                            {log.type === 'SYSTEM_EVENT' && <Clock className="w-4 h-4 text-gray-600 mt-1" />}
                                            {log.type === 'MANUAL_NOTE' && <FileText className="w-4 h-4 text-blue-400 mt-1" />}
                                            {log.type === 'SHIFT_CHANGE' && <UserCheck className="w-4 h-4 text-green-400 mt-1" />}
                                            {log.type === 'ALERT_ANNOTATION' && <AlertTriangle className="w-4 h-4 text-orange-400 mt-1" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-white">{log.user}</span>
                                                <span className="text-[9px] bg-black/40 px-2 py-0.5 rounded text-gray-400 uppercase">{log.type.replace('_', ' ')}</span>
                                            </div>
                                            <p className="text-sm text-gray-300 mt-1">{log.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-aegis-900/50 border-t border-aegis-700">
                                <div className="flex gap-2">
                                    <input 
                                        value={noteContent}
                                        onChange={e => setNoteContent(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                                        placeholder="Add log entry..."
                                        className="flex-1 bg-black/40 border border-aegis-600 rounded-lg px-4 py-2 text-sm text-white focus:border-aegis-accent outline-none"
                                        disabled={currentShift.status !== 'ACTIVE'}
                                    />
                                    <button 
                                        onClick={handleAddNote}
                                        disabled={currentShift.status !== 'ACTIVE'}
                                        className="bg-aegis-600 hover:bg-aegis-500 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'BOLO' && (
                        <div className="flex-1 flex flex-col p-6">
                            <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl mb-6">
                                <h3 className="text-red-400 font-bold text-xs uppercase mb-3 flex items-center gap-2"><Bell className="w-4 h-4" /> Create New BOLO</h3>
                                <div className="flex flex-col gap-3">
                                    <input value={boloName} onChange={e => setBoloName(e.target.value)} placeholder="Subject Name / ID" className="bg-black/40 border border-red-500/30 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none" />
                                    <textarea value={boloDesc} onChange={e => setBoloDesc(e.target.value)} placeholder="Description & Reason..." className="bg-black/40 border border-red-500/30 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none h-20 resize-none" />
                                    <button onClick={handleAddBolo} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg text-xs self-end px-6">BROADCAST BOLO</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar">
                                {bolos.map(bolo => (
                                    <div key={bolo.id} className="bg-black/40 border border-white/10 rounded-xl p-4 relative group hover:border-red-500/50 transition-all">
                                        <button onClick={() => removeBolo(bolo.id)} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Search className="w-4 h-4" /></button>
                                        <div className="text-red-500 font-black text-sm uppercase tracking-widest mb-1">ACTIVE BOLO</div>
                                        <h4 className="text-white font-bold text-lg">{bolo.name}</h4>
                                        <p className="text-gray-400 text-xs mt-2 italic">"{bolo.description}"</p>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                                            <span>BY: {bolo.addedBy}</span>
                                            <span>{new Date(bolo.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Quick Actions */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-aegis-800 rounded-xl border border-aegis-700 p-6 shadow-xl">
                        <h3 className="text-white font-bold text-xs uppercase mb-4">Shift Briefing</h3>
                        <div className="bg-yellow-900/20 border border-yellow-500/20 p-4 rounded-lg text-yellow-200 text-sm">
                            <p className="font-bold mb-2">PASS DOWN NOTES:</p>
                            <ul className="list-disc pl-4 space-y-1 text-xs">
                                <li>Loading dock door sensor malfunction (Ticket #402).</li>
                                <li>VIP Visit expected at 14:00 hours.</li>
                                <li>Maintenance crew in Sector 4 until 10:00.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShiftLogbook;
