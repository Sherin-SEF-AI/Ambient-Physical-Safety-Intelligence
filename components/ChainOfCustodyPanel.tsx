
import React, { useState, useEffect } from 'react';
import { SecurityAlert } from '../types';
import { useSecurity } from '../context/SecurityContext';
import { generateDigitalWatermark, generateCaseFilePackage } from '../services/forensicService';
import { ShieldCheck, FileKey, Download, Clock, User, Hash, Eye, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
    alert: SecurityAlert;
    onClose: () => void;
}

const ChainOfCustodyPanel: React.FC<Props> = ({ alert, onClose }) => {
    const { currentUser, logAuditAction } = useSecurity();
    const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);

    useEffect(() => {
        // Generate watermark on mount
        generateDigitalWatermark(alert, currentUser).then(setWatermarkedImage);
    }, [alert]);

    const handleExport = () => {
        setIsGenerating(true);
        // Simulate processing delay
        setTimeout(() => {
            const packageData = generateCaseFilePackage(alert, alert.auditTrail);
            
            // Create Download
            const blob = new Blob([packageData], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CASE_${alert.id}_EVIDENCE_PKG.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            logAuditAction(alert.id, 'EXPORTED', `Full evidence package downloaded by ${currentUser}`);
            setIsGenerating(false);
            setIsDownloaded(true);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in">
            <div className="bg-aegis-900 border border-aegis-600 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">Close</button>
                
                <div className="p-6 border-b border-white/10 bg-black/40">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-6 h-6 text-aegis-accent" />
                        <h2 className="text-xl font-black text-white uppercase tracking-widest">Forensic Chain of Custody</h2>
                    </div>
                    <div className="flex gap-6 text-xs text-gray-400 font-mono">
                        <span>EXHIBIT ID: {alert.id}</span>
                        <span>HASH: {alert.compliance?.chainOfCustodyHash || 'PENDING_GENERATION'}</span>
                        <span>CLASSIFICATION: {alert.severity}</span>
                    </div>
                </div>

                <div className="flex-1 flex min-h-0">
                    {/* Left: Visual Evidence with Watermark Preview */}
                    <div className="w-1/2 p-6 border-r border-white/10 bg-black/20 flex flex-col gap-4">
                        <div className="bg-black border border-white/10 rounded-xl overflow-hidden relative group">
                            {watermarkedImage ? (
                                <img src={watermarkedImage} className="w-full h-auto object-contain" />
                            ) : (
                                <div className="h-64 flex items-center justify-center text-aegis-accent"><Loader2 className="w-8 h-8 animate-spin" /></div>
                            )}
                            <div className="absolute inset-0 pointer-events-none border-4 border-aegis-accent/20"></div>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-4 font-mono text-[10px] text-gray-400 overflow-y-auto">
                            <h4 className="text-aegis-accent font-bold mb-2 uppercase">Meta-Data Manifest</h4>
                            <pre>{JSON.stringify(alert.intent, null, 2)}</pre>
                        </div>
                    </div>

                    {/* Right: Audit Log & Actions */}
                    <div className="w-1/2 flex flex-col bg-aegis-800/30">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FileKey className="w-4 h-4 text-green-400" />
                                Immutable Audit Ledger
                            </h3>
                            
                            <div className="relative border-l border-white/10 ml-2 space-y-6">
                                {alert.auditTrail?.map((log, idx) => (
                                    <div key={idx} className="relative pl-6">
                                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-aegis-600 border border-aegis-400"></div>
                                        <div className="flex justify-between items-start">
                                            <div className="text-[10px] font-mono text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
                                            <div className="text-[9px] font-black text-aegis-accent uppercase border border-aegis-500/30 px-1.5 rounded">{log.action}</div>
                                        </div>
                                        <div className="text-white text-xs font-bold mt-1 flex items-center gap-2">
                                            <User className="w-3 h-3 text-gray-400" /> {log.user}
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-1">{log.details}</p>
                                        {log.hash && <div className="text-[8px] font-mono text-gray-600 mt-1 flex items-center gap-1"><Hash className="w-2 h-2"/> {log.hash}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-black/40">
                            <button 
                                onClick={handleExport}
                                disabled={isGenerating}
                                className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl ${
                                    isDownloaded 
                                    ? 'bg-green-600 text-white cursor-default'
                                    : 'bg-aegis-600 hover:bg-aegis-500 text-white'
                                }`}
                            >
                                {isGenerating ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Signing & Compressing Package...</>
                                ) : isDownloaded ? (
                                    <><CheckCircle2 className="w-4 h-4" /> Secure Package Exported</>
                                ) : (
                                    <><Download className="w-4 h-4" /> Generate Legal Export Package</>
                                )}
                            </button>
                            <p className="text-center text-[9px] text-gray-600 mt-3 font-mono">
                                * Export includes watermarked media, JSON metadata, and cryptographic audit logs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChainOfCustodyPanel;
