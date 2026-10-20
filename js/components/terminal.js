/**
 * Interactive DevOps Terminal Simulator
 * Simulates Linux & Kubernetes commands with realistic outputs and guided labs.
 */

class DevOpsTerminal {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.history = [];
    this.historyIndex = -1;
    this.currentDirectory = "~/devops-interview-prep";
    this.activeLab = null;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="terminal-window">
        <div class="terminal-titlebar">
          <div class="terminal-dots">
            <span class="terminal-dot red"></span>
            <span class="terminal-dot yellow"></span>
            <span class="terminal-dot green"></span>
          </div>
          <div class="terminal-title">bash — sre-engineer@prod-bastion-01: ${this.currentDirectory}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Web CLI v2.4</div>
        </div>

        <div class="quick-cmds-bar" id="term-quick-cmds">
          <span class="quick-cmd-chip" data-cmd="help">help</span>
          <span class="quick-cmd-chip" data-cmd="kubectl get pods -A">kubectl get pods</span>
          <span class="quick-cmd-chip" data-cmd="kubectl describe pod checkout-api-7b89 -n prod">kubectl describe pod</span>
          <span class="quick-cmd-chip" data-cmd="ss -tulpn">ss -tulpn</span>
          <span class="quick-cmd-chip" data-cmd="top">top</span>
          <span class="quick-cmd-chip" data-cmd="terraform plan">terraform plan</span>
          <span class="quick-cmd-chip" data-cmd="lab start 1">lab start 1</span>
          <span class="quick-cmd-chip" data-cmd="clear">clear</span>
        </div>

        <div class="terminal-output" id="terminal-output-area">
          <div class="terminal-line" style="color: var(--accent-cyan); font-weight: 600;">
====================================================================================
  Google SRE & Senior DevOps Interactive Sandbox Terminal
  Host: prod-bastion-01 (Ubuntu 22.04.4 LTS x86_64 / Kernel 6.5.0-35-generic)
  Cluster: production-eks-cluster-us-east-1 (Kubernetes v1.29.3)
====================================================================================
Type <span style="color: var(--accent-emerald); font-weight: bold;">help</span> to see available commands or click the quick command chips above.
Try typing <span style="color: var(--accent-amber); font-weight: bold;">lab start 1</span> to start the CrashLoopBackOff diagnostic challenge!
          </div>
        </div>

