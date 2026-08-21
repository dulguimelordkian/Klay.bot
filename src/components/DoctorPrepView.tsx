import React, { useState } from "react";
import { 
  ClipboardList, 
  Sparkles, 
  RefreshCw, 
  Bookmark, 
  Printer, 
  HelpCircle, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Package, 
  MessageSquare,
  ChevronRight
} from "lucide-react";
import { DoctorVisitPrepResult } from "../types";

interface DoctorPrepViewProps {
  onSaveToVault: (item: { type: string; title: string; data: any }) => void;
  onOpenEmergency: () => void;
}

export const DoctorPrepView: React.FC<DoctorPrepViewProps> = ({ onSaveToVault, onOpenEmergency }) => {
  const [primaryConcern, setPrimaryConcern] = useState("Ongoing fatigue and joint stiffness in morning");
  const [symptomsList, setSymptomsList] = useState("Fingers feel stiff for 45 mins in morning, fatigue around 2pm, mild knee swelling");
  const [duration, setDuration] = useState("Past 6-8 weeks, gradually getting more noticeable");
  const [currentMeds, setCurrentMeds] = useState("Daily multivitamin, Ibuprofen 400mg occasional");
  const [pastConditions, setPastConditions] = useState("Hypothyroidism (takes Levothyroxine 50mcg)");
  const [questionsYouHave, setQuestionsYouHave] = useState("Could this be an autoimmune condition like rheumatoid arthritis? Do I need blood work?");

  const [isLoading, setIsLoading] = useState(false);
  const [prepResult, setPrepResult] = useState<DoctorVisitPrepResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const sampleVisits = [
    {
      title: "Morning Joint Stiffness & Fatigue",
      concern: "Persistent morning hand stiffness and afternoon fatigue",
      symptoms: "Stiff fingers for 45 mins upon waking, mild knee ache, fatigue",
      duration: "6 weeks",
      meds: "Levothyroxine 50mcg, Multivitamin",
      past: "Hypothyroidism",
      questions: "Is blood work needed for rheumatoid factors? Should I see a rheumatologist?",
    },
    {
      title: "Blood Pressure Check & Dizziness",
      concern: "Mild lightheadedness when standing up quickly",
      symptoms: "Dizziness lasting 5-10 seconds after getting out of bed or chair",
      duration: "2 weeks",
      meds: "Lisinopril 20mg, Hydrochlorothiazide 12.5mg",
      past: "Hypertension (10 years)",
      questions: "Could my blood pressure medication dose be too high? Should I log BP at home?",
    },
    {
      title: "Persistent Digestive Issues & Bloating",
      concern: "Post-meal bloating and alternating bowel habits",
      symptoms: "Crampy lower abdominal pain relieved by bowel movement, excessive gas",
      duration: "3 months",
      meds: "Probiotic, occasionally Tums",
      past: "None",
      questions: "Could this be IBS or food intolerance? Are allergy tests or colonoscopy needed?",
    },
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!primaryConcern.trim() || isLoading) return;

    setIsLoading(true);
    setIsSaved(false);

    try {
      const response = await fetch("/api/prep-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryConcern,
          symptomsList,
          duration,
          currentMeds,
          pastConditions,
          questionsYouHave,
        }),
      });

      if (!response.ok) throw new Error("Failed to prepare doctor visit guide");
      const data = await response.json();
      setPrepResult(data);
    } catch (err) {
      console.error(err);
      alert("Could not generate doctor prep guide. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (s: typeof sampleVisits[0]) => {
    setPrimaryConcern(s.concern);
    setSymptomsList(s.symptoms);
    setDuration(s.duration);
    setCurrentMeds(s.meds);
    setPastConditions(s.past);
    setQuestionsYouHave(s.questions);
  };

  const handleSave = () => {
    if (!prepResult) return;
    onSaveToVault({
      type: "visit_prep",
      title: `Visit Prep: ${primaryConcern.slice(0, 35)}...`,
      data: {
        inputs: { primaryConcern, symptomsList, duration, currentMeds, pastConditions },
        prepResult,
        date: new Date().toLocaleDateString(),
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12" id="doctor-prep-view">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <ClipboardList className="w-4 h-4" />
            <span>Doctor-Patient Communication Toolkit</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Doctor Visit Prep Checklist & Agenda
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Prepare a focused appointment brief, chronological timeline, high-priority questions, and a checklist of physical items to bring to your doctor.
          </p>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 w-full md:w-auto font-medium">Try Scenario:</span>
          {sampleVisits.map((sample, idx) => (
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
        {/* Left Column: Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <span>Appointment Details Intake</span>
          </h2>

          <form onSubmit={handleGenerate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Main Goal or Chief Concern of Visit *
              </label>
              <input
                type="text"
                required
                value={primaryConcern}
                onChange={(e) => setPrimaryConcern(e.target.value)}
                placeholder="E.g., Morning joint pain, review abnormal lab test, chronic headache..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:border-cyan-500 outline-none"
                id="input-prep-primary-concern"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Specific Symptoms & Triggers
              </label>
              <textarea
                rows={2}
                value={symptomsList}
                onChange={(e) => setSymptomsList(e.target.value)}
                placeholder="Describe where it hurts, how often it happens, what makes it better or worse..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  How Long (Duration)
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="E.g., 6 weeks, past 3 days"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Past Medical Conditions
                </label>
                <input
                  type="text"
                  value={pastConditions}
                  onChange={(e) => setPastConditions(e.target.value)}
                  placeholder="E.g., Asthma, Thyroid, none"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Medications, Vitamins & Supplements
              </label>
              <input
                type="text"
                value={currentMeds}
                onChange={(e) => setCurrentMeds(e.target.value)}
                placeholder="E.g., Lisinopril 10mg, Vitamin D, Fish Oil..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Questions You Already Want to Ask
              </label>
              <textarea
                rows={2}
                value={questionsYouHave}
                onChange={(e) => setQuestionsYouHave(e.target.value)}
                placeholder="E.g., Do I need blood work? Are there non-medication options?..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!primaryConcern.trim() || isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                primaryConcern.trim() && !isLoading
                  ? "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-cyan-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
              id="btn-generate-prep"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Structuring Visit Agenda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Appointment Preparation Sheet</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Printable Appointment Sheet */}
        <div className="lg:col-span-7 space-y-4">
          {!prepResult && !isLoading && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">No Appointment Sheet Created</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Fill in your visit details or pick a scenario to build your structured agenda, opening statement script, and must-ask questions.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-300 space-y-4 shadow-lg animate-pulse">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-white">Organizing Appointment Strategy</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Klaytor is prioritizing your concerns, drafting physician opening scripts, and structuring high-yield questions...
              </p>
            </div>
          )}

          {prepResult && !isLoading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-300" id="visit-prep-result-card">
              {/* Header & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                    Patient Appointment Agenda
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {prepResult.appointmentTitle || "Doctor Visit Preparation Brief"}
                  </h2>
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
                    <span>Print Agenda</span>
                  </button>
                </div>
              </div>

              {/* 1-Sentence Opening Script */}
              <div className="bg-gradient-to-r from-cyan-950/70 to-teal-950/70 border border-cyan-700/60 rounded-xl p-4 space-y-1.5">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Opening Script (Say this when your doctor enters the room)</span>
                </h3>
                <p className="text-sm font-medium text-white italic bg-slate-900/80 p-3 rounded-lg border border-cyan-800/40">
                  "{prepResult.oneSentenceOpening}"
                </p>
              </div>

              {/* Symptom Timeline */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Symptom Timeline Summary</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {prepResult.symptomTimeline}
                </p>
              </div>

              {/* High Priority Questions */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-teal-400" />
                  <span>Top Priority Questions for Your Doctor</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                  {prepResult.highPriorityQuestions?.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-teal-400 font-bold shrink-0">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Items to bring */}
              {prepResult.itemsToBring && prepResult.itemsToBring.length > 0 && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Checklist of Physical Items to Bring</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {prepResult.itemsToBring.map((item, idx) => (
                      <label key={idx} className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <input type="checkbox" className="accent-cyan-500 rounded cursor-pointer" />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips for During the Appointment */}
              {prepResult.duringAppointmentTips && prepResult.duringAppointmentTips.length > 0 && (
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <h4 className="font-bold text-slate-200">
                    Communication Tips for Your Appointment:
                  </h4>
                  <ul className="space-y-1 text-slate-400">
                    {prepResult.duringAppointmentTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red flag notice */}
              {prepResult.redFlagReminders && (
                <div className="bg-rose-950/30 border border-rose-900/50 p-3.5 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Emergency Warning: </span>
                    <span>{prepResult.redFlagReminders}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
