/**
 * 2-Week DevOps Interview Study Plan (5 Years Experience)
 * Complete 14-Day Deep Technical Dataset
 */

const DEVOPS_STUDY_DAYS = [
  {
    id: 1,
    dayNum: 1,
    week: 1,
    title: "Linux, Networking & System Troubleshooting",
    subtitle: "OS Internals, Process States, TCP/IP Stack, DNS Flow, & Production Triage Runbooks",
    tags: ["Linux", "Networking", "Troubleshooting", "OS Internals"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Master the Linux OS kernel abstractions, process lifecycles, memory management heuristics (OOM killer), storage block vs inode constraints, and the networking packet traversal path from browser socket to kernel network buffers.",
    
    theory: [
      {
        title: "Linux Process Lifecycle & States",
        content: `In Linux, processes are represented by \`task_struct\` in kernel memory. Key states you must know for senior triage:
• **TASK_RUNNING (R)**: Currently executing on a CPU core or sitting in the CPU run queue.
• **TASK_INTERRUPTIBLE (S)**: Sleeping/blocked waiting for an event (I/O, timer, socket). Wakes up upon signal delivery.
• **TASK_UNINTERRUPTIBLE (D)**: Sleeping waiting directly on hardware I/O (NFS, disk controller, kernel mutex). **Cannot be killed even with \`kill -9\`!** High D-state processes inflate the CPU load average without utilizing actual CPU cycles.
• **ZOMBIE (Z / defunct)**: Process has completed execution via \`exit()\`, but its exit status has not yet been read (\`waitpid()\`) by its parent. Consumes an entry in the OS PID table (\`/proc/sys/kernel/pid_max\`). If PID table exhausts, no new processes can spawn.
• **ORPHAN**: Parent process dies before child. Reparented automatically to PID 1 (\`systemd\`), which regularly calls \`wait()\` to reap them.`
      },
      {
        title: "Memory Internals: RSS vs VIRT, Page Cache & OOM Killer",
        content: `Memory sizing is frequently tested in senior interviews:
• **VIRT (Virtual Memory)**: Total memory the process requested (malloc, mmap, shared libraries). Does not mean physical RAM is allocated yet.
• **RSS (Resident Set Size)**: Actual physical RAM currently held in pages for this process.
• **Page Cache & Buffers**: Linux opportunistically caches disk blocks in unused RAM. Available memory = \`free + buffers/cache - min_free_kbytes\`. Never panic if \`free -m\` shows low 'free' as long as 'available' is healthy!
• **OOM Killer (Out Of Memory)**: When RAM and swap are exhausted, the kernel invokes \`oom_killer\`. Heuristic calculates \`oom_score\` based on \`% of RAM consumed\` and adjusted by \`/proc/<pid>/oom_score_adj\` (-1000 to +1000). K8s uses this to protect system daemons (-997 for kubelet/containerd, 0 for Burstable, 1000 for BestEffort).`
      },
      {
        title: "Networking: TCP 3-Way Handshake, Connection States & Sockets",
        content: `Under high concurrency (e.g. 10k req/s), understanding TCP states is vital:
1. **Handshake**: Client sends [SYN] -> Server queues in SYN Backlog -> Server responds [SYN, ACK] -> Client sends [ACK] -> Connection moves to Accept Queue.
2. **Termination**: Client sends [FIN] -> Server replies [ACK] -> Server sends [FIN] -> Client replies [ACK] -> Client enters **TIME_WAIT** state.
3. **TIME_WAIT state**: Lasts for 2*MSL (Maximum Segment Lifetime, default 60s). Prevents delayed duplicate packets from corrupting new connections on the same 4-tuple (srcIP, srcPort, dstIP, dstPort).
4. **Production Pitfall**: Microservices making outbound HTTP requests without connection pooling can exhaust the local ephemeral port range (\`net.ipv4.ip_local_port_range\`, ~28k ports), causing \`Cannot assign requested address\` (EADDRNOTAVAIL).
5. **Remediation**: Enable HTTP Keep-Alive / connection pooling; tune \`net.ipv4.tcp_tw_reuse = 1\` for outbound client sockets.`
      },
      {
        title: "The Production Triage Method: USE & RED",
        content: `Brendan Gregg's USE Method for Infrastructure:
• **Utilization**: % time that resource is busy (CPU via \`mpstat\`, Disk via \`iostat -xz 1 %util\`).
• **Saturation**: Queue length of extra work waiting (Load average vs CPU count, vmstat 'r' & 'b' columns).
• **Errors**: Hardware or driver drops (\`ifconfig\` drops, \`dmesg\`, disk I/O errors).

RED Method for Microservices: Rate (req/s), Errors (5xx rate), Duration (latency p95/p99).`
      }
    ],

    qa: [
      {
        question: "What happens when you type https://api.company.com in a browser and hit Enter?",
        category: "Networking & System Architecture",
        seniorAnswer: "1. **URL Parsing & HSTS**: Browser checks local HSTS cache to enforce HTTPS. 2. **DNS Resolution**: Checks browser DNS cache -> OS resolver cache -> /etc/hosts -> local DNS (/etc/resolv.conf). If miss, queries Recursive Resolver -> Root Server (.) -> TLD (.com) -> Authoritative Nameserver. Returns A/AAAA records. In K8s, consider ndots:5 latency. 3. **TCP Handshake**: SYN -> SYN-ACK -> ACK on port 443 with window scaling and MSS negotiation. 4. **TLS 1.3 Handshake**: Single RTT: Client Hello (cipher suites + ECDHE key share) -> Server Hello + Certificate + Finished. Symmetric AES-256-GCM / ChaCha20 key established. 5. **HTTP Request & Routing**: Browser sends HTTP/2 or HTTP/3 frame. Traverses Anycast IP -> Cloudflare/CloudFront CDN -> Cloud Load Balancer (ALB) -> Ingress Controller (Nginx/Envoy) -> Kube-proxy iptables/IPVS NAT -> Target Pod container. 6. **Application & Response**: App processes, queries DB/cache, streams response. Connection kept open via Keep-Alive.",
        juniorMistake: "Stopping at 'DNS finds the IP and sends an HTTP request.' Skipping TLS handshake details, TCP connection parameters, reverse proxy layers, and internal container networking.",
        interviewerFocus: "Depth of layered understanding: Browser internals, OSI Layer 4 vs 7, TLS 1.3 performance, and production ingress routing.",
        followUpQuestions: [
          "How does TLS 1.3 differ from TLS 1.2 in terms of latency?",
          "How would Anycast routing affect DNS and CDN edge caching?",
          "What is SNI (Server Name Indication) and why is it needed?"
        ]
      },
      {
        question: "How do you systematically troubleshoot high CPU utilization on a production Linux server?",
        category: "Linux Troubleshooting",
        seniorAnswer: "1. **Check Load vs Cores**: Run `uptime` or `top`. Compare 1, 5, 15 min load against `nproc`. 2. **Breakdown CPU percentage**: In `top` or `mpstat -P ALL 1`, identify if high usage is: %us (user application code), %sy (kernel syscall overhead, lock contention, context switches), %wa (waiting on disk/NFS I/O — CPU is actually idle!), or %st (steal time — hypervisor noisy neighbor contention in cloud VMs like EC2). 3. **Identify Process & Threads**: Run `pidstat -u 1` or `top -c`. Press `Shift+H` in top to display per-thread CPU utilization and identify the specific Thread ID. 4. **Trace Execution**: If %us is high, capture thread dump (`jstack` for JVM, `py-spy` for Python, `perf record -g` for C/Go) to generate a FlameGraph. If %sy is high, run `strace -c -p <PID>` to see which system call is choking the kernel (e.g. excessive `futex` or `epoll_wait`).",
        juniorMistake: "Immediately killing the process or blindly restarting the server without capturing thread dumps or verifying if %wa or %st was the actual culprit.",
        interviewerFocus: "Methodical approach, understanding CPU states (%us, %sy, %wa, %st), thread-level inspection, and non-destructive triage.",
        followUpQuestions: [
          "What causes high %sy (system CPU) and how do you trace it?",
          "What does high %st (steal time) in an AWS EC2 instance indicate and what is the fix?",
          "Why can a load average be 50 on an 8-core machine while CPU usage is only 10%?"
        ]
      },
      {
        question: "How do you diagnose and resolve a 'Disk Full' incident when `df -h` shows 100% but `du -sh *` doesn't find the large files?",
        category: "Storage & Linux Internals",
        seniorAnswer: "This happens when a large file (e.g. application log) has been deleted with `rm`, but a running process still holds an open file descriptor to it. In Linux, unlinking a file (`rm`) only removes directory inode reference; storage blocks are only reclaimed when the open file descriptor reference count drops to 0. 1. Run `lsof +L1` or `lsof | grep -i deleted` to find processes holding open deleted files. 2. To safely release the disk space immediately without restarting a critical production service, truncate the file descriptor via procfs: `> /proc/<PID>/fd/<FD_NUMBER>`. 3. Verify with `df -h`. 4. Another scenario is inode exhaustion (`df -i` shows 100% inodes used while `df -h` shows plenty of GBs free), commonly caused by millions of tiny session files or unpurged mail queues.",
        juniorMistake: "Running `rm -rf` indiscriminately or restarting the server blindly.",
        interviewerFocus: "Understanding Linux filesystem mechanics: inodes, directory entries vs file descriptors, and non-disruptive production remediation.",
        followUpQuestions: [
          "What is the difference between a hard link and a symbolic (soft) link at the inode level?",
          "Can you create a hard link across different mounted filesystems? Why or why not?"
        ]
      }
    ],

    handsOn: {
      title: "Hardened Systemd Service & Packet Sniffing Runbook",
      objective: "Build a production-grade systemd service unit with security sandboxing and capture targeted TCP handshake traffic using tcpdump.",
      steps: [
        "Create custom systemd service with security limits and auto-restart behavior.",
        "Simulate service crash and inspect systemd restart journal logs.",
        "Run tcpdump with BPF (Berkeley Packet Filter) syntax to capture TLS handshakes.",
        "Analyze open sockets and TCP state transitions with ss and lsof."
      ],
      snippetTitle: "/etc/systemd/system/production-api.service",
      snippetLang: "ini",
      snippetCode: `[Unit]
Description=Production API Microservice
After=network.target remote-fs.target
Wants=network-online.target

[Service]
Type=simple
User=appuser
Group=appgroup
WorkingDirectory=/opt/production-api
ExecStart=/opt/production-api/bin/api-server --port=8080
Restart=always
RestartSec=5s

# Security Hardening & Isolation
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
PrivateDevices=true
ProtectKernelTunables=true
ProtectControlGroups=true
ReadOnlyPaths=/opt/production-api
ReadWritePaths=/var/log/production-api

# Resource Limits (Cgroups)
LimitNOFILE=65536
LimitNPROC=4096
MemoryMax=1G
CPUQuota=200%

[Install]
WantedBy=multi-user.target`,
      verificationCmd: `sudo systemctl daemon-reload
sudo systemctl enable --now production-api.service
sudo journalctl -u production-api.service -n 50 -f --no-pager
# Monitor active listening sockets:
ss -tulpn | grep 8080
# Capture SYN packets on eth0:
sudo tcpdump -i any -nn -s0 -c 10 'tcp[tcpflags] & (tcp-syn) != 0 and port 8080'`
    },

    systemDesign: {
      title: "Zero-Loss Linux Socket Buffer & Network Tuning for High-Throughput Ingress",
      scenario: "Your edge reverse proxy (Nginx/HAProxy) receives 80,000 requests/sec. During peak spikes, clients experience connection timeouts and packet drops even though CPU is at 45%.",
      architecturePrinciples: [
        "Tune SYN backlog: Increase `net.ipv4.tcp_max_syn_backlog = 3240000` and `net.core.somaxconn = 65535`.",
        "Prevent TIME_WAIT saturation: Tune `net.ipv4.tcp_tw_reuse = 1` and expand ephemeral ports `net.ipv4.ip_local_port_range = 1024 65535`.",
        "NIC Ring Buffers: Check `ethtool -S eth0 | grep drop` and expand RX/TX ring buffers with `ethtool -G eth0 rx 4096 tx 4096`.",
        "Core Affinity (RPS/RFS): Distribute network interrupt handling (softirqs) across all CPU cores instead of choking CPU0."
      ],
      tradeOffs: "Increasing socket memory buffers consumes more non-swappable kernel RAM. Calculate: `max_connections * (rmem + wmem)` to avoid kernel OOM."
    },

    checklist: [
      "Review Linux process states (R, S, D, Z) and explain how D-state affects load average",
      "Understand RSS, VIRT, Page Cache, and oom_score heuristics",
      "Explain TCP 3-way handshake, 4-way FIN, and the necessity of TIME_WAIT (2*MSL)",
      "Practice commands: `top -H`, `ss -tulpn`, `lsof -i :port`, `vmstat 1`, `iostat -xz 1`",
      "Solve a simulated 'Disk 100% full due to deleted open file' using `lsof` and `/proc/<pid>/fd`"
    ]
  },

  {
    id: 2,
    dayNum: 2,
    week: 1,
    title: "Git, CI/CD & Enterprise Pipelines",
    subtitle: "Git Workflows, Multi-Stage Pipelines, Azure DevOps & GitHub Actions, Canary & Blue/Green",
    tags: ["Git", "CI/CD", "Azure DevOps", "GitHub Actions", "Deployment Strategies"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Deep dive into Git internals (DAG, rebase vs merge), enterprise multi-stage CI/CD pipelines, runtime parameters, variable groups, self-hosted runner security, and progressive delivery patterns (Canary, Blue/Green, Rollbacks).",

    theory: [
      {
        title: "Git Under the Hood: Object Database & Commit Graph",
        content: `Git is a content-addressable key-value store:
• **4 Object Types**: Blob (file contents), Tree (directory structure), Commit (snapshot pointer, author, parent commit hash), Tag (annotated pointer).
• **Merge vs Rebase**:
  - \`git merge\`: Creates a merge commit with two parents. Preserves true historical topology. Non-destructive.
  - \`git rebase\`: Rewrites project history by taking commits from feature branch and replaying them on top of target branch tip. Produces a clean linear history. **Golden Rule**: Never rebase shared public branches!
• **Cherry-Pick**: Applies changes from a single commit onto current HEAD with a new commit SHA. Danger: cherry-picking commits that rely on prior context leads to silent merge bugs.`
      },
      {
        title: "Azure DevOps Multi-Stage Pipelines Architecture",
        content: `Production Azure Pipelines YAML hierarchy:
• **Stage**: Major boundary (e.g. Build, Dev, Staging, Prod). Can run on different agent pools, trigger different approval gates, and map to Azure DevOps Environments.
• **Job**: Runs on a single agent. Multiple jobs within a stage run in parallel by default unless \`dependsOn\` is set.
• **Step**: Sequential tasks/scripts inside a job.
• **Variable Groups & Key Vault**: Centralized variables linked directly to Azure Key Vault secrets.
• **Templates**: Extensibility mechanism (\`template: steps/build-docker.yml\`) to enforce organization-wide security scanning and avoid pipeline duplication.
• **Approvals & Checks**: Environment protection gates: Manual approvals, Azure Function validation, Business hours, and REST API checks (e.g. querying ServiceNow change requests).`
      },
      {
        title: "Deployment Strategies: Canary vs Blue/Green vs Rolling",
        content: `• **Rolling Update**: Incrementally updates pods. Zero downtime. Caveat: During rollout, version N and N+1 coexist simultaneously; database migrations must be backwards-compatible!
• **Blue/Green**: Two identical environments (Blue=Live, Green=New). Switch router/load balancer traffic instantly. Fast 1-second rollback. Downside: Requires 2x compute capacity during deployment.
• **Canary**: Directs a tiny percentage (5% -> 25% -> 100%) of traffic to new release. Metrics (error rate, p99 latency) are monitored continuously. If metric breaches threshold, automated rollback occurs immediately.`
      }
    ],

    qa: [
      {
        question: "How do you securely manage secrets and credentials in CI/CD pipelines without exposing them?",
        category: "CI/CD & DevSecOps",
        seniorAnswer: "1. **OIDC Federation (Workload Identity)**: Eliminate long-lived static cloud access keys (e.g. AWS access keys or Azure service principal passwords). Use OpenID Connect (OIDC) between GitHub Actions / Azure DevOps and AWS/Azure to exchange short-lived, scoped JWT tokens. 2. **Secret Scoping & Masking**: Store secrets in Azure Key Vault / HashiCorp Vault. Link via Variable Groups or secret managers with automated stdout masking. 3. **Pipeline Isolation**: Run untrusted PR builds in isolated unprivileged agents without access to production secrets or deploy stages. 4. **Pin Dependencies**: Pin third-party pipeline tasks and actions to immutable commit SHAs rather than mutable tags (e.g. `uses: actions/checkout@b4ffde...` instead of `@v4`) to avoid supply chain hijacking. 5. **Audit & Scanning**: Enforce pre-commit hooks (TruffleHog / Gitleaks) and pipeline scanners to fail builds if raw secrets are committed.",
        juniorMistake: "Storing cloud credentials as plain pipeline variables or using long-lived admin credentials without rotation.",
        interviewerFocus: "Understanding modern token federation (OIDC), supply chain risk, secret scoping, and least privilege.",
        followUpQuestions: [
          "How does GitHub Actions / Azure DevOps OIDC token exchange work with AWS STS AssumeRoleWithWebIdentity?",
          "How do you prevent a malicious developer from printing secret variables in pipeline bash scripts?"
        ]
      },
      {
        question: "How do you orchestrate an automated rollback when a canary deployment fails?",
        category: "Deployment Engineering",
        seniorAnswer: "In modern Kubernetes/GitOps platforms, we leverage tools like Argo Rollouts or Flagger combined with Prometheus metrics: 1. **Traffic Splitting**: Ingress controller (Nginx/Traefik) or Service Mesh (Istio/Linkerd) routes 5% traffic to canary pods. 2. **Analysis Runs**: An automated AnalysisTemplate executes Prometheus queries every 60 seconds (e.g. `sum(rate(http_requests_total{status=~'5.*'}[2m])) / sum(rate(http_requests_total[2m])) < 0.01` and p99 latency < 250ms). 3. **Failure Threshold**: If analysis fails 2 consecutive times, the controller immediately switches traffic 100% back to stable blue pods, scales canary pods to 0, and notifies PagerDuty/Slack. 4. **Database Consideration**: Rollback succeeds seamlessly only if database schema changes were additive (non-breaking expand/contract pattern).",
        juniorMistake: "Suggesting manual `git revert` or re-running an old pipeline after users start complaining.",
        interviewerFocus: "Automated telemetry-driven rollback, metric query precision, and database schema backwards-compatibility awareness.",
        followUpQuestions: [
          "What is the Expand-and-Contract (Parallel Run) database migration pattern?",
          "How do you handle sticky sessions or WebSockets during a canary rollout?"
        ]
      }
    ],

    handsOn: {
      title: "Production Azure DevOps Multi-Stage YAML Pipeline with Quality Gates",
      objective: "Author a reusable enterprise multi-stage pipeline with dynamic parameters, security linting, Docker build, and approval-gated Helm deployment.",
      steps: [
        "Define runtime parameters for deployment environment selection.",
        "Configure Stage 1: Build & Security Scanning (Trivy + Docker).",
        "Configure Stage 2: Staging deployment with automated smoke test.",
        "Configure Stage 3: Production deployment protected by Azure DevOps Environment checks."
      ],
      snippetTitle: "azure-pipelines.yml",
      snippetLang: "yaml",
      snippetCode: `parameters:
  - name: deployEnv
    displayName: Target Environment
    type: string
    default: staging
    values:
      - staging
      - production

trigger:
  branches:
    include:
      - main

variables:
  - group: devops-core-vg
  - name: imageRepository
    value: 'checkout-service'
  - name: dockerfilePath
    value: '$(Build.SourcesDirectory)/Dockerfile'
  - name: tag
    value: '$(Build.BuildId)'

stages:
- stage: BuildAndScan
  displayName: 'Build, Scan & Push'
  jobs:
  - job: Build
    pool:
      vmImage: 'ubuntu-latest'
    steps:
    - task: Docker@2
      displayName: 'Build Docker Image'
      inputs:
        command: build
        repository: $(imageRepository)
        dockerfile: $(dockerfilePath)
        tags: $(tag)
    
    - script: |
        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
        trivy image --exit-code 1 --severity CRITICAL $(imageRepository):$(tag)
      displayName: 'Run Trivy Vulnerability Scan'

    - task: Docker@2
      displayName: 'Push to Container Registry'
      inputs:
        command: push
        containerRegistry: 'acr-service-connection'
        repository: $(imageRepository)
        tags: $(tag)

- stage: DeployToStaging
  displayName: 'Deploy to Staging'
  dependsOn: BuildAndScan
  condition: succeeded()
  jobs:
  - deployment: DeployStagingJob
    environment: 'staging'
    pool:
      vmImage: 'ubuntu-latest'
    strategy:
      runOnce:
        deploy:
          steps:
          - script: echo "Deploying $(imageRepository):$(tag) via Helm to Staging..."
            displayName: 'Helm Upgrade Staging'

- stage: DeployToProd
  displayName: 'Deploy to Production'
  dependsOn: DeployToStaging
  condition: and(succeeded(), eq('\${{ parameters.deployEnv }}', 'production'))
  jobs:
  - deployment: DeployProdJob
    environment: 'production-restricted' # Configured with manual approval gate
    pool:
      vmImage: 'ubuntu-latest'
    strategy:
      runOnce:
        deploy:
          steps:
          - script: echo "Executing Canary rollout to Production..."
            displayName: 'Execute Production Canary'`,
      verificationCmd: `az pipelines run --name checkout-service-ci --parameters deployEnv=staging`
    },

    systemDesign: {
      title: "Scalable Enterprise Self-Hosted Runner Fleet Architecture",
      scenario: "Your team has 200 developers running 1,500 pipeline builds daily. GitHub-hosted runners are slow, cost \$15,000/month, and cannot access private internal VPC databases for integration testing.",
      architecturePrinciples: [
        "Ephemeral Kubernetes Runners: Deploy ARC (Actions Runner Controller) or Azure DevOps Self-Hosted Agent Pool inside private VPC EKS/AKS.",
        "Autoscaling: Scale runner pods dynamically from 0 to 100 based on webhook queue depth (HPA with custom queue metric).",
        "Security Isolation: Use rootless Docker or Kaniko/Buildah for container builds so runner pods don't mount `/var/run/docker.sock`.",
        "Persistent Caching: Mount Shared EFS / Azure Files or local NVMe SSDs for Docker layer caching and npm/Maven dependencies, slashing build times from 15m to 2m."
      ],
      tradeOffs: "Self-hosted runners require infrastructure maintenance and OS patching, but reduce costs by 70% and unlock private VPC connectivity."
    },

    checklist: [
      "Explain the exact difference between `git rebase` and `git merge` with commit graphs",
      "Explain how to secure CI/CD using OIDC without permanent cloud credentials",
      "Compare Rolling Update vs Blue/Green vs Canary deployments and trade-offs",
      "Write multi-stage pipeline with approval gates and container vulnerability scanning",
      "Understand self-hosted agent scaling and Docker socket mounting security risks"
    ]
  },

  {
    id: 3,
    dayNum: 3,
    week: 1,
    title: "Docker & Container Internals",
    subtitle: "Linux Namespaces, Cgroups v1/v2, OverlayFS, Multi-Stage Builds & Distroless Hardening",
    tags: ["Docker", "Containers", "Linux Namespaces", "Cgroups", "Container Security"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Containers are not VMs — they are isolated Linux host processes. Master the 7 Linux namespaces, cgroups resource enforcement, OverlayFS copy-on-write storage driver, signal propagation (PID 1), and image optimization techniques.",

    theory: [
      {
        title: "The Anatomy of a Container: Namespaces + Cgroups + Rootfs",
        content: `A container is simply a standard Linux process constrained by three kernel features:
1. **Linux Namespaces (Isolation)**:
   • **PID**: Process ID virtualization (process sees itself as PID 1).
   • **NET**: Isolated network stack (own IP, routing table, iptables, veth pair).
   • **MNT**: Mount points isolation (own root filesystem view via \`pivot_root\`).
   • **IPC**: Inter-process communication isolation (POSIX message queues, shared memory).
   • **UTS**: Hostname and domain name isolation.
   • **USER**: UID/GID mapping (user can be root inside container while mapped to UID 10001 on the host!).
2. **Control Groups - Cgroups (Resource Throttling)**:
   • Limits memory, CPU bandwidth, block I/O, and number of PIDs (\`pids.max\` prevents fork bombs).
   • Cgroups v2 unified hierarchy: \`/sys/fs/cgroup/system.slice/docker-<id>.scope\`.
3. **Union Filesystem (OverlayFS)**:
   • Combines \`lowerdir\` (read-only image layers) + \`upperdir\` (container read-write layer) + \`workdir\` -> presented to process as unified \`merged\` directory.`
      },
      {
        title: "Container Signal Handling: ENTRYPOINT vs CMD & PID 1",
        content: `When a container stops (\`docker stop\` or \`kubectl delete pod\`):
1. The kernel sends **SIGTERM** (signal 15) to **PID 1** inside the container.
2. The application has \`terminationGracePeriodSeconds\` (default 30s) to drain inflight HTTP connections, close DB pools, and exit cleanly.
3. If not exited within the grace period, the kernel issues **SIGKILL** (signal 9), abruptly terminating the process.

**The Shell vs Exec Form Trap**:
• **Shell form**: \`ENTRYPOINT /bin/my-app\` executes as \`/bin/sh -c /bin/my-app\`. The shell becomes PID 1 and **does NOT forward SIGTERM** to your child app! The app receives SIGKILL after 30s, causing data loss.
• **Exec form**: \`ENTRYPOINT ["/bin/my-app"]\` runs directly as PID 1, properly receiving and handling SIGTERM.`
      },
      {
        title: "Docker Image Optimization & Security Hardening",
        content: `• **Multi-Stage Builds**: Compile code in heavy SDK image (golang:1.22 / maven:3.9), copy only binary into minimal runtime image.
• **Distroless Images**: Google Distroless or Chainguard images contain ONLY your application and runtime dependencies. No shell (\`/bin/sh\`), no package manager (\`apt/apk\`), eliminating 95% of CVEs and preventing attackers from running reverse shells!
• **Non-Root Execution**: Always declare \`USER 10001:10001\`. If an attacker escapes a root-running container, they have root access on the host node kernel!`
      }
    ],

    qa: [
      {
        question: "Explain the exact difference between a Docker container and a Virtual Machine.",
        category: "Container Fundamentals",
        seniorAnswer: "1. **Kernel Sharing vs Hypervisor**: A VM runs a complete guest operating system (with its own kernel, device drivers, and system daemons) on top of a Type 1 or Type 2 hypervisor (KVM, ESXi, Hyper-V). In contrast, containers share the host Linux kernel directly via Namespaces (for isolation) and Cgroups (for resource limiting). 2. **Performance & Footprint**: VMs take minutes to boot, consume GBs of RAM for the OS overhead alone, and introduce virtualization CPU/IO penalties. Containers start in milliseconds (just spawning a process), consume only the memory the app process requires, and execute near-bare-metal speeds. 3. **Security Boundary**: VMs provide hardware-level virtualization isolation (hardware CPU VT-x/AMD-V rings). Container isolation is kernel-level; a kernel vulnerability (e.g. Dirty COW or container escape exploit) can compromise all containers on the host unless hardened with seccomp, AppArmor, or microVMs (AWS Firecracker / Kata Containers).",
        juniorMistake: "Simply saying 'Containers are lightweight VMs.' That is fundamentally incorrect and shows a lack of OS understanding.",
        interviewerFocus: "Understanding hypervisor vs kernel syscalls, boot sequence, security boundary differences, and microVM alternatives.",
        followUpQuestions: [
          "What is AWS Firecracker / Kata Containers and why are they used in multi-tenant environments?",
          "How do cgroups enforce CPU limits (CFS scheduler quota vs period)?"
        ]
      },
      {
        question: "How do you optimize a 1.8 GB microservice container image down to under 50 MB?",
        category: "Container Engineering",
        seniorAnswer: "1. **Multi-Stage Build**: Separate compile-time dependencies from runtime. Build the binary in a full SDK stage, then copy only the compiled artifact into the final stage. 2. **Base Image Selection**: Replace heavyweight OS base images (e.g. `ubuntu:22.04` or `node:20`) with Alpine (`alpine:3.19`, ~5MB) or Google Distroless (`gcr.io/distroless/static-debian12`, ~2MB). 3. **Layer Caching Optimization**: Copy dependency descriptors (`package.json`, `go.mod`, `pom.xml`) and install dependencies *before* copying source code. This ensures changes in application code don't invalidate the cached dependency layer. 4. **Minimize Layer Bloat**: Combine sequential `RUN` commands into a single layer and remove package manager caches in the same command: `apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*`. 5. **.dockerignore**: Exclude `.git`, `node_modules`, test files, and local binaries from the build context.",
        juniorMistake: "Just switching to `alpine` without understanding glibc vs musl libc compatibility issues, or failing to use multi-stage builds.",
        interviewerFocus: "Practical mastery of Dockerfile best practices, layer caching mechanics, and minimal attack surface principles.",
        followUpQuestions: [
          "What issues can arise when compiling CGO Go binaries or Python wheels on Alpine (musl libc)?",
          "What is the difference between ADD and COPY in a Dockerfile?"
        ]
      }
    ],

    handsOn: {
      title: "Hardened Multi-Stage Distroless Dockerfile Lab",
      objective: "Build an ultra-secure, minimal-footprint Go web service running as non-root on Google Distroless.",
      steps: [
        "Create an optimized multi-stage Dockerfile with dependency caching.",
        "Enforce unprivileged user execution (UID 10001).",
        "Build and inspect image layer size breakdown with `docker history`.",
        "Verify zero-shell security constraint (attempting `docker exec /bin/sh` fails)."
      ],
      snippetTitle: "Dockerfile.production",
      snippetLang: "dockerfile",
      snippetCode: `# STAGE 1: Build Environment
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Cache dependency layer
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and compile statically linked binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \\
    -ldflags="-w -s" \\
    -o /app/api-server .

# Create unprivileged non-root user
RUN adduser -D -u 10001 -s /sbin/nologin appuser

# STAGE 2: Minimal Distroless Runtime
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /app

# Copy binary and user definition
COPY --from=builder /app/api-server /app/api-server
COPY --from=builder /etc/passwd /etc/passwd

USER 10001:10001

EXPOSE 8080

ENTRYPOINT ["/app/api-server"]`,
      verificationCmd: `docker build -t secure-api:v1 -f Dockerfile.production .
docker images | grep secure-api
docker history secure-api:v1
docker run -d -p 8080:8080 --name test-api secure-api:v1
# Try to spawn shell (should fail):
docker exec -it test-api /bin/sh`
    },

    systemDesign: {
      title: "Container Security & Runtime Protection Architecture",
      scenario: "Design an automated container vulnerability and admission enforcement pipeline across your organization's Kubernetes clusters.",
      architecturePrinciples: [
        "Registry Scanning: Automatically scan every image pushed to ECR/ACR with Trivy/Grype; block promotion if CRITICAL CVEs exist.",
        "Image Signing: Sign build images cryptographically using Sigstore Cosign in GitHub Actions / Azure DevOps.",
        "Admission Controller: Deploy Kyverno or OPA Gatekeeper in K8s to reject pod deployments unless image signature is verified.",
        "Runtime Threat Detection: Run Falco on worker nodes to monitor kernel syscalls in real-time, detecting unauthorized reverse shells or privilege escalations."
      ],
      tradeOffs: "Strict admission policies can block emergency hotfixes if false-positive CVEs occur. Implement time-bound break-glass exemption procedures."
    },

    checklist: [
      "Explain the 6 core Linux namespaces and what each one isolates",
      "Explain Cgroups v1 vs v2 and how memory limits prevent container OOM cascades",
      "Demonstrate why ENTRYPOINT exec form `[\"app\"]` is required for graceful SIGTERM shutdown",
      "Build a multi-stage Dockerfile using Distroless with non-root security context",
      "Analyze image layers using `docker history` and `docker inspect`"
    ]
  },

  {
    id: 4,
    dayNum: 4,
    week: 1,
    title: "Kubernetes Core Architecture & Workloads",
    subtitle: "Control Plane, Pod Lifecycle, Controllers, Services, Kube-Proxy & Health Probes",
    tags: ["Kubernetes", "K8s Architecture", "Pods", "Services", "Probes", "Kube-Proxy"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Master the Kubernetes control plane components (API Server, etcd, Scheduler, Controller Manager), Pod startup/termination sequences, workload controller semantics, and the internal networking mechanics of kube-proxy (iptables vs IPVS).",

    theory: [
      {
        title: "Kubernetes Control Plane Internals",
        content: `• **kube-apiserver**: The only component that talks directly to etcd. Exposes REST API, validates and configures data for pods, services, etc. Authenticates (Certificates/OIDC) -> Authorizes (RBAC) -> Mutating Webhooks -> Validating Webhooks.
• **etcd**: Distributed, consistent key-value store using the Raft consensus algorithm. Stores cluster state. All writes go through the Raft leader.
• **kube-scheduler**: Watches for unassigned pods; evaluates **Filtering (Predicates)** (node resources, taints, nodeSelector) and **Scoring (Priorities)** (pod anti-affinity, image locality) to pick the best node.
• **kube-controller-manager**: Runs core control loops (DeploymentController, ReplicaSetController, NodeController, EndpointsController). Continuously reconciles: Current State -> Desired State.
• **kubelet**: Node agent. Talks to Container Runtime (containerd) via CRI (Container Runtime Interface); manages pod mounts, secrets, and runs health probes.`
      },
      {
        title: "Workload Controllers: Deployment vs StatefulSet vs DaemonSet",
        content: `• **Deployment**: For stateless applications. Replicas are fungible (interchangeable), have random pod names (\`web-7468d6c79-abcde\`), and use shared storage or no storage.
• **StatefulSet**: For stateful systems (Kafka, Cassandra, PostgreSQL).
  - Stable, predictable network identity: \`kafka-0\`, \`kafka-1\`.
  - Ordered graceful scaling and ordered rolling updates.
  - \`volumeClaimTemplates\`: Each pod gets its own dedicated, persistent volume that re-attaches even if the pod is rescheduled to another node.
  - Requires a Headless Service (\`clusterIP: None\`) for direct peer-to-peer pod DNS resolution.
• **DaemonSet**: Ensures exactly one copy of a pod runs on all (or selected) nodes. Used for cluster infrastructure: logging agents (FluentBit), monitoring (node-exporter), and network plugins (Calico/Cilium).`
      },
      {
        title: "Kube-Proxy: iptables vs IPVS Mode",
        content: `Services in K8s are not physical devices — they are virtual IPs (ClusterIP). Kube-proxy implements the Service abstraction on worker nodes:
• **iptables Mode**: Kube-proxy writes netfilter iptables rules for every service and endpoint. Limitation: iptables evaluates rules sequentially $O(N)$. In clusters with 5,000+ services, iptables rule sync consumes massive CPU and introduces packet latency.
• **IPVS (IP Virtual Server) Mode**: Uses Netfilter hash tables $O(1)$ lookup complexity. Supports advanced load balancing algorithms (least connection, weighted response time). Far more scalable for large enterprise clusters.`
      },
      {
        title: "Pod Health Probes: Liveness, Readiness & Startup",
        content: `• **Liveness Probe**: Determines if container is alive. If probe fails, kubelet **kills the container and restarts it** according to \`restartPolicy\`. Never point liveness probe at external dependencies (like DB)! If the DB goes down, all your pods will restart in a catastrophic cascade.
• **Readiness Probe**: Determines if container is ready to accept user traffic. If probe fails, the Endpoints Controller **removes the Pod's IP from the Service endpoints list**. The pod keeps running, but receives no traffic.
• **Startup Probe**: Protects slow-starting legacy applications. Disables liveness and readiness checks until startup succeeds, preventing kubelet from killing the app prematurely.`
      }
    ],

    qa: [
      {
        question: "What exact sequence of events occurs when a Kubernetes Pod is deleted?",
        category: "Kubernetes Internals",
        seniorAnswer: "1. **API Server updates state**: Pod status is set to `Terminating` and marked with `deletionTimestamp`. 2. **Two parallel actions trigger simultaneously**: \n  a) **Endpoints Controller removal**: EndpointsController detects terminating status, removes pod IP from the Service's Endpoints/EndpointSlice. Kube-proxy on every worker node updates iptables/IPVS to stop routing new traffic to this pod. Ingress controllers remove the backend.\n  b) **Kubelet execution**: Kubelet sees the termination timestamp and triggers the pod's `preStop` hook (if configured). 3. **preStop Hook Execution**: Runs synchronously (blocking). Best practice: run `sleep 5-10` to allow time for iptables/Ingress rules to propagate across all cluster nodes before the app stops accepting traffic. 4. **SIGTERM Signal**: Kubelet sends SIGTERM to the container's PID 1 process. The app stops accepting new requests, finishes inflight requests, and closes connections. 5. **Grace Period Expiration**: If the container does not exit before `terminationGracePeriodSeconds` (default 30s), kubelet issues **SIGKILL** to forcibly terminate. 6. **Cleanup**: Kubelet reports pod deletion to API server; API server removes the pod record from etcd.",
        juniorMistake: "Thinking Kubelet immediately sends SIGKILL, or unaware that Service endpoint removal happens in parallel with pod shutdown (which causes dropped 502 packets without a preStop hook).",
        interviewerFocus: "Understanding distributed parallel execution, zero-downtime mechanics, preStop hook purpose, and grace period timing.",
        followUpQuestions: [
          "Why do HTTP clients experience intermittent 502/504 errors during rolling updates if preStop hook is omitted?",
          "What is a PodDisruptionBudget (PDB) and why is it critical during node drains?"
        ]
      },
      {
        question: "Explain the difference between ClusterIP, NodePort, LoadBalancer, and Headless Services.",
        category: "Kubernetes Networking",
        seniorAnswer: "1. **ClusterIP (Default)**: Exposes service on an internal IP reachable only inside the cluster. Used for inter-service communication. 2. **NodePort**: Allocates a static port (default range 30000-32767) on every worker node's external IP (`<NodeIP>:<NodePort>`). Packets hitting this port are routed to the service's backend pods via kube-proxy NAT. 3. **LoadBalancer**: Builds on top of NodePort and ClusterIP. Asynchronously provisions an external cloud load balancer (e.g. AWS NLB, Azure Load Balancer) that forwards traffic directly to the NodePort or Pod IPs. 4. **Headless Service (`clusterIP: None`)**: Does NOT allocate a virtual ClusterIP. Instead of returning a single VIP, CoreDNS returns the individual A records of all healthy backing pod IPs directly. Essential for StatefulSets (e.g. database clustering or Kafka) where clients need direct peer-to-peer connections to specific instances.",
        juniorMistake: "Thinking LoadBalancer operates completely independently of NodePort/ClusterIP.",
        interviewerFocus: "Layered service inheritance model and use cases for Headless Services in distributed stateful systems.",
        followUpQuestions: [
          "What is `externalTrafficPolicy: Local` on a Service and what trade-offs does it introduce?",
          "How does CoreDNS resolve headless service queries compared to standard ClusterIP queries?"
        ]
      }
    ],

    handsOn: {
      title: "Resilient Microservice Deployment with Graceful Shutdown & Probes",
      objective: "Author and deploy a production-grade Kubernetes Deployment with anti-affinity, preStop hooks, and hardened probe configurations.",
      steps: [
        "Create Deployment manifest with resource requests/limits and PodDisruptionBudget.",
        "Configure preStop hook to eliminate zero-downtime 502 drops during rolling upgrades.",
        "Tune liveness and readiness probes with proper thresholds.",
        "Simulate rolling update under load and verify zero dropped requests."
      ],
      snippetTitle: "resilient-deployment.yaml",
      snippetLang: "yaml",
      snippetCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: production
  labels:
    app: order-service
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0 # Zero downtime guarantee
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values: ["order-service"]
              topologyKey: "topology.kubernetes.io/zone"
      terminationGracePeriodSeconds: 45
      containers:
      - name: order-api
        image: myregistry.azurecr.io/order-api:v2.4.1
        ports:
        - containerPort: 8080
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 10"] # Wait for endpoint propagation
        resources:
          requests:
            cpu: "250m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1024Mi"
        readinessProbe:
          httpGet:
            path: /healthz/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          failureThreshold: 3
        livenessProbe:
          httpGet:
            path: /healthz/live
            port: 8080
          initialDelaySeconds: 20
          periodSeconds: 10
          failureThreshold: 3
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: order-service-pdb
  namespace: production
spec:
  minAvailable: 75%
  selector:
    matchLabels:
      app: order-service`,
      verificationCmd: `kubectl apply -f resilient-deployment.yaml
kubectl rollout status deployment/order-service -n production
kubectl get endpoints order-service -n production -o wide`
    },

    systemDesign: {
      title: "Zero-Downtime Cluster Node Upgrades (K8s 1.28 -> 1.29)",
      scenario: "Plan a seamless control plane and worker node pool upgrade across 150 production nodes hosting 1,200 microservice pods with strict SLA requirements.",
      architecturePrinciples: [
        "Control plane first: Upgrade API server, etcd, controller-manager, scheduler one minor version at a time.",
        "PodDisruptionBudgets (PDB): Ensure all critical services define PDBs to prevent eviction storms during node drains.",
        "Safe Drain Sequence: `kubectl cordon <node>` (disable scheduling) -> `kubectl drain <node> --ignore-daemonsets --delete-emptydir-data`.",
        "Surge Node Pools: In managed cloud (EKS/AKS), provision a new temporary worker node pool with v1.29, migrate workloads via node selector/taints, verify stability, and decommission the old pool."
      ],
      tradeOffs: "In-place node rolling upgrades take longer to complete; Surge node pools require extra temporary cloud compute capacity for 1-2 hours."
    },

    checklist: [
      "Explain the exact communication flow between API Server, etcd, Scheduler, and Kubelet",
      "Differentiate Deployment vs StatefulSet vs DaemonSet with concrete use cases",
      "Explain why iptables mode in kube-proxy degrades at scale compared to IPVS mode",
      "Configure `preStop` hook with `sleep 10` and explain how it prevents 502 errors during rolling deploy",
      "Understand PodDisruptionBudgets (PDB) and safe node drain mechanics"
    ]
  },

  {
    id: 5,
    dayNum: 5,
    week: 1,
    title: "Advanced Kubernetes & Production Hardening",
    subtitle: "HPA/VPA/KEDA, Karpenter, Taints & Affinity, CNI Deep Dive, RBAC, NetworkPolicies & Helm",
    tags: ["Kubernetes", "Autoscaling", "KEDA", "Karpenter", "CNI", "Helm", "RBAC"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Elevate your Kubernetes expertise to senior level: Event-driven scaling with KEDA, fast node provisioning with Karpenter, CNI internals (Calico vs Cilium eBPF), multi-tenant RBAC boundaries, NetworkPolicies, and production Helm packaging.",

    theory: [
      {
        title: "Autoscaling Trifecta: HPA, KEDA & Karpenter",
        content: `• **Horizontal Pod Autoscaler (HPA)**: Scales pod replicas based on CPU/Memory via metrics-server. Limitation: CPU/Memory are lagging indicators!
• **KEDA (Kubernetes Event-driven Autoscaling)**: Scales pods based on actual business events before CPU spikes occur (e.g. Kafka consumer lag, SQS queue depth, Redis queue length, active HTTP connections). Can scale pods from **0 to N** and back to 0!
• **Cluster Autoscaler vs Karpenter**:
  - *Cluster Autoscaler*: Reactive. Increases ASG node counts when pods become Pending. Slow (takes 3-6 minutes to provision EC2 nodes).
  - *Karpenter (Next-Gen)*: Directly calls cloud APIs (EC2/Azure VMs). Bypasses node groups, evaluates pending pod resource shapes, selects optimal instance types (e.g. mixed spot/on-demand, bin-packing), and provisions ready nodes in 30-45 seconds!`
      },
      {
        title: "Scheduling Control: Taints, Tolerations & Affinity",
        content: `• **Taints (Applied to Nodes)**: Repels pods. Format: \`key=value:effect\` (\`NoSchedule\`, \`PreferNoSchedule\`, \`NoExecute\`). E.g. dedicated GPU nodes: \`gpu=true:NoSchedule\`.
• **Tolerations (Applied to Pods)**: Allows (but does not force) a pod to schedule onto a node with a matching taint.
• **Node Affinity**: Attracts pods to specific nodes based on node labels (\`requiredDuringScheduling\` vs \`preferredDuringScheduling\`).
• **Pod Anti-Affinity**: Prevents identical pod replicas from scheduling on the same node or same availability zone, guaranteeing high availability during single-AZ outages.`
      },
      {
        title: "CNI Plugins: Calico (iptables) vs Cilium (eBPF)",
        content: `Every pod gets its own routable IP. The Container Network Interface (CNI) coordinates this:
• **Calico**: Uses Linux routing and iptables/IPVS. Reliable and battle-tested. Implements NetworkPolicies using iptables rules.
• **Cilium (Modern Standard)**: Replaces iptables with **eBPF (Extended Berkeley Packet Filter)** bytecode executed directly in the Linux kernel space.
  - Performance: Bypasses iptables connection tracking overhead. Ultra-high throughput and lower CPU overhead.
  - Security & Observability: Inspects Layer 7 HTTP/gRPC traffic without sidecars (Hubble UI). Transparent WireGuard network encryption between nodes.`
      },
      {
        title: "RBAC & Network Security Policies",
        content: `• **RBAC**: Principle of least privilege. Bind \`ServiceAccount\` to a scoped \`Role\` (within a namespace) or \`ClusterRole\` via \`RoleBinding\`. Never grant \`*\` verbs on \`*\` resources.
• **NetworkPolicy**: K8s firewall. By default, pods accept traffic from any source. Best Practice: Apply a **Default-Deny All Ingress/Egress** policy to every namespace, then explicitly allow required inter-service communication ports.`
      }
    ],

    qa: [
      {
        question: "How do you diagnose and resolve a Pod stuck in CrashLoopBackOff?",
        category: "Kubernetes Troubleshooting",
        seniorAnswer: "1. **Check Exit Code**: Run `kubectl describe pod <pod-name>` and look at the `Last State` exit code: \n  • **Exit Code 137**: Process killed by SIGKILL (128 + 9). Almost always **OOMKilled** (check `OOMKilled: true`). Solution: Increase memory limits or profile memory leaks.\n  • **Exit Code 1**: General application error or unhandled runtime exception (e.g. database connection refused, missing environment variable).\n  • **Exit Code 126/127**: Command or binary cannot be found or executed (wrong ENTRYPOINT path or missing shared library in Alpine).\n  • **Exit Code 143**: Process received SIGTERM (128 + 15), possibly graceful shutdown triggered by failed liveness probe. 2. **Inspect Logs**: Run `kubectl logs <pod-name> --previous` to see stdout/stderr before the last crash. 3. **Inspect Events**: Run `kubectl get events --sort-by=.metadata.creationTimestamp` to check if liveness probes failed or config maps were missing. 4. **Ephemeral Debugging**: If container crashes immediately, run `kubectl debug pod/<pod-name> -it --image=busybox` or override entrypoint to `/bin/sh` to inspect filesystem configurations.",
        juniorMistake: "Just running `kubectl logs` without `--previous` and being confused by an empty log output after the pod restarts.",
        interviewerFocus: "Knowledge of Linux exit code math (128 + signal), `--previous` flag usage, and systematic root-cause elimination.",
        followUpQuestions: [
          "What is the difference between Pod OOMKilled vs Node OOM (kernel oom_killer)?",
          "How do you debug a CrashLoopBackOff if the container exits before writing any logs?"
        ]
      },
      {
        question: "How does Karpenter provision nodes faster than the traditional Kubernetes Cluster Autoscaler?",
        category: "Kubernetes Autoscaling",
        seniorAnswer: "Traditional Cluster Autoscaler relies on cloud provider Auto Scaling Groups (ASGs). When a pod is unschedulable, CA calls AWS ASG APIs to increase group size; EC2 initializes, runs user-data, joins cluster, and registers with kubelet (takes 3-6 minutes). If different instance sizes are needed, multiple ASGs must be maintained. \n\nKarpenter operates directly with cloud compute APIs (EC2 Fleet / Azure VMSS APIs), completely bypassing ASGs. Karpenter evaluates the aggregate pending pods' CPU, memory, architecture (ARM64 vs x86_64), and pricing requirements. In a single API call, it requests the exact right-sized instance (or optimal Spot capacity), pre-configures kubelet credentials, and brings a node to `Ready` state in ~35-45 seconds. Furthermore, Karpenter continuously performs **consolidation** — draining and terminating underutilized nodes or packing pods onto cheaper instance types automatically.",
        juniorMistake: "Describing Cluster Autoscaler and Karpenter as identical tools that just change VM count.",
        interviewerFocus: "Understanding cloud compute API mechanics, bin-packing algorithms, Spot instance orchestration, and consolidation.",
        followUpQuestions: [
          "How does Karpenter handle graceful Spot Instance Interruption Notices?",
          "What is Pod consolidation in Karpenter and how do you prevent disruptive pod thrashing?"
        ]
      }
    ],

    handsOn: {
      title: "Zero-Trust NetworkPolicy & KEDA ScaledObject Lab",
      objective: "Enforce a default-deny NetworkPolicy and configure event-driven autoscaling with KEDA based on RabbitMQ/Kafka queue depth.",
      steps: [
        "Deploy a default-deny ingress/egress NetworkPolicy in the payment namespace.",
        "Add explicit ingress allow rule allowing traffic only from ingress-controller pods on port 8080.",
        "Configure KEDA ScaledObject to scale deployment based on queue backlog.",
        "Simulate queue flood and observe instant pod replica expansion."
      ],
      snippetTitle: "zero-trust-and-keda.yaml",
      snippetLang: "yaml",
      snippetCode: `# 1. Default-Deny All Ingress in Namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: payment
spec:
  podSelector: {}
  policyTypes:
  - Ingress
---
# 2. Allow Ingress Only from API Gateway
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-gateway
  namespace: payment
spec:
  podSelector:
    matchLabels:
      app: payment-processor
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: gateway
      podSelector:
        matchLabels:
          app: api-gateway
    ports:
    - protocol: TCP
      port: 8080
---
# 3. KEDA Event-Driven Autoscaler
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: payment-queue-scaler
  namespace: payment
spec:
  scaleTargetRef:
    name: payment-processor
  minReplicaCount: 2
  maxReplicaCount: 30
  pollingInterval: 15
  cooldownPeriod: 60
  triggers:
  - type: aws-sqs-queue
    metadata:
      queueURL: https://sqs.us-east-1.amazonaws.com/123456789/payment-jobs
      queueLength: "50"
      awsRegion: us-east-1
    authenticationRef:
      name: keda-aws-credentials`,
      verificationCmd: `kubectl apply -f zero-trust-and-keda.yaml
kubectl get networkpolicies -n payment
kubectl get scaledobject payment-queue-scaler -n payment`
    },

    systemDesign: {
      title: "Multi-Tenant Enterprise Kubernetes Cluster Hardening",
      scenario: "Design an internal Kubernetes platform hosting 40 engineering teams on shared EKS/AKS clusters, guaranteeing security isolation and budget cost allocation.",
      architecturePrinciples: [
        "Namespace Isolation: 1 namespace per team/microservice. Enforce ResourceQuotas (CPU/RAM limits) and LimitRanges.",
        "Network Segmentation: Default-deny NetworkPolicies preventing cross-team traffic unless explicitly authorized.",
        "Admission Governance: Kyverno policies to ban privileged containers, require read-only root filesystems, and mandate cost-center tags.",
        "Cost Allocation: Deploy Kubecost / OpenCost to measure granular CPU/RAM and cloud storage consumption per namespace/team for internal chargeback."
      ],
      tradeOffs: "Multi-tenant shared clusters maximize hardware utilization and lower infrastructure bills, but require strict governance to avoid 'noisy neighbor' CPU throttling."
    },

    checklist: [
      "Explain the exact difference between HPA (metrics-server) and KEDA (event-driven)",
      "Explain Karpenter node provisioning advantages over traditional Cluster Autoscaler",
      "Understand Linux exit code 137 (OOMKilled) vs 1 (Runtime error) in CrashLoopBackOff",
      "Write a zero-trust default-deny NetworkPolicy YAML",
      "Explain Cilium eBPF advantages over traditional Calico iptables networking"
    ]
  },

  {
    id: 6,
    dayNum: 6,
    week: 1,
    title: "Cloud Infrastructure (AWS & Azure Deep Dive)",
    subtitle: "VPC/VNet Peering, Transit Gateway, IAM & Workload Identity, ALB/NLB, EKS & AKS",
    tags: ["Cloud", "AWS", "Azure", "VPC", "Networking", "IAM", "EKS", "AKS"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Deep dive into production cloud infrastructure: Multi-tier VPC/VNet topologies, private endpoints, AWS IAM IRSA vs Azure Workload Identity, Layer 4 vs Layer 7 load balancing architectures, and managed Kubernetes deployment best practices.",

    theory: [
      {
        title: "VPC / VNet Architecture: Public, Private & Isolated Subnets",
        content: `A bulletproof cloud network topology requires 3 subnet tiers across at least 3 Availability Zones (AZs):
1. **Public Subnet**: Route table points \`0.0.0.0/0\` to Internet Gateway (IGW). Hosts ONLY public-facing ALBs or NAT Gateways. No application containers or EC2 instances live here!
2. **Private Subnet**: Route table points \`0.0.0.0/0\` to NAT Gateway (outbound internet access for package updates, third-party APIs). Hosts EKS/AKS worker nodes and application workloads.
3. **Database / Isolated Subnet**: NO internet route (no IGW, no NAT). Strictly internal communication from private subnets only.
• **VPC Peering vs AWS Transit Gateway / Azure Virtual WAN**:
  - *VPC Peering*: Point-to-point, non-transitive. If VPC A peers with B, and B with C, A CANNOT reach C! Managing 20 VPCs requires 190 peering connections ($N*(N-1)/2$).
  - *Transit Gateway (Hub-and-Spoke)*: Transitive routing. Connects hundreds of VPCs and on-premises VPNs through a central managed router with centralized route tables.`
      },
      {
        title: "IAM Security: Eliminating Hardcoded Credentials via Workload Identity",
        content: `Senior engineers never use static IAM access keys in pods:
• **AWS IRSA (IAM Roles for Service Accounts)**:
  1. EKS hosts an OIDC Discovery Endpoint.
  2. Kubernetes ServiceAccount is annotated with the IAM Role ARN.
  3. Kubelet projects a signed JWT OIDC token into the pod at \`/var/run/secrets/eks.amazonaws.com/serviceaccount/token\`.
  4. AWS SDK calls \`sts:AssumeRoleWithWebIdentity\` exchanging the JWT for temporary 1-hour AWS credentials.
• **Azure AD Workload Identity**:
  - Identical pattern for AKS: Pod uses projected federated token to authenticate with Azure Entra ID, assuming a Managed Identity without storing any client secrets!`
      },
      {
        title: "Load Balancers: ALB vs NLB vs Azure Application Gateway",
        content: `• **AWS ALB / Azure App Gateway (Layer 7)**:
  - Operates at application layer (HTTP/HTTPS/gRPC/WebSockets).
  - Features: Path-based routing (\`/api\` vs \`/static\`), host-based routing, TLS termination, WAF (Web Application Firewall) integration, HTTP/2 multiplexing.
  - Slower than L4 (terminates TCP connection, inspects HTTP headers).
• **AWS NLB / Azure Standard Load Balancer (Layer 4)**:
  - Operates at transport layer (TCP/UDP/TLS passthrough).
  - Millions of requests/second with ultra-low sub-millisecond latency.
  - Static Anycast IP addresses (ideal for whitelisting firewalls). No HTTP header inspection.`
      }
    ],

    qa: [
      {
        question: "Explain the architectural difference between AWS ALB (Layer 7) and NLB (Layer 4). When would you choose one over the other?",
        category: "Cloud Networking",
        seniorAnswer: "1. **Protocol & OSI Layer**: ALB operates at Layer 7 (Application); it terminates the TCP connection, parses HTTP/HTTPS/gRPC headers, and can perform content-based routing (e.g. routing `/checkout` to Payment target group and `/media` to S3). NLB operates at Layer 4 (Transport); it handles raw TCP/UDP streams without parsing application payloads. 2. **Performance & Scalability**: NLB can handle tens of millions of requests per second with microsecond latency and automatically handles sudden traffic spikes without pre-warming. ALB scales elastically but requires warming for instantaneous 10x spikes. 3. **Static IPs**: NLB provides a static Elastic IP per Availability Zone (crucial when enterprise clients whitelist IP addresses in corporate firewalls). ALB uses dynamic DNS names resolving to changing IPs. 4. **Decision Matrix**: Choose ALB for standard microservice APIs requiring path routing, WAF, and TLS termination. Choose NLB for extreme throughput, gaming/streaming protocols, IoT MQTT, WebSockets requiring low latency, or static IP compliance.",
        juniorMistake: "Focusing only on cost or saying 'ALB is for HTTP and NLB is for everything else' without mentioning TCP termination, static IPs, or latency differences.",
        interviewerFocus: "Understanding OSI Layer tradeoffs, TCP connection termination mechanics, static IP requirements, and scaling latency.",
        followUpQuestions: [
          "How does ALB handle sticky sessions and what problems can they cause during autoscaling?",
          "How can you combine CloudFront + ALB + WAF for DDoS protection?"
        ]
      },
      {
        question: "How do you securely connect private workloads across 30 different AWS VPCs or Azure VNets without creating a mesh of peering links?",
        category: "Cloud Architecture",
        seniorAnswer: "In AWS, we deploy an **AWS Transit Gateway (TGW)** in a central Network Hub account. In Azure, we use **Azure Virtual WAN** or Hub-and-Spoke with Azure Firewall. \n\n1. **Hub-and-Spoke Topology**: Instead of managing $N*(N-1)/2$ non-transitive peering links (which for 30 VPCs would equal 435 peering connections!), each VPC attaches to the central Transit Gateway via an ENI in a dedicated transit subnet. 2. **Route Table Segmentation**: We maintain segmented TGW route tables (e.g., `Prod-RT`, `NonProd-RT`, `SharedServices-RT`) to enforce network isolation (e.g. NonProd cannot route to Prod). 3. **Egress Inspection**: All outbound internet traffic routes through the central Hub VPC containing an inspection firewall cluster (e.g. AWS Network Firewall or Palo Alto) and centralized NAT Gateways, reducing NAT gateway costs across 30 VPCs.",
        juniorMistake: "Suggesting VPC peering across all 30 VPCs or routing traffic over the public internet using IPsec VPNs.",
        interviewerFocus: "Hub-and-spoke enterprise network topology, transitive routing, centralized egress inspection, and cost optimization.",
        followUpQuestions: [
          "What is AWS PrivateLink (VPC Endpoints) and how does it prevent traffic from leaving the AWS private backbone?",
          "How do you share subnets across AWS accounts using AWS RAM (Resource Access Manager)?"
        ]
      }
    ],

    handsOn: {
      title: "AWS IRSA / Azure Workload Identity Terraform Module",
      objective: "Configure zero-trust OIDC federated IAM authentication for Kubernetes pods to access cloud resources without static secrets.",
      steps: [
        "Create IAM Role with trust policy bound to Kubernetes OIDC provider.",
        "Scoped permissions to specific S3 bucket or Azure Key Vault.",
        "Bind IAM Role to Kubernetes ServiceAccount in target namespace.",
        "Verify pod assumes role and retrieves AWS STS temporary token."
      ],
      snippetTitle: "irsa-workload-identity.tf",
      snippetLang: "hcl",
      snippetCode: `# AWS IAM Role for Service Account (IRSA)
data "aws_iam_policy_document" "oidc_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    condition {
      test     = "StringEquals"
      variable = "\${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub"
      values   = ["system:serviceaccount:production:order-api-sa"]
    }

    condition {
      test     = "StringEquals"
      variable = "\${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud"
      values   = ["sts.amazonaws.com"]
    }

    principals {
      identifiers = [aws_iam_openid_connect_provider.eks.arn]
      type        = "Federated"
    }
  }
}

resource "aws_iam_role" "order_api_role" {
  name               = "production-order-api-irsa"
  assume_role_policy = data.aws_iam_policy_document.oidc_assume_role.json
}

resource "aws_iam_policy" "s3_access" {
  name        = "order-invoices-s3-policy"
  description = "Scoped read/write to invoices S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:s3:::company-invoices-production/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach" {
  role       = aws_iam_role.order_api_role.name
  policy_arn = aws_iam_policy.s3_access.arn
}`,
      verificationCmd: `terraform apply -target=aws_iam_role.order_api_role
# In K8s manifest:
# annotations: eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/production-order-api-irsa`
    },

    systemDesign: {
      title: "Multi-AZ Highly Available Cloud Infrastructure Architecture",
      scenario: "Design a fault-tolerant AWS/Azure infrastructure for a fintech payment platform that guarantees 99.99% availability during an entire Availability Zone hardware failure.",
      architecturePrinciples: [
        "Multi-AZ Compute: Deploy EKS worker nodes across 3 distinct AZs (us-east-1a, 1b, 1c) using Pod Anti-Affinity.",
        "Multi-AZ Database: Aurora PostgreSQL Multi-AZ cluster with automatic storage replication and sub-30-second automated failover.",
        "Multi-AZ Ingress: Application Load Balancer spanning all 3 public subnets with health checks configured to stop routing to degraded AZ.",
        "Cross-AZ Data Transfer Cost Awareness: Place chattiest microservices in the same AZ or implement Service Mesh local endpoint routing to avoid cross-AZ bandwidth charges."
      ],
      tradeOffs: "Synchronous cross-AZ replication adds 1-2ms network latency to database commits, but provides zero-RPO data durability."
    },

    checklist: [
      "Draw 3-tier VPC architecture (Public, Private, Database subnets) across multiple AZs",
      "Explain OIDC federation (AWS IRSA / Azure Workload Identity) token flow step-by-step",
      "Compare Layer 4 (NLB) vs Layer 7 (ALB / App Gateway) with performance trade-offs",
      "Explain Transit Gateway hub-and-spoke routing vs VPC peering scalability limits",
      "Implement IAM least-privilege scoping without wildcard (`*`) actions"
    ]
  },

  {
    id: 7,
    dayNum: 7,
    week: 1,
    title: "Terraform & Infrastructure as Code (IaC)",
    subtitle: "State Locking, Remote Backends, Drift Detection, Reusable Modules, Workspaces & Terragrunt",
    tags: ["Terraform", "IaC", "State Management", "Drift Detection", "DevOps Automation"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Master enterprise Infrastructure as Code: Terraform state lifecycle, remote state locking mechanics with S3/DynamoDB and Azure Blob leases, modular architectural design, drift detection workflows, and multi-environment orchestration.",

    theory: [
      {
        title: "Terraform State Internals & State Locking",
        content: `• **State File Purpose**: Maps your declarative HCL code to real-world cloud resource IDs (\`aws_instance.web\` -> \`i-0123456789abcdef\`). Tracks resource metadata, dependencies, and cached attribute values.
• **State Locking Mechanics**:
  - *AWS Backend*: S3 stores the state file (\`terraform.tfstate\`); DynamoDB provides distributed locking via a primary partition key \`LockID\`.
  - When you run \`terraform plan\` or \`apply\`, Terraform creates a lock entry with MD5 hash, timestamp, and process info.
  - If another engineer or CI pipeline tries to run concurrently, it fails with: \`Error: Error acquiring the state lock\`.
  - Prevents fatal state file corruption caused by race conditions!`
      },
      {
        title: "Terraform Lifecycle: Init -> Plan -> Apply -> Refresh",
        content: `1. **init**: Downloads required provider plugins (\`.terraform/providers\`) and initializes the remote backend.
2. **refresh**: Queries cloud APIs directly to determine current real-world state of existing resources.
3. **plan**: Compares (Desired State in Code) vs (Current State in Cloud via Refresh). Computes an execution plan graph of additions (+), modifications (~), and destructions (-).
4. **apply**: Executes required cloud API calls in topological dependency order. Updates state file atomically upon completion.`
      },
      {
        title: "Drift Detection & Remediation",
        content: `• **Configuration Drift**: Occurs when engineers make out-of-band manual changes in the AWS/Azure web console, bypassing Terraform.
• **Detection**:
  - Run \`terraform plan -detailed-exitcode\` in a scheduled CI/CD cron job (e.g. nightly).
  - Exit code 0 = No changes / clean state.
  - Exit code 2 = Drift detected! Alert team or auto-trigger approval pipeline.
• **Remediation**: Either update Terraform code to match the manual change, or run \`terraform apply\` to overwrite the manual drift and enforce desired state.`
      },
      {
        title: "Environment Management: Workspaces vs Directory Separation",
        content: `• **Terraform Workspaces**: Shares the exact same HCL code and directory, changing only the state file path (\`dev.tfstate\` vs \`prod.tfstate\`).
  - *Major Senior Pitfall*: Risk of accidental \`terraform apply\` in prod when you thought you were on dev; hard to enforce different provider credentials or structural differences.
• **Directory Separation / Terragrunt (Recommended)**:
  - Isolate environments into distinct folders: \`environments/dev/\`, \`environments/prod/\`.
  - Each environment has independent state files and separate cloud credentials. Prevents a mistake in dev from touching prod state.`
      }
    ],

    qa: [
      {
        question: "How do you resolve a stuck Terraform state lock in a production CI/CD pipeline?",
        category: "Terraform & IaC",
        seniorAnswer: "1. **Investigate Before Unlocking**: Never unlock blindly! Check the Lock ID, Created timestamp, and Owner info in the error message. Verify whether an actual CI/CD pipeline job or another engineer is actively running an apply. 2. **Check Cloud Storage**: If confirmed that the CI agent died abruptly (e.g. OOM killed or cancelled mid-apply), check the DynamoDB table (or Azure Blob lease). 3. **Run Force-Unlock**: Run `terraform force-unlock <LOCK_ID>`. 4. **Verify State Integrity**: After unlocking, run `terraform plan` to ensure the state file was not left in a corrupt half-written state. If corrupted, restore the previous state version from S3 bucket versioning (which must always be enabled on remote backend buckets).",
        juniorMistake: "Immediately running force-unlock without checking if a teammate is currently applying a large database change, causing catastrophic state corruption.",
        interviewerFocus: "Safety-first protocol, understanding distributed lock mechanics, DynamoDB LockID table structure, and state versioning recovery.",
        followUpQuestions: [
          "What happens if an apply fails halfway through creating 10 resources?",
          "How does the `terraform import` block introduced in Terraform 1.5+ work compared to the legacy CLI command?"
        ]
      },
      {
        question: "How do you detect and prevent infrastructure drift across hundreds of cloud resources?",
        category: "IaC Governance",
        seniorAnswer: "1. **Prevent Drift at the Root (Least Privilege)**: Revoke write/edit console access from all human engineers in Production environments. Production changes must exclusively execute via automated CI/CD pipelines (GitHub Actions / GitLab / Atlantis). 2. **Automated Scheduled Drift Scanners**: Run a scheduled cron job (every 6 hours) running `terraform plan -detailed-exitcode -no-color`. If exit code is 2 (drift detected), stream the plan diff to Slack / PagerDuty. 3. **Drift-Detection Tools**: Utilize specialized tools like Driftctl, Spacelift, or Terraform Cloud automated drift detection. 4. **Auto-Remediation or Git Sync**: If drift was an emergency manual hotfix during an outage, the engineer must immediately backport the change into the Git repo via PR.",
        juniorMistake: "Suggesting that running `terraform apply` manually once a month is sufficient.",
        interviewerFocus: "IAM governance (removing console write permissions), CI/CD automation with detailed exit codes, and incident post-mortem workflows.",
        followUpQuestions: [
          "How do you handle sensitive outputs in Terraform state without leaking plaintext passwords?",
          "What is the difference between `count` and `for_each` in Terraform modules?"
        ]
      }
    ],

    handsOn: {
      title: "Production S3 + DynamoDB Encrypted Remote Backend",
      objective: "Provision a secure Terraform remote state backend with KMS encryption, S3 versioning, and DynamoDB distributed state locking.",
      steps: [
        "Create S3 bucket with strict bucket policy and KMS encryption enabled.",
        "Enable S3 bucket versioning to ensure instant state rollback capability.",
        "Create DynamoDB table with `LockID` string partition key.",
        "Configure `backend \"s3\"` block and initialize migration with `terraform init`."
      ],
      snippetTitle: "backend-setup.tf",
      snippetLang: "hcl",
      snippetCode: `terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# 1. Encrypted, Versioned S3 Bucket for State
resource "aws_s3_bucket" "terraform_state" {
  bucket        = "company-production-tfstate-storage"
  force_destroy = false

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "crypto" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "block_public" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 2. DynamoDB Table for Distributed State Locking
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "company-production-tflocks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

# 3. Usage in root module:
# backend "s3" {
#   bucket         = "company-production-tfstate-storage"
#   key            = "production/networking/terraform.tfstate"
#   region         = "us-east-1"
#   dynamodb_table = "company-production-tflocks"
#   encrypt        = true
# }`,
      verificationCmd: `terraform init
terraform plan -detailed-exitcode
aws dynamodb describe-table --table-name company-production-tflocks`
    },

    systemDesign: {
      title: "Enterprise Multi-Account Terraform Repository Structure",
      scenario: "Architect an IaC repository structure for an enterprise with 50 microservices across Dev, Staging, and Production environments managed by 10 platform engineers.",
      architecturePrinciples: [
        "Monorepo with Layered Stacks: Separate state by lifecycle: `networking/` (VPC/TGW, changes rarely), `kubernetes/` (EKS/AKS clusters), and `workloads/` (databases/queues).",
        "Directory Separation: `envs/dev/networking/`, `envs/prod/networking/` with DRY Terragrunt or reusable modules.",
        "Automated PR Planning (Atlantis / GitHub Actions): Automatically runs `terraform plan` on PR creation, posts rich markdown diff comments, and executes `apply` only upon peer review approval and merge.",
        "Security Scanning in CI: Enforce Checkov or tfsec scans in the pipeline to reject unencrypted EBS volumes or public S3 buckets before apply."
      ],
      tradeOffs: "Monolithic single state files are slow to plan and have a massive blast radius; decoupled layered stacks prevent blast radius but require dependency management (`terraform_remote_state`)."
    },

    checklist: [
      "Explain how S3 + DynamoDB work together to prevent state race conditions",
      "Explain what happens during `terraform refresh` and `plan -detailed-exitcode`",
      "Demonstrate safe resolution of stuck state lock using `force-unlock`",
      "Write reusable Terraform module with validation rules and type constraints",
      "Compare Terraform Workspaces vs Directory-based environment separation"
    ]
  },

  {
    id: 8,
    dayNum: 8,
    week: 2,
    title: "Monitoring, Observability & SRE Principles",
    subtitle: "Prometheus, PromQL, Grafana, OpenTelemetry, SLI/SLO/SLA, Error Budgets & Golden Signals",
    tags: ["Observability", "Prometheus", "PromQL", "Grafana", "SRE", "SLO", "OpenTelemetry"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Master enterprise observability: The 3 pillars (Metrics, Logs, Traces), Prometheus pull-based TSDB architecture, PromQL math, Google SRE reliability principles (SLI/SLO/SLA, Error Budget burn rates), and alert noise suppression.",

    theory: [
      {
        title: "The 3 Pillars of Observability & OpenTelemetry",
        content: `• **Metrics**: Numeric aggregations sampled over time (counter, gauge, histogram, summary). High efficiency, low storage cost, ideal for alerting and trend analysis.
• **Logs**: Timestamped event records (JSON payloads). High cardinality and high detail, but expensive to store and index at petabyte scale.
• **Traces**: Follow a request's end-to-end journey across microservices using a unique \`TraceID\` and \`SpanID\`. Essential for distributed latency profiling.
• **OpenTelemetry (OTel)**: The vendor-neutral CNCF standard. Single agent/SDK to generate and export metrics, logs, and traces to any backend (Prometheus, Datadog, Jaeger, OpenSearch).`
      },
      {
        title: "Prometheus Internals & PromQL Mastery",
        content: `• **Pull vs Push**: Prometheus pulls metrics over HTTP (\`/metrics\` endpoint) at regular \`scrape_interval\` (default 15s). Push is handled via Pushgateway for short-lived batch jobs.
• **TSDB Storage**: Samples are stored in 2-hour data blocks with memory-mapped chunks. Gorilla compression algorithm compresses 16 bytes down to ~1.37 bytes per sample!
• **The 4 Metric Types**:
  1. *Counter*: Monotonically increasing number (e.g. \`http_requests_total\`). Always use with \`rate()\` or \`increase()\`!
  2. *Gauge*: Value that goes up and down (e.g. memory usage, active connections).
  3. *Histogram*: Samples observations into configurable buckets (\`_bucket\`, \`_count\`, \`_sum\`). Enables quantile calculations: \`histogram_quantile(0.99, ...)\`.
  4. *Summary*: Calculates client-side quantiles.`
      },
      {
        title: "SRE Math: SLI, SLO, SLA & Error Budgets",
        content: `• **SLI (Service Level Indicator)**: A measurable metric of service behavior. E.g. % of successful HTTP requests:
  $$\\text{SLI} = \\frac{\\text{Count of HTTP status } < 500}{\\text{Total HTTP requests}} \\times 100$$
• **SLO (Service Level Objective)**: Target agreed upon by engineering and product: E.g., \"99.9% of requests succeed over a rolling 30-day window.\"
• **SLA (Service Level Agreement)**: Legal contract with customers with financial penalties if breached (usually lower than SLO, e.g. 99.5%).
• **Error Budget**: $1 - \\text{SLO}$. For 99.9% availability over 30 days:
  $$\\text{Error Budget} = 0.1\\% = 43.8 \\text{ minutes of allowable downtime per month!}$$
• **Burn Rate Alerting**: Don't alert on point-in-time threshold spikes! Alert on Error Budget consumption velocity:
  - 1x burn rate consumes 100% budget in 30 days.
  - 14.4x burn rate consumes 10% budget in 5 hours (Page on-call!).`
      },
      {
        title: "The 4 Golden Signals of SRE",
        content: `1. **Latency**: Time to service a request (differentiating successful requests from error responses).
2. **Traffic**: Demand on system (HTTP req/s, network I/O).
3. **Errors**: Rate of failed requests (explicit 5xx, implicit bad responses, timeouts).
4. **Saturation**: How full the service is (CPU %, memory %, DB connection pool capacity).`
      }
    ],

    qa: [
      {
        question: "How do you calculate 99th percentile (p99) latency in Prometheus, and why is average latency misleading?",
        category: "Prometheus & SRE",
        seniorAnswer: "Average latency (mean) hides tail latency spikes. If 99 requests take 10ms and 1 request takes 10,000ms (10s), the average is 109ms — hiding the fact that 1% of your customers suffered a horrific 10-second freeze! In Prometheus, latency is recorded via Histograms into bucket metrics. \n\nTo calculate the 99th percentile over a 5-minute window in PromQL: \n```promql\nhistogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{job='checkout'}[5m])) by (le))\n```\n• `rate(...[5m])` calculates per-second request rate per bucket.\n• `sum(...) by (le)` aggregates bucket counts across all pods while preserving the `le` (less than or equal) bucket label.\n• `histogram_quantile(0.99, ...)` interpolates the 99th percentile value across the bucket thresholds.",
        juniorMistake: "Writing `rate(http_request_duration_seconds_sum) / rate(http_request_duration_seconds_count)` (which is just the average) and claiming it measures p99.",
        interviewerFocus: "Understanding tail latency distribution, histogram bucket math, the role of the `le` label, and PromQL aggregation rules.",
        followUpQuestions: [
          "Why must you always include `le` in the `by (...)` clause of `histogram_quantile`?",
          "What is high-cardinality in Prometheus and how does it cause OOM crashes?"
        ]
      },
      {
        question: "How do you systematically reduce alert noise and on-call fatigue in a high-scale production environment?",
        category: "SRE & Incident Management",
        seniorAnswer: "1. **Alert on Symptoms & SLOs, Not Causes**: Stop alerting on arbitrary CPU spikes (e.g. 'CPU > 80%'). High CPU is completely normal if the app is serving traffic within SLO latency limits! Instead, alert when the Error Budget burn rate threatens the SLO. 2. **Implement Multi-Window Multi-Burn-Rate Alerts**: Google SRE pattern: fire a high-priority page only if both a short window (14m) and a long window (1h) confirm heavy error budget consumption. 3. **Actionable Alerts Only**: Every alert that reaches a human on-call engineer must require immediate human intervention. If an alert auto-resolves in 5 minutes, increase the `for:` duration. If there is no runbook, downgrade it to a ticket or Slack notification. 4. **Deduplication & Inhibition in Alertmanager**: Use Alertmanager `inhibit_rules`: If a Kubernetes node dies (`NodeDown`), inhibit 20 alerts from pods running on that node to prevent alert storms. 5. **Regular Alert Audits**: Review alerts weekly; any alert with > 50% false-positive rate is tuned or deleted.",
        juniorMistake: "Saying 'we just set the CPU alert threshold higher' or silencing Slack channels.",
        interviewerFocus: "Production SRE maturity: SLO-based alerting, Alertmanager inhibition rules, on-call sustainability, and runbook rigor.",
        followUpQuestions: [
          "Explain Alertmanager `group_by`, `group_wait`, and `repeat_interval` settings.",
          "What is the difference between Thanos and Cortex/Mimir for long-term Prometheus storage?"
        ]
      }
    ],

    handsOn: {
      title: "Prometheus SLO Multi-Burn-Rate Alerting Rule",
      objective: "Author production-grade Prometheus alerting rules based on multi-window multi-burn-rate SRE principles.",
      steps: [
        "Define recording rules for request rates and 5xx error rates.",
        "Configure 1-hour and 6-hour burn rate expressions.",
        "Set severity levels (Page vs Ticket) with linked runbook URLs.",
        "Validate syntax using `promtool check rules`."
      ],
      snippetTitle: "slo-alerts.rules.yaml",
      snippetLang: "yaml",
      snippetCode: `groups:
- name: payment-service-slo-alerts
  rules:
  # 1. Recording rule: 5-minute error rate ratio
  - record: job:http_errors:rate5m
    expr: |
      sum(rate(http_requests_total{job="payment-service", status=~"5.."}[5m]))
      /
      sum(rate(http_requests_total{job="payment-service"}[5m]))

  # 2. Recording rule: 30-minute error rate ratio
  - record: job:http_errors:rate30m
    expr: |
      sum(rate(http_requests_total{job="payment-service", status=~"5.."}[30m]))
      /
      sum(rate(http_requests_total{job="payment-service"}[30m]))

  # 3. Critical Alert: 14.4x Burn Rate (Consumes 10% budget in 5 hours)
  # Multi-window: Both 5m and 30m windows must be burning fast!
  - alert: PaymentServiceErrorBudgetBurningFast
    expr: |
      (job:http_errors:rate5m > (14.4 * (1 - 0.999)))
      and
      (job:http_errors:rate30m > (14.4 * (1 - 0.999)))
    for: 2m
    labels:
      severity: page
      tier: p1
    annotations:
      summary: "Payment service high error budget burn rate (14.4x)"
      description: "Payment Service error rate is {{ $value | humanizePercentage }}, consuming 10% of monthly error budget in 5h."
      runbook_url: "https://wiki.company.internal/runbooks/payment-burn-rate"`,
      verificationCmd: `promtool check rules slo-alerts.rules.yaml`
    },

    systemDesign: {
      title: "High-Throughput Global Observability Pipeline Architecture",
      scenario: "Design an observability architecture capable of collecting 2 TB/day of logs and 5 million active metric time-series across 10 Kubernetes clusters.",
      architecturePrinciples: [
        "Metrics Layer: Prometheus Agent mode deployed per cluster (scraping pods locally without local storage), streaming metrics via Remote-Write to centralized Thanos or Grafana Mimir.",
        "Logs Layer: DaemonSet FluentBit / Vector collecting container logs -> buffering into Apache Kafka cluster (absorbing traffic spikes) -> ingested into OpenSearch / Grafana Loki.",
        "Traces Layer: OpenTelemetry Collector DaemonSets forwarding spans via gRPC to Tempo / Jaeger with tail-based sampling (retaining 100% of errors and 1% of normal 200 OKs).",
        "Cost Control: Drop debug logs at the edge; enforce metric relabeling configs in Prometheus to drop high-cardinality labels (e.g. `user_id`, `ip_address`)."
      ],
      tradeOffs: "Tail-based sampling requires memory buffering at the OTel Collector layer to inspect full traces before deciding whether to keep or drop them."
    },

    checklist: [
      "Explain the 3 Pillars of Observability and the role of OpenTelemetry",
      "Write PromQL query for p99 latency using `histogram_quantile`",
      "Calculate 99.9% error budget for a 30-day window (43.8 minutes)",
      "Explain why multi-burn-rate SLO alerting prevents false-positive pages",
      "Configure Alertmanager inhibition rules to prevent alert storms during node failure"
    ]
  },

  {
    id: 9,
    dayNum: 9,
    week: 2,
    title: "DevSecOps & Cloud Security",
    subtitle: "Supply Chain Security, Sigstore/Cosign, Trivy, HashiCorp Vault, Least Privilege & CIS Benchmarks",
    tags: ["Security", "DevSecOps", "Vault", "Trivy", "Supply Chain", "RBAC", "CIS"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Integrate security across the entire SDLC: Shift-left static analysis, container vulnerability gating with Trivy, software supply chain verification (SBOM, Cosign), HashiCorp Vault dynamic secrets, and Kubernetes CIS benchmark hardening.",

    theory: [
      {
        title: "Shift-Left Security & The DevSecOps Pipeline",
        content: `DevSecOps shifts security from an afterthought to automated pipeline gates:
• **SAST (Static Application Security Testing)**: Scans source code for vulnerabilities (Semgrep, SonarQube, CodeQL). Runs on PR creation.
• **SCA (Software Composition Analysis)**: Scans third-party open-source libraries for known CVEs (Snyk, Dependabot).
• **Secret Scanning**: Detects committed private keys, AWS tokens, passwords before pushing to Git (Gitleaks, TruffleHog).
• **IaC Security**: Scans Terraform/Kubernetes manifests for misconfigurations like public S3 buckets or privileged pods (Checkov, tfsec).
• **DAST (Dynamic Application Security Testing)**: Scans running web applications for runtime flaws like SQLi, XSS (OWASP ZAP).`
      },
      {
        title: "Software Supply Chain Security: SBOM & Cosign",
        content: `Modern attacks target the build pipeline (e.g. SolarWinds, Codecov):
• **SBOM (Software Bill of Materials)**: A machine-readable nested inventory of all software components, dependencies, and licenses inside your container image (generated via Syft).
• **Image Signing with Cosign (Sigstore)**:
  1. CI pipeline builds container image.
  2. Cosign signs the image hash using OIDC keyless signing or KMS private key.
  3. Signature is pushed to OCI container registry alongside the image.
  4. Kubernetes Admission Controller (Kyverno) intercepts pod creation requests; verifies signature before allowing the image to run. Untrusted or tampered images are blocked!`
      },
      {
        title: "Secrets Management with HashiCorp Vault",
        content: `• **The Problem with K8s Secrets**: Standard Kubernetes Secrets are only base64-encoded, not encrypted at rest (unless KMS envelope encryption is configured in etcd).
• **Vault Core Engines**:
  - *Transit Engine*: Cryptography-as-a-service (encrypts/decrypts data in-flight without storing it).
  - *Dynamic Secrets*: Generates short-lived, just-in-time database credentials with TTLs (e.g. temporary 15-minute PostgreSQL user). When TTL expires, Vault automatically revokes the user.
  - *Vault Agent Injector / External Secrets Operator*: Syncs Vault secrets into Kubernetes memory without saving credentials in Git.`
      }
    ],

    qa: [
      {
        question: "How do you securely manage secrets in Kubernetes without storing raw credentials or base64 secrets in Git?",
        category: "DevSecOps & Secrets",
        seniorAnswer: "1. **External Secrets Operator (ESO)**: Maintain a single source of truth in a hardened cloud vault (HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault). Deploy ESO in Kubernetes. A developer commits an `ExternalSecret` manifest referencing the secret path in Git. ESO queries the Cloud Vault via Workload Identity/IRSA and dynamically generates a local Kubernetes Secret in-memory. 2. **Sealed Secrets (GitOps Alternative)**: For pure GitOps without cloud secret stores: Bitnami Sealed Secrets encrypts secrets using asymmetric public-key cryptography. Encrypted `SealedSecret` YAMLs can be committed publicly to Git; only the controller holding the private key inside the cluster can decrypt it into a Secret. 3. **Vault Sidecar Injector**: Injects secrets directly into a shared in-memory volume (`/vault/secrets/config.json`) via Vault Agent annotations, completely bypassing the Kubernetes Secret API! 4. **etcd KMS Encryption**: Ensure `kube-apiserver` enables KMS envelope encryption at rest so physical etcd disk backups cannot be scraped for plain secrets.",
        juniorMistake: "Suggesting committing base64-encoded secrets to private Git repositories or pasting secrets manually via `kubectl create secret`.",
        interviewerFocus: "Understanding GitOps security challenges, External Secrets Operator architecture, asymmetric sealing, and etcd encryption at rest.",
        followUpQuestions: [
          "How do you handle secret rotation without causing downtime in running pods?",
          "What is the difference between envelope encryption and direct encryption in KMS?"
        ]
      },
      {
        question: "What is the principle of least privilege in Kubernetes RBAC, and how do you audit over-permissioned ServiceAccounts?",
        category: "Kubernetes Security",
        seniorAnswer: "The principle of least privilege dictates that human users and ServiceAccounts must only possess the absolute minimum permissions required to perform their intended task. \n\n1. **Scoping**: Never use `ClusterRoleBinding` when a namespace-scoped `RoleBinding` suffices. 2. **Avoid Wildcards**: Reject manifests with `apiGroups: ['*']` or `verbs: ['*']`. Specifically enumerate read-only verbs (`get`, `list`, `watch`) and restrict write verbs (`create`, `update`, `patch`). 3. **Disable Auto-Mounting**: For pods that do not interact with the Kubernetes API server, set `automountServiceAccountToken: false` in the Pod spec to prevent token theft in the event of a container escape. 4. **Auditing**: Audit permissions using `kubectl auth can-i <verb> <resource> --as=system:serviceaccount:<ns>:<name>` and open-source scanners like `kube-bench` (CIS Kubernetes Benchmark) and `rakun` to detect privilege escalation vectors.",
        juniorMistake: "Binding application ServiceAccounts to `cluster-admin` because 'it was the easiest way to make the deployment work'.",
        interviewerFocus: "RBAC granularity, API token auto-mount risks, and CIS benchmark compliance testing.",
        followUpQuestions: [
          "What is Pod Security Standards (PSS) and how does it replace legacy PodSecurityPolicies?",
          "How does an attacker exploit an exposed service account token mounted at `/var/run/secrets/kubernetes.io/serviceaccount`?"
        ]
      }
    ],

    handsOn: {
      title: "Kyverno Policy Enforcement & Trivy Container Scan",
      objective: "Block vulnerable images in CI and enforce Kubernetes CIS Pod Security Standards via Kyverno admission policies.",
      steps: [
        "Write CI pipeline script running Trivy with severity failure thresholds.",
        "Deploy Kyverno ClusterPolicy enforcing non-root user and disallowing privileged containers.",
        "Attempt to deploy a malicious privileged container and verify admission rejection."
      ],
      snippetTitle: "kyverno-restrictive-policy.yaml",
      snippetLang: "yaml",
      snippetCode: `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-privileged-and-root
  annotations:
    policies.kyverno.io/title: Disallow Privileged Containers and Root Users
    policies.kyverno.io/severity: high
spec:
  validationFailureAction: Enforce # Block deployment if violated!
  background: true
  rules:
  - name: validate-privileged
    match:
      any:
      - resources:
          kinds:
          - Pod
    validate:
      message: "Privileged mode is strictly forbidden in production clusters."
      pattern:
        spec:
          containers:
          - securityContext:
              privileged: false
  - name: require-run-as-non-root
    match:
      any:
      - resources:
          kinds:
          - Pod
    validate:
      message: "Containers must run as non-root user (runAsNonRoot: true)."
      pattern:
        spec:
          securityContext:
            runAsNonRoot: true`,
      verificationCmd: `kubectl apply -f kyverno-restrictive-policy.yaml
# Test with bad pod (should be rejected):
kubectl run bad-pod --image=nginx --privileged`
    },

    systemDesign: {
      title: "Zero-Trust DevSecOps Supply Chain Architecture",
      scenario: "Architect an end-to-end secure software delivery pipeline compliant with SLSA Level 3 (Supply-chain Levels for Software Artifacts) for a banking organization.",
      architecturePrinciples: [
        "Source Code Integrity: Mandatory multi-party branch protection rules, signed Git commits via GPG, and automated secret scanning with pre-receive hooks.",
        "Hermetic Build Pipeline: Isolated ephemeral runner containers without internet access during the compile phase; pinned dependencies with cryptographic checksum verification.",
        "Attestation & Signing: Generate in-toto attestations and sign container images using Sigstore Cosign in the CI pipeline.",
        "Admission Gate: Kyverno verifies image signatures and SBOM attestations against the public key before allowing pod scheduling in EKS/AKS."
      ],
      tradeOffs: "Strict admission policies require rock-solid key rotation and emergency break-glass procedures for deploying critical zero-day CVE patches."
    },

    checklist: [
      "Explain the difference between SAST, DAST, SCA, and Container Vulnerability scanning",
      "Explain how Sigstore/Cosign signs images and how Kyverno enforces signatures",
      "Configure External Secrets Operator (ESO) syncing from AWS Secrets Manager / Azure Vault",
      "Explain why `automountServiceAccountToken: false` is a vital security best practice",
      "Understand Kubernetes Pod Security Standards (Privileged, Baseline, Restricted)"
    ]
  },

  {
    id: 10,
    dayNum: 10,
    week: 2,
    title: "System Design for DevOps & SRE",
    subtitle: "High Availability, Multi-Region Disaster Recovery, GitOps Architecture, OTT & Low-Latency Infra",
    tags: ["System Design", "High Availability", "Disaster Recovery", "GitOps", "Scalability", "SRE"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Senior architectural mastery: Designing resilient multi-region cloud platforms, GitOps at scale with ArgoCD, low-latency streaming/WebRTC infrastructure, and business continuity disaster recovery strategies (RTO/RPO).",

    theory: [
      {
        title: "Disaster Recovery Frameworks: RTO & RPO",
        content: `• **RTO (Recovery Time Objective)**: How long can the system be down before business suffers unacceptable harm? (Time to recover).
• **RPO (Recovery Point Objective)**: How much data loss can the business tolerate? (Time delta between last backup and failure).
• **DR Strategies**:
  1. *Backup & Restore*: RTO: hours/days, RPO: 24h. Cheapest, highest data loss.
  2. *Pilot Light*: Core database replicates continuously to secondary region; minimal compute running. RTO: 15-30m, RPO: minutes.
  3. *Warm Standby*: Scaled-down replica of entire stack running in secondary region. RTO: 5m, RPO: seconds.
  4. *Active-Active Multi-Region*: Full production traffic split across regions via Anycast DNS (Route53 / Cloudflare). RTO: ~0, RPO: near 0. Highest cost and distributed data consistency challenges!`
      },
      {
        title: "Scalable Enterprise GitOps with ArgoCD",
        content: `• **GitOps Core Principle**: Git is the single source of truth for declared infrastructure and application state.
• **ArgoCD Multi-Cluster Architecture**:
  - Central Management Cluster hosts ArgoCD control plane.
  - Target workload clusters (Dev, Staging, Prod) authenticate via scoped ServiceAccounts.
  - ArgoCD Controller continuously reconciles: \`Git State\` vs \`Live Cluster State\`. If someone makes an unauthorized \`kubectl edit\`, ArgoCD automatically self-heals and overwrites it!
• **Repository Separation Pattern**:
  - Application Code Repo: Microservice code + Dockerfile + unit tests.
  - Config / Manifest Repo: Helm charts, Kustomize overlays, environment configurations.
  - Prevents build loops and separates developer commits from deployment syncs.`
      },
      {
        title: "High-Traffic OTT & Low-Latency WebRTC Infrastructure",
        content: `• **OTT Streaming (HLS / DASH)**:
  - Video segmented into 2-6 second chunks.
  - High cache hit ratio (> 95%) at CDN Edge (Cloudflare / Fastly).
  - Scalability bottleneck is storage throughput and origin load balancing.
• **Real-Time WebRTC / Voice / Gaming**:
  - UDP protocol: Ultra-low latency (< 150ms).
  - Cannot use standard HTTP CDNs! Requires Selective Forwarding Units (SFUs) deployed in Kubernetes.
  - Challenges: Managing UDP socket buffers, avoiding NAT traversal issues (STUN/TURN servers), and maintaining persistent session affinity.`
      }
    ],

    qa: [
      {
        question: "Design a production Kubernetes platform capable of handling a 10x traffic surge during a flash sale with zero downtime.",
        category: "System Design for SRE",
        seniorAnswer: "1. **Edge & Ingress Tier**: Deploy Cloudflare / CloudFront CDN with aggressive edge caching for static assets. Configure rate limiting and WAF to shed bot traffic. AWS ALB / Azure App Gateway automatically pre-warmed. 2. **Proactive Autoscaling**: HPA is reactive; for known flash sales, we pre-scale baseline pod replicas 30 minutes before the event. Configure KEDA to scale based on Kafka/SQS queue depth or active HTTP connections rather than CPU. 3. **Fast Node Provisioning (Karpenter)**: Configure Karpenter with a pool of diverse EC2 instance types across multiple AZs to ensure compute availability even if specific instance families run out of cloud capacity. 4. **Resilience & Degraded Modes**: Enforce Pod Anti-Affinity and PodDisruptionBudgets (`maxUnavailable: 10%`). Implement Circuit Breakers (Envoy/Istio) and graceful degradation: if recommendation microservices choke, fall back to cached static recommendations to preserve checkout flow. 5. **Database Connection Pooling**: Deploy PgBouncer / AWS RDS Proxy to prevent tens of thousands of container connections from exhausting database connection limits.",
        juniorMistake: "Just saying 'I will set HPA to 100 replicas' without addressing database connection pool exhaustion, cloud node provisioning delays, or circuit breaking.",
        interviewerFocus: "Holistic end-to-end architecture: CDN, ingress, pro-active scaling, database protection (pooling), and graceful degradation.",
        followUpQuestions: [
          "How does an RDS Proxy or PgBouncer protect PostgreSQL during 10x pod scaling?",
          "What is the difference between active-active multi-region database replication vs read-replica failover?"
        ]
      },
      {
        question: "How do you design a zero-data-loss Disaster Recovery (DR) strategy for a mission-critical platform?",
        category: "Disaster Recovery",
        seniorAnswer: "1. **Define Business SLAs**: Establish RTO (e.g. < 5 minutes) and RPO (e.g. < 1 second). 2. **Compute Strategy**: Pilot Light or Warm Standby in secondary cloud region (e.g. primary in us-east-1, secondary in us-west-2). Infrastructure fully codified in Terraform; ArgoCD deploys workloads to both clusters. 3. **Data Tier (The Critical Path)**: Aurora Global Database or Azure Cosmos DB multi-region replication with storage-level replication (typical replication lag < 1 second). For object storage, configure S3 Cross-Region Replication (CRR) with versioning. 4. **Traffic Cutover**: Route53 / Cloudflare Anycast DNS with automated health checks. If primary region endpoints fail 3 consecutive checks, DNS failover automatically directs traffic to secondary region ALB. 5. **Chaos Testing**: Conduct quarterly 'Game Day' simulated regional outages to validate failover automation and ensure runbooks work.",
        juniorMistake: "Suggesting taking daily database backups and manually restoring them in a new region during an outage (which takes 8+ hours and violates RTO).",
        interviewerFocus: "Understanding data replication lag (RPO), DNS TTL failover mechanics (RTO), and continuous disaster recovery game days.",
        followUpQuestions: [
          "How does DNS caching (TTL) at client ISPs affect failover times during regional disaster recovery?",
          "What is split-brain in multi-region active-active databases and how do you resolve conflicts?"
        ]
      }
    ],

    handsOn: {
      title: "ArgoCD ApplicationSet Multi-Cluster Pattern",
      objective: "Deploy an ArgoCD ApplicationSet to automatically discover and synchronize microservices across staging and production clusters.",
      steps: [
        "Create Git repository structure with environment Kustomize overlays.",
        "Author ArgoCD ApplicationSet YAML using the Git Generator pattern.",
        "Apply ApplicationSet to control plane cluster.",
        "Verify automated synchronization and drift detection across target clusters."
      ],
      snippetTitle: "argocd-applicationset.yaml",
      snippetLang: "yaml",
      snippetCode: `apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: core-microservices-appset
  namespace: argocd
spec:
  generators:
  - matrix:
      generators:
      # Discover all environments
      - list:
          elements:
          - env: staging
            cluster: https://staging-k8s.internal:6443
          - env: production
            cluster: https://prod-k8s.internal:6443
      # Discover all services in Git
      - git:
          repoURL: https://github.com/company/k8s-manifests.git
          revision: main
          directories:
          - path: apps/*
  template:
    metadata:
      name: '{{path.basename}}-{{env}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/company/k8s-manifests.git
        targetRevision: main
        path: '{{path}}/overlays/{{env}}'
      destination:
        server: '{{cluster}}'
        namespace: '{{path.basename}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
        - CreateNamespace=true`,
      verificationCmd: `kubectl apply -f argocd-applicationset.yaml
argocd app list`
    },

    systemDesign: {
      title: "Global Multi-Region Active-Active Architecture",
      scenario: "Design an active-active architecture across US and EU regions with strict GDPR data locality compliance for EU user data.",
      architecturePrinciples: [
        "DNS Geo-Routing: Route53 Geolocation routing sends EU traffic to eu-west-1 and US traffic to us-east-1.",
        "Database Locality: Sharded database architecture where EU customer PII resides strictly on EU database instances; shared non-PII catalog data replicates globally.",
        "Stateless Workloads: Fully replicated Kubernetes clusters in both regions running identical code managed via GitOps.",
        "Cross-Region Observability: Global Thanos / Grafana instance aggregating metrics from both regions with single-pane-of-glass dashboards."
      ],
      tradeOffs: "Active-Active requires solving distributed consistency and bidirectional database conflict resolution; partitioning by geography eliminates cross-region write latency."
    },

    checklist: [
      "Define RTO vs RPO and explain Pilot Light vs Warm Standby vs Active-Active",
      "Design a scalable GitOps workflow using ArgoCD ApplicationSets",
      "Explain how PgBouncer/RDS Proxy prevents database connection starvation during traffic surges",
      "Explain how DNS health checks and Anycast routing orchestrate regional failover",
      "Identify the architectural challenges of running low-latency WebRTC SFUs on Kubernetes"
    ]
  },

  {
    id: 11,
    dayNum: 11,
    week: 2,
    title: "Production Incidents & Scenario Triage (STAR Method)",
    subtitle: "Node NotReady, Pod Crash Loops, Latency Spikes, Disk/Inode Full & DNS Outages",
    tags: ["Incident Response", "Production Troubleshooting", "STAR Method", "RCA", "Post-Mortem"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Master the art of production troubleshooting and incident storytelling: Live debugging of real-world SEV-1 failure scenarios, systematic hypothesis testing, root cause analysis (RCA), and structuring high-impact STAR method interview answers.",

    theory: [
      {
        title: "The Production Incident Triage Framework",
        content: `When production is on fire, follow this systematic 5-step process:
1. **Assess Impact & Triage**: What is the blast radius? How many users impacted? Which SLO is burning? Declare SEV-1 / SEV-2; establish incident commander and war room.
2. **Mitigate First, Root-Cause Later**: The immediate goal is restoring service, NOT doing forensic code analysis! (Roll back the recent deployment, scale up capacity, fail over to secondary region, or enable circuit breakers).
3. **Hypothesis-Driven Diagnostics**: Formulate clear testable hypotheses based on Golden Signals (Is it network? Is it database? Is it compute exhaustion?).
4. **Fix & Verify**: Apply fix in staging first or canary in prod; verify telemetry returns to baseline.
5. **Blameless Post-Mortem & RCA**: Document timeline, root causes (5 Whys), detection gaps, and create preventive engineering action items.`
      },
      {
        title: "The Anatomy of Common Production Disasters",
        content: `• **Kubernetes Node 'NotReady'**:
  - *Cause 1*: Kubelet process crashed or stopped communicating with API server.
  - *Cause 2*: \`DiskPressure\` (node root disk > 85% full; kubelet starts evicting pods).
  - *Cause 3*: \`PIDPressure\` (fork bomb or leaky process exhausted OS PIDs).
  - *Cause 4*: Container runtime (containerd/dockerd) deadlock or hung on NFS mount.
• **High Latency & 504 Gateway Timeouts**:
  - *Cause 1*: Upstream application threads saturated (database connection pool empty; requests queueing up).
  - *Cause 2*: Slow database queries holding table locks.
  - *Cause 3*: Ephemeral port exhaustion or reverse proxy connection backlog (\`somaxconn\`).
• **Kubernetes DNS Failures**:
  - CoreDNS pods overwhelmed by the famous \`ndots:5\` search domain penalty, generating 5 DNS queries for every single external HTTP request!`
      },
      {
        title: "The STAR Framework for DevOps Interviews",
        content: `Every senior interview question (\"Tell me about a major outage you handled\") must follow STAR:
• **S - Situation**: High-stakes business context. Scale, revenue on the line, architecture overview (e.g. \"Black Friday, payment platform handling \$2M/hour, latency surged from 100ms to 8 seconds\").
• **T - Task**: Your specific responsibility as Lead DevOps/SRE (e.g. \"I was incident commander responsible for triaging the root cause, leading 6 engineers, and restoring checkout within 15 minutes\").
• **A - Action**: Clear, structured technical steps YOU took (e.g. checked ALB metrics, diagnosed connection pool exhaustion via \`pg_stat_activity\`, rolled back deployment v2.4, increased connection pool limits, restarted pods).
• **R - Result**: Quantifiable business impact and preventive post-mortem actions (e.g. \"Restored checkout in 8 minutes, zero data loss; subsequently introduced PgBouncer, automated canary analysis, and reduced MTTR by 45%\").`
      }
    ],

    qa: [
      {
        question: "Tell me about a major production outage you resolved. What happened and what did you learn?",
        category: "STAR Incident Story",
        seniorAnswer: "• **Situation**: In my previous role at a fintech company, our core payment gateway experienced a severe SEV-1 outage during peak morning traffic. 504 Gateway Timeouts surged to 35%, and checkout transactions were failing across 80,000 active users. \n• **Task**: As the lead on-call SRE, I took command of the incident bridge to coordinate triage, restore transactions, and protect our SLA. \n• **Action**: 1. I inspected our Grafana Golden Signals dashboard and noticed that while ALB CPU was normal, upstream payment pod latency had spiked to 30 seconds. 2. I ran `kubectl get pods` and identified that 10 pods were in `CrashLoopBackOff` with exit code 137 (OOMKilled). 3. Checking `kubectl logs --previous` revealed an unindexed SQL query introduced in that morning's deployment that loaded 500,000 transaction records into container heap memory. 4. To restore service immediately, I triggered an automated rollback via ArgoCD to the previous stable release, scaled pod replicas by 50% to clear the request backlog, and verified error rates dropped back to 0.01% within 6 minutes. \n• **Result**: We restored transaction processing with minimal revenue loss. In the blameless post-mortem, I instituted automated query execution plan linting in our CI/CD pipeline, added strict container memory limits with proactive alert triggers at 80% utilization, and eliminated similar incidents entirely.",
        juniorMistake: "Telling a vague story without metrics, blaming another developer for writing bad code, or saying 'I rebooted the server and it worked again.'",
        interviewerFocus: "Leadership under pressure, systematic diagnostic methodology, mitigation prioritized over root-cause, and long-term blameless prevention.",
        followUpQuestions: [
          "What would you do if rolling back the deployment did not resolve the database load?",
          "How do you conduct a blameless post-mortem without demoralizing the team?"
        ]
      },
      {
        question: "Three worker nodes in your production Kubernetes cluster suddenly enter 'NotReady' status. How do you troubleshoot and fix them?",
        category: "Kubernetes Incident Triage",
        seniorAnswer: "1. **Check Node Status & Conditions**: Run `kubectl describe node <node-name>`. Inspect the `Conditions` block: Is it `DiskPressure`, `MemoryPressure`, `PIDPressure`, or `Ready: False`? 2. **Check Cloud Infrastructure Health**: Verify via cloud console whether underlying EC2/Azure instances suffered a hardware retirement or hypervisor failure. 3. **SSH / Serial Console Access**: If cloud VM is running, access node via SSH or AWS SSM Session Manager: \n  • Check Kubelet daemon: `sudo systemctl status kubelet`. If stopped, view crash logs: `sudo journalctl -u kubelet -n 100 --no-pager`.\n  • Check Container Runtime: `sudo systemctl status containerd`. Check if containerd is hung or unresponsive to CRI socket calls (`crictl ps`).\n  • Check Disk & Inodes: Run `df -h` and `df -i`. If `/var/lib/containerd` or root disk is 100% full, kubelet stops heartbeating to the API server.\n  • Check Kernel Out of Memory: Run `dmesg -T | grep -i oom`.\n4. **Remediation**: If disk full, clear orphan stopped containers with `crictl rmi --prune`. Restart containerd and kubelet. If the node is permanently impaired, safely cordon and drain workloads (`kubectl drain --ignore-daemonsets`) and replace the node via autoscaler.",
        juniorMistake: "Blindly running `kubectl delete node`, which can orphan underlying cloud resources and doesn't explain why the failure occurred.",
        interviewerFocus: "Understanding node conditions, kubelet vs containerd communication via CRI, disk/PID pressure mechanics, and safe drain procedures.",
        followUpQuestions: [
          "How long does the Kubernetes Node Controller wait before evicting pods from a NotReady node (`pod-eviction-timeout`)?",
          "How do you prevent pods with Local Persistent Volumes from getting stuck when a node dies?"
        ]
      }
    ],

    handsOn: {
      title: "Interactive Incident Triage Runbook Lab",
      objective: "Simulate and resolve a real-world Kubernetes DNS saturation incident caused by the `ndots:5` search domain resolution penalty.",
      steps: [
        "Simulate high CoreDNS latency and analyze query volume with PromQL.",
        "Inspect `/etc/resolv.conf` inside application pod to observe search domains.",
        "Configure NodeLocal DNSCache DaemonSet to cache queries locally on each worker node.",
        "Verify 90% reduction in CoreDNS cluster queries and elimination of 5-second DNS timeouts."
      ],
      snippetTitle: "nodelocal-dns-cache-config.yaml",
      snippetLang: "yaml",
      snippetCode: `# In microservice pod spec, tune dnsConfig to bypass ndots:5 penalty:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: high-traffic-api
  namespace: default
spec:
  replicas: 10
  template:
    spec:
      dnsPolicy: "ClusterFirst"
      dnsConfig:
        options:
        - name: ndots
          value: "2" # Lowers external search domain round-trips from 5 to 1!
        - name: single-request-reopen
      containers:
      - name: api
        image: company/api:v1.0.0
        ports:
        - containerPort: 8080`,
      verificationCmd: `kubectl exec -it <pod-name> -- cat /etc/resolv.conf
# Benchmark DNS query time:
kubectl exec -it <pod-name> -- time nslookup api.external-service.com`
    },

    systemDesign: {
      title: "Enterprise Incident Management & On-Call Escalation Architecture",
      scenario: "Design an automated incident alerting, deduplication, and escalation architecture for an engineering organization with 30 microservice teams.",
      architecturePrinciples: [
        "Alert Routing: Alertmanager groups alerts by team/tier, routing to PagerDuty/Opsgenie.",
        "Severity Tiers: SEV-1 (Customer-facing outage -> immediate multi-channel page to primary + secondary on-call + incident commander); SEV-2 (Degraded performance -> page primary on-call); SEV-3 (Non-urgent warning -> Slack channel + Jira ticket).",
        "Automated War Rooms: Webhook automatically spins up dedicated Slack channel `#incident-<id>` and Zoom bridge upon SEV-1 trigger.",
        "Blameless Post-Mortem Tracking: Mandatory RCA document within 48 hours with tracked Jira action items preventing recurrence."
      ],
      tradeOffs: "Over-escalating wakes up too many engineers causing burnout; under-escalating delays MTTR on critical revenue-impacting incidents."
    },

    checklist: [
      "Master the 5-step incident triage framework: Assess -> Mitigate -> Diagnose -> Fix -> Post-Mortem",
      "Troubleshoot a Kubernetes Node NotReady scenario through kubelet and containerd logs",
      "Explain the `ndots:5` DNS resolution penalty in Kubernetes and how to resolve it",
      "Structure a compelling production outage story using the STAR framework",
      "Write a blameless post-mortem document with actionable preventive engineering tasks"
    ]
  },

  {
    id: 12,
    dayNum: 12,
    week: 2,
    title: "Mock Interview Simulations & Technical Assessments",
    subtitle: "3 Rigorous Rounds: Core DevOps, Cloud/Terraform Architecture, SRE & Leadership",
    tags: ["Mock Interview", "Assessment", "Technical Screening", "Leadership", "System Architecture"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Simulate 3 comprehensive interview rounds for senior DevOps/SRE roles: Round 1 (Linux, Networking, Docker, K8s Core), Round 2 (Cloud Architecture, Terraform, CI/CD), Round 3 (SRE Leadership, Behavioral, Incident Post-Mortems).",

    theory: [
      {
        title: "Senior Interview Rubric: How Evaluators Grade You",
        content: `Top tech companies (FAANG, tier-1 product companies) grade senior candidates on 4 dimensions:
1. **Technical Depth & Accuracy (40%)**: Do you understand what happens beneath the abstraction? (Kernel syscalls, TCP states, cgroup limits, etcd consensus).
2. **Systematic Troubleshooting (25%)**: Do you jump to conclusions or follow a structured, non-destructive diagnostic process (hypothesis testing, checking logs/metrics before killing processes)?
3. **Production Pragmatism & Trade-offs (20%)**: Every architecture has pros and cons. Can you articulate cost vs complexity, speed vs reliability, build vs buy?
4. **Communication & Leadership (15%)**: Clear, structured, concise answers (STAR method). Handling ambiguity, mentoring junior engineers, and driving post-incident culture.`
      },
      {
        title: "Interview Round 1: Core DevOps & Infrastructure (60 Mins)",
        content: `• Linux performance triage (top, vmstat, strace, lsof).
• Networking deep dive (DNS resolution, TCP connection lifecycle, TLS handshake, packet drops).
• Docker internals (namespaces, cgroups, OverlayFS, non-root security).
• Kubernetes workload management (Pod lifecycle, probes, service discovery, kube-proxy).`
      },
      {
        title: "Interview Round 2: Cloud, Terraform & System Architecture (60 Mins)",
        content: `• Cloud networking (VPC/VNet multi-tier design, Transit Gateway, private endpoints).
• IAM & security (OIDC workload identity, least privilege).
• Terraform enterprise patterns (state locking, modularization, drift remediation, Terragrunt).
• High-scale system design (autoscaling, 10x flash sale prep, database connection pooling).`
      },
      {
        title: "Interview Round 3: SRE Leadership, Behavioral & Outages (60 Mins)",
        content: `• Incident Commander role during a SEV-1 outage (STAR story).
• Driving SLO culture and balancing product feature velocity vs error budget stability.
• Handling pushback from developers when blocking insecure deployments.
• Cost optimization (FinOps): reducing cloud spend by 30-50% without impacting SLAs.`
      }
    ],

    qa: [
      {
        question: "How do you handle disagreement with a product development team that wants to push a risky feature right before a peak holiday shopping weekend?",
        category: "SRE Leadership & Culture",
        seniorAnswer: "1. **Ground the Conversation in Data & Error Budgets**: Remove emotional opinions by referring to our mutually agreed-upon SLOs and Error Budget policy. If the error budget is depleted or within 20% of breach, our policy mandates an automated deployment freeze. 2. **Evaluate Risk & Blast Radius**: If the error budget allows, analyze the blast radius: Can the feature be placed behind a Feature Flag (e.g. LaunchDarkly)? Can we deploy with 0% traffic enabled and canary it to 1% after peak hours? 3. **Mitigation & Rollback Plan**: Require an automated rollback runbook, verified backwards-compatible database migrations, and explicit sign-off from the product VP. 4. **Pragmatic Collaboration**: SRE is an enabler of business velocity, not a bureaucratic roadblock. If the business decides to accept the risk, we schedule extra on-call coverage, verify telemetry dashboards, and document the risk acceptance transparently.",
        juniorMistake: "Saying 'I would just reject their pull request and tell them no' or 'I would let them deploy it and let them deal with the outage.'",
        interviewerFocus: "Leadership maturity, using error budgets as objective guardrails, feature flag risk mitigation, and executive communication.",
        followUpQuestions: [
          "What is an Error Budget Policy and how does it resolve conflicts between SRE and Product teams?",
          "How do you implement a seasonal deployment freeze effectively?"
        ]
      },
      {
        question: "If a microservice pod is consuming 100% CPU, how do you determine if it needs more CPU or if it's trapped in an infinite loop?",
        category: "Linux & Container Diagnostics",
        seniorAnswer: "1. **Check Throughput vs CPU**: Correlate CPU consumption with request throughput (`rate(http_requests_total)`). If throughput doubled and CPU doubled proportionally, the application simply requires horizontal scaling (HPA) or resource limit expansion. 2. **Profile Thread Execution**: If throughput is low or zero while CPU is pinned at 100%, the process is trapped in an infinite loop, thread contention, or catastrophic regular expression backtracking (ReDoS). 3. **Capture Thread Stack Traces**: \n  • For Java/JVM: Run `kubectl exec <pod> -- jstack <pid>` to identify threads in `RUNNABLE` state and locate the offending class/method.\n  • For Go: Profile via pprof (`curl http://localhost:6060/debug/pprof/profile?seconds=30`).\n  • For C/Linux native: Run `perf top` or `strace -c -p <pid>` to inspect system call distribution.\n4. **Remediation**: Scale pod temporarily to maintain availability, notify application developers with stack trace proof, and apply hotfix.",
        juniorMistake: "Just increasing CPU limits in the Kubernetes YAML without inspecting thread dumps or checking request volume.",
        interviewerFocus: "Correlation of business metrics with system metrics, runtime thread profiling, and pinpointing application-level bugs.",
        followUpQuestions: [
          "What is ReDoS (Regular Expression Denial of Service) and how does it pin CPU?",
          "How do you use continuous profiling tools like Pyroscope in Kubernetes?"
        ]
      }
    ],

    handsOn: {
      title: "Full-Stack Mock Diagnostic Assessment",
      objective: "Conduct a timed 15-minute diagnostic run through a broken multi-tier microservice environment.",
      steps: [
        "Step 1: Check pod status and events across namespaces.",
        "Step 2: Inspect application logs and decode exit codes.",
        "Step 3: Test network connectivity and DNS resolution between tiers.",
        "Step 4: Execute targeted remediation and verify service restoration."
      ],
      snippetTitle: "mock-assessment-diagnostic.sh",
      snippetLang: "bash",
      snippetCode: `#!/usr/bin/env bash
# Quick Senior Triage Checklist
echo "=== 1. Checking Degraded Pods ==="
kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded

echo "=== 2. Checking OOMKilled Containers ==="
kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.name}{"\\t"}{range .status.containerStatuses[*]}{.name}{"\\tLastState: "}{.lastState.terminated.reason}{"\\tExitCode: "}{.lastState.terminated.exitCode}{"\\n"}{end}{end}' | grep -E "OOMKilled|Error"

echo "=== 3. Checking Node Conditions ==="
kubectl get nodes -o custom-columns=NAME:.metadata.name,READY:.status.conditions[?(@.type=="Ready")].status,DISK_PRESSURE:.status.conditions[?(@.type=="DiskPressure")].status

echo "=== 4. Checking CoreDNS Health ==="
kubectl top pods -n kube-system -l k8s-app=kube-dns`,
      verificationCmd: `chmod +x mock-assessment-diagnostic.sh && ./mock-assessment-diagnostic.sh`
    },

    systemDesign: {
      title: "Mock Architecture Interview: Next-Gen Fintech Payments Platform",
      scenario: "In a 45-minute live interview whiteboard, design an end-to-end cloud platform for a payment processing service handling 50,000 transactions/second with PCI-DSS compliance.",
      architecturePrinciples: [
        "Ingress & Security: Cloudflare Anycast DDoS -> AWS ALB with WAF -> Private EKS cluster.",
        "Compute: EKS cluster spanning 3 AZs; Karpenter autoscaling; PodDisruptionBudgets; Read-only container root filesystems.",
        "Database Tier: Amazon Aurora PostgreSQL with multi-AZ failover and AWS RDS Proxy connection pooling.",
        "Secrets & Compliance: HashiCorp Vault dynamic database credentials; Kyverno admission policies enforcing zero-trust and encryption at rest.",
        "Observability: OpenTelemetry instrumentation; Prometheus SLO multi-burn-rate alerting; PagerDuty escalation policies."
      ],
      tradeOffs: "End-to-end PCI-DSS compliance requires dedicated isolated VPCs, strict egress proxy filtering, and automated audit logging on all bastion sessions."
    },

    checklist: [
      "Practice answering Round 1 Core DevOps technical questions without hesitation",
      "Whiteboard Round 2 Cloud & Terraform architecture with trade-offs in under 30 minutes",
      "Deliver a compelling STAR leadership story for Round 3 in under 4 minutes",
      "Explain the exact difference between high CPU caused by load vs infinite loops",
      "Review the senior interview grading rubric and calibrate your answer structures"
    ]
  },

  {
    id: 13,
    dayNum: 13,
    week: 2,
    title: "Resume, Leadership Stories & FinOps Impact",
    subtitle: "STAR Story Portfolio, Metrics That Matter, Cloud Cost Optimization & Platform Engineering",
    tags: ["Resume", "FinOps", "Cost Optimization", "Leadership", "Platform Engineering", "STAR Stories"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "Transform technical experience into high-impact executive narratives: The 6 essential STAR stories every 5-year DevOps engineer must prepare, quantifying metrics that impress hiring managers, and cloud cost optimization (FinOps).",

    theory: [
      {
        title: "The 6 Essential STAR Stories for 5-Year DevOps Engineers",
        content: `You will be asked these exact scenarios. Have one polished STAR story prepared for each:
1. **The Critical Production Outage (SEV-1)**: High-stakes triage, methodical troubleshooting under pressure, rapid mitigation, blameless post-mortem.
2. **The Cloud Cost Optimization (FinOps)**: Slashing cloud bills by 30-50% via right-sizing, Karpenter spot adoption, or storage lifecycle policies.
3. **The CI/CD Acceleration & Developer Productivity**: Slashing build/deploy times from 45m to 6m, boosting developer velocity across 100+ engineers.
4. **The Zero-Downtime Migration**: Migrating legacy VMs to Kubernetes (EKS/AKS) or multi-region database cutover with zero dropped packets.
5. **The DevSecOps & Security Hardening**: Eliminating critical CVEs, automating supply chain verification (Cosign), or remediating a real vulnerability.
6. **Cross-Team Conflict & Leadership**: Resolving architectural deadlock with a product team using data, error budgets, and pragmatic compromise.`
      },
      {
        title: "Metrics That Matter: How to Phrase Resume Bullet Points",
        content: `Hiring managers skip generic bullet points like \"Managed Kubernetes clusters and wrote Terraform code.\" Frame every achievement with the **Google X-Y-Z formula**: \"Accomplished [X] as measured by [Y], by doing [Z]\":
• *Bad*: \"Optimized AWS costs for our department.\"
• *Senior*: \"Reduced annual AWS infrastructure expenditure by \$240,000 (34%) across 4 EKS clusters by implementing Karpenter Spot automation, rightsizing container CPU/memory requests, and configuring S3 Intelligent-Tiering.\"
• *Bad*: \"Improved CI/CD pipelines.\"
• *Senior*: \"Accelerated deployment frequency from bi-weekly to 14 daily production releases while reducing build duration from 38 mins to 5 mins by implementing multi-stage Docker layer caching and self-hosted ephemeral Kubernetes runners.\"`
      },
      {
        title: "FinOps: Cloud Cost Optimization Playbook",
        content: `• **Compute Optimization**:
  - Right-sizing: 70% of containers request 4x more RAM than they ever consume! Use Kubecost or VPA in recommendation mode.
  - Spot Instances: Use Spot for stateless worker nodes with Karpenter (saving 60-80% compared to on-demand).
  - Savings Plans & Reserved Instances: Commit to 1-3 year baseline compute for core databases/stateful workloads.
• **Storage & Networking**:
  - S3 Lifecycle Policies: Transition logs/backups to S3 Glacier Flexible Retrieval after 30 days.
  - Eliminate Cross-AZ NAT Gateway bandwidth: Deploy VPC Endpoints (PrivateLink) for S3 and ECR to avoid paying \$0.045/GB NAT gateway processing fees!`
      }
    ],

    qa: [
      {
        question: "How did you reduce cloud infrastructure costs in your previous organization without degrading performance or reliability?",
        category: "FinOps & Leadership",
        seniorAnswer: "• **Situation**: At my previous company, our annual AWS spend had ballooned to \$1.4M, with our production EKS clusters accounting for 65% of the bill. Executive leadership mandated a 25% cost reduction within two quarters without compromising our 99.9% SLA. \n• **Task**: As lead DevOps engineer, I spearheaded our FinOps initiative across 25 engineering teams. \n• **Action**: 1. *Visibility*: Deployed Kubecost to attribute monthly spend down to individual namespaces and microservices, creating team-by-team dashboards. 2. *Right-Sizing*: Analyzed 90-day Prometheus utilization metrics; discovered average container CPU utilization was only 18% due to bloated resource requests. Adjusted requests based on p95 usage, reclaiming 40% over-provisioned capacity. 3. *Karpenter Spot Adoption*: Replaced static Cluster Autoscaler On-Demand node groups with Karpenter running diversified Spot instances for stateless microservices, with automated fallback to on-demand. 4. *Networking Optimization*: Identified \$3,500/month in NAT Gateway charges from pods pulling images from ECR and S3. Deployed VPC Endpoints (Gateway and Interface), routing internal traffic over the AWS private backbone for free. \n• **Result**: Reduced total monthly AWS expenditure by \$32,000 (\$384,000 annually — a 27% reduction), while improving cluster autoscaling speed from 4 minutes to 40 seconds.",
        juniorMistake: "Giving vague answers like 'we shut down test environments on weekends' without mentioning metrics, toolings (Kubecost), or architectural optimizations.",
        interviewerFocus: "Business impact, data-driven methodology (Kubecost), architectural understanding (Spot, Karpenter, VPC endpoints), and cross-team influence.",
        followUpQuestions: [
          "How do you handle Spot instance terminations gracefully without dropping customer traffic?",
          "How do you implement FinOps chargeback or showback across multiple engineering departments?"
        ]
      },
      {
        question: "Describe a project where you improved developer experience (DevEx) and accelerated deployment velocity.",
        category: "Platform Engineering",
        seniorAnswer: "• **Situation**: Our engineering team grew from 30 to 120 engineers, but our centralized DevOps team became a severe bottleneck. Developers waited 45 minutes for pipeline feedback, and deploying a new microservice required filing 3 Jira tickets and waiting 4 days for infrastructure provisioning. \n• **Task**: I was tasked with transitioning our team from a ticket-based operations model to an Internal Developer Platform (IDP) enabling true self-service. \n• **Action**: 1. Created golden-path Terraform modules for microservice scaffolding (VPC, IAM, EKS, RDS, CI/CD pipeline). 2. Deployed an internal developer portal using Backstage, allowing developers to provision a production-ready, security-scanned microservice repository in 5 minutes via a standardized template. 3. Overhauled our CI/CD pipelines: migrated to GitHub Actions with self-hosted autoscaling ephemeral runners on private Kubernetes clusters, implemented Docker layer caching via BuildKit, and parallelized integration tests. \n• **Result**: Average pipeline execution time dropped from 45 minutes to 7 minutes. Microservice onboarding time plummeted from 4 days to 15 minutes. Developer satisfaction scores increased by 65%, and deployment frequency grew 4x.",
        juniorMistake: "Focusing solely on the tools (Backstage/Docker) rather than the business impact (time saved, developer velocity, autonomy).",
        interviewerFocus: "Platform engineering mindset, treating developers as customers, self-service enablement, and eliminating operational toil.",
        followUpQuestions: [
          "What is the difference between Platform Engineering and traditional DevOps?",
          "How do you measure developer productivity (DORA metrics: Deployment Frequency, Lead Time, MTTR, Change Failure Rate)?"
        ]
      }
    ],

    handsOn: {
      title: "Kubecost & Resource Sizing Audit Script",
      objective: "Analyze container CPU/memory requested vs actual consumed to generate an automated right-sizing cost optimization report.",
      steps: [
        "Query Prometheus for p95 memory/CPU usage vs declared requests.",
        "Identify over-provisioned workloads with > 60% memory waste.",
        "Calculate potential monthly cloud savings.",
        "Generate right-sized ResourceQuota and LimitRange recommendations."
      ],
      snippetTitle: "right-sizing-audit.py",
      snippetLang: "python",
      snippetCode: `#!/usr/bin/env python3
"""
Simple FinOps Resource Audit: Compares Pod Requests vs Actual Consumption
"""
import subprocess
import json

def get_pod_utilization():
    print("Gathering cluster pod resource metrics...")
    cmd = "kubectl top pods -A --containers --no-headers"
    output = subprocess.check_output(cmd, shell=True).decode()
    
    waste_report = []
    for line in output.strip().split('\\n'):
        parts = line.split()
        if len(parts) >= 4:
            ns, pod, cpu, mem = parts[0], parts[1], parts[2], parts[3]
            waste_report.append({"namespace": ns, "pod": pod, "cpu": cpu, "memory": mem})
            
    print(f"Audited {len(waste_report)} containers across all namespaces.")
    print("Recommendation: Compare with 'kubectl get deployment -o yaml' to right-size requests to p95 utilization.")

if __name__ == "__main__":
    get_pod_utilization()`,
      verificationCmd: `python3 right-sizing-audit.py`
    },

    systemDesign: {
      title: "Enterprise Internal Developer Platform (IDP) Architecture",
      scenario: "Design an internal developer platform for 300 software engineers that abstracts cloud infrastructure and automates compliance and deployment.",
      architecturePrinciples: [
        "Portal Layer: Spotify Backstage UI catalog providing service creation templates, API documentation, and ownership metadata.",
        "Orchestration Layer: Argo Workflows / GitHub Actions orchestrating infrastructure provisioning via Crossplane or Terraform.",
        "Golden Path Templates: Pre-approved Helm charts, Dockerfiles, and CI/CD pipelines with baked-in security scanning (Trivy) and logging.",
        "Policy Enforcement: OPA Gatekeeper / Kyverno validating that all self-serviced resources contain mandatory cost-center and owner tags."
      ],
      tradeOffs: "Golden paths must balance standardized guardrails with developer flexibility; overly rigid templates drive developers to bypass the platform."
    },

    checklist: [
      "Prepare your 6 master STAR stories: Outage, FinOps, CI/CD, Migration, Security, Leadership",
      "Format every resume bullet point using the Google X-Y-Z formula with quantifiable metrics",
      "Explain the 4 DORA metrics: Deployment Frequency, Lead Time, MTTR, Change Failure Rate",
      "Demonstrate concrete cloud cost optimization strategies (Karpenter Spot, VPC Endpoints, Right-Sizing)",
      "Articulate the difference between Platform Engineering (IDP) and traditional operations"
    ]
  },

  {
    id: 14,
    dayNum: 14,
    week: 2,
    title: "Final Revision, 50 Rapid-Fire Questions & Confidence Day",
    subtitle: "High-Priority Architectural Trade-Offs, Rapid-Fire Flashcard Drill & Last 24h Game Plan",
    tags: ["Revision", "Rapid-Fire", "Cheat Sheets", "Trade-Offs", "Confidence", "Final Prep"],
    timeSplit: { theory: "1h", lab: "1h", qa: "1h", systemDesign: "30m", stories: "30m" },
    summary: "The final polish: Drill 50 rapid-fire questions covering the entire syllabus, master the top 10 architectural trade-off comparisons, review high-frequency CLI cheat sheets, and establish mental calmness for interview day.",

    theory: [
      {
        title: "The Top 10 Senior Architectural Trade-Offs",
        content: `Senior engineers don't say 'X is best.' They articulate trade-offs:
1. **Push vs Pull CI/CD (Jenkins vs ArgoCD GitOps)**: Push has centralized credential risks; Pull (GitOps) continuously self-heals cluster state from inside the firewall with zero exposed credentials.
2. **iptables vs IPVS in Kube-Proxy**: iptables is simpler for small clusters; IPVS uses $O(1)$ hash tables, essential for clusters with > 1,000 services.
3. **Multi-Tenant Cluster vs Multi-Cluster Topology**: Shared clusters maximize hardware efficiency (lower cost); separate clusters provide physical isolation and blast radius containment at higher cost.
4. **Spot Instances vs On-Demand with Karpenter**: Spot saves 70% cost but has 2-minute termination risk; use Spot for stateless workloads with graceful PDBs and On-Demand for databases.
5. **Service Mesh (Istio/Linkerd) vs Ingress-Only**: Service Mesh provides mTLS, circuit breaking, and traffic splitting at the cost of sidecar CPU/memory overhead and operational complexity.
6. **EBS vs EFS (Block vs File Storage in K8s)**: EBS is fast (IOPS) but ReadWriteOnce (single node); EFS is ReadWriteMany (shared across nodes) but has higher latency.
7. **Client-Side vs Server-Side Load Balancing**: Client-side (gRPC) avoids proxy hops; server-side (ALB) simplifies client code and centralizes TLS/WAF.
8. **Horizontal Pod Autoscaling (HPA) vs KEDA**: HPA uses lagging CPU/memory metrics; KEDA scales proactively based on event queues before CPU rises.
9. **Monorepo vs Polyrepo for Microservices**: Monorepo simplifies atomic cross-service changes and shared CI tooling; polyrepo provides clean access boundaries and isolated repository clones.
10. **Active-Active vs Active-Passive Disaster Recovery**: Active-Active has near-zero RTO/RPO but complex multi-region data replication; Active-Passive is far cheaper and avoids split-brain conflicts.`
      },
      {
        title: "The Interview Day Mental Game Plan",
        content: `• **Pacing**: Take 5 seconds to structure your thoughts before answering. Never rush into code or commands!
• **Handling Unknowns**: If an interviewer asks about a tool or edge case you haven't used:
  - *Say this*: \"I haven't encountered that specific edge case in production, but based on how Linux networking / distributed consensus works, here is how I would systematically debug it...\"
  - Shows problem-solving maturity rather than guessing or bluffing!
• **Clarify Requirements First**: In system design, always ask about scale (QPS, storage volume), latency SLAs, and budget constraints before drawing a single box.
• **Energy & Confidence**: You have 5 years of real production experience. Interviews are peer-to-peer technical discussions, not interrogations!`
      }
    ],

    qa: [
      {
        question: "Rapid-Fire 1: What is the difference between a soft link and a hard link in Linux?",
        category: "Linux Rapid-Fire",
        seniorAnswer: "A hard link shares the exact same inode number and points directly to the data blocks on disk; deleting the original filename does not delete the data as long as the hard link exists. Hard links cannot span across different mounted filesystems. A soft (symbolic) link has its own distinct inode containing a file path string pointing to another file; if the target file is moved or deleted, the soft link becomes broken (dangling). Soft links can span filesystems and link directories.",
        juniorMistake: "Thinking hard links make a copy of the file contents.",
        interviewerFocus: "Understanding inodes and directory pointer structures in the Linux VFS.",
        followUpQuestions: ["Can you create a hard link to a directory in Linux? Why not?"]
      },
      {
        question: "Rapid-Fire 2: What is the ndots:5 issue in Kubernetes and how does it impact external API latency?",
        category: "Kubernetes Networking Rapid-Fire",
        seniorAnswer: "By default, Kubernetes configures `/etc/resolv.conf` in pods with `options ndots:5` and search domains (e.g. `<ns>.svc.cluster.local`, `svc.cluster.local`, `cluster.local`). Any DNS name with fewer than 5 dots (e.g. `api.stripe.com`, which has only 2 dots) causes the resolver to append all cluster search domains sequentially before querying the external name! This creates 4 failing DNS queries before the 5th query succeeds, causing DNS latency spikes and overwhelming CoreDNS. The fix is setting `dnsConfig` in the pod spec with `ndots: 2` or appending a trailing dot (`api.stripe.com.`) to make it a fully qualified domain name (FQDN).",
        juniorMistake: "Thinking DNS resolves external domains directly without checking cluster search domains.",
        interviewerFocus: "DNS resolver configuration mechanics and production performance tuning.",
        followUpQuestions: ["How does NodeLocal DNSCache mitigate this issue?"]
      },
      {
        question: "Rapid-Fire 3: Why should you never use `latest` tag in Docker production images?",
        category: "Docker Rapid-Fire",
        seniorAnswer: "1. **Immutability & Reproducibility**: `latest` is a mutable pointer. A deployment running `latest` today will deploy a completely different image tomorrow, making rolling updates and rollbacks unpredictable. 2. **K8s Pull Policy Trap**: If `imagePullPolicy` is set to `IfNotPresent` and the node already has a cached version of `latest`, it will never pull the updated image! 3. **Auditability**: It is impossible to trace which commit SHA corresponds to `latest` in security post-mortems. Always use immutable tags like semantic versions (`v2.4.1`) or Git commit SHAs (`git-b4fa91c`).",
        juniorMistake: "Saying 'because latest is for development' without explaining the imagePullPolicy caching trap or rollback failure.",
        interviewerFocus: "Production determinism, Kubernetes image pull policies, and GitOps traceability.",
        followUpQuestions: ["What is the difference between `imagePullPolicy: Always` and `IfNotPresent`?"]
      }
    ],

    handsOn: {
      title: "50 Rapid-Fire Review & Final Command Cheatsheet",
      objective: "Review essential high-frequency commands across Linux, Kubectl, Docker, and Terraform.",
      steps: [
        "Review top 10 diagnostic CLI one-liners.",
        "Test mental recall of Linux signals (SIGTERM 15, SIGKILL 9, SIGHUP 1).",
        "Verify understanding of common K8s exit codes (137 OOMKilled, 143 Terminated, 1 Error).",
        "Perform a dry run of your self-introduction and 6 STAR stories."
      ],
      snippetTitle: "ninja-cheatsheet.sh",
      snippetLang: "bash",
      snippetCode: `# Linux Instant Health
uptime && free -h && df -h && top -b -n 1 | head -n 20
# Find Top 10 Memory Consuming Processes
ps aux --sort=-%mem | head -n 11
# Check Active Listening Sockets & Processes
ss -tulpn
# Kubernetes Top Consuming Pods
kubectl top pods -A --sort-by=cpu | head -n 15
# Inspect Failed Pod Events
kubectl get events --field-selector type!=Normal --sort-by='.lastTimestamp'
# Check Docker Resource Utilization
docker stats --no-stream --format "table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.NetIO}}"
# Terraform Drift Check
terraform plan -detailed-exitcode -no-color`,
      verificationCmd: `echo "All 14 Days Mastered. Ready for the Senior DevOps / SRE Interview!"`
    },

    systemDesign: {
      title: "The Ultimate Senior DevOps Interview Framework",
      scenario: "Synthesize your 14-day study journey into a confident, coherent senior platform engineer mindset.",
      architecturePrinciples: [
        "Start with Requirements: Scale (QPS/RPS), Latency SLA (p99 < 150ms), High Availability (99.99%), Budget.",
        "Draw from Outside-In: DNS/CDN -> Ingress/ALB -> K8s Compute (Workloads/HPA/KEDA) -> Database (Multi-AZ/Pooling) -> Observability & Security.",
        "Always Address Failure Modes: What happens when an AZ goes dark? What happens when a DB connection pool exhausts? What happens when the network partitions?",
        "Communicate Trade-Offs Proactively: Never propose a solution without stating its cost, complexity, and operational overhead."
      ],
      tradeOffs: "Seniority is not knowing all tools; seniority is knowing which tool NOT to use because of maintenance overhead."
    },

    checklist: [
      "Review the Top 10 Senior Architectural Trade-Offs matrix",
      "Run through the 50 Rapid-Fire Flashcards until achieving 100% mastery",
      "Dry-run your 2-minute elevator pitch and 6 STAR stories out loud",
      "Review the high-frequency Kubectl and Linux troubleshooting cheatsheets",
      "Get plenty of rest, hydrate, and approach the interview with calm, peer-level confidence!"
    ]
  }
];

// Export to window for browser access
if (typeof window !== "undefined") {
  window.DEVOPS_STUDY_DAYS = DEVOPS_STUDY_DAYS;
}
