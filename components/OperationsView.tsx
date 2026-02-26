
import React from 'react';
import ResponseOrchestrator from './ResponseOrchestrator';
import PatrolCommand from './PatrolCommand';
import AccessControlPanel from './AccessControlPanel';
import AlertRuleBuilder from './AlertRuleBuilder';
import { useSecurity } from '../context/SecurityContext';
import { AlertCluster, Severity } from '../types';
import { ShieldAlert, Zap, Radio, Users, Activity, Lock, Siren, Shield, Workflow } from 'lucide-react';

const OperationsView: React.FC = () => {
    const { alertClusters, stats, cameras } = useSecurity();

    // Find the most critical active cluster
    const criticalCluster = alertClusters.find(c => 
        (c.severity === Severity.CRITICAL || c.severity === Severity.HIGH) && c.status === 'ACTIVE'
    ) || alertClusters[0]; // Fallback to first for demo if no critical

    const activeUnits = 12; // Simulated
    const responseReady = 98; // Simulated

    return (
        <div className="p-6 h-full overflow-y-auto flex flex-col gap-6">
            {/* Ops Header / HUD */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Workflow className="text-aegis-accent" />
                        RESPONSE OPERATIONS
                    </h1>
                    <p className="text-gray-400 text-sm">Autonomous Workflow Engine & Tactical Command</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-aegis-800 border border-aegis-700 px-4 py-2 rounded-lg flex items-center gap-3">
                        <div className="bg-blue-500/20 p-1.5 rounded-full text-blue-400">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Active Units</div>
                            <div className="text-lg font-bold text-white leading-none">{activeUnits}</div>
                        </div>
                    </div>
                    <div className="bg-aegis-800 border border-aegis-700 px-4 py-2 rounded-lg flex items-center gap-3">
                        <div className="bg-green-500/20 p-1.5 rounded-full text-green-400">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Readiness</div>
                            <div className="text-lg font-bold text-white leading-none">{responseReady}%</div>
                        </div>
                    </div>
                    <div className="bg-aegis-800 border border-aegis-700 px-4 py-2 rounded-lg flex items-center gap-3">
                        <div className="bg-red-500/20 p-1.5 rounded-full text-red-400">
                            <Siren className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Threat Level</div>
                            <div className="text-lg font-bold text-red-500 leading-none">
                                {stats.activeThreats > 0 ? 'ELEVATED' : 'LOW'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
                
                {/* Center/Right: Response & Map - Now larger for Orchestrator */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Response Orchestrator (Dynamic) */}
                    <div className="min-h-[500px]">
                        {criticalCluster ? (
                            <ResponseOrchestrator cluster={criticalCluster} />
                        ) : (
                            <div className="h-full bg-aegis-800 border border-aegis-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 border-dashed relative overflow-hidden group">
                                <div className="absolute inset-0 bg-aegis-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <p className="text-aegis-accent font-bold">SYSTEMS NOMINAL</p>
                                </div>
                                <Shield className="w-16 h-16 mb-4 opacity-10" />
                                <h3 className="text-lg font-bold text-gray-400">No Active Incident Response</h3>
                                <p className="text-sm mt-1 max-w-md text-center">
                                    Automated response workflows are in standby mode. 
                                    System is continuously monitoring for trigger events.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Patrol Command */}
                    <div className="flex-1 min-h-[300px]">
                        <PatrolCommand />
                    </div>
                </div>

                {/* Left Column: Automated Logic & Config */}
                <div className="lg:col-span-4 space-y-6 flex flex-col">
                    <div className="flex-1 min-h-[400px]">
                        <AlertRuleBuilder />
                    </div>
                    <div className="flex-1">
                        <AccessControlPanel />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationsView;
