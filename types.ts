
export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFORMATIONAL = 'INFORMATIONAL'
}

export enum EnvironmentType {
    EDUCATION = 'EDUCATION',
    HEALTHCARE = 'HEALTHCARE',
    INDUSTRIAL = 'INDUSTRIAL',
    RESIDENTIAL = 'RESIDENTIAL',
    CORPORATE = 'CORPORATE',
    PUBLIC_SPACE = 'PUBLIC_SPACE'
}

export type DetectionMode = 'ULTRA_FAST' | 'BALANCED' | 'DETAILED';

export enum BehavioralState {
  NORMAL = 'NORMAL',
  SEARCHING = 'SEARCHING',
  CONCEALING = 'CONCEALING',
  DRAWING_WEAPON = 'DRAWING_WEAPON',
  AIMING_WEAPON = 'AIMING_WEAPON',
  RUNNING = 'RUNNING',
  AGGRESSIVE = 'AGGRESSIVE',
  FALLEN = 'FALLEN',
  UNAUTHORIZED_ZONE = 'UNAUTHORIZED_ZONE',
  STAKING = 'STAKING', 
  BLADING = 'BLADING', 
  CROWD_COMPRESSION = 'CROWD_COMPRESSION' 
}

export enum AgentAction {
  NONE = 'NONE',
  LOCK_PERIMETER = 'LOCK_PERIMETER',
  TRIGGER_ALARM = 'TRIGGER_ALARM',
  DISPATCH_GUARD = 'DISPATCH_GUARD',
  BROADCAST_WARNING = 'BROADCAST_WARNING',
  LOG_INCIDENT = 'LOG_INCIDENT',
  CALL_EMERGENCY = 'CALL_EMERGENCY',
  NOTIFY_SAFETY_OFFICER = 'NOTIFY_SAFETY_OFFICER',
  // New Crowd Actions
  DISPERSE_CROWD_LIGHTING = 'DISPERSE_CROWD_LIGHTING',
  UNLOCK_EGRESS_DOORS = 'UNLOCK_EGRESS_DOORS',
  INITIATE_NEGOTIATION = 'INITIATE_NEGOTIATION'
}

export enum AgentState {
  IDLE = 'IDLE',
  PERCEIVING = 'PERCEIVING',
  REASONING = 'REASONING',
  ACTING = 'ACTING'
}

export enum DecisionTier {
  TIER_1_AUTONOMOUS = 'TIER_1_AUTONOMOUS',
  TIER_2_NOTIFY = 'TIER_2_NOTIFY',
  TIER_3_RECOMMEND = 'TIER_3_RECOMMEND',
  TIER_4_HUMAN_ONLY = 'TIER_4_HUMAN_ONLY'
}

export enum ActionStatus {
  EXECUTED = 'EXECUTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  REQUIRES_HUMAN = 'REQUIRES_HUMAN'
}

export enum FeedbackType {
  TRUE_POSITIVE = 'TRUE_POSITIVE',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
  NEEDS_CORRECTION = 'NEEDS_CORRECTION'
}

export enum IntentCategory {
  LEGITIMATE_ROUTINE = 'LEGITIMATE_ROUTINE',
  LEGITIMATE_UNUSUAL = 'LEGITIMATE_UNUSUAL',
  AMBIGUOUS_UNKNOWN = 'AMBIGUOUS_UNKNOWN',
  SUSPICIOUS_CONCERNING = 'SUSPICIOUS_CONCERNING',
  MALICIOUS_THREATENING = 'MALICIOUS_THREATENING'
}

export enum ResponseProfile {
    SILENT = 'SILENT',
    STANDARD = 'STANDARD',
    TACTICAL = 'TACTICAL'
}

export interface DispatchTransmission {
    id: string;
    sender: string;
    message: string;
    timestamp: string;
    priority?: 'ROUTINE' | 'URGENT' | 'CRITICAL';
}

export interface IntentAnalysis {
  category: IntentCategory;
  confidence: number;
  behavioralState: BehavioralState;
  concealmentScore: number;
  indicators: {
    purposefulness: number;
    nervousness: number;
    concealment: number;
    preparation: number;
  };
  summary: string;
}

export interface ConfidenceDetails {
  visualQuality: number;
  objectClarity: number;
  behavioralMatch: number;
}

