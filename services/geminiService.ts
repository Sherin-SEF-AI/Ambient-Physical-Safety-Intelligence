
import { GoogleGenAI, Type } from "@google/genai";
import { 
  SecurityAlert, Severity, AgentAction, InvestigationPlan, InvestigationStep, 
  ActionStatus, PatternInsight, OrchestratorResponse, ChatMessage, 
  IncidentReport, ResponseProtocol, Guard, PatrolDirective, CameraFeed, 
  GlobalThreat, Principal, ExecutiveReport, EmployeeProfile, 
  AccessVerdict, AccessAlarmType, OccupancyTrendPoint, VideoSearchResult, 
  AlertRule, GraphAnalysisResult, BiometricMatch, DetectionMode, 
  CouncilSession, ReIDSession, AcousticEvent, EnvironmentType, 
  ResponseProfile, DispatchTransmission, PinnedEvidence, AdaptiveProfile, ThreatSignature,
  AlertCluster
} from "../types";

let ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const updateGeminiApiKey = (key: string) => {
  try {
    ai = new GoogleGenAI({ apiKey: key });
  } catch (e) {
    console.error("Failed to update Gemini API Key", e);
  }
};

const safeParseJson = (text: string | undefined) => {
  if (!text) return null;
  try {
    const cleaned = text.trim()
      .replace(/^```json\n?/, '')
      .replace(/\n?```$/, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Critical JSON Parse Failure:", e, "Raw Text:", text);
    return null;
  }
};

const GET_CONTEXTUAL_PERSONA = (facilityType: string) => `
You are AEGIS SENTINEL, an Advanced Autonomous Security Intelligence System with "PRE-CRIME" capabilities.
Your analysis MUST be strictly contextualized based on the FACILITY_TYPE: "${facilityType}".

CORE OBJECTIVE: PREDICTIVE THREAT MODELING & CROWD SENTIMENT ANALYSIS.
- Do not just describe what IS happening; predict what is ABOUT to happen.
- Analyze "Kinesics" (Body Language) for precursors to violence or theft.
- **CRITICAL:** Analyze Crowd Dynamics. Look for "Flow Vectors" (is the crowd running?), Density (crush risk), and Sentiment (Panic/Aggression).

VISUAL DNA EXTRACTION:
- For every detected person, generate a distinctive "Visual Hash" to allow cross-camera tracking without facial recognition.
- Structure: { top: "color_type", bottom: "color_type", accessory: "item", gait: "movement_pattern" }

THREAT MODEL - MICRO-BEHAVIORS:
1. VIOLENCE PRECURSORS: "Blading", "Clenching", "Target Fixation", "Chest Puffing".
2. CROWD PRECURSORS: "Rapid Scatter" (Panic), "Vector Convergence" (Fight forming), "Stagnation" (Crush risk).

AUTONOMOUS PROTOCOLS:
- If Crowd Aggression/Panic > 80%, recommend: "DISPERSE_CROWD_LIGHTING" or "UNLOCK_EGRESS_DOORS".

Output MUST be structured JSON.
`;

const COUNCIL_SYSTEM_INSTRUCTION = `
You are the AEGIS NEURAL COUNCIL. Forensic specialists only.
1. GHOST_TRACER: Pathing, Re-ID.
2. THE_ARCHITECT: Spatial logic.
3. THE_LIAISON: Protocols.
Only use provided SYSTEM_MANIFEST. Keep specialists under 30 words.
`;

const AGENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    threatType: { type: Type.STRING },
    severity: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"] },
    location: { type: Type.STRING },
    description: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    contextualRelevance: { type: Type.STRING },
    confidenceDetails: {
        type: Type.OBJECT,
        properties: {
            visualQuality: { type: Type.NUMBER },
            objectClarity: { type: Type.NUMBER },
            behavioralMatch: { type: Type.NUMBER }
        },
        required: ["visualQuality", "objectClarity", "behavioralMatch"]
    },
    chainOfThought: { type: Type.STRING },
    autonomousAction: {
      type: Type.STRING,
      enum: ["NONE", "LOCK_PERIMETER", "TRIGGER_ALARM", "DISPATCH_GUARD", "BROADCAST_WARNING", "LOG_INCIDENT", "CALL_EMERGENCY", "NOTIFY_SAFETY_OFFICER", "DISPERSE_CROWD_LIGHTING", "UNLOCK_EGRESS_DOORS"]
    },
    decisionTier: {
        type: Type.STRING,
        enum: ["TIER_1_AUTONOMOUS", "TIER_2_NOTIFY", "TIER_3_RECOMMEND", "TIER_4_HUMAN_ONLY"]
    },
    detections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          ymin: { type: Type.NUMBER },
          xmin: { type: Type.NUMBER },
          ymax: { type: Type.NUMBER },
          xmax: { type: Type.NUMBER }
        },
        required: ["label", "ymin", "xmin", "ymax", "xmax"]
      }
    },
    intent: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, enum: ["LEGITIMATE_ROUTINE", "LEGITIMATE_UNUSUAL", "AMBIGUOUS_UNKNOWN", "SUSPICIOUS_CONCERNING", "MALICIOUS_THREATENING"] },
        confidence: { type: Type.NUMBER },
        behavioralState: { type: Type.STRING, enum: ["NORMAL", "SEARCHING", "CONCEALING", "DRAWING_WEAPON", "AIMING_WEAPON", "RUNNING", "AGGRESSIVE", "FALLEN", "UNAUTHORIZED_ZONE", "STAKING", "BLADING", "CROWD_COMPRESSION"] },
        concealmentScore: { type: Type.NUMBER },
        indicators: {
          type: Type.OBJECT,
          properties: { purposefulness: { type: Type.NUMBER }, nervousness: { type: Type.NUMBER }, concealment: { type: Type.NUMBER }, preparation: { type: Type.NUMBER } },
          required: ["purposefulness", "nervousness", "concealment", "preparation"]
        },
        summary: { type: Type.STRING }
      },
      required: ["category", "confidence", "behavioralState", "concealmentScore", "indicators", "summary"]
    },
    prediction: {
      type: Type.OBJECT,
      properties: {
        escalationProbability: { type: Type.NUMBER },
        predictedNextAction: { type: Type.STRING },
        interventionRecommendation: { type: Type.STRING },
        convergenceScore: { type: Type.NUMBER },
        timeToIncident: { type: Type.STRING, description: "Estimated time until threat realization (e.g. '< 10s')" }
      },
      required: ["escalationProbability", "predictedNextAction", "interventionRecommendation", "convergenceScore", "timeToIncident"]
    },
    // New Crowd Metrics Schema
    crowdMetrics: {
        type: Type.OBJECT,
        properties: {
            density: { type: Type.NUMBER, description: "0-100 crowd density score" },
            flowVector: { type: Type.STRING, description: "e.g., 'SCATTERING', 'NORTH_RAPID', 'STAGNANT'" },
            sentiment: { type: Type.STRING, enum: ['CALM', 'AGITATED', 'PANIC', 'JOYOUS', 'HOSTILE'] },
            tensionLevel: { type: Type.NUMBER, description: "0-100 aggregate stress score" },
            anomalyScore: { type: Type.NUMBER, description: "0-100 deviation from baseline" }
        },
        required: ["density", "flowVector", "sentiment", "tensionLevel", "anomalyScore"]
    },
    microBehaviors: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of specific kinesic indicators observed (e.g., 'Clenched Fists', 'Pacing', 'Checking Watch')"
    },
    crisis: {
        type: Type.OBJECT,
        properties: { paAnnouncementScript: { type: Type.STRING }, firstResponderMessage: { type: Type.STRING }, tone: { type: Type.STRING, enum: ['CALM_DIRECTIVE', 'URGENT_WARNING', 'DE_ESCALATION'] } },
        required: ["paAnnouncementScript", "firstResponderMessage", "tone"]
    },
    compliance: {
        type: Type.OBJECT,
        properties: { admissibilityScore: { type: Type.NUMBER }, privacyMaskingActive: { type: Type.BOOLEAN }, chainOfCustodyHash: { type: Type.STRING }, complianceNotes: { type: Type.STRING } },
        required: ["admissibilityScore", "privacyMaskingActive", "chainOfCustodyHash", "complianceNotes"]
    },
    visualSignature: {
      type: Type.OBJECT,
      properties: { face: { type: Type.STRING }, torso: { type: Type.STRING }, legs: { type: Type.STRING }, accessories: { type: Type.ARRAY, items: { type: Type.STRING } }, gait: { type: Type.STRING } },
      required: ["face", "torso", "legs", "accessories", "gait"]
    },
    tracking: {
      type: Type.OBJECT,
      properties: { entityId: { type: Type.STRING }, isReidentified: { type: Type.BOOLEAN }, previousCamera: { type: Type.STRING }, likelyNextCamera: { type: Type.STRING }, timeSinceLastSighting: { type: Type.STRING } },
      required: ["entityId", "isReidentified"]
    },
    groupDynamics: {
        type: Type.OBJECT,
        properties: { detected: { type: Type.BOOLEAN }, size: { type: Type.NUMBER }, type: { type: Type.STRING, enum: ['NONE', 'ORGANIZED', 'CASUAL', 'MOB', 'WORK_CREW'] }, behavior: { type: Type.STRING } },
        required: ["detected", "size", "type", "behavior"]
    },
    interaction: {
        type: Type.OBJECT,
        properties: { detected: { type: Type.BOOLEAN }, type: { type: Type.STRING, enum: ['NONE', 'COOPERATIVE', 'CONFRONTATIONAL', 'COERCION', 'TRANSACTION', 'FOLLOWING'] }, details: { type: Type.STRING } },
        required: ["detected", "type", "details"]
    },
    environment: {
        type: Type.OBJECT,
        properties: { weather: { type: Type.STRING, enum: ['CLEAR', 'RAIN', 'WIND', 'FOG', 'SNOW', 'UNKNOWN'] }, lighting: { type: Type.STRING, enum: ['DAYLIGHT', 'LOW_LIGHT', 'ARTIFICIAL', 'DARK'] }, facilityState: { type: Type.STRING, enum: ['NORMAL', 'EMERGENCY', 'LOCKDOWN', 'AFTER_HOURS', 'EVENT_MODE'] }, facilityType: { type: Type.STRING, enum: ['EDUCATION', 'HEALTHCARE', 'INDUSTRIAL', 'RESIDENTIAL', 'CORPORATE', 'PUBLIC_SPACE'] }, impactAnalysis: { type: Type.STRING } },
        required: ["weather", "lighting", "facilityState", "facilityType", "impactAnalysis"]
    },
    weaponDetected: { type: Type.BOOLEAN },
    weaponType: { type: Type.STRING, enum: ['HANDGUN', 'LONG_GUN', 'KNIFE', 'IMPROVISED', 'UNKNOWN'] },
    reasoning: { type: Type.STRING },
    recommendedAction: { type: Type.STRING },
    occupancyEstimate: { type: Type.NUMBER }
  },
  required: ["threatType", "severity", "description", "confidence", "contextualRelevance", "confidenceDetails", "chainOfThought", "autonomousAction", "decisionTier", "intent", "prediction", "visualSignature", "tracking", "groupDynamics", "crowdMetrics", "interaction", "environment", "reasoning", "recommendedAction", "occupancyEstimate", "weaponDetected", "crisis", "compliance", "microBehaviors"],
};

