
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Disc, Target, Crosshair, Lock, VideoOff, Signal, MousePointer2, Fingerprint, BrainCircuit, Activity, Eye, Zap } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

interface Props {
  deviceId?: string;
  isPrimary?: boolean;
  globalRef?: React.RefObject<HTMLVideoElement | null>;
  className?: string;
  isArmed?: boolean;
  isFocused?: boolean;
}

const CameraStream: React.FC<Props> = ({ deviceId, isPrimary, globalRef, className, isArmed, isFocused }) => {
  const internalRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Track the active stream for cleanup regardless of React state updates
  const activeStreamRef = useRef<MediaStream | null>(null);
  
  const { alerts, videoRegistry, globalLockdown, cameras, initiateVisualReID } = useSecurity();
  const [hasError, setHasError] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [neuralGlassActive, setNeuralGlassActive] = useState(false);

  // Sync with global ref if primary
  useEffect(() => {
      if (isPrimary && globalRef && internalRef.current) {
          (globalRef as React.MutableRefObject<HTMLVideoElement | null>).current = internalRef.current;
      }
  }, [isPrimary, globalRef, internalRef.current]);

  const cameraName = useMemo(() => {
      return cameras.find(c => c.deviceId === deviceId)?.name || 'UNKNOWN_NODE';
  }, [cameras, deviceId]);

  const latestAlert = useMemo(() => {
      if (!isArmed) return null;
      return alerts.find(a => a.location === cameraName && (Date.now() - new Date(a.timestamp).getTime()) < 10000);
  }, [alerts, isArmed, cameraName]);

  // Independent Stream Acquisition
  useEffect(() => {
    // Cleanup any existing stream from previous effect run immediately
    if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(t => t.stop());
        activeStreamRef.current = null;
    }
    setStream(null);

    if (!isArmed) return;

    // Don't attempt to get stream if there is no deviceId (mock camera)
    if (!deviceId) {
        setHasError(false);
        return;
    }

    let mounted = true;
    
    const acquireStream = async (retryCount = 0) => {
        setHasError(false);
        try {
            // Attempt 1: Ideal Resolution
            const constraints: MediaStreamConstraints = { 
                video: { 
                    deviceId: { exact: deviceId },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false 
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (mounted) {
                activeStreamRef.current = newStream;
                setStream(newStream);
            } else {
                newStream.getTracks().forEach(t => t.stop());
            }
        } catch (err) { 
            console.warn(`High-res acquisition failed for ${deviceId}, attempting fallback...`);
            
            // Attempt 2: Basic Fallback (No resolution constraints)
            try {
                const fallbackConstraints: MediaStreamConstraints = { 
                    video: { deviceId: { exact: deviceId } },
                    audio: false 
                };
                const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
                
                if (mounted) {
                    activeStreamRef.current = fallbackStream;
                    setStream(fallbackStream);
                    return;
                } else {
                    fallbackStream.getTracks().forEach(t => t.stop());
                }
            } catch (finalErr) {
                console.error(`Failed to acquire stream for device ${deviceId} (Attempt ${retryCount + 1})`, finalErr);
                if (mounted) {
                    if (retryCount < 3) {
                        // Exponential backoff: 1s, 2s, 3s
                        setTimeout(() => acquireStream(retryCount + 1), 1000 * (retryCount + 1));
                    } else {
                        setHasError(true);
                    }
                }
            }
        }
    };
    
    acquireStream();
    
    return () => { 
        mounted = false;
        if (activeStreamRef.current) {
            activeStreamRef.current.getTracks().forEach(t => t.stop());
            activeStreamRef.current = null;
        }
    };
  }, [deviceId, isArmed]);

  // Attach Stream & Register to Global Registry
  useEffect(() => {
      const videoEl = internalRef.current;
      if (!videoEl || !stream) return;
      
      videoEl.srcObject = stream;
      videoEl.play().catch(e => console.warn("Autoplay blocked", e));

      // Register this video element for the SecurityContext AI loop to access
      const key = deviceId || (isPrimary ? 'PRIMARY_DEFAULT' : `CAM_${Math.random()}`);
      videoRegistry.current?.set(key, videoEl);
      
      return () => { 
          videoRegistry.current?.delete(key); 
      };
  }, [stream, deviceId, isPrimary]);

  const handleBoxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!internalRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = internalRef.current.videoWidth;
    canvas.height = internalRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(internalRef.current, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        initiateVisualReID(canvas.toDataURL('image/jpeg', 0.8));
    }
  };

  return (
    <div className={`relative group/dvr overflow-hidden ${className} bg-black`}>
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Stream or Error State */}
        {hasError || !isArmed || !deviceId ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 relative">
                {!deviceId && isArmed && (
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black animate-pulse opacity-20"></div>
                )}
                <div className="flex flex-col items-center gap-2 z-10 text-gray-700">
                    {isArmed && !deviceId ? (
                        <>
                            <Signal className="w-8 h-8 animate-pulse text-aegis-900" />
                            <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-aegis-800">Simulated Feed Signal</span>
                        </>
                    ) : (
                        <>
                            <VideoOff className="w-8 h-8" />
                            <span className="font-mono text-xs font-bold tracking-widest uppercase">{isArmed ? 'Signal Lost / Locked' : 'Node Disarmed'}</span>
                        </>
                    )}
                </div>
            </div>
        ) : (
            <video ref={internalRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
        )}

        {/* Global Lockdown Overlay */}
        {globalLockdown && <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/40 animate-pulse"><div className="bg-red-600 text-white px-4 py-2 font-bold text-sm border border-red-400">LOCKDOWN ACTIVE</div></div>}
        
        {/* Toggle Neural Glass */}
        {isArmed && (
            <button 
                onClick={(e) => { e.stopPropagation(); setNeuralGlassActive(!neuralGlassActive); }}
                className={`absolute top-2 right-2 p-1.5 rounded z-50 transition-all ${neuralGlassActive ? 'bg-cyan-900/80 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-black/40 text-gray-500 hover:text-white border border-white/10'}`}
                title="Toggle Neural Glass (Reasoning Layer)"
            >
                <BrainCircuit className="w-4 h-4" />
            </button>
        )}

        {/* Alert Overlays */}
        {latestAlert && !globalLockdown && (
             <div className="absolute inset-0 w-full h-full pointer-events-none z-40 transform scale-x-[-1]">
                {(latestAlert.detections || []).map((det, i) => (
                    <div 
                        key={i} 
                        className={`absolute pointer-events-auto cursor-crosshair transition-all duration-300 ${neuralGlassActive ? 'border border-cyan-500/60 bg-cyan-500/5' : 'border-2 border-aegis-accent hover:border-white hover:bg-aegis-accent/20 shadow-[0_0_10px_rgba(0,240,255,0.4)]'}`}
                        style={{ left: `${det.xmin}%`, top: `${det.ymin}%`, width: `${det.xmax - det.xmin}%`, height: `${det.ymax - det.ymin}%` }} 
                        onClick={handleBoxClick}
                        title="Click to Trace Visual DNA"
                    >
                        {/* Standard Label */}
                        {!neuralGlassActive && (
                            <div className="absolute -top-6 left-0 bg-aegis-accent text-black text-[9px] font-black px-2 py-0.5 flex items-center gap-1 shadow-lg whitespace-nowrap transform scale-x-[-1] pointer-events-none border border-black/20">
                                <MousePointer2 className="w-2.5 h-2.5" /> TRACE_{det.label.toUpperCase()}
                            </div>
                        )}

                        {/* NEURAL GLASS: Reasoning Layer */}
                        {neuralGlassActive && (
                            <div className="absolute top-0 right-[-220px] w-48 bg-black/80 backdrop-blur-md border-l-2 border-cyan-500 p-2 text-left transform scale-x-[-1] pointer-events-none shadow-2xl animate-in slide-in-from-left-4 fade-in duration-300">
                                <div className="flex items-center justify-between mb-1 border-b border-cyan-500/30 pb-1">
                                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                                        <Activity className="w-3 h-3" /> Predictive Logic
                                    </span>
                                    <span className="text-[8px] text-white font-mono">{Math.round(latestAlert.confidence)}% CONF</span>
                                </div>
                                
                                {latestAlert.microBehaviors && latestAlert.microBehaviors.length > 0 && (
                                    <div className="mb-2">
                                        <div className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">Micro-Behaviors Detected</div>
                                        <div className="flex flex-wrap gap-1">
                                            {latestAlert.microBehaviors.map((beh, idx) => (
                                                <span key={idx} className="text-[8px] bg-cyan-900/40 text-cyan-200 px-1.5 py-0.5 rounded border border-cyan-500/20">{beh}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {latestAlert.prediction && (
                                    <div className="bg-cyan-950/30 p-1.5 rounded border border-cyan-500/20 mb-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[8px] text-cyan-500 uppercase font-bold">Escalation Risk</span>
                                            <span className={`text-[9px] font-black ${latestAlert.prediction.escalationProbability > 70 ? 'text-red-500 animate-pulse' : 'text-cyan-300'}`}>
                                                {latestAlert.prediction.escalationProbability}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${latestAlert.prediction.escalationProbability > 70 ? 'bg-red-500' : 'bg-cyan-500'}`} 
                                                style={{ width: `${latestAlert.prediction.escalationProbability}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-[8px] text-gray-400 mt-1 italic flex items-center gap-1">
                                            <Zap className="w-2 h-2" />
                                            Predicted: {latestAlert.prediction.predictedNextAction} ({latestAlert.prediction.timeToIncident || '<10s'})
                                        </div>
                                    </div>
                                )}

                                <div className="text-[8px] text-gray-400 font-mono leading-tight opacity-80">
                                    "{latestAlert.reasoning.slice(0, 80)}..."
                                </div>
                            </div>
                        )}
                    </div>
                ))}
             </div>
        )}
    </div>
  );
};

export default CameraStream;