export interface AudioMetrics {
  decibelLevel: number;
  isScreaming: boolean;
  isGunshot: boolean;
  peakFrequency?: number;
  vocalStressScore?: number;
}

export interface AcousticEvent {
  id: string;
  timestamp: string;
  type: 'BALLISTIC' | 'SPEECH' | 'MECHANICAL' | 'ALARM' | 'IMPACT';
  subType: string;
  confidence: number;
  decibels: number;
  location: string;
  isThreat: boolean;
  rawAnalysis: string;
}

export interface SystemHealth {
  neuralLoad: number;
  latencyMs: number;
  networkIntegrity: number;
  uptime: number;
}

export interface PredictiveAnalysis {
  escalationProbability: number;
  predictedNextAction: string;
  interventionRecommendation: string;
  convergenceScore: number; 
  timeToIncident?: string; // e.g., "< 10s"
  trajectory?: {
    vector: string;
    nextZoneId: string;
    arrivalEta: number;
    coordinates: { x: number, y: number }[];
  };
}

export interface CrisisProtocol {
  paAnnouncementScript: string;
  firstResponderMessage: string;
  tone: 'CALM_DIRECTIVE' | 'URGENT_WARNING' | 'DE_ESCALATION';
}

export interface LegalCompliance {
  admissibilityScore: number;
  privacyMaskingActive: boolean;
  chainOfCustodyHash: string;
  complianceNotes: string;
}

// New Crowd Metrics
export interface CrowdMetrics {
    density: number; // 0-100
    flowVector: string; // e.g., "NORTH_RAPID", "SCATTERING", "STAGNANT"
    sentiment: 'CALM' | 'AGITATED' | 'PANIC' | 'JOYOUS' | 'HOSTILE';
    tensionLevel: number; // 0-100
    anomalyScore: number;
}

export interface GroupDynamics {
  detected: boolean;
  size: number;
  type: 'NONE' | 'ORGANIZED' | 'CASUAL' | 'MOB' | 'WORK_CREW';
  behavior: string;
}

export interface EntityInteraction {
  detected: boolean;
  type: 'NONE' | 'COOPERATIVE' | 'CONFRONTATIONAL' | 'COERCION' | 'TRANSACTION' | 'FOLLOWING';
  details: string;
}

export interface EnvironmentalContext {
  weather: 'CLEAR' | 'RAIN' | 'WIND' | 'FOG' | 'SNOW' | 'UNKNOWN';
  lighting: 'DAYLIGHT' | 'LOW_LIGHT' | 'ARTIFICIAL' | 'DARK';
  facilityState: 'NORMAL' | 'EMERGENCY' | 'LOCKDOWN' | 'AFTER_HOURS' | 'EVENT_MODE';
  facilityType: EnvironmentType;
  impactAnalysis: string;
}

export interface VisualSignature {
  face: string;
  torso: string;
  legs: string;
  accessories: string[];
  gait: string;
  gaitMetrics?: {
    cadence: number;
    strideSymmetry: number;
    postureLean: number;
  }
}

export interface TrackingContext {
  entityId: string;
  isReidentified: boolean;
  previousCamera?: string;
  likelyNextCamera?: string;
  timeSinceLastSighting?: string;
}

export interface BoundingBox {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
    label: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    user: string;
    action: 'CAPTURED' | 'VIEWED' | 'EXPORTED' | 'ANNOTATED' | 'PINNED' | 'ANALYZED' | 'STATUS_CHANGE';
    details: string;
    hash?: string;
}

export interface LogBookEntry {
    id: string;
    timestamp: string;
    user: string;
    type: 'MANUAL_NOTE' | 'SYSTEM_EVENT' | 'SHIFT_CHANGE' | 'ALERT_ANNOTATION';
    content: string;
    relatedAlertId?: string;
    isPinned?: boolean;
}

export interface BoloSubject {
    id: string;
    name: string; // or "Unknown Subject"
    description: string;
    reason: string;
    active: boolean;
    addedBy: string;
    timestamp: string;
    snapshot?: string;
}

export interface ShiftState {
    id: string;
    officerOnDuty: string;
    startTime: string;
    endTime?: string;
    status: 'ACTIVE' | 'CLOSED';
    notes: string;
}

