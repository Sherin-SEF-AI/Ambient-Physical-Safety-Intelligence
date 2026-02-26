
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Upload, Aperture, X, Loader2, Network, CheckCircle2, Activity, Brain, 
    Cloud, Users2, Send, Bot, User, CheckCircle, Database, FileText, 
    Lock, Fingerprint, History, FileCheck, Search, Video, Locate, Clock, 
    AlertCircle, FileSearch, Sparkles, Filter, Calendar, Terminal, 
    ShieldAlert, ScanFace, ChevronRight, Share2, ZoomIn, Map as MapIcon, 
    MapPin, Crosshair, Pin, Grid, Sun, Moon, Eye, EyeOff, Move, Maximize, 
    Layers, Download, Sliders, ListOrdered, Kanban, Info, Trash2, 
    ArrowRight, ArrowUpRight, Radio, Command, Cpu, Zap, MessageSquare, Plus, Tag, SortDesc, 
    SortAsc, AlignJustify, BellPlus, ArrowDown, Footprints, Mic, MicOff, 
    PlusCircle, AlertOctagon, TrendingUp, Workflow, Scale, Scissors, 
    Contrast, SunMedium, LayoutGrid, SearchCode, RefreshCw, AlertTriangle, 
    MessageCircle, Shield, Target, ExternalLink, Briefcase, Box, Laptop, Shirt,
    CalendarClock, HardDrive, ListFilter, PlusSquare, Sparkle, Truck, Car, ShoppingBag, 
    Backpack, Umbrella, HelpCircle, Glasses, Timer, FastForward, PackageCheck, UserMinus, MonitorStop,
    Scale3d, Share, Workflow as TimelineIcon, History as HistoryIcon, Link as LinkIcon, ClipboardCheck,
    FileSearch2, ShieldCheck, HardDriveDownload, FileKey,
    Server,
    Binary
} from 'lucide-react';
import { 
    analyzeSecurityFrame, processInvestigationQuery, executeInvestigationStep, 
    synthesizeInvestigationReport, reconstructIncident, searchVideoArchives, 
    generateKnowledgeGraph, performBiometricMatch, consultAgentCouncil, performRootCauseAnalysis 
} from '../services/geminiService';
import { 
    SecurityAlert, InvestigationPlan, ChatMessage, IncidentReport, 
    VideoSearchResult, GraphAnalysisResult, BiometricMatch, Severity, 
    EvidenceStatus, PinnedEvidence, AgentPersona, SuggestedAction, 
    InvestigationStep, AppView
} from '../types';
import { useSecurity } from '../context/SecurityContext';
import ChainOfCustodyPanel from './ChainOfCustodyPanel';

type TabId = 'CASE_BOARD' | 'DEEP_ANALYSIS' | 'SMART_ARCHIVE' | 'LINK_ANALYSIS' | 'ORCHESTRATOR' | 'REPORTING';

interface TabButtonProps {
    id: TabId;
    label: string;
    icon: any;
    activeTab: TabId;
    setActiveTab: (id: TabId) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
    <button 
        type="button"
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black border-b-2 transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer uppercase tracking-wider ${
            activeTab === id 
            ? 'border-aegis-accent text-white bg-aegis-900/50 shadow-[inset_0_-10px_10px_-10px_#00F0FF]' 
            : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
        }`}
    >
        <Icon className={`w-3.5 h-3.5 ${activeTab === id ? 'text-aegis-accent' : ''}`} />
        {label}
    </button>
);

// ... (Rest of imports and helper components like SpecialistStatus, NeuralThinkingAnim remain same, omitting for brevity in diff but assume present) ...
const SpecialistStatus: React.FC<{ persona: AgentPersona; isActive: boolean }> = ({ persona, isActive }) => {
    const getIcon = () => {
        switch(persona) {
            case 'GHOST_TRACER': return <MapIcon className="w-3.5 h-3.5" />;
            case 'THE_ARCHITECT': return <Scale className="w-3.5 h-3.5" />;
            case 'THE_LIAISON': return <MessageSquare className="w-3.5 h-3.5" />;
            default: return <Shield className="w-3.5 h-3.5" />;
        }
    };
    const getColor = () => {
        switch(persona) {
            case 'GHOST_TRACER': return 'text-blue-400';
            case 'THE_ARCHITECT': return 'text-purple-400';
            case 'THE_LIAISON': return 'text-yellow-400';
            default: return 'text-aegis-accent';
        }
    };

    return (
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all ${isActive ? 'bg-aegis-900 border-aegis-accent/30 opacity-100' : 'bg-black/20 border-white/5 opacity-40 grayscale'}`}>
            <div className={`${getColor()} ${isActive ? 'animate-pulse' : ''}`}>{getIcon()}</div>
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-tighter leading-none mb-1">{persona.replace('_', ' ')}</span>
                <span className={`text-[9px] font-mono leading-none ${isActive ? 'text-white' : 'text-gray-600'}`}>{isActive ? 'DELIBERATING' : 'STANDBY'}</span>
            </div>
        </div>
    );
};

const NeuralThinkingAnim = () => (
    <div className="flex gap-4 py-4 px-2 animate-in fade-in slide-in-from-bottom-2">
        <div className="mt-1 shrink-0 w-9 h-9 rounded-xl bg-aegis-900 border border-aegis-700 flex items-center justify-center text-aegis-accent shadow-[0_0_15px_rgba(0,240,255,0.4)] relative overflow-hidden">
            <Bot className="w-5 h-5 z-10" />
            <div className="absolute inset-0 bg-aegis-accent/10 animate-pulse"></div>
        </div>
        <div className="flex-1 bg-[#0B1221] border border-aegis-500/30 p-5 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-aegis-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-aegis-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-aegis-accent rounded-full animate-bounce"></div>
                </div>
                <span className="text-[10px] font-black text-aegis-accent uppercase tracking-[0.2em]">Neural Council Deliberating...</span>
            </div>
            <div className="space-y-2.5">
                <div className="h-2 bg-white/5 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-2 bg-white/5 rounded-full w-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="h-2 bg-white/5 rounded-full w-1/2 animate-pulse [animation-delay:0.4s]"></div>
            </div>
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-aegis-accent/40 to-transparent animate-scan-line"></div>
        </div>
    </div>
);