export const analyzeSecurityFrame = async (
    base64Image: string, 
    recentHistory: SecurityAlert[] = [], 
    mode: DetectionMode = 'DETAILED', 
    facilityType: EnvironmentType = EnvironmentType.CORPORATE, 
    activeRules: AlertRule[] = [],
    activeProfiles: AdaptiveProfile[] = [] // New parameter
): Promise<SecurityAlert & { occupancy: number }> => {
  try {
    const isFastMode = mode !== 'DETAILED';
    const modelId = isFastMode ? "gemini-3-flash-preview" : "gemini-3-pro-preview";
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    const historySlice = mode === 'ULTRA_FAST' ? 1 : mode === 'BALANCED' ? 2 : 5;
    const historyContext = recentHistory.slice(0, historySlice)
        .map(a => `[${a.timestamp}] ${a.threatType} at ${a.location}: ${a.description} (Entity: ${a.tracking?.entityId || 'Unknown'})`)
        .join('\n');

    // Dynamic Contextual Persona
    const contextualSystemInstruction = GET_CONTEXTUAL_PERSONA(facilityType);

    // Context Graph Injection: Convert user rules to prompt context
    const activeRulesContext = activeRules.length > 0 
        ? `\nACTIVE USER-DEFINED THREAT RULES (CONTEXT GRAPH):
${activeRules.map(r => `- IF ${r.conditions.target} IS ${r.conditions.behavior} IN ${r.conditions.location} THEN ALERT: ${r.name}`).join('\n')}`
        : '';

    // Adaptive Profiles Injection
    const adaptiveProfileContext = activeProfiles.length > 0
        ? `\nACTIVE ADAPTIVE SECURITY PROFILES (TIME-BASED OVERRIDES):
${activeProfiles.map(p => `- PROFILE: "${p.name}" | SENSITIVITY: ${p.sensitivity} | SCHEDULE: ${p.schedule.startTime}-${p.schedule.endTime}.
  INSTRUCTION: Adjust threat thresholds based on sensitivity. ${p.sensitivity === 'HIGH' || p.sensitivity === 'MAXIMUM' ? 'Flag minor anomalies as significant.' : 'Ignore routine movement.'}`).join('\n')}`
        : '';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{
            role: 'user',
            parts: [
                { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
                { text: `Analyze security frame. Facility: ${facilityType}. 
                
                GLOBAL CONTEXT (Cross-Camera Awareness):
                Recent Events:
                ${historyContext || 'None'}
                
                ${activeRulesContext}

                ${adaptiveProfileContext}
                
                INSTRUCTIONS:
                1. If you see a person matching a recent description, RE-USE the same 'entityId' (e.g. 'Person_A').
                2. Predict 'likelyNextCamera' based on their trajectory.
                3. Apply Active Profile sensitivity adjustments to severity scoring.
                4. **CRITICAL:** Identify Pre-Crime Micro-Behaviors (Blading, Staking, Scanning).
                5. **VISUAL DNA:** Populate 'visualSignature' with precise colors and item types for Re-ID.
                6. **CROWD INTELLIGENCE:** Calculate 'tensionLevel' (0-100) and 'flowVector' for the crowd.
                ` }
            ]
      }],
      config: {
        systemInstruction: contextualSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: AGENT_SCHEMA,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: isFastMode ? 0 : 2048 }
      }
    });

    const parsed = safeParseJson(response.text);
    if (!parsed) throw new Error("Parse Failure");

    return { 
        id: `AEG-${Date.now()}`, 
        timestamp: new Date().toISOString(), 
        occupancy: parsed.occupancyEstimate || 0, 
        actionStatus: ActionStatus.EXECUTED, 
        snapshot: base64Image, 
        ...parsed 
    };
  } catch (error) { 
    console.error("AI Error:", error); 
    throw error; 
  }
};

