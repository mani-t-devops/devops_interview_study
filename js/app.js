/**
 * Core Application Controller for DevOps Study Hub
 */

class DevOpsApp {
  constructor() {
    this.currentDayId = 1;
    this.activeMainView = "study-plan"; // 'study-plan' | 'terminal' | 'simulator' | 'flashcards' | 'star' | 'architectures' | 'cheatsheets'
    this.activeSubTab = "theory"; // 'theory' | 'qa' | 'lab' | 'system-design' | 'checklist'
    this.theme = localStorage.getItem("devops_theme") || "dark";
    this.checkedItems = new Set(JSON.parse(localStorage.getItem("devops_study_checked_items") || "[]"));
    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.renderSidebarDays();
    this.loadDay(1);
    this.setupNavigationEvents();
    this.updateGlobalProgress();

    // Initialize standalone components
    window.terminalInstance = new DevOpsTerminal("terminal-component-container");
    window.studyTimer = new StudyTimer("study-timer-container");
    window.incidentSimulator = new IncidentSimulator("incident-sim-container");
    window.flashcardsEngine = new FlashcardsEngine("flashcards-comp-container");
    window.starBuilder = new StarBuilder("star-builder-comp-container");
    window.searchEngine = new SearchEngine();
  }

  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("devops_theme", theme);
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.innerHTML = theme === "dark" ? "☀️ Light" : "🌙 Dark";
    }
  }

  toggleTheme() {
    this.applyTheme(this.theme === "dark" ? "light" : "dark");
  }

  setupNavigationEvents() {
    // Theme toggle
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    // Mobile sidebar toggle
    const menuBtn = document.getElementById("mobile-menu-toggle");
    const sidebar = document.getElementById("app-sidebar");
    if (menuBtn && sidebar) {
      menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
      });
    }

    // Main nav links
    const navItems = document.querySelectorAll("[data-nav-view]");
    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const view = item.getAttribute("data-nav-view");
        this.switchMainTab(view);
      });
    });

    // Sub tabs inside Study Plan view
    const subTabBtns = document.querySelectorAll(".tab-btn[data-subtab]");
    subTabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-subtab");
        this.switchSubTab(tab);
      });
    });
  }

  renderSidebarDays() {
    const list = document.getElementById("sidebar-days-list");
    if (!list || typeof DEVOPS_STUDY_DAYS === "undefined") return;

    let html = "";
    DEVOPS_STUDY_DAYS.forEach((d) => {
      const isCompleted = this.isDayCompleted(d.id);
      html += `
        <div class="nav-item ${d.id === this.currentDayId ? "active" : ""}" data-day-nav="${d.id}" onclick="window.app.loadDay(${d.id})">
          <span class="day-badge-dot ${isCompleted ? "completed" : ""}"></span>
          <span style="font-size: 0.85rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            Day ${d.dayNum}: ${d.title.split(",")[0].split(":")[0]}
          </span>
          <span class="nav-pill">D${d.dayNum}</span>
        </div>
      `;
    });
    list.innerHTML = html;
  }

  isDayCompleted(dayId) {
    const day = DEVOPS_STUDY_DAYS.find((d) => d.id === dayId);
    if (!day) return false;
    return day.checklist.every((_, idx) => this.checkedItems.has(`day-${dayId}-item-${idx}`));
  }

  loadDay(dayId) {
    this.currentDayId = dayId;
    this.switchMainTab("study-plan");

    // Update sidebar active states
    document.querySelectorAll("[data-day-nav]").forEach((el) => {
      if (parseInt(el.getAttribute("data-day-nav"), 10) === dayId) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });

    const day = DEVOPS_STUDY_DAYS.find((d) => d.id === dayId);
    if (!day) return;

    // Render Hero Banner
    const heroCard = document.getElementById("day-hero-container");
    if (heroCard) {
      heroCard.innerHTML = `
        <div class="hero-meta-row">
          <span class="badge badge-cyan">Week ${day.week} &bull; Day ${day.dayNum} of 14</span>
          ${day.tags.map((t) => `<span class="badge badge-muted">${t}</span>`).join("")}
        </div>
        <h1 class="day-title">${day.title}</h1>
        <p class="day-description">${day.summary}</p>
        
        <div class="hero-actions-bar">
          <div class="time-breakdown">
            <span class="time-item">⏱️ Theory: <strong>${day.timeSplit.theory}</strong></span>
            <span class="time-item">🛠️ Lab: <strong>${day.timeSplit.lab}</strong></span>
            <span class="time-item">🎯 Q&A: <strong>${day.timeSplit.qa}</strong></span>
            <span class="time-item">📐 System Design: <strong>${day.timeSplit.systemDesign}</strong></span>
            <span class="time-item">📖 Stories: <strong>${day.timeSplit.stories}</strong></span>
          </div>
          <div>
            <button class="action-btn emerald" onclick="window.app.markDayAllChecked(${day.id})">
              ✓ Mark Day Complete
            </button>
          </div>
        </div>
      `;
    }

    // Render Theory Tab
    const theoryPanel = document.getElementById("subtab-theory");
    if (theoryPanel) {
      theoryPanel.innerHTML = day.theory
        .map(
          (t) => `
        <div class="content-card">
          <h3 class="card-title">${t.title}</h3>
          <div style="white-space: pre-wrap; font-size: 0.95rem; line-height: 1.7; color: #cbd5e1;">${this.formatContent(t.content)}</div>
        </div>
      `
        )
        .join("");
    }

    // Render Interview Q&A Tab
    const qaPanel = document.getElementById("subtab-qa");
    if (qaPanel) {
      qaPanel.innerHTML = day.qa
        .map(
          (q, idx) => `
        <div class="qa-card ${idx === 0 ? "open" : ""}" id="qa-card-${day.id}-${idx}">
          <div class="qa-header" onclick="window.app.toggleQA('qa-card-${day.id}-${idx}')">
            <div class="qa-title-wrap">
              <span class="qa-q-mark">Q${idx + 1}</span>
              <div>
                <div class="qa-title">${this.escapeHtml(q.question)}</div>
                <div style="font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 3px;">
                  Category: ${q.category}
                </div>
              </div>
            </div>
            <svg class="qa-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div class="qa-body">
            <div class="callout callout-senior" style="margin-top: 0;">
              <div class="callout-icon">🎯</div>
              <div class="callout-content">
                <div class="callout-title">What the Interviewer is Secretly Grading You On:</div>
                <p>${q.interviewerFocus}</p>
              </div>
            </div>

            <div class="qa-comparison-grid">
              <div class="qa-box qa-box-senior">
                <div class="qa-box-title">
                  <span>✅ Senior Answer (5 YOE Benchmark)</span>
                </div>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #f1f5f9;">${this.formatContent(q.seniorAnswer)}</div>
              </div>

              <div class="qa-box qa-box-junior">
                <div class="qa-box-title">
                  <span>❌ Common Junior / Reject Trap</span>
                </div>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #fecdd3;">${q.juniorMistake}</div>
              </div>
            </div>

            ${
              q.followUpQuestions && q.followUpQuestions.length > 0
                ? `<div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                    <strong style="color: var(--accent-amber); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.5rem;">
                      Likely Senior Follow-Up Questions:
                    </strong>
                    <ul style="padding-left: 1.25rem; font-size: 0.88rem; color: #cbd5e1; line-height: 1.6;">
                      ${q.followUpQuestions.map((f) => `<li>${f}</li>`).join("")}
                    </ul>
                  </div>`
                : ""
            }
          </div>
        </div>
      `
        )
        .join("");
    }

    // Render Hands-on Lab Tab
    const labPanel = document.getElementById("subtab-lab");
    if (labPanel) {
      labPanel.innerHTML = `
        <div class="content-card">
          <div class="card-title-row">
            <h3 class="card-title">🛠️ ${day.handsOn.title}</h3>
            <span class="badge badge-emerald">Interactive Lab</span>
          </div>
          <p style="color: var(--text-secondary); margin-bottom: 1.25rem; font-size: 0.95rem;">
            <strong>Objective:</strong> ${day.handsOn.objective}
          </p>

          <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 0.5rem; text-transform: uppercase;">
            Step-by-Step Lab Execution:
          </h4>
          <ol style="padding-left: 1.25rem; color: #cbd5e1; margin-bottom: 1.5rem; line-height: 1.8; font-size: 0.9rem;">
            ${day.handsOn.steps.map((s) => `<li>${s}</li>`).join("")}
          </ol>

          <div class="code-container">
            <div class="code-header">
              <span class="code-lang-tag">${day.handsOn.snippetLang} &bull; ${day.handsOn.snippetTitle}</span>
              <button class="copy-btn" onclick="window.app.copyText('${this.escapeQuotes(day.handsOn.snippetCode)}')">
                📋 Copy Config
              </button>
            </div>
            <pre class="code-block"><code>${this.escapeHtml(day.handsOn.snippetCode)}</code></pre>
          </div>

          <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--accent-emerald); margin-top: 1.5rem; margin-bottom: 0.5rem; text-transform: uppercase;">
            Verification & Triage Commands:
          </h4>
          <div class="code-container">
            <div class="code-header">
              <span class="code-lang-tag">bash CLI</span>
              <button class="copy-btn" onclick="window.app.copyText('${this.escapeQuotes(day.handsOn.verificationCmd)}')">
                📋 Copy Commands
              </button>
            </div>
            <pre class="code-block"><code>${this.escapeHtml(day.handsOn.verificationCmd)}</code></pre>
          </div>
        </div>
      `;
    }

    // Render System Design Tab
    const sdPanel = document.getElementById("subtab-system-design");
    if (sdPanel) {
      sdPanel.innerHTML = `
        <div class="content-card">
          <div class="card-title-row">
            <h3 class="card-title">📐 ${day.systemDesign.title}</h3>
            <span class="badge badge-indigo">Whiteboard Scenario</span>
          </div>
          <p style="color: var(--text-secondary); margin-bottom: 1.25rem; font-size: 0.95rem;">
            <strong>Scenario:</strong> ${day.systemDesign.scenario}
          </p>

          <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 0.75rem; text-transform: uppercase;">
            Senior Architectural Blueprints & Principles:
          </h4>
          <ul style="padding-left: 1.25rem; color: #cbd5e1; margin-bottom: 1.5rem; line-height: 1.8; font-size: 0.92rem;">
            ${day.systemDesign.architecturePrinciples.map((p) => `<li>${p}</li>`).join("")}
          </ul>

          <div class="callout callout-warning">
            <div class="callout-icon">⚖️</div>
            <div class="callout-content">
              <div class="callout-title">Architectural Trade-Off Analysis:</div>
              <p>${day.systemDesign.tradeOffs}</p>
            </div>
          </div>
        </div>
      `;
    }

    // Render Checklist Tab
    const checkPanel = document.getElementById("subtab-checklist");
    if (checkPanel) {
      checkPanel.innerHTML = `
        <div class="content-card">
          <h3 class="card-title" style="margin-bottom: 1rem;">Daily Mastery Checklist</h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 1.25rem;">
            Check off each topic as you master it today to update your 2-week progress tracker.
          </p>
          <div class="checklist-container">
            ${day.checklist
              .map((item, idx) => {
                const key = `day-${day.id}-item-${idx}`;
                const isChecked = this.checkedItems.has(key);
                return `
                <div class="checklist-item ${isChecked ? "checked" : ""}" onclick="window.app.toggleCheckItem('${key}')">
                  <div class="checkbox-custom">${isChecked ? "✓" : ""}</div>
                  <div class="checklist-text">${item}</div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      `;
    }

    // Restore active subtab
    this.switchSubTab(this.activeSubTab);
  }

  toggleQA(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
      card.classList.toggle("open");
    }
  }

  toggleCheckItem(key) {
    if (this.checkedItems.has(key)) {
      this.checkedItems.delete(key);
    } else {
      this.checkedItems.add(key);
    }
    localStorage.setItem("devops_study_checked_items", JSON.stringify([...this.checkedItems]));
    this.loadDay(this.currentDayId);
    this.renderSidebarDays();
    this.updateGlobalProgress();
  }

  markDayAllChecked(dayId) {
    const day = DEVOPS_STUDY_DAYS.find((d) => d.id === dayId);
    if (!day) return;
    day.checklist.forEach((_, idx) => {
      this.checkedItems.add(`day-${dayId}-item-${idx}`);
    });
    localStorage.setItem("devops_study_checked_items", JSON.stringify([...this.checkedItems]));
    this.loadDay(dayId);
    this.renderSidebarDays();
    this.updateGlobalProgress();
  }

  updateGlobalProgress() {
    let totalItems = 0;
    DEVOPS_STUDY_DAYS.forEach((d) => (totalItems += d.checklist.length));
    const completedCount = this.checkedItems.size;
    const pct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    const fillBar = document.getElementById("sidebar-progress-fill");
    const label = document.getElementById("sidebar-progress-label");
    if (fillBar) fillBar.style.width = `${pct}%`;
    if (label) label.textContent = `${pct}% Complete (${completedCount}/${totalItems})`;
  }

  switchMainTab(viewName) {
    this.activeMainView = viewName;

    // Update navigation active states
    document.querySelectorAll("[data-nav-view]").forEach((el) => {
      if (el.getAttribute("data-nav-view") === viewName) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });

    // Toggle view visibility
    const views = ["study-plan", "terminal", "simulator", "flashcards", "star", "architectures", "cheatsheets"];
    views.forEach((v) => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        el.style.display = v === viewName ? "block" : "none";
      }
    });

    // Special render triggers
    if (viewName === "architectures") {
      this.renderArchitecturesView();
    } else if (viewName === "cheatsheets") {
      this.renderCheatsheetsView();
    }

    // Close mobile sidebar if open
    const sidebar = document.getElementById("app-sidebar");
    if (sidebar) sidebar.classList.remove("mobile-open");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  switchSubTab(tabName) {
    this.activeSubTab = tabName;

    // Update tab button styles
    document.querySelectorAll(".tab-btn[data-subtab]").forEach((btn) => {
      if (btn.getAttribute("data-subtab") === tabName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Show selected panel
    const panels = ["theory", "qa", "lab", "system-design", "checklist"];
    panels.forEach((p) => {
      const panel = document.getElementById(`subtab-${p}`);
      if (panel) {
        panel.className = p === tabName ? "tab-panel active" : "tab-panel";
      }
    });
  }

  renderArchitecturesView() {
    const container = document.getElementById("view-architectures");
    if (!container || typeof ARCHITECTURES_DATA === "undefined") return;

    container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.35rem;">
          Interactive Architecture Flow Visualizer
        </h2>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">
          Step through critical production flows: packet lifecycle from browser to pod, zero-downtime GitOps pipelines, and global observability.
        </p>
      </div>

      ${ARCHITECTURES_DATA.map(
        (arch) => `
        <div class="content-card" style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 0.25rem;">
            ${arch.title}
          </h3>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1.5rem;">${arch.description}</p>

          <div style="display: flex; flex-direction: column; gap: 1rem; position: relative;">
            ${arch.steps
              .map(
                (step) => `
              <div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-cyan-glow); color: var(--accent-cyan); border: 1px solid var(--accent-cyan); display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-mono); flex-shrink: 0;">
                  ${step.step}
                </div>
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; flex-wrap: wrap; gap: 0.5rem;">
                    <span style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${step.component}</span>
                    <span class="badge badge-muted" style="font-size: 0.68rem;">${step.layer}</span>
                  </div>
                  <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 0.5rem;">${step.details}</p>
                  <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-emerald);">
                    &gt; ${step.techDetails}
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
      ).join("")}
    `;
  }

  renderCheatsheetsView() {
    const container = document.getElementById("view-cheatsheets");
    if (!container || typeof CHEATSHEETS_DATA === "undefined") return;

    container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.35rem;">
          Senior DevOps Command Reference & Cheatsheets
        </h2>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">
          One-click copyable high-frequency diagnostic commands for Linux, Kubernetes, Terraform, and cloud networking.
        </p>
      </div>

      ${CHEATSHEETS_DATA.map(
        (sheet) => `
        <div class="content-card" style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 0.25rem;">
            ${sheet.title}
          </h3>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1.5rem;">${sheet.description}</p>

          ${sheet.sections
            .map(
              (sec) => `
            <div style="margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.95rem; font-weight: 700; text-transform: uppercase; color: var(--accent-emerald); margin-bottom: 0.75rem; letter-spacing: 0.05em;">
                ${sec.sectionTitle}
              </h4>
              <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                ${sec.commands
                  .map(
                    (c) => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: #060a12; border: 1px solid var(--border-color); border-radius: 6px; gap: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 280px;">
                      <code style="font-family: var(--font-mono); color: var(--accent-cyan); font-size: 0.85rem; font-weight: 600;">${this.escapeHtml(c.cmd)}</code>
                      <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 3px;">${c.desc}</div>
                    </div>
                    <button class="copy-btn" onclick="window.app.copyText('${this.escapeQuotes(c.cmd)}')">
                      📋 Copy
                    </button>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `
      ).join("")}
    `;
  }

  copyText(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Clipboard copy failed: ", err);
      });
  }

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  escapeQuotes(str) {
    if (!str) return "";
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  }

  formatContent(text) {
    if (!text) return "";
    // Basic formatting for markdown bold and backticks
    let out = this.escapeHtml(text);
    out = out.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary);">$1</strong>');
    out = out.replace(/`([^`]+)`/g, '<code style="font-family: var(--font-mono); color: var(--accent-cyan); background: rgba(56,189,248,0.1); padding: 1px 5px; border-radius: 4px;">$1</code>');
    return out;
  }
}

// Instantiate on DOM load
document.addEventListener("DOMContentLoaded", () => {
  window.app = new DevOpsApp();
});