export interface NegotiationEntry {
    id: string;
    timestamp: string;
    speaker: 'AI' | 'INTRUDER';
    text: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: Severity;
  threatType: string;
  location: string;
  description: string;
  confidence: number;
  confidenceDetails?: ConfidenceDetails;
  reasoning: string;
  snapshot?: string;
  weaponDetected: boolean;
  weaponType?: 'HANDGUN' | 'LONG_GUN' | 'KNIFE' | 'IMPROVISED' | 'UNKNOWN';
  detections?: BoundingBox[];
  chainOfThought: string;
  autonomousAction: AgentAction;
  decisionTier: DecisionTier;
  actionStatus: ActionStatus;
  recommendedAction: string;
  intent: IntentAnalysis;
  prediction: PredictiveAnalysis;
  crisis?: CrisisProtocol;
  compliance?: LegalCompliance;
  groupDynamics: GroupDynamics;
  crowdMetrics?: CrowdMetrics; // New field
  interaction: EntityInteraction;
  environment: EnvironmentalContext;
  visualSignature?: VisualSignature;
  tracking?: TrackingContext;
  feedback?: FeedbackType;
  contextualRelevance: string;
  auditTrail: AuditLogEntry[];
  negotiationLog?: NegotiationEntry[]; // New field
  watermarkedSnapshot?: string;
  manualNotes?: string[];
  microBehaviors?: string[]; 
  modalitySource?: ('VISUAL' | 'AUDIO' | 'IOT' | 'FUSION')[];
  verificationDetails?: {
    trigger: string;
    visualConfirmation: string;
    status: 'VERIFIED' | 'REJECTED' | 'PENDING';
  };
  occupancy?: number;
}

export enum EvidenceStatus {
  DISCOVERY = 'DISCOVERY',
  ACTIVE_INVESTIGATION = 'ACTIVE_INVESTIGATION',
  LEGAL_EXHIBIT = 'LEGAL_EXHIBIT'
}

export interface PinnedEvidence extends SecurityAlert {
  exhibitId: string;
  status: EvidenceStatus;
  tags: string[];
}

export interface VideoSearchResult {
  alertId: string;
  relevanceScore: number;
  matchReason: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  conditions: {
    target: string;
    location: string;
    behavior: string;
    timeConstraint?: string;
    duration?: string;
  };
  action: string;
  createdAt: string;
}

export interface ThreatSignature {
    id: string;
    name: string;
    description: string;
    type: 'BEHAVIORAL' | 'SPATIAL' | 'TEMPORAL' | 'ANOMALY';
    confidence: number;
    maturity: number; // 0-100, how well trained
    lastDetected: string;
    active: boolean;
    tags: string[];
}

export interface AdaptiveProfile {
    id: string;
    name: string;
    targetCameraId: string; // 'ALL' or specific ID
    schedule: {
        startTime: string; // "22:00"
        endTime: string;   // "06:00"
    };
    sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM';
    isActive: boolean;
}

export interface ChainOfCustodyLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'CAPTURED' | 'VIEWED' | 'EXPORTED' | 'ANNOTATED' | 'HASH_VERIFIED';
  details: string;
  hash?: string;
}

export interface EvidenceItem {
  id: string;
  type: 'VIDEO_CLIP' | 'SNAPSHOT' | 'LOG_ENTRY' | 'ALERT_METADATA';
  timestamp: string;
  sourceId: string; 
  description: string;
  data?: string;
  custodyLogs: ChainOfCustodyLog[];
}

export interface IncidentReport {
  id: string;
  generatedAt: string;
  title: string;
  narrative: string;
  gapAnalysis: string;
  timeline: { time: string; event: string }[];
  evidenceCount: number;
  status: 'DRAFT' | 'FINALIZED' | 'EXPORTED';
}

export interface PatternInsight {
  id: string;
  type: 'BASELINE_DRIFT' | 'RECURRING_ANOMALY' | 'NOVEL_THREAT';
  title: string;
  description: string;
  confidence: number;
  evidenceCount: number;
  recommendedAdjustment: string;
}

export interface GraphNode {
    id: string;
    label: string;
    type: 'ENTITY' | 'LOCATION' | 'EVENT' | 'WEAPON';
    riskScore: number;
    details?: string;
    x: number;
    y: number;
}

export interface GraphLink {
    source: string;
    target: string;
    label: string;
    strength: number;
    type?: 'CAUSAL' | 'SPATIAL' | 'TEMPORAL' | 'ATTRIBUTE';
}

export interface GraphAnalysisResult {
    nodes: GraphNode[];
    links: GraphLink[];
    summary: string;
}

