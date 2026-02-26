
import React, { useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import InvestigationConsole from './components/InvestigationConsole';
import AnalyticsView from './components/AnalyticsView';
import OperationsView from './components/OperationsView';
import EnterpriseView from './components/EnterpriseView';
import AlertHistoryView from './components/AlertHistoryView';
import SettingsView from './components/SettingsView';
import VisualTraceView from './components/VisualTraceView';
import AudioForensicsView from './components/AudioForensicsView';
import EmergencyDispatchView from './components/EmergencyDispatchView';
import ShiftLogbook from './components/ShiftLogbook';
import { AppView, AgentState } from './types';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { ShieldCheck, Scan, BrainCircuit } from 'lucide-react';

const IntelligenceHUD: React.FC = () => {
  const { agentState, isArmed } = useSecurity();

  const getStateColor = () => {
    switch (agentState) {
      case AgentState.PERCEIVING: return 'text-blue-400';
      case AgentState.REASONING: return 'text-aegis-accent';
      case AgentState.ACTING: return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="h-14 shrink-0 bg-aegis-900/90 backdrop-blur-xl border-b border-white/5 flex items-center px-6 justify-between relative z-50 shadow-xl">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-aegis-accent/30 to-transparent"></div>
      
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-aegis-600 to-blue-900 flex items-center justify-center border border-white/10 shadow-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-black text-white tracking-[0.2em] uppercase leading-none">Aegis Sentinel</h1>
            <div className="flex items-center gap-1.5 mt-1">
               <div className={`w-1.5 h-1.5 rounded-full ${isArmed ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-700'}`}></div>
               <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Core_v4.2.1</span>
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-white/10"></div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Scan className="w-3 h-3 text-aegis-accent animate-pulse" />
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Ingress_Link: <span className="text-green-500 font-mono">OK</span></span>
          </div>
          <div className="flex items-center gap-2">
            <BrainCircuit className={`w-3 h-3 ${getStateColor()} animate-pulse`} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${getStateColor()}`}>Neural_State: {agentState}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[8px] font-mono text-gray-600 uppercase tracking-tighter">Global_Overwatch_Continuity</span>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentAppView, setCurrentAppView } = useSecurity();

  useEffect(() => {
    (window as any).AegisSetView = setCurrentAppView;
  }, [setCurrentAppView]);

  const renderView = () => {
    switch(currentAppView) {
      case AppView.DASHBOARD: return <Dashboard />;
      case AppView.OPERATIONS: return <OperationsView />;
      case AppView.ENTERPRISE: return <EnterpriseView />;
      case AppView.INVESTIGATION: return <InvestigationConsole />;
      case AppView.ANALYTICS: return <AnalyticsView />;
      case AppView.ALERTS: return <AlertHistoryView />;
      case AppView.SETTINGS: return <SettingsView />;
      case AppView.VISUAL_TRACE: return <VisualTraceView />;
      case AppView.AUDIO_FORENSICS: return <AudioForensicsView />;
      case AppView.EMERGENCY_DISPATCH: return <EmergencyDispatchView />;
      case AppView.SHIFT_LOGBOOK: return <ShiftLogbook />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-aegis-900 text-gray-200 font-sans overflow-hidden">
      <Navigation currentView={currentAppView} setView={setCurrentAppView} />
      <main className="flex-1 ml-64 h-full flex flex-col relative">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#2A3B5E 1px, transparent 1px), linear-gradient(90deg, #2A3B5E 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        <IntelligenceHUD />
        <div className="relative z-10 flex-1 min-h-0">
            {renderView()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SecurityProvider>
      <AppContent />
    </SecurityProvider>
  );
}

export default App;
