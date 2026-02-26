
import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, LayoutDashboard, Search, BarChart3, Radio, Settings, LogOut, Zap, Globe, Cpu, Mic, MicOff, Lock, Crosshair, Music, Siren, ClipboardList } from 'lucide-react';
import { AppView } from '../types';
import { useSecurity } from '../context/SecurityContext';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const recognitionRef = useRef<any>(null);
  const { globalLockdown, reidSession, duressTriggered } = useSecurity();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = (event.results?.[0]?.[0]?.transcript || '').toLowerCase();
        if (transcript) {
          setVoiceText(transcript);
          handleVoiceCommand(transcript);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const handleVoiceCommand = (text: string) => {
    const safeText = (text || '').toLowerCase();
    if (safeText.includes('forensic') || safeText.includes('search') || safeText.includes('investigate')) setView(AppView.INVESTIGATION);
    else if (safeText.includes('command') || safeText.includes('dashboard')) setView(AppView.DASHBOARD);
    else if (safeText.includes('ops') || safeText.includes('operations')) setView(AppView.OPERATIONS);
    else if (safeText.includes('global') || safeText.includes('overwatch')) setView(AppView.ENTERPRISE);
    else if (safeText.includes('audio') || safeText.includes('sound')) setView(AppView.AUDIO_FORENSICS);
    else if (safeText.includes('dispatch') || safeText.includes('police') || safeText.includes('emergency')) setView(AppView.EMERGENCY_DISPATCH);
    else if (safeText.includes('shift') || safeText.includes('log')) setView(AppView.SHIFT_LOGBOOK);
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setVoiceText('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Speech recognition failed to start", e);
      }
    }
  };

  const navItems = [
    { id: AppView.DASHBOARD, label: 'Command Center', icon: LayoutDashboard },
    { id: AppView.OPERATIONS, label: 'Ops & Response', icon: Zap },
    { id: AppView.EMERGENCY_DISPATCH, label: 'Emergency Dispatch', icon: Siren },
    { id: AppView.ENTERPRISE, label: 'Global Overwatch', icon: Globe },
    { id: AppView.SHIFT_LOGBOOK, label: 'Shift Logbook', icon: ClipboardList },
    { id: AppView.INVESTIGATION, label: 'Forensic Lab', icon: Search },
    { id: AppView.AUDIO_FORENSICS, label: 'Audio Forensics', icon: Music },
    { id: AppView.ALERTS, label: 'Alert History', icon: ShieldAlert },
    { id: AppView.ANALYTICS, label: 'Intelligence', icon: BarChart3 },
    { id: AppView.SETTINGS, label: 'System Config', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-[#0B1120]/95 backdrop-blur-xl border-r border-aegis-700 flex flex-col fixed left-0 top-0 z-50 shadow-2xl overflow-hidden">
      <div className="p-4 flex items-center gap-2 border-b border-aegis-700/50 bg-gradient-to-r from-aegis-900 to-transparent shrink-0">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-aegis-500 to-blue-600 flex items-center justify-center shadow-lg">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold tracking-wider text-base leading-tight">AEGIS</h1>
          <p className="text-[8px] text-aegis-accent font-mono tracking-widest uppercase">Sentinel v2.0</p>
        </div>
      </div>

      {duressTriggered && (
          <div className="mx-2 mt-2 p-1.5 bg-red-600 rounded border border-red-400 flex items-center gap-2 animate-pulse shrink-0">
              <Siren className="w-3.5 h-3.5 text-white" />
              <span className="text-[9px] font-black text-white uppercase tracking-tighter">DURESS_ACTIVE</span>
          </div>
      )}

      <div className="mx-2 mt-2 p-2 bg-black/40 rounded-lg border border-white/5 flex flex-col items-center gap-1.5 shrink-0">
           <div className="flex justify-between items-center w-full">
                <span className="text-[8px] font-mono text-gray-500 uppercase">Voice_Ctrl</span>
                <div className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-700'}`}></div>
           </div>
           
           <div className="flex items-center gap-3 w-full">
                <button 
                    onClick={toggleMic}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        isListening 
                        ? 'bg-red-600 text-white' 
                        : 'bg-aegis-700 hover:bg-aegis-600 text-gray-400'
                    }`}
                >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <div className="flex-1 h-5 flex items-center overflow-hidden">
                    <span className="text-[9px] text-gray-400 font-mono italic truncate">
                        {voiceText || '"Call Police"'}
                    </span>
                </div>
           </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 group relative overflow-hidden ${
              currentView === item.id
                ? 'bg-aegis-800 text-white shadow border border-aegis-700'
                : 'text-gray-400 hover:bg-aegis-800/40 hover:text-white'
            }`}
          >
            {currentView === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-aegis-accent"></div>}
            <item.icon className={`w-3.5 h-3.5 ${currentView === item.id ? (item.id === AppView.EMERGENCY_DISPATCH ? 'text-red-500' : 'text-aegis-accent') : 'group-hover:text-aegis-accent/70'}`} />
            <span className="font-medium text-[11px] tracking-wide">{item.label}</span>
            {item.id === AppView.EMERGENCY_DISPATCH && duressTriggered && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>
        ))}

        {reidSession && (
          <button
            onClick={() => setView(AppView.VISUAL_TRACE)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 group relative overflow-hidden mt-3 ${
              currentView === AppView.VISUAL_TRACE
                ? 'bg-red-900/40 text-white shadow border border-red-500/50'
                : 'text-red-400/70 hover:bg-red-900/20 hover:text-red-400'
            }`}
          >
            {currentView === AppView.VISUAL_TRACE && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
            <Crosshair className={`w-3.5 h-3.5 ${currentView === AppView.VISUAL_TRACE ? 'text-red-500' : 'group-hover:text-red-500/70'}`} />
            <span className="font-bold text-[11px] tracking-wide">Active Trace</span>
          </button>
        )}
      </nav>

      <div className="p-2 border-t border-aegis-700/50 bg-black/20 shrink-0">
        <div className={`flex items-center gap-2 px-3 py-2 rounded border ${globalLockdown ? 'bg-red-900/20 border-red-500/50' : 'border-transparent hover:bg-white/5'}`}>
             {globalLockdown ? (
                 <Lock className="w-4 h-4 text-red-500 animate-pulse" />
             ) : (
                 <Radio className="w-4 h-4 text-green-500" />
             )}
          <div className="flex flex-col">
             <span className="text-[8px] font-mono uppercase text-gray-500 leading-none mb-0.5">Integrity</span>
             <span className={`text-[10px] font-bold tracking-wider leading-none ${globalLockdown ? 'text-red-500' : 'text-green-400'}`}>
                 {globalLockdown ? 'LOCKDOWN' : 'ONLINE'}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