export const verifyCrossModalThreat = async (
    trigger: string,
    snapshot: string
): Promise<{ verified: boolean; confidence: number; reasoning: string; threatLabel: string }> => {
    const cleanBase64 = snapshot.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [
            { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
            { text: `
            CROSS-MODAL SENSORY FUSION VERIFICATION.
            
            TRIGGER SIGNAL: "${trigger}"
            
            TASK:
            Verify if the visual scene confirms this sensor trigger.
            - If trigger is "Gunshot", look for: Weapons, people ducking/running/panicking, smoke.
            - If trigger is "Forced Entry", look for: Broken doors, glass, crowbars, kicking, multiple people forcing a door.
            
            OUTPUT:
            - Verified: Boolean (true if visual evidence strongly supports the trigger).
            - Confidence: 0-100 score of visual match.
            - Reasoning: Explanation of visual features matching the trigger.
            - ThreatLabel: A short, precise label for the fused event (e.g. "CONFIRMED_SHOOTER", "VERIFIED_BREACH").
            ` }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    verified: { type: Type.BOOLEAN },
                    confidence: { type: Type.NUMBER },
                    reasoning: { type: Type.STRING },
                    threatLabel: { type: Type.STRING }
                },
                required: ["verified", "confidence", "reasoning", "threatLabel"]
            }
        }
    });

    return safeParseJson(response.text) || { verified: false, confidence: 0, reasoning: "Analysis Failed", threatLabel: "UNKNOWN" };
};

