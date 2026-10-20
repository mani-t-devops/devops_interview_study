/**
 * Daily Study Block Timer with Web Audio Alerts
 */

class StudyTimer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.remainingSeconds = 3600; // default 1 hour
    this.totalSeconds = 3600;
    this.timerInterval = null;
    this.isRunning = false;
    this.activePreset = "theory";
    this.audioCtx = null;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="timer-widget">
        <div style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
          Daily 3–4 Hour Split Study Timer
        </div>

        <div class="timer-clock" id="timer-display">60:00</div>

        <div class="timer-presets">
          <button class="timer-preset-btn active" data-seconds="3600" data-label="1h Theory">1h Theory</button>
          <button class="timer-preset-btn" data-seconds="3600" data-label="1h Lab">1h Lab</button>
          <button class="timer-preset-btn" data-seconds="3600" data-label="1h Q&A">1h Q&A</button>
          <button class="timer-preset-btn" data-seconds="1800" data-label="30m System Design">30m System Design</button>
          <button class="timer-preset-btn" data-seconds="1800" data-label="30m STAR Stories">30m Stories</button>
          <button class="timer-preset-btn" data-seconds="1500" data-label="25m Pomodoro">25m Pomodoro</button>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
          <button class="action-btn primary" id="timer-toggle-btn" style="min-width: 120px; justify-content: center;">
            <span id="timer-toggle-label">Start Focus</span>
          </button>
          <button class="action-btn" id="timer-reset-btn">Reset</button>
        </div>

        <div style="font-size: 0.78rem; color: var(--text-muted); text-align: center;" id="timer-status-text">
          Session: <strong style="color: var(--accent-cyan);">1h Core Theory Revision</strong>. Target: 3.5 hrs daily.
        </div>
      </div>
    `;

    this.display = document.getElementById("timer-display");
    this.toggleBtn = document.getElementById("timer-toggle-btn");
    this.toggleLabel = document.getElementById("timer-toggle-label");
    this.resetBtn = document.getElementById("timer-reset-btn");
    this.statusText = document.getElementById("timer-status-text");

    this.setupEvents();
  }

  setupEvents() {
    this.toggleBtn.addEventListener("click", () => this.toggle());
    this.resetBtn.addEventListener("click", () => this.reset());

    const presets = this.container.querySelectorAll(".timer-preset-btn");
    presets.forEach((btn) => {
      btn.addEventListener("click", () => {
        presets.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const secs = parseInt(btn.getAttribute("data-seconds"), 10);
        const label = btn.getAttribute("data-label");
        this.setTimer(secs, label);
      });
    });
  }

  setTimer(seconds, label) {
    this.pause();
    this.totalSeconds = seconds;
    this.remainingSeconds = seconds;
    this.updateDisplay();
    this.statusText.innerHTML = `Session: <strong style="color: var(--accent-cyan);">${label}</strong>. Target: 3.5 hrs daily.`;
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    this.isRunning = true;
    this.toggleLabel.textContent = "Pause";
    this.toggleBtn.classList.remove("primary");
    this.toggleBtn.classList.add("emerald");

    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.updateDisplay();
      } else {
        this.pause();
        this.playChime();
        this.recordCompletedSession();
        alert("Study Block Complete! Great work. Take a 5-minute break.");
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.toggleLabel.textContent = "Resume";
    this.toggleBtn.classList.remove("emerald");
    this.toggleBtn.classList.add("primary");
  }

  reset() {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.toggleLabel.textContent = "Start Focus";
    this.updateDisplay();
  }

  updateDisplay() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    this.display.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) this.audioCtx = new AudioContext();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn("Audio chime failed:", e);
    }
  }

  recordCompletedSession() {
    const completed = JSON.parse(localStorage.getItem("devops_study_completed_blocks") || "[]");
    completed.push({
      date: new Date().toISOString(),
      seconds: this.totalSeconds
    });
    localStorage.setItem("devops_study_completed_blocks", JSON.stringify(completed));
  }
}

if (typeof window !== "undefined") {
  window.StudyTimer = StudyTimer;
}
