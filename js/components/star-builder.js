/**
 * STAR Story Builder & Interview Portfolio Manager
 */

const DEFAULT_STAR_STORIES = [
  {
    id: "story-1",
    title: "SEV-1 Production Outage: Connection Pool Starvation Resolution",
    category: "Incident Response",
    situation: "During our Black Friday promo handling 15,000 requests/sec, our core payment gateway experienced a SEV-1 outage. ALB 504 Gateway Timeouts surged to 35%, putting $2M in hourly transactions at risk across 90,000 active users.",
    task: "As the lead on-call SRE, I took command of the incident bridge to diagnose root cause, coordinate with 5 engineers, and restore checkout within our 15-minute SLA.",
    action: "1. Verified ALB CPU was healthy; identified target response time spiked to 30s in payment pods. 2. Checked pod health; found 12 pods in CrashLoopBackOff (Exit 137 OOMKilled). 3. Ran `pg_stat_activity` on Amazon Aurora PostgreSQL; discovered 80 scaled pods exhausted `max_connections` (200), causing lock queues. 4. Deployed AWS RDS Proxy transaction-level pooling and rolled back that morning's unindexed query via ArgoCD within 6 minutes.",
    result: "Restored checkout processing in 8 minutes with zero transaction data loss. In the blameless post-mortem, I instituted automated query execution plan linting in our CI/CD pipeline and added mandatory PgBouncer pooling, slashing future connection wait times by 95%."
  },
  {
    id: "story-2",
    title: "Cloud FinOps: $384,000 Annual AWS Cost Reduction",
    category: "Cost Optimization (FinOps)",
    situation: "Our annual AWS cloud expenditure had ballooned to $1.4M, with our production EKS cluster accounting for 65% of the total bill. Leadership mandated a 25% cost reduction without degrading our 99.9% SLA.",
    task: "I was appointed FinOps technical lead to audit resource consumption, eliminate cloud waste, and implement automated elasticity across 25 engineering teams.",
    action: "1. Deployed Kubecost for namespace-level chargeback visibility. 2. Identified average container CPU utilization was only 18%; rightsized requests across 200 deployments using 90-day Prometheus p95 metrics. 3. Replaced static Cluster Autoscaler On-Demand node groups with Karpenter running diversified Spot instances for stateless microservices. 4. Discovered $3,500/mo in NAT Gateway processing fees for ECR/S3; deployed private VPC Gateway Endpoints.",
    result: "Cut monthly AWS expenditure by $32,000 ($384,000 annually — a 27% cost reduction), while reducing node scaling time from 4 minutes to 40 seconds. Received the department Excellence Award."
  },
  {
    id: "story-3",
    title: "Platform Engineering: 45m to 6m CI/CD Acceleration & IDP",
    category: "Platform Engineering & DevEx",
    situation: "As engineering scaled from 30 to 120 engineers, our centralized DevOps team became an operational bottleneck. Deploying a new microservice took 4 days of ticket exchanges, and CI/CD pipelines took 45 minutes to run.",
    task: "I was tasked with transitioning our team to an Internal Developer Platform (IDP) model, enabling true self-service and reducing deployment friction.",
    action: "1. Created golden-path scaffolding templates in Spotify Backstage with baked-in Terraform, Helm, and GitHub Actions. 2. Migrated pipelines to ephemeral autoscaling Kubernetes runners in our private VPC. 3. Implemented Docker BuildKit multi-stage caching and parallelized test execution chunks.",
    result: "Reduced average pipeline duration from 45 minutes to 6.5 minutes. Cut microservice onboarding from 4 days to 12 minutes. Deployment frequency surged from bi-weekly releases to 14 daily production deploys."
  }
];

class StarBuilder {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.stories = JSON.parse(localStorage.getItem("devops_star_stories") || JSON.stringify(DEFAULT_STAR_STORIES));
    this.activeStoryId = this.stories[0]?.id || null;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  save() {
    localStorage.setItem("devops_star_stories", JSON.stringify(this.stories));
  }

  render() {
    const activeStory = this.stories.find((s) => s.id === this.activeStoryId) || this.stories[0];

    this.container.innerHTML = `
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-primary);">
            STAR Story Portfolio Builder (5 Years Experience)
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Structure your leadership narratives using the STAR method (Situation, Task, Action, Result) with quantifiable business metrics.
          </p>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button class="action-btn" onclick="window.starBuilder.addNewStory()">+ New Story</button>
          <button class="action-btn emerald" onclick="window.starBuilder.exportMarkdown()">Export Markdown</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem;">
        <!-- Stories Sidebar -->
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${this.stories
            .map(
              (s) => `
            <div class="content-card" style="margin: 0; padding: 0.85rem 1rem; cursor: pointer; border-color: ${s.id === this.activeStoryId ? "var(--accent-cyan)" : "var(--border-color)"}; background: ${s.id === this.activeStoryId ? "var(--bg-tertiary)" : "var(--bg-card)"};" onclick="window.starBuilder.selectStory('${s.id}')">
              <span class="badge badge-muted" style="font-size: 0.65rem; margin-bottom: 0.35rem;">${s.category}</span>
              <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); line-height: 1.3;">${s.title}</div>
            </div>
          `
            )
            .join("")}
        </div>

        <!-- Story Editor -->
        <div class="content-card" style="margin: 0;">
          ${
            activeStory
              ? `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
              <input type="text" id="star-edit-title" value="${this.escapeHtml(activeStory.title)}" style="font-size: 1.25rem; font-weight: 700; background: transparent; border: none; border-bottom: 1px solid var(--border-color); color: var(--text-primary); width: 75%; outline: none; padding-bottom: 4px;" onchange="window.starBuilder.updateActiveField('title', this.value)" />
              <button class="action-btn" style="color: var(--accent-rose); border-color: rgba(244,63,94,0.3);" onclick="window.starBuilder.deleteStory('${activeStory.id}')">Delete</button>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <label style="display: block; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--accent-cyan); margin-bottom: 0.35rem;">Category</label>
              <input type="text" value="${this.escapeHtml(activeStory.category)}" style="width: 100%; padding: 0.5rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.88rem;" onchange="window.starBuilder.updateActiveField('category', this.value)" />
            </div>

