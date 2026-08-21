import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google Gen AI
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.7-flash",
  "gemini-3.1-flash-lite",
];

// Helper to safely clean and parse JSON responses from Gemini
function cleanAndParseJSON(rawText: string): any {
  if (!rawText) return {};
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch (e) {
        console.warn("Failed extracting JSON substring:", e);
      }
    }
    return { rawResponse: cleaned };
  }
}

// Resilient wrapper that retries on 503 / 429 and cascades across approved models
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        if (response && response.text !== undefined && response.text !== null) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err || "");
        console.warn(`[Gemini API] Model ${model} (attempt ${attempt + 1}) notice: ${msg.slice(0, 120)}`);

        const isTransient =
          msg.includes("503") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("high demand") ||
          msg.includes("429") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.includes("overloaded");

        if (isTransient) {
          await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
          if (attempt === 0) {
            continue;
          }
        }
        break;
      }
    }
  }

  throw lastError || new Error("Medical AI services are temporarily busy. Please try again shortly.");
}

const SYSTEM_PROMPT_CORE = `
You are Klaytor, an AI-powered medical assistant designed to support healthcare professionals and patients with reliable, understandable, and evidence-based medical information.

Core Principles:
- Provide clear, accurate, and evidence-based medical information.
- Explain medical terms in accessible, simple language when communicating with patients, while maintaining clinical precision when assisting healthcare professionals.
- Help organize and summarize patient information, draft SOAP notes, and create patient education materials.
- Recognize situations that may require urgent or emergency medical attention and highlight red flags immediately.
- Protect patient privacy and advise users not to share sensitive personal identifiers (like SSNs, full names, addresses).
- Clearly communicate uncertainty when information is insufficient.
- ALWAYS maintain safety: You must NOT provide a definitive diagnosis or replace a licensed physician. Always include a brief, reassuring reminder to consult a qualified healthcare provider.
`;

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Klaytor AI Medical Assistant", timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userRole = "patient", contextData } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages array provided." });
    }

    const ai = getAiClient();
    const roleInstruction = userRole === "clinician"
      ? "The user is a healthcare professional / clinician. Use clinical terminology (ICD-10 concepts, pathophysiology, pharmacological mechanisms, clinical trials, differential diagnoses, SOAP formatting) where appropriate. Be concise, structured, and evidence-based."
      : "The user is a patient or family caregiver. Use warm, empathetic, clear, non-jargon language (aim for 6th-8th grade readability). Explain complex mechanisms using everyday analogies. Emphasize questions they can ask their doctor and safety red flags.";

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const systemInstruction = `${SYSTEM_PROMPT_CORE}\n\nMode: ${roleInstruction}\n${contextData ? `Additional Context: ${JSON.stringify(contextData)}` : ""}`;

    const response = await generateContentWithFallback(ai, {
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      reply: response.text || "I apologize, but I could not generate a response. Please try rephrasing your inquiry.",
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "Failed to process chat with Klaytor." });
  }
});

