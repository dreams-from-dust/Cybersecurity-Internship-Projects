import http.server, socketserver, json, urllib.parse, re

PORT = 8001

# ── Core Logic ──────────────────────────────────────────────
def check_password(pw: str) -> dict:
    # Use re.UNICODE to handle international character sets
    has_len    = len(pw) >= 8
    has_upper  = bool(re.search(r'[A-Z]', pw, re.UNICODE))
    has_digit  = bool(re.search(r'[0-9]', pw))
    # [^\w\s] is a cleaner way to match symbols across various languages
    has_symbol = bool(re.search(r'[^\w\s]', pw, re.UNICODE))

    score = sum([has_len, has_upper, has_digit, has_symbol])

    if len(pw) == 0:
        level = "empty"
    elif score <= 1:
        level = "weak"
    elif score == 2:
        level = "fair"
    elif score == 3:
        level = "good"
    else:
        level = "strong"

    return {
        "score": score,
        "level": level,
        "pct": round((score / 4) * 100),
        "checks": {
            "length":  has_len,
            "upper":   has_upper,
            "digit":   has_digit,
            "symbol":  has_symbol
        }
    }

# ── HTML ─────────────────────────────────────────────────────
HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Password Strength Checker</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.2.0/remixicon.min.css">
<style>
/* ── Reset & Base ─────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }
body {
  font-family: 'Poppins', sans-serif;
  background: #F7F0F1;
  color: #1A0810;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── Tokens ───────────────────────────────────────────────── */
:root {
  --maroon:       #6B1226;
  --maroon-d:     #450B18;
  --maroon-m:     #8C1E35;
  --maroon-l:     #B33050;
  --maroon-xl:    #D1526E;
  --maroon-bg:    #F7F0F1;
  --maroon-pale:  #FDF4F5;
  --white:        #FFFFFF;
  --ink:          #1A0810;
  --ink-mid:      #5C3540;
  --ink-faint:    #9B7880;
  --border:       #E8D5D9;
  --radius-lg:    20px;
  --radius-md:    12px;
  --radius-sm:    8px;
  --shadow-sm:    0 2px 8px rgba(107,18,38,0.07);
  --shadow-md:    0 8px 28px rgba(107,18,38,0.12);
  --shadow-lg:    0 20px 60px rgba(107,18,38,0.18);
  --trans:        0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Scrollbar ────────────────────────────────────────────── */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--maroon-bg); }
::-webkit-scrollbar-thumb { background: var(--maroon-xl); border-radius: 10px; }

/* ── Hero ─────────────────────────────────────────────────── */
.hero {
  position: relative;
  min-height: 100vh;
  background: var(--maroon-d);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px 60px;
  overflow: hidden;
}

/* fine dot-grid */
.hero::before {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
}

/* glow orbs */
.glow {
  position: absolute; border-radius: 50%;
  pointer-events: none; filter: blur(80px);
}
.glow-a {
  width: 480px; height: 480px;
  background: rgba(140,30,53,0.55);
  top: -120px; right: -80px;
  animation: drift 11s ease-in-out infinite;
}
.glow-b {
  width: 340px; height: 340px;
  background: rgba(107,18,38,0.4);
  bottom: -80px; left: -60px;
  animation: drift 14s ease-in-out infinite reverse;
}
.glow-c {
  width: 220px; height: 220px;
  background: rgba(179,48,80,0.25);
  top: 50%; left: 40%;
  animation: drift 9s ease-in-out infinite 3s;
}
@keyframes drift {
  0%,100% { transform: translate(0,0) scale(1); }
  50%       { transform: translate(24px,-32px) scale(1.06); }
}

/* hero content */

.pulse-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--maroon-xl);
  animation: pulseAnim 1.6s infinite;
}
@keyframes pulseAnim { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(1.5)} }

