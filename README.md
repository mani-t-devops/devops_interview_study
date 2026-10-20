# 2-Week DevOps & SRE Interview Study Hub (5+ Years Experience)

An interactive, production-grade web application built to master senior DevOps, SRE, Platform Engineering, Cloud Infrastructure, and Kubernetes technical rounds for product companies.

![DevOps Study Hub](https://img.shields.io/badge/Experience-5%2B%20YOE-brightgreen)
![Topics](https://img.shields.io/badge/Syllabus-14%20Days%20Complete-blue)
![Zero Dependency](https://img.shields.io/badge/Runtime-Vanilla%20JS%20%2B%20Python3-orange)

---

## 🚀 Quick Start

You can run the web portal in two simple ways:

### Option 1: Python Local Server (Recommended)
From the project directory:
```bash
cd /Users/mani.t/.gemini/antigravity/scratch/devops-interview-prep
./run.sh
```
Or directly:
```bash
python3 server.py
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser (Chrome / Safari / Firefox).

### Option 2: Direct Browser Open
Simply double-click `index.html` or run:
```bash
open /Users/mani.t/.gemini/antigravity/scratch/devops-interview-prep/index.html
```

---

## 🎯 Key Features Built Into the Portal

1. **Complete 14-Day Deep Curriculum (Week 1 & 2)**
   - Every single day is fully populated with production-grade architectural deep dives, not generic summaries:
     - **Day 1**: Linux OS Internals, Process States (D-state, Zombies), Memory RSS/VIRT, OOM Killer heuristics, TCP 3-Way Handshake & TIME_WAIT states, DNS flow.
     - **Day 2**: Git Internals, Multi-Stage CI/CD, Azure DevOps YAML (templates, runtime params, variable groups), Canary & Blue/Green rollout patterns.
     - **Day 3**: Docker & Container Internals, Linux Namespaces (PID, Mount, Net, User), Cgroups v1/v2, OverlayFS, Distroless images, Non-root hardening.
     - **Day 4**: Kubernetes Core, Control Plane (API server, etcd, scheduler), Pod lifecycle, Kube-proxy (iptables vs IPVS), Health Probes (Liveness vs Readiness).
     - **Day 5**: Advanced K8s, HPA & KEDA event scaling, Karpenter node provisioning, Taints & Tolerations, Pod Anti-Affinity, CNI (Cilium eBPF vs Calico), RBAC, NetworkPolicies.
     - **Day 6**: Cloud Infrastructure (AWS & Azure), 3-tier VPC/VNet topologies, Transit Gateway, AWS IRSA & Azure Workload Identity, ALB vs NLB.
     - **Day 7**: Terraform & IaC, S3 + DynamoDB state locking, drift detection (`plan -detailed-exitcode`), state recovery, modular architecture.
     - **Day 8**: Observability & SRE, Prometheus TSDB, PromQL math (`histogram_quantile`), SLI/SLO/SLA, 30-day Error Budgets (43.8 mins), multi-window burn-rate alerts.
     - **Day 9**: DevSecOps & Security, Shift-left SAST/DAST, Sigstore Cosign image signing, Kyverno admission gates, HashiCorp Vault dynamic secrets.
     - **Day 10**: System Design for DevOps/SRE, Multi-Region Active-Active DR (RTO/RPO), Enterprise GitOps with ArgoCD ApplicationSets, OTT/WebRTC low-latency infra.
     - **Day 11**: Production Incidents & Scenario Triage, Debugging Node NotReady, CrashLoopBackOff (137 vs 1), `ndots:5` DNS penalty, STAR method triage.
     - **Day 12**: Mock Interviews, 3 full simulation rounds (Core DevOps, Cloud/Terraform, SRE Leadership & Behavioral) with senior grading rubrics.
     - **Day 13**: Resume & STAR Stories, 6 pre-built master STAR stories (Outage, FinOps, IDP acceleration, Migration, Security), Google X-Y-Z formula.
     - **Day 14**: 50 Rapid-Fire Questions, Top 10 Architectural Trade-Offs, and Last 24-hour game plan.

2. **Senior vs Junior Interview Q&A Comparisons**
   - Each interview question features:
     - **Senior Answer**: The structured, 5 YOE benchmark response.
     - **Junior Mistake**: The common shallow trap that gets candidates rejected.
     - **What Interviewers Secretly Grade**: The underlying architectural test.
     - **Follow-up Questions**: Realistic follow-ups asked by senior hiring managers.

3. **Interactive Web CLI Sandbox**
   - Built-in authentic dark terminal emulator supporting:
     - `kubectl get nodes`, `kubectl get pods -A`, `kubectl describe pod`, `kubectl top nodes`
     - `uptime`, `top`, `free -h`, `df -h`, `ss -tulpn`, `lsof -i :8080`
     - `terraform plan`, `terraform state list`
     - `docker ps`, `docker stats`
     - Guided interactive troubleshooting lab (`lab start 1`)!

4. **Production Incident War Room Simulator (RCA Game)**
   - Step into the role of Incident Commander for real SEV-1 and SEV-2 outages:
     - *SEV-1: High 504 Timeouts During Flash Sale* (Connection pool starvation)
     - *SEV-2: Payment Pods in CrashLoopBackOff Exit 137* (Startup in-memory cache OOM)
     - *SEV-1: Node NotReady Cascade* (Container log volume saturation)
   - Interactive decision tree with instant technical feedback on dangerous vs correct triage steps.

5. **50 Rapid-Fire Senior Flashcard Engine**
   - 3D animated flip cards across 8 categories.
   - Filter by domain (Linux, K8s, Cloud, Terraform, SRE, etc.).
   - Keyboard navigation (`Space` to flip, `ArrowLeft` / `ArrowRight` to navigate).
   - "Mark Mastered" tracking with live progress bar stored in `localStorage`.

6. **STAR Story Portfolio Builder**
   - Interactive template to craft, edit, and export your personal STAR stories.
   - Pre-loaded with 3 high-impact senior DevOps narratives with quantifiable metrics.
   - One-click export to Markdown (`devops-interview-star-stories.md`).

7. **Daily 3–4 Hour Split Study Timer**
   - Presets for the recommended daily study routine:
     - 1h Core Theory Revision
     - 1h Hands-on Lab
     - 1h Interview Q&A Practice
     - 30m System Design
     - 30m STAR Stories
   - Synthesizer audio alerts via Web Audio API (zero audio file dependencies).

8. **Global Instant Search (`Cmd+K` / `Ctrl+K`)**
   - Real-time search across all 14 days, all theory sections, interview questions, flashcards, and cheatsheet commands.

9. **Responsive Design & Dark/Light Mode**
   - Engineering aesthetic inspired by Linear and Vercel dark mode.
   - Seamless toggling between Dark and Light mode.
   - Fully persistent state across browser sessions.

---

## 📅 Recommended Daily Study Routine (3–4 Hours/Day)

| Time Block | Focus Area | Action in App |
| :--- | :--- | :--- |
| **Hour 1** | Core Theory Revision | Read Day's Theory Deep Dive tab & internal mechanics |
| **Hour 2** | Hands-On / Lab | Run hands-on commands in Web CLI or test provided YAML/Terraform |
| **Hour 3** | Interview Q&A Practice | Practice answering senior questions out loud; review junior traps |
| **30 Mins** | System Design & Scenarios | Review the architectural scenario & trade-offs |
| **30 Mins** | STAR Stories / Flashcards | Drill 10 flashcards or polish a STAR story in Story Builder |

---

## 🛠️ Project Structure

```
devops-interview-prep/
├── index.html                   # Main single-page web shell & navigation
├── server.py                    # Python 3 zero-dependency HTTP server
├── run.sh                       # One-click launch shell script
├── README.md                    # Documentation & study guide
├── css/
│   └── main.css                 # Dark-mode styling, terminal UI, 3D cards
└── js/
    ├── app.js                   # Application state store & routing
    ├── data/
    │   ├── days-data.js         # Comprehensive 14-day study content
    │   ├── flashcards-data.js   # 50+ senior DevOps flashcards
    │   ├── scenarios-data.js    # Interactive RCA incident simulations
    │   ├── architectures-data.js# End-to-end architecture visualizer flows
    │   └── cheatsheets-data.js  # Linux, Kubectl, Terraform cheatsheets
    └── components/
        ├── terminal.js          # Interactive Web CLI simulator
        ├── timer.js             # Pomodoro & daily split study timer
        ├── incident-sim.js      # Interactive war room incident game
        ├── flashcards-comp.js   # 3D flashcard quiz engine
        ├── star-builder.js      # STAR method portfolio builder & exporter
        └── search-engine.js     # Global instant search modal (Cmd+K)
```

Happy studying and best of luck on your senior DevOps & SRE interviews!
