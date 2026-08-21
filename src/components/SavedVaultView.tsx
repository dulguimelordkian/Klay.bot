import React, { useState } from "react";
import { 
  BookOpen, 
  Trash2, 
  Download, 
  Printer, 
  Search, 
  FileText, 
  HeartPulse, 
  Pill, 
  ClipboardList, 
  Calendar, 
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Copy,
  Check
} from "lucide-react";
import { SavedItem } from "../types";

interface SavedVaultViewProps {
  savedItems: SavedItem[];
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onSelectItem?: (item: SavedItem) => void;
}

export const SavedVaultView: React.FC<SavedVaultViewProps> = ({
  savedItems,
  onDeleteItem,
  onClearAll,
}) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItem, setActiveItem] = useState<SavedItem | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredItems = savedItems.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(item.data).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "triage":
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case "decoded_terms":
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case "medication":
        return <Pill className="w-4 h-4 text-emerald-400" />;
      case "soap_note":
        return <FileText className="w-4 h-4 text-teal-400" />;
      case "patient_handout":
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case "visit_prep":
        return <ClipboardList className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "triage":
        return "Symptom Triage";
      case "decoded_terms":
        return "Decoded Lab / Terms";
      case "medication":
        return "Medication Profile";
      case "soap_note":
        return "Clinical Note (SOAP)";
      case "patient_handout":
        return "Patient Handout";
      case "visit_prep":
        return "Doctor Visit Prep";
      default:
        return "Consultation Item";
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedItems, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `klaytor_clinical_vault_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyDetail = () => {
    if (!activeItem) return;
    navigator.clipboard.writeText(JSON.stringify(activeItem.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12" id="saved-vault-view">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Local Clinical Vault</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Saved Consultations, Notes & Handouts
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Securely access your saved clinical documentation, decoded lab results, symptom triage reports, and visit prep sheets in your private browser session.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedItems.length > 0 && (
            <>
              <button
                onClick={handleExportJSON}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                id="btn-export-vault"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => window.print()}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print All</span>
              </button>
              <button
                onClick={onClearAll}
                className="text-xs bg-rose-950/60 hover:bg-rose-900 text-rose-300 px-3 py-2 rounded-xl border border-rose-800 flex items-center gap-1.5 transition cursor-pointer"
                id="btn-clear-vault"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Vault</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {["all", "triage", "decoded_terms", "medication", "soap_note", "patient_handout", "visit_prep"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                filterType === type
                  ? "bg-cyan-600 text-white font-semibold shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {type === "all" ? "All Items" : getTypeLabel(type)}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vault..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* Vault Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No Saved Items in Vault</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Use the "Save to Vault" button in any tool (Symptom Triage, Lab Decoder, Medication Guide, SOAP Notes, or Visit Prep) to store records here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                    {getIcon(item.type)}
                    <span>{getTypeLabel(item.type)}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <button
                  onClick={() => setActiveItem(item)}
                  className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                  title="Delete from Vault"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {getIcon(activeItem.type)}
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                    {getTypeLabel(activeItem.type)}
                  </span>
                  <h3 className="text-base font-bold text-white">{activeItem.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyDetail}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition cursor-pointer"
                  title="Copy JSON"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActiveItem(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 text-xs sm:text-sm text-slate-200">
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(activeItem.data, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
