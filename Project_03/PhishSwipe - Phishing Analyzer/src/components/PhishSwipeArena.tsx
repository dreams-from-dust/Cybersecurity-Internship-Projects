/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  Award, 
  RefreshCw, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Eye, 
  AlertTriangle,
  Clock,
  Briefcase,
  HelpCircle,
  FileCode,
  Check,
  TrendingUp,
  Award as TrophyIcon,
  Sparkles,
  ChevronLeft,
  Terminal,
  Search
} from "lucide-react";
import { generateRandomTriageCase } from "../data/templates";
import { TriageEvent } from "../types";

interface PhishSwipeArenaProps {
  onTriageActionCompleted: (choice: "Safe" | "Suspicious" | "Malicious") => void;
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  maxStreak: number;
  setMaxStreak: React.Dispatch<React.SetStateAction<number>>;
}

export default function PhishSwipeArena({ 
  onTriageActionCompleted,
  streak,
  setStreak,
  maxStreak,
  setMaxStreak
}: PhishSwipeArenaProps) {
  
  // Load persistent level index (default to 1, max is 1000)
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    const saved = localStorage.getItem("phishswiipe_career_level_v2");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed >= 1 && parsed <= 1000) return parsed;
    }
    return 1;
  });

  const [correctAnswers, setCorrectAnswers] = useState<number>(() => {
    const saved = localStorage.getItem("phishswiipe_correct_answers_v2");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [totalEvaluated, setTotalEvaluated] = useState<number>(() => {
    const saved = localStorage.getItem("phishswiipe_total_evaluated_v2");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Current procedural alert state based on level
  const [currentCase, setCurrentCase] = useState<TriageEvent>(() => 
    generateRandomTriageCase(currentLevel)
  );

  // Interaction and diagnostic states
  const [selectedChoice, setSelectedChoice] = useState<"Safe" | "Suspicious" | "Malicious" | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState<boolean | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [examinedHeaders, setExaminedHeaders] = useState<boolean>(false);
  
  // Specific level jump helper state
  const [customLevelInput, setCustomLevelInput] = useState("");
  const [levelJumpError, setLevelJumpError] = useState("");

  // Keep list of session campaign history log records
  const [triageHistory, setTriageHistory] = useState<Array<{ 
    levelNum: number;
    subject: string; 
    choice: string; 
    correctChoice: string; 
    isCorrect: boolean 
  }>>([]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("phishswiipe_career_level_v2", currentLevel.toString());
  }, [currentLevel]);

  useEffect(() => {
    localStorage.setItem("phishswiipe_correct_answers_v2", correctAnswers.toString());
  }, [correctAnswers]);

  useEffect(() => {
    localStorage.setItem("phishswiipe_total_evaluated_v2", totalEvaluated.toString());
  }, [totalEvaluated]);

  // Synchronously update the scenario when level shifts
  useEffect(() => {
    setCurrentCase(generateRandomTriageCase(currentLevel));
    setSelectedChoice(null);
    setShowFeedback(false);
    setIsCorrectFeedback(null);
    setShowTechnicalDetails(false);
    setExaminedHeaders(false);
  }, [currentLevel]);

  // Acoustic triggers using Web Audio API
  const playSfxTone = (type: "correct" | "incorrect" | "click" | "levelUp") => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "correct") {
        // Joyful ascending secure notes (E5 -> G5 -> C6)
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.16);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "incorrect") {
        // Flat warning buzz
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.25);
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "levelUp") {
        // Triumphant double octave chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.12);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("SFX failed: ", e);
    }
  };

  // Process user triage action
  const handleTriageAction = (chosenAction: "Safe" | "Suspicious" | "Malicious") => {
    if (showFeedback) return;
    playSfxTone("click");
    setSelectedChoice(chosenAction);

    const isCorrect = (chosenAction === currentCase.correctAction);
    setIsCorrectFeedback(isCorrect);
    setShowFeedback(true);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) {
          setMaxStreak(next);
        }
        return next;
      });
      playSfxTone("correct");
    } else {
      setStreak(0);
      playSfxTone("incorrect");
    }

    setTotalEvaluated(prev => prev + 1);
    onTriageActionCompleted(chosenAction);

    // Add to session history list
    setTriageHistory(prev => [
      {
        levelNum: currentLevel,
        subject: currentCase.subject,
        choice: chosenAction,
        correctChoice: currentCase.correctAction,
        isCorrect
      },
      ...prev
    ]);

    // Automatically align and scroll the feedback section into view so the user doesn't have to scroll up
    setTimeout(() => {
      document.getElementById("triage-card-envelope-spot")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  // Move to next case
  const loadNextCase = () => {
    playSfxTone("click");
    if (isCorrectFeedback) {
      // Correct! Operator climbs up to the next procedural step
      const nextLvl = currentLevel + 1;
      if (nextLvl > 1000) {
        playSfxTone("levelUp");
        alert("Outstanding Achievement! You have successfully completed all 1,000 corporate threat simulation cases. Resets will start from Stage I.");
        setCurrentLevel(1);
      } else {
        // Play level progression chime if index shifts stage boundary
        if (nextLvl === 251 || nextLvl === 501 || nextLvl === 751) {
          playSfxTone("levelUp");
        }
        setCurrentLevel(nextLvl);
      }
    } else {
      // For incorrect decisions, operator stays on current level to figure it out and retry
      setCurrentCase(generateRandomTriageCase(currentLevel));
      setSelectedChoice(null);
      setShowFeedback(false);
      setIsCorrectFeedback(null);
      setShowTechnicalDetails(false);
      setExaminedHeaders(false);
    }
  };

  // Jump operator directly to an explicit target level
  const handleLevelJump = (e: React.FormEvent) => {
    e.preventDefault();
    setLevelJumpError("");
    const parsed = parseInt(customLevelInput.trim(), 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 1000) {
      setLevelJumpError("Enter values from 1 to 1000");
      return;
    }
    setCurrentLevel(parsed);
    setCustomLevelInput("");
    playSfxTone("click");
  };

  const skipCurrentLevel = () => {
    playSfxTone("click");
    const nextLvl = Math.min(1000, currentLevel + 1);
    setCurrentLevel(nextLvl);
  };

  const resetAllStatistics = () => {
    if (window.confirm("Verify: This will wipe your career logs and restore you to Level 1. Proceed?")) {
      playSfxTone("restart" as any);
      setCurrentLevel(1);
      setCorrectAnswers(0);
      setTotalEvaluated(0);
      setStreak(0);
      setMaxStreak(0);
      setSelectedChoice(null);
      setShowFeedback(false);
      setIsCorrectFeedback(null);
      setShowTechnicalDetails(false);
      setExaminedHeaders(false);
      setTriageHistory([]);
      localStorage.removeItem("phishswiipe_career_level_v2");
      localStorage.removeItem("phishswiipe_correct_answers_v2");
      localStorage.removeItem("phishswiipe_total_evaluated_v2");
    }
  };

  // Derive stage and badge details dynamically based on active streak milestones
  let currentStageTitle = "Stage I: Brand Mimicry & Spoofing";
  let stageDescription = "Detect lookalike domain typo-squats, false invoice statements, and SPF/DMARC signature flags.";
  let rankLabel = "Novice Threat Analyst";
  let rankColorHex = "text-blue-400 bg-blue-500/10 border-blue-500/25";
  let stageProgressPercent = 0;

  if (streak >= 15) {
    currentStageTitle = "Stage IV: Advanced Red-Team Threat Drills";
    stageDescription = "Deconstruct high-level social engineering patterns, unverified .zip subdomains, and cloud MFA hijack scripts.";
    rankLabel = "Elite Defense Champion";
    rankColorHex = "text-purple-400 bg-purple-500/10 border-purple-500/25";
    stageProgressPercent = 100;
  } else if (streak >= 10) {
    currentStageTitle = "Stage III: Workstation & IT Integrity Alerts";
    stageDescription = "Isolate malicious code download payloads, benchmark test attachments, and helpdesk bypass tricks.";
    rankLabel = "SOC Cyber Commander";
    rankColorHex = "text-amber-400 bg-amber-500/10 border-amber-500/25";
    stageProgressPercent = Math.min(100, Math.max(0, ((streak - 10) / 5) * 100));
  } else if (streak >= 5) {
    currentStageTitle = "Stage II: Whaling & Authority Mimicry";
    stageDescription = "Audit urgent email statements from high-level executives requesting out-of-band wire payments.";
    rankLabel = "Senior Security Architect";
    rankColorHex = "text-cyan-400 bg-cyan-500/10 border-cyan-500/25";
    stageProgressPercent = Math.min(100, Math.max(0, ((streak - 5) / 5) * 100));
  } else {
    currentStageTitle = "Stage I: Brand Mimicry & Spoofing";
    stageDescription = "Detect lookalike domain typo-squats, false invoice statements, and SPF/DMARC signature flags.";
    rankLabel = "Novice Threat Analyst";
    rankColorHex = "text-blue-400 bg-blue-500/10 border-blue-500/25";
    stageProgressPercent = Math.min(100, Math.max(0, (streak / 5) * 100));
  }

  // Calculate career score
  const computedXp = (correctAnswers * 140) + (streak * 40);

  return (
    <div id="phish-swipe-game-root" className="space-y-6">
      
      {/* Simulation Master Header Terminal Description Card */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Decorative backdrop mesh indicators */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none" />

        <div className="space-y-2 text-left max-w-2xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
              Procedural Challenging Terminal Active
            </span>
            <span className="text-slate-500 text-[10px] uppercase font-mono">&bull;</span>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
              STATION CERTIFICATE PASSED
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Tactical Compliance Simulation Campaign Arena</span>
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans font-medium">
            Step up through endless hand-tailored, procedural security-incident vectors. Examine headers, check sender domain authentication, identify rogue attachments, and flag threats. Solve correctly to clear threat stages.
          </p>
        </div>

        {/* Global Level Control Bar widget */}
        <div className="shrink-0 flex flex-col sm:flex-row xl:flex-col items-stretch sm:items-center xl:items-end gap-3 justify-between bg-slate-950/60 p-4 border border-white/5 rounded-xl">
          <div className="text-left sm:text-right">
            <span className="text-[9px] font-mono text-slate-550 block font-bold uppercase tracking-widest">
              CAREER STANDING
            </span>
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border mt-1 ${rankColorHex}`}>
              {rankLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg transition-all cursor-pointer"
              title={soundEnabled ? "Mute interface sound notifications" : "Unmute interface sound notifications"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-450" />}
            </button>
          </div>
        </div>
      </div>

      {/* Structured Progress Indicator Meter */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 font-mono">
          <span className="text-white">
            Campaign Milestone Progress <span className="text-slate-500 font-normal">(Streak: {streak})</span>
          </span>
          <span className="text-indigo-400 text-[10px] bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {currentStageTitle}
          </span>
        </div>

        {/* Visual progress bar bar */}
        <div className="h-2 bg-slate-950 rounded-full overflow-hidden flex" title={`${stageProgressPercent.toFixed(1)}% Completed`}>
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.max(1, stageProgressPercent)}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-500 font-sans mt-2 text-left">
          <strong>Active Tactical Task:</strong> {stageDescription}
        </p>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Envelope Panel Workspace */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          
          <div id="triage-card-envelope-spot" className="bg-white border border-gray-250 rounded-3xl p-6 md:p-8 shadow-sm flex-grow flex flex-col justify-between relative min-h-[390px] transition-all scroll-mt-6">
            
            <AnimatePresence mode="wait">
              {!showFeedback ? (
                <motion.div 
                  key="incident-envelope"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 flex-grow flex flex-col justify-between"
                >
                  <div>
                    {/* Header Details Wrapper */}
                    <div className="border-b border-gray-150 pb-5 mb-5 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-slate-500">
                        <span className="bg-slate-50 border border-gray-200 px-3 py-1 rounded-lg font-bold">
                          REGISTRY ID: {currentCase.id.toUpperCase()}
                        </span>
                        
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span>{currentCase.title}</span>
                        </div>
                      </div>

                      {/* Decoupled Sender Credentials Card */}
                      <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 text-left font-sans text-sm text-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="truncate max-w-full">
                            <span className="text-slate-450 font-bold uppercase tracking-wider text-[10px] block font-mono mb-0.5">
                              Declared Sender:
                            </span>
                            <span className="font-bold text-slate-900 text-sm block truncate">
                              {currentCase.sender}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 mt-3 sm:mt-0 font-mono text-[10px] font-bold">
                            <span className={`px-2.5 py-1 rounded-lg border ${currentCase.headers.spf === "Pass" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-red-50 text-red-850 border-red-150"}`}>
                              SPF: {currentCase.headers.spf}
                            </span>
                            <span className={`px-2.5 py-1 rounded-lg border ${currentCase.headers.dkim === "Pass" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-red-50 text-red-850 border-red-150"}`}>
                              DKIM: {currentCase.headers.dkim}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email Subject & Body content check */}
                    <div className="text-left space-y-3">
                      <span className="text-slate-450 font-bold uppercase tracking-wider text-[10px] block font-mono">
                        Subject Line Reference:
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                        {currentCase.subject}
                      </h3>
                      
                      <div className="mt-4 p-5 rounded-2xl border border-gray-150 bg-gray-50/70 text-slate-800 text-[14px] sm:text-[15px] leading-relaxed select-text min-h-[140px] max-h-[190px] overflow-y-auto whitespace-pre-wrap font-sans font-medium text-left">
                        {currentCase.body}
                      </div>
                    </div>
                  </div>

                  {/* Header examination drawer trigger */}
                  <div className="pt-4 border-t border-gray-100 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-sans font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Review DKIM tags and return-path credentials carefully.</span>
                    </div>

                    <button 
                      onClick={() => {
                        playSfxTone("click");
                        setShowTechnicalDetails(!showTechnicalDetails);
                        setExaminedHeaders(true);
                      }}
                      className="text-slate-700 hover:text-slate-950 font-black border-b-2 border-slate-300 hover:border-slate-800 transition-colors uppercase font-mono text-[10px] cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showTechnicalDetails ? "Minimize" : "Audit"} Envelope Heuristics</span>
                    </button>
                  </div>

                  {showTechnicalDetails && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl text-left border border-white/5 space-y-1.5 shadow-inner"
                    >
                      <div className="text-slate-500 uppercase font-bold text-[9px] mb-1 tracking-wider border-b border-white/5 pb-1 flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-emerald-400" />
                        <span>Cryptographic Diagnostic Output</span>
                      </div>
                      <div>&gt; SMTP INGRESS PROBE: {currentCase.headers.from}</div>
                      <div>&gt; SMTP RETURN_PATH ROUTE: {currentCase.headers.returnPath}</div>
                      <div>&gt; AUTH DOMAIN ALIGNMENT DMARC: {currentCase.headers.dmarc}</div>
                      <div className="text-slate-350 pr-2 pt-1">&gt; INSPECTOR REPORT: {currentCase.details}</div>
                    </motion.div>
                  )}

                </motion.div>
              ) : (
                /* Interactive Feedback Panel */
                <motion.div 
                  key="incident-results"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-left h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4 pb-5 border-b border-gray-150">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${
                        isCorrectFeedback ? "bg-emerald-50 text-emerald-700 border-emerald-150 shadow-sm" : "bg-red-50 text-red-700 border-red-150 animate-pulse"
                      }`}>
                        {isCorrectFeedback ? (
                          <ShieldCheck className="w-8 h-8 text-emerald-600" />
                        ) : (
                          <ShieldAlert className="w-8 h-8 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                          {isCorrectFeedback ? "Analysis Confirmed Correct!" : "Warning: Mismeasured Audit Verdict!"}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 font-sans">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono font-bold text-slate-700 border border-slate-200">
                            You Declared: <span className="uppercase font-black text-slate-950">{selectedChoice}</span>
                          </span>
                          <span className="text-slate-300 font-bold">|</span>
                          <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-150 rounded text-[10px] font-mono font-bold text-emerald-800">
                            Actual Compliance Status: <span className="uppercase font-black text-emerald-950">{currentCase.correctAction}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                        Forensic Explanation & Remediation:
                      </span>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-gray-200 text-[13px] sm:text-sm text-slate-700 leading-relaxed font-sans font-medium text-left">
                        {currentCase.explanation}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={loadNextCase}
                      className="flex-1 py-4 bg-slate-900 hover:bg-slate-950 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>{isCorrectFeedback ? "Advance to Next Level" : "Try Current Level Again"}</span>
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </button>
                    {!isCorrectFeedback && (
                      <button
                        onClick={skipCurrentLevel}
                        className="py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer border border-slate-300"
                        title="Skip this level step (Break streak but keep moving)"
                      >
                        Skip Level
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Large compliance option buttons */}
          {!showFeedback && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4" id="triage-action-controls">
              <button
                onClick={() => handleTriageAction("Safe")}
                className="py-4 px-6 font-black text-xs uppercase tracking-widest rounded-xl border border-gray-200 bg-white text-slate-800 hover:bg-slate-50 transition-all cursor-pointer shadow-sm hover:border-gray-300 active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Declare Safe</span>
              </button>
              
              <button
                onClick={() => handleTriageAction("Suspicious")}
                className="py-4 px-6 font-black text-xs uppercase tracking-widest rounded-xl border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-all cursor-pointer shadow-sm active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Flag Suspicious</span>
              </button>
              
              <button
                onClick={() => handleTriageAction("Malicious")}
                className="py-4 px-6 font-black text-xs uppercase tracking-widest rounded-xl border border-slate-900 bg-slate-900 text-white hover:bg-slate-950 transition-all cursor-pointer shadow-md active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Quarantine Threat</span>
              </button>
            </div>
          )}

        </div>

        {/* Right Sidebar Guidelines & Statistics */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4 text-left">
          
          {/* Diagnostic Indicators Panel */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
              Auditor Desk Guidelines
            </span>

            <h4 className="text-base font-bold text-slate-900">
              Evaluating the Indicators
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify compliance parameters before finalizing operational verdicts:
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-3 leading-snug">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="space-y-0.5">
                  <strong className="text-xs font-bold text-slate-800">SPF/DKIM Keys</strong>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Check pass logs. If SPF fails while claiming official brand addresses, block it.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 leading-snug">
                <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="space-y-0.5">
                  <strong className="text-xs font-bold text-slate-800">Procedural Bypasses</strong>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Be cautious of internal supervisors demanding out of band wire modifications.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 leading-snug">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="space-y-0.5">
                  <strong className="text-xs font-bold text-slate-800">Check Domains</strong>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Look closely at unverified domains with high danger extensions like zip or CC.
                  </p>
                </div>
              </div>
            </div>

            {!examinedHeaders && !showFeedback && (
              <div className="p-3 bg-amber-50 text-[11px] text-amber-800 rounded-lg flex gap-2 border border-amber-100">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Always check DKIM/SPF signatures inside the diagnostic drawer.</span>
              </div>
            )}
          </div>

          {/* Session Statistics Overview with Career XP Progression */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 font-mono block">
              Audit Operations Dashboard
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">Accuracy Metric</span>
                <strong className="text-xl font-mono text-white mt-1 block">
                  {totalEvaluated > 0 ? Math.round((correctAnswers / totalEvaluated) * 100) : 0}%
                </strong>
                <span className="text-[9px] text-slate-450 block pt-0.5">{correctAnswers} of {totalEvaluated} OK</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                <span className="text-[10px] text-slate-450 block uppercase font-mono font-bold">Current Streak</span>
                <strong className="text-xl font-mono text-emerald-400 mt-1 block">
                  {streak}
                </strong>
                <span className="text-[9px] text-slate-450 block pt-0.5">Peak Streak: {maxStreak}</span>
              </div>
            </div>

            {/* Custom Interactive Career Score Badge */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-450 block uppercase font-mono font-bold">Computed Session score</span>
                <span className="text-emerald-400 text-sm font-mono font-bold mt-1 block">
                  {computedXp.toLocaleString()} Points
                </span>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>

            <button
              onClick={resetAllStatistics}
              className="w-full py-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Career Metrics</span>
            </button>
          </div>

      
        </div>

      </div>

    </div>
  );
}
