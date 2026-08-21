import React from "react";
import { ShieldCheck, X, FileText, Lock, HeartHandshake, Stethoscope } from "lucide-react";

interface PrivacyDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyDisclaimerModal: React.FC<PrivacyDisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" id="modal-privacy-policy">
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          id="btn-close-privacy-modal"
          aria-label="Close privacy modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Klaytor Clinical & Privacy Policy</h2>
            <p className="text-xs text-slate-400">Safety standards, non-diagnostic boundaries & data protection</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 max-h-[60vh] overflow-y-auto pr-2">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              1. Non-Diagnostic Medical Educational Tool
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Klaytor is an artificial intelligence application intended strictly for educational, informational, and clinical documentation support. Klaytor does <strong>NOT</strong> provide a definitive medical diagnosis, prescribe pharmaceutical treatment, or establish a formal doctor-patient relationship.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              2. Privacy & Zero PII Retention Mindset
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Klaytor operates under strict privacy safeguards. We strongly urge users <strong>never</strong> to submit Personally Identifiable Information (such as Social Security Numbers, full legal names, home addresses, or phone numbers). Your session conversations and generated clinical notes remain in your active browser session unless you explicitly export or save them locally.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-amber-400" />
              3. Evidence-Based & Clinical Guidance
            </h3>
            <p className="text-slate-300 leading-relaxed">
              All clinical guidance is referenced against evidence-based standards, standard-of-care guidelines (CDC, WHO, NIH, peer-reviewed medical journals), and pharmacological references. Healthcare workers must apply independent clinical judgment to verify all AI-drafted SOAP notes, dosage recommendations, and diagnostic differentials.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              4. Emergency Triage Rule
            </h3>
            <p className="text-slate-300 leading-relaxed">
              For any sudden severe pain, chest tightness, stroke symptoms, respiratory distress, high fever in infants, or signs of anaphylaxis, you must immediately contact local emergency services (911/112) or go to the nearest emergency department.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs sm:text-sm rounded-xl transition cursor-pointer"
            id="btn-agree-privacy"
          >
            I Acknowledge & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
