import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Bookmark, 
  Printer, 
  Copy, 
  Check, 
  Stethoscope, 
  Tag, 
  Clock, 
  ClipboardCheck,
  CheckCircle2,
  FileCode
} from "lucide-react";
import { ClinicalDocResult } from "../types";
import { SAMPLE_CLINICAL_PROMPTS } from "../data/sampleData";

interface ClinicalDocViewProps {
  onSaveToVault: (item: { type: string; title: string; data: any }) => void;
}

export const ClinicalDocView: React.FC<ClinicalDocViewProps> = ({ onSaveToVault }) => {
  const [docType, setDocType] = useState("SOAP Note");
  const [specialty, setSpecialty] = useState("Internal Medicine / Primary Care");
  const [patientAge, setPatientAge] = useState("58");
  const [gender, setGender] = useState("Male");
  const [chiefComplaint, setChiefComplaint] = useState("Routine 3-month diabetes follow-up and blood pressure check");
  const [vitals, setVitals] = useState("BP 138/84, HR 72, BMI 29.8, A1c 7.1%");
  const [rawNotes, setRawNotes] = useState(
    "Patient presents for scheduled 3-month DM2 follow-up. Complies with Metformin 1000mg BID. Reports walking 30 mins 4x/week, reduced sugary drinks. Denies hypoglycemia, chest pain, SOB, or paresthesias in feet. Monofilament exam normal bilaterally. Pedal pulses 2+. Labs: A1c 7.1%, eGFR >90, Microalbumin 18. Plan: Continue Metformin 1000mg BID, lifestyle mods, repeat A1c in 3-6 months."
  );

  const [isLoading, setIsLoading] = useState(false);
  const [docResult, setDocResult] = useState<ClinicalDocResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rawNotes.trim() || isLoading) return;

    setIsLoading(true);
    setIsSaved(false);

    try {
      const response = await fetch("/api/clinical-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          specialty,
          patientAge,
          gender,
          chiefComplaint,
          vitals,
          rawNotes,
        }),
      });

      if (!response.ok) throw new Error("Failed to format clinical documentation");
      const data = await response.json();
      setDocResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate clinical documentation. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_CLINICAL_PROMPTS[0]) => {
    setDocType(sample.docType);
    setSpecialty(sample.specialty);
    setPatientAge(sample.patientAge);
    setGender(sample.gender);
    setChiefComplaint(sample.chiefComplaint);
    setVitals(sample.vitals);
    setRawNotes(sample.rawNotes);
  };

  const handleSave = () => {
    if (!docResult) return;
    onSaveToVault({
      type: "soap_note",
      title: `${docResult.documentType}: ${chiefComplaint.slice(0, 35)}...`,
      data: {
        docResult,
        metadata: { specialty, patientAge, gender, vitals },
        date: new Date().toLocaleDateString(),
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopy = () => {
    if (!docResult) return;
    navigator.clipboard.writeText(docResult.formattedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12" id="clinical-doc-view">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            <span>Healthcare Professional Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Clinical Documentation & SOAP Note Studio
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Convert clinical shorthand, patient encounter transcripts, and raw notes into compliant SOAP notes, SBAR shift handoffs, and hospital discharge summaries.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 w-full md:w-auto font-medium">Load Template:</span>
          {SAMPLE_CLINICAL_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(sample)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              {sample.title.split(" ")[0]} ({sample.docType})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Intake */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-teal-400" />
            <span>Encounter Parameters</span>
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Format *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-teal-500 outline-none"
                  id="select-doc-type"
                >
                  <option value="SOAP Note">SOAP Note (Standard Outpatient/Inpatient)</option>
                  <option value="SBAR Handoff">SBAR Shift Handoff (Nursing/Physician)</option>
                  <option value="Discharge Summary">Hospital / Ambulatory Discharge Summary</option>
                  <option value="Clinical Research Synthesis">Clinical Guideline & Research Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Clinical Specialty
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-teal-500 outline-none"
                  id="select-specialty"
                >
                  <option value="Internal Medicine / Primary Care">Primary Care / Internal Medicine</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Hospitalist / Inpatient">Hospitalist / Inpatient</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedic Surgery">Orthopedics / Surgery</option>
                  <option value="Psychiatry & Behavioral Health">Psychiatry</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Patient Age
                </label>
                <input
                  type="text"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="E.g., 58"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-teal-500 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Non-binary</option>
                  <option value="Unspecified">Unspecified</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chief Complaint
              </label>
              <input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="E.g., 3-month diabetes follow-up, acute knee pain..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Vitals / Point-of-Care Data
              </label>
              <input
                type="text"
                value={vitals}
                onChange={(e) => setVitals(e.target.value)}
                placeholder="E.g., BP 138/84, HR 72, BMI 29.8, A1c 7.1%"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Raw Clinical Notes / Transcript / Shorthand *
              </label>
              <textarea
                required
                rows={6}
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder="Paste physician dictation, shorthand notes, physical exam findings, or discussion summary..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none font-mono"
                id="input-raw-clinical-notes"
              />
            </div>

            <button
              type="submit"
              disabled={!rawNotes.trim() || isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                rawNotes.trim() && !isLoading
                  ? "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-teal-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
              id="btn-generate-doc"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Formatting Clinical Documentation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Formatted {docType}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Formatted Clinical Note */}
        <div className="lg:col-span-7 space-y-4">
          {!docResult && !isLoading && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-teal-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">No Clinical Note Generated Yet</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Select your desired document type (SOAP, SBAR, Discharge Summary), paste encounter notes on the left, and click Generate.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-300 space-y-4 shadow-lg animate-pulse">
              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-white">Synthesizing Clinical Record</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Klaytor is structuring Subjective, Objective, Assessment, Plan sections, cross-referencing ICD-10 suggestions, and formatting clinical highlights...
              </p>
            </div>
          )}

          {docResult && !isLoading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-300" id="clinical-doc-result-card">
              {/* Header & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-teal-400 font-semibold uppercase">
                    {docResult.documentType}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    {docResult.title || "Clinical Documentation Summary"}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied Note" : "Copy Markdown"}</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-teal-400" />
                    <span>{isSaved ? "Saved!" : "Save"}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Highlights & Suggested Billing Codes */}
              {docResult.clinicalHighlights && docResult.clinicalHighlights.length > 0 && (
                <div className="bg-teal-950/40 border border-teal-800/60 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Key Clinical Highlights & Action Items</span>
                  </h3>
                  <ul className="space-y-1 text-xs text-teal-100/90">
                    {docResult.clinicalHighlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-400 font-bold">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Formatted Content */}
              <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-teal-300 prose-strong:text-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {docResult.formattedContent}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Billing Codes & Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {docResult.billingCodesSuggested && docResult.billingCodesSuggested.length > 0 && (
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Suggested Diagnostic Codes (ICD-10/CPT)</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {docResult.billingCodesSuggested.map((code, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-900 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded font-mono"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {docResult.followUpTimeline && (
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>Recommended Follow-up Timeline</span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      {docResult.followUpTimeline}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800">
                Note for Clinicians: AI-generated documentation requires independent clinical verification, modification, and signature by a licensed healthcare provider prior to inclusion in the official medical record (EHR).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
