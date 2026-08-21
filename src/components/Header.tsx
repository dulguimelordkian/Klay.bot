import React from "react";
import { 
  HeartPulse, 
  UserCheck, 
  Stethoscope, 
  ShieldCheck, 
  AlertTriangle, 
  PhoneCall, 
  Info,
  Sparkles,
  BookOpen
} from "lucide-react";
import { UserRole } from "../types";

interface HeaderProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onOpenEmergency: () => void;
  onOpenPrivacy: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  setUserRole,
  onOpenEmergency,
  onOpenPrivacy,
  activeTab,
  setActiveTab,
  savedCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm" id="main-header">
      {/* Top micro-bar for safety & privacy awareness */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            HIPAA-Aligned Privacy Mindset
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400">
            Never store personal identifiers (SSN, names). Local session storage only.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPrivacy}
            className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="Read Klaytor's safety policy"
            id="btn-safety-policy"
          >
            <Info className="w-3 h-3" />
            <span>Safety & Clinical Policy</span>
          </button>
          <button
            onClick={onOpenEmergency}
            className="bg-rose-950/80 border border-rose-700/60 hover:bg-rose-900 text-rose-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm animate-pulse"
            id="btn-emergency-top"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Emergency Red Flags (911)</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("chat")} id="logo-branding">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-md shadow-cyan-900/30 border border-cyan-400/30">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Klaytor
                  <span className="text-xs bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-medium">
                    MD-AI
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Evidence-Based Medical Assistant & Clinical Companion
              </p>
            </div>
          </div>

          {/* Role Switcher Pill */}
          <div className="flex items-center gap-2 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 shadow-inner" id="role-switcher">
            <button
              onClick={() => setUserRole("patient")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                userRole === "patient"
                  ? "bg-cyan-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="role-btn-patient"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Patient & Family</span>
            </button>
            <button
              onClick={() => setUserRole("clinician")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                userRole === "clinician"
                  ? "bg-teal-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="role-btn-clinician"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Clinician & Staff</span>
            </button>
          </div>

          {/* Quick stats / Saved items */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setActiveTab("vault")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "vault"
                  ? "bg-slate-800 border-cyan-500/50 text-cyan-300"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              id="nav-btn-saved-vault"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Clinical Vault</span>
              {savedCount > 0 && (
                <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm font-medium border-t border-slate-800/80 pt-1.5" id="nav-tabs">
          <button
            onClick={() => setActiveTab("chat")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "chat"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
            id="tab-btn-chat"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Klaytor Chat Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab("symptoms")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "symptoms"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
            id="tab-btn-symptoms"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>Symptom Triage & Red Flags</span>
          </button>

          <button
            onClick={() => setActiveTab("decoder")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "decoder"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
            id="tab-btn-decoder"
          >
            <span>🔬 Medical Term & Lab Decoder</span>
          </button>

          <button
            onClick={() => setActiveTab("medications")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "medications"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
            id="tab-btn-medications"
          >
            <span>💊 Medication & Interaction Guide</span>
          </button>

          <button
            onClick={() => setActiveTab("clinical_doc")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "clinical_doc"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
            id="tab-btn-clinical-doc"
          >
            <span>📋 SOAP Notes & Handoffs</span>
          </button>

          <button
            onClick={() => setActiveTab("patient_edu")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "patient_edu"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
            id="tab-btn-patient-edu"
          >
            <span>📖 Patient Education Handouts</span>
          </button>

          <button
            onClick={() => setActiveTab("visit_prep")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "visit_prep"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
            id="tab-btn-visit-prep"
          >
            <span>📝 Doctor Visit Prep Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab("vault")}
            className={`lg:hidden whitespace-nowrap px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "vault"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
            id="tab-btn-vault-mobile"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vault ({savedCount})</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
