/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScanResult, ScannedPhraseHighlight, ThreatVector } from "./types";

interface RuleConfig {
  id: string;
  pattern: RegExp;
  redFlagType: string;
  trigger: "Authority" | "Urgency" | "Curiosity" | "Fear/Greed" | "None";
  tactic: string;
  explanation: string;
  scoreContribution: number;
}

// Deep, comprehensive heuristic rules that capture real phishing patterns
const RULES: RuleConfig[] = [
  {
    id: "rule-wire",
    pattern: /\b(wire transfer|wire funds|bank transfer|financial authorization|payment request|transfer money|swift code)\b/gi,
    redFlagType: "Fake Transfer Request",
    trigger: "Fear/Greed",
    tactic: "CEO Impersonation",
    explanation: "This text requests an immediate financial transfer. Phishing attacks frequently pretend to be supervisors requesting bank transfers.",
    scoreContribution: 25
  },
  {
    id: "rule-urgency",
    pattern: /\b(immediate action|urgent|expire in 24 hrs|within thirty minutes|close of business|before 5 pm|at your earliest convenience|immediately|asap|do not delay)\b/gi,
    redFlagType: "Urgency Pressure",
    trigger: "Urgency",
    tactic: "Creating False Urgency",
    explanation: "High pressure deadlines are intended to make targets panic and bypass verified security procedures.",
    scoreContribution: 20
  },
  {
    id: "rule-bypass",
    pattern: /\b(bypass standard|bypass normal|confidential request|remain strictly confidential|do not discuss|internal guidelines recommend|avoid delay|skip verification)\b/gi,
    redFlagType: "Avoids Standard Steps",
    trigger: "Authority",
    tactic: "Bypassing Procedures",
    explanation: "Instructing employees to skip routine audits or verification queues is a critical signature of financial fraud.",
    scoreContribution: 25
  },
  {
    id: "rule-callback",
    pattern: /\b(call our fraud|call helpline|dial support|dial our support|speak with our security|call \+?[0-9-]{7,20}|helpline at \+?[0-9-]{7,20}|voice dispatch)\b/gi,
    redFlagType: "Fake Phone Number Callback",
    trigger: "Urgency",
    tactic: "Phone Support Scam",
    explanation: "Providing unverified callback hotlines bypasses corporate email scanners, drawing targets onto direct fraud phone calls.",
    scoreContribution: 20
  },
  {
    id: "rule-qr",
    pattern: /\b(scan the encrypted|scan the secure|scan corporate qr|unsolicited qr|authenticator push|mobile device scan|scan secure bar|qr code)\b/gi,
    redFlagType: "Suspicious QR Code",
    trigger: "Authority",
    tactic: "QR Code Scam",
    explanation: "QR codes hide web destinations from traditional firewalls, moving victims to insecure personal mobile devices.",
    scoreContribution: 20
  },
  {
    id: "rule-attachment",
    pattern: /\b(\w+\.iso|\w+\.js|\w+\.scr|\w+\.exe|\w+\.zip|\w+\.lse|\w+\.bat|\w+\.vbs)\b/gi,
    redFlagType: "Unusual Attachment",
    trigger: "Fear/Greed",
    tactic: "Dangerous File Type",
    explanation: "High risk file suffixes (ISO, EXE, ZIP, JS) can carry malicious code payloads that bypass automated document check tools.",
    scoreContribution: 25
  },
  {
    id: "rule-sensitive",
    pattern: /\b(credentials|password expired|password verification|mfa codes|key token|verify your accounts|tax allocations|social security|sso pin)\b/gi,
    redFlagType: "Demanding Secrets",
    trigger: "Authority",
    tactic: "Password Stealing",
    explanation: "Fraud alerts request passwords, PINs, or secondary tokens. Trustworthy companies never collect passwords over email.",
    scoreContribution: 25
  }
];

// Brand impersonation keyword checker
const POPULAR_BRANDS = [
  { name: "google", domains: ["google.com", "gmail.com", "googlemail.com"] },
  { name: "microsoft", domains: ["microsoft.com", "outlook.com", "office.com", "live.com"] },
  { name: "paypal", domains: ["paypal.com", "paypal-status.com"] },
  { name: "netflix", domains: ["netflix.com"] },
  { name: "amazon", domains: ["amazon.com", "aws.com"] },
  { name: "apple", domains: ["apple.com", "icloud.com"] },
  { name: "slack", domains: ["slack.com"] },
  { name: "zoom", domains: ["zoom.us"] }
];

