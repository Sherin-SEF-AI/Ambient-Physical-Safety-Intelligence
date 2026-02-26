import React, { useRef, useEffect } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { Mic, Activity, Volume2, Loader2, BarChart2, Play } from 'lucide-react';

const AudioAnalysisModule: React.FC = () => {
    const { audioMetrics, isArmed, audioAnalyser, audioContextState, resumeAudio } = useSecurity();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        let dataArray: Uint8Array | null = null;
        let bufferLength = 0;

        if (audioAnalyser) {
            bufferLength = audioAnalyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        }

        const draw = () => {
            if (!canvasRef.current) return;
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.stroke();

            if (isArmed && audioAnalyser && dataArray && audioContextState === 'running') {
                audioAnalyser.getByteFrequencyData(dataArray);
                const centerX = width / 2;
                const barWidth = (width / bufferLength) * 4; 
                
                for(let i = 0; i < bufferLength; i++) {
                    const value = dataArray[i];
                    const percent = value / 255;
                    const barHeight = percent * height * 0.8;

                    let hue = 210; 
                    if (audioMetrics.isGunshot) hue = 0; 
                    else if (value > 200) hue = 45; 
                    else hue = 210 + (value / 5);

                    ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
                    ctx.fillRect(centerX + (i * barWidth), (height - barHeight) / 2, barWidth - 1, barHeight);
                    ctx.fillRect(centerX - (i * barWidth) - barWidth, (height - barHeight) / 2, barWidth - 1, barHeight);
                }
            } else if (!isArmed) {
                ctx.strokeStyle = 'rgba(75, 85, 99, 0.5)';
                ctx.beginPath();
                ctx.moveTo(0, height / 2);
                ctx.lineTo(width, height / 2);
                ctx.stroke();
            } else {
                ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
                const pulse = Math.sin(Date.now() / 200) * 10;
                ctx.fillRect(0, height/2 - 2, width, 4 + pulse);
            }

            requestRef.current = requestAnimationFrame(draw);
        };

        requestRef.current = requestAnimationFrame(draw);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [audioAnalyser, isArmed, audioMetrics, audioContextState]);

    return (
        <div className="bg-aegis-800 rounded-xl border border-aegis-700 overflow-hidden flex flex-col h-full relative group shadow-lg">
            <div className="p-3 border-b border-aegis-700 bg-aegis-900/30 flex justify-between items-center shrink-0">
                <h3 className="text-white font-bold text-xs uppercase flex items-center gap-2">
                    <Mic className="w-4 h-4 text-aegis-accent" />
                    Audio Intelligence
                </h3>
                <div className="flex gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded border ${isArmed && audioContextState === 'running' ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse' : 'text-gray-500 border-gray-700'}`}>
                        {isArmed ? (audioContextState === 'running' ? 'MONITORING' : 'READY') : 'MUTED'}
                    </span>
                </div>
            </div>

            <div className="flex-1 relative bg-black/40 min-h-0">
                <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={150} 
                    className="w-full h-full"
                />
                
                {isArmed && !audioAnalyser && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-aegis-accent/50 text-xs font-mono bg-black/20 backdrop-blur-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        CALIBRATING SENSORS...
                    </div>
                )}

                {isArmed && audioAnalyser && audioContextState === 'suspended' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                        <button 
                            onClick={resumeAudio}
                            className="flex flex-col items-center gap-2 bg-aegis-600 hover:bg-aegis-500 text-white px-6 py-4 rounded-xl shadow-2xl border border-aegis-400 transition-all hover:scale-105 active:scale-95"
                        >
                            <Play className="w-8 h-8 fill-current" />
                            <span className="text-xs font-black tracking-widest uppercase">Start Audio Ingress</span>
                        </button>
                    </div>
                )}

                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end pointer-events-none">
                    <div className="flex gap-2">
                        <div className="text-[9px] text-gray-400 font-mono bg-black/60 px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            {Math.round(audioMetrics.decibelLevel)} dB
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        {audioMetrics.isScreaming && (
                            <div className="text-[9px] bg-red-600 text-white px-2 py-1 rounded animate-pulse font-bold shadow-lg border border-red-400 flex items-center gap-1 uppercase tracking-tighter">
                                <Activity className="w-3 h-3" /> DISTRESS_DETECTED
                            </div>
                        )}
                        {audioMetrics.isGunshot && (
                            <div className="text-[9px] bg-red-600 text-white px-2 py-1 rounded animate-ping font-black border border-red-400 uppercase">
                                !! BALLISTIC_SPIKE !!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioAnalysisModule;