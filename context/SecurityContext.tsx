
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useMemo } from 'react';
import { SecurityAlert, SecurityStats, Severity, AgentState, FeedbackType, CameraFeed, AlertCluster, AccessEvent, DetectionMode, AudioMetrics, SystemHealth, PinnedEvidence, EvidenceStatus, ReIDSession, AppView, BehavioralState, EnvironmentType, AlertRule, AdaptiveProfile, ThreatSignature, AuditLogEntry, ShiftState, LogBookEntry, BoloSubject, AgentAction } from '../types';
import { analyzeSecurityFrame, performVisualReID, verifyCrossModalThreat, updateGeminiApiKey } from '../services/geminiService';

interface SecurityContextType {
  isArmed: boolean;
  setArmed: (armed: boolean) => void;
  globalLockdown: boolean;
  setGlobalLockdown: (locked: boolean) => void;
  alerts: SecurityAlert[];
  alertClusters: AlertCluster[];
  resolveCluster: (id: string) => void;
  cameras: CameraFeed[];
  refreshCameras: () => Promise<void>;
  addAlert: (alert: SecurityAlert) => void;
  updateAlertFeedback: (id: string, feedback: FeedbackType) => void;
  stats: SecurityStats;
  updateStats: (occupancy: number, severity: Severity) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoRegistry: React.MutableRefObject<Map<string, HTMLVideoElement>>;
  attentionTargetId: string | null;
  setAttentionTargetId: (id: string | null) => void;
  agentState: AgentState;
  setAgentState: (state: AgentState) => void;
  lastThinkingProcess: string;
  setLastThinkingProcess: (text: string) => void;
  accessEvents: AccessEvent[];
  addAccessEvent: (event: AccessEvent) => void;
  detectionMode: DetectionMode;
  setDetectionMode: (mode: DetectionMode) => void;
  facilityType: EnvironmentType;
  setFacilityType: (type: EnvironmentType) => void;
  audioMetrics: AudioMetrics;
  audioAnalyser: AnalyserNode | null;
  audioContextState: AudioContextState;
  resumeAudio: () => Promise<void>;
  systemHealth: SystemHealth;
  pinnedEvidence: PinnedEvidence[];
  togglePin: (alert: SecurityAlert) => void;
  updateEvidenceStatus: (id: string, status: EvidenceStatus) => void;
  addEvidenceTag: (id: string, tag: string) => void;
  removeEvidenceTag: (id: string, tag: string) => void;
  initiateVisualReID: (snapshot: string) => Promise<void>;
  reidSession: ReIDSession | null;
  currentAppView: AppView;
  setCurrentAppView: (view: AppView) => void;
  isRateLimited: boolean;
  duressTriggered: boolean;
  setDuressTriggered: (val: boolean) => void;
  alertRules: AlertRule[];
  addAlertRule: (rule: AlertRule) => void;
  removeAlertRule: (id: string) => void;
  adaptiveProfiles: AdaptiveProfile[];
  addAdaptiveProfile: (profile: AdaptiveProfile) => void;
  removeAdaptiveProfile: (id: string) => void;
  threatSignatures: ThreatSignature[];
  addThreatSignature: (sig: ThreatSignature) => void;
  toggleThreatSignature: (id: string) => void;
  // New Features
  currentUser: string;
  currentShift: ShiftState;
  startShift: (officerName: string) => void;
  endShift: () => void;
  logEntries: LogBookEntry[];
  addLogEntry: (entry: LogBookEntry) => void;
  bolos: BoloSubject[];
  addBolo: (bolo: BoloSubject) => void;
  removeBolo: (id: string) => void;
  logAuditAction: (alertId: string, action: AuditLogEntry['action'], details: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const STORAGE_PREFIX = 'AEGIS_CORE_';
const getStorage = <T,>(key: string, initial: T): T => {
  try {
    const item = window.localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : initial;
  } catch (e) { return initial; }
};

const setStorage = (key: string, value: any) => {
  try { window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value)); } catch (e) {}
};

