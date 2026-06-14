/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ThreatVector =
  | "Spear Phishing"
  | "Whaling"
  | "Smishing"
  | "Vishing"
  | "Quishing"
  | "SEO Poisoning"
  | "Clone Phishing"
  | "Angler Phishing"
  | "Business Email Compromise"
  | "Supply Chain Attack"
  | "Browser-in-Browser"
  | "Pretexting"
  | "Deepfake Social Engineering";

export interface RedFlagElement {
  id: string;
  targetText: string;
  type: string;
  psychologicalTrigger: "Authority" | "Urgency" | "Curiosity" | "Fear/Greed" | "None";
  technicalTactic: string;
  explanation: string;
}

export interface PhishingCase {
  id: string;
  title: string;
  senderName: string;
  senderAddress: string;
  subject: string;
  body: string;
  vector: ThreatVector;
  riskScore: number;
  headers: string;
  redFlags: RedFlagElement[];
  isPredefined: boolean;
}

export interface TriageEvent {
  id: string;
  title: string;
  sender: string;
  subject: string;
  body: string;
  headers: {
    from: string;
    spf: "Pass" | "Fail" | "None";
    dkim: "Pass" | "Fail" | "None";
    dmarc: "Pass" | "Fail" | "None";
    returnPath: string;
  };
  details: string;
  correctAction: "Safe" | "Suspicious" | "Malicious";
  explanation: string;
  vector?: ThreatVector;
  channel?: "Email" | "SMS" | "Social" | "Phone" | "Web";
}

export interface ScannedPhraseHighlight {
  id: string;
  startIndex: number;
  endIndex: number;
  text: string;
  redFlagType: string;
  trigger: "Authority" | "Urgency" | "Curiosity" | "Fear/Greed" | "None";
  tactic: string;
  explanation: string;
}

export interface ScanResult {
  riskScore: number;
  scannedText: string;
  detectedVector: ThreatVector | "Suspected Phishing";
  highlights: ScannedPhraseHighlight[];
  recommendation: string;
}