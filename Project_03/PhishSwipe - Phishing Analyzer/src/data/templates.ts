/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhishingCase, TriageEvent, ThreatVector } from "../types";

// Base static presets for the Heuristic Threat Scanner manual dissection demo
export const PREDEFINED_CASES: PhishingCase[] = [
  {
    id: "case-1",
    title: "Fake CEO Wire Request",
    senderName: "Finance Director",
    senderAddress: "management@executive-financial-updates.com",
    subject: "Urgent Action: Bank Wire Authorization needed for company acquisition",
    body: "Please review the urgent billing request from our external legal team immediately. This deal is highly confidential and must bypass standard procurement reviews to close before 5 PM today. Failure to complete this wire transfer will delay our acquisition. Select our authorization link below to log in: https://executive-financial-updates.com/login-portal",
    vector: "Whaling",
    riskScore: 96,
    isPredefined: true,
    headers: `From: Finance Director <management@executive-financial-updates.com>\nTo: senior.analyst@corporateshield.com\nSubject: Urgent Action: Bank Wire Authorization needed\nDate: October 12, 2026 10:14:02 AM\nReturn-Path: <management@executive-financial-updates.com>\nSPF: Fail\nDKIM: Fail\nDMARC: Fail`,
    redFlags: [
      {
        id: "rf-1-1",
        targetText: "management@executive-financial-updates.com",
        type: "Fake Sender Email Address",
        psychologicalTrigger: "Authority",
        technicalTactic: "Look-alike Address",
        explanation: "The domain 'executive-financial-updates.com' is not our real company domain. Scammers use look-alike addresses to make fake messages look official."
      },
      {
        id: "rf-1-2",
        targetText: "must bypass standard procurement flow",
        type: "Bypassing Security Steps",
        psychologicalTrigger: "Authority",
        technicalTactic: "Skipping Controls",
        explanation: "Asking to skip normal company checks or approvals is a classic sign of executive phishing."
      },
      {
        id: "rf-1-3",
        targetText: "close before 5 PM today.",
        type: "Urgency Pressure",
        psychologicalTrigger: "Urgency",
        technicalTactic: "Fake Deadline",
        explanation: "Creating a tight deadline makes people panic and rush so they skip their normal safety habits."
      },
      {
        id: "rf-1-4",
        targetText: "https://executive-financial-updates.com/login-portal",
        type: "Fake Login Page Link",
        psychologicalTrigger: "Fear/Greed",
        technicalTactic: "Credential Stealing Portal",
        explanation: "This link goes to a fake login portal designed to steal your passwords and authentication codes."
      }
    ]
  },
  {
    id: "case-2",
    title: "Overdue Invoice Scam",
    senderName: "Accounts Payable Invoice Portal",
    senderAddress: "billing@yourcompany-secure-logins.com",
    subject: "FW: Overdue Invoice august 2026 update",
    body: "Hi, please check the outstanding billing balance in the attached invoice document. Unpaid invoices will incur additional fees starting next Monday. We noticed errors in your payment setup. Please open the attached secure-update-invoice.iso file below to cancel the fees. Inform us if we need to escalate this further.",
    vector: "Spear Phishing",
    riskScore: 88,
    isPredefined: true,
    headers: `From: Accounts Payable <billing@yourcompany-secure-logins.com>\nTo: staff@corporate-office.com\nSubject: FW: Overdue Invoice august 2026\nDate: August 29, 2026 09:30:15 AM\nReturn-Path: <billing@yourcompany-secure-logins.com>\nSPF: Fail\nDKIM: Fail`,
    redFlags: [
      {
        id: "rf-2-1",
        targetText: "FW: Overdue Invoice",
        type: "Fake Forward History",
        psychologicalTrigger: "Curiosity",
        technicalTactic: "Fake Email Thread",
        explanation: "Scammers add 'FW:' to make you think the email is an ongoing conversation you can trust."
      },
      {
        id: "rf-2-2",
        targetText: "billing@yourcompany-secure-logins.com",
        type: "Scam domain prefix",
        psychologicalTrigger: "Authority",
        technicalTactic: "Look-alike Suffix",
        explanation: "The sender uses 'yourcompany-secure-logins.com' to blend official-looking words in the link, making you trust it."
      },
      {
        id: "rf-2-3",
        targetText: "secure-update-invoice.iso",
        type: "Dangerous Attachment File",
        psychologicalTrigger: "Fear/Greed",
        technicalTactic: "Suspicious File Format",
        explanation: "The '.iso' format is used to bypass email scanner check tubes and can run hidden malware in your machine."
      }
    ]
  }
];

