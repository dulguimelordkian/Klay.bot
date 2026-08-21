export type UserRole = "patient" | "clinician";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isEmergencyAlert?: boolean;
  metadata?: {
    suggestedFollowUps?: string[];
    category?: "symptom" | "terminology" | "medication" | "clinical_doc" | "visit_prep" | "general";
  };
}

export interface SymptomAssessmentResult {
  urgencyLevel: "EMERGENCY" | "URGENT_CARE" | "PRIMARY_CARE" | "SELF_CARE";
  urgencyReason: string;
  redFlags: string[];
  potentialConsiderations: {
    condition: string;
    explanation: string;
    typicalManagement: string;
  }[];
  clarifyingQuestions: string[];
  comfortMeasures: string[];
  questionsForDoctor: string[];
  summary: string;
}

export interface KeyFinding {
  termOrMetric: string;
  plainMeaning: string;
  normalContext: string;
  status: "normal" | "abnormal" | "informational" | "attention_needed";
}

export interface TermDecoderResult {
  plainEnglishSummary: string;
  keyFindings: KeyFinding[];
  whatThisMeansForYou: string;
  questionsToAskPhysician: string[];
  importantNote: string;
}

export interface MedicationGuideResult {
  genericName: string;
  brandNames: string[];
  drugClass: string;
  primaryUses: string[];
  howItWorks: string;
  commonSideEffects: string[];
  seriousSideEffects: string[];
  keyInteractions: string[];
  missedDoseAdvice: string;
  administrationTips: string[];
  specialPrecautions: string[];
  doctorQuestions: string[];
}

export interface ClinicalDocResult {
  title: string;
  documentType: string;
  formattedContent: string;
  clinicalHighlights: string[];
  billingCodesSuggested?: string[];
  followUpTimeline?: string;
}

export interface DoctorVisitPrepResult {
  appointmentTitle: string;
  oneSentenceOpening: string;
  symptomTimeline: string;
  highPriorityQuestions: string[];
  secondaryQuestions: string[];
  itemsToBring: string[];
  duringAppointmentTips: string[];
  redFlagReminders: string;
}

export interface SavedItem {
  id: string;
  type: "triage" | "decoded_terms" | "medication" | "soap_note" | "patient_handout" | "visit_prep" | "chat_export";
  title: string;
  date: string;
  data: any;
}
