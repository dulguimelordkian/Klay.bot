import React, { useState } from "react";
import { 
  Pill, 
  Sparkles, 
  RefreshCw, 
  Bookmark, 
  Printer, 
  AlertTriangle, 
  ShieldAlert, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Info,
  ChevronRight
} from "lucide-react";
import { MedicationGuideResult } from "../types";
import { SAMPLE_MEDICATIONS } from "../data/sampleData";

interface MedicationGuideViewProps {
  onSaveToVault: (item: { type: string; title: string; data: any }) => void;
}

export const MedicationGuideView: React.FC<MedicationGuideViewProps> = ({ onSaveToVault }) => {
  const [medicationName, setMedicationName] = useState("Metformin");
  const [currentMedications, setCurrentMedications] = useState("Lisinopril 10mg daily, Multivitamin");
  const [userCondition, setUserCondition] = useState("Type 2 Diabetes, High blood pressure");
  const [isLoading, setIsLoading] = useState(false);
  const [guide, setGuide] = useState<MedicationGuideResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!medicationName.trim() || isLoading) return;

    setIsLoading(true);
    setIsSaved(false);

    try {
      const response = await fetch("/api/medication-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationName,
          currentMedications,
          userCondition,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch medication guide");
      const data = await response.json();
      setGuide(data);
    } catch (err) {
      console.error(err);
      alert("Could not load medication guide. Please check the spelling or connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_MEDICATIONS[0]) => {
    setMedicationName(sample.name);
    setCurrentMedications(sample.currentMeds);
    setUserCondition(sample.condition);
  };

  const handleSave = () => {
    if (!guide) return;
    onSaveToVault({
      type: "medication",
      title: `Medication: ${guide.genericName} (${guide.drugClass})`,
      data: {
        guide,
        date: new Date().toLocaleDateString(),
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12" id="medication-guide-view">
      {/* Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Pill className="w-4 h-4" />
            <span>Pharmacology & Safety Guidance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Medication & Interaction Guide
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Explore safe medication usage, mechanisms of action, potential drug/food interactions, missed dose rules, and key safety warnings.
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 w-full md:w-auto font-medium">Quick Examples:</span>
          {SAMPLE_MEDICATIONS.map((med, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(med)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              {med.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Pill className="w-4 h-4 text-cyan-400" />
            <span>Medication Search & Safety Filter</span>
          </h2>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Medication Name (Generic or Brand) *
              </label>
              <input
                type="text"
                required
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                placeholder="E.g., Metformin, Lisinopril, Atorvastatin, Ozempic, Amoxicillin..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                id="input-med-name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Other Concurrent Medications, Supplements, or Vitamins
              </label>
              <textarea
                rows={3}
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
                placeholder="E.g., Ibuprofen, Vitamin D3, Blood pressure pills, St. John's Wort..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none resize-none"
                id="input-current-meds"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Health Conditions / Reason for Taking
              </label>
              <input
                type="text"
                value={userCondition}
                onChange={(e) => setUserCondition(e.target.value)}
                placeholder="E.g., High blood pressure, Type 2 diabetes, Kidney stones..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:border-cyan-500 outline-none"
                id="input-user-condition"
              />
            </div>

            <button
              type="submit"
              disabled={!medicationName.trim() || isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                medicationName.trim() && !isLoading
                  ? "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-cyan-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
              id="btn-search-medication"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Reviewing Drug Pharmacology...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Drug Guide & Check Interactions</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Medication Result */}
        <div className="lg:col-span-7 space-y-4">
          {!guide && !isLoading && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">No Medication Selected</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Type any medication name or choose a sample to inspect safety information, administration tips, and interaction checks.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-300 space-y-4 shadow-lg animate-pulse">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-white">Analyzing Medication Profile</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Klaytor is cross-referencing pharmacological indications, side effects, contraindications, and potential interaction flags...
              </p>
            </div>
          )}

          {guide && !isLoading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-300" id="medication-result-card">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                    {guide.drugClass}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                    {guide.genericName}
                  </h2>
                  {guide.brandNames && guide.brandNames.length > 0 && (
                    <p className="text-xs text-slate-400">
                      Brand names: {guide.brandNames.join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
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

              {/* How it works & Primary uses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Primary Uses
                  </h4>
                  <ul className="space-y-1 text-xs sm:text-sm text-slate-200">
                    {guide.primaryUses?.map((use, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{use}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                    How It Works in the Body
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {guide.howItWorks}
                  </p>
                </div>
              </div>

              {/* Interactions Alert Box */}
              {guide.keyInteractions && guide.keyInteractions.length > 0 && (
                <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Key Interactions & Warnings (Food, Alcohol, Other Drugs)</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-amber-100/90">
                    {guide.keyInteractions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Side Effects Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Common (Usually Mild) Side Effects</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {guide.commonSideEffects?.map((effect, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-slate-400">•</span>
                        <span>{effect}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-950/30 p-4 rounded-xl border border-rose-900/50 space-y-2">
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Serious Signs (Notify Doctor Immediately)</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-rose-100/90">
                    {guide.seriousSideEffects?.map((effect, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400">•</span>
                        <span>{effect}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Administration & Missed Dose */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Missed Dose Standard Advice</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200">
                    {guide.missedDoseAdvice}
                  </p>
                </div>

                {guide.administrationTips && guide.administrationTips.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-300 block mb-1">
                      Administration Tips:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {guide.administrationTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-teal-400">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Doctor / Pharmacist Questions */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <HelpCircle className="w-4 h-4 text-teal-400" />
                  <span>Questions to Confirm with Your Pharmacist or Doctor</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                  {guide.doctorQuestions?.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-400 font-bold shrink-0">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800">
                Warning: Never stop, start, or modify the dosage of any prescribed medication without direct consultation with your prescribing healthcare professional.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