// --- INFINITE REAL-TIME RANDOM SCENARIO GENERATOR ---
const FIRST_NAMES = [
  "Sarah", "David", "Michael", "Emma", "Robert", "Sophia", "Daniel", "Olivia",
  "James", "Isabella", "William", "Mia", "Joseph", "Charlotte", "Andrew", "Emily"
];

const LAST_NAMES = [
  "Chen", "Alvarez", "Taylor", "Kowalski", "Foster", "Patel", "Gomez", "Murphy",
  "Smith", "Johnson", "Davis", "Miller", "Wilson", "Anderson", "White", "Harris"
];

const EXECUTIVE_TITLES = [
  "Chief Executive Officer", "VP of Finance & Allocations", "Director of Human Resources",
  "Chief Technology Officer", "Billing Administrator", "Procurement Operations Lead"
];

const TECH_BRANDS = [
  { name: "Microsoft", cleanDomain: "microsoft.com", spoofs: ["micros0ft-login.com", "microsoft-secure-update.net", "micr0soft.com"] },
  { name: "Google", cleanDomain: "google.com", spoofs: ["goog1e-recovery-portal.com", "g00g1e.net", "google-security-auth.online"] },
  { name: "PayPal", cleanDomain: "paypal.com", spoofs: ["paypa1-verification.online", "paypaI-updates.net", "paypal-dispute-ref.cc"] },
  { name: "Amazon", cleanDomain: "amazon.com", spoofs: ["am0zon-billing-renew.info", "aws-security-portal.zip", "arnazon-payment.com"] },
  { name: "Netflix", cleanDomain: "netflix.com", spoofs: ["netf1ix-direct-billing.com", "netflix-login-reset.xyz", "netflix-billing-alert.work"] }
];

const SUSPICIOUS_DOMAINS = [
  "survey-monkey-internal-feedback-sys.com",
  "external-it-diagnostic-sandbox.tech",
  "employee-rewards-service.space",
  "corporate-auditing-cloud-sandbox.online",
  "temporary-support-terminal.info"
];

const RECURRING_BILLING_SUBJECTS = [
  "Alert: System Account Suspended due to unpaid balance",
  "Billing update: Mandatory invoice revision required",
  "Action Required: Compromised transaction details noted",
  "Invoice #SF-492048: Action needed within 24 hours",
  "Authorized Notice: Complete registration setup immediately"
];

const EXEC_SUBJECTS = [
  "Confidential Request: Immediate Wire Settlement Needed",
  "Urgent: Financial Authorization for project acquisition",
  "Direct Transfer Instructions (Strictly Confidential)",
  "Executive Action: Urgent procurement clearance needed today",
  "Urgent request from VP: Verify wire details"
];

const IT_WARNINGS = [
  "System Notification: IT diagnostic log scan required",
  "Diagnostic Review: Run software setup client immediately",
  "Action Required: Network credentials expire soon",
  "Corporate Wi-Fi: Install credential configuration file",
  "Urgent: Resolve database connection failures"
];

const SAFE_SUBJECTS = [
  "Info: Autumn Holiday payroll adjustments & timecards",
  "Notice: Weekly Department Progress briefing scheduled",
  "Quarterly corporate tax schedules update portfolio",
  "Safety Bulletin: Fire alarm drills schedule for next Tuesday",
  "Employee health benefits program overview manual"
];

