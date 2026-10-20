/**
 * Global Instant Search Engine (Cmd+K / Ctrl+K)
 */

class SearchEngine {
  constructor() {
    this.modal = document.getElementById("search-modal");
    this.searchInput = document.getElementById("search-modal-input");
    this.resultsContainer = document.getElementById("search-results-list");
    this.index = [];
    this.buildIndex();
    this.setupEvents();
  }

  buildIndex() {
    this.index = [];

    // Index Days & Q&A
    if (typeof DEVOPS_STUDY_DAYS !== "undefined") {
      DEVOPS_STUDY_DAYS.forEach((day) => {
        // Index Day
        this.index.push({
          type: "Day",
          title: `Day ${day.dayNum}: ${day.title}`,
          snippet: day.summary,
          dayId: day.id,
          tab: "theory"
        });

        // Index Theory Sections
        day.theory.forEach((th) => {
          this.index.push({
            type: "Theory",
            title: `Day ${day.dayNum} - ${th.title}`,
            snippet: th.content.slice(0, 160) + "...",
            dayId: day.id,
            tab: "theory"
          });
        });

        // Index Q&A
        day.qa.forEach((q) => {
          this.index.push({
            type: "Interview Q&A",
            title: q.question,
            snippet: q.seniorAnswer.slice(0, 160) + "...",
            dayId: day.id,
            tab: "qa"
          });
        });
      });
    }

    // Index Flashcards
    if (typeof FLASHCARDS_DATA !== "undefined") {
      FLASHCARDS_DATA.forEach((card) => {
        this.index.push({
          type: "Flashcard",
          title: `[${card.category}] ${card.question}`,
          snippet: card.answer.slice(0, 160) + "...",
          tab: "flashcards"
        });
      });
    }

    // Index Cheatsheets
    if (typeof CHEATSHEETS_DATA !== "undefined") {
      CHEATSHEETS_DATA.forEach((sheet) => {
        sheet.sections.forEach((sec) => {
          sec.commands.forEach((c) => {
            this.index.push({
              type: "Cheatsheet",
              title: `${c.cmd}`,
              snippet: `${c.desc} (${sheet.title})`,
              tab: "cheatsheets"
            });
          });
        });
      });
    }
  }

  setupEvents() {
    // Keyboard shortcut Cmd+K or Ctrl+K or /
    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        this.open();
      } else if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        this.open();
      } else if (e.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });

    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.search(e.target.value.trim());
      });
    }

    const triggerBtn = document.getElementById("search-trigger");
    if (triggerBtn) {
      triggerBtn.addEventListener("click", () => this.open());
    }

    const closeBtn = document.getElementById("search-modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.close();
      });
    }
  }

  isOpen() {
    return this.modal && this.modal.classList.contains("open");
  }

  open() {
    if (!this.modal) return;
    this.modal.classList.add("open");
    if (this.searchInput) {
      this.searchInput.value = "";
      this.searchInput.focus();
    }
    this.search("");
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove("open");
  }

  search(query) {
    if (!this.resultsContainer) return;

    if (!query) {
      this.resultsContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 1.5rem; font-size: 0.88rem;">
          Type any keyword (e.g. <em>iptables, OOMKilled, IRSA, TIME_WAIT, ndots, drift, SLO</em>) to search all 14 days, Q&As, and commands.
        </div>
      `;
      return;
    }

    const qLower = query.toLowerCase();
    const matches = this.index
      .filter((item) => item.title.toLowerCase().includes(qLower) || item.snippet.toLowerCase().includes(qLower))
      .slice(0, 15);

    if (matches.length === 0) {
      this.resultsContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
          No matching topics or questions found for "<strong>${this.escapeHtml(query)}</strong>".
        </div>
      `;
      return;
    }

    this.resultsContainer.innerHTML = matches
      .map(
        (m) => `
        <div class="search-result-item" onclick="window.searchEngine.selectResult(${m.dayId || "null"}, '${m.tab}')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <div class="search-item-title">${this.escapeHtml(m.title)}</div>
            <span class="badge badge-muted" style="font-size: 0.65rem;">${m.type}</span>
          </div>
          <div class="search-item-snippet">${this.escapeHtml(m.snippet)}</div>
        </div>
      `
      )
      .join("");
  }

  selectResult(dayId, tab) {
    this.close();
    if (dayId && window.app) {
      window.app.loadDay(dayId);
      if (tab) window.app.switchSubTab(tab);
    } else if (tab && window.app) {
      window.app.switchMainTab(tab);
    }
  }

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

if (typeof window !== "undefined") {
  window.SearchEngine = SearchEngine;
}
