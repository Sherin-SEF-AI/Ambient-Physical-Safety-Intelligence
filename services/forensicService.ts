
import { SecurityAlert, AuditLogEntry } from "../types";

export const generateDigitalWatermark = (alert: SecurityAlert, user: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = alert.snapshot || '';
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject("Canvas context failed");
                return;
            }

            // High res canvas
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw Original
            ctx.drawImage(img, 0, 0);

            // Watermark Overlay Style
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
            
            // Text Data
            ctx.font = 'bold 16px "Courier New", monospace';
            ctx.fillStyle = '#00F0FF'; // Aegis Accent
            ctx.fillText(`AEGIS_SENTINEL_SECURE_HASH: ${alert.compliance?.chainOfCustodyHash || 'PENDING'}`, 20, canvas.height - 35);
            
            ctx.font = '14px "Courier New", monospace';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`TIMESTAMP: ${new Date(alert.timestamp).toISOString()} | CAM: ${alert.location} | USER: ${user}`, 20, canvas.height - 15);

            // Invisible Hash Pattern (Simulated)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            for(let i=0; i<50; i++) {
                ctx.fillText(alert.id, Math.random() * canvas.width, Math.random() * canvas.height);
            }

            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = (e) => reject(e);
    });
};

export const generateCaseFilePackage = (alert: SecurityAlert, auditTrail: AuditLogEntry[]) => {
    const manifest = {
        packageId: `PKG-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        classification: "CONFIDENTIAL // SECURITY INVESTIGATION",
        evidence: {
            id: alert.id,
            type: alert.threatType,
            location: alert.location,
            timestamp: alert.timestamp,
            aiAnalysis: {
                reasoning: alert.reasoning,
                confidence: alert.confidence,
                metadata: alert.intent
            }
        },
        chainOfCustody: auditTrail,
        checksum: "SHA256-SIMULATED-HASH-8847-2291-ABX"
    };

    return JSON.stringify(manifest, null, 2);
};