export interface BiometricMatch {
    matchFound: boolean;
    identityId?: string;
    name?: string;
    confidence: number;
    databaseSource?: string;
    notes?: string;
}

export interface ReIDMatch {
  alertId: string;
  similarityScore: number;
  reasoning: string;
  matchedFeatures?: string[];
}

export interface CompanionDiscovery {
  entityId: string;
  confidence: number;
  sharedLocations: string[];
  visualSignature: string;
  behavioralAlignment: {
    syncScore: number;
    alignmentType: 'SYNCHRONIZED' | 'LEADING' | 'TRAILING' | 'DIVERGENT';
    proximityVector: string;
  };
  riskContagion: number;
}

export interface GaitEnhancementSuggestion {
  reason: string;
  inferredMetrics: {
    limpDetected: boolean;
    strideConsistency: number;
    cadenceProfile: string;
  }
}

export interface NearbyAnomaly {
  alertId: string;
  proximityType: 'SPATIAL' | 'TEMPORAL' | 'SITUATIONAL';
  relevance: string;
  correlationStrength: number;
  vectorLabel: 'ENVIRONMENTAL' | 'DIGITAL' | 'MECHANICAL' | 'BEHAVIORAL';
}

export interface ReIDSession {
  targetSnapshot: string;
  matches: ReIDMatch[];
  timestamp: Date;
  extractedSignature?: {
    torso: string;
    legs: string;
    build: string;
    accessories: string[];
    gaitDescription: string;
  };
  predictedNextZone?: string;
  companions?: CompanionDiscovery[];
  gaitOptimization?: GaitEnhancementSuggestion;
  nearbyAnomalies?: NearbyAnomaly[];
}

export interface CameraFeed {
  id: string;
  name: string;
  zone: string;
  status: 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'MAINTENANCE';
  priorityScore: number;
  activeAlerts: number;
  lastActivity: string;
  isPrimary?: boolean;
  isVirtual?: boolean;
  deviceId?: string;
  clusterTag?: string;
  floorPlanCoords: { x: number, y: number }; 
}

export interface AlertCluster {
    id: string;
    title: string;
    alerts: SecurityAlert[];
    startTime: string;
    lastUpdate: string;
    severity: Severity;
    status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
    location: string;
}

export interface OccupancyZone {
  id: string;
  name: string;
  currentCount: number;
  capacity: number;
  status: 'LOW' | 'OPTIMAL' | 'HIGH' | 'OVERCROWDED';
  trend: 'RISING' | 'STABLE' | 'FALLING';
}

export interface OccupancyTrendPoint {
  time: string;
  count: number;
  zone: string;
}

export interface ResponseStep {
    id: string;
    action: string;
    target: string;
    type: 'AUTOMATED' | 'MANUAL_REQUIRED';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    eta?: string;
    instructions?: string;
    rationale?: string; // New: AI explanation for why this step was chosen
}

export interface ResponseProtocol {
    id: string;
    incidentId: string;
    playbookName: string;
    startedAt: string;
    steps: ResponseStep[];
    status: 'ACTIVE' | 'COMPLETED';
}

export interface Guard {
    id: string;
    name: string;
    currentZone: string;
    status: 'PATROLLING' | 'RESPONDING' | 'STATIONARY' | 'BREAK';
    batteryLevel: number;
    lastCheckIn: string;
    heartRate?: number;
    bodyCamActive?: boolean;
}

export interface PatrolDirective {
    id: string;
    guardId: string;
    targetZone: string;
    priority: 'HIGH' | 'ROUTINE';
    reason: string;
    generatedAt: string;
}

export interface Site {
    id: string;
    name: string;
    location: string;
    status: 'NORMAL' | 'ELEVATED' | 'LOCKDOWN';
    alertCount: number;
    coordinates: { lat: number, lng: number };
}

export interface Principal {
    id: string;
    name: string;
    title: string;
    status: 'SECURE' | 'AT_RISK' | 'TRANSIT';
    currentLocation: {
        siteId: string;
        zone: string;
    };
    protectionLevel: 'STANDARD' | 'ELEVATED' | 'MAXIMUM';
    lastUpdate: string;
}

export interface GlobalThreat {
    id: string;
    type: 'COORDINATED_ATTACK' | 'TRAVEL_PATTERN' | 'INSIDER_THREAT';
    description: string;
    affectedSites: string[];
    severity: Severity;
    timestamp: string;
    confidence: number;
    reasoning: string;
}