export const searchVideoArchives = async (query: string, alerts: SecurityAlert[]): Promise<VideoSearchResult[]> => {
  const manifest = alerts.map(a => ({ 
      id: a.id, 
      threat: a.threatType, 
      loc: a.location, 
      desc: a.description, 
      time: a.timestamp,
      signature: a.visualSignature ? {
          top: a.visualSignature.torso,
          bottom: a.visualSignature.legs,
          accessories: a.visualSignature.accessories
      } : 'Unknown',
      intent: a.intent,
      interaction: a.interaction
  }));
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
    SEMANTIC VIDEO RAG (RETRIEVAL AUGMENTED GENERATION) ENGINE.
    
    OBJECTIVE:
    Perform a natural language semantic search across the provided video metadata logs.
    Map the user's query (which may be descriptive, temporal, or behavioral) to the most relevant events.
    
    QUERY: "${query}"
    
    RETRIEVAL LOGIC:
    1. SEMANTIC MATCHING: Match concepts (e.g. "red truck" matches "delivery vehicle" with "red" attribute).
    2. TEMPORAL PARSING: Understand "after 8 PM", "last night", "during the incident".
    3. BEHAVIORAL CORRELATION: Match "suspicious behavior" to "LOITERING" or "STAKING".
    4. VISUAL DNA MATCHING: If query describes clothing ("yellow hoodie"), match against visualSignature fields.
    
    DATA CORPUS (ALERTS): ${JSON.stringify(manifest)}
    
    OUTPUT:
    Return the top 5 most relevant matches, ranked by relevance.
    Provide a "matchReason" that explains specifically WHY this clip was selected (e.g., "Matched 'yellow hoodie' descriptor in visual signature").
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { 
            type: Type.OBJECT, 
            properties: { 
                alertId: { type: Type.STRING }, 
                relevanceScore: { type: Type.NUMBER, description: "0.0 to 1.0" }, 
                matchReason: { type: Type.STRING } 
            }, 
            required: ["alertId", "relevanceScore", "matchReason"] 
        }
      }
    }
  });
  return safeParseJson(response.text) || [];
};