.hero-title {
  position: relative;
  font-size: clamp(2.6rem, 6.5vw, 5.2rem);
  font-weight: 800; line-height: 1.05; letter-spacing: -0.04em;
  text-align: center; color: var(--white);
  margin-bottom: 14px;
  animation: riseIn 0.7s 0.1s ease both;
}
.hero-title em {
  font-style: normal;
  background: linear-gradient(120deg, var(--maroon-xl), #F9A0B4);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-lead {
  position: relative;
  font-size: 1rem; font-weight: 300; line-height: 1.75;
  color: rgba(255,255,255,0.45);
  text-align: center; max-width: 440px;
  margin-bottom: 52px;
  animation: riseIn 0.7s 0.18s ease both;
}

@keyframes riseIn {
  from { opacity:0; transform: translateY(22px); }
  to   { opacity:1; transform: translateY(0); }
}

/* ── Checker Panel ────────────────────────────────────────── */
.panel {
  position: relative;
  width: 200%; max-width: 720px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-lg);
  padding: 36px 32px;
  backdrop-filter: blur(28px);
  animation: riseIn 0.8s 0.25s ease both;
}

.field-label {
  font-size: 0.68rem; font-weight: 600;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-bottom: 9px;
  display: block;
}

.input-row {
  position: relative;
  margin-bottom: 22px;
}
.pw-input {
  width: 100%;
  background: rgba(0,0,0,0.28);
  border: 1.5px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-md);
  padding: 15px 48px 15px 16px;
  font-family: 'Inter', monospace; font-size: 1rem;
  color: var(--white); outline: none;
  transition: border-color var(--trans), box-shadow var(--trans);
  letter-spacing: 0.04em;
}
.pw-input::placeholder { color: rgba(255,255,255,0.2); letter-spacing: 0; }
.pw-input:focus {
  border-color: var(--maroon-xl);
  box-shadow: 0 0 0 3px rgba(179,48,80,0.22);
}

.eye-toggle {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: grey; font-size: 1.15rem;
  transition: color var(--trans); padding: 4px;
  display: flex; align-items: center; justify-content: center;
}
.eye-toggle:hover { color: rgba(255,255,255,0.65); }

/* strength bar */
.bar-track {
  height: 5px;
  background: rgba(255,255,255,0.07);
  border-radius: 100px; overflow: hidden;
  margin-bottom: 9px;
}
.bar-fill {
  height: 100%; border-radius: 100px;
  width: 0%;
  transition: width 0.55s cubic-bezier(0.34,1.56,0.64,1), background 0.4s;
}

.bar-meta {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 22px;
}
.bar-level {
  font-size: 0.78rem; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(255,255,255,0.28);
  transition: color var(--trans);
}
.bar-pct {
  font-family: 'Inter', monospace;
  font-size: 0.72rem; font-weight: 500;
  color: rgba(255,255,255,0.22);
  transition: color var(--trans);
}

/* criteria grid */
.criteria {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-bottom: 26px;
}
.crit {
  display: flex; align-items: center; gap: 9px;
  background: rgba(0,0,0,0.22);
  border: 1px solid rgba(255,255,255,0.055);
  border-radius: var(--radius-sm);
  padding: 11px 13px;
  font-size: 0.8rem; font-weight: 500;
  color: rgba(255,255,255,0.35);
  transition: all var(--trans);
}
.crit.ok {
  background: rgba(179,48,80,0.14);
  border-color: rgba(179,48,80,0.3);
  color: #F9A0B4;
}
.crit-icon {
  font-size: 0.95rem; flex-shrink: 0;
  transition: color var(--trans);
}
.crit.ok .crit-icon { color: var(--maroon-xl); }

