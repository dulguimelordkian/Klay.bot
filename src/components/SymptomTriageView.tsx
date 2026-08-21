import React, { useState } from "react";
import { 
  HeartPulse, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  HelpCircle, 
  Bookmark, 
  Printer, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert,
  Sliders,
  FileCheck2,
  ChevronRight
} from "lucide-react";
import { SymptomAssessmentResult } from "../types";
import { SAMPLE_SYMPTOM_CASES } from "../data/sampleData";

interface SymptomTriageViewProps {
  onSaveToVault: (item: { type: string; title: string; data: any }) => void;
  onOpenEmergency: () => void;
}

export const SymptomTriageView: React.FC<SymptomTriageViewProps> = ({ onSaveToVault, onOpenEmergency }) => {
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("3 days");
  const [severity, setSeverity] = useState<number>(5);
  const [ageGroup, setAgeGroup] = useState("Adult (18-64)");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [accompanyingSymptoms, setAccompanyingSymptoms] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<SymptomAssessmentResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!symptoms.trim() || isLoading) return;

    setIsLoading(true);
    setIsSaved(false);

    try {
      const response = await fetch("/api/analyze-symptom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms,
          duration,
          severity,
          ageGroup,
          medicalHistory,
          accompanyingSymptoms,
        }),
      });

      if (!response.ok) throw new Error("Failed to analyze symptoms");
      const data = await response.json();
      setAssessment(data);
    } catch (err) {
      console.error(err);
      alert("Could not complete the symptom analysis. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_SYMPTOM_CASES[0]) => {
    setSymptoms(sample.symptoms);
    setDuration(sample.duration);
    setSeverity(sample.severity);
    setAgeGroup(sample.ageGroup);
    setMedicalHistory(sample.medicalHistory);
    setAccompanyingSymptoms(sample.accompanyingSymptoms);
  };

  const handleSave = () => {
    if (!assessment) return;
    onSaveToVault({
      type: "triage",
      title: `Triage: ${symptoms.slice(0, 35)}...`,
      data: {
        inputs: { symptoms, duration, severity, ageGroup, medicalHistory, accompanyingSymptoms },
        assessment,
        date: new Date().toLocaleDateString(),
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case "EMERGENCY":
        return {
          label: "Emergency Care Recommended (Immediate 911 / ER)",
          color: "bg-rose-950/90 text-rose-200 border-rose-600 shadow-rose-900/30",
          icon: <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />,
        };
      case "URGENT_CARE":
        return {
          label: "Urgent Care (Same Day Clinical Evaluation)",
          color: "bg-amber-950/90 text-amber-200 border-amber-600 shadow-amber-900/30",
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        };
      case "PRIMARY_CARE":
        return {
          label: "Primary Care / Routine Doctor Appointment",
          color: "bg-cyan-950/90 text-cyan-200 border-cyan-600 shadow-cyan-900/30",
          icon: <Clock className="w-5 h-5 text-cyan-400" />,
        };
      default:
        return {
          label: "Self-Care & Home Monitoring",
          color: "bg-emerald-950/90 text-emerald-200 border-emerald-600 shadow-emerald-900/30",
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12" id="symptom-triage-view">
      {/* Title & Introduction Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <HeartPulse className="w-4 h-4" />
            <span>Clinical Triage & Health Exploration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Symptom Assessment & Red-Flag Screener
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Describe symptoms and timing to explore evidence-based health considerations, red-flag emergency screening, and targeted questions for your physician.
          </p>
        </div>

        {/* Preset sample buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 w-full md:w-auto font-medium">Try Sample Case:</span>
          {SAMPLE_SYMPTOM_CASES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(sample)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              {sample.title.split("&")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Symptom Intake Questionnaire</span>
          </h2>

          <form onSubmit={handleAnalyze} className="space-y-4">
            {/* Primary Symptoms */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Symptoms & Main Concern *
              </label>
              <textarea
                required
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="E.g., Sharp pain on the right side of my abdomen, nausea when eating, feeling slightly feverish..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
                id="input-primary-symptoms"
              />
            </div>

            {/* Duration and Pain Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Duration / Onset
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="E.g., 2 days, sudden onset 4 hours ago"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:border-cyan-500 outline-none"
                  id="input-symptom-duration"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Discomfort Scale</span>
                  <span className="text-cyan-400 font-bold font-mono">{severity}/10</span>
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                    id="input-symptom-severity"
                  />
                </div>
              </div>
            </div>

            {/* Age Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:border-cyan-500 outline-none"
                id="select-age-group"
              >
                <option value="Infant (< 1 year)">Infant (&lt; 1 year)</option>
                <option value="Child (1-12 years)">Child (1-12 years)</option>
                <option value="Teenager (13-17 years)">Teenager (13-17 years)</option>
                <option value="Adult (18-64)">Adult (18-64)</option>
                <option value="Senior (65+ years)">Senior (65+ years)</option>
                <option value="Pregnant Individual">Pregnant Individual</option>
              </select>
            </div>

            {/* Accompanying Symptoms */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Accompanying Signs & Triggers
              </label>
              <input
                type="text"
                value={accompanyingSymptoms}
                onChange={(e) => setAccompanyingSymptoms(e.target.value)}
                placeholder="E.g., Dizziness, chills, worsening with movement"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:border-cyan-500 outline-none"
                id="input-accompanying-symptoms"
              />
            </div>

            {/* Medical History */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Relevant Past Medical History / Medications
              </label>
              <input
                type="text"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="E.g., Asthma, high blood pressure, taking Lisinopril..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:border-cyan-500 outline-none"
                id="input-medical-history"
              />
            </div>

            <button
              type="submit"
              disabled={!symptoms.trim() || isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                symptoms.trim() && !isLoading
                  ? "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-cyan-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
              id="btn-analyze-symptoms"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Clinical Triage...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Symptoms & Check Red Flags</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Assessment Result */}
        <div className="lg:col-span-7 space-y-4">
          {!assessment && !isLoading && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">No Active Triage Evaluation</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Fill in your symptoms and click "Analyze Symptoms" or select one of the sample cases above to generate an evidence-based triage report.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-300 space-y-4 shadow-lg animate-pulse">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-white">Synthesizing Clinical Evidence</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Klaytor is reviewing symptom patterns, evaluating red-flag indicators, and drafting doctor-ready questions...
              </p>
            </div>
          )}

          {assessment && !isLoading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-300" id="assessment-result-card">
              {/* Action Toolbar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400">
                  Triage Report Generated
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    id="btn-save-triage"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isSaved ? "Saved!" : "Save to Vault"}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    id="btn-print-triage"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>Print Report</span>
                  </button>
                </div>
              </div>

              {/* Urgency Badge Banner */}
              {(() => {
                const badge = getUrgencyBadge(assessment.urgencyLevel);
                return (
                  <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-md ${badge.color}`}>
                    <div className="shrink-0 mt-0.5">{badge.icon}</div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider">
                        {badge.label}
                      </div>
                      <p className="text-xs sm:text-sm font-medium leading-relaxed">
                        {assessment.urgencyReason}
                      </p>
                      {assessment.urgencyLevel === "EMERGENCY" && (
                        <button
                          onClick={onOpenEmergency}
                          className="mt-2 text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>View Emergency Numbers & 911 Guidelines</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Red Flags Alert Box */}
              {assessment.redFlags && assessment.redFlags.length > 0 && (
                <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Red Flag Symptoms to Watch (Seek Immediate ER)</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-rose-100/90">
                    {assessment.redFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
                  Clinical Overview Summary
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {assessment.summary}
                </p>
              </div>

              {/* Potential Considerations */}
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <FileCheck2 className="w-4 h-4 text-cyan-400" />
                  <span>Evidence-Based Considerations (Educational, Not a Diagnosis)</span>
                </h3>
                <div className="space-y-3">
                  {assessment.potentialConsiderations?.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm">
                      <div className="font-bold text-cyan-300 text-sm mb-1">
                        {item.condition}
                      </div>
                      <p className="text-slate-300 leading-relaxed mb-2">
                        {item.explanation}
                      </p>
                      <div className="text-slate-400 text-xs bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="font-semibold text-slate-300">Standard Medical Approach: </span>
                        {item.typicalManagement}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions for the Doctor */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <HelpCircle className="w-4 h-4 text-teal-400" />
                  <span>Targeted Questions to Ask Your Doctor</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                  {assessment.questionsForDoctor?.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-400 font-bold shrink-0">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Supportive Comfort Measures */}
              {assessment.comfortMeasures && assessment.comfortMeasures.length > 0 && (
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <h4 className="font-bold text-slate-200 mb-2">
                    Evidence-Supported Home Comfort Measures
                  </h4>
                  <ul className="space-y-1">
                    {assessment.comfortMeasures.map((measure, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>{measure}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800">
                Disclaimer: Klaytor's symptom assessment is intended for health education and preparation. Always consult a licensed medical provider for clinical diagnosis and management plans.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