const InvestigationConsole: React.FC = () => {
  const { alerts, stats, pinnedEvidence, togglePin, updateEvidenceStatus, isRateLimited, initiateVisualReID, facilityType } = useSecurity();
  const [activeTab, setActiveTab] = useState<TabId>('SMART_ARCHIVE');
  const [showCoC, setShowCoC] = useState<SecurityAlert | null>(null);
  
  // Case Board State
  const [caseViewMode, setCaseViewMode] = useState<'KANBAN' | 'STORY'>('KANBAN');
  const [caseFilterSeverity, setCaseFilterSeverity] = useState<Severity | 'ALL'>('ALL');
  const [caseSortOrder, setCaseSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  // Operational Workflow State
  const [sharedAlertId, setSharedAlertId] = useState<string | null>(null);
  const [rcaResult, setRcaResult] = useState<{ originNode: string; timeline: string[]; reasoning: string } | null>(null);
  const [isPerformingRca, setIsPerformingRca] = useState(false);

  // Deep Analysis / Upload State
  const [activeEvidence, setActiveEvidence] = useState<string | null>(null); 
  const [activeEvidenceMeta, setActiveEvidenceMeta] = useState<SecurityAlert | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SecurityAlert | null>(null);
  const [bioMatch, setBioMatch] = useState<BiometricMatch | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMatchingBio, setIsMatchingBio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Forensic controls
  const [imgFilter, setImgFilter] = useState<'NONE' | 'EDGE' | 'THERMAL' | 'INVERT'>('NONE');
  const [imgZoom, setImgZoom] = useState(1);

  // Chat/Orchestrator State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<SuggestedAction[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Video Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [vectorDbStatus, setVectorDbStatus] = useState({ count: 12400, status: 'INDEXING' });

  // Simulate Vector DB growth
  useEffect(() => {
      const interval = setInterval(() => {
          setVectorDbStatus(prev => ({ ...prev, count: prev.count + Math.floor(Math.random() * 5) }));
      }, 3000);
      return () => clearInterval(interval);
  }, []);

  const [graphData, setGraphData] = useState<GraphAnalysisResult | null>(null);
  const [isBuildingGraph, setIsBuildingGraph] = useState(false);

  // Reporting State
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const isPinned = (id: string) => pinnedEvidence.some(p => p.id === id);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'ORCHESTRATOR') {
      scrollToBottom();
    }
    if (activeTab === 'LINK_ANALYSIS' && !graphData && alerts.length > 0 && !isBuildingGraph) {
        handleGraphAnalysis();
    }
  }, [messages, activeTab, isProcessing, graphData, alerts.length]);

  const filteredEvidence = useMemo(() => {
      let filtered = pinnedEvidence.filter(e => caseFilterSeverity === 'ALL' || e.severity === caseFilterSeverity);
      return filtered.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return caseSortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
      });
  }, [pinnedEvidence, caseFilterSeverity, caseSortOrder]);

  const handleSendMessage = async (query?: string) => {
    const textToSend = query || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'USER',
        type: 'TEXT',
        content: textToSend,
        timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsProcessing(true);
    setCurrentSuggestions([]);

    try {
        const response = await processInvestigationQuery(
            textToSend, 
            messages, 
            alerts, 
            pinnedEvidence, 
            facilityType
        );
        
        if (response.type === 'COUNCIL_INVOCATION') {
            const councilMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'SYSTEM',
                type: 'COUNCIL_SESSION',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, councilMsg]);
            
            const session = await consultAgentCouncil(
                textToSend, 
                alerts, 
                pinnedEvidence, 
                facilityType
            );
            
            if (!session || !session.responses) {
                 throw new Error("Council Session returned empty payload.");
            }

            setMessages(prev => prev.map(m => m.id === councilMsg.id ? { 
                ...m, 
                councilSession: session, 
                suggestedActions: session.suggestedActions 
            } : m));
            
            if (session.suggestedActions) setCurrentSuggestions(session.suggestedActions);

        } else if (response.type === 'PLAN' && response.plan) {
            const planMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'SYSTEM',
                type: 'PLAN_EXECUTION',
                plan: {
                    goal: response.plan.goal,
                    steps: response.plan.steps.map(s => ({ ...s, status: 'PENDING' }))
                },
                suggestedActions: response.suggestedActions,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, planMsg]);
            if (response.suggestedActions) setCurrentSuggestions(response.suggestedActions);
            runExecution(planMsg.id, planMsg.plan!, textToSend);
        } else {
            const textMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'SYSTEM',
                type: 'TEXT',
                content: response.text || "Assessment protocol initialized.",
                suggestedActions: response.suggestedActions,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, textMsg]);
            if (response.suggestedActions) setCurrentSuggestions(response.suggestedActions);
        }
    } catch (e: any) {
        console.error("Agentic Council Error", e);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'SYSTEM',
            type: 'TEXT',
            content: `ERROR: Neural interface disconnected. ${e.message?.includes('429') ? 'Rate limit exceeded.' : 'Query timed out.'} Please retry with tactical focus.`,
            timestamp: new Date()
        }]);
    } finally {
        setIsProcessing(false);
    }
  };

  const runExecution = async (messageId: string, initialPlan: InvestigationPlan, originalQuery: string) => {
    let currentPlan = { ...initialPlan };
    const findings: {step: string, result: string}[] = [];

    for (const step of currentPlan.steps) {
        currentPlan = { ...currentPlan, steps: currentPlan.steps.map(s => s.id === step.id ? { ...s, status: 'IN_PROGRESS' } as InvestigationStep : s) };
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, plan: currentPlan } : m));
        try {
            const execResult = await executeInvestigationStep(step, alerts);
            findings.push({ step: step.description, result: execResult.summary });
            currentPlan = { ...currentPlan, steps: currentPlan.steps.map(s => s.id === step.id ? { ...s, status: 'COMPLETED', result: execResult.summary, resultData: execResult } as InvestigationStep : s) };
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, plan: currentPlan } : m));
        } catch (e) {
             currentPlan = { ...currentPlan, steps: currentPlan.steps.map(s => s.id === step.id ? { ...s, status: 'FAILED' } as InvestigationStep : s) };
             setMessages(prev => prev.map(m => m.id === messageId ? { ...m, plan: currentPlan } : m));
        }
    }
    const reportContent = await synthesizeInvestigationReport(originalQuery, findings);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, report: reportContent } : m));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setActiveEvidence(base64String);
        setActiveEvidenceMeta(null);
        setAnalysisResult(null);
        setBioMatch(null);
        setActiveTab('DEEP_ANALYSIS');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!activeEvidence) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSecurityFrame(activeEvidence);
      setAnalysisResult(analysis);
    } catch (error) { console.error(error); } finally { setIsAnalyzing(false); }
  };

  const handleBioScan = async () => {
    if (!activeEvidence) return;
    setIsMatchingBio(true);
    try {
      const result = await performBiometricMatch(activeEvidence);
      setBioMatch(result);
    } catch (e) {
      console.error("Biometric match failed", e);
    } finally {
      setIsMatchingBio(false);
    }
  };

  const handleVideoSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
        const results = await searchVideoArchives(searchQuery, alerts);
        setSearchResults(results);
    } catch (e) { 
        console.error("Semantic search error", e); 
    } finally { 
        setIsSearching(false); 
    }
  };

  const handleGraphAnalysis = async () => {
    if (alerts.length === 0) return;
    setIsBuildingGraph(true);
    try {
        const result = await generateKnowledgeGraph(alerts);
        setGraphData(result);
    } catch (e) { 
        console.error("Link matrix generation error", e); 
    } finally { 
        setIsBuildingGraph(false); 
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
        const result = await reconstructIncident(pinnedEvidence);
        setReport(result);
    } catch (e) { console.error(e); } finally { setIsGeneratingReport(false); }
  };

  const handleShareEvidence = (id: string) => {
    setSharedAlertId(id);
    setTimeout(() => setSharedAlertId(null), 3000);
    // Simulate copying secure sharing link to clipboard
    navigator.clipboard.writeText(`https://aegis-sentinel.intel/share/exhibit/${id}`);
  };

  const handleRootCauseAnalysis = async (alert: SecurityAlert) => {
      setIsPerformingRca(true);
      try {
          const result = await performRootCauseAnalysis(alert, alerts);
          setRcaResult(result);
      } catch (e) {
          console.error("RCA Failed", e);
      } finally {
          setIsPerformingRca(false);
      }
  };

  const loadIntoLab = (alert: SecurityAlert) => {
    if (alert.snapshot) {
        setActiveEvidence(alert.snapshot);
        setActiveEvidenceMeta(alert);
        setAnalysisResult(alert); 
        setActiveTab('DEEP_ANALYSIS');
    }
  };

  const EvidenceCard: React.FC<{ ev: PinnedEvidence; compact?: boolean }> = ({ ev, compact = false }) => (
    <div className={`bg-aegis-800 rounded-xl border border-aegis-600 shadow-xl overflow-hidden group relative hover:border-aegis-500 transition-all ${compact ? 'max-w-xs' : ''}`}>
        <div className="absolute top-2 left-2 z-10 flex gap-1 flex-wrap max-w-[80%]">
            <span className="bg-black/70 text-aegis-accent text-[9px] px-2 py-0.5 rounded font-bold border border-aegis-500/30 backdrop-blur-md">{ev.exhibitId}</span>
        </div>
        <div className="absolute top-2 right-2 z-10 flex gap-1">
            <button onClick={() => setShowCoC(ev)} className="bg-black/50 hover:bg-green-600 text-white p-1.5 rounded-full backdrop-blur-md transition-colors" title="Chain of Custody"><FileKey className="w-3 h-3" /></button>
            <button onClick={() => handleShareEvidence(ev.id)} className="bg-black/50 hover:bg-aegis-600 text-white p-1.5 rounded-full backdrop-blur-md transition-colors"><Share className="w-3 h-3" /></button>
            <button onClick={() => togglePin(ev)} className="bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-md transition-colors"><Trash2 className="w-3 h-3" /></button>
        </div>
        <div className={`relative bg-black ${compact ? 'h-24' : 'h-40'}`}>
            <img src={ev.snapshot} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-3">
                <div className="text-[10px] font-bold text-white uppercase truncate">{ev.threatType}</div>
                <div className="text-[9px] text-gray-400 flex items-center gap-1"><MapPin className="w-2 h-2" /> {ev.location}</div>
            </div>
        </div>
        <div className="p-2.5 grid grid-cols-2 gap-2">
            <button onClick={() => loadIntoLab(ev)} className="py-2 bg-aegis-700 hover:bg-aegis-600 text-white text-[9px] font-black rounded flex items-center justify-center gap-2 transition-all"><Layers className="w-3 h-3" /> LAB</button>
            <button onClick={() => handleRootCauseAnalysis(ev)} className="py-2 bg-purple-900/40 hover:bg-purple-600 text-purple-200 hover:text-white text-[9px] font-black rounded flex items-center justify-center gap-2 transition-all border border-purple-500/30"><HistoryIcon className="w-3 h-3" /> RCA</button>
        </div>
    </div>
  );

  const getForensicFilter = () => {
    switch(imgFilter) {
        case 'THERMAL': return 'sepia(1) hue-rotate(300deg) saturate(3) brightness(0.8)';
        case 'EDGE': return 'grayscale(1) contrast(200%) invert(1)';
        case 'INVERT': return 'invert(1)';
        default: return 'none';
    }
  };

  const getCtaIcon = (type?: string) => {
    switch(type) {
        case 'FORENSIC': return <Search className="w-3.5 h-3.5" />;
        case 'TACTICAL': return <Zap className="w-3.5 h-3.5" />;
        case 'COMPLIANCE': return <Scale className="w-3.5 h-3.5" />;
        default: return <ExternalLink className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden bg-aegis-900 relative">
      {/* Chain of Custody Modal */}
      {showCoC && (
          <ChainOfCustodyPanel alert={showCoC} onClose={() => setShowCoC(null)} />
      )}

      {/* Shared Overlay */}
      {sharedAlertId && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 font-black text-xs uppercase tracking-widest border border-white/20">
              <ClipboardCheck className="w-5 h-5" />
              Secure Link Generated & Copied
          </div>
      )}

      {/* RCA Overlay */}
      {rcaResult && (
          <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-10 animate-in fade-in">
              <div className="bg-aegis-900 border-2 border-purple-500/50 rounded-3xl max-w-2xl w-full shadow-[0_0_80px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col animate-in zoom-in-95">
                  <div className="p-6 border-b border-white/10 bg-purple-900/10 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <FileSearch2 className="w-6 h-6 text-purple-400" />
                          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Root Cause Intelligence</h2>
                      </div>
                      <button onClick={() => setRcaResult(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                  </div>
                  <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                      <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                          <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Primary Node Vector</div>
                          <div className="text-2xl font-black text-white">{rcaResult.originNode}</div>
                      </div>
                      
                      <div className="space-y-4">
                          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Chronological Extraction</div>
                          <div className="space-y-3">
                              {rcaResult.timeline.map((event, i) => (
                                  <div key={i} className="flex gap-4 items-start animate-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                                      <div className="w-6 h-6 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-[10px] shrink-0 mt-0.5">{i+1}</div>
                                      <p className="text-sm text-gray-300 font-mono leading-relaxed">{event}</p>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="p-5 bg-purple-900/10 rounded-2xl border border-purple-500/30">
                          <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3">Forensic Conclusion</div>
                          <p className="text-sm text-white italic leading-relaxed font-sans font-medium">"{rcaResult.reasoning}"</p>
                      </div>
                  </div>
                  <div className="p-6 border-t border-white/10 bg-black/40 flex gap-4">
                      <button onClick={() => setRcaResult(null)} className="flex-1 py-4 bg-aegis-700 hover:bg-aegis-600 text-white font-black text-xs rounded-2xl transition-all uppercase tracking-widest">Acknowledge</button>
                      <button className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-2xl shadow-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2"><HardDriveDownload className="w-4 h-4"/> Export RCA Packet</button>
                  </div>
              </div>
          </div>
      )}

      {isPerformingRca && (
          <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-purple-400 gap-8">
              <div className="relative">
                  <div className="absolute inset-0 border-4 border-purple-500 rounded-full animate-ping opacity-20"></div>
                  <HistoryIcon className="w-24 h-24 animate-spin opacity-40" />
                  <Database className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-xl font-black uppercase tracking-[0.6em] mb-3">Traversing Historical Matrix</p>
                <p className="text-sm font-mono opacity-60 animate-pulse uppercase tracking-widest">Isolating Origin Node & Cross-referencing 52 Attribute Markers...</p>
              </div>
          </div>
      )}

      <div className="mb-4 shrink-0 relative z-10">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-2xl font-black text-white mb-0.5 flex items-center gap-3">
                    <Aperture className="text-aegis-accent w-6 h-6" />
                    FORENSIC INTELLIGENCE LAB
                </h2>
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    Neural Overwatch: Global Signal Ingress
                </div>
            </div>
            <div className="flex gap-2">
                 {isRateLimited && (
                     <div className="flex items-center gap-2 text-[9px] font-black text-red-500 bg-red-950/30 px-2.5 py-1 rounded border border-red-500/30 animate-pulse uppercase tracking-wider">
                        QUOTA_LIMIT_ACTIVE
                    </div>
                 )}
                 <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 bg-black/40 px-3 py-1 rounded-full border border-white/5 shadow-inner">
                    GRID_EXHIBITS: <span className="text-white font-black">{pinnedEvidence.length}</span>
                </div>
            </div>
        </div>

        <div className="flex border-b border-aegis-700 bg-black/20 rounded-t-2xl backdrop-blur-xl overflow-x-auto no-scrollbar scroll-smooth">
            <TabButton id="ORCHESTRATOR" label="Agent Council" icon={Terminal} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="SMART_ARCHIVE" label="Semantic Video RAG" icon={HardDrive} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="DEEP_ANALYSIS" label="Forensic HUD" icon={Layers} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="LINK_ANALYSIS" label="Link Matrix" icon={Share2} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="CASE_BOARD" label="Case Board" icon={Grid} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="REPORTING" label="Auto-Reporting" icon={FileCheck} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

      <div className="flex-1 min-h-0 relative z-10">
        {/* ... (Existing Tabs: ORCHESTRATOR, DEEP_ANALYSIS, LINK_ANALYSIS, REPORTING - Code Omitted for brevity but assumed present) ... */}
        {activeTab === 'ORCHESTRATOR' && (
            <div className="flex h-full gap-5">
                <div className="flex-1 flex flex-col bg-black rounded-2xl border border-aegis-700 shadow-2xl overflow-hidden font-mono relative">
                    <div className="p-4 border-b border-aegis-800 bg-aegis-900/50 flex flex-col gap-4 shrink-0">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-aegis-accent flex items-center gap-2 font-black tracking-[0.2em] uppercase">
                                <Terminal className="w-4 h-4"/> Neural_Council_Command
                            </span>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-500 font-bold">HISTORICAL_NODES: {alerts.length}</span>
                                <span className={`flex items-center gap-1.5 ${isProcessing ? 'text-yellow-400 animate-pulse' : 'text-green-500'}`}>
                                    <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-400 shadow-[0_0_8px_yellow]' : 'bg-green-500 shadow-[0_0_8px_green]'}`}></div>
                                    {isProcessing ? 'SYNCHRONIZING' : 'STATIONARY'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                             <SpecialistStatus persona="GHOST_TRACER" isActive={isProcessing} />
                             <SpecialistStatus persona="THE_ARCHITECT" isActive={isProcessing} />
                             <SpecialistStatus persona="THE_LIAISON" isActive={isProcessing} />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#05080F] scroll-smooth">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-60 animate-in zoom-in-95 duration-1000">
                                <Brain className="w-20 h-20 mb-6 animate-pulse text-aegis-accent/50" />
                                <h3 className="text-lg font-black mb-2 uppercase tracking-[0.4em] text-white">Grid Overwatch Standby</h3>
                                <p className="text-center max-w-sm text-[11px] leading-relaxed uppercase tracking-widest text-gray-500">Initialize specialist triage by describing forensic goals or suspicious tactical patterns.</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-5 ${msg.role === 'USER' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-4`}>
                                <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xl transition-all duration-500 ${msg.role === 'USER' ? 'bg-aegis-700 border-white/20' : 'bg-aegis-900 border-aegis-500 text-aegis-accent shadow-[0_0_15px_rgba(0,240,255,0.3)]'}`}>
                                    {msg.role === 'USER' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6" />}
                                </div>
                                <div className={`max-w-[88%] p-6 rounded-3xl border shadow-2xl relative group transition-all duration-500 ${msg.role === 'USER' ? 'bg-aegis-800 border-white/10 text-gray-200' : 'bg-[#0B1221] border-aegis-500/30 overflow-hidden'}`}>
                                    {msg.role === 'SYSTEM' && <div className="absolute top-0 left-0 w-1 h-full bg-aegis-accent shadow-[0_0_10px_#00F0FF]"></div>}
                                    
                                    {msg.content && <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-gray-300">{msg.content}</p>}
                                    
                                    {msg.type === 'COUNCIL_SESSION' && msg.councilSession && (
                                        <div className="space-y-8 mt-4 animate-in fade-in duration-700">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {msg.councilSession.responses.map((resp, i) => (
                                                    <div key={i} className="p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-aegis-500/30 transition-all group/resp relative">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-[10px] font-black text-aegis-accent uppercase tracking-widest flex items-center gap-2">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${resp.persona === 'GHOST_TRACER' ? 'bg-blue-400 shadow-[0_0_5px_#60a5fa]' : resp.persona === 'THE_ARCHITECT' ? 'bg-purple-400 shadow-[0_0_5px_#c084fc]' : 'bg-yellow-400 shadow-[0_0_5px_#facc15]'}`}></div>
                                                                {resp.persona.replace('_', ' ')}
                                                            </span>
                                                            <span className="text-[9px] font-mono text-gray-600 font-black">{resp.confidence}% Match</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-300 italic leading-relaxed mb-4 group-hover/resp:text-white transition-colors">"{resp.output}"</p>
                                                        {resp.proposedAction && (
                                                            <div className="text-[9px] text-gray-500 font-mono border-t border-white/5 pt-3 flex items-start gap-2 group-hover/resp:border-aegis-500/30 transition-colors">
                                                                <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" /> 
                                                                <span className="uppercase font-bold tracking-tighter">Proposal: {resp.proposedAction}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-5 bg-aegis-900/60 rounded-2xl border border-aegis-500/40 relative overflow-hidden group/cons">
                                                <div className="absolute inset-0 bg-gradient-to-br from-aegis-accent/5 to-transparent opacity-0 group-hover/cons:opacity-100 transition-opacity"></div>
                                                <div className="text-[10px] font-black text-white uppercase mb-3 flex items-center gap-2 relative z-10">
                                                    <Network className="w-4 h-4 text-aegis-accent animate-pulse" /> Unified Grid Consensus
                                                </div>
                                                <p className="text-[11px] text-gray-300 leading-relaxed font-sans relative z-10 italic">"{msg.councilSession.consensus}"</p>
                                            </div>
                                            
                                            {msg.councilSession.suggestedActions && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 animate-in slide-in-from-bottom-2">
                                                    {msg.councilSession.suggestedActions.map((cta, i) => (
                                                        <button 
                                                            key={i} 
                                                            onClick={() => handleSendMessage(cta.query)}
                                                            className="flex items-center justify-between p-4 bg-aegis-700/40 hover:bg-aegis-600 rounded-2xl border border-aegis-500/30 transition-all group/cta hover:scale-[1.01] active:scale-[0.98]"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2.5 bg-black/50 rounded-xl text-aegis-accent group-hover/cta:text-white group-hover/cta:bg-aegis-accent/20 transition-all shadow-inner">
                                                                    {getCtaIcon(cta.type)}
                                                                </div>
                                                                <div className="text-left">
                                                                    <div className="text-[10px] font-black text-white uppercase tracking-wider">{cta.label}</div>
                                                                    <div className="text-[8px] text-gray-500 font-mono mt-0.5 truncate max-w-[200px] italic">query://{cta.query.slice(0, 30)}...</div>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover/cta:text-white group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5 transition-all" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {msg.plan && (
                                        <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
                                            <div className="text-[10px] font-black text-aegis-accent mb-4 uppercase tracking-[0.3em] flex items-center gap-3">
                                                <Workflow className="w-5 h-5" /> Tactical Investigation: {msg.plan.goal}
                                            </div>
                                            {msg.plan.steps.map((step, i) => (
                                                <div key={i} className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 hover:bg-black/60 hover:border-aegis-500/20 transition-all group/step">
                                                    <div className="shrink-0">
                                                        {step.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5 text-green-500" /> : 
                                                         step.status === 'IN_PROGRESS' ? <Loader2 className="w-5 h-5 text-aegis-accent animate-spin" /> : 
                                                         <Clock className="w-5 h-5 text-gray-700" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`text-[11px] font-bold ${step.status === 'COMPLETED' ? 'text-gray-500' : 'text-white'} group-hover/step:text-aegis-accent transition-colors`}>{step.description}</div>
                                                        {step.reasoning && <div className="text-[9px] text-gray-500 font-mono italic mt-1">{step.reasoning}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isProcessing && <NeuralThinkingAnim />}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-5 bg-aegis-900 border-t border-aegis-700 shrink-0 relative">
                        <div className="flex gap-3 bg-black/60 p-1.5 rounded-2xl border border-white/10 focus-within:border-aegis-accent focus-within:ring-1 focus-within:ring-aegis-accent/20 transition-all shadow-2xl">
                            <input 
                                value={inputMessage}
                                onChange={e => setInputMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Command council or request specific forensic deconvolution..."
                                className="flex-1 bg-transparent px-6 py-3.5 text-sm text-white outline-none placeholder:text-gray-600 font-sans tracking-wide"
                            />
                            <button 
                                onClick={() => handleSendMessage()}
                                disabled={isProcessing || !inputMessage.trim()}
                                className="px-8 bg-aegis-600 hover:bg-aegis-accent text-white hover:text-black rounded-xl transition-all disabled:opacity-50 shadow-lg flex items-center justify-center group/btn"
                            >
                                <Send className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-[340px] flex flex-col gap-5 shrink-0 overflow-y-auto no-scrollbar">
                     <div className="bg-aegis-800 p-6 rounded-2xl border border-aegis-700 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30 group-hover:opacity-100 transition-opacity"></div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2 border-b border-white/5 pb-3">
                            <Zap className="w-4 h-4 text-yellow-400" /> Neural Triggers
                        </h4>
                        <div className="space-y-3">
                            {currentSuggestions.length > 0 ? currentSuggestions.map((s, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleSendMessage(s.query)} 
                                    className="w-full p-4 text-left bg-black/40 hover:bg-aegis-700 rounded-2xl border border-white/5 text-[11px] text-gray-300 transition-all flex flex-col gap-2 group/cta relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 bg-aegis-900 rounded-xl text-aegis-accent shadow-inner group-hover/cta:bg-aegis-accent group-hover/cta:text-black transition-all">
                                                {getCtaIcon(s.type)}
                                            </div>
                                            <span className="font-black uppercase tracking-tight text-[10px] group-hover/cta:text-white transition-colors">{s.label}</span>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover/cta:text-white group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5 transition-all" />
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-mono italic truncate w-full opacity-60 group-hover/cta:opacity-100">query://{s.query}</span>
                                    <div className="absolute bottom-0 left-0 h-[2px] bg-aegis-accent w-0 group-hover/cta:w-full transition-all duration-500"></div>
                                </button>
                            )) : (
                                <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl">
                                    <Radio className="w-10 h-10 mx-auto mb-4 text-gray-800 animate-pulse" />
                                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Awaiting Grid Signal</p>
                                </div>
                            )}
                        </div>
                     </div>
                     
                     <div className="bg-aegis-800 p-6 rounded-2xl border border-aegis-700 shadow-2xl flex-1 flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity"></div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2 border-b border-white/5 pb-3">
                            <Target className="w-4 h-4 text-red-500" /> Active Contextual DNA
                        </h4>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                            {alerts.slice(0, 6).map(alert => (
                                <div key={alert.id} className="group/item cursor-pointer" onClick={() => loadIntoLab(alert)}>
                                    <div className="relative h-32 rounded-2xl overflow-hidden border border-white/5 bg-black shadow-lg transition-all hover:border-red-500/40">
                                        <img src={alert.snapshot} className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 transition-opacity duration-700 group-hover/item:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[10px] font-black text-white truncate uppercase tracking-tighter mb-0.5">{alert.threatType}</div>
                                                <div className="text-[9px] text-gray-500 font-mono uppercase truncate flex items-center gap-1">
                                                    <MapPin className="w-2.5 h-2.5" /> {alert.location}
                                                </div>
                                            </div>
                                            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${alert.severity === Severity.CRITICAL ? 'bg-red-500 animate-pulse' : 'bg-aegis-accent'}`}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {alerts.length === 0 && <p className="text-[10px] text-gray-600 text-center py-16 font-mono uppercase tracking-widest opacity-40">No Forensic Ingress Recorded</p>}
                        </div>
                     </div>
                </div>
            </div>
        )}
        
        {/* ... Other Tabs Code Omitted, same as before ... */}
        {activeTab === 'DEEP_ANALYSIS' && (
            <div className="h-full flex gap-6 animate-in fade-in duration-500">
                <div className="flex-1 flex flex-col bg-black rounded-2xl border border-aegis-700 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00F0FF 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
                    
                    <div className="flex-1 relative flex items-center justify-center p-12 min-h-0">
                        {activeEvidence ? (
                            <div className="relative group max-w-full max-h-full">
                                <img 
                                    src={activeEvidence} 
                                    className="max-h-[70vh] rounded-lg shadow-[0_0_50px_rgba(0,240,255,0.1)] border border-white/10 transition-all duration-500" 
                                    style={{ 
                                        filter: getForensicFilter(),
                                        transform: `scale(${imgZoom})`
                                    }}
                                />
                                <div className="absolute inset-0 bg-aegis-accent/5 animate-scan-line pointer-events-none"></div>
                                
                                {analysisResult?.detections?.map((det, i) => (
                                    <div 
                                        key={i}
                                        className="absolute border-2 border-aegis-accent shadow-[0_0_15px_rgba(0,240,255,0.5)] pointer-events-none transition-all duration-500"
                                        style={{
                                            left: `${det.xmin}%`,
                                            top: `${det.ymin}%`,
                                            width: `${det.xmax - det.xmin}%`,
                                            height: `${det.ymax - det.ymin}%`,
                                        }}
                                    >
                                        <div className="absolute -top-6 left-0 bg-aegis-accent text-black text-[9px] font-black px-2 py-0.5 whitespace-nowrap shadow-xl">
                                            {det.label.toUpperCase()} :: [INGRESS_V_1]
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6 text-gray-700">
                                <div className="p-8 rounded-full bg-white/5 border border-white/5 animate-pulse">
                                    <Layers className="w-20 h-20 opacity-20" />
                                </div>
                                <div className="text-center">
                                    <p className="font-black tracking-[0.4em] text-sm uppercase text-gray-600 mb-6">Archival Ingress Standby</p>
                                    <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3.5 bg-aegis-700 hover:bg-aegis-600 text-white rounded-2xl text-xs font-black transition-all border border-white/10 shadow-2xl hover:scale-105 active:scale-95">INGEST_REMOTE_MANIFEST</button>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            </div>
                        )}
                    </div>

                    <div className="p-5 bg-aegis-900/80 border-t border-aegis-700 shrink-0 flex justify-between items-center gap-10 backdrop-blur-xl">
                        <div className="flex gap-2">
                             {['NONE', 'THERMAL', 'EDGE', 'INVERT'].map(f => (
                                 <button key={f} onClick={() => setImgFilter(f as any)} className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${imgFilter === f ? 'bg-aegis-accent text-black border-white shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-black/40 text-gray-500 border-white/5 hover:text-white'}`}>{f}</button>
                             ))}
                        </div>
                        <div className="flex items-center gap-6">
                             <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                <ZoomIn className="w-4 h-4" />
                                <input type="range" min="1" max="5" step="0.1" value={imgZoom} onChange={e => setImgZoom(parseFloat(e.target.value))} className="w-40 accent-aegis-accent h-1.5 bg-white/5 rounded-full" />
                             </div>
                             <div className="h-8 w-px bg-white/10"></div>
                             <button onClick={handleAnalyze} disabled={isAnalyzing || !activeEvidence} className="px-6 py-2.5 bg-aegis-600 hover:bg-aegis-500 text-white rounded-xl text-[10px] font-black flex items-center gap-2.5 transition-all disabled:opacity-50 shadow-xl">
                                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />} TRIGGER_NEURAL_REASONER
                             </button>
                             <button onClick={handleBioScan} disabled={isMatchingBio || !activeEvidence} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black flex items-center gap-2.5 transition-all disabled:opacity-50 shadow-xl">
                                {isMatchingBio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />} RUN_BIOMETRIC_RE-ID
                             </button>
                        </div>
                    </div>
                </div>

                <div className="w-96 flex flex-col gap-5 shrink-0 overflow-y-auto no-scrollbar">
                     <div className="bg-aegis-800 p-6 rounded-2xl border border-aegis-700 shadow-2xl relative group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-aegis-accent to-transparent opacity-30 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-[10px] font-black text-aegis-accent uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                            <Activity className="w-5 h-5" /> Deconvolution Engine
                        </h3>
                        {analysisResult ? (
                            <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                                <div className="bg-black/40 p-5 rounded-2xl border border-white/5 font-mono text-[11px] text-gray-300 line-clamp-3 leading-relaxed italic shadow-inner">
                                    "{analysisResult.reasoning}"
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Threat Class</div>
                                        <div className="text-xs font-bold text-white uppercase">{analysisResult.threatType}</div>
                                    </div>
                                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Grid Confidence</div>
                                        <div className="text-xs font-bold text-white font-mono">{Math.round(analysisResult.confidence)}%</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => initiateVisualReID(analysisResult.snapshot!)}
                                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black flex items-center justify-center gap-3 shadow-2xl shadow-red-900/30 uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Crosshair className="w-5 h-5 animate-pulse" /> Global_Signature_Trace
                                </button>
                            </div>
                        ) : (
                            <div className="py-20 text-center text-gray-600 italic text-[11px] font-mono tracking-widest uppercase opacity-40">Standing by for inference...</div>
                        )}
                     </div>

                     <div className="bg-aegis-800 p-6 rounded-2xl border border-aegis-700 shadow-2xl flex-1 relative group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                            <ScanFace className="w-5 h-5" /> Identification Matrix
                        </h3>
                        {bioMatch ? (
                            <div className="space-y-5 animate-in slide-in-from-right-4 duration-700">
                                <div className={`p-6 rounded-2xl border-2 transition-all duration-700 ${bioMatch.matchFound ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.1)]' : 'bg-red-900/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="text-white font-black text-sm uppercase tracking-wider">{bioMatch.matchFound ? 'Target Resolved' : 'Identity Unknown'}</div>
                                        <div className="text-[10px] font-mono text-purple-400 font-black">{Math.round(bioMatch.confidence)}%</div>
                                    </div>
                                    {bioMatch.matchFound && <div className="text-2xl font-black text-white mb-3 tracking-tighter">{bioMatch.name}</div>}
                                    <p className="text-[11px] text-gray-400 leading-relaxed italic border-l-2 border-purple-500/40 pl-4">{bioMatch.notes}</p>
                                </div>
                                {bioMatch.matchFound && (
                                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-3">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Historical Site Activity</div>
                                        <div className="flex items-center justify-between text-[10px] text-gray-300">
                                            <span>Last Sightings</span>
                                            <span className="font-mono text-white">12_NODES</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-gray-300">
                                            <span>Risk Category</span>
                                            <span className="font-bold text-orange-400">ELEVATED_DWELL</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-gray-600 italic text-[11px] font-mono tracking-widest uppercase opacity-40">Execute Biometric Pulse...</div>
                        )}
                     </div>
                </div>
            </div>
        )}

        {activeTab === 'SMART_ARCHIVE' && (
            <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden">
                {/* RAG SEARCH HEADER */}
                <div className="bg-aegis-800/80 p-8 rounded-3xl border border-aegis-700 shadow-2xl flex flex-col gap-6 backdrop-blur-xl shrink-0 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <HardDrive className="w-32 h-32 text-aegis-accent" />
                    </div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter flex items-center gap-3">
                                Semantic Video RAG Engine
                            </h2>
                            <p className="text-[11px] text-gray-400 font-mono tracking-widest uppercase max-w-xl">
                                Retrieval-Augmented Generation active on {alerts.length} vector embeddings.
                                Query the grid using natural language descriptions of events, objects, or behaviors.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                            <div className="text-right">
                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Vector Index Status</div>
                                <div className="text-white font-mono text-xs flex items-center justify-end gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    {vectorDbStatus.count.toLocaleString()} EMBEDDINGS
                                </div>
                            </div>
                            <Server className="w-6 h-6 text-aegis-accent" />
                        </div>
                    </div>
                    
                    <div className="flex gap-4 w-full relative z-10 mt-2">
                        <div className="flex-1 relative group/search">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                <Search className="w-6 h-6 text-gray-500 group-focus-within/search:text-aegis-accent transition-colors" />
                            </div>
                            <input 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleVideoSearch()}
                                placeholder="E.g., 'Show me every time a red delivery truck parked in the loading dock after 8 PM last week'"
                                className="w-full bg-black border-2 border-aegis-600/30 rounded-2xl py-6 pl-16 pr-6 text-lg text-white focus:border-aegis-accent outline-none shadow-2xl transition-all placeholder:text-gray-700 font-medium"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <span className="text-[9px] font-black text-gray-600 border border-gray-800 rounded px-2 py-1 bg-black/50">ENTER TO RETRIEVE</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleVideoSearch}
                            disabled={isSearching || !searchQuery.trim()}
                            className="px-10 py-6 bg-aegis-600 hover:bg-aegis-accent text-white hover:text-black rounded-2xl text-sm font-black transition-all flex items-center gap-3 disabled:opacity-50 shadow-[0_0_40px_rgba(0,240,255,0.3)] active:scale-95 group/btn border border-white/10"
                        >
                            {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkle className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />}
                            SEMANTIC RETRIEVAL
                        </button>
                    </div>
                </div>

                {/* ARCHIVE SEARCH RESULTS */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    {isSearching ? (
                         <div className="h-full flex flex-col items-center justify-center text-aegis-accent gap-8">
                            <div className="relative">
                                <div className="absolute inset-0 border-4 border-aegis-accent rounded-full animate-ping opacity-20 w-32 h-32"></div>
                                <Binary className="w-32 h-32 animate-pulse opacity-40" />
                                <Database className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-bounce" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-xl uppercase font-black tracking-[0.5em] text-white">Traversing Vector Graph</p>
                                <div className="flex flex-col gap-1 text-[10px] text-aegis-accent/70 font-mono">
                                    <span>> Tokenizing Query Input... OK</span>
                                    <span>> Computing Cosine Similarity... OK</span>
                                    <span>> Ranking Contextual Matches... PROCESSING</span>
                                </div>
                            </div>
                         </div>
                    ) : searchResults.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-800 border-2 border-dashed border-white/5 rounded-3xl mx-4">
                            <div className="p-12 rounded-full bg-white/5 border border-white/5 mb-8 group hover:border-aegis-accent/10 transition-colors">
                                <Video className="w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity" />
                            </div>
                            <div className="text-center">
                                <p className="text-2xl uppercase tracking-[0.6em] font-black opacity-30 mb-2">ARCHIVE INGRESS READY</p>
                                <p className="text-xs text-gray-600 font-mono tracking-widest uppercase">Perform a natural language query to retrieve evidence</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
                            {searchResults.map((res, i) => {
                                const alert = alerts.find(a => a.id === res.alertId);
                                if (!alert) return null;
                                return (
                                    <div key={i} className="bg-aegis-800/60 rounded-2xl border border-aegis-700/50 overflow-hidden hover:border-aegis-accent transition-all group/card shadow-2xl hover:scale-[1.02] backdrop-blur-sm flex flex-col">
                                        <div className="h-56 bg-black relative overflow-hidden shrink-0">
                                            <img src={alert.snapshot} className="w-full h-full object-cover opacity-70 group-hover/card:opacity-100 transition-all duration-1000 group-hover/card:scale-110" />
                                            <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                                                <div className={`text-[10px] font-black px-3 py-1.5 rounded-lg shadow-2xl border backdrop-blur-md uppercase tracking-wide ${
                                                    res.relevanceScore > 0.85 ? 'bg-green-600 text-white border-green-400' : 
                                                    res.relevanceScore > 0.7 ? 'bg-yellow-600 text-white border-yellow-400' : 'bg-gray-700 text-gray-300 border-gray-500'
                                                }`}>
                                                    {Math.round(res.relevanceScore * 100)}% RELEVANCE
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent"></div>
                                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                                <div className="p-1.5 bg-black/60 backdrop-blur-md rounded border border-white/10">
                                                    <MapPin className="w-3 h-3 text-aegis-accent" />
                                                </div>
                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{alert.location}</span>
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="text-[11px] font-black text-white uppercase tracking-tight flex items-center gap-2">
                                                    <Activity className="w-3.5 h-3.5 text-orange-500" />
                                                    {alert.threatType}
                                                </div>
                                                <span className="text-gray-500 font-mono text-[9px]">{new Date(alert.timestamp).toLocaleString()}</span>
                                            </div>
                                            
                                            <div className="bg-aegis-900/50 rounded-xl p-4 border border-aegis-500/20 mb-6 flex-1">
                                                <div className="text-[9px] text-aegis-accent uppercase font-black mb-2 flex items-center gap-2"><Scale3d className="w-3 h-3"/> MATCH REASONING</div>
                                                <p className="text-[11px] text-gray-300 leading-relaxed italic">"{res.matchReason}"</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                                <button onClick={() => loadIntoLab(alert)} className="py-3 bg-white/5 hover:bg-aegis-700 text-gray-300 hover:text-white text-[10px] font-black rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all uppercase tracking-widest group/btn-r">
                                                    <Eye className="w-3.5 h-3.5 group-hover/btn-r:scale-110 transition-transform" /> INSPECT
                                                </button>
                                                <button onClick={() => togglePin(alert)} className={`py-3 rounded-xl border transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${isPinned(alert.id) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>
                                                    <Pin className="w-3.5 h-3.5" /> {isPinned(alert.id) ? 'PINNED' : 'PIN TO CASE'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* ... (LINK_ANALYSIS, CASE_BOARD, REPORTING tabs remain the same) ... */}
        {activeTab === 'LINK_ANALYSIS' && (
            <div className="h-full flex flex-col bg-black rounded-3xl border border-aegis-700 shadow-2xl overflow-hidden animate-in fade-in duration-500 relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
                
                <div className="absolute top-6 right-6 z-20 flex gap-3">
                    <button onClick={handleGraphAnalysis} disabled={isBuildingGraph} className="px-6 py-3 bg-aegis-600 hover:bg-aegis-accent text-white hover:text-black rounded-xl text-[10px] font-black flex items-center gap-2.5 border border-white/10 shadow-2xl transition-all active:scale-95">
                        {isBuildingGraph ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        REGENERATE_LINK_MATRIX
                    </button>
                </div>

                <div className="flex-1 relative flex items-center justify-center p-24 overflow-hidden">
                    {isBuildingGraph ? (
                         <div className="flex flex-col items-center gap-8 text-aegis-accent">
                            <div className="relative">
                                <Network className="w-24 h-24 animate-pulse opacity-20" />
                                <div className="absolute inset-0 border-2 border-aegis-accent rounded-full animate-ping opacity-20"></div>
                            </div>
                            <p className="text-[12px] uppercase font-black tracking-[0.4em] animate-pulse">Correlating Cluster Signatures...</p>
                         </div>
                    ) : !graphData ? (
                        <div className="flex flex-col items-center gap-8 text-gray-800">
                            <div className="p-10 rounded-full bg-white/5 border border-white/5">
                                <Share2 className="w-24 h-24 opacity-10" />
                            </div>
                            <p className="text-[12px] uppercase font-black tracking-[0.4em] opacity-40">No Matrix Data Found</p>
                            <button onClick={handleGraphAnalysis} className="px-8 py-3 bg-aegis-700 hover:bg-aegis-600 text-white rounded-xl text-xs font-black transition-all shadow-xl">INITIATE_GRID_LINKAGE</button>
                        </div>
                    ) : (
                        <div className="relative w-full h-full animate-in zoom-in-95 duration-1000">
                            <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                                {graphData.links.map((link, i) => {
                                    const source = graphData.nodes.find(n => n.id === link.source);
                                    const target = graphData.nodes.find(n => n.id === link.target);
                                    if (!source || !target) return null;
                                    return (
                                        <line 
                                            key={i} 
                                            x1={`${source.x}%`} y1={`${source.y}%`} 
                                            x2={`${target.x}%`} y2={`${target.y}%`} 
                                            stroke="#3B82F6" 
                                            strokeWidth={link.strength / 15} 
                                            strokeOpacity="0.25" 
                                            strokeDasharray="4,3"
                                            className="animate-pulse"
                                        />
                                    );
                                })}
                                {graphData.nodes.map((node, i) => (
                                    <g key={node.id} className="cursor-pointer group/node transition-all duration-500">
                                        <circle 
                                            cx={`${node.x}%`} cy={`${node.y}%`} r={node.riskScore > 60 ? "14" : "10"} 
                                            fill="#0B1221" 
                                            stroke={node.riskScore > 75 ? "#ef4444" : "#00F0FF"} 
                                            strokeWidth="3" 
                                            className="transition-all duration-500 group-hover/node:stroke-white group-hover/node:r-16 shadow-2xl"
                                        />
                                        <text x={`${node.x}%`} y={`${node.y + 7}%`} textAnchor="middle" className="text-[10px] font-black fill-gray-400 pointer-events-none group-hover/node:fill-white uppercase tracking-tighter transition-colors">{node.label}</text>
                                    </g>
                                ))}
                            </svg>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-aegis-900/80 border-t border-aegis-700 shrink-0 backdrop-blur-xl">
                    <div className="bg-black/60 p-5 rounded-2xl border border-white/5 shadow-inner">
                        <div className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-[0.2em] flex items-center gap-2"><Info className="w-4 h-4" /> Cluster Intelligence Report</div>
                        <p className="text-[11px] text-gray-400 font-mono italic leading-relaxed">
                            {graphData?.summary || "Mapping non-linear relationships between multi-modal sensor nodes, detected entity signatures, and spatial-temporal anomalies to uncover organized behavioral clusters."}
                        </p>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'REPORTING' && (
            <div className="h-full flex gap-6 animate-in fade-in duration-500">
                <div className="flex-1 bg-white p-16 overflow-y-auto custom-scrollbar-light shadow-inner flex flex-col items-center border-2 border-white/10 rounded-3xl">
                    {report ? (
                        <div className="w-full max-w-3xl text-gray-900 font-sans animate-in slide-in-from-bottom-8 duration-700">
                             <div className="border-b-[6px] border-gray-900 pb-8 mb-12 flex justify-between items-end">
                                <div>
                                    <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">AEGIS CORE REPORT</h1>
                                    <div className="text-xs font-mono text-gray-400 flex items-center gap-4">
                                        <span>DOCUMENT_ID: <span className="font-black text-gray-900">{report.id}</span></span>
                                        <span>•</span>
                                        <span>GENERATED: <span className="font-black text-gray-900">{new Date(report.generatedAt).toLocaleString()}</span></span>
                                    </div>
                                </div>
                                <Shield className="w-20 h-20 text-gray-900" />
                             </div>

                             <div className="space-y-12">
                                <section>
                                    <h3 className="text-xl font-black bg-gray-900 text-white px-4 py-1.5 inline-block mb-6 uppercase tracking-wider">I. Executive Summary</h3>
                                    <p className="text-lg leading-relaxed text-gray-700 font-medium">{report.narrative}</p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-black bg-gray-900 text-white px-4 py-1.5 inline-block mb-6 uppercase tracking-wider">II. Reconstructed Timeline</h3>
                                    <div className="border-l-[3px] border-gray-100 ml-5 space-y-8">
                                        {report.timeline.map((item, i) => (
                                            <div key={i} className="relative pl-10 group/line">
                                                <div className="absolute left-[-6.5px] top-2 w-3 h-3 bg-gray-200 border-2 border-white rounded-full group-hover/line:bg-gray-900 transition-colors"></div>
                                                <div className="text-xs font-mono text-gray-400 mb-1">{item.time}</div>
                                                <div className="text-[15px] font-bold text-gray-900">{item.event}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xl font-black bg-red-600 text-white px-4 py-1.5 inline-block mb-6 uppercase tracking-wider shadow-lg">III. Gap & Risk Analysis</h3>
                                    <p className="text-base text-gray-800 bg-red-50 p-6 rounded-2xl border-l-8 border-red-600 leading-relaxed italic shadow-sm">
                                        {report.gapAnalysis}
                                    </p>
                                </section>
                             </div>

                             <div className="mt-24 pt-10 border-t-2 border-gray-100 flex justify-between items-center text-[11px] text-gray-400 font-mono font-black uppercase tracking-widest">
                                <span>Secured by Aegis Sentinel v4.8 :: Digital Fingerprint Verified</span>
                                <span>Page 01 / 01</span>
                             </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300">
                             <div className="p-12 rounded-full bg-gray-50 mb-8 border border-gray-100 shadow-inner">
                                <FileText className="w-24 h-24 text-gray-100" />
                             </div>
                             <p className="font-black text-gray-400 uppercase tracking-[0.3em] text-sm">Synthetic Report Engine Standby</p>
                        </div>
                    )}
                </div>

                <div className="w-[340px] flex flex-col gap-6 shrink-0">
                    <div className="bg-aegis-800 p-8 rounded-3xl border border-aegis-700 shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-aegis-accent to-transparent opacity-30 group-hover:opacity-100 transition-opacity"></div>
                         <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 border-b border-white/5 pb-5">Forensic Controls</h3>
                         <div className="space-y-4">
                             <button 
                                onClick={handleGenerateReport} 
                                disabled={isGeneratingReport || pinnedEvidence.length === 0} 
                                className="w-full py-5 bg-aegis-600 hover:bg-aegis-accent text-white hover:text-black rounded-2xl text-[11px] font-black flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-2xl uppercase tracking-widest active:scale-95"
                             >
                                 {isGeneratingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5" />}
                                 Synthesize Incident Report
                             </button>
                             <button disabled={!report} className="w-full py-4 bg-black/40 hover:bg-aegis-700 text-gray-500 hover:text-white rounded-2xl text-[10px] font-black border border-white/5 flex items-center justify-center gap-3 transition-all disabled:opacity-30 uppercase tracking-widest">
                                 <Download className="w-5 h-5" /> Export Tactical PDF
                             </button>
                         </div>
                         <div className="mt-10 p-6 bg-black/30 rounded-2xl border border-white/5 shadow-inner">
                            <div className="text-[10px] text-gray-500 uppercase font-black mb-3 tracking-widest">Exhibit Batch Count</div>
                            <div className="text-4xl font-black text-white font-mono leading-none">{pinnedEvidence.length}</div>
                            <div className="text-[10px] text-gray-600 mt-2 uppercase font-bold tracking-tighter">Verified Exhibits in Ingress Pipeline</div>
                         </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'CASE_BOARD' && (
            <div className="h-full flex flex-col gap-5 animate-in fade-in duration-500">
                <div className="flex justify-between items-center bg-aegis-800/60 p-4 rounded-2xl border border-aegis-700 backdrop-blur-xl shadow-xl">
                    <div className="flex gap-2">
                        <button onClick={() => setCaseViewMode('KANBAN')} className={`px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-2.5 transition-all uppercase tracking-widest ${caseViewMode === 'KANBAN' ? 'bg-aegis-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><Kanban className="w-4 h-4" /> Grid_View</button>
                        <button onClick={() => setCaseViewMode('STORY')} className={`px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-2.5 transition-all uppercase tracking-widest ${caseViewMode === 'STORY' ? 'bg-aegis-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><Activity className="w-4 h-4" /> Sequence_Log</button>
                    </div>
                    <div className="flex items-center gap-6">
                         <div className="flex items-center gap-3">
                             <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Triage Filter:</span>
                             <select 
                                value={caseFilterSeverity}
                                onChange={(e) => setCaseFilterSeverity(e.target.value as any)}
                                className="bg-black/50 border border-aegis-600 text-[10px] font-black rounded-lg px-3 py-1.5 outline-none text-white uppercase tracking-tighter hover:border-aegis-accent transition-colors"
                             >
                                 <option value="ALL">All Manifests</option>
                                 <option value="CRITICAL">Critical_Only</option>
                                 <option value="HIGH">Elevated_Only</option>
                                 <option value="MEDIUM">Routine_Only</option>
                             </select>
                         </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    {pinnedEvidence.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-40 py-24 border-2 border-dashed border-white/5 rounded-3xl">
                            <div className="p-8 rounded-full bg-white/5 mb-6">
                                <Lock className="w-16 h-16" />
                            </div>
                            <p className="text-xl font-black uppercase tracking-[0.4em]">Case Vault Empty</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            {filteredEvidence.map(ev => (
                                <EvidenceCard key={ev.id} ev={ev} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
      
      <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.2); border-radius: 10px; }
          .custom-scrollbar-light::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar-light::-webkit-scrollbar-track { background: #f8fafc; }
          .custom-scrollbar-light::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
          @keyframes scan-line { from { top: -10%; } to { top: 110%; } }
          .animate-scan-line { animation: scan-line 3s linear infinite; position: absolute; left: 0; right: 0; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default InvestigationConsole;
