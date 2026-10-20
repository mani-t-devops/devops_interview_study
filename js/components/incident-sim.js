/**
 * Interactive Incident Troubleshooting Simulator (RCA Game)
 */

class IncidentSimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeIncident = null;
    this.currentStageIndex = 0;
    this.attempts = 0;
    this.init();
  }

  init() {
    if (!this.container || typeof INCIDENTS_DATA === "undefined") return;
    this.renderIncidentSelector();
  }

  renderIncidentSelector() {
    let html = `
      <div style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">
          Production Incident War Room Simulator
        </h2>
        <p style="color: var(--text-secondary); font-size: 0.95rem; max-width: 800px;">
          Practice live production triage under pressure. Step into the shoes of the Lead Incident Commander: examine alerts, analyze telemetry, choose non-destructive diagnostic paths, and eliminate root causes without causing outages.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
    `;

    INCIDENTS_DATA.forEach((inc) => {
      const isMastered = localStorage.getItem(`devops_incident_mastered_${inc.id}`);
      html += `
        <div class="content-card" style="cursor: pointer; position: relative;" onclick="window.incidentSimulator.loadIncident('${inc.id}')">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <span class="badge ${inc.severity.includes("SEV-1") ? "badge-danger" : "badge-amber"}">${inc.severity}</span>
            ${isMastered ? '<span class="badge badge-emerald">MASTERED</span>' : ""}
          </div>
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">${inc.title}</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">${inc.impact}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.75rem; font-size: 0.78rem; color: var(--text-muted);">
            <span>Service: <strong>${inc.service}</strong></span>
            <span style="color: var(--accent-cyan); font-weight: 600;">Launch War Room &rarr;</span>
          </div>
        </div>
      `;
    });

    html += `</div><div id="incident-active-arena"></div>`;
    this.container.innerHTML = html;
  }

  loadIncident(incidentId) {
    this.activeIncident = INCIDENTS_DATA.find((i) => i.id === incidentId);
    this.currentStageIndex = 0;
    this.attempts = 0;
    this.renderCurrentStage();
  }

  renderCurrentStage() {
    const arena = document.getElementById("incident-active-arena");
    if (!arena || !this.activeIncident) return;

    const currentStage = this.activeIncident.stages[this.currentStageIndex];
    if (!currentStage) return;

    arena.innerHTML = `
      <div class="incident-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <button class="action-btn" onclick="window.incidentSimulator.renderIncidentSelector()">&larr; Back to Scenarios</button>
          <span class="badge badge-cyan">Step ${this.currentStageIndex + 1} of ${this.activeIncident.stages.length}</span>
        </div>

        <div class="incident-alert-banner">
          <span style="font-size: 1.5rem;">🚨</span>
          <div>
            <div style="font-weight: 700; color: var(--accent-rose); font-size: 0.95rem;">${this.activeIncident.severity}: ${this.activeIncident.title}</div>
            <div style="font-size: 0.85rem; color: #fecdd3;">${this.activeIncident.initialDescription}</div>
          </div>
        </div>

        <div style="margin: 1.5rem 0;">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-primary);">
            ${currentStage.question}
          </h3>
          <div class="action-options-grid" id="incident-options-container">
            ${currentStage.options
              .map(
                (opt) => `
              <div class="action-option-card" onclick="window.incidentSimulator.evaluateOption('${opt.id}')">
                <div style="font-size: 0.9rem; font-weight: 500; color: var(--text-primary);">${opt.text}</div>
                <span style="color: var(--accent-cyan); font-weight: bold; margin-left: 1rem;">Select &rarr;</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div id="incident-feedback-box" style="display: none; margin-top: 1.5rem;"></div>
      </div>
    `;

    arena.scrollIntoView({ behavior: "smooth" });
  }

  evaluateOption(optionId) {
    const currentStage = this.activeIncident.stages[this.currentStageIndex];
    const option = currentStage.options.find((o) => o.id === optionId);
    if (!option) return;

    const feedbackBox = document.getElementById("incident-feedback-box");
    feedbackBox.style.display = "block";

    if (option.resultType === "success") {
      feedbackBox.className = "callout callout-success";
      feedbackBox.innerHTML = `
        <div class="callout-icon">✅</div>
        <div class="callout-content">
          <div class="callout-title">Correct Decision!</div>
          <p>${option.feedback}</p>
          ${
            option.isResolved
              ? `<div style="margin-top: 1rem;">
                  <button class="action-btn emerald" onclick="window.incidentSimulator.finishIncident()">Resolve Incident & Review Post-Mortem &rarr;</button>
                </div>`
              : `<div style="margin-top: 1rem;">
                  <button class="action-btn primary" onclick="window.incidentSimulator.nextStage()">Proceed to Next Investigation Step &rarr;</button>
                </div>`
          }
        </div>
      `;
    } else if (option.resultType === "partial") {
      feedbackBox.className = "callout callout-warning";
      feedbackBox.innerHTML = `
        <div class="callout-icon">⚠️</div>
        <div class="callout-content">
          <div class="callout-title">Partial Lead</div>
          <p>${option.feedback}</p>
          <div style="margin-top: 1rem;">
            <button class="action-btn primary" onclick="window.incidentSimulator.nextStage()">Continue Investigation &rarr;</button>
          </div>
        </div>
      `;
    } else {
      feedbackBox.className = "callout callout-danger";
      feedbackBox.innerHTML = `
        <div class="callout-icon">❌</div>
        <div class="callout-content">
          <div class="callout-title">Dangerous or Ineffective Action</div>
          <p>${option.feedback}</p>
          <p style="margin-top: 0.5rem; font-size: 0.82rem; color: var(--text-muted);">Take another look at the symptoms and select a non-destructive diagnostic approach.</p>
        </div>
      `;
    }
  }

  nextStage() {
    this.currentStageIndex++;
    this.renderCurrentStage();
  }

  finishIncident() {
    localStorage.setItem(`devops_incident_mastered_${this.activeIncident.id}`, "true");
    const arena = document.getElementById("incident-active-arena");
    if (!arena) return;

    arena.innerHTML = `
      <div class="incident-box" style="border-color: var(--accent-emerald);">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
          <span style="font-size: 2rem;">🏆</span>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--accent-emerald);">INCIDENT RESOLVED — SLA PROTECTED</h2>
            <p style="color: var(--text-secondary); font-size: 0.88rem;">Outstanding leadership. Service telemetry has returned to healthy baseline.</p>
          </div>
        </div>

        <div class="content-card" style="background: rgba(15, 23, 42, 0.95); margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--accent-cyan);">
            Blameless Post-Mortem: Root Cause Analysis & Preventive Takeaways
          </h3>
          <ul style="padding-left: 1.25rem; color: #cbd5e1; font-size: 0.9rem; line-height: 1.7;">
            ${this.activeIncident.postMortemLessons.map((l) => `<li>${l}</li>`).join("")}
          </ul>
        </div>

        <button class="action-btn primary" onclick="window.incidentSimulator.renderIncidentSelector()">
          &larr; Return to Incident War Room Catalog
        </button>
      </div>
    `;
  }
}

if (typeof window !== "undefined") {
  window.IncidentSimulator = IncidentSimulator;
}
