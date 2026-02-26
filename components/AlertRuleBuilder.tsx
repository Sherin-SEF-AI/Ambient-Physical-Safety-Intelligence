
import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { parseNaturalLanguageRule } from '../services/geminiService';
import { BellPlus, Loader2, CheckCircle2, Zap, Clock, MapPin, Eye, Trash2, Shield, Users, Package } from 'lucide-react';

const DEFAULT_TEMPLATES = [
    {
        name: 'Perimeter Breach',
        icon: Shield,
        description: 'After-hours intrusion detection.',
        prompt: 'Alert immediately if a person crosses the North Perimeter Fence between 22:00 and 06:00.'
    },
    {
        name: 'Server Room Loitering',
        icon: Clock,
        description: 'Sensitive zone dwell time monitoring.',
        prompt: 'Flag any individual remaining in the Server Room Corridor for more than 10 minutes.'
    },
    {
        name: 'Unattended Object',
        icon: Package,
        description: 'Abandoned package detection in public areas.',
        prompt: 'Detect potential IEDs or lost items: unattended bags in Main Lobby > 5 mins.'
    },
    {
        name: 'Crowd Dynamics',
        icon: Users,
        description: 'Unusual gathering or mob detection.',
        prompt: 'Alert if a group of more than 6 people forms near the Executive Entrance.'
    }
];

const AlertRuleBuilder: React.FC = () => {
    const { alertRules, addAlertRule, removeAlertRule } = useSecurity();
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCreateRule = async (text: string) => {
        if (!text.trim()) return;
        setIsProcessing(true);
        try {
            const newRule = await parseNaturalLanguageRule(text);
            addAlertRule(newRule);
            setPrompt('');
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-aegis-800 rounded-xl border border-aegis-700 flex flex-col h-full overflow-hidden shadow-xl">
            <div className="p-6 border-b border-aegis-700 bg-aegis-900/30">
                <h3 className="text-white font-bold flex items-center gap-2 mb-2">
                    <BellPlus className="text-aegis-accent" />
                    Adaptive Threat Configuration
                </h3>
                <p className="text-xs text-gray-400">
                    Deploy AI sentinels using natural language or select a quick-start protocol.
                </p>
            </div>

            <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* Quick Deploy Section */}
                <div>
                    <h4 className="text-xs font-bold text-aegis-accent uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Zap className="w-3 h-3" /> Quick Deploy Protocols
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        {DEFAULT_TEMPLATES.map((tpl, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleCreateRule(tpl.prompt)}
                                disabled={isProcessing}
                                className="bg-aegis-900/50 border border-aegis-700 hover:border-aegis-500 p-3 rounded-lg text-left group transition-all hover:bg-aegis-800"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1.5 rounded-full bg-aegis-800 text-aegis-400 group-hover:text-white group-hover:bg-aegis-600 transition-colors">
                                        <tpl.icon className="w-3 h-3" />
                                    </div>
                                    <span className="text-xs font-bold text-white group-hover:text-aegis-accent">{tpl.name}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 leading-tight">{tpl.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Custom Definition</h4>
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe a threat scenario..."
                            className="w-full h-20 bg-black/30 border border-aegis-600 rounded-lg p-3 text-sm text-white focus:border-aegis-accent outline-none resize-none placeholder:text-gray-600"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleCreateRule(prompt);
                                }
                            }}
                        />
                        <button
                            onClick={() => handleCreateRule(prompt)}
                            disabled={isProcessing || !prompt.trim()}
                            className="absolute bottom-2 right-2 bg-aegis-600 hover:bg-aegis-500 text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-2 disabled:opacity-50 transition-all"
                        >
                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                            DEPLOY
                        </button>
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex justify-between items-center">
                        Active Sentinels
                        <span className="bg-aegis-700 text-white px-1.5 rounded text-[10px]">{alertRules.length}</span>
                    </h4>
                    {alertRules.length === 0 && (
                        <div className="text-center py-6 text-gray-600 text-xs italic border border-dashed border-gray-800 rounded">
                            No active sentinels. Deploy a protocol above.
                        </div>
                    )}
                    {alertRules.map(rule => (
                        <div key={rule.id} className="bg-aegis-900/50 border border-aegis-600/50 rounded-lg p-3 animate-in slide-in-from-top-2 relative group hover:border-aegis-500 transition-colors">
                            <button 
                                onClick={() => removeAlertRule(rule.id)}
                                className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-green-500/10 text-green-400 p-1 rounded-full animate-pulse">
                                    <CheckCircle2 className="w-3 h-3" />
                                </div>
                                <span className="font-bold text-white text-xs">{rule.name}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 mb-2 bg-black/20 p-2 rounded border border-white/5">
                                <div className="flex items-center gap-1">
                                    <Eye className="w-3 h-3 text-aegis-500" />
                                    <span className="truncate">{rule.conditions.target} : {rule.conditions.behavior}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-aegis-500" />
                                    <span className="truncate">{rule.conditions.location}</span>
                                </div>
                                {rule.conditions.timeConstraint && (
                                    <div className="flex items-center gap-1 col-span-2">
                                        <Clock className="w-3 h-3 text-orange-400" />
                                        <span className="truncate">{rule.conditions.timeConstraint}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="text-[10px] text-aegis-accent mt-1 flex items-center gap-1 font-mono">
                                <Zap className="w-3 h-3" />
                                ACTION: {rule.action}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlertRuleBuilder;
