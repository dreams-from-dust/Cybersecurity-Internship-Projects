/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Play, 
  FileText, 
  HelpCircle, 
  AlertCircle, 
  Terminal, 
  Clipboard, 
  CheckCircle, 
  ShieldCheck, 
  Globe, 
  Search,
  Eye,
  Info,
  ChevronRight,
  Shield,
  ThumbsUp,
  Fingerprint,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Check,
  Undo,
  BookOpen,
  RotateCcw
} from "lucide-react";
import { parseCustomText } from "../phishingEngine";
import { PhishingCase, ScannedPhraseHighlight, ScanResult } from "../types";
import { generateRandomTriageCase } from "../data/templates";

export default function RealThreatScanner() {
  // Mode switch: "sandbox" for threat dissection, "paste" for paste check, "url" for Link Auditor
  const [panelMode, setPanelMode] = useState<"sandbox" | "paste" | "url">("sandbox");

  // State to simulate play audio
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dynamic sandbox state - starts with a procedurally generated threat case
  const [sandboxCase, setSandboxCase] = useState<ScanResult>(() => {
    const sample = generateRandomTriageCase(1);
    const text = `From: ${sample.sender}\nSubject: ${sample.subject}\n\n${sample.body}\n\nSecurity Audit Route: ${sample.details}`;
    return parseCustomText(text);
  });

  const [activeHighlight, setActiveHighlight] = useState<ScannedPhraseHighlight | null>(() => {
    if (sandboxCase.highlights.length > 0) {
      return sandboxCase.highlights[0];
    }
    return null;
  });

  // Pasted Text Sandbox states
  const [inputText, setInputText] = useState("");
  const [pasteResult, setPasteResult] = useState<ScanResult | null>(null);
  const [activePasteHighlight, setActivePasteHighlight] = useState<ScannedPhraseHighlight | null>(null);

  // Live Lookalike Domain Auditor states
  const [inspectUrl, setInspectUrl] = useState("");
  const [urlReport, setUrlReport] = useState<{
    score: number;
    issues: string[];
    isSafe: boolean;
    explanation: string;
  } | null>(null);

  // Automated centering/scrolling helper to bring results panel into view on small displays
  const scrollInspectorIntoViewIfMobile = () => {
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById("active-sandbox-inspector-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  };

  const handleSelectHighlightAndScroll = (hl: ScannedPhraseHighlight) => {
    setActiveHighlight(hl);
    scrollInspectorIntoViewIfMobile();
  };

  const handleSelectPasteHighlightAndScroll = (hl: ScannedPhraseHighlight) => {
    setActivePasteHighlight(hl);
    scrollInspectorIntoViewIfMobile();
  };

  // Sound effect triggers using Web Audio API
  const playSfxTone = (type: "click" | "success" | "warning") => {
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
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } else if (type === "success") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === "warning") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Generates a brand-new threat case on the fly inside the sandbox module
  const handleSynthesizeNewThreat = () => {
    playSfxTone("click");
    const freshSample = generateRandomTriageCase(Math.floor(Math.random() * 500) + 1);
    const fullText = `From: ${freshSample.sender}\nSubject: ${freshSample.subject}\n\n${freshSample.body}\n\nAudit Trace Logs: ${freshSample.details}`;
    
    // Parse using the 100% real heuristic rules engine to isolate actual threats
    const result = parseCustomText(fullText);
    setSandboxCase(result);
    if (result.highlights.length > 0) {
      setActiveHighlight(result.highlights[0]);
    } else {
      setActiveHighlight(null);
    }
  };

  const handleCustomPasteScan = () => {
    if (!inputText.trim()) return;
    playSfxTone("click");
    const result = parseCustomText(inputText);
    setPasteResult(result);
    if (result.highlights.length > 0) {
      setActivePasteHighlight(result.highlights[0]);
      playSfxTone("warning");
    } else {
      setActivePasteHighlight(null);
      playSfxTone("success");
    }
  };

  // Perform algorithmic lookalike domain audits
  const runDomainAudit = () => {
    if (!inspectUrl.trim()) return;
    playSfxTone("click");
    let url = inspectUrl.trim().toLowerCase();
    
    // Strip protocol and pathway directories
    url = url.replace(/^(https?:\/\/)?(www\.)?/, "");
    url = url.split("/")[0];

    const issues: string[] = [];
    let score = 5; // Base clean status

    // 1. Homoglyphs & Numeric Substitutions
    const swaps = [
      { trigger: "goog1e", desc: "Detected character swap 'goog1e' mimicking brand Google." },
      { trigger: "g00g1e", desc: "Detected visual lookalike replace 'g00g1e'." },
      { trigger: "g00gle", desc: "Detected substitution 'g00gle' replacing letter O with zeroes." },
      { trigger: "micros0ft", desc: "Detected credential harvester 'micros0ft' mimicking Microsoft." },
      { trigger: "micr0soft", desc: "Detected typosquatted numeric domain 'micr0soft' (zero substituted)." },
      { trigger: "paypa1", desc: "Detected lookalike visual swap 'paypa1' mimicking transaction routes." },
      { trigger: "paypaI", desc: "Detected visual spoof (capital I substituted for lowercase l)." },
      { trigger: "netf1ix", desc: "Detected character replacement 'netf1ix' with number 1." },
      { trigger: "arnazon", desc: "Detected look-alike r-n letter combination 'arnazon' mimicking m." }
    ];

    swaps.forEach(item => {
      if (url.includes(item.trigger)) {
        issues.push(item.desc);
        score += 50;
      }
    });

    // 2. Subdomain multi-tier routings (Combo-squatting)
    const segments = url.split(".");
    if (segments.length > 3) {
      issues.push("Multi-Layer Routing: Excessive subdomains are structured to hide the real parent root.");
      score += 20;
    }

    // 3. Brand spams inside suspicious domains
    const brandSpams = ["login", "secure", "verification", "signin", "verify", "portal", "invoice", "mfa", "accounts", "billing"];
    const foundSpams: string[] = [];
    
    brandSpams.forEach(kw => {
      if (url.includes(kw)) {
        foundSpams.push(kw);
        score += 15;
      }
    });

    if (foundSpams.length > 0) {
      issues.push(`Access-bait terms matched: [ ${foundSpams.join(", ")} ] inside unverified domain namespaces.`);
    }

    // 4. Excessive hyphens
    const hyphens = (url.match(/-/g) || []).length;
    if (hyphens >= 2) {
      issues.push("Excessive Hyphens: Threat hosts merge official brand keys with fake security tokens to bypass audits.");
      score += 15;
    }

    // 5. High Danger top level extensions
    const criticalTlds = [".zip", ".xyz", ".info", ".top", ".work", ".click", ".support", ".gq", ".cf", ".tk"];
    criticalTlds.forEach(tld => {
      if (url.endsWith(tld)) {
        issues.push(`Risky Suffix: Resolved to high-risk unauthenticated top level namespace (${tld}).`);
        score += 15;
      }
    });

    const isSafe = score < 25;
    let explanation = "Domain Resolved Clean. No suspicious homoglyphs or brand spoof indicators recognized on this namespace. Still verify Return-Paths out-of-band.";
    
    if (score >= 65) {
      explanation = "CRITICAL IMPERSONATION DETECTED. High probability lookup spoofing identified. This address utilizes tricky visual character swaps to harvest passwords.";
    } else if (score >= 25) {
      explanation = "WARNING: UNTRUSTWORTHY ENDPOINT. Unofficial portal combining authorized names with alternative extensions. Do not submit corporate details.";
    }

    setUrlReport({
      score: Math.min(score, 99),
      issues,
      isSafe,
      explanation
    });

    if (score >= 25) {
      playSfxTone("warning");
    } else {
      playSfxTone("success");
    }
  };

  // Reset / Clear commands to start audits afresh
  const handleClearPasteInstance = () => {
    playSfxTone("click");
    setInputText("");
    setPasteResult(null);
    setActivePasteHighlight(null);
  };

  const handleClearUrlInstance = () => {
    playSfxTone("click");
    setInspectUrl("");
    setUrlReport(null);
  };

  const renderSnippetHighlights = (
    text: string, 
    highlights: ScannedPhraseHighlight[], 
    activeHL: ScannedPhraseHighlight | null,
    onSelectHL: (hl: ScannedPhraseHighlight) => void
  ) => {
    if (highlights.length === 0) {
      return <p className="leading-relaxed whitespace-pre-wrap text-slate-800 font-sans text-base">{text}</p>;
    }

    const elements = [];
    let lastOffset = 0;

    // Sort linearly to avoid matching collision
    const sorted = [...highlights].sort((a, b) => a.startIndex - b.startIndex);

    sorted.forEach((hl, idx) => {
      const startIdx = text.toLowerCase().indexOf(hl.text.toLowerCase(), lastOffset);
      if (startIdx === -1) return;

      const endIdx = startIdx + hl.text.length;

      // Extract preceding safe text channel
      if (startIdx > lastOffset) {
        elements.push(
          <span key={`text-seq-${idx}`} className="text-slate-800 text-sm md:text-base leading-relaxed">
            {text.slice(lastOffset, startIdx)}
          </span>
        );
      }

      const active = activeHL?.id === hl.id;
      elements.push(
        <button
          key={`hl-${hl.id}-${idx}`}
          onClick={() => onSelectHL(hl)}
          className={`mx-1 px-2 py-0.5 rounded-md font-mono text-xs md:text-sm font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
            active 
              ? "bg-[#090D1A] text-white shadow-sm ring-2 ring-emerald-400"
              : "bg-amber-100 text-amber-900 border-b-2 border-dashed border-amber-500 hover:bg-slate-900 hover:text-white"
          }`}
          title={`Tactic: ${hl.tactic}`}
        >
          <Fingerprint className="w-3.5 h-3.5 text-current shrink-0" />
          <span>{text.slice(startIdx, endIdx)}</span>
        </button>
      );

      lastOffset = endIdx;
    });

    if (lastOffset < text.length) {
      elements.push(
        <span key="text-trailing" className="text-slate-800 text-sm md:text-base leading-relaxed font-medium">
          {text.slice(lastOffset)}
        </span>
      );
    }

    return <div className="leading-relaxed whitespace-pre-wrap font-sans text-sm md:text-base text-left">{elements}</div>;
  };

  return (
    <div id="heuristic-threat-scanner-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Column: Forensics Input Panel */}
      <div className="lg:col-span-8 flex flex-col justify-between space-y-5">
        
        {/* Module Sub-header Panel */}
        <div className="p-5 bg-white border border-gray-150 rounded-2xl shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase font-mono block">
              Forensic Intelligence Hub
            </span>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
              Technical Audit Sandbox
            </h3>
          </div>

          <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-xl border border-gray-200 shrink-1 select-none gap-1">
            <button
              onClick={() => setPanelMode("sandbox")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                panelMode === "sandbox" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              Synthesized Dissect Lab
            </button>
            <button
              onClick={() => {
                setPanelMode("paste");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                panelMode === "paste" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              Paste Check Sandbox
            </button>
            <button
              onClick={() => setPanelMode("url")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                panelMode === "url" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              Link Lookalike Auditor
            </button>
          </div>
        </div>

        {/* Dynamic Forms Frame */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm flex-grow flex flex-col justify-between min-h-[320px]">
          
          {/* Tab 1: SYNTHESIZED DISSECT LAB */}
          {panelMode === "sandbox" && (
            <div className="space-y-5 text-left w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-150">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Synthesize Raw Email & Trace Red Flags:
                </span>
                
                <button
                  onClick={handleSynthesizeNewThreat}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Generate a brand-new threat case with custom lookalike parameters"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Synthesize Raw Threat</span>
                </button>
              </div>

              <div className="p-5 bg-slate-50 border border-gray-200 rounded-xl relative shadow-inner">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-200 pb-3 mb-4">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-600" />
                    Threat Vector: {sandboxCase.detectedVector}
                  </span>
                  
                  <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded font-mono">
                    Heuristic Risk: {sandboxCase.riskScore}%
                  </span>
                </div>

                <div className="text-left font-sans select-text leading-relaxed">
                  {renderSnippetHighlights(
                    sandboxCase.scannedText, 
                    sandboxCase.highlights, 
                    activeHighlight, 
                    handleSelectHighlightAndScroll
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-1.5 border border-slate-950 text-left shadow-md">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#BAEC17] block font-bold">Heuristic Directive Recommendation:</span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{sandboxCase.recommendation}</p>
              </div>
            </div>
          )}

          {/* Tab 2: PASTE CHECK SANDBOX */}
          {panelMode === "paste" && (
            <div className="space-y-5 text-left w-full flex-grow flex flex-col justify-between">
              <div className="space-y-3">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono block">
                    Copy & Paste Communications For Forensic Scan:
                  </span>
                  
                  {inputText && (
                    <button
                      onClick={handleClearPasteInstance}
                      className="text-xs font-bold text-slate-550 hover:text-red-650 flex items-center gap-1 transition-all cursor-pointer font-sans"
                      title="Clear text inputs and remove active findings"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Sandbox</span>
                    </button>
                  )}
                </div>

                <textarea
                  placeholder="Paste billing emails, strange messages or target headers to test and dissect visual tricks, numeric typos and threat terms..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-250 rounded-2xl p-4 text-slate-800 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-400 h-[120px] resize-none text-left"
                />
                
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleCustomPasteScan}
                    disabled={!inputText.trim()}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-950 text-white border border-slate-950 text-xs uppercase font-black tracking-widest rounded-xl cursor-pointer disabled:opacity-45 disabled:pointer-events-none flex items-center gap-2 transition-all active:scale-[0.99] shadow-sm"
                  >
                    <Play className="w-4 h-4 text-[#BAEC17]" />
                    <span>Analyze Content</span>
                  </button>
                </div>
              </div>

              {/* FORENSIC REPORT CONTAINER & ACTION RESET CONTROLS */}
              {pasteResult ? (
                <div className="mt-4 p-5 bg-slate-50 border border-gray-200 rounded-2xl space-y-5 shadow-inner">
                  
                  {/* Gauge Risk Rating Header Block */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                    <span className="text-xs font-mono font-bold text-slate-600">
                      Dissection Diagnostic Vector: <strong className="text-slate-900 uppercase">{pasteResult.detectedVector}</strong>
                    </span>
                    
                    {/* Graphical classification slider badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">HAZARD INDEX:</span>
                      <div className="w-32 h-2.5 bg-gray-200 rounded-full relative overflow-hidden inline-block shrink-0">
                        <div 
                          className={`h-full ${pasteResult.riskScore > 60 ? 'bg-rose-500' : pasteResult.riskScore > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pasteResult.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-black text-rose-800 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                        {pasteResult.riskScore}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Automatic In-depth Explanation of Findings */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">REPORT FINDINGS AUTOMATED EXPLANATION:</span>
                    <p className="text-slate-800 text-sm leading-relaxed font-sans text-left font-medium">
                      {pasteResult.highlights.length > 0 
                        ? `Technical analysis isolated ${pasteResult.highlights.length} distinct compliance risks within the pasted communication payload. Character anomalies, pressurized invoicing terms, or lookalike patterns are highlighted below. Click on any colored term within the panel to evaluate the exact defense methodology.`
                        : "No recognizable email signature, numeric homoglyph, or pressure words were matched by our active heuristic rules. This transmission resolves safely, though staff should continue standard out-of-band verification protocols."
                      }
                    </p>
                  </div>
                  
                  {/* Visual Render Grid block */}
                  <div className="text-left text-sm md:text-base text-slate-800 leading-relaxed font-sans p-4 bg-white border border-gray-150 rounded-xl">
                    {renderSnippetHighlights(
                      pasteResult.scannedText, 
                      pasteResult.highlights, 
                      activePasteHighlight, 
                      handleSelectPasteHighlightAndScroll
                    )}
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-xl text-xs sm:text-sm text-left border border-slate-950">
                    <strong className="text-emerald-400 font-bold block mb-1 uppercase tracking-wider font-mono text-[10px]">Technical Mitigation Steps:</strong>
                    {pasteResult.recommendation}
                  </div>

                  {/* Operational Restart buttons */}
                  <div className="flex justify-end gap-2 pt-1">
                    <button 
                      onClick={handleClearPasteInstance}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Start New Analysis</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-gray-200 text-center text-xs font-mono text-slate-400">
                  Awaiting threat raw payload. Paste any email headers or text inside the sandbox above to trigger automatic interactive forensics reports.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: LINK LOOKALIKE AUDITOR */}
          {panelMode === "url" && (
            <div className="space-y-5 text-left w-full flex-grow flex flex-col justify-between">
              <div className="space-y-3">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono block">
                    Inspect Suspicious Links For Visually Spoofed Characters:
                  </span>
                  
                  {inspectUrl && (
                    <button
                      onClick={handleClearUrlInstance}
                      className="text-xs font-bold text-slate-550 hover:text-red-650 flex items-center gap-1 transition-all cursor-pointer font-sans"
                      title="Clear domain input and remove audit findings"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Auditor</span>
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="e.g. micros0ft.com, netf1ix-billing.zip, paypaI-login.cc"
                    value={inspectUrl}
                    onChange={(e) => setInspectUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") runDomainAudit(); }}
                    className="flex-1 bg-slate-50 border border-gray-250 rounded-2xl px-4 py-3 text-sm font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-left"
                  />
                  <button
                    onClick={runDomainAudit}
                    disabled={!inspectUrl.trim()}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-950 text-white font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer disabled:opacity-35 transition-all select-none shadow-sm"
                  >
                    Audit Link
                  </button>
                </div>
              </div>

              {/* URL EXPLANATION OF FINDINGS & GAUGE RATING PORTAL */}
              {urlReport ? (
                <div className="mt-4 p-5 bg-slate-50 border border-gray-200 rounded-2xl space-y-4 shadow-inner">
                  
                  {/* Dynamic Risk Rating Gauge */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 pb-2.5">
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase">DOMAIN INTEL REPORT</span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">RISK INDEX:</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full relative overflow-hidden inline-block text-left">
                        <div 
                          className={`h-full ${urlReport.score > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${urlReport.score}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-mono font-bold ${urlReport.isSafe ? 'text-emerald-700 bg-emerald-50' : 'text-red-750 bg-red-50'} border px-2 py-0.5 rounded`}>
                        {urlReport.score}% Risk Score
                      </span>
                    </div>
                  </div>

                  {/* Explanation of findings block */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 block">AUTOMATIC FORENSIC CRITIQUE:</span>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed font-sans text-left">
                      {urlReport.explanation}
                    </p>
                  </div>

                  {urlReport.issues.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      <span className="text-[10px] font-mono font-bold text-slate-550 uppercase block">Isolated Threat Indicators Matched:</span>
                      <div className="space-y-1.5">
                        {urlReport.issues.map((i, idx) => (
                          <div key={idx} className="flex gap-2 items-start text-xs font-sans text-slate-700 leading-relaxed">
                            <Check className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5 font-bold" />
                            <span>{i}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-450 italic text-left pt-1">
                      No character abnormalities, sub-domain spikes, or typosquats observed on this keyword string.
                    </div>
                  )}

                  {/* Restart & Clear button controls for URL Audit */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                    <button 
                      onClick={handleClearUrlInstance}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Test Another Link</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-gray-250 text-center text-xs font-mono text-slate-400">
                  Input any suspected URL string above (like micros0ft-sync.cc) to execute character dissection audits.
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Right Column: Interactive Diagnostic Inspector */}
      <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
        
        {/* Active Red Flag Inspector Panel */}
        <div id="active-sandbox-inspector-card" className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-md space-y-4 text-left scroll-mt-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400 font-mono block">
              Sandbox Inspector
            </span>
          </div>

          <h4 className="text-base font-bold uppercase text-white tracking-widest font-mono border-b border-white/10 pb-2">
            Heuristic Dissection
          </h4>

          {/* Render the details of selected red flag element dynamically */}
          {panelMode === "sandbox" && activeHighlight ? (
            <div className="space-y-4 font-sans animate-slide-up">
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Incident Flag Category</span>
                <span className="text-xs md:text-sm font-semibold text-amber-300">{activeHighlight.redFlagType}</span>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Exploit Tactic</span>
                <span className="text-xs font-mono font-medium text-slate-200">{activeHighlight.tactic}</span>
              </div>

              <div className="p-4 bg-white/10 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
                {activeHighlight.explanation}
              </div>
            </div>
          ) : panelMode === "paste" && activePasteHighlight ? (
            <div className="space-y-4 font-sans animate-slide-up">
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Pasted Detection Signature</span>
                <span className="text-xs md:text-sm font-semibold text-[#BAEC17]">{activePasteHighlight.redFlagType}</span>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Tactic Identified</span>
                <span className="text-xs font-mono font-medium text-slate-200">{activePasteHighlight.tactic}</span>
              </div>

              <div className="p-4 bg-white/10 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
                {activePasteHighlight.explanation}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white/5 rounded-xl border border-white/5 text-center text-xs font-mono text-slate-400">
              Click any highlighted visual marker within the scanning sandbox on the left to review its corresponding forensic profile.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