export interface ExecutiveReport {
    principalId: string;
    threatScore: number;
    narrative: string;
    nearbyThreats: string[];
    recommendedAction: string;
}

export enum InsiderRiskLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MODERATE = 'MODERATE',
  LOW = 'LOW'
}

export interface InsiderRiskFactor {
  id: string;
  type: 'BEHAVIORAL_DEVIATION' | 'POLICY_VIOLATION' | 'ACCESS_ANOMALY' | 'DATA_EXFILTRATION';
  description: string;
  severity: Severity;
  timestamp: string;
  weight: number;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  riskScore: number;
  riskLevel: InsiderRiskLevel;
  lastAssessment: string;
  riskFactors: InsiderRiskFactor[];
  behavioralBaseline: string;
  anomalyAnalysis: string;
  recommendedAction: string;
}

export type AccessAlarmType = 'DOOR_FORCED' | 'DOOR_HELD' | 'TAILGATING' | 'INVALID_BADGE';
export type AccessVerdict = 'ANALYZING' | 'AUTO_CLEARED' | 'VERIFIED_THREAT' | 'NEEDS_REVIEW';

export interface AccessEvent {
  id: string;
  timestamp: string;
  doorName: string;
  alarmType: AccessAlarmType;
  status: AccessVerdict;
  confidence: number;
  reasoning: string;
  snapshot?: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  INVESTIGATION = 'INVESTIGATION',
  OPERATIONS = 'OPERATIONS',
  ENTERPRISE = 'ENTERPRISE',
  ALERTS = 'ALERTS',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
  VISUAL_TRACE = 'VISUAL_TRACE',
  AUDIO_FORENSICS = 'AUDIO_FORENSICS',
  EMERGENCY_DISPATCH = 'EMERGENCY_DISPATCH',
  SHIFT_LOGBOOK = 'SHIFT_LOGBOOK'
}

export interface SecurityStats {
  activeThreats: number;
  occupancy: number;
  totalAlerts: number;
  lastUpdate: string;
}

export type InvestigationTool = 'SEARCH_LOGS' | 'TRACK_ENTITY' | 'TIMELINE_ANALYSIS' | 'RISK_ASSESSMENT' | 'ACCESS_CORRELATION' | 'TEMPORAL_LOOKBACK';

export interface InvestigationStep {
  id: number;
  tool: InvestigationTool;
  description: string;
  reasoning: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  result?: string;
  resultData?: any;
}

export interface InvestigationPlan {
  goal: string;
  steps: InvestigationStep[];
}

export type AgentPersona = 'GHOST_TRACER' | 'THE_ARCHITECT' | 'THE_LIAISON' | 'CENTRAL_COMMAND';

export interface AgentResponse {
    persona: AgentPersona;
    thoughtProcess: string;
    output: string;
    confidence: number;
    color: string;
    proposedAction?: string;
}

export interface CouncilSession {
    id: string;
    query: string;
    responses: AgentResponse[];
    consensus: string;
    timestamp: Date;
    suggestedActions?: SuggestedAction[];
}

export interface SuggestedAction {
    label: string;
    query: string;
    icon?: string;
    type?: 'FORENSIC' | 'TACTICAL' | 'COMPLIANCE' | 'SYSTEM';
}

export interface ChatMessage {
  id: string;
  role: 'USER' | 'SYSTEM' | 'AGENT';
  persona?: AgentPersona;
  type: 'TEXT' | 'PLAN_EXECUTION' | 'COUNCIL_SESSION';
  content?: string;
  plan?: InvestigationPlan; 
  councilSession?: CouncilSession;
  report?: string;
  suggestedActions?: SuggestedAction[];
  timestamp: Date;
}

export interface OrchestratorResponse {
  type: 'PLAN' | 'CLARIFICATION' | 'ANSWER' | 'COUNCIL_INVOCATION';
  thought: string;
  text?: string;
  suggestedActions?: SuggestedAction[];
  plan?: {
    goal: string;
    steps: InvestigationStep[];
  };
}

export interface EmergencyService {
    id: string;
    name: string;
    type: 'POLICE' | 'FIRE' | 'EMS';
    distance: number;
    status: 'AVAILABLE' | 'EN_ROUTE' | 'BUSY';
    eta: number;
}