// ... (Rest of existing functions like performRootCauseAnalysis, etc. remain unchanged) ...
export const generateThreatSignatures = async (alerts: SecurityAlert[]): Promise<ThreatSignature[]> => {
    const context = alerts.slice(0, 50).map(a => ({
        type: a.threatType,
        loc: a.location,
        desc: a.description,
        intent: a.intent?.summary,
        time: a.timestamp
    }));

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `
        ANALYZE ALERT HISTORY AND EXTRACT REUSABLE THREAT SIGNATURES.
        Review the provided incident logs and identify recurring, complex, or facility-specific behavioral patterns that should be formalized into "Threat Signatures".
        
        Focus on:
        1. Behavioral Nuances (e.g., "Loitering followed by quick movement").
        2. Spatial Anomalies (e.g., "Accessing server room via side door").
        3. Temporal Patterns (e.g., "Regular unauthorized entry at 03:00").
        
        DATA: ${JSON.stringify(context)}
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['BEHAVIORAL', 'SPATIAL', 'TEMPORAL', 'ANOMALY'] },
                        confidence: { type: Type.NUMBER },
                        maturity: { type: Type.NUMBER },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["name", "description", "type", "confidence", "maturity", "tags"]
                }
            }
        }
    });

    const parsed = safeParseJson(response.text) || [];
    return parsed.map((sig: any) => ({
        id: `SIG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        lastDetected: new Date().toISOString(),
        active: false,
        ...sig
    }));
};

export const processInvestigationQuery = async (
    query: string, 
    history: ChatMessage[], 
    alerts: SecurityAlert[], 
    exhibits: PinnedEvidence[], 
    facility: EnvironmentType
): Promise<OrchestratorResponse> => {
  const manifest = `System: Facility ${facility}. Alerts: ${alerts.length}. Exhibits: ${exhibits.length}.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${manifest}\nQuery: ${query}`,
    config: {
      systemInstruction: COUNCIL_SYSTEM_INSTRUCTION + "\nReturn 'COUNCIL_INVOCATION' for complex analysis.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['PLAN', 'CLARIFICATION', 'ANSWER', 'COUNCIL_INVOCATION'] },
          thought: { type: Type.STRING },
          text: { type: Type.STRING },
          suggestedActions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, query: { type: Type.STRING }, type: { type: Type.STRING } } } },
          plan: { type: Type.OBJECT, properties: { goal: { type: Type.STRING }, steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { tool: { type: Type.STRING }, description: { type: Type.STRING } } } } } }
        },
        required: ["type", "thought"]
      }
    }
  });
  return safeParseJson(response.text);
};

export const consultAgentCouncil = async (
    query: string, 
    alerts: SecurityAlert[], 
    exhibits: PinnedEvidence[], 
    facility: EnvironmentType
): Promise<CouncilSession> => {
  const manifest = `Facility: ${facility}. Recent Alerts (last 10): ${JSON.stringify(alerts.slice(0, 10).map(a => ({ id: a.id, type: a.threatType, loc: a.location })))}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `${manifest}\nCommand: ${query}`,
    config: {
      systemInstruction: COUNCIL_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 1024 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          responses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { persona: { type: Type.STRING }, output: { type: Type.STRING }, thoughtProcess: { type: Type.STRING }, confidence: { type: Type.NUMBER }, proposedAction: { type: Type.STRING } } } },
          consensus: { type: Type.STRING },
          suggestedActions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, query: { type: Type.STRING } } } }
        },
        required: ["responses", "consensus"]
      }
    }
  });
  return { id: `SESSION-${Date.now()}`, query, timestamp: new Date(), ...safeParseJson(response.text) };
};

export const performRootCauseAnalysis = async (targetAlert: SecurityAlert, allAlerts: SecurityAlert[]): Promise<{ originNode: string; timeline: string[]; reasoning: string }> => {
    const context = allAlerts
        .filter(a => new Date(a.timestamp).getTime() <= new Date(targetAlert.timestamp).getTime())
        .slice(0, 15)
        .map(a => ({ id: a.id, loc: a.location, type: a.threatType, time: a.timestamp, behavior: a.intent?.behavioralState }));

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `
        PERFORM OPERATIONAL ROOT CAUSE ANALYSIS (RCA).
        Target Incident: ${JSON.stringify({ id: targetAlert.id, loc: targetAlert.location, type: targetAlert.threatType })}
        
        RCA OBJECTIVE:
        - Trace behavioral origin (where did the chain of events start?).
        - Identify the "Root Cause Node" (the first camera feed identifying the anomaly).
        - Construct a 3-5 step causal timeline leading to the target incident.
        
        DATA_MANIFEST: ${JSON.stringify(context)}
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    originNode: { type: Type.STRING },
                    timeline: { type: Type.ARRAY, items: { type: Type.STRING } },
                    reasoning: { type: Type.STRING }
                },
                required: ["originNode", "timeline", "reasoning"]
            }
        }
    });
    return safeParseJson(response.text);
};