/* verdict */
.verdict {
  padding: 14px 18px; border-radius: var(--radius-md);
  font-size: 0.88rem; font-weight: 500; text-align: center;
  background: rgba(255,255,255,0.04);
  border: 1.5px dashed rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.22);
  transition: all var(--trans); line-height: 1.5;
}
.verdict.weak   { background:rgba(200,50,50,0.15); border-color:rgba(230,80,80,0.35); color:#FF9090; border-style:solid; }
.verdict.fair   { background:rgba(200,130,0,0.12); border-color:rgba(230,160,0,0.35); color:#FFCF7A; border-style:solid; }
.verdict.good   { background:rgba(190,150,0,0.12); border-color:rgba(220,190,0,0.35); color:#FFE97A; border-style:solid; }
.verdict.strong { background:rgba(30,155,90,0.13); border-color:rgba(50,195,120,0.35); color:#72FFB8; border-style:solid; }

/* scroll hint */
.scroll-hint {
  position: relative; margin-top: 44px;
  display: flex; flex-direction: column; align-items: center; gap: 7px;
  animation: riseIn 1s 0.55s ease both;
  cursor: pointer; user-select: none;
}
.scroll-hint span {
  font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(255,255,255,0.22);
}
.scroll-arrow {
  width: 30px; height: 30px;
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.25);
  font-size: 0.9rem;
  animation: bob 2.2s ease-in-out infinite;
}
@keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(7px)} }

/* ── Main content (light sections) ───────────────────────── */
.content-section {
  padding: 80px 24px;
}
.content-section.alt { background: var(--maroon-pale); }
.content-section.dark {
  background: var(--maroon-d);
  padding: 72px 24px;
}

.sec-eyebrow {
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--maroon); margin-bottom: 10px; text-align: center;
}
.dark .sec-eyebrow { color: rgba(209,82,110,0.8); }

.sec-title {
  font-size: clamp(1.75rem, 3.8vw, 2.6rem);
  font-weight: 800; letter-spacing: -0.03em;
  color: var(--maroon-d); margin-bottom: 10px;
  text-align: center; line-height: 1.15;
}
.dark .sec-title { color: var(--white); }

.sec-sub {
  font-size: 0.93rem; font-weight: 300; line-height: 1.8;
  color: var(--ink-faint); text-align: center;
  max-width: 480px; margin: 0 auto 52px;
}
.dark .sec-sub { color: rgba(255,255,255,0.38); }

/* ── Cards ────────────────────────────────────────────────── */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(248px, 1fr));
  gap: 18px; max-width: 980px; margin: 0 auto;
}

.card {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 30px 26px;
  position: relative; overflow: hidden;
  transition: transform var(--trans), box-shadow var(--trans), border-color var(--trans);
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.28s, border-color 0.28s;
}
.card.visible { opacity:1; transform: translateY(0); }
.card:hover {
  transform: translateY(-5px) !important;
  box-shadow: var(--shadow-md);
  border-color: rgba(107,18,38,0.2);
}
.card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background: linear-gradient(90deg, var(--maroon), var(--maroon-xl));
  transform: scaleX(0); transform-origin:left;
  transition: transform 0.4s ease;
}
.card:hover::before { transform: scaleX(1); }

