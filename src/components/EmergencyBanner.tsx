import React from "react";
import { AlertOctagon, Phone, ShieldAlert, X, ChevronRight, CheckCircle2 } from "lucide-react";

interface EmergencyBannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const redFlagSymptoms = [
    "Crushing chest pressure, tightness, or pain radiating to left arm, jaw, neck, or back",
    "Sudden weakness, numbness or paralysis in face, arm, or leg (especially one side of body)",
    "Sudden difficulty speaking, slurred speech, or confusion",
    "Severe shortness of breath, gasping, or inability to speak in full sentences",
    "Sudden severe 'thunderclap' headache unlike any previously experienced",
    "Uncontrolled bleeding or coughing/vomiting blood",
    "Anaphylaxis: sudden swelling of lips, tongue, throat, or widespread hives with breathing trouble",
    "High fever (>100.4°F / 38°C) in an infant younger than 3 months old",
    "Sudden loss of vision, double vision, or eye trauma",
    "Acute thoughts of self-harm, suicide, or crisis",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" id="modal-emergency-container">
      <div className="relative bg-slate-900 border-2 border-rose-600/90 rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-white shadow-2xl shadow-rose-950/50 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          id="btn-close-emergency-modal"
          aria-label="Close emergency modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-rose-600/20 border border-rose-500/40 rounded-xl text-rose-400 shrink-0">
            <AlertOctagon className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800">
              Immediate Clinical Alert
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Do You Need Emergency Medical Care?
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              If you or someone nearby is experiencing any of the following life-threatening symptoms, do not use an AI assistant. Call emergency services immediately.
            </p>
          </div>
        </div>

        {/* Direct Contact Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <a
            href="tel:911"
            className="flex items-center justify-center gap-2 p-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-900/40 transition text-center cursor-pointer"
            id="emergency-call-911"
          >
            <Phone className="w-4 h-4 animate-bounce" />
            <span>Call 911 (US / Canada)</span>
          </a>
          <a
            href="tel:112"
            className="flex items-center justify-center gap-2 p-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold text-sm transition text-center cursor-pointer"
            id="emergency-call-112"
          >
            <Phone className="w-4 h-4" />
            <span>Call 112 (EU / UK: 999)</span>
          </a>
          <a
            href="tel:988"
            className="flex items-center justify-center gap-2 p-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 rounded-xl font-bold text-sm transition text-center cursor-pointer"
            id="emergency-call-988"
          >
            <Phone className="w-4 h-4" />
            <span>Call 988 (Crisis Line)</span>
          </a>
        </div>

        {/* Red Flags List */}
        <div className="bg-slate-950/70 border border-rose-900/50 rounded-xl p-4 mb-6">
          <h3 className="text-xs font-semibold text-rose-300 uppercase tracking-wide flex items-center gap-1.5 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Immediate Red Flag Warning Signs
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
            {redFlagSymptoms.map((symptom, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{symptom}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Poison Control & Action footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div>
            <span className="text-slate-300 font-medium">Poison Control (US): </span>
            <a href="tel:18002221222" className="text-cyan-400 hover:underline font-mono">
              1-800-222-1222
            </a>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
            id="btn-dismiss-emergency"
          >
            I Understand, Continue to Klaytor
          </button>
        </div>
      </div>
    </div>
  );
};