        <div class="terminal-input-row">
          <span class="terminal-prompt-label">sre-engineer@prod-bastion:~$</span>
          <input type="text" class="terminal-input" id="terminal-input-field" autocomplete="off" spellcheck="false" placeholder="Type command here..." />
        </div>
      </div>
    `;

    this.outputArea = document.getElementById("terminal-output-area");
    this.inputField = document.getElementById("terminal-input-field");
    this.setupEvents();
  }

  setupEvents() {
    this.inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cmd = this.inputField.value.trim();
        if (cmd) {
          this.executeCommand(cmd);
          this.history.push(cmd);
          this.historyIndex = this.history.length;
          this.inputField.value = "";
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.inputField.value = this.history[this.historyIndex] || "";
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.inputField.value = this.history[this.historyIndex] || "";
        } else {
          this.historyIndex = this.history.length;
          this.inputField.value = "";
        }
      }
    });

    // Quick command chips
    const chips = this.container.querySelectorAll(".quick-cmd-chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const cmd = chip.getAttribute("data-cmd");
        this.inputField.value = cmd;
        this.inputField.focus();
        this.executeCommand(cmd);
        this.inputField.value = "";
      });
    });
  }

  appendLine(html, isCommand = false) {
    const line = document.createElement("div");
    line.className = "terminal-line";
    if (isCommand) {
      line.innerHTML = `<span class="terminal-prompt-sym">sre@prod-bastion:~$</span> <span class="terminal-cmd-highlight">${this.escapeHtml(html)}</span>`;
    } else {
      line.innerHTML = html;
    }
    this.outputArea.appendChild(line);
    this.outputArea.scrollTop = this.outputArea.scrollHeight;
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  executeCommand(rawCmd) {
    this.appendLine(rawCmd, true);
    const cmd = rawCmd.trim();
    const lower = cmd.toLowerCase();

    if (lower === "clear") {
      this.outputArea.innerHTML = "";
      return;
    }

    if (lower === "help") {
      this.appendLine(`
<span style="color: var(--accent-cyan); font-weight: bold;">Available Linux, Kubernetes & Cloud Commands:</span>
  • <span style="color: var(--accent-emerald);">kubectl get nodes</span> - List cluster worker nodes and statuses
  • <span style="color: var(--accent-emerald);">kubectl get pods -A</span> - List pods across all namespaces
  • <span style="color: var(--accent-emerald);">kubectl describe pod &lt;name&gt; -n prod</span> - Detailed pod inspection
  • <span style="color: var(--accent-emerald);">kubectl logs &lt;name&gt; -n prod [--previous]</span> - View pod logs
  • <span style="color: var(--accent-emerald);">kubectl top nodes</span> / <span style="color: var(--accent-emerald);">kubectl top pods</span> - Resource consumption metrics
  • <span style="color: var(--accent-emerald);">uptime</span> / <span style="color: var(--accent-emerald);">top</span> / <span style="color: var(--accent-emerald);">vmstat</span> / <span style="color: var(--accent-emerald);">free -h</span> - OS performance diagnostics
  • <span style="color: var(--accent-emerald);">ss -tulpn</span> / <span style="color: var(--accent-emerald);">lsof -i :8080</span> - Socket & listening port investigation
  • <span style="color: var(--accent-emerald);">df -h</span> / <span style="color: var(--accent-emerald);">df -i</span> - Disk usage & inode saturation
  • <span style="color: var(--accent-emerald);">terraform plan</span> / <span style="color: var(--accent-emerald);">terraform state list</span> - IaC state commands
  • <span style="color: var(--accent-emerald);">docker ps</span> / <span style="color: var(--accent-emerald);">docker stats</span> - Local container runtime checks
  • <span style="color: var(--accent-amber); font-weight: bold;">lab start 1</span> - Start guided interactive CrashLoopBackOff troubleshooting lab
  • <span style="color: var(--accent-cyan);">clear</span> - Clear terminal screen
`);
      return;
    }

    // Kubernetes commands
    if (lower.startsWith("kubectl get nodes")) {
      this.appendLine(`
NAME                                              STATUS   ROLES    AGE   VERSION
ip-10-0-1-12.ec2.internal                         Ready    &lt;none&gt;   45d   v1.29.3-eks
ip-10-0-1-48.ec2.internal                         Ready    &lt;none&gt;   45d   v1.29.3-eks
ip-10-0-2-19.ec2.internal                         NotReady &lt;none&gt;   12d   v1.29.3-eks  <span style="color: var(--accent-rose); font-weight:bold;">&lt;-- DISK_PRESSURE</span>
ip-10-0-2-88.ec2.internal                         Ready    &lt;none&gt;   45d   v1.29.3-eks
ip-10-0-3-104.ec2.internal                        Ready    &lt;none&gt;   45d   v1.29.3-eks
`);
      return;
    }

    if (lower.startsWith("kubectl get pods -a") || lower === "kubectl get pods") {
      this.appendLine(`
NAMESPACE     NAME                               READY   STATUS             RESTARTS   AGE     IP            NODE
kube-system   coredns-6745f4789-abc1             1/1     Running            0          45d     10.0.1.25     ip-10-0-1-12
kube-system   aws-node-7b89c                     1/1     Running            0          45d     10.0.1.12     ip-10-0-1-12
prod          checkout-api-7b89                  0/1     <span style="color: var(--accent-rose); font-weight:bold;">CrashLoopBackOff</span>   6 (2m ago) 14m     10.0.1.72     ip-10-0-1-48
prod          checkout-api-9f12                  1/1     Running            0          3d      10.0.2.14     ip-10-0-2-88
prod          payment-worker-4b82                1/1     Running            0          6d      10.0.3.55     ip-10-0-3-104
prod          order-db-proxy-6d81                2/2     Running            0          40d     10.0.1.80     ip-10-0-1-12
monitoring    prometheus-k8s-0                   2/2     Running            0          30d     10.0.3.99     ip-10-0-3-104
`);
      return;
    }

    if (lower.includes("describe pod") && lower.includes("checkout-api-7b89")) {
      this.appendLine(`
<span style="color: var(--accent-cyan); font-weight:bold;">Name:</span>         checkout-api-7b89
<span style="color: var(--accent-cyan); font-weight:bold;">Namespace:</span>    prod
<span style="color: var(--accent-cyan); font-weight:bold;">Node:</span>         ip-10-0-1-48.ec2.internal/10.0.1.48
<span style="color: var(--accent-cyan); font-weight:bold;">Status:</span>       Running
<span style="color: var(--accent-cyan); font-weight:bold;">Containers:</span>
  api-server:
    Container ID:   containerd://f9b0c8e23812a1048
    Image:          123456789.dkr.ecr.us-east-1.amazonaws.com/checkout:v2.4.1
    Port:           8080/TCP
    State:          Waiting
      <span style="color: var(--accent-rose); font-weight:bold;">Reason:       CrashLoopBackOff</span>
    Last State:     Terminated
      <span style="color: var(--accent-rose); font-weight:bold;">Reason:       OOMKilled</span>
      <span style="color: var(--accent-rose); font-weight:bold;">Exit Code:    137</span>
      Started:      Mon, 20 Oct 2026 12:40:12 +0000
      Finished:     Mon, 20 Oct 2026 12:40:18 +0000
    Limits:
      cpu:     1000m
      <span style="color: var(--accent-amber); font-weight:bold;">memory:  512Mi</span>
    Requests:
      cpu:     250m
      memory:  256Mi
<span style="color: var(--accent-cyan); font-weight:bold;">Events:</span>
  Type     Reason     Age                   From               Message
  ----     ------     ----                  ----               -------
  Warning  BackOff    2m (x14 over 12m)     kubelet            Back-off restarting failed container api-server
  Warning  OOMKilled  3m (x6 over 12m)      kubelet            Container api-server exceeded memory limit (512Mi)
`);
      if (this.activeLab === 1) {
        this.appendLine(`<span style="color: var(--accent-emerald); font-weight: bold;">[LAB 1 PROGRESS]</span> Great! You identified Exit Code 137 and Reason: OOMKilled. Now run: <span style="color: var(--accent-cyan);">kubectl logs checkout-api-7b89 -n prod --previous</span> to see what allocated memory right before dying!`);
      }
      return;
    }

    if (lower.includes("logs") && lower.includes("checkout-api-7b89") && lower.includes("--previous")) {
      this.appendLine(`
2026-10-20T12:40:12.102Z [INFO]  Starting Checkout API Server v2.4.1 on :8080
2026-10-20T12:40:12.215Z [INFO]  Connected to PostgreSQL Primary via RDS Proxy pool (10.0.1.80:5432)
2026-10-20T12:40:13.004Z [INFO]  Initializing in-memory currency exchange rate lookup table...
2026-10-20T12:40:15.820Z [WARN]  Loading 10-year historical forex datasets into RAM (size: 980MB)...
2026-10-20T12:40:17.912Z [FATAL] Memory usage: 524,288 KB / 524,288 KB (100.0%)
<span style="color: var(--accent-rose); font-weight:bold;">Killed (Signal 9 / SIGKILL issued by Linux Cgroup OOM Killer)</span>
`);
      if (this.activeLab === 1) {
        this.appendLine(`<span style="color: var(--accent-emerald); font-weight: bold;">[LAB 1 COMPLETED!]</span> Perfect diagnosis! The app loaded 980MB into RAM, bursting past the 512Mi pod memory limit. The permanent fix is querying Redis on-demand rather than preloading 10 years of historical data into JVM/Go heap on boot!`);
        this.activeLab = null;
      }
      return;
    }

    if (lower.startsWith("kubectl top nodes")) {
      this.appendLine(`
NAME                          CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
ip-10-0-1-12.ec2.internal     450m         11%    3210Mi          41%
ip-10-0-1-48.ec2.internal     1250m        31%    6100Mi          78%
ip-10-0-2-19.ec2.internal     310m         7%     2100Mi          26%
ip-10-0-2-88.ec2.internal     890m         22%    4800Mi          61%
ip-10-0-3-104.ec2.internal    720m         18%    3900Mi          49%
`);
      return;
    }

    if (lower === "top") {
      this.appendLine(`
top - 12:45:10 up 45 days,  4:12,  2 users,  load average: 0.42, 0.58, 0.51
Tasks: 182 total,   1 running, 181 sleeping,   0 stopped,   0 zombie
%Cpu(s):  3.2 us,  1.1 sy,  0.0 ni, 95.4 id,  0.1 wa,  0.0 hi,  0.2 si,  0.0 st
MiB Mem :  15890.2 total,   2410.5 free,   8910.1 used,   4569.6 buff/cache
MiB Swap:      0.0 total,      0.0 free,      0.0 used.   6510.4 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1420 containe  20   0 1845124 142380  45120 S   2.1   0.9 240:12.18 containerd
  891 root      20   0 2410520 215400  62100 S   1.8   1.3 410:05.42 kubelet
 8912 appuser   20   0  524288 385100  32100 S   1.2   2.4  12:45.19 order-api
  412 systemd+  20   0   42100  12500   9800 S   0.2   0.1   5:12.04 systemd-resolved
`);
      return;
    }

    if (lower === "uptime") {
      this.appendLine(` 12:45:12 up 45 days, 4:12, 2 users, load average: 0.42, 0.58, 0.51 (nproc: 8 cores - Load is healthy)`);
      return;
    }

    if (lower === "free -h" || lower === "free -m") {
      this.appendLine(`
               total        used        free      shared  buff/cache   available
Mem:            15Gi       8.7Gi       2.3Gi       210Mi       4.4Gi       6.3Gi
Swap:             0B          0B          0B
`);
      return;
    }

    if (lower === "df -h") {
      this.appendLine(`
Filesystem      Size  Used Avail Use% Mounted on
/dev/root        48G   14G   34G  30% /
/dev/nvme1n1    200G  196G  4.0G  <span style="color: var(--accent-rose); font-weight:bold;">98% /var/lib/containerd</span>
tmpfs           7.8G     0  7.8G   0% /dev/shm
`);
      return;
    }

    if (lower.startsWith("ss -tulpn") || lower === "netstat -tulpn") {
      this.appendLine(`
Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
tcp   LISTEN 0      128    0.0.0.0:22          0.0.0.0:*         users:(("sshd",pid=712,fd=3))
tcp   LISTEN 0      511    0.0.0.0:8080        0.0.0.0:*         users:(("api-server",pid=8912,fd=7))
tcp   LISTEN 0      128    127.0.0.1:10248     0.0.0.0:*         users:(("kubelet",pid=891,fd=18))
tcp   LISTEN 0      4096   0.0.0.0:9100        0.0.0.0:*         users:(("node_exporter",pid=920,fd=3))
`);
      return;
    }

    if (lower.startsWith("lsof -i :8080")) {
      this.appendLine(`
COMMAND    PID    USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
api-server 8912 appuser    7u  IPv4 812491      0t0  TCP *:http-alt (LISTEN)
api-server 8912 appuser   14u  IPv4 812904      0t0  TCP 10.0.1.72:http-alt->10.0.2.14:54890 (ESTABLISHED)
`);
      return;
    }

    if (lower.startsWith("terraform plan")) {
      this.appendLine(`
<span style="color: var(--accent-cyan); font-weight:bold;">Acquiring state lock from DynamoDB (company-production-tflocks)...</span>
<span style="color: var(--accent-emerald);">Lock acquired successfully (LockID: 7a8f90b1-4c12-4210-98ef-123456789abc).</span>

Terraform will perform the following actions:

  <span style="color: var(--accent-cyan);">~ resource "aws_ecs_service" "checkout_service"</span> {
      ~ desired_count = 10 -> 15
        id            = "arn:aws:ecs:us-east-1:123456789:service/checkout-service"
        name          = "checkout-service"
    }

<span style="color: var(--accent-amber); font-weight:bold;">Plan: 0 to add, 1 to change, 0 to destroy.</span>
<span style="color: var(--accent-cyan);">Releasing state lock...</span>
Exit code: 2 (Changes detected - Drift or planned modification present).
`);
      return;
    }

    if (lower.startsWith("terraform state list")) {
      this.appendLine(`
aws_iam_role.irsa_order_api
aws_s3_bucket.terraform_state
aws_s3_bucket_versioning.versioning
aws_dynamodb_table.terraform_locks
module.vpc.aws_vpc.main
module.vpc.aws_subnet.private["us-east-1a"]
module.vpc.aws_subnet.private["us-east-1b"]
module.vpc.aws_nat_gateway.gw
`);
      return;
    }

    if (lower.startsWith("lab start 1")) {
      this.activeLab = 1;
      this.appendLine(`
<span style="color: var(--accent-amber); font-weight: bold;">====================================================================</span>
<span style="color: var(--accent-cyan); font-weight: bold;">  HANDS-ON LAB 1: Diagnose Production CrashLoopBackOff Pod</span>
<span style="color: var(--accent-amber); font-weight: bold;">====================================================================</span>
<span style="color: #cbd5e1;">Alert: Pod <span style="color: var(--accent-rose); font-weight:bold;">checkout-api-7b89</span> in namespace <span style="color: var(--accent-emerald);">prod</span> is in CrashLoopBackOff!

<span style="color: var(--accent-emerald); font-weight:bold;">Step 1:</span> Run: <span style="color: var(--accent-cyan);">kubectl describe pod checkout-api-7b89 -n prod</span> to inspect the exit code and reason.</span>
`);
      return;
    }

    if (lower.startsWith("docker ps")) {
      this.appendLine(`
CONTAINER ID   IMAGE                                COMMAND                  CREATED         STATUS         PORTS                    NAMES
8f9104b9c12a   gcr.io/distroless/static:nonroot     "/app/order-api"         2 hours ago     Up 2 hours     0.0.0.0:8080->8080/tcp   order-api-prod
4a108b2e3f19   prom/node-exporter:v1.7.0            "/bin/node_exporter …"   45 days ago     Up 45 days                              node-exporter
`);
      return;
    }

    // Default fallback
    this.appendLine(`<span style="color: var(--accent-rose);">bash: command not found: ${this.escapeHtml(rawCmd)}.</span> Type <span style="color: var(--accent-emerald); font-weight:bold;">help</span> to see available commands.`);
  }
}

if (typeof window !== "undefined") {
  window.DevOpsTerminal = DevOpsTerminal;
}