export const generateKnowledgeGraph = async (alerts: SecurityAlert[]): Promise<GraphAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Matrix generation. Use x/y 10-90. Data: ${JSON.stringify(alerts.slice(0, 12))}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, label: { type: Type.STRING }, type: { type: Type.STRING }, riskScore: { type: Type.NUMBER }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } },
          links: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: { type: Type.STRING }, target: { type: Type.STRING }, strength: { type: Type.NUMBER } } } },
          summary: { type: Type.STRING }
        },
        required: ["nodes", "links", "summary"]
      }
    }
  });
  return safeParseJson(response.text);
};

export const performBiometricMatch = async (base64Image: string): Promise<BiometricMatch> => {
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [{ inlineData: { mimeType: "image/jpeg", data: cleanBase64 } }, { text: "Identity check." }],
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.OBJECT, properties: { matchFound: { type: Type.BOOLEAN }, name: { type: Type.STRING }, confidence: { type: Type.NUMBER }, notes: { type: Type.STRING } }, required: ["matchFound"] }
    }
  });
  return safeParseJson(response.text);
};

export const parseNaturalLanguageRule = async (text: string): Promise<AlertRule> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Policy convert: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, conditions: { type: Type.OBJECT, properties: { target: { type: Type.STRING }, location: { type: Type.STRING }, behavior: { type: Type.STRING } } }, action: { type: Type.STRING } }, required: ["name", "conditions", "action"] }
    }
  });
  const parsed = safeParseJson(response.text);
  return { id: `RULE-${Date.now()}`, isActive: true, createdAt: new Date().toISOString(), ...parsed };
};

export const executeInvestigationStep = async (step: InvestigationStep, alerts: SecurityAlert[]): Promise<any> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tool: ${step.tool}. Desc: ${step.description}. Nodes: ${alerts.length}.`
  });
  return { summary: response.text };
};

export const synthesizeInvestigationReport = async (query: string, findings: any[]): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Report for: "${query}". Findings: ${JSON.stringify(findings)}`
  });
  return response.text || "Error";
};

export const reconstructIncident = async (alerts: SecurityAlert[]): Promise<IncidentReport> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Timeline reconstruct: ${JSON.stringify(alerts.slice(0, 8))}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, narrative: { type: Type.STRING }, gapAnalysis: { type: Type.STRING }, timeline: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, event: { type: Type.STRING } } } } }, required: ["title", "narrative", "timeline"] }
    }
  });
  const parsed = safeParseJson(response.text);
  return { id: `INC-${Date.now()}`, generatedAt: new Date().toISOString(), evidenceCount: alerts.length, status: 'FINALIZED', ...parsed };
};