// Generates a fully dynamic triage email case mapped to any index from 1 to 1000
export function generateRandomTriageCase(index: number): TriageEvent {
  // Normalize index between 1 and 1000 for structured progression
  const levelNum = ((index - 1) % 1000) + 1;
  const id = `triage-level-${levelNum}`;
  
  const fName = FIRST_NAMES[Math.floor((Math.random() + levelNum / 100) * 17) % FIRST_NAMES.length];
  const lName = LAST_NAMES[Math.floor((Math.random() + levelNum / 50) * 23) % LAST_NAMES.length];
  const senderName = `${fName} ${lName}`;
  const amt = (1500 + (levelNum * 4.5) + Math.random() * 5000).toFixed(2);
  const companyDomain = "mycorporateshield.com";

  // Deterministically assign stage type based on level number to provide a genuine 1000-case campaign mode!
  let stageName = "";
  let threatCategory: "Safe" | "Suspicious" | "Malicious" = "Safe";
  
  // Decide category structure based on level modulo
  const moduloType = levelNum % 3;
  if (moduloType === 0) {
    threatCategory = "Safe";
  } else if (moduloType === 1) {
    threatCategory = "Malicious";
  } else {
    threatCategory = "Suspicious";
  }

  // STAGE 1: Brand Mimicry (Levels 1 - 250)
  if (levelNum <= 250) {
    stageName = "Stage I: Brand Mimicry & Domain Spoofing";
    
    if (threatCategory === "Malicious") {
      const brand = TECH_BRANDS[Math.floor((levelNum * 7) % TECH_BRANDS.length)];
      const spoofDomain = brand.spoofs[Math.floor((levelNum * 3) % brand.spoofs.length)];
      return {
        id,
        title: `${brand.name} Target Brand Spoof [Level ${levelNum}/1000]`,
        sender: `${brand.name} Support Desk <security@${brand.cleanDomain}>`,
        subject: `[${stageName}] Urgent: Account Suspended due to unpaid balance`,
        body: `Hello corporate user, we detected unauthorized login activity on your ${brand.name} cloud terminal. A pending billing statement of $${amt} remains outstanding. To dispute this charge and prevent permanent suspension of workspace features, access our secure server within 12 hours: https://${spoofDomain}/dispute-login-portal`,
        headers: {
          from: `security@${brand.cleanDomain}`,
          spf: "Fail",
          dkim: "None",
          dmarc: "Fail",
          returnPath: `system-alerts@${spoofDomain}`
        },
        details: `Stage 1 Security Inspector Report: Brand mimicking alert. Return-Path points to high-risk unrecognized domain [${spoofDomain}]. Server fails SPF/DMARC authorization audits.`,
        correctAction: "Malicious",
        explanation: `This is a malicious brand impersonation attempt targeting ${brand.name}. Checking technical logs reveals a severe mismatch: the return path points to lookalike domain '${spoofDomain}' instead of '${brand.cleanDomain}', and SPF/DMARC filters returned 'Fail'.`
      };
    } else if (threatCategory === "Suspicious") {
      const spoofDomain = SUSPICIOUS_DOMAINS[Math.floor((levelNum * 5) % SUSPICIOUS_DOMAINS.length)];
      return {
        id,
        title: `External Survey Feedback Target [Level ${levelNum}/1000]`,
        sender: `Operational Polls <feedback@${spoofDomain}>`,
        subject: `[${stageName}] Action Needed: Internal corporate rewards survey opportunity`,
        body: `Dear employee, please fill out our external organizational feedback poll to claim your corporate bonus of $25.00. Your feedback keeps our business efficient. Enter details on: https://${spoofDomain}/rewards. Always check indicators before submission.`,
        headers: {
          from: `feedback@${spoofDomain}`,
          spf: "Pass",
          dkim: "None",
          dmarc: "None",
          returnPath: `feedback@${spoofDomain}`
        },
        details: `Stage 1 Security Inspector Report: SPF validates correctly for external domain, but the domain [${spoofDomain}] represents an unrecognized third party namespace. Lacks DKIM certification credentials.`,
        correctAction: "Suspicious",
        explanation: `Flag this case as 'Suspicious'. Although SPF passes (meaning the email actually originated from '${spoofDomain}'), the communication requests internal feedback to an unrecognized third-party workspace rewards portal. Direct staff to isolate this for manual SOC analyst review.`
      };
    } else {
      const cleanSub = SAFE_SUBJECTS[Math.floor((levelNum * 4) % SAFE_SUBJECTS.length)];
      return {
        id,
        title: `Safe Corporate Schedule [Level ${levelNum}/1000]`,
        sender: `Payroll operations <payroll@${companyDomain}>`,
        subject: `[${stageName}] ${cleanSub}`,
        body: `Hello Team, please find our official updated corporate schedule. All reference information is locked and uploaded directly onto the internal company intranet workstation. Always log in directly. Do NOT select external links.`,
        headers: {
          from: `payroll@${companyDomain}`,
          spf: "Pass",
          dkim: "Pass",
          dmarc: "Pass",
          returnPath: `payroll@${companyDomain}`
        },
        details: `Stage 1 Security Inspector Report: Safe internally signed broadcast. Senders match verified corporate white-label certificates. All cryptographic key validation systems pass successfully.`,
        correctAction: "Safe",
        explanation: `This is a legitimate secure communication. Senders are fully authorized within '${companyDomain}', and all cryptographic validation flags (SPF, DKIM, DMARC) pass seamlessly with verified security compliance certificates.`
      };
    }
  }

  // STAGE 2: Whaling & Authority Exploits (Levels 251 - 500)
  else if (levelNum <= 500) {
    stageName = "Stage II: Whaling & Authority Mimicry";
    
    if (threatCategory === "Malicious") {
      const title = EXECUTIVE_TITLES[Math.floor((levelNum * 9) % EXECUTIVE_TITLES.length)];
      const spoofDomain = "executive-operations-office.cc";
      return {
        id,
        title: `CEO Wire Redirect Exploit [Level ${levelNum}/1000]`,
        sender: `${senderName} <${title}>`,
        subject: `[${stageName}] Urgent Action: Bank wire fund transfer authorized for company purchase`,
        body: `Hello, I am currently out of the building finalising a corporate acquisition. I require you to issue a wire transfer of $${amt} strictly by 5 PM. Due to the high confidentiality of this contract, standard audit workflows must be bypassed. Confirm payment on our pipeline portal: https://${spoofDomain}/wire-direct`,
        headers: {
          from: `${fName.toLowerCase()}.${lName.toLowerCase()}@${companyDomain}`,
          spf: "Fail",
          dkim: "Fail",
          dmarc: "Fail",
          returnPath: `executives@${spoofDomain}`
        },
        details: `Stage 2 Security Inspector Report: Severe identity whaling spoofing. The address claims to reside inside the organization but fails internal domain SPF validation. Requests bypassing strict corporate controls.`,
        correctAction: "Malicious",
        explanation: `This is high-risk whaling phishing. Scammers spoofed a core executive domain. Senders requested bypassing standard audit checklists and urgency elements. Flag and quarantine immediately.`
      };
    } else if (threatCategory === "Suspicious") {
      const spoofDomain = SUSPICIOUS_DOMAINS[Math.floor((levelNum * 11) % SUSPICIOUS_DOMAINS.length)];
      return {
        id,
        title: `External Legal Auditing Update [Level ${levelNum}/1000]`,
        sender: `Legal Invoicing <auditing@${spoofDomain}>`,
        subject: `[${stageName}] Alert: Pending regulatory filing invoice #SF-${levelNum}`,
        body: `Please review invoice audit file for our company filings. Unpaid billing statements will accrue additional penalties. Submit verification feedback on the external secure gateway: https://${spoofDomain}/regulatory-gateway`,
        headers: {
          from: `auditing@${spoofDomain}`,
          spf: "Pass",
          dkim: "None",
          dmarc: "None",
          returnPath: `auditing@${spoofDomain}`
        },
        details: `Stage 2 Security Inspector Report: SPF validates correctly, but the sender uses unauthorized alternative domains. Lacks cryptographic DKIM signatures or company alignment.`,
        correctAction: "Suspicious",
        explanation: `Flag this case as 'Suspicious'. Although the sender is technically authenticated via SPF for that external domain, it requests compliance fee verifications using unverified lookalike endpoints.`
      };
    } else {
      const cleanSub = SAFE_SUBJECTS[Math.floor((levelNum * 8) % SAFE_SUBJECTS.length)];
      return {
        id,
        title: `HR Benefits Program Broadcast [Level ${levelNum}/1000]`,
        sender: `HR Operations Desk <hr@${companyDomain}>`,
        subject: `[${stageName}] ${cleanSub}`,
        body: `Hello corporate staff, please find details regarding our upcoming team safety checkups. To maintain security, we did not include any links. Please access details directly via company workstation login.`,
        headers: {
          from: `hr@${companyDomain}`,
          spf: "Pass",
          dkim: "Pass",
          dmarc: "Pass",
          returnPath: `hr@${companyDomain}`
        },
        details: `Stage 2 Security Inspector Report: Safe internally signed broadcast. Verified company namespace with valid cryptography signatures.`,
        correctAction: "Safe",
        explanation: `This is a legitimate secure communication. All corporate cryptographic validation flags (SPF, DKIM, DMARC) pass seamlessly, and there are no external URL references.`
      };
    }
  }

  // STAGE 3: Workstation & IT Integrity (Levels 501 - 750)
  else if (levelNum <= 750) {
    stageName = "Stage III: Workstation & IT Integrity Alerts";
    
    if (threatCategory === "Malicious") {
      const spoofDomain = "it-support-workstation-assist.tech";
      const ext = levelNum % 2 === 0 ? "iso" : "exe";
      return {
        id,
        title: `Workstation Security Helpdesk Hijack [Level ${levelNum}/1000]`,
        sender: `External IT Integrations <it-admin@${spoofDomain}>`,
        subject: `[${stageName}] Critical Alert: System workstation sync failure detected`,
        body: `IT Warning: We noticed system workstations synching errors on your node. To prevent permanent lockouts and coordinate workstation databases, download the attached diagnostic helper console 'secure-patch-${levelNum}.${ext}' immediately on your local machine.`,
        headers: {
          from: `it-admin@${spoofDomain}`,
          spf: "Fail",
          dkim: "None",
          dmarc: "Fail",
          returnPath: `it-terminal@${spoofDomain}`
        },
        details: `Stage 3 Security Inspector Report: High-severity malicious setup assistant. Requests downloading executable binaries [.${ext}] using unauthorized support servers.`,
        correctAction: "Malicious",
        explanation: `This is a malicious phishing campaign. The sender is pretending to be IT and demands downloading high-risk executable files (${ext}) that can execute hidden malware on systems. Block and isolate this thread.`
      };
    } else if (threatCategory === "Suspicious") {
      const spoofDomain = SUSPICIOUS_DOMAINS[Math.floor((levelNum * 13) % SUSPICIOUS_DOMAINS.length)];
      return {
        id,
        title: `Workplace Diagnostic Feedback [Level ${levelNum}/1000]`,
        sender: `Diagnostics Hub <system-testing@${spoofDomain}>`,
        subject: `[${stageName}] Request: Run workstation utility benchmarks`,
        body: `IT Advisory: We are collecting network speed benchmarks across corporate accounts. Select the diagnostics portal link: http://${spoofDomain}/benchmarking-rules. Please run local analytics to confirm telemetry is active.`,
        headers: {
          from: `system-testing@${spoofDomain}`,
          spf: "Pass",
          dkim: "None",
          dmarc: "None",
          returnPath: `system-testing@${spoofDomain}`
        },
        details: `Stage 3 Security Inspector Report: Out-of-band diagnostic benchmarking alert. SPF passes correctly but lacks any official corporate workspace white-label keys.`,
        correctAction: "Suspicious",
        explanation: `Flag as 'Suspicious'. While SPF is valid, the email contains unencrypted HTTP URLs running diagnostic analytics from unrecognized support domains. Direct threat analysts to inspect manually.`
      };
    } else {
      const cleanSub = SAFE_SUBJECTS[Math.floor((levelNum * 12) % SAFE_SUBJECTS.length)];
      return {
        id,
        title: `Safe IT Health Check Bulletin [Level ${levelNum}/1000]`,
        sender: `Information Security Group <security-bulletins@${companyDomain}>`,
        subject: `[${stageName}] Notice: ${cleanSub}`,
        body: `This is an official information announcement. We are conducting routine security reviews. No software installations or diagnostic files are required. Log in directly to compliance panels for confirmation.`,
        headers: {
          from: `security-bulletins@${companyDomain}`,
          spf: "Pass",
          dkim: "Pass",
          dmarc: "Pass",
          returnPath: `security-bulletins@${companyDomain}`
        },
        details: `Stage 3 Security Inspector Report: Genuine IT Operations bulletin. Cryptographic credentials validated correctly.`,
        correctAction: "Safe",
        explanation: `This is a completely legitimate corporate broadcast with full SPF, DKIM, and DMARC passes. Senders are verified and follow robust compliance parameters by instructing employees to access portals manually.`
      };
    }
  }

  // STAGE 4: Advanced Red Team Operations (Levels 751 - 1000)
  else {
    stageName = "Stage IV: Advanced Red-Team Threat Drills";
    
    if (threatCategory === "Malicious") {
      const spoofDomain = "microsoft-secure-identity-auth.zip";
      return {
        id,
        title: `Advanced Cloud MFA Hijack Drill [Level ${levelNum}/1000]`,
        sender: `Corporate Office Secure <compliance@${spoofDomain}>`,
        subject: `[${stageName}] Urgent: Authenticate MFA connection for workspace synchronization`,
        body: `Dear employee, we have updated corporate security layers. To sync corporate keys, authenticate your details through our newly established visual gateway within 60 minutes: https://${spoofDomain}/mfa-reset-terminal. Lacking setup will invalidate your accounts.`,
        headers: {
          from: `compliance@${spoofDomain}`,
          spf: "Fail",
          dkim: "None",
          dmarc: "Fail",
          returnPath: `advisories@${spoofDomain}`
        },
        details: `Stage 4 Security Inspector Report: Advanced red-team phishing drill. Merges official-looking terms within high danger unauthenticated extension names [.zip].`,
        correctAction: "Malicious",
        explanation: `This is a malicious phishing exploit using an advanced '.zip' typo-squatting domain. It mimics a legitimate MFA update alert to harvest active corporate credentials. Highly hazardous.`
      };
    } else if (threatCategory === "Suspicious") {
      const spoofDomain = SUSPICIOUS_DOMAINS[Math.floor((levelNum * 17) % SUSPICIOUS_DOMAINS.length)];
      return {
        id,
        title: `Corporate Operations Auditing Request [Level ${levelNum}/1000]`,
        sender: `Operational Audits <operations-integrity@${spoofDomain}>`,
        subject: `[${stageName}] Alert: Complete operational risk benchmarking audit`,
        body: `Risk Assessment: To maintain regulatory compliance benchmarks, please fill out our online integrity reports listing active accounts payable. Select the secure terminal: https://${spoofDomain}/compliance-audits.`,
        headers: {
          from: `operations-integrity@${spoofDomain}`,
          spf: "Pass",
          dkim: "None",
          dmarc: "None",
          returnPath: `operations-integrity@${spoofDomain}`
        },
        details: `Stage 4 Security Inspector Report: Suspicious operations auditing query. Lacks official brand alignment.`,
        correctAction: "Suspicious",
        explanation: `Flag as 'Suspicious'. Although SPF validates, the communication originates from alternative unrecognized extensions, querying about corporate integrity and accounts payable details. Direct teams to trace.`
      };
    } else {
      const cleanSub = SAFE_SUBJECTS[Math.floor((levelNum * 14) % SAFE_SUBJECTS.length)];
      return {
        id,
        title: `Legitimate Operations Briefing [Level ${levelNum}/1000]`,
        sender: `Company Operations Announcements <announcements@${companyDomain}>`,
        subject: `[${stageName}] ${cleanSub}`,
        body: `Dear team, please find the operations overview manual. It is hosted directly on your internal company workspace SSO. No downloads or logins are requested within this email.`,
        headers: {
          from: `announcements@${companyDomain}`,
          spf: "Pass",
          dkim: "Pass",
          dmarc: "Pass",
          returnPath: `announcements@${companyDomain}`
        },
        details: `Stage 4 Security Inspector Report: Approved corporate announcements. Full cryptographic alignment.`,
        correctAction: "Safe",
        explanation: `This is a legitimate secure communication. All cryptographic flags are fully green, sent from the official company domain with secure directives.`
      };
    }
  }
}

// Generate an initial random list of 10 cases so the user starts with a fresh batch
export const TRIAGE_QUEUE: TriageEvent[] = Array.from({ length: 15 }, (_, i) => generateRandomTriageCase(i + 1));