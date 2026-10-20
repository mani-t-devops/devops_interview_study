/**
 * 50+ Rapid-Fire Senior DevOps Flashcards Component
 */

class FlashcardsEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.deck = typeof FLASHCARDS_DATA !== "undefined" ? [...FLASHCARDS_DATA] : [];
    this.filteredDeck = [...this.deck];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.selectedCategory = "All";
    this.masteredIds = new Set(JSON.parse(localStorage.getItem("devops_flashcards_mastered") || "[]"));
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.setupKeyboardEvents();
  }

  setupKeyboardEvents() {
    window.addEventListener("keydown", (e) => {
      // Only trigger if flashcards section is visible
      const flashcardsTab = document.getElementById("tab-flashcards");
      if (!flashcardsTab || flashcardsTab.style.display === "none") return;

      if (e.code === "Space") {
        e.preventDefault();
        this.flip();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        this.next();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        this.prev();
      }
    });
  }

  render() {
    const categories = ["All", ...new Set(this.deck.map((c) => c.category))];
    const totalMastered = this.deck.filter((c) => this.masteredIds.has(c.id)).length;
    const masteryPercent = Math.round((totalMastered / this.deck.length) * 100) || 0;

    let html = `
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-primary);">
            50 Rapid-Fire Senior DevOps Flashcards
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Test your core recall on Linux internals, Kubernetes edge cases, Cloud networking, Terraform, and SRE math.
          </p>
        </div>

        <div style="min-width: 220px; text-align: right;">
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.35rem;">
            Mastery: <strong>${totalMastered} / ${this.deck.length}</strong> (${masteryPercent}%)
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${masteryPercent}%;"></div>
          </div>
        </div>
      </div>

      <!-- Categories & Shuffle Bar -->
      <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.75rem; margin-bottom: 1.5rem; align-items: center;">
        ${categories
          .map(
            (cat) => `
          <button class="timer-preset-btn ${this.selectedCategory === cat ? "active" : ""}" onclick="window.flashcardsEngine.filterCategory('${cat}')">
            ${cat}
          </button>
        `
          )
          .join("")}
        <button class="action-btn" style="margin-left: auto; font-size: 0.76rem;" onclick="window.flashcardsEngine.shuffle()">
          🔀 Shuffle
        </button>
      </div>

      <div class="flashcards-container" id="flashcard-render-slot">
        <!-- Render current card -->
      </div>
    `;

    this.container.innerHTML = html;
    this.renderCurrentCard();
  }

  renderCurrentCard() {
    const slot = document.getElementById("flashcard-render-slot");
    if (!slot) return;

    if (this.filteredDeck.length === 0) {
      slot.innerHTML = `<div class="content-card" style="text-align: center; padding: 2rem;">No cards found for this category.</div>`;
      return;
    }

    const card = this.filteredDeck[this.currentIndex];
    const isMastered = this.masteredIds.has(card.id);

    slot.innerHTML = `
      <div class="flashcard-scene" onclick="window.flashcardsEngine.flip()">
        <div class="flashcard ${this.isFlipped ? "is-flipped" : ""}" id="active-flashcard-element">
          <!-- FRONT FACE -->
          <div class="flashcard-face flashcard-front">
            <div class="flashcard-header">
              <span class="badge badge-cyan">${card.category}</span>
              <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">
                ${this.currentIndex + 1} / ${this.filteredDeck.length}
              </span>
            </div>
            <div class="flashcard-body">
              <div class="flashcard-question">${card.question}</div>
            </div>
            <div class="flashcard-footer">
              <span>Click or Press [Space] to flip answer</span>
              ${isMastered ? '<span class="badge badge-emerald">MASTERED</span>' : '<span style="color: var(--text-muted);">Unmastered</span>'}
            </div>
          </div>

          <!-- BACK FACE -->
          <div class="flashcard-face flashcard-back">
            <div class="flashcard-header">
              <span class="badge badge-emerald">Answer & Analysis</span>
              <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">
                ${this.currentIndex + 1} / ${this.filteredDeck.length}
              </span>
            </div>
            <div class="flashcard-body" style="overflow-y: auto;">
              <div class="flashcard-answer" style="white-space: pre-wrap; margin-bottom: 1rem;">${card.answer}</div>
              ${
                card.seniorTip
                  ? `<div class="callout callout-senior" style="margin: 0; padding: 0.75rem 1rem;">
                      <div class="callout-icon">💡</div>
                      <div class="callout-content" style="font-size: 0.82rem;">
                        <strong>Senior Tip:</strong> ${card.seniorTip}
                      </div>
                    </div>`
                  : ""
              }
            </div>
            <div class="flashcard-footer">
              <span>Click or Press [Space] to flip back</span>
              <span style="color: var(--accent-cyan); font-weight: 600;">Use &larr; / &rarr; keys to navigate</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flashcard-controls">
        <button class="action-btn" onclick="window.flashcardsEngine.prev()">&larr; Previous</button>
        <button class="action-btn ${isMastered ? "emerald" : ""}" onclick="window.flashcardsEngine.toggleMastered(${card.id})">
          ${isMastered ? "✓ Mastered (Click to Unmark)" : "Mark as Mastered"}
        </button>
        <button class="action-btn primary" onclick="window.flashcardsEngine.next()">Next Card &rarr;</button>
      </div>
    `;
  }

  flip() {
    this.isFlipped = !this.isFlipped;
    const cardEl = document.getElementById("active-flashcard-element");
    if (cardEl) {
      if (this.isFlipped) cardEl.classList.add("is-flipped");
      else cardEl.classList.remove("is-flipped");
    }
  }

  next() {
    this.isFlipped = false;
    this.currentIndex = (this.currentIndex + 1) % this.filteredDeck.length;
    this.renderCurrentCard();
  }

  prev() {
    this.isFlipped = false;
    this.currentIndex = (this.currentIndex - 1 + this.filteredDeck.length) % this.filteredDeck.length;
    this.renderCurrentCard();
  }

  filterCategory(cat) {
    this.selectedCategory = cat;
    this.currentIndex = 0;
    this.isFlipped = false;
    if (cat === "All") {
      this.filteredDeck = [...this.deck];
    } else {
      this.filteredDeck = this.deck.filter((c) => c.category === cat);
    }
    this.render();
  }

  shuffle() {
    for (let i = this.filteredDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.filteredDeck[i], this.filteredDeck[j]] = [this.filteredDeck[j], this.filteredDeck[i]];
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    this.renderCurrentCard();
  }

  toggleMastered(id) {
    if (this.masteredIds.has(id)) {
      this.masteredIds.delete(id);
    } else {
      this.masteredIds.add(id);
    }
    localStorage.setItem("devops_flashcards_mastered", JSON.stringify([...this.masteredIds]));
    this.render();
  }
}

if (typeof window !== "undefined") {
  window.FlashcardsEngine = FlashcardsEngine;
}