export const performVisualReID = async (snapshot: string, alerts: SecurityAlert[]): Promise<ReIDSession> => {
  const cleanBase64 = snapshot.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
  
  // Extract summary of alerts for context
  const alertContext = alerts.slice(0, 30).map(a => ({
      id: a.id,
      loc: a.location,
      time: a.timestamp,
      sig: a.visualSignature ? { t: a.visualSignature.torso, l: a.visualSignature.legs } : 'N/A'
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [
        { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } }, 
        { text: `
        OBJECTIVE: Cross-Camera Re-Identification (ReID) via Visual DNA.

        TARGET: [Image Provided]
        1. Extract the Visual DNA of the target (Top, Bottom, Accessories, Gait).
        2. Scan the provided Alert History (representing other cameras) for this Visual DNA.
        3. Identify "Handoff Candidates": Cameras that recently detected a matching signature.
        
        ALERT_HISTORY_CONTEXT: ${JSON.stringify(alertContext)}
        ` }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extractedSignature: { 
              type: Type.OBJECT, 
              properties: { 
                  torso: { type: Type.STRING }, 
                  legs: { type: Type.STRING }, 
                  build: { type: Type.STRING },
                  accessories: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                  gaitDescription: { type: Type.STRING } 
              },
              required: ["torso", "legs", "build", "accessories", "gaitDescription"]
          },
          matches: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { alertId: { type: Type.STRING }, similarityScore: { type: Type.NUMBER }, reasoning: { type: Type.STRING } } } },
          nearbyAnomalies: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { alertId: { type: Type.STRING }, relevance: { type: Type.STRING }, correlationStrength: { type: Type.NUMBER } } } },
          companions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { entityId: { type: Type.STRING }, sharedLocations: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
        },
        required: ["matches", "extractedSignature"]
      }
    }
  });
  return { targetSnapshot: snapshot, timestamp: new Date(), ...safeParseJson(response.text) };
};

export const generatePatternInsights = async (alerts: SecurityAlert[]): Promise<PatternInsight[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Global patterns: ${JSON.stringify(alerts.slice(0, 30))}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING }, confidence: { type: Type.NUMBER } } } }
    }
  });
  return safeParseJson(response.text) || [];
};

export const generateOccupancyTrends = (): OccupancyTrendPoint[] => {
  const trends: OccupancyTrendPoint[] = [];
  const now = new Date();
  for (let i = 12; i >= 0; i--) {
    trends.push({ time: new Date(now.getTime() - i * 3600000).getHours() + ":00", count: Math.floor(Math.random() * 20) + 5, zone: 'Facility' });
  }
  return trends;
};

export const generateResponseProtocol = async (cluster: AlertCluster): Promise<ResponseProtocol> => {
  const primaryAlert = cluster.alerts[0];
  const cleanBase64 = primaryAlert.snapshot ? primaryAlert.snapshot.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "") : "";

  // Mock Facility Context (In a real app, this would come from a database based on alert.location)
  const facilityContext = `
  FACILITY_METADATA:
  - Type: High-Security Corporate HQ
  - HVAC Intakes: Zone A (Lobby), Zone D (Loading Dock)
  - Hazardous Materials: Zone D (Cleaning Supply Storage)
  - Server Farm: Zone C (Requires Biometric Override)
  - Executive Suites: Zone B (Top Floor)
  - Exits: Main (Zone A), Fire Escape (Zone C), Freight (Zone D)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [
        { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
        { text: `
        GENERATE DYNAMIC INCIDENT RESPONSE PLAN (SOP).
        
        CONTEXT:
        Alert Type: ${primaryAlert.threatType}
        Location: ${primaryAlert.location}
        Description: ${primaryAlert.description}
        Severity: ${primaryAlert.severity}
        ${facilityContext}

        INSTRUCTIONS:
        1. Analyze the visual threat in the image relative to the facility metadata.
        2. Generate a SPECIFIC, ORDERED list of response steps.
        3. Do NOT use generic templates. Tailor actions to the specific risks (e.g., if smoke near HVAC, shut down HVAC).
        4. Include a 'rationale' for each step explaining WHY it is necessary based on the visual evidence.
        ` }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          playbookName: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                action: { type: Type.STRING },
                target: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['AUTOMATED', 'MANUAL_REQUIRED'] },
                rationale: { type: Type.STRING }
              },
              required: ["action", "target", "type", "rationale"]
            }
          }
        },
        required: ["playbookName", "steps"]
      }
    }
  });

  const parsed = safeParseJson(response.text);
  
  // Post-process to ensure IDs and statuses
  const steps = parsed?.steps?.map((s: any, i: number) => ({
      ...s,
      id: `STEP-${Date.now()}-${i}`,
      status: 'PENDING',
      eta: '0s'
  })) || [];

  return { 
      id: `PROTO-${Date.now()}`, 
      incidentId: cluster.id, 
      playbookName: parsed?.playbookName || 'Dynamic Protocol', 
      startedAt: new Date().toISOString(), 
      status: 'ACTIVE', 
      steps: steps 
  };
};

export const generatePatrolDirectives = async (guards: Guard[], cameras: CameraFeed[]): Promise<PatrolDirective[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Optimize patrols for ${guards.length} units.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { guardId: { type: Type.STRING }, targetZone: { type: Type.STRING }, reason: { type: Type.STRING } } } }
    }
  });
  const directives = safeParseJson(response.text) || [];
  return directives.map((d: any) => ({ ...d, id: `DIR-${Math.random()}`, generatedAt: new Date().toISOString() }));
};

export const generateGlobalInsights = async (intelInput: string): Promise<GlobalThreat[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Global intel: ${intelInput}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, description: { type: Type.STRING }, affectedSites: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
    }
  });
  return (safeParseJson(response.text) || []).map((t: any) => ({ ...t, timestamp: new Date().toISOString(), severity: Severity.MEDIUM, confidence: 70 }));
};

export const assessPrincipalSafety = async (p: Principal, context: string): Promise<ExecutiveReport> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `EP assessment: ${p.name}. Context: ${context}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.OBJECT, properties: { threatScore: { type: Type.NUMBER }, narrative: { type: Type.STRING }, recommendedAction: { type: Type.STRING } }, required: ["threatScore", "narrative"] }
    }
  });
  return { principalId: p.id, nearbyThreats: [], ...safeParseJson(response.text) };
};