            <!-- SITUATION -->
            <div style="margin-bottom: 1.25rem;">
              <label style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--accent-cyan); margin-bottom: 0.35rem;">
                <span>1. Situation (Context, Scale & Stakes)</span>
                <span style="font-weight: normal; color: var(--text-muted); text-transform: none;">Include metrics: QPS, revenue, user impact</span>
              </label>
              <textarea rows="3" style="width: 100%; padding: 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.88rem; font-family: var(--font-sans); line-height: 1.5; resize: vertical;" onchange="window.starBuilder.updateActiveField('situation', this.value)">${this.escapeHtml(activeStory.situation)}</textarea>
            </div>

            <!-- TASK -->
            <div style="margin-bottom: 1.25rem;">
              <label style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--accent-indigo); margin-bottom: 0.35rem;">
                <span>2. Task (Your Specific Role & Responsibility)</span>
                <span style="font-weight: normal; color: var(--text-muted); text-transform: none;">Lead SRE, Incident Commander, Architect</span>
              </label>
              <textarea rows="2" style="width: 100%; padding: 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.88rem; font-family: var(--font-sans); line-height: 1.5; resize: vertical;" onchange="window.starBuilder.updateActiveField('task', this.value)">${this.escapeHtml(activeStory.task)}</textarea>
            </div>

            <!-- ACTION -->
            <div style="margin-bottom: 1.25rem;">
              <label style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--accent-amber); margin-bottom: 0.35rem;">
                <span>3. Action (Technical Troubleshooting & Execution)</span>
                <span style="font-weight: normal; color: var(--text-muted); text-transform: none;">Step-by-step non-destructive actions YOU took</span>
              </label>
              <textarea rows="4" style="width: 100%; padding: 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.88rem; font-family: var(--font-sans); line-height: 1.5; resize: vertical;" onchange="window.starBuilder.updateActiveField('action', this.value)">${this.escapeHtml(activeStory.action)}</textarea>
            </div>

            <!-- RESULT -->
            <div style="margin-bottom: 1.25rem;">
              <label style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--accent-emerald); margin-bottom: 0.35rem;">
                <span>4. Result (Quantifiable Impact & Post-Mortem)</span>
                <span style="font-weight: normal; color: var(--text-muted); text-transform: none;">Time to restore, $ saved, preventive tasks created</span>
              </label>
              <textarea rows="3" style="width: 100%; padding: 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.88rem; font-family: var(--font-sans); line-height: 1.5; resize: vertical;" onchange="window.starBuilder.updateActiveField('result', this.value)">${this.escapeHtml(activeStory.result)}</textarea>
            </div>
          `
              : `<p>Select or create a story.</p>`
          }
        </div>
      </div>
    `;
  }

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  selectStory(id) {
    this.activeStoryId = id;
    this.render();
  }

  updateActiveField(field, val) {
    const story = this.stories.find((s) => s.id === this.activeStoryId);
    if (story) {
      story[field] = val;
      this.save();
    }
  }

  addNewStory() {
    const newId = `story-${Date.now()}`;
    const newStory = {
      id: newId,
      title: "New Senior Engineering Story",
      category: "General DevOps",
      situation: "Context and production scale...",
      task: "My specific role as lead...",
      action: "Steps taken to diagnose and resolve...",
      result: "Measurable metrics and prevention items..."
    };
    this.stories.unshift(newStory);
    this.activeStoryId = newId;
    this.save();
    this.render();
  }

  deleteStory(id) {
    if (confirm("Are you sure you want to delete this story?")) {
      this.stories = this.stories.filter((s) => s.id !== id);
      this.activeStoryId = this.stories[0]?.id || null;
      this.save();
      this.render();
    }
  }

  exportMarkdown() {
    let md = "# Senior DevOps & SRE Interview STAR Portfolio\n\n";
    this.stories.forEach((s) => {
      md += `## ${s.title} (${s.category})\n\n`;
      md += `**Situation:**\n${s.situation}\n\n`;
      md += `**Task:**\n${s.task}\n\n`;
      md += `**Action:**\n${s.action}\n\n`;
      md += `**Result:**\n${s.result}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devops-interview-star-stories.md";
    a.click();
    URL.revokeObjectURL(url);
  }
}

if (typeof window !== "undefined") {
  window.StarBuilder = StarBuilder;
}
