import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  Bookmark, 
  Trash2, 
  AlertTriangle, 
  RefreshCw,
  Stethoscope,
  HeartPulse,
  HelpCircle,
  Pill,
  FileCheck
} from "lucide-react";
import { ChatMessage, UserRole } from "../types";

interface ChatViewProps {
  userRole: UserRole;
  onSaveToVault: (item: { type: string; title: string; data: any }) => void;
  onOpenEmergency: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ userRole, onSaveToVault, onOpenEmergency }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "initial-welcome",
      role: "assistant",
      content:
        userRole === "clinician"
          ? "### Hello, Doctor / Clinical Colleague. I am Klaytor.\nI am equipped to assist with clinical documentation, differential diagnoses exploration, pharmacology reviews, patient discharge summaries, and medical literature synthesis. How can I support your clinical workflow today?"
          : "### Hello, I'm Klaytor, your AI Medical Assistant.\nI'm here to help you understand health symptoms, decode confusing medical terms, learn about your medications, and prepare for visits with your doctor.\n\n*How can I help you or your family today?*",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      metadata: {
        suggestedFollowUps:
          userRole === "clinician"
            ? [
                "Draft a SOAP note for acute sinusitis",
                "Review contraindications for ACE inhibitors & ARBs",
                "Summarize diagnostic criteria for metabolic syndrome",
                "Create a patient discharge handout for atrial fibrillation",
              ]
            : [
                "What causes a dull lower back ache?",
                "Can you explain what 'elevated liver enzymes' means?",
                "What should I ask my doctor about my high blood pressure?",
                "What is the difference between ibuprofen and acetaminophen?",
              ],
      },
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Voice synthesis (Text-to-Speech)
  const handleSpeak = (text: string, id: string) => {
    if (!("speechSynthesis" in window)) return;

    if (isSpeaking === id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for clean speech
    const cleanText = text.replace(/[#*_`\[\]]/g, "").replace(/\n+/g, ". ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    setIsSpeaking(id);
    window.speechSynthesis.speak(utterance);
  };

  // Voice Recognition (Speech-to-Text)
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. You can type your question directly.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveMessage = (msg: ChatMessage) => {
    onSaveToVault({
      type: "chat_export",
      title: `Medical Query: ${msg.content.slice(0, 45)}...`,
      data: {
        role: userRole,
        message: msg.content,
        timestamp: msg.timestamp,
      },
    });
    setSavedId(msg.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input.trim();
    if (!messageText || isLoading) return;

    // Check emergency red flags immediately in input text
    const lower = messageText.toLowerCase();
    const isEmergency =
      lower.includes("crushing chest pain") ||
      lower.includes("can't breathe") ||
      lower.includes("cannot breathe") ||
      lower.includes("slurred speech") ||
      lower.includes("face drooping") ||
      lower.includes("suicidal") ||
      lower.includes("kill myself") ||
      lower.includes("severe allergic reaction");

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userRole,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `msg-asst-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEmergencyAlert: isEmergency,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const isOverloaded = error.message?.includes("busy") || error.message?.includes("high demand") || error.message?.includes("503");
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content: isOverloaded
          ? "The medical AI model is experiencing a temporary spike in traffic. Our multi-engine fallback has been engaged. Please click below to retry your inquiry."
          : "I encountered a temporary communication issue. Please check your connection or try rephrasing your clinical question.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        metadata: {
          suggestedFollowUps: [messageText],
        },
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to reset the current consultation?")) {
      setMessages([
        {
          id: "reset-welcome",
          role: "assistant",
          content:
            userRole === "clinician"
              ? "### Clinical Consultation Reset\nHow can I assist your documentation or diagnostic inquiries now?"
              : "### Chat Reset\nHow can I help you with your health questions today?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  const quickPrompts =
    userRole === "clinician"
      ? [
          "Differential diagnosis for persistent pleuritic chest pain in a 28-year-old",
          "Draft an SBAR handoff for a COPD exacerbation patient",
          "Summarize ADA guidelines for SGLT2 inhibitors in CKD patients",
          "Draft a clear discharge summary for acute uncomplicated diverticulitis",
        ]
      : [
          "My doctor said I have 'elevated triglycerides'. What does that mean?",
          "What are the most common side effects of Lisinopril?",
          "I have a throbbing headache and light sensitivity. What questions should I ask my doctor?",
          "How can I safely manage mild knee osteoarthritis at home?",
        ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto w-full bg-slate-900/60 rounded-2xl border border-slate-800 shadow-xl overflow-hidden" id="chat-container">
      {/* Chat header bar */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Klaytor Interactive Consultation
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                userRole === "clinician"
                  ? "bg-teal-950 text-teal-300 border-teal-800"
                  : "bg-cyan-950 text-cyan-300 border-cyan-800"
              }`}>
                {userRole === "clinician" ? "Clinical Practice Mode" : "Patient Education Mode"}
              </span>
            </h2>
            <p className="text-xs text-slate-400">Evidence-based • Non-diagnostic • Private</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
            title="Reset conversation"
            id="btn-clear-chat"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.role === "user"
                  ? "bg-slate-700 text-slate-200"
                  : userRole === "clinician"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-cyan-600 text-white shadow-sm"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`relative group rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-cyan-600 text-white rounded-tr-none shadow-md"
                  : "bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none shadow-sm"
              }`}
            >
              {/* Emergency Banner inside bubble if detected */}
              {msg.isEmergencyAlert && (
                <div className="mb-3 p-3 bg-rose-950/90 border border-rose-600 rounded-xl text-rose-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Potential emergency symptoms detected. Please call 911 or visit an emergency room.</span>
                  </div>
                  <button
                    onClick={onOpenEmergency}
                    className="underline text-rose-300 hover:text-white font-bold cursor-pointer shrink-0"
                  >
                    View Emergency Signs
                  </button>
                </div>
              )}

              {/* Markdown Content */}
              <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:leading-relaxed prose-li:my-0.5">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>

              {/* Timestamp & Utilities */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40 text-[11px] text-slate-400 gap-4">
                <span>{msg.timestamp}</span>

                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleSpeak(msg.content, msg.id)}
                      className="p-1 hover:text-cyan-300 transition cursor-pointer"
                      title={isSpeaking === msg.id ? "Stop voice" : "Read aloud"}
                    >
                      {isSpeaking === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="p-1 hover:text-cyan-300 transition cursor-pointer"
                      title="Copy to clipboard"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSaveMessage(msg)}
                      className="p-1 hover:text-cyan-300 transition cursor-pointer"
                      title="Save note to Clinical Vault"
                    >
                      {savedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-teal-400" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Suggested Follow-ups */}
              {msg.metadata?.suggestedFollowUps && msg.metadata.suggestedFollowUps.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-700/50">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Suggested Inquiries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.metadata.suggestedFollowUps.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="text-xs bg-slate-900/80 hover:bg-cyan-950 hover:text-cyan-200 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/80 hover:border-cyan-600/60 transition-all text-left cursor-pointer"
                      >
                        {suggestion} →
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-300 flex items-center gap-2 shadow-sm">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Klaytor is synthesizing clinical evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts Drawer */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Quick Topics:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-xs whitespace-nowrap bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-md border border-slate-700 transition cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input container */}
      <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex items-end gap-2 bg-slate-950/90 border border-slate-700/80 rounded-xl p-2 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all shadow-inner">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              userRole === "clinician"
                ? "Ask a clinical question, dictate case notes, or request a SOAP summary... (Shift+Enter for newline)"
                : "Describe symptoms, ask about medications, or ask for simple health explanations..."
            }
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none outline-none max-h-32 px-2 py-1"
            id="chat-input-textarea"
          />

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={toggleVoiceInput}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isListening
                  ? "bg-rose-600 text-white animate-pulse"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
              title={isListening ? "Listening... click to stop" : "Voice dictation"}
              id="btn-voice-input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-lg text-white font-medium transition-all cursor-pointer ${
                input.trim() && !isLoading
                  ? "bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-900/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
              id="btn-send-chat"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <span>Klaytor is an educational AI tool. Never use for active emergencies.</span>
          <span className="font-mono">Engine: Gemini Multi-Tier Clinical AI</span>
        </div>
      </div>
    </div>
  );
};
