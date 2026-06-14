/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from "react";
import PhishSwipeArena from "./components/PhishSwipeArena";
import RealThreatScanner from "./components/RealThreatScanner";
import { 
  Shield, 
  Lock, 
  LogOut, 
  Activity, 
  Terminal, 
  TrendingUp, 
  Layers, 
  HelpCircle, 
  Search, 
  CheckCircle2, 
  Play, 
  Award, 
  Briefcase, 
  FileText,
  AlertTriangle,
  FileCheck
} from "lucide-react";

interface UserSession {
  name: string;
  organization: string;
  role: string;
}

export default function App() {
  // Navigation: "cockpit" | "triage" | "forensics" | "analytics"
  const [activeTab, setActiveTab] = useState<"cockpit" | "triage" | "forensics" | "analytics">("cockpit");
  
  // Local session login setup
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const savedSession = localStorage.getItem("phishswipe_user_session_v3.0");
      if (savedSession) {
        return JSON.parse(savedSession);
      }
    } catch (_) {}
    return null;
  });

  // Authentication states
  const [authName, setAuthName] = useState("");
  const [authOrg, setAuthOrg] = useState("");
  const [authRole, setAuthRole] = useState("Enterprise Threat Analyst");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authLog, setAuthLog] = useState<string[]>([]);

  // Triage game global state indicators
  const [streak, setStreak] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("phishswipe_streak_counter_v3") || "0");
    } catch (_) {
      return 0;
    }
  });

  const [maxStreak, setMaxStreak] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("phishswipe_max_streak_counter_v3") || "0");
    } catch (_) {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("phishswipe_streak_counter_v3", streak.toString());
      if (streak > maxStreak) {
        setMaxStreak(streak);
        localStorage.setItem("phishswipe_max_streak_counter_v3", streak.toString());
      }
    } catch (_) {}
  }, [streak, maxStreak]);

  const handleAuthenticateSession = (e: FormEvent) => {
    e.preventDefault();
    if (!authName.trim() || !authOrg.trim()) return;

    setIsAuthenticating(true);
    setAuthLog(["Initializing secure audit environment..."]);

    const steps = [
      { delay: 250, msg: "Allocating private local simulator..." },
      { delay: 500, msg: `Configuring credential key folder for: ${authName}` },
      { delay: 750, msg: "Training workspace loaded. Launching active simulator." }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setAuthLog((prev) => [...prev, step.msg]);
        if (step.msg.startsWith("Training workspace loaded")) {
          setTimeout(() => {
            const newSession: UserSession = {
              name: authName.trim(),
              organization: authOrg.trim(),
              role: authRole
            };
            try {
              localStorage.setItem("phishswipe_user_session_v3.0", JSON.stringify(newSession));
            } catch (_) {}
            setCurrentUser(newSession);
            setIsAuthenticating(false);
            setActiveTab("cockpit"); // Go straight to the cockpit overview
          }, 200);
        }
      }, step.delay);
    });
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("phishswipe_user_session_v3.0");
    } catch (_) {}
    setCurrentUser(null);
    setAuthLog([]);
    setStreak(0);
    setActiveTab("cockpit");
  };

  // Welcome Platform Gateway (Authentication Panel) - Custom Premium Corporate Redesign
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090D1A] text-slate-100 flex flex-col justify-between p-4 sm:p-8 md:p-12 relative font-sans overflow-hidden">
        
        {/* Soft transparent cyber-threat grid and network indicator nodes (completely replacing glowing green bg) */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-[#0a0f20]/40 to-slate-950/20 pointer-events-none" />
        
        {/* Transparent Cyber Shield circular waves (Phishing Sandbox connotation) */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-slate-500/[0.015] rounded-full border border-slate-500/[0.04] pointer-events-none" />
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/[0.01] rounded-full border border-blue-500/[0.03] pointer-events-none animate-[pulse_6s_infinite]" />
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-500/[0.005] rounded-full border border-red-500/[0.02] pointer-events-none" />

        {/* Brand Header */}
        <header className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-white/10 z-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="font-black text-2xl tracking-tight text-white block">
                PishSwipe
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block font-mono">
                COMPLIANCE & THREAT AUDIT SIMULATION
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-mono text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SECURE LOCAL SANDBOX ONLINE</span>
          </div>
        </header>

        {/* Main dynamic split layout */}
        <main className="max-w-7xl mx-auto w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center my-8 md:my-12 z-10">
          
          {/* Detailed Informative Column with highly structured layout */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-black uppercase rounded-lg tracking-wider">
              <Terminal className="w-3.5 h-3.5" />
              <span>STATION AUTHENTICATION REQUIRED</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Tactile Threat Simulation</span>
            </h1>
            
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal max-w-xl">
              Static compliance bullet points fail to protect corporate environments. This premium sandboxed simulator evaluates security compliance through interactive live challenge matrices—training staff via procedurally generated domain lookalikes, wire approvals, and mock heuristic alarms.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-250 uppercase mb-0.5 tracking-wide">1,000+ Scenarios</h4>
                  <p className="text-[11px] text-slate-500 leading-normal font-sans">Endless procedural templates covering brand spoofs and advanced phishing vectors.</p>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-250 uppercase mb-0.5 tracking-wide">Forensic Tools</h4>
                  <p className="text-[11px] text-slate-500 leading-normal font-sans">Built-in header breakdown, lookalike link inspectors, and real-time custom scanning.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Elegant Slate Form Card Panel */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="border-b border-white/15 pb-4">
                <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest block font-mono">
                  SECURITY CREDENTIAL PORTAL
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-1">
                  Initialize Auditor Workspace
                </h2>
              </div>

              <form onSubmit={handleAuthenticateSession} className="space-y-4">
                <div>
                  <label htmlFor="auth-name" className="block text-[10px] font-bold uppercase text-slate-400 mb-2 font-mono tracking-wider">
                    Auditor Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    placeholder="e.g. John Carter"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-left placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label htmlFor="auth-org" className="block text-[10px] font-bold uppercase text-slate-400 mb-2 font-mono tracking-wider">
                    Organization / Company
                  </label>
                  <input
                    id="auth-org"
                    type="text"
                    required
                    placeholder="e.g. Corporate Shield"
                    value={authOrg}
                    onChange={(e) => setAuthOrg(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-left placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label htmlFor="auth-role" className="block text-[10px] font-bold uppercase text-slate-400 mb-2 font-mono tracking-wider">
                    Assigned Role Standard
                  </label>
                  <select
                    id="auth-role"
                    value={authRole}
                    onChange={(e) => setAuthRole(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer text-left focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Enterprise Threat Analyst">Enterprise Threat Analyst (Level I)</option>
                    <option value="Information Security Lead">Information Security Lead (Level II)</option>
                    <option value="Compliance Audit Director">Compliance Audit Director (Level III)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating || !authName.trim() || !authOrg.trim()}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-6 transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.99] disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Play className="w-4 h-4 text-white" />
                  <span>Establish Secure Terminal</span>
                </button>
              </form>
            </div>

            {/* Handshake Tracer Logs Console */}
            {authLog.length > 0 && (
              <div className="mt-5 p-4 bg-slate-950 text-emerald-400 rounded-xl text-left border border-white/5 shadow-inner">
                <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold mb-1.5 tracking-wider">
                  Trace Handshake Log:
                </span>
                <div className="space-y-1 font-mono text-[10px]">
                  {authLog.map((log, index) => (
                    <p key={index} className="leading-relaxed">
                      &gt; {log}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="max-w-7xl mx-auto w-full py-6 border-t border-white/10 font-sans text-[11px] text-slate-500 font-bold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>phishswiipe Cryptographic Platform &bull; Offline Mode &bull; &copy; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500/80 animate-pulse" />
            <span>Encrypted Station Gateway</span>
          </div>
        </footer>

      </div>
    );
  }

  // LOGGED IN VIEW: Full Website Navigation Console Core
  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 flex flex-col font-sans p-6 md:p-8" id="phish-corporate-web-portal">
      
      {/* Platform Header Navigation bar */}
      <header className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between py-4 border-b border-gray-200 gap-4 mb-6">
        
        {/* Brand Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow shadow-slate-900/10">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
              phishswiipe Incident Center
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-sans font-medium">
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-slate-700 font-semibold">
                Profile: <strong className="text-slate-900 font-bold">{currentUser.name}</strong>
              </span>
              <span className="text-slate-200">|</span>
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-slate-700 font-semibold">
                {currentUser.role} at <strong className="text-slate-900 font-bold">{currentUser.organization}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Global Statistics */}
        <div className="flex items-center gap-4 bg-white p-2 text-sm border border-gray-200 rounded-2xl shadow-sm shrink-0">
          <div className="px-3 text-left">
            <span className="text-[10px] text-slate-400 block uppercase font-bold font-mono tracking-tight">Active Streak Index</span>
            <div className="flex items-center gap-2 pt-1 font-mono text-xs">
              <span className="text-slate-900 font-bold">{streak}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">Peak: <strong className="font-bold text-slate-900">{maxStreak}</strong></span>
            </div>
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 px-3 py-2 hover:bg-red-50 rounded-xl transition cursor-pointer font-bold uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Finish Session</span>
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="max-w-7xl mx-auto w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start my-2">
        
        {/* Navigation Sidebar menu */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto pr-0 lg:pr-2 select-none" id="console-sidebar-tabs">
          <span className="hidden lg:block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest pb-1 pl-2 text-left">
            Console Workspace Menu
          </span>

          <button
            onClick={() => setActiveTab("cockpit")}
            className={`p-3.5 rounded-2xl text-left transition-all shrink-0 w-44 lg:w-full flex items-center gap-3 cursor-pointer border ${
              activeTab === "cockpit"
                ? "bg-slate-900 text-white border-slate-950 shadow-sm font-bold"
                : "bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100/30"
            }`}
          >
            <Activity className="w-4 h-4" />
            <div className="min-w-0">
              <span className="text-xs font-extrabold block">Operations Overview</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("triage")}
            className={`p-3.5 rounded-2xl text-left transition-all shrink-0 w-44 lg:w-full flex items-center gap-3 cursor-pointer border ${
              activeTab === "triage"
                ? "bg-slate-900 text-white border-slate-950 shadow-sm font-bold"
                : "bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100/30"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <div className="min-w-0">
              <span className="text-xs font-extrabold block">Triage Threat Game</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("forensics")}
            className={`p-3.5 rounded-2xl text-left transition-all shrink-0 w-44 lg:w-full flex items-center gap-3 cursor-pointer border ${
              activeTab === "forensics"
                ? "bg-slate-900 text-white border-slate-950 shadow-sm font-bold"
                : "bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100/30"
            }`}
          >
            <Search className="w-4 h-4" />
            <div className="min-w-0">
              <span className="text-xs font-extrabold block">Forensics Audit Lab</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`p-3.5 rounded-2xl text-left transition-all shrink-0 w-44 lg:w-full flex items-center gap-3 cursor-pointer border ${
              activeTab === "analytics"
                ? "bg-slate-900 text-white border-slate-950 shadow-sm font-bold"
                : "bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100/30"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <div className="min-w-0">
              <span className="text-xs font-extrabold block">Performance Record</span>
            </div>
          </button>
        </div>

        {/* Dynamic Main Workspace Container */}
        <div className="lg:col-span-9 flex flex-col justify-between" id="portal-workspace-active">
          
          <div className="flex-grow">
            
            {/* View 1: OPERATIONS COCKPIT (Overview) */}
            {activeTab === "cockpit" && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 text-left space-y-8 animate-slide-up">
                
                <div className="border-b border-gray-100 pb-5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>Control Center</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9px] font-sans font-extrabold">
                      Active Training Simulation
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    Welcome to the Incident Command Console
                  </h1>
                  <p className="text-base text-slate-550 leading-relaxed font-normal pt-2.5 max-w-3xl">
                    This compliance suite puts you directly in control of an infinite security audit pipeline. Instead of looking at passive templates, click on the **Triage Threat Game** to evaluate simulated phishing cases in real time, or use the **Forensics Audit Lab** to check external emails and look-alike links against active security patterns.
                  </p>
                </div>

                {/* Cyber threat parameters grid */}
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
                    Key Threat Intelligence Indicators
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between min-h-[145px]">
                      <div className="flex justify-between items-start text-xs font-bold text-slate-400 tracking-wider">
                        <span>THE DAMAGE</span>
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </div>
                      <strong className="text-3xl font-bold tracking-tight text-slate-900 mt-2 font-mono">
                        $1.50M
                      </strong>
                      <p className="text-xs text-slate-500 pt-1 leading-normal font-sans">
                        Average corporate loss in single identity compromise and banking wire diversion incidents.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between min-h-[145px]">
                      <div className="flex justify-between items-start text-xs font-bold text-slate-400 tracking-wider">
                        <span>CRITICAL TACTIC</span>
                        <Layers className="w-4 h-4 text-amber-500" />
                      </div>
                      <strong className="text-3xl font-bold tracking-tight text-slate-900 mt-2 font-mono">
                        90.0%
                      </strong>
                      <p className="text-xs text-slate-500 pt-1 leading-normal font-sans">
                        Of email-based intrusions bypass conventional scanners by substituting look-alike domains.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-gray-200 bg-slate-900 text-slate-100 flex flex-col justify-between min-h-[145px]">
                      <div className="flex justify-between items-start text-xs font-bold text-slate-400 tracking-wider">
                        <span>THE IMMUNITY</span>
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <strong className="text-3xl font-bold tracking-tight text-[#BAEC17] mt-2 font-mono">
                        SPF & DKIM
                      </strong>
                      <p className="text-xs text-slate-350 pt-1 leading-normal font-sans">
                        Rigorous verification of digital routing flags remains the gold-standard protective audit.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tactical directions and button links */}
                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-slate-600 font-mono text-[10px] uppercase font-bold tracking-wider border border-gray-200 shadow-sm">
                      Workspace Online
                    </span>
                    <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-slate-600 font-mono text-[10px] uppercase font-bold tracking-wider border border-gray-200 shadow-sm">
                      Offline Authenticated
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab("triage")}
                      className="px-5 py-3 text-xs bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wider"
                    >
                      Launch Interception Triage Game
                    </button>
                    <button
                      onClick={() => setActiveTab("forensics")}
                      className="px-5 py-3 text-xs bg-gray-100 hover:bg-gray-200 text-slate-800 border border-gray-200 font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wider"
                    >
                      Audit Paste Payloads
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* View 2: INFINITE TRIAGE GAME AREA */}
            {activeTab === "triage" && (
              <div className="animate-slide-up">
                <PhishSwipeArena 
                  onTriageActionCompleted={(choice) => {
                    // Streaks are updated locally inside arena
                  }}
                  streak={streak}
                  setStreak={setStreak}
                  maxStreak={maxStreak}
                  setMaxStreak={setMaxStreak}
                />
              </div>
            )}

            {/* View 3: LIVE FORENSICS AUDIT LAB */}
            {activeTab === "forensics" && (
              <div className="animate-slide-up">
                <RealThreatScanner />
              </div>
            )}

            {/* View 4: DETAILED PERFORMANCE STATISTICS LOG */}
            {activeTab === "analytics" && (
              <div className="bg-slate-900 text-slate-100 border border-slate-950 p-6 md:p-10 rounded-3xl animate-slide-up text-left space-y-6 relative">
                
                <div className="absolute top-6 right-8 flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>

                <div className="border-b border-white/10 pb-4">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    Operations Registry
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
                    Auditor Performance Analytics
                  </h2>
                </div>

                {/* Stats layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-1">
                    <span className="text-xs text-amber-300 font-mono block uppercase tracking-wider font-bold">
                      Current Session Triage Streak:
                    </span>
                    <strong className="text-3xl font-black text-white block mt-2 font-mono">
                      {streak} Cases Correct
                    </strong>
                    <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                      Your consecutive accurately validated incident decisions in this session.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-1">
                    <span className="text-xs text-amber-300 font-mono block uppercase tracking-wider font-bold">
                      Peak Verified Score:
                    </span>
                    <strong className="text-3xl font-black text-[#BAEC17] block mt-2 font-mono">
                      {maxStreak} Cases Peak
                    </strong>
                    <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                      The maximum correct streak recorded on this analyst profile workspace.
                    </p>
                  </div>
                </div>

                {/* IT Security Verification Certificate badge */}
                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#BAEC17]" />
                    <span className="text-xs font-mono text-amber-300 font-bold block uppercase tracking-wider">
                      Worksite Standing Clearance:
                    </span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {maxStreak > 0 ? (
                      <span>Congratulations! You have demonstrated active threat intelligence. Your verified standing shows safe, consistent risk evaluation of digital visual indicators. Keep testing your capabilities with the infinite challenge engine to prevent corporate compromises.</span>
                    ) : (
                      <span>Practicing on the <strong>Triage Threat Game</strong> is required to generate compliance clearance certificates. Visit the triage center to intercept your first incident queue.</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-white/10 mt-6">
                  <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                    SYSTEM STATUS: ACTIVE SHIELD OPERATING
                  </div>
                  
                  <button
                    onClick={() => {
                      setStreak(0);
                      setActiveTab("triage");
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-900 border border-gray-200 p-3 px-5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
                  >
                    <span>Launch New Challenge Sandbox</span>
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      <footer className="py-6 border-t border-gray-200 text-xs font-sans font-semibold uppercase tracking-widest text-slate-400 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>phishswiipe Compliance Suite &copy; {new Date().getFullYear()}</span>
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Certified Operator Dashboard Channel</span>
        </div>
      </footer>

    </div>
  );
}
