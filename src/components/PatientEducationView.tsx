import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Bookmark, 
  Printer, 
  Copy, 
  Check, 
  CheckCircle2, 
  Heart, 
  ShieldAlert, 
  FileText,
  Sliders
} from "lucide-react";
import { ClinicalDocResult } from "../types";

interface PatientEducationViewProps {
  onSaveToVault: (item: { type: string; title: string; data: any }) => void;
}

export const PatientEducationView: React.FC<PatientEducationViewProps> = ({ onSaveToVault }) => {
  const [topic, setTopic] = useState("Managing Type 2 Diabetes at Home");
  const [readingLevel, setReadingLevel] = useState("6th Grade (Simple & Clear)");
  const [patientContext, setPatientContext] = useState(
    "Newly diagnosed 54-year-old patient starting Metformin 500mg BID. Needs advice on blood sugar checks, low-sugar meals, foot care, and avoiding hypoglycemia."
  );
  const [language, setLanguage] = useState("English");
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClinicalDocResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const sampleTopics = [
    {
      name: "Diabetes Self-Care",
      topic: "Living Well with Type 2 Diabetes",
      context: "Starting Metformin, eating balanced meals, checking feet daily, knowing signs of low blood sugar.",
    },
    {
      name: "Hypertension & Low Sodium",
      topic: "High Blood Pressure & The DASH Diet",
      context: "Lowering dietary salt, taking Lisinopril consistently, home BP monitoring schedule, limiting caffeine.",
    },
    {
      name: "Post-Op Wound Care",
      topic: "Surgical Incision & Home Wound Care",
      context: "Keeping incision dry for 48 hours, signs of infection (redness, heat, pus), pain management without overusing opioids.",
    },
    {
      name: "Asthma Inhaler Guide",
      topic: "How to Use Your Asthma Inhaler & Spacer",
      context: "Difference between controller (daily steroid) vs rescue (albuterol) inhalers, rinse mouth after steroid, peak flow meter.",
    },
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setIsSaved(false);

    try {
      const response = await fetch("/api/clinical-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: "Patient Education Handout",
          specialty: "Patient Education & Health Literacy",
          chiefComplaint: topic,
          rawNotes: `Topic: ${topic}\nTarget Reading Level: ${readingLevel}\nLanguage: ${language}\nPatient Specific Instructions: ${patientContext}\n\nPlease generate a warm, compassionate, highly readable patient handout with: 1. Overview in everyday language, 2. Daily action steps (Do's), 3. Things to avoid (Don'ts), 4. Medication tips, 5. Red Flag warning signs (when to call doctor vs 911), 6. Questions for the next visit.`,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate handout");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate education material. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSaveToVault({
      type: "patient_handout",
      title: `Handout: ${topic.slice(0, 35)}...`,
      data: {
        topic,
        readingLevel,
        handout: result,
        date: new Date().toLocaleDateString(),
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.formattedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12" id="patient-edu-view">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Health Literacy & Caregiver Resources</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Patient Education Material Generator
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Create clear, compassionate, reading-level-adjusted patient education handouts, discharge instructions, and chronic condition guides.
          </p>
        </div>

        {/* Preset topics */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 w-full md:w-auto font-medium">Topic Presets:</span>
          {sampleTopics.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(s.topic);
                setPatientContext(s.context);
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Handout Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Handout Customization</span>
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Condition, Procedure, or Topic *
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g., Living with Type 2 Diabetes, Caring for a Sprained Ankle..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none"
                id="input-handout-topic"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reading Level
                </label>
                <select
                  value={readingLevel}
                  onChange={(e) => setReadingLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none"
                >
                  <option value="6th Grade (Simple & Clear)">6th Grade (Recommended)</option>
                  <option value="8th Grade (Standard)">8th Grade (Standard)</option>
                  <option value="High School / Detailed">High School / Detailed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none"
                >
                  <option value="English">English</option>
                  <option value="Spanish (Español)">Spanish (Español)</option>
                  <option value="French (Français)">French (Français)</option>
                  <option value="Tagalog">Tagalog</option>
                  <option value="Chinese (Simplified)">Chinese (Simplified)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Specific Patient Instructions & Nuances
              </label>
              <textarea
                rows={5}
                value={patientContext}
                onChange={(e) => setPatientContext(e.target.value)}
                placeholder="Include specific medication schedules, dietary restrictions, next visit timeline, or special warnings..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none resize-none leading-relaxed"
                id="input-handout-context"
              />
            </div>

            <button
              type="submit"
              disabled={!topic.trim() || isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                topic.trim() && !isLoading
                  ? "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-cyan-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
              id="btn-create-handout"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Drafting Patient Handout...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Printable Patient Handout</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Handout Document */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !isLoading && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">No Patient Handout Created</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Select a topic on the left or customize your patient's specific instructions to generate a clear, formatted guide.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-300 space-y-4 shadow-lg animate-pulse">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-white">Generating Accessible Patient Material</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Klaytor is adjusting language to the target grade level, formatting action checklists, and embedding safety red-flags...
              </p>
            </div>
          )}

          {result && !isLoading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-300" id="handout-result-card">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                    Patient Educational Handout
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    {result.title || topic}
                  </h2>
                </div>

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
                    <span>Print Handout</span>
                  </button>
                </div>
              </div>

              {/* Handout content */}
              <div className="bg-slate-950/80 p-6 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans shadow-inner">
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-cyan-300 prose-strong:text-white prose-ul:my-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result.formattedContent}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                <span>Provided by Klaytor AI Medical Assistant</span>
                <span>Review with your clinic care team</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