// Mock initial profiles for demo
const INITIAL_PROFILES: AdaptiveProfile[] = [
    {
        id: 'PROF-001',
        name: 'Night Watch Protocol',
        targetCameraId: 'ALL',
        schedule: { startTime: '22:00', endTime: '06:00' },
        sensitivity: 'HIGH',
        isActive: true
    },
    {
        id: 'PROF-002',
        name: 'Business Hours Lobby',
        targetCameraId: 'HQ_LOBBY',
        schedule: { startTime: '09:00', endTime: '17:00' },
        sensitivity: 'LOW',
        isActive: true
    }
];

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isArmed, setArmed] = useState<boolean>(() => getStorage('IS_ARMED', false));
  const [globalLockdown, setGlobalLockdown] = useState<boolean>(() => getStorage('LOCKDOWN', false));
  const [detectionMode, setDetectionMode] = useState<DetectionMode>(() => getStorage('DETECTION_MODE', 'BALANCED'));
  const [facilityType, setFacilityType] = useState<EnvironmentType>(() => getStorage('FACILITY_TYPE', EnvironmentType.CORPORATE));
  const [alerts, setAlerts] = useState<SecurityAlert[]>(() => getStorage('ALERTS', []));
  const [alertClusters, setAlertClusters] = useState<AlertCluster[]>(() => getStorage('CLUSTERS', []));
  const [accessEvents, setAccessEvents] = useState<AccessEvent[]>(() => getStorage('ACCESS_EVENTS', []));
  const [pinnedEvidence, setPinnedEvidence] = useState<PinnedEvidence[]>(() => getStorage('PINNED_EVIDENCE', []));
  const [currentAppView, setCurrentAppView] = useState<AppView>(AppView.DASHBOARD);
  const [stats, setStats] = useState<SecurityStats>(() => getStorage('STATS', { activeThreats: 0, occupancy: 0, totalAlerts: 0, lastUpdate: new Date().toISOString() }));
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [duressTriggered, setDuressTriggered] = useState(false);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(() => getStorage('ALERT_RULES', []));
  const [adaptiveProfiles, setAdaptiveProfiles] = useState<AdaptiveProfile[]>(() => getStorage('ADAPTIVE_PROFILES', INITIAL_PROFILES));
  const [threatSignatures, setThreatSignatures] = useState<ThreatSignature[]>(() => getStorage('THREAT_SIGNATURES', []));

  // New Shift & Log State
  const [currentUser, setCurrentUser] = useState<string>('Officer_Default');
  const [currentShift, setCurrentShift] = useState<ShiftState>(() => getStorage('CURRENT_SHIFT', { id: `SHIFT-${Date.now()}`, officerOnDuty: 'Officer_Default', startTime: new Date().toISOString(), status: 'ACTIVE', notes: '' }));
  const [logEntries, setLogEntries] = useState<LogBookEntry[]>(() => getStorage('LOG_ENTRIES', []));
  const [bolos, setBolos] = useState<BoloSubject[]>(() => getStorage('BOLOS', []));
  const [apiKey, setApiKeyState] = useState<string>(() => getStorage('GEMINI_API_KEY', process.env.API_KEY || ''));

  const [cameras, setCameras] = useState<CameraFeed[]>([]); 
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastAudioTriggerTime = useRef<number>(0);
  
  // Registry now maps DeviceID (or unique ID) to the HTMLVideoElement
  const videoRegistry = useRef<Map<string, HTMLVideoElement>>(new Map());
  
  const [attentionTargetId, setAttentionTargetId] = useState<string | null>(null);
  const [agentState, setAgentState] = useState<AgentState>(AgentState.IDLE);
  const [lastThinkingProcess, setLastThinkingProcess] = useState<string>("Initializing Neural Grid...");
  const [audioMetrics, setAudioMetrics] = useState<AudioMetrics>({ decibelLevel: 0, isScreaming: false, isGunshot: false });
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
  const [audioContextState, setAudioContextState] = useState<AudioContextState>('closed');
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({ neuralLoad: 0, latencyMs: 45, networkIntegrity: 99, uptime: 0 });
  const [reidSession, setReidSession] = useState<ReIDSession | null>(null);
  
  const processingRef = useRef(false);

  useEffect(() => setStorage('IS_ARMED', isArmed), [isArmed]);
  useEffect(() => setStorage('LOCKDOWN', globalLockdown), [globalLockdown]);
  useEffect(() => setStorage('DETECTION_MODE', detectionMode), [detectionMode]);
  useEffect(() => setStorage('FACILITY_TYPE', facilityType), [facilityType]);
  useEffect(() => setStorage('ALERTS', alerts), [alerts]);
  useEffect(() => setStorage('CLUSTERS', alertClusters), [alertClusters]);
  useEffect(() => setStorage('ACCESS_EVENTS', accessEvents), [accessEvents]);
  useEffect(() => setStorage('PINNED_EVIDENCE', pinnedEvidence), [pinnedEvidence]);
  useEffect(() => setStorage('STATS', stats), [stats]);
  useEffect(() => setStorage('ALERT_RULES', alertRules), [alertRules]);
  useEffect(() => setStorage('ADAPTIVE_PROFILES', adaptiveProfiles), [adaptiveProfiles]);
  useEffect(() => setStorage('THREAT_SIGNATURES', threatSignatures), [threatSignatures]);
  useEffect(() => setStorage('CURRENT_SHIFT', currentShift), [currentShift]);
  useEffect(() => setStorage('LOG_ENTRIES', logEntries), [logEntries]);
  useEffect(() => setStorage('BOLOS', bolos), [bolos]);

  // Sync API Key with Service
  useEffect(() => {
      if (apiKey) updateGeminiApiKey(apiKey);
  }, [apiKey]);

  const setApiKey = (key: string) => {
      setApiKeyState(key);
      setStorage('GEMINI_API_KEY', key);
  }

  const captureCurrentFrame = (): string | null => {
      if (!videoRef.current) return null;
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          return canvas.toDataURL('image/jpeg', 0.8);
      }
      return null;
  };

  const triggerSensoryFusion = async (triggerType: string, source: 'AUDIO' | 'IOT') => {
      const snapshot = captureCurrentFrame();
      if (!snapshot) return;

      setAgentState(AgentState.REASONING);
      setLastThinkingProcess(`CROSS-MODAL VERIFICATION: Analyzing visual evidence for ${triggerType}...`);

      try {
          const verification = await verifyCrossModalThreat(triggerType, snapshot);
          
          if (verification.verified) {
              const alert: SecurityAlert = {
                  id: `FUSION-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  severity: Severity.CRITICAL,
                  threatType: verification.threatLabel,
                  location: 'Primary Zone', // In real app, derived from active camera
                  description: `Multi-modal confirmation: ${triggerType} signal validated by visual analysis.`,
                  confidence: verification.confidence,
                  confidenceDetails: { visualQuality: 90, objectClarity: 85, behavioralMatch: 95 },
                  reasoning: verification.reasoning,
                  snapshot: snapshot,
                  weaponDetected: triggerType.includes('Gunshot'),
                  chainOfThought: `Sensor Input (${source}) -> Visual Verification -> ${verification.threatLabel}`,
                  autonomousAction: AgentAction.LOCK_PERIMETER,
                  decisionTier: 'TIER_1_AUTONOMOUS' as any,
                  actionStatus: 'PENDING_APPROVAL' as any,
                  recommendedAction: 'INITIATE LOCKDOWN PROTOCOL',
                  intent: {
                      category: 'MALICIOUS_THREATENING' as any,
                      confidence: 95,
                      behavioralState: BehavioralState.AGGRESSIVE,
                      concealmentScore: 0,
                      indicators: { purposefulness: 90, nervousness: 0, concealment: 0, preparation: 90 },
                      summary: 'Confirmed hostile action via sensory fusion.'
                  },
                  prediction: {
                      escalationProbability: 99,
                      predictedNextAction: 'Escalation of violence',
                      interventionRecommendation: 'Immediate Intervention',
                      convergenceScore: 100,
                      timeToIncident: 'IMMEDIATE'
                  },
                  crisis: {
                      paAnnouncementScript: `Emergency. ${verification.threatLabel} confirmed. Evacuate immediately.`,
                      firstResponderMessage: `Confirmed ${verification.threatLabel} via multi-sensor fusion.`,
                      tone: 'URGENT_WARNING'
                  },
                  compliance: {
                      admissibilityScore: 100,
                      privacyMaskingActive: false,
                      chainOfCustodyHash: `HASH-${Date.now()}`,
                      complianceNotes: 'Verified via multi-modal consensus.'
                  },
                  groupDynamics: { detected: false, size: 0, type: 'NONE', behavior: 'N/A' },
                  interaction: { detected: false, type: 'NONE', details: 'N/A' },
                  environment: { weather: 'UNKNOWN', lighting: 'ARTIFICIAL', facilityState: 'EMERGENCY', facilityType: facilityType, impactAnalysis: 'High' },
                  occupancy: 0,
                  auditTrail: [],
                  modalitySource: [source, 'VISUAL', 'FUSION'],
                  verificationDetails: {
                      trigger: triggerType,
                      visualConfirmation: verification.reasoning,
                      status: 'VERIFIED'
                  },
                  contextualRelevance: 'High priority multi-sensor confirmation.'
              };
              addAlert(alert);
              setGlobalLockdown(true); // Auto-trigger for confirmed criticals
          } else {
              // Log negative result / low confidence alert
              const alert: SecurityAlert = {
                  id: `ANOMALY-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  severity: Severity.LOW,
                  threatType: 'SENSOR_ANOMALY',
                  location: 'Primary Zone',
                  description: `Unverified ${triggerType} signal. Visuals do not confirm.`,
                  confidence: verification.confidence,
                  confidenceDetails: { visualQuality: 80, objectClarity: 0, behavioralMatch: 0 },
                  reasoning: `Sensor reported ${triggerType} but visual analysis rejected it: ${verification.reasoning}`,
                  snapshot: snapshot,
                  weaponDetected: false,
                  chainOfThought: `Sensor Input (${source}) -> Visual Mismatch -> Flagged as Anomaly`,
                  autonomousAction: AgentAction.NONE,
                  decisionTier: 'TIER_4_HUMAN_ONLY' as any,
                  actionStatus: 'REQUIRES_HUMAN' as any,
                  recommendedAction: 'Check sensor health',
                  intent: {
                      category: 'AMBIGUOUS_UNKNOWN' as any,
                      confidence: 20,
                      behavioralState: BehavioralState.NORMAL,
                      concealmentScore: 0,
                      indicators: { purposefulness: 0, nervousness: 0, concealment: 0, preparation: 0 },
                      summary: 'Sensor artifact suspected.'
                  },
                  prediction: {
                      escalationProbability: 10,
                      predictedNextAction: 'None',
                      interventionRecommendation: 'Maintenance Check',
                      convergenceScore: 0,
                      timeToIncident: 'N/A'
                  },
                  crisis: { paAnnouncementScript: '', firstResponderMessage: '', tone: 'CALM_DIRECTIVE' },
                  compliance: { admissibilityScore: 0, privacyMaskingActive: false, chainOfCustodyHash: '', complianceNotes: '' },
                  groupDynamics: { detected: false, size: 0, type: 'NONE', behavior: 'N/A' },
                  interaction: { detected: false, type: 'NONE', details: 'N/A' },
                  environment: { weather: 'UNKNOWN', lighting: 'ARTIFICIAL', facilityState: 'NORMAL', facilityType: facilityType, impactAnalysis: 'None' },
                  occupancy: 0,
                  auditTrail: [],
                  modalitySource: [source],
                  verificationDetails: {
                      trigger: triggerType,
                      visualConfirmation: verification.reasoning,
                      status: 'REJECTED'
                  },
                  contextualRelevance: 'Low relevance due to lack of visual confirmation.'
              };
              addAlert(alert);
          }
      } catch (e) {
          console.error("Fusion Verification Failed", e);
      } finally {
          setAgentState(AgentState.IDLE);
      }
  };

  // Helper to determine if a profile is active right now
  const getActiveProfilesForCamera = (cameraName: string): AdaptiveProfile[] => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeVal = currentHour * 60 + currentMinute;

      return adaptiveProfiles.filter(p => {
          if (!p.isActive) return false;
          if (p.targetCameraId !== 'ALL' && p.targetCameraId !== cameraName) return false;

          const [startH, startM] = p.schedule.startTime.split(':').map(Number);
          const [endH, endM] = p.schedule.endTime.split(':').map(Number);
          const startVal = startH * 60 + startM;
          const endVal = endH * 60 + endM;

          // Handle overnight schedules (e.g. 22:00 to 06:00)
          if (endVal < startVal) {
              return currentTimeVal >= startVal || currentTimeVal <= endVal;
          }
          return currentTimeVal >= startVal && currentTimeVal <= endVal;
      });
  };

  // Unified Multi-Camera Analysis Loop
  useEffect(() => {
    let intervalId: any;
    
    if (isArmed && !isRateLimited) {
      // Optimized frequency: ULTRA_FAST 1.5s, BALANCED 3.5s, DETAILED 8s
      const frequency = detectionMode === 'ULTRA_FAST' ? 1500 : detectionMode === 'BALANCED' ? 3500 : 8000;
      
      intervalId = setInterval(async () => {
        if (processingRef.current) return;
        
        // Get all active video elements from registry
        const activeFeeds = Array.from(videoRegistry.current.entries());
        
        if (activeFeeds.length === 0) return;

        processingRef.current = true;
        setAgentState(AgentState.PERCEIVING);

        // Process all feeds in parallel
        try {
          const analysisPromises = activeFeeds.map(async ([cameraId, video]) => {
             if (!video || video.readyState < 2) return null;

             const canvas = document.createElement('canvas');
             // Highly optimized scaling for speed
             const scale = detectionMode === 'ULTRA_FAST' ? 0.25 : detectionMode === 'BALANCED' ? 0.35 : 0.5;
             canvas.width = (video.videoWidth || 640) * scale;
             canvas.height = (video.videoHeight || 480) * scale;
             const ctx = canvas.getContext('2d');
             
             if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                // Reduce quality for faster transmission
                const quality = detectionMode === 'ULTRA_FAST' ? 0.5 : 0.7;
                const base64 = canvas.toDataURL('image/jpeg', quality);
                
                if (base64.length > 500) {
                   // Identify location name from camera ID
                   const camInfo = cameras.find(c => c.deviceId === cameraId) || cameras.find(c => c.id === cameraId);
                   const locationName = camInfo ? camInfo.name : `CAM_${cameraId.slice(-4)}`;
                   
                   // Determine active adaptive profiles for this camera
                   const activeProfiles = getActiveProfilesForCamera(locationName);

                   // Perform Analysis
                   const result = await analyzeSecurityFrame(base64, alerts.slice(0, 3), detectionMode, facilityType, alertRules, activeProfiles);
                   
                   return { ...result, location: locationName, modalitySource: ['VISUAL'] as ('VISUAL' | 'AUDIO' | 'IOT' | 'FUSION')[] };
                }
             }
             return null;
          });

          setAgentState(AgentState.REASONING);
          const results = await Promise.all(analysisPromises);
          
          setAgentState(AgentState.ACTING);
          
          results.forEach(result => {
              if (result) {
                  // Attach initial audit log
                  const newAlert = {
                      ...result,
                      auditTrail: [{
                          id: `AUD-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          user: 'SYSTEM',
                          action: 'CAPTURED' as const,
                          details: 'Event captured by automated sentinel grid.'
                      }]
                  };
                  addAlert(newAlert);
                  updateStats(result.occupancy, result.severity as Severity);
                  // Update thinking process with the most critical one or last one
                  if (result.severity === Severity.CRITICAL || result.severity === Severity.HIGH) {
                      setLastThinkingProcess(`[${result.location}] ${result.chainOfThought}`);
                  }
              }
          });

          // If no results updated stats, we just fallback
          if (results.every(r => !r)) {
             setLastThinkingProcess("Scanning active grids...");
          }

        } catch (e: any) { 
          console.error("Neural Grid Ingress Failure", e);
          if (e.message?.includes('429')) setIsRateLimited(true);
        } finally {
          setAgentState(AgentState.IDLE);
          processingRef.current = false;
        }
      }, frequency);
    }
    return () => clearInterval(intervalId);
  }, [isArmed, detectionMode, facilityType, cameras, isRateLimited, alerts, alertRules, adaptiveProfiles]);

  // Enhanced Device Enumeration for External Cameras
  const initDevices = async () => {
    try {
      // Attempt to get a stream to trigger permission prompt and label availability
      // We wrap this in a try/catch to handle cases where camera access is denied or hardware is locked
      try {
          const initStream = await navigator.mediaDevices.getUserMedia({ video: true }); 
          // CRITICAL FIX: Stop the stream immediately to prevent locking the device
          initStream.getTracks().forEach(track => track.stop());
      } catch (e) {
          console.warn("Could not acquire initial camera stream for permission/labels (continuing with defaults):", e);
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      
      let realCams: CameraFeed[] = videoDevices.map((device, idx) => ({
        id: device.deviceId || `CAM-${idx + 1}`,
        deviceId: device.deviceId,
        name: device.label || (idx === 0 ? 'HQ_LOBBY' : `EXTERNAL_NODE_${idx}`),
        zone: idx === 0 ? 'ENTRY_GATE' : `SECTOR_${idx + 1}`,
        status: 'ACTIVE',
        priorityScore: 10, 
        activeAlerts: 0,
        lastActivity: new Date().toISOString(),
        isPrimary: idx === 0,
        clusterTag: 'HQ_CORE',
        floorPlanCoords: { x: 20 + idx * 25, y: 30 + (idx % 2) * 20 }
      }));

      // Fallback to Mock if no devices found
      if (realCams.length === 0) {
          console.warn("No video devices detected. Initializing with Simulation Feed.");
          realCams = [
              {
                  id: 'MOCK_CAM_01',
                  deviceId: '', // Empty deviceId triggers fallback in CameraStream
                  name: 'SIMULATION_FEED_ALPHA',
                  zone: 'PERIMETER_SIM',
                  status: 'ACTIVE',
                  priorityScore: 10,
                  activeAlerts: 0,
                  lastActivity: new Date().toISOString(),
                  isPrimary: true,
                  clusterTag: 'SIM_CORE',
                  floorPlanCoords: { x: 50, y: 50 }
              }
          ];
      }
      
      setCameras(realCams);
      if (realCams.length > 0 && !attentionTargetId) setAttentionTargetId(realCams[0].id);
    } catch (err) { 
        console.error("Device enumeration failed completely", err); 
    }
  };

  useEffect(() => {
    initDevices();
    navigator.mediaDevices.addEventListener('devicechange', initDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', initDevices);
  }, []);

  // System Health Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        uptime: prev.uptime + 1,
        neuralLoad: isRateLimited ? 0 : Math.min(100, Math.max(10, prev.neuralLoad + (Math.random() * 6 - 3))),
        latencyMs: Math.floor(Math.random() * 15) + 15,
        networkIntegrity: Math.min(100, Math.max(99, prev.networkIntegrity + (Math.random() * 0.2 - 0.1)))
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRateLimited]);

  // Audio Logic & Fusion Trigger
  useEffect(() => {
    const initAudio = async () => {
      if (isArmed) {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioContextClass();
            audioCtx.onstatechange = () => setAudioContextState(audioCtx.state);
            setAudioContextState(audioCtx.state);
            
            try {
                // Get default audio stream
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 128; 
                const microphone = audioCtx.createMediaStreamSource(stream);
                microphone.connect(analyser);
                analyserRef.current = analyser;
                setAudioAnalyser(analyser);
            } catch (e) {
                console.warn("Microphone access denied or unavailable. Audio analytics disabled.", e);
                // We do NOT throw here, allowing the rest of the app to function without audio
            }
            
            audioContextRef.current = audioCtx;
          } catch (e) { console.error("Audio Context initialization failed", e); }
        }
      } else if (!isArmed && audioContextRef.current) {
        audioContextRef.current.close().catch(e => {});
        audioContextRef.current = null;
        setAudioContextState('closed');
        setAudioAnalyser(null);
      }
    };
    initAudio();
  }, [isArmed]);

  const resumeAudio = async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
      setAudioContextState(audioContextRef.current.state);
    }
  };

  useEffect(() => {
    if (!isArmed || !analyserRef.current) return;
    const interval = setInterval(() => {
      const analyser = analyserRef.current;
      if (!analyser) return;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const avg = sum / bufferLength;
      
      const isScreaming = avg > 45;
      const isGunshot = avg > 80;
      setAudioMetrics({ decibelLevel: avg, isScreaming, isGunshot });

      // Sensory Fusion Trigger: Audio
      if (Date.now() - lastAudioTriggerTime.current > 5000) { // 5s debounce
          if (isGunshot) {
              lastAudioTriggerTime.current = Date.now();
              triggerSensoryFusion('Possible Gunshot (Audio Impulse)', 'AUDIO');
          } else if (isScreaming && avg > 60) {
              lastAudioTriggerTime.current = Date.now();
              triggerSensoryFusion('Distress Scream (Audio Signature)', 'AUDIO');
          }
      }

    }, 100); 
    return () => clearInterval(interval);
  }, [isArmed, audioAnalyser]); 

  // --- ACTIONS ---

  const addAlert = (alert: SecurityAlert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 500));
    setCameras(prev => prev.map(cam => cam.name === alert.location ? { ...cam, activeAlerts: cam.activeAlerts + 1, priorityScore: Math.min(100, cam.priorityScore + 20) } : cam));
    setAlertClusters(prev => {
      const existing = prev.findIndex(c => c.status === 'ACTIVE' && c.location === alert.location && (Date.now() - new Date(c.lastUpdate).getTime() < 120000));
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing].alerts.unshift(alert);
        updated[existing].lastUpdate = alert.timestamp;
        return updated;
      }
      return [{ id: `CLUS-${Date.now()}`, title: `${alert.threatType} Correlation`, location: alert.location, startTime: alert.timestamp, lastUpdate: alert.timestamp, severity: alert.severity, status: 'ACTIVE', alerts: [alert] }, ...prev];
    });
  };

  const logAuditAction = (alertId: string, action: AuditLogEntry['action'], details: string) => {
      setAlerts(prev => prev.map(a => {
          if (a.id === alertId) {
              const newEntry: AuditLogEntry = {
                  id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  timestamp: new Date().toISOString(),
                  user: currentUser,
                  action: action,
                  details: details
              };
              return { ...a, auditTrail: [...(a.auditTrail || []), newEntry] };
          }
          return a;
      }));
  };

  const resolveCluster = (id: string) => setAlertClusters(prev => prev.map(c => c.id === id ? { ...c, status: 'RESOLVED' } : c));
  const updateAlertFeedback = (id: string, feedback: FeedbackType) => {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, feedback } : a));
      logAuditAction(id, 'ANNOTATED', `Operator verified as ${feedback}`);
  };
  const updateStats = (occupancy: number, severity: Severity) => setStats(prev => ({ ...prev, occupancy, totalAlerts: prev.totalAlerts + 1, activeThreats: (severity === Severity.CRITICAL || severity === Severity.HIGH) ? prev.activeThreats + 1 : prev.activeThreats, lastUpdate: new Date().toISOString() }));
  
  const addAccessEvent = (event: AccessEvent) => {
      setAccessEvents(prev => [event, ...prev]);
      // Sensory Fusion Trigger: IoT
      if (event.status === 'VERIFIED_THREAT' || event.alarmType === 'DOOR_FORCED') {
          triggerSensoryFusion(`PACS ALARM: ${event.alarmType}`, 'IOT');
      }
  };

  const togglePin = (alert: SecurityAlert) => {
      setPinnedEvidence(prev => { 
          const exists = prev.find(p => p.id === alert.id); 
          if (exists) {
              logAuditAction(alert.id, 'STATUS_CHANGE', 'Removed from case board');
              return prev.filter(p => p.id !== alert.id); 
          }
          logAuditAction(alert.id, 'PINNED', 'Added to active investigation case board');
          return [...prev, { ...alert, exhibitId: `EX-${(prev.length + 1).toString().padStart(3, '0')}`, status: EvidenceStatus.DISCOVERY, tags: [] }]; 
      }); 
  };
  const updateEvidenceStatus = (id: string, status: EvidenceStatus) => setPinnedEvidence(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  const addEvidenceTag = (id: string, tag: string) => setPinnedEvidence(prev => prev.map(p => p.id === id ? { ...p, tags: [...(p.tags || []), tag] } : p));
  const removeEvidenceTag = (id: string, tag: string) => setPinnedEvidence(prev => prev.map(p => p.id === id ? { ...p, tags: (p.tags || []).filter(t => t !== tag) } : p));
  const addAlertRule = (rule: AlertRule) => setAlertRules(prev => [rule, ...prev]);
  const removeAlertRule = (id: string) => setAlertRules(prev => prev.filter(r => r.id !== id));
  const addAdaptiveProfile = (profile: AdaptiveProfile) => setAdaptiveProfiles(prev => [...prev, profile]);
  const removeAdaptiveProfile = (id: string) => setAdaptiveProfiles(prev => prev.filter(p => p.id !== id));
  const addThreatSignature = (sig: ThreatSignature) => setThreatSignatures(prev => [sig, ...prev]);
  const toggleThreatSignature = (id: string) => setThreatSignatures(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));

  // Shift & Logs
  const startShift = (officerName: string) => {
      setCurrentUser(officerName);
      setCurrentShift({
          id: `SHIFT-${Date.now()}`,
          officerOnDuty: officerName,
          startTime: new Date().toISOString(),
          status: 'ACTIVE',
          notes: ''
      });
      addLogEntry({
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'SYSTEM',
          type: 'SHIFT_CHANGE',
          content: `Shift started for officer ${officerName}`
      });
  };

  const endShift = () => {
      setCurrentShift(prev => ({ ...prev, endTime: new Date().toISOString(), status: 'CLOSED' }));
      addLogEntry({
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'SYSTEM',
          type: 'SHIFT_CHANGE',
          content: `Shift ended for officer ${currentUser}`
      });
      // In real app, prompt for next officer name
  };

  const addLogEntry = (entry: LogBookEntry) => {
      setLogEntries(prev => [entry, ...prev]);
      if (entry.relatedAlertId) {
          logAuditAction(entry.relatedAlertId, 'ANNOTATED', `Manual log entry: ${entry.content}`);
          // Also attach note to alert object itself for easier retrieval
          setAlerts(prev => prev.map(a => a.id === entry.relatedAlertId ? { ...a, manualNotes: [...(a.manualNotes || []), entry.content] } : a));
      }
  };

  const addBolo = (bolo: BoloSubject) => setBolos(prev => [bolo, ...prev]);
  const removeBolo = (id: string) => setBolos(prev => prev.filter(b => b.id !== id));

  const initiateVisualReID = async (snapshot: string) => {
    setAgentState(AgentState.REASONING);
    setCurrentAppView(AppView.VISUAL_TRACE);
    setLastThinkingProcess("Initiating Forensic Signature Tracking...");
    try {
      const session = await performVisualReID(snapshot, alerts);
      setReidSession(session);
    } catch (e: any) { 
      console.error(e);
      if (e.message?.includes('429')) setIsRateLimited(true);
    } finally { setAgentState(AgentState.IDLE); }
  };

  const contextValue = useMemo(() => ({
    isArmed, setArmed, globalLockdown, setGlobalLockdown, alerts, addAlert, alertClusters, resolveCluster, cameras, refreshCameras: initDevices, videoRegistry, attentionTargetId, setAttentionTargetId, updateAlertFeedback, stats, updateStats, videoRef, agentState, setAgentState, lastThinkingProcess, setLastThinkingProcess, accessEvents, addAccessEvent, detectionMode, setDetectionMode, facilityType, setFacilityType, audioMetrics, audioAnalyser, audioContextState, resumeAudio, systemHealth, pinnedEvidence, togglePin, updateEvidenceStatus, addEvidenceTag, removeEvidenceTag, initiateVisualReID, reidSession, currentAppView, setCurrentAppView, isRateLimited, duressTriggered, setDuressTriggered, alertRules, addAlertRule, removeAlertRule, adaptiveProfiles, addAdaptiveProfile, removeAdaptiveProfile, threatSignatures, addThreatSignature, toggleThreatSignature, primaryStream: null,
    currentUser, currentShift, startShift, endShift, logEntries, addLogEntry, bolos, addBolo, removeBolo, logAuditAction, apiKey, setApiKey
  }), [isArmed, globalLockdown, detectionMode, facilityType, alerts, alertClusters, accessEvents, pinnedEvidence, stats, cameras, attentionTargetId, agentState, lastThinkingProcess, audioMetrics, systemHealth, audioContextState, reidSession, currentAppView, isRateLimited, duressTriggered, alertRules, adaptiveProfiles, threatSignatures, currentShift, logEntries, bolos, currentUser, apiKey]);

  return <SecurityContext.Provider value={contextValue}>{children}</SecurityContext.Provider>;
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) throw new Error('useSecurity must be used within a SecurityProvider');
  return context;
};
