
import React, { useEffect, useState, useRef } from 'react';
import { AlertCluster, ResponseProtocol, ResponseStep, Severity } from '../types';
import { generateResponseProtocol, reconstructIncident } from '../services/geminiService';
import { 
    Siren, ChevronRight, CheckCircle, Clock, Play, AlertTriangle, Shield, 
    CheckCircle2, FileText, ChevronDown, ChevronUp, Zap, Scan, Bell, 
    Radio, Database, ArrowRight, Activity, Loader2, Lock, Sparkles
} from 'lucide-react';

interface Props {
    cluster: AlertCluster;
}

type WorkflowStage = 'DETECT' | 'ALERT' | 'DISPATCH' | 'FORENSIC';

const ResponseOrchestrator: React.FC<Props> = ({ cluster }) => {
    const [activeStage, setActiveStage] = useState<WorkflowStage>('DETECT');
    const [protocol, setProtocol] = useState<ResponseProtocol | null>(null);
    const [loadingProtocol, setLoadingProtocol] = useState(false);
    const [forensicId, setForensicId] = useState<string | null>(null);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const [autoPlay, setAutoPlay] = useState(true);

    // Simulation of workflow progression
    useEffect(() => {
        let timer: any;
        
        const runWorkflow = async () => {
            // Stage 1: DETECT (Instant, already happened via cluster prop)
            setActiveStage('DETECT');
            await new Promise(r => setTimeout(r, 1500));

            // Stage 2: ALERT (Route to personnel)
            setActiveStage('ALERT');
            await new Promise(r => setTimeout(r, 2000));

            // Stage 3: DISPATCH (Generate & Execute Protocol)
            setActiveStage('DISPATCH');
            setLoadingProtocol(true);
            try {
                const proto = await generateResponseProtocol(cluster);
                setProtocol(proto);
            } catch (e) {
                console.error("Protocol Gen Failed", e);
            } finally {
                setLoadingProtocol(false);
            }
        };

        runWorkflow();

        return () => clearTimeout(timer);
    }, [cluster.id]);

    // Auto-advance to Forensic when Dispatch is stabilized (simulated for demo)
    useEffect(() => {
        if (activeStage === 'DISPATCH' && protocol && !loadingProtocol) {
            const timer = setTimeout(async () => {
                setActiveStage('FORENSIC');
                try {
                    const report = await reconstructIncident(cluster.alerts);
                    setForensicId(report.id);
                } catch(e) { console.error(e); }
            }, 8000); // Allow time to view dispatch steps
            return () => clearTimeout(timer);
        }
    }, [activeStage, protocol, loadingProtocol, cluster.alerts]);

    const handleAction = (stepId: string) => {
        if (!protocol) return;
        setProtocol(prev => prev ? ({
            ...prev,
            steps: prev.steps.map(s => 
                s.id === stepId 
                ? { ...s, status: s.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED' } 
                : s
            )
        }) : null);
    };

    const toggleStep = (stepId: string) => {
        setExpandedStep(expandedStep === stepId ? null : stepId);
    }

    const renderStageIcon = (stage: WorkflowStage, current: WorkflowStage) => {
        const stages: WorkflowStage[] = ['DETECT', 'ALERT', 'DISPATCH', 'FORENSIC'];
        const isCompleted = stages.indexOf(stage) < stages.indexOf(current);
        const isActive = stage === current;

        let Icon = Shield;
        if (stage === 'DETECT') Icon = Scan;
        if (stage === 'ALERT') Icon = Bell;
        if (stage === 'DISPATCH') Icon = Radio;
        if (stage === 'FORENSIC') Icon = Database;

        return (
            <div className={`relative z-10 flex flex-col items-center gap-2 ${isActive ? 'scale-110' : 'opacity-60'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isActive ? 'bg-aegis-accent text-black border-aegis-accent shadow-[0_0_20px_rgba(0,240,255,0.5)]' :
                    isCompleted ? 'bg-green-500 text-black border-green-500' :
                    'bg-black/40 text-gray-500 border-gray-700'
                }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />}
                </div>
                <div className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-aegis-accent' : isCompleted ? 'text-green-500' : 'text-gray-600'}`}>
                    {stage}
                </div>
            </div>
        );
    };

    const getProgressBarWidth = () => {
        switch(activeStage) {
            case 'DETECT': return '12%';
            case 'ALERT': return '38%';
            case 'DISPATCH': return '64%';
            case 'FORENSIC': return '100%';
            default: return '0%';
        }
    };

    return (
        <div className="bg-aegis-900 border border-aegis-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full relative">
            {/* Header / Workflow Progress */}
            <div className="bg-black/40 p-6 pb-8 border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-aegis-accent/50 via-purple-500/50 to-aegis-accent/50 animate-scan-line"></div>
                
                <div className="flex justify-between items-center mb-8 relative z-20">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${cluster.severity === Severity.CRITICAL ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-orange-500/20 border-orange-500 text-orange-500'}`}>
                            <Siren className="w-6 h-6 animate-bounce" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white tracking-tight uppercase">Autonomous Response Engine</h2>
                            <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
                                <span>ID: {cluster.id}</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                <span className={cluster.severity === Severity.CRITICAL ? 'text-red-500 font-bold' : 'text-orange-400'}>{cluster.severity} PRIORITY</span>
                            </div>
                        </div>
                    </div>
                    {activeStage === 'FORENSIC' && (
                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-in fade-in">
                            <CheckCircle className="w-3 h-3" /> Workflow Complete
                        </div>
                    )}
                </div>

                <div className="relative mx-4">
                    {/* Progress Track */}
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-800 -z-0"></div>
                    <div className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-aegis-accent to-purple-500 transition-all duration-1000 -z-0" style={{ width: getProgressBarWidth() }}></div>
                    
                    <div className="flex justify-between relative z-10">
                        {renderStageIcon('DETECT', activeStage)}
                        {renderStageIcon('ALERT', activeStage)}
                        {renderStageIcon('DISPATCH', activeStage)}
                        {renderStageIcon('FORENSIC', activeStage)}
                    </div>
                </div>
            </div>

            {/* Dynamic Stage Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-aegis-800/50 p-4 relative min-h-0">
                
                {/* STAGE 1: DETECT */}
                {activeStage === 'DETECT' && (
                    <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping opacity-20"></div>
                            <Scan className="w-20 h-20 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Threat Detected</h3>
                        <p className="text-xs text-gray-400 font-mono bg-black/40 px-4 py-2 rounded border border-white/5">
                            Ingesting Sensor Node Data...
                        </p>
                    </div>
                )}

                {/* STAGE 2: ALERT */}
                {activeStage === 'ALERT' && (
                    <div className="h-full flex flex-col items-center justify-center animate-in slide-in-from-right-8 duration-500">
                        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                            <div className="bg-black/40 border border-aegis-500/30 p-4 rounded-xl flex items-center gap-3 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                                <Shield className="w-8 h-8 text-aegis-accent" />
                                <div>
                                    <div className="text-[9px] text-gray-500 uppercase font-black">Route 1</div>
                                    <div className="text-sm font-bold text-white">SOC Command</div>
                                </div>
                                <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                            </div>
                            <div className="bg-black/40 border border-aegis-500/30 p-4 rounded-xl flex items-center gap-3 shadow-[0_0_20px_rgba(0,240,255,0.1)] animation-delay-200">
                                <Zap className="w-8 h-8 text-yellow-400" />
                                <div>
                                    <div className="text-[9px] text-gray-500 uppercase font-black">Route 2</div>
                                    <div className="text-sm font-bold text-white">Site Response</div>
                                </div>
                                <Loader2 className="w-4 h-4 text-yellow-400 animate-spin ml-auto" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 font-mono animate-pulse">Broadcasting Alert Vectors...</p>
                    </div>
                )}

                {/* STAGE 3: DISPATCH (Protocol View) */}
                {activeStage === 'DISPATCH' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        {loadingProtocol ? (
                            <div className="flex flex-col items-center justify-center h-48 space-y-4">
                                <Loader2 className="w-12 h-12 text-aegis-accent animate-spin" />
                                <span className="text-xs font-mono text-aegis-accent tracking-widest">GENERATING TACTICAL RESPONSE...</span>
                            </div>
                        ) : protocol ? (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Radio className="w-4 h-4 text-green-400" /> Active Playbook: {protocol.playbookName}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> Context-Aware
                                        </span>
                                        <span className="text-[9px] bg-white/10 px-2 py-1 rounded text-white font-mono">{protocol.steps.length} STEPS</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {protocol.steps.map((step, idx) => (
                                        <div 
                                            key={step.id}
                                            className={`relative rounded-lg border transition-all overflow-hidden ${
                                                step.status === 'COMPLETED' ? 'bg-green-900/10 border-green-500/30 opacity-60' :
                                                step.status === 'IN_PROGRESS' ? 'bg-aegis-800 border-aegis-accent shadow-[0_0_15px_rgba(0,240,255,0.1)]' :
                                                'bg-black/20 border-white/5'
                                            }`}
                                        >
                                            <div className="p-3 flex justify-between items-center relative z-10">
                                                <div className="flex gap-3 items-center flex-1 cursor-pointer" onClick={() => toggleStep(step.id)}>
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold shrink-0 ${
                                                        step.status === 'COMPLETED' ? 'bg-green-500 border-green-500 text-black' :
                                                        step.status === 'IN_PROGRESS' ? 'bg-aegis-accent border-aegis-accent text-black animate-pulse' :
                                                        'border-gray-600 text-gray-500'
                                                    }`}>
                                                        {step.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`text-xs font-bold ${step.status === 'IN_PROGRESS' ? 'text-white' : 'text-gray-300'}`}>
                                                            {step.action}
                                                            {step.type === 'AUTOMATED' && <span className="ml-2 text-[8px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded uppercase">AUTO</span>}
                                                        </div>
                                                        <div className="text-[9px] text-gray-500 font-mono mt-0.5">TARGET: {step.target}</div>
                                                        {step.rationale && (
                                                            <div className="text-[9px] text-aegis-accent/70 mt-1 italic border-l-2 border-aegis-accent/30 pl-2">
                                                                "{step.rationale}"
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {step.status === 'IN_PROGRESS' && <Activity className="w-4 h-4 text-aegis-accent animate-pulse" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : null}
                    </div>
                )}

                {/* STAGE 4: FORENSIC */}
                {activeStage === 'FORENSIC' && (
                    <div className="h-full flex flex-col items-center justify-center animate-in slide-in-from-bottom-8 duration-500">
                        <div className="bg-aegis-800/50 border border-aegis-500/30 p-8 rounded-2xl max-w-sm w-full shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50 group-hover:opacity-100 animate-scan-line"></div>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-green-900/30 rounded-full border border-green-500/30">
                                    <Database className="w-8 h-8 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Case Reconstructed</h3>
                                    <p className="text-[10px] text-gray-400 font-mono">INCIDENT_ID: {forensicId || 'PENDING...'}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-xs text-gray-300 border-b border-white/5 pb-2">
                                    <span>Timeline Events</span>
                                    <span className="font-bold text-white">{cluster.alerts.length}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-300 border-b border-white/5 pb-2">
                                    <span>Evidence Exhibits</span>
                                    <span className="font-bold text-white">{cluster.alerts.filter(a => a.snapshot).length}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-300">
                                    <span>Auto-Report</span>
                                    <span className="font-bold text-green-400">READY</span>
                                </div>
                            </div>

                            <button className="w-full mt-6 bg-aegis-600 hover:bg-aegis-500 text-white py-3 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02]">
                                <FileText className="w-4 h-4" /> View Forensic Report
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResponseOrchestrator;
