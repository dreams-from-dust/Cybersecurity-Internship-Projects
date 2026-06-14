# Project 3: Phishing Awareness Analysis & Threat Scanner

A sophisticated, interactive cybersecurity simulation tool designed for training analysts in the identification and triage of modern phishing threats.

## Overview
Project 3 moves beyond simple validation into the domain of **Threat Intelligence**. This tool provides two distinct modules for developing security awareness:
1. **PhishSwipe Arena**: An interactive gamified triage system where analysts categorize incoming threats based on cryptographic header verification (SPF/DKIM/DMARC) and semantic analysis.
2. **RealThreat Scanner**: A manual dissection workbench that highlights specific "red flags" (urgency, spoofing, authority exploitation) within suspicious communications.

## Features
* **Heuristic Threat Engine**: Uses complex regular expression patterns to score and classify communications as Spear Phishing, Whaling, Smishing, Vishing, or Quishing.
* **Triage Simulation**: Procedurally generated threat cases force users to apply rigorous analytical standards under pressure.
* **Forensic Dissection**: Interactive UI allows users to inspect flagged elements to learn the psychological and technical tactics used by threat actors.
* **Corporate SOC Aesthetic**: A high-end, dark-themed dashboard using modern glassmorphism, smooth Framer Motion/GSAP-style transitions, and high-contrast alert states.

## How it works
The application utilizes a modular React architecture:
* `phishingEngine.ts`: Contains the heuristic logic that parses text and assigns threat scores based on predefined rules.
* `templates.ts`: Handles procedural generation of phishing cases, ensuring unique training scenarios every time.
* `types.ts`: Strictly defines the security data structures (threat vectors, triage events, red flags).

## Getting Started
1. Ensure you have Node.js and npm/yarn installed.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access the simulation suite at `http://localhost:3000` (or the port specified by your environment).