// Symptom exploration and triage endpoint
app.post("/api/analyze-symptom", async (req, res) => {
  try {
    const { symptoms, duration, severity, ageGroup, medicalHistory, accompanyingSymptoms } = req.body;
    if (!symptoms) {
      return res.status(400).json({ error: "Symptoms description is required." });
    }

    const ai = getAiClient();
    const prompt = `
Analyze the following symptom report carefully from an evidence-based clinical perspective:
- Primary Symptoms: ${symptoms}
- Duration: ${duration || "Not specified"}
- Severity (1-10): ${severity || "Not specified"}
- Age Group: ${ageGroup || "Adult"}
- Past Medical History: ${medicalHistory || "None provided"}
- Accompanying Symptoms: ${accompanyingSymptoms || "None"}

Please provide a structured, safe medical triage assessment in valid JSON with these exact fields:
{
  "urgencyLevel": "EMERGENCY" | "URGENT_CARE" | "PRIMARY_CARE" | "SELF_CARE",
  "urgencyReason": "Brief explanation of why this urgency level was assigned",
  "redFlags": ["List of warning signs that warrant immediate 911 / emergency care"],
  "potentialConsiderations": [
    {
      "condition": "Name of general condition or mechanism (educational, not definitive diagnosis)",
      "explanation": "Why this matches the presented symptoms in simple terms",
      "typicalManagement": "General standard of care approach"
    }
  ],
  "clarifyingQuestions": ["Questions a doctor would ask to narrow this down"],
  "comfortMeasures": ["Evidence-supported supportive care steps if safe"],
  "questionsForDoctor": ["3-5 targeted questions the patient should bring to their appointment"],
  "summary": "Compassionate plain-language summary for the patient"
}
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT_CORE,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = cleanAndParseJSON(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/analyze-symptom:", error);
    res.status(500).json({ error: error.message || "Failed to analyze symptoms." });
  }
});

// Terminology and Lab Simplifier endpoint
app.post("/api/simplify-terms", async (req, res) => {
  try {
    const { text, targetAudience = "patient" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Medical text or lab result snippet is required." });
    }

    const ai = getAiClient();
    const prompt = `
Translate and explain the following medical text, pathology snippet, radiology impression, or lab report into crystal-clear plain language:

"${text}"

Provide the response in structured JSON with the following structure:
{
  "plainEnglishSummary": "A clear, reassuring 2-3 paragraph explanation of what this text means in everyday terms without medical jargon.",
  "keyFindings": [
    {
      "termOrMetric": "Medical term or lab name (e.g., 'Elevated ALT/AST', 'Ground-glass opacity')",
      "plainMeaning": "What it actually means",
      "normalContext": "General context or what is typically expected",
      "status": "normal" | "abnormal" | "informational" | "attention_needed"
    }
  ],
  "whatThisMeansForYou": "Direct implications for the patient's daily life or overall health picture.",
  "questionsToAskPhysician": ["3-4 clear questions to ask the prescribing or ordering doctor"],
  "importantNote": "Safety reminder that test results must be interpreted alongside physical exams and clinical history."
}
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT_CORE,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = cleanAndParseJSON(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/simplify-terms:", error);
    res.status(500).json({ error: error.message || "Failed to simplify medical terminology." });
  }
});

// Medication Guide endpoint
app.post("/api/medication-guide", async (req, res) => {
  try {
    const { medicationName, currentMedications, userCondition } = req.body;
    if (!medicationName) {
      return res.status(400).json({ error: "Medication name is required." });
    }

    const ai = getAiClient();
    const prompt = `
Provide a comprehensive, evidence-based medication guide for:
- Medication: ${medicationName}
- Other concurrent medications: ${currentMedications || "None listed"}
- Patient condition: ${userCondition || "General inquiry"}

Provide the response in structured JSON:
{
  "genericName": "Generic name",
  "brandNames": ["Common brand names"],
  "drugClass": "Pharmacological class",
  "primaryUses": ["Primary FDA/approved indications and common uses"],
  "howItWorks": "Simple explanation of how the medication acts in the body",
  "commonSideEffects": ["Common, usually mild side effects"],
  "seriousSideEffects": ["Serious adverse reactions requiring immediate doctor contact"],
  "keyInteractions": ["Known interactions with other drugs, alcohol, grapefruit, or supplements"],
  "missedDoseAdvice": "General standard safety rule for missed doses",
  "administrationTips": ["With food/empty stomach, time of day, hydration notes"],
  "specialPrecautions": ["Pregnancy, kidney/liver considerations, elderly notes, warnings"],
  "doctorQuestions": ["Questions the patient should verify with their pharmacist or doctor"]
}
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT_CORE,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = cleanAndParseJSON(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/medication-guide:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve medication guide." });
  }
});

// Clinical Documentation & SOAP Note endpoint (For Healthcare Workers)
app.post("/api/clinical-doc", async (req, res) => {
  try {
    const { docType, rawNotes, patientAge, gender, chiefComplaint, vitals, specialty } = req.body;
    if (!rawNotes) {
      return res.status(400).json({ error: "Raw clinical notes or transcript is required." });
    }

    const ai = getAiClient();
    const prompt = `
You are Klaytor, assisting a healthcare professional with clinical documentation.
Document Type Requested: ${docType || "SOAP Note"} (Options: SOAP Note, SBAR Handoff, Discharge Summary, Patient Education Handout, Clinical Research Synthesis)
Specialty: ${specialty || "General Practice / Internal Medicine"}
Patient Info: Age ${patientAge || "Adult"}, Gender: ${gender || "Unspecified"}, Chief Complaint: ${chiefComplaint || "See notes"}
Vitals/Metrics: ${vitals || "Standard"}

Raw Notes / Transcript:
"""
${rawNotes}
"""

Instructions:
- If docType is "SOAP Note": Format clearly with Subjective (HPI, ROS, Past History, Meds, Allergies), Objective (Vitals, Physical Exam findings, Lab/imaging review), Assessment (Differential diagnoses, Clinical rationale), and Plan (Diagnostics, Medications, Referrals, Patient counseling, Follow-up).
- If docType is "SBAR Handoff": Format with Situation, Background, Assessment, and Recommendation for nursing/physician shift transition.
- If docType is "Discharge Summary": Format with Admission Reason, Hospital Course, Discharge Diagnoses, Discharge Medications, Activity/Diet restrictions, and Follow-up appointments.
- If docType is "Patient Education Handout": Create a compassionate, clear, formatted guide at 6th-grade reading level explaining their condition, what to do, what to avoid, and red flag warnings.

Return structured JSON:
{
  "title": "Document Title",
  "documentType": "${docType || "SOAP Note"}",
  "formattedContent": "Full formatted markdown text with clean sections, bold headers, and bullet points",
  "clinicalHighlights": ["3-5 key clinical bullet points summarizing critical action items"],
  "billingCodesSuggested": ["ICD-10 / CPT code suggestions (informational only)"],
  "followUpTimeline": "Recommended follow-up timeframe"
}
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "You are an expert clinical documentation AI assistant helping licensed clinicians draft organized, high-standard medical records, handoffs, and patient communications.",
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = cleanAndParseJSON(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/clinical-doc:", error);
    res.status(500).json({ error: error.message || "Failed to generate clinical documentation." });
  }
});

// Doctor Visit Prep Checklist endpoint
app.post("/api/prep-visit", async (req, res) => {
  try {
    const { primaryConcern, symptomsList, duration, currentMeds, pastConditions, questionsYouHave } = req.body;

    const ai = getAiClient();
    const prompt = `
Create a structured, empowering Doctor Visit Preparation Brief for a patient:
- Primary Concern / Goal of Visit: ${primaryConcern || "Routine / General concern"}
- Symptoms List & Severity: ${symptomsList || "None specified"}
- Duration / Timeline: ${duration || "Recent"}
- Current Medications & Supplements: ${currentMeds || "None listed"}
- Past Medical Conditions: ${pastConditions || "None"}
- Questions the patient already has in mind: ${questionsYouHave || "None"}

Return structured JSON:
{
  "appointmentTitle": "Title for this appointment brief",
  "oneSentenceOpening": "Clear, concise script the patient can say when the doctor walks in (e.g. 'I came in today because...')",
  "symptomTimeline": "Organized chronological timeline of symptoms and triggers",
  "highPriorityQuestions": ["Top 3-4 must-ask questions regarding diagnosis, tests, or treatment options"],
  "secondaryQuestions": ["2-3 questions about lifestyle, prevention, or prognosis"],
  "itemsToBring": ["List of physical items to bring, e.g. medication bottles, previous lab copies, blood pressure log"],
  "duringAppointmentTips": ["Tips on taking notes, asking for clarification, repeating back instructions"],
  "redFlagReminders": "When not to wait for this appointment and go to ER instead"
}
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT_CORE,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = cleanAndParseJSON(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/prep-visit:", error);
    res.status(500).json({ error: error.message || "Failed to generate appointment preparation guide." });
  }
});

// Setup Vite middleware in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Klaytor Medical Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
