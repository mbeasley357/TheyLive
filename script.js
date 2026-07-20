(() => {
  "use strict";

  const WORDS = [
    "OBEY",
    "CONSUME",
    "SUBMIT",
    "WATCH TV",
    "MARRY AND REPRODUCE",
    "STAY ASLEEP",
    "NO INDEPENDENT THOUGHT",
    "BUY",
    "DO NOT QUESTION AUTHORITY",
    "THIS IS YOUR GOD",
    "CONFORM",
    "SLEEP",
    "WORK",
    "BELIEVE",
    "PAY YOUR TAXES"
  ];

  const AUTO_CYCLE_MS = 4000;
  const TAP_WINDOW_MS = 2000;
  const TAP_THRESHOLD = 5;
  const STORAGE_KEY = "theylive_counter";

  const body = document.body;
  const glassesToggle = document.getElementById("glassesToggle");
  const commandWordEl = document.getElementById("commandWord");
  const revealBtn = document.getElementById("revealBtn");
  const autoBtn = document.getElementById("autoBtn");
  const soundBtn = document.getElementById("soundBtn");
  const counterEl = document.getElementById("counter");
  const shareBtn = document.getElementById("shareBtn");
  const qrImg = document.getElementById("qrImg");
  const staticBurst = document.querySelector(".static-burst");
  const toast = document.getElementById("toast");

  let lastWord = null;
  let autoTimer = null;
  let soundOn = false;
  let audioCtx = null;
  let tapTimes = [];

  // ---------------- Counter (persisted) ----------------

  function getCounter() {
    return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
  }

  function bumpCounter() {
    const next = getCounter() + 1;
    localStorage.setItem(STORAGE_KEY, String(next));
    counterEl.textContent = String(next);
  }

  counterEl.textContent = String(getCounter());

  // ---------------- Word cycling ----------------

  function pickWord() {
    if (WORDS.length === 1) return WORDS[0];
    let word;
    do {
      word = WORDS[Math.floor(Math.random() * WORDS.length)];
    } while (word === lastWord);
    lastWord = word;
    return word;
  }

  function revealWord({ silent = false } = {}) {
    commandWordEl.textContent = pickWord();
    commandWordEl.classList.remove("flicker");
    // force reflow so the animation can restart
    void commandWordEl.offsetWidth;
    commandWordEl.classList.add("flicker");
    bumpCounter();
    if (!silent && soundOn) playStatic(0.12);
  }

  revealBtn.addEventListener("click", () => revealWord());

  commandWordEl.addEventListener("click", handleTap);
  commandWordEl.addEventListener("touchstart", handleTap, { passive: true });

  function handleTap() {
    const now = Date.now();
    tapTimes.push(now);
    tapTimes = tapTimes.filter((t) => now - t < TAP_WINDOW_MS);
    if (tapTimes.length >= TAP_THRESHOLD) {
      tapTimes = [];
      easterEgg();
    }
  }

  function easterEgg() {
    let i = 0;
    const rapid = setInterval(() => {
      commandWordEl.textContent = WORDS[Math.floor(Math.random() * WORDS.length)];
      i++;
      if (i > 4) {
        clearInterval(rapid);
        commandWordEl.textContent = "THEY LIVE";
        showToast("You can see them now.");
        if (soundOn) playStatic(0.35);
        setTimeout(() => revealWord({ silent: true }), 1800);
      }
    }, AUTO_CYCLE_MS);
    triggerStaticBurst();
  }

  // ---------------- Auto-cycle ----------------

  function setAutoCycle(on) {
    autoBtn.setAttribute("aria-pressed", String(on));
    autoBtn.textContent = `Auto-Cycle: ${on ? "On" : "Off"}`;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = on ? setInterval(() => revealWord(), AUTO_CYCLE_MS) : null;
  }

  autoBtn.addEventListener("click", () => {
    const isOn = autoBtn.getAttribute("aria-pressed") === "true";
    setAutoCycle(!isOn);
  });

  // ---------------- Sound (synthesized static, no audio files) ----------------

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    return audioCtx;
  }

  function playStatic(duration = 0.15) {
    const ctx = ensureAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.value = 0.25;

    source.connect(gain).connect(ctx.destination);
    source.start();
  }

  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    soundBtn.textContent = soundOn ? "🔊 Sound: On" : "🔇 Sound: Off";
    if (soundOn) {
      ensureAudio();
      playStatic(0.15);
    }
  });

  // ---------------- Glasses toggle ----------------

  function triggerStaticBurst() {
    staticBurst.classList.remove("play");
    void staticBurst.offsetWidth;
    staticBurst.classList.add("play");
  }

  function setGlasses(on) {
    body.classList.toggle("mode-glasses", on);
    body.classList.toggle("mode-ad", !on);
    glassesToggle.setAttribute("aria-pressed", String(on));
    glassesToggle.querySelector(".glasses-toggle-text").textContent = on
      ? "🕶️ TAKE OFF THE GLASSES"
      : "🕶️ PUT ON THE GLASSES";
    triggerStaticBurst();
    if (soundOn) playStatic(0.25);

    if (on) {
      revealWord({ silent: true });
      setAutoCycle(false);
    } else if (autoTimer) {
      setAutoCycle(false);
    }
  }

  glassesToggle.addEventListener("click", () => {
    const isOn = glassesToggle.getAttribute("aria-pressed") === "true";
    setGlasses(!isOn);
  });

  // ---------------- Share ----------------

  shareBtn.addEventListener("click", async () => {
    const shareData = {
      title: "THEY LIVE // COMMAND",
      text: "Put on the glasses. See what's really being broadcast.",
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled share sheet; nothing to do
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        showToast("Link copied to clipboard");
      } catch (err) {
        showToast(shareData.url);
      }
    } else {
      showToast(shareData.url);
    }
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  // ---------------- QR code (points at this page, wherever it's hosted) ----------------

  function renderQr() {
    const url = window.location.href;
    const size = 140;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  }

  renderQr();

  // ---------------- Init ----------------

  commandWordEl.textContent = pickWord();
})();