.card-ico {
  width: 46px; height: 46px; border-radius: 13px;
  background: linear-gradient(135deg, #FDF4F5, #F7E0E4);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px; font-size: 1.2rem; color: var(--maroon);
}
.card-heading { font-size: 0.97rem; font-weight: 700; color: var(--maroon-d); margin-bottom: 9px; }
.card-body {
  font-size: 0.84rem; line-height: 1.78; color: var(--ink-mid);
  font-weight: 400;
}
.card-body code {
  font-family: 'Inter', monospace; font-size: 0.78rem;
  background: #FDF4F5; color: var(--maroon); padding: 1px 6px; border-radius: 5px;
}

/* ── Steps (dark section) ─────────────────────────────────── */
.steps {
  max-width: 660px; margin: 0 auto;
  position: relative;
}
.steps::before {
  content:''; position:absolute; left:23px; top:0; bottom:0; width:1px;
  background: linear-gradient(to bottom, transparent, rgba(179,48,80,0.45), transparent);
}

.step {
  display: flex; gap: 22px; padding: 20px 0;
  opacity: 0; transform: translateX(-18px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.step.visible { opacity:1; transform: translateX(0); }

.step-num {
  width: 46px; height: 46px; flex-shrink:0; border-radius:50%;
  background: var(--maroon-d);
  border: 1.5px solid var(--maroon-l);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Inter', monospace; font-size: 0.78rem; font-weight: 700;
  color: var(--maroon-l); position: relative; z-index:1;
}
.step-body .step-heading {
  font-size: 0.95rem; font-weight: 700; color: var(--white);
  margin-bottom: 5px; letter-spacing: -0.02em;
}
.step-body .step-text {
  font-size: 0.83rem; font-weight: 300; color: rgba(255,255,255,0.42); line-height: 1.75;
}
.step-body code {
  font-family: 'Inter', monospace; font-size: 0.76rem;
  background: rgba(179,48,80,0.18); color: #F9A0B4;
  padding: 1px 7px; border-radius: 5px;
}

/* ── Stat strip ───────────────────────────────────────────── */
.stat-strip {
  background: var(--maroon);
  padding: 60px 24px; text-align: center;
}
.stat-num {
  font-size: clamp(3.5rem, 10vw, 7rem);
  font-weight: 800; letter-spacing: -0.04em;
  color: var(--white); line-height: 1; margin-bottom: 10px;
  font-family: 'Inter', sans-serif;
}
.stat-caption {
  font-size: 0.93rem; font-weight: 400; line-height: 1.7;
  color: rgba(255,255,255,0.55); max-width: 380px; margin: 0 auto;
}

/* ── Footer ───────────────────────────────────────────────── */
footer {
  background: var(--maroon-d);
  padding: 26px 24px; text-align: center;
  border-top: 1px solid rgba(255,255,255,0.06);
}
footer p { font-size: 0.78rem; color: rgba(255,255,255,0.25); }
</style>
</head>
<body>

<!-- ── Hero ── -->
<section class="hero">
  <div class="glow glow-a"></div>
  <div class="glow glow-b"></div>
  <div class="glow glow-c"></div>

  <h1 class="hero-title">Password<br><em>Strength Checker</em></h1>
  <p class="hero-lead">Type any password below and see exactly how secure it is , and why.</p>

  <div class="panel">
    <label class="field-label" for="pw">Your password</label>
    <div class="input-row">
      <input class="pw-input" type="password" id="pw"
             placeholder="Enter a password to test…"
             oninput="evaluatePassword()" autocomplete="new-password" spellcheck="false">
      <button class="eye-toggle" onclick="toggleEye()" aria-label="Show or hide password">
        <i class="ri-eye-line" id="eye-icon"></i>
      </button>
    </div>

    <div class="bar-track"><div class="bar-fill" id="bar"></div></div>
    <div class="bar-meta">
      <span class="bar-level" id="bar-level">No password entered</span>
      <span class="bar-pct"   id="bar-pct">0%</span>
    </div>

    <div class="criteria">
      <div class="crit" id="c-len">
        <i class="ri-ruler-line crit-icon"></i> 8 or more characters
      </div>
      <div class="crit" id="c-up">
        <i class="ri-font-size crit-icon"></i> Uppercase letter
      </div>
      <div class="crit" id="c-dig">
        <i class="ri-hashtag crit-icon"></i> Contains a number
      </div>
      <div class="crit" id="c-sym">
        <i class="ri-at-line crit-icon"></i> Special character
      </div>
    </div>

    <div class="verdict" id="verdict">Start typing to see your result</div>
  </div>

  <div class="scroll-hint" onclick="document.querySelector('.why-section').scrollIntoView({behavior:'smooth'})">
    <span>See how this works</span>
    <div class="scroll-arrow"><i class="ri-arrow-down-s-line"></i></div>
  </div>
</section>

<!-- ── Why each rule matters ── -->
<section class="content-section why-section">
  <p class="sec-eyebrow">The reasoning</p>
  <h2 class="sec-title">Why each rule exists</h2>
  <p class="sec-sub">Every check maps to a real attack vector. Understanding this is the point of the exercise.</p>

  <div class="cards" id="cards-why">
    <div class="card">
      <div class="card-ico"><i class="ri-ruler-2-line"></i></div>
      <h3 class="card-heading">Length matters most</h3>
      <p class="card-body">A 6-character password has 26⁶ = 308 million combinations. Each extra character multiplies that. At 12 characters, brute force takes centuries with modern hardware.</p>
    </div>
    <div class="card">
      <div class="card-ico"><i class="ri-font-size-2"></i></div>
      <h3 class="card-heading">Mixed case doubles options</h3>
      <p class="card-body">Adding uppercase letters expands your alphabet from 26 to 52 characters , every position now has twice as many possibilities. Dictionary attacks rely on all-lowercase words.</p>
    </div>
    <div class="card">
      <div class="card-ico"><i class="ri-number-9"></i></div>
      <h3 class="card-heading">Digits break word patterns</h3>
      <p class="card-body">Attackers try word lists first. A digit inside a word defeats that entirely. Python checks this with <code>any(c.isdigit() for c in pw)</code> , it stops the moment it finds one.</p>
    </div>
    <div class="card">
      <div class="card-ico"><i class="ri-price-tag-3-line"></i></div>
      <h3 class="card-heading">Symbols expand the space to 95</h3>
      <p class="card-body">Adding symbols like <code>! @ # $</code> pushes the usable character set to 95 printable ASCII characters. Even short passwords with symbols are dramatically harder to brute-force.</p>
    </div>
  </div>
</section>

<!-- ── Algorithm steps ── -->
<section class="content-section dark" id="steps-section">
  <p class="sec-eyebrow">The algorithm</p>
  <h2 class="sec-title">How code works</h2>
  <p class="sec-sub">This is the exact sequence program follows to classify any password.</p>

  <div class="steps" id="steps-list">
    <div class="step">
      <div class="step-num">01</div>
      <div class="step-body">
        <div class="step-heading">Read the input</div>
        <div class="step-text">The program receives a string , a sequence of characters Python stores in memory. Use <code>input("Enter password: ")</code> to get it from the user.</div>
      </div>
    </div>
    <div class="step">
      <div class="step-num">02</div>
      <div class="step-body">
        <div class="step-heading">Check length with <code>len()</code></div>
        <div class="step-text"><code>len(password) &lt; 8</code> evaluates to True or False instantly. If less than 8, the password is Weak without needing any other checks.</div>
      </div>
    </div>
    <div class="step">
      <div class="step-num">03</div>
      <div class="step-body">
        <div class="step-heading">Scan for character types</div>
        <div class="step-text">Use <code>any()</code> with a generator expression for each type , uppercase, digit, symbol. This is more efficient than a manual loop because it stops the moment it finds a match.</div>
      </div>
    </div>
    <div class="step">
      <div class="step-num">04</div>
      <div class="step-body">
        <div class="step-heading">Count passing rules</div>
        <div class="step-text">Add up the four boolean flags. 0–1 passing is Weak. 2 is Fair. 3 is Good. All 4 is Strong. Simple threshold logic , no complex scoring needed.</div>
      </div>
    </div>
    <div class="step">
      <div class="step-num">05</div>
      <div class="step-body">
        <div class="step-heading">Display result and guidance</div>
        <div class="step-text">Print the strength label and, for any rule that failed, a specific explanation. Tell the user what to fix , not just that something is wrong.</div>
      </div>
    </div>
  </div>
</section>

<!-- ── Stat strip ── -->
<section class="stat-strip">
  <div class="stat-num" id="stat-num" data-target="81">0</div>
  <p class="stat-caption">of hacking-related breaches involve weak or stolen passwords. This checker teaches you to recognize the difference.</p>
</section>


<footer>
  <p>Password Strength Checker &mdash; Cybersecurity Fundamentals</p>
</footer>

<script>
// ── Live evaluation ────────────────────────────────────────
function evaluatePassword() {
  const pw = document.getElementById('pw').value;

  const checks = {
    len: pw.length >= 8,
    up:  /[A-Z]/.test(pw),
    dig: /[0-9]/.test(pw),
    sym: /[^A-Za-z0-9]/.test(pw)
  };

  // update criteria chips
  const map = { len:'c-len', up:'c-up', dig:'c-dig', sym:'c-sym' };
  const icons = {
    len: 'ri-ruler-line',
    up:  'ri-font-size',
    dig: 'ri-hashtag',
    sym: 'ri-at-line'
  };
  Object.entries(map).forEach(([k, id]) => {
    const el = document.getElementById(id);
    el.classList.toggle('ok', checks[k]);
    el.querySelector('.crit-icon').className = 'crit-icon ' +
      (checks[k] ? 'ri-checkbox-circle-line' : icons[k]);
  });

  const score = Object.values(checks).filter(Boolean).length;
  const pct   = pw.length === 0 ? 0 : Math.round((score / 4) * 100);

  document.getElementById('bar-pct').textContent = pct + '%';

  const bar     = document.getElementById('bar');
  const level   = document.getElementById('bar-level');
  const verdict = document.getElementById('verdict');

  if (!pw.length) {
    bar.style.width = '0%'; bar.style.background = '';
    level.style.color = 'rgba(255,255,255,0.28)';
    level.textContent = 'No password entered';
    verdict.className = 'verdict';
    verdict.textContent = 'Start typing to see your result';
    return;
  }

  const cfg = {
    weak:   { w:'25%',  bg:'linear-gradient(90deg,#D93535,#E86060)', lbl:'Weak',   lc:'#FF9090', vc:'weak',   vt:'This password would fall to a brute-force attack within seconds.' },
    fair:   { w:'50%',  bg:'linear-gradient(90deg,#B86A00,#E09030)', lbl:'Fair',   lc:'#FFCF7A', vc:'fair',   vt:'Getting there , add more variety to reach a secure password.' },
    good:   { w:'75%',  bg:'linear-gradient(90deg,#9A8A00,#D4C000)', lbl:'Good',   lc:'#FFE888', vc:'good',   vt:'Almost strong , satisfy one more rule to finish.' },
    strong: { w:'100%', bg:'linear-gradient(90deg,#0D9E60,#38E09A)', lbl:'Strong', lc:'#72FFB8', vc:'strong', vt:'All four rules satisfied. This is a strong password.' }
  };

  const key = score <= 1 ? 'weak' : score === 2 ? 'fair' : score === 3 ? 'good' : 'strong';
  const c   = cfg[key];

  bar.style.width      = c.w;
  bar.style.background = c.bg;
  level.textContent    = c.lbl;
  level.style.color    = c.lc;
  verdict.className    = 'verdict ' + c.vc;
  verdict.textContent  = c.vt;
}

function toggleEye() {
  const f = document.getElementById('pw');
  const i = document.getElementById('eye-icon');
  if (f.type === 'password') {
    f.type = 'text';
    i.className = 'ri-eye-off-line';
  } else {
    f.type = 'password';
    i.className = 'ri-eye-line';
  }
}

// ── Scroll-triggered reveals ───────────────────────────────
function observeCards(selector, delay = 90) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.card, .step').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), i * delay);
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(selector).forEach(el => obs.observe(el));
}
observeCards('#cards-why');
observeCards('#steps-list');
observeCards('#cards-code');

// ── Counter animation ──────────────────────────────────────
const statEl = document.getElementById('stat-num');
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const target = parseInt(statEl.dataset.target);
      let current = 0;
      const step = () => {
        current = Math.min(current + 2, target);
        statEl.textContent = current + '%';
        if (current < target) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      statObs.disconnect();
    }
  });
}, { threshold: 0.5 });
statObs.observe(statEl);
</script>
</body>
</html>"""

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(HTML.encode())

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body   = self.rfile.read(length)
        params = json.loads(body) if body else {}
        result = check_password(params.get("pw", ""))
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

print(f"Password Strength Checker running at  http://localhost:{PORT}")
with socketserver.TCPServer(("", PORT), Handler) as srv:
    srv.serve_forever()