export function parseCustomText(text: string): ScanResult {
  if (!text || text.trim().length === 0) {
    return {
      riskScore: 0,
      scannedText: "",
      detectedVector: "Suspected Phishing",
      highlights: [],
      recommendation: "Please input realistic email transmissions, links, or communication texts."
    };
  }

  const highlights: ScannedPhraseHighlight[] = [];
  let scoreTotal = 10; // Neutral baseline risk
  const normalizedText = text.toLowerCase();

  // 1. Scan for standard rule matching
  RULES.forEach((rule) => {
    let match;
    rule.pattern.lastIndex = 0;
    
    while ((match = rule.pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      
      if (!highlights.some(h => Math.abs(h.startIndex - start) < 4)) {
        highlights.push({
          id: `hl-${rule.id}-${start}`,
          startIndex: start,
          endIndex: end,
          text: match[0],
          redFlagType: rule.redFlagType,
          trigger: rule.trigger,
          tactic: rule.tactic,
          explanation: rule.explanation
        });
        
        scoreTotal += rule.scoreContribution;
      }
    }
  });

  // 2. Perform REAL algorithmic checks for lookalike domains or URLs in text
  // Extract URLs anywhere in the text
  const urlRegex = /([a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+)/gi;
  let urlMatch;
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    const matchedDomain = urlMatch[0].toLowerCase();
    
    // Skip common innocent text elements if they are not real domains
    if (matchedDomain.endsWith(".com") || matchedDomain.endsWith(".net") || matchedDomain.endsWith(".org") || matchedDomain.endsWith(".app") || matchedDomain.endsWith(".xyz") || matchedDomain.endsWith(".info")) {
      
      // Look for Brand Impersonations
      POPULAR_BRANDS.forEach((brand) => {
        if (matchedDomain.includes(brand.name)) {
          // Check if it's NOT an official domain
          const isOfficial = brand.domains.some(off => matchedDomain === off || matchedDomain.endsWith("." + off));
          if (!isOfficial) {
            const start = urlMatch.index;
            const end = start + urlMatch[0].length;
            
            if (!highlights.some(h => h.text === urlMatch[0])) {
              highlights.push({
                id: `hl-brand-mimic-${start}`,
                startIndex: start,
                endIndex: end,
                text: urlMatch[0],
                redFlagType: "Brand Impersonation Trick",
                trigger: "Authority",
                tactic: "Combosquatting / Typo Domain",
                explanation: `This address contains '${brand.name}' but resolves to an unauthorized host (${matchedDomain}). Scammers inject known brand names to buy false confidence.`
              });
              scoreTotal += 35;
            }
          }
        }
      });

      // Look for homoglyph numeric replacements
      if (/[013]/g.test(matchedDomain) && !highlights.some(h => h.text === urlMatch[0])) {
        const triggers = ["goog1e", "g00g1e", "g00gle", "micros0ft", "micr0soft", "paypa1", "paypaI"];
        const hasTrigger = triggers.some(t => matchedDomain.includes(t));
        
        if (hasTrigger) {
          const start = urlMatch.index;
          const end = start + urlMatch[0].length;
          highlights.push({
            id: `hl-homoglyph-${start}`,
            startIndex: start,
            endIndex: end,
            text: urlMatch[0],
            redFlagType: "Homoglyph Representation Fail",
            trigger: "Authority",
            tactic: "Visual Character Swapping",
            explanation: `Our forensic filters caught tricky number-to-letter character substitutions in "${matchedDomain}". Scammers swap '1' for 'l' or '0' for 'o' to disguise dangerous spoof sites.`
          });
          scoreTotal += 40;
        }
      }
    }
  }

  // 3. Assess threat risk level
  const finalScore = Math.min(Math.max(scoreTotal, 5), 99);

  // Set standard categorized Threat Vector based on characteristics found
  let detectedVector: ThreatVector | "Suspected Phishing" = "Suspected Phishing";
  if (highlights.some(h => h.tactic.includes("CEO") || h.tactic.includes("Bypass"))) {
    detectedVector = "Whaling";
  } else if (highlights.some(h => h.tactic.includes("Phone") || h.tactic.includes("Support"))) {
    detectedVector = "Vishing";
  } else if (highlights.some(h => h.tactic.includes("QR"))) {
    detectedVector = "Quishing";
  } else if (highlights.some(h => h.tactic.includes("Dangerous File") || h.tactic.includes("Attachment"))) {
    detectedVector = "Spear Phishing";
  } else if (highlights.some(h => h.tactic.includes("Visual Character") || h.tactic.includes("Combosquatting"))) {
    detectedVector = "SEO Poisoning";
  }

  // Ensure unique elements sorted linearly
  highlights.sort((a, b) => a.startIndex - b.startIndex);

  let recommendation = "Favorable. No critical threats or spoofed domains found. Crosscheck verification parameters out-of-band to ensure premium alignment.";
  if (finalScore >= 75) {
    recommendation = "CRITICAL PHISHING PATTERN. High risk cues spotted. Quarantine the message immediately, file a security event ticket, and restrict the sender address domain.";
  } else if (finalScore >= 35) {
    recommendation = "MODERATE DISCREPANCY. Unverified headers or high pressure signals matched. Conduct verbal authentication before entering passwords or authorizing funds.";
  }

  return {
    riskScore: finalScore,
    scannedText: text,
    detectedVector,
    highlights,
    recommendation
  };
}