export const generateInsiderRiskReport = async (logInput: string): Promise<EmployeeProfile[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Insider check: ${logInput}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, riskScore: { type: Type.NUMBER }, anomalyAnalysis: { type: Type.STRING } } } }
    }
  });
  return (safeParseJson(response.text) || []).map((p: any) => ({ ...p, lastAssessment: new Date().toISOString(), role: 'User', department: 'Generic', riskFactors: [] }));
};

export const correlateAccessEvent = async (type: AccessAlarmType, base64: string): Promise<{ verdict: AccessVerdict, confidence: number, reasoning: string }> => {
  const cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ inlineData: { mimeType: "image/jpeg", data: cleanBase64 } }, { text: `Access event: ${type}` }],
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.OBJECT, properties: { verdict: { type: Type.STRING }, confidence: { type: Type.NUMBER }, reasoning: { type: Type.STRING } }, required: ["verdict"] }
    }
  });
  return safeParseJson(response.text);
};

export const analyzeAcousticSignature = async (db: number, alerts: SecurityAlert[]): Promise<AcousticEvent[]> => {
  // Safe slice of context
  const recentContext = alerts.slice(0, 5).map(a => `[${a.timestamp}] ${a.threatType} at ${a.location} (${a.description})`).join('; ') || "No recent visual anomalies detected";

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `
      PERFORM FORENSIC ACOUSTIC ANALYSIS.
      
      TELEMETRY INPUT:
      - Detected Audio Spike: ${db}dB
      - Environmental Context: ${recentContext}
      
      OBJECTIVE:
      Analyze the acoustic signature and visual context to classify the event.
      Identify if this sound correlates with any visual threats (e.g. Gunshot sound with "Weapon Detected" visual).
      
      CLASSIFICATION PARAMETERS:
      - BALLISTIC: Gunshots, explosions.
      - SPEECH: Screaming, aggressive shouting, distress calls.
      - MECHANICAL: Machinery failure, glass breaking, structural collapse.
      - ALARM: Fire alarm, siren, security buzzer.
      - IMPACT: Body falling, vehicle crash, heavy object drop.
      
      OUTPUT REQUIREMENTS:
      - Return an array of potential event candidates (usually 1, max 2 if ambiguous).
      - 'location': Infers source based on visual context or defaults to 'Triangulating...'.
      - 'isThreat': Boolean risk assessment.
      - 'rawAnalysis': Technical description of the sound profile and context correlation.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['BALLISTIC', 'SPEECH', 'MECHANICAL', 'ALARM', 'IMPACT'] },
            subType: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            location: { type: Type.STRING },
            isThreat: { type: Type.BOOLEAN },
            rawAnalysis: { type: Type.STRING }
          },
          required: ["type", "subType", "confidence", "location", "isThreat", "rawAnalysis"]
        }
      }
    }
  });

  const parsed = safeParseJson(response.text) || [];
  return parsed.map((r: any) => ({
    id: `AC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    decibels: db,
    ...r
  }));
};

export const generateDispatchTransmissions = async (alert: SecurityAlert, profile: ResponseProfile): Promise<DispatchTransmission[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Dispatch for: ${alert.threatType}. Profile: ${profile}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sender: { type: Type.STRING }, message: { type: Type.STRING } } } }
    }
  });
  return (safeParseJson(response.text) || []).map((l: any, i: number) => ({ ...l, id: `TX-${Date.now()}-${i}`, timestamp: new Date().toISOString() }));
};
