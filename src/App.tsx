import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { EmergencyBanner } from "./components/EmergencyBanner";
import { PrivacyDisclaimerModal } from "./components/PrivacyDisclaimerModal";
import { ChatView } from "./components/ChatView";
import { SymptomTriageView } from "./components/SymptomTriageView";
import { TermDecoderView } from "./components/TermDecoderView";
import { MedicationGuideView } from "./components/MedicationGuideView";
import { ClinicalDocView } from "./components/ClinicalDocView";
import { PatientEducationView } from "./components/PatientEducationView";
import { DoctorPrepView } from "./components/DoctorPrepView";
import { SavedVaultView } from "./components/SavedVaultView";
import { UserRole, SavedItem } from "./types";
import { 
  ShieldCheck, 
  HeartPulse, 
  AlertOctagon, 
  BookOpen, 
  Stethoscope, 
  Sparkles, 
  FileText,
  Pill,
  ClipboardList
} from "lucide-react";

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>("patient");
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);

  // Local storage for clinical vault
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const stored = localStorage.getItem("klaytor_saved_items");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("klaytor_saved_items", JSON.stringify(savedItems));
    } catch (e) {
      console.error(e);
    }
  }, [savedItems]);

  const handleSaveToVault = (item: { type: string; title: string; data: any }) => {
    const newItem: SavedItem = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: item.type as any,
      title: item.title,
      date: new Date().toLocaleDateString(),
      data: item.data,
    };
    setSavedItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteItem = (id: string) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all items in your private Clinical Vault?")) {
      setSavedItems([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white" id="klaytor-app-root">
      {/* Navigation Header */}
      <Header
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8" id="main-content">
        {activeTab === "chat" && (
          <ChatView
            userRole={userRole}
            onSaveToVault={handleSaveToVault}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        {activeTab === "symptoms" && (
          <SymptomTriageView
            onSaveToVault={handleSaveToVault}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        {activeTab === "decoder" && (
          <TermDecoderView onSaveToVault={handleSaveToVault} />
        )}

        {activeTab === "medications" && (
          <MedicationGuideView onSaveToVault={handleSaveToVault} />
        )}

        {activeTab === "clinical_doc" && (
          <ClinicalDocView onSaveToVault={handleSaveToVault} />
        )}

        {activeTab === "patient_edu" && (
          <PatientEducationView onSaveToVault={handleSaveToVault} />
        )}

        {activeTab === "visit_prep" && (
          <DoctorPrepView
            onSaveToVault={handleSaveToVault}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        {activeTab === "vault" && (
          <SavedVaultView
            savedItems={savedItems}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearAll}
          />
        )}
      </main>

      {/* Clinical Disclaimer & Emergency Footer */}
      <footer className="bg-slate-900/90 border-t border-slate-800 text-xs text-slate-400 py-6 px-4 sm:px-6 lg:px-8 mt-auto" id="main-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <HeartPulse className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-slate-300 font-semibold">
                Klaytor – AI Medical Assistant & Clinical Documentation Partner
              </p>
              <p className="text-[11px] text-slate-500">
                Educational and clinical support only. Never a replacement for a licensed healthcare provider.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="text-slate-400 hover:text-cyan-300 transition cursor-pointer"
            >
              Privacy & Clinical Ethics
            </button>
            <button
              onClick={() => setIsEmergencyOpen(true)}
              className="text-rose-400 hover:text-rose-300 font-semibold transition cursor-pointer"
            >
              Emergency 911 Red Flags
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">Powered by Gemini 3.7 Flash</span>
          </div>
        </div>
      </footer>

      {/* Emergency Red-Flag Modal */}
      <EmergencyBanner
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* Privacy & Clinical Policy Modal */}
      <PrivacyDisclaimerModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
