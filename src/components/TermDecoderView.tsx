import React, { useState } from "react";
import { 
  FileSearch, 
  Sparkles, 
  RefreshCw, 
  Bookmark, 
  Printer, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Activity,
  Copy,
  Check
} from "lucide-react";
import { TermDecoderResult } from "../types";
import { SAMPLE_LAB_REPORTS } from "../data/sampleData";

interface TermDecoderViewProps {
  onSaveToVault: (item: { type: string; title: string; data: any }) => void;
}

export const TermDecoderView: React.FC<TermDecoderViewProps> = ({ onSaveToVault }) => {
  const [medicalText, setMedicalText] = useState("");
  const [targetAudience, setTargetAudience] = useState<"patient" | "clinician">("patient");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TermDecoderResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDecode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!medicalText.trim() || isLoading) return;

    setIsLoading(true);
    setIsSaved(false);

    try {
      const response = await fetch("/api/simplify-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: medicalText,
          targetAudience,
        }),
      });

      if (!response.ok) throw new Error("Failed to decode medical terms");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to decode the medical text. Please verify the input text and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_LAB_REPORTS[0]) => {
    setMedicalText(sample.content);
  };

  const handleSave = () => {
    if (!result) return;
    onSaveToVault({
      type: "decoded_terms",
      title: `Decoded Lab: ${medicalText.slice(0, 35)}...`,
      data: {
        rawInput: medicalText,
        decoded: result,
        date: new Date().toLocaleDateString(),
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `PLAIN ENGLISH SUMMARY:\n${result.plainEnglishSummary}\n\nKEY FINDINGS:\n${result.keyFindings
      .map((k) => `• ${k.termOrMetric}: ${k.plainMeaning} (${k.normalContext})`)
      .join("\n")}\n\nQUESTIONS FOR DOCTOR:\n${result.questionsToAskPhysician.join("\n")}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "abnormal":
        return {
          label: "Out of Range / Elevated / Abnormal",
          color: "bg-rose-950/80 text-rose-300 border-rose-800",
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
        };
      case "attention_needed":
        return {
          label: "Attention Needed / Borderline",
          color: "bg-amber-950/80 text-amber-300 border-amber-800",
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case "normal":
        return {
          label: "Within Expected / Normal Range",
          color: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      default:
        return {
          label: "Clinical Information / Descriptive",
          color: "bg-cyan-950/80 text-cyan-300 border-cyan-800",
          icon: <Info className="w-3.5 h-3.5 text-cyan-400" />,
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12" id="term-decoder-view">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <FileSearch className="w-4 h-4" />
            <span>Plain-Language Health Translator</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Medical Terms & Lab Result Decoder
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Paste confusing lab results, radiology impressions (X-Ray, CT, MRI), pathology notes, or complex clinical terms to receive a simple, empowering explanation.
          </p>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 w-full md:w-auto font-medium">Try Sample:</span>
          {SAMPLE_LAB_REPORTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(sample)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Paste Medical Text or Lab Results</span>
          </h2>

          <form onSubmit={handleDecode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Medical Report Text / Lab Snippet *
              </label>
              <textarea
                required
                rows={9}
                value={medicalText}
                onChange={(e) => setMedicalText(e.target.value)}
                placeholder="Paste lab values (e.g. Total Cholesterol 240, HDL 42, LDL 160) or radiology notes (e.g. 'Bibasilar atelectasis noted without focal consolidation')..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 font-mono text-xs sm:text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none leading-relaxed"
                id="input-medical-text"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Explanation Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetAudience("patient")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    targetAudience === "patient"
                      ? "bg-cyan-600 border-cyan-500 text-white font-semibold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Simple Patient (6th Grade)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAudience("clinician")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    targetAudience === "clinician"
                      ? "bg-teal-600 border-teal-500 text-white font-semibold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Clinical Reference
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!medicalText.trim() || isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                medicalText.trim() && !isLoading
                  ? "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-cyan-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
              id="btn-decode-terms"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Decoding Terms & Metrics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Translate & Decode Results</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Decoded Result */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !isLoading && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">No Medical Text Decoded Yet</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Paste any blood test report, doctor's clinical notes, or pathology summary on the left to get a structured, easy-to-understand breakdown.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-300 space-y-4 shadow-lg animate-pulse">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-white">Translating Medical Nomenclature</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Klaytor is identifying lab parameters, looking up clinical ranges, and converting complex terminology into clear English...
              </p>
            </div>
          )}

          {result && !isLoading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-300" id="decoded-result-card">
              {/* Header bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400">
                  Decoded Clinical Report
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
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

              {/* Plain English Summary */}
              <div className="bg-cyan-950/40 border border-cyan-800/60 rounded-xl p-4">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wide mb-2">
                  Plain-English Summary (The Big Picture)
                </h3>
                <p className="text-sm text-slate-100 leading-relaxed">
                  {result.plainEnglishSummary}
                </p>
              </div>

              {/* Key Findings breakdown */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">
                  Key Terms & Lab Metrics Breakdown
                </h3>
                <div className="space-y-3">
                  {result.keyFindings?.map((finding, idx) => {
                    const statusBadge = getStatusBadge(finding.status);
                    return (
                      <div
                        key={idx}
                        className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-bold text-cyan-200 font-mono">
                            {finding.termOrMetric}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusBadge.color}`}>
                            {statusBadge.icon}
                            <span>{statusBadge.label}</span>
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          <strong>What this means:</strong> {finding.plainMeaning}
                        </p>
                        <div className="text-xs text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="font-semibold text-slate-300">Expected context / normal values: </span>
                          {finding.normalContext}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* What this means for you */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-2">
                  What This Means For Your Daily Health
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {result.whatThisMeansForYou}
                </p>
              </div>

              {/* Questions to ask doctor */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Empowered Questions to Ask Your Ordering Doctor</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                  {result.questionsToAskPhysician?.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800">
                {result.importantNote || "Important: Laboratory and diagnostic tests should always be evaluated in conjunction with your personal clinical history, symptoms, and physical examinations by your healthcare provider."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
