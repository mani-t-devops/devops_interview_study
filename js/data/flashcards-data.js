/**
 * 50+ Rapid-Fire Senior DevOps Interview Flashcards Dataset
 */

const FLASHCARDS_DATA = [
  // Category: Linux & Networking
  {
    id: 1,
    category: "Linux & Networking",
    question: "What is a process in 'D' state (TASK_UNINTERRUPTIBLE), and can you kill it with kill -9?",
    answer: "A process in D-state is waiting directly on hardware I/O (NFS server, disk controller, or kernel lock). It is uninterruptible by signals, so 'kill -9' has ZERO effect! It inflates the CPU load average without using CPU cycles. To clear it, resolve the hardware/NFS issue or reboot.",
    seniorTip: "If you see a machine with load average 40 on a 4-core machine and CPU usage is 2%, run `ps aux | grep ' D '` to find the culprit."
  },
  {
    id: 2,
    category: "Linux & Networking",
    question: "Why does TCP have a TIME_WAIT state, and what is its default duration?",
    answer: "TIME_WAIT lasts for 2*MSL (Maximum Segment Lifetime, default 60s). It prevents lingering delayed duplicate packets from prior closed connections from corrupting a new connection on the same 4-tuple (srcIP, srcPort, dstIP, dstPort), and ensures the remote peer receives the final ACK.",
    seniorTip: "Under high microservice concurrency, enable HTTP Keep-Alive connection pooling or tune `net.ipv4.tcp_tw_reuse = 1` to prevent ephemeral port exhaustion."
  },
  {
    id: 3,
    category: "Linux & Networking",
    question: "What is the difference between an Inode and a Data Block in Linux filesystems?",
    answer: "An inode is a metadata data structure containing file permissions, owner, file size, timestamps, and pointers to disk data blocks. The data block contains the actual file content bytes. Inodes do not store the filename (the directory entry maps filename to inode).",
    seniorTip: "A disk can fail with 'No space left on device' even with gigabytes of free disk space if `df -i` shows 100% inode exhaustion!"
  },
  {
    id: 4,
    category: "Linux & Networking",
    question: "How does the Linux OOM Killer decide which process to kill first?",
    answer: "It computes an `oom_score` (0 to 1000) proportional to the percentage of physical RAM consumed. This score is adjusted by `/proc/<PID>/oom_score_adj` (-1000 to +1000). A score of -1000 makes a process immune to OOM kill; +1000 makes it the first target.",
    seniorTip: "Kubelet sets `oom_score_adj` to -997 for critical system daemons, 0 for Burstable QoS pods, and 1000 for BestEffort pods."
  },
  {
    id: 5,
    category: "Linux & Networking",
    question: "What is the ndots:5 configuration in Kubernetes pods and why does it cause DNS performance issues?",
    answer: "By default, pods have `ndots:5` in `/etc/resolv.conf`. Any domain queried with fewer than 5 dots (e.g. `api.github.com` has 2 dots) will first query cluster search domains sequentially (`<ns>.svc.cluster.local`, `svc.cluster.local`, etc.) generating 4 NXDOMAIN queries before querying external DNS!",
    seniorTip: "Tune `dnsConfig` in the pod spec with `ndots: 2` or append a trailing dot (`api.github.com.`) to make it an absolute FQDN."
  },
  {
    id: 6,
    category: "Linux & Networking",
    question: "What is the difference between %us, %sy, %wa, and %st in `top` CPU metrics?",
    answer: "• %us: CPU time spent running unprivileged user space code.\n• %sy: CPU time spent in kernel space executing system calls.\n• %wa: CPU is IDLE waiting on outstanding disk or network I/O.\n• %st: Steal time — hypervisor stole CPU cycles for other VMs on the physical host.",
    seniorTip: "High %st in AWS EC2 indicates a noisy neighbor on the same physical hypervisor or burstable T-series instance CPU credit exhaustion."
  },

  // Category: Containers & Docker
  {
    id: 7,
    category: "Containers & Docker",
    question: "Why should you always use the Exec form instead of Shell form for ENTRYPOINT in Docker?",
    answer: "Exec form (`ENTRYPOINT [\"/app/bin\"]`) runs your executable directly as PID 1, allowing it to receive and handle OS signals like SIGTERM for graceful shutdown. Shell form (`ENTRYPOINT /app/bin`) runs as `/bin/sh -c`, which does NOT forward signals to your child process!",
    seniorTip: "Without exec form, your app will never gracefully drain requests and will always be brutally killed by SIGKILL after 30 seconds."
  },
  {
    id: 8,
    category: "Containers & Docker",
    question: "What are the 3 main Linux kernel mechanisms that make a Docker container?",
    answer: "1. Linux Namespaces (PID, Mount, Net, IPC, UTS, User) for isolation.\n2. Control Groups (Cgroups v1/v2) for resource limits (CPU quotas, memory caps, PID limits).\n3. Union Filesystem (OverlayFS) for layered copy-on-write image filesystems.",
    seniorTip: "Containers are not VMs — they are isolated host processes sharing the host Linux kernel directly."
  },
  {
    id: 9,
    category: "Containers & Docker",
    question: "What are Google Distroless images and what security advantage do they offer?",
    answer: "Distroless images contain strictly your compiled application and minimal runtime libraries. They contain NO package managers (apt, apk), NO shells (/bin/sh, /bin/bash), and NO standard Unix utilities (curl, wget).",
    seniorTip: "Eliminating shells prevents attackers from establishing interactive reverse shells even if they discover an RCE vulnerability in your application."
  },
  {
    id: 10,
    category: "Containers & Docker",
    question: "What happens when a container exceeds its memory limit vs when it exceeds its CPU limit?",
    answer: "• Exceeding Memory Limit: The kernel immediately invokes `oom_killer` and terminates the container with Exit Code 137 (SIGKILL).\n• Exceeding CPU Limit: The CFS (Completely Fair Scheduler) **throttles** the container's CPU quota. The container does NOT crash, but execution slows down significantly.",
    seniorTip: "Always monitor `container_cpu_cfs_throttled_periods_total` in Prometheus to detect silent CPU throttling."
  },

  // Category: Kubernetes
  {
    id: 11,
    category: "Kubernetes",
    question: "What is the difference between a Liveness Probe and a Readiness Probe?",
    answer: "• Liveness Probe: Checks if the container is healthy. If it fails, kubelet KILLS and restarts the container.\n• Readiness Probe: Checks if the container is ready to accept traffic. If it fails, the pod IP is REMOVED from the Service Endpoints list; the pod keeps running without receiving traffic.",
    seniorTip: "Never include external database or cache dependencies in a liveness probe; if the DB has a momentary blip, all your pods restart in a cascading failure!"
  },
  {
    id: 12,
    category: "Kubernetes",
    question: "What do Exit Codes 137, 143, and 1 signify in a Kubernetes CrashLoopBackOff?",
    answer: "• 137 (128 + 9): Process killed by SIGKILL. In 99% of cases, this indicates **OOMKilled** (Out Of Memory).\n• 143 (128 + 15): Process gracefully terminated via SIGTERM (often triggered by kubelet stopping an unready or failing pod).\n• 1: Application runtime exception (uncaught error, failed database connection, missing config).",
    seniorTip: "Check `kubectl describe pod <name>` and look for `Last State -> Reason: OOMKilled` to confirm."
  },
  {
    id: 13,
    category: "Kubernetes",
    question: "Why should you add a `preStop: exec: sleep 10` hook to production Kubernetes pods?",
    answer: "When a pod is deleted, endpoint removal from Service iptables and pod termination occur in parallel across the cluster. A `preStop: sleep 10` delays sending SIGTERM to the app, giving kube-proxy time to update iptables on all nodes so no inflight requests hit a dead pod.",
    seniorTip: "This is the single most common fix for intermittent 502 Bad Gateway errors during rolling deployments."
  },
  {
    id: 14,
    category: "Kubernetes",
    question: "What is the difference between Kube-proxy iptables mode and IPVS mode?",
    answer: "• iptables: Evaluates rules sequentially ($O(N)$ complexity). In clusters with thousands of services, iptables rule generation consumes high CPU and causes latency spikes.\n• IPVS (IP Virtual Server): Uses kernel hash tables ($O(1)$ complexity) for instant lookups regardless of cluster scale, and supports advanced balancing algorithms.",
    seniorTip: "IPVS is the industry recommendation for production clusters running more than 1,000 services."
  },
  {
    id: 15,
    category: "Kubernetes",
    question: "How does Karpenter provision nodes faster than the traditional Kubernetes Cluster Autoscaler?",
    answer: "Cluster Autoscaler relies on cloud Auto Scaling Groups (ASGs), taking 3-6 minutes to scale. Karpenter communicates directly with cloud compute APIs (EC2 Fleet), evaluates pending pod resource shapes in real-time, selects optimal instance types/Spot capacity, and launches nodes in ~40 seconds.",
    seniorTip: "Karpenter also performs automatic 'consolidation', packing pods onto fewer/cheaper nodes to minimize idle cloud spend."
  },
  {
    id: 16,
    category: "Kubernetes",
    question: "What is a PodDisruptionBudget (PDB) and what does it protect against?",
    answer: "A PDB specifies the minimum number of available replicas (`minAvailable`) or maximum unavailable replicas (`maxUnavailable`) that must remain healthy during **voluntary disruptions** (e.g. node drain, cluster upgrade, autoscaler downscaling).",
    seniorTip: "PDBs protect against voluntary disruptions, but CANNOT protect against involuntary disruptions like hardware failure or AWS Spot termination."
  },
  {
    id: 17,
    category: "Kubernetes",
    question: "What is the difference between Taints/Tolerations and Node Affinity?",
    answer: "• Taints are set on NODES to REPEL pods (unless the pod has a matching toleration).\n• Node Affinity is set on PODS to ATTRACT pods to specific nodes with matching labels.",
    seniorTip: "To dedicate GPU nodes strictly to ML jobs, you need BOTH: a taint on the GPU node (to repel web pods) and node affinity on the ML pod (so it schedules on the GPU node)."
  },
  {
    id: 18,
    category: "Kubernetes",
    question: "What is a Headless Service (`clusterIP: None`) and what is its primary use case?",
    answer: "A Headless Service does not allocate a virtual ClusterIP. Instead of returning a single VIP, CoreDNS directly returns the individual A records of all healthy backing pod IPs. Used primarily with StatefulSets (e.g. Kafka, Cassandra, DB clusters) requiring direct peer-to-peer routing.",
    seniorTip: "Clients query `<service-name>.<namespace>.svc.cluster.local` and receive multiple IP addresses for client-side load balancing."
  },

  // Category: Cloud (AWS & Azure)
  {
    id: 19,
    category: "Cloud Infrastructure",
    question: "What is the difference between an AWS ALB (Layer 7) and NLB (Layer 4)?",
    answer: "• ALB (Application Load Balancer): Terminates TCP, inspects HTTP/HTTPS headers, performs path/host-based routing, integrates with WAF, and scales dynamically.\n• NLB (Network Load Balancer): Routes raw Layer 4 TCP/UDP packets with ultra-low sub-millisecond latency, handles millions of QPS, and provides static Anycast IPs.",
    seniorTip: "Use NLB when enterprise clients require static IP whitelisting or when handling gaming/streaming/WebSocket traffic."
  },
  {
    id: 20,
    category: "Cloud Infrastructure",
    question: "How does AWS IRSA (IAM Roles for Service Accounts) eliminate static AWS access keys in Kubernetes?",
    answer: "EKS hosts an OpenID Connect (OIDC) provider. Kubernetes projects a signed JWT token into the pod's ServiceAccount. The AWS SDK exchanges this JWT via `sts:AssumeRoleWithWebIdentity` for temporary, 1-hour AWS credentials with scoped IAM permissions.",
    seniorTip: "Azure Workload Identity uses the identical OIDC federation mechanism with Azure Entra ID / Managed Identities."
  },
  {
    id: 21,
    category: "Cloud Infrastructure",
    question: "Why should you use an AWS Transit Gateway instead of VPC Peering when connecting 25 VPCs?",
    answer: "VPC Peering is non-transitive and requires a point-to-point mesh ($N*(N-1)/2$). For 25 VPCs, that equals 300 peering connections! Transit Gateway acts as a central cloud router (Hub-and-Spoke), providing transitive routing with centralized route tables and firewall inspection.",
    seniorTip: "Transit Gateway also allows centralizing NAT Gateways and egress firewalls in a single inspection VPC, saving thousands in NAT costs."
  },
  {
    id: 22,
    category: "Cloud Infrastructure",
    question: "What is an AWS VPC Endpoint (PrivateLink) and why does it save money?",
    answer: "A VPC Endpoint allows private subnets to communicate privately with AWS services (S3, ECR, DynamoDB) over the AWS private backbone without traversing a public NAT Gateway. It eliminates NAT Gateway hourly and \$0.045/GB data processing fees.",
    seniorTip: "S3 and DynamoDB Gateway Endpoints are completely FREE. Always enable them in every production VPC!"
  },

  // Category: Terraform & IaC
  {
    id: 23,
    category: "Terraform & IaC",
    question: "How does Terraform distributed state locking work with AWS S3 and DynamoDB?",
    answer: "The state file is stored in S3. When `terraform plan` or `apply` runs, Terraform writes an item with a unique `LockID` into the DynamoDB table. Any concurrent execution sees the lock and aborts with an error, preventing fatal state file corruption.",
    seniorTip: "In Azure, state locking is handled natively via Azure Blob Storage blob leases without needing an extra database."
  },
  {
    id: 24,
    category: "Terraform & IaC",
    question: "What is the exit code for `terraform plan -detailed-exitcode` and how is it used in CI/CD drift detection?",
    answer: "• Exit Code 0: Plan succeeded, NO changes detected (infrastructure is in sync).\n• Exit Code 1: Plan failed due to syntax or provider error.\n• Exit Code 2: Plan succeeded, CHANGES/DRIFT detected! A scheduled CI pipeline alerts on exit code 2.",
    seniorTip: "Run `terraform plan -detailed-exitcode -no-color` nightly in a CI cron job to detect unauthorized manual cloud console changes."
  },
  {
    id: 25,
    category: "Terraform & IaC",
    question: "Why are Terraform Workspaces generally discouraged for separating Dev, Staging, and Production environments?",
    answer: "Workspaces share the exact same backend configuration and HCL code, only swapping the state file. It is extremely easy for an engineer to run `terraform apply` in Production thinking they were in Dev, and it is difficult to manage different cloud credentials or distinct structural architectures per environment.",
    seniorTip: "Senior best practice: Use directory-based separation (`envs/dev/`, `envs/prod/`) or Terragrunt with isolated state files and distinct cloud credentials."
  },
  {
    id: 26,
    category: "Terraform & IaC",
    question: "How do you safely unlock a stuck Terraform state lock if a CI runner crashes mid-apply?",
    answer: "1. Verify no other engineer or pipeline is running.\n2. Note the Lock ID from the error message.\n3. Run `terraform force-unlock <LOCK-ID>`.\n4. Run `terraform plan` to verify the state file integrity. If corrupted, restore previous state from S3 bucket versioning.",
    seniorTip: "Never run force-unlock without checking who owns the lock; killing an active apply halfway through can orphan cloud resources."
  },

  // Category: CI/CD & DevSecOps
  {
    id: 27,
    category: "CI/CD & DevSecOps",
    question: "What is OIDC authentication in GitHub Actions / Azure DevOps, and why does it eliminate cloud access keys?",
    answer: "Instead of storing long-lived AWS secret access keys or Azure service principal passwords in pipeline secrets, the CI runner requests an OpenID Connect (OIDC) JWT token. Cloud IAM exchanges this JWT for short-lived (1-hour) temporary role credentials.",
    seniorTip: "If a CI runner is compromised, there are zero static permanent keys for attackers to exfiltrate."
  },
  {
    id: 28,
    category: "CI/CD & DevSecOps",
    question: "What is the difference between Blue/Green and Canary deployments?",
    answer: "• Blue/Green: Deploys complete new version alongside old version. Switches 100% of router traffic instantaneously. Requires 2x compute capacity.\n• Canary: Slowly directs a tiny percentage (5% -> 25% -> 100%) of traffic to the new version while monitoring telemetry (error rates, p99 latency) for automated rollback.",
    seniorTip: "Canary minimizes the blast radius during high-risk production releases."
  },
  {
    id: 29,
    category: "CI/CD & DevSecOps",
    question: "What is Sigstore Cosign and how does it prevent untrusted container images from running in production?",
    answer: "Cosign signs container images cryptographically using OIDC or KMS keys and pushes the signature to the OCI registry. An admission controller (like Kyverno) in Kubernetes validates the signature before allowing pods to be scheduled, rejecting unsigned or tampered images.",
    seniorTip: "This is a core requirement for securing the software supply chain against pipeline tampering (SLSA compliance)."
  },
  {
    id: 30,
    category: "CI/CD & DevSecOps",
    question: "How does the HashiCorp Vault Dynamic Secrets engine work?",
    answer: "Instead of sharing static database passwords, an app requests credentials from Vault. Vault dynamically creates a unique, temporary database user with an attached TTL (e.g. 30 minutes). When the lease expires, Vault automatically drops the user from the database.",
    seniorTip: "Dynamic secrets eliminate the need for manual credential rotation and prevent leaked password reuse."
  },

  // Category: Observability & SRE
  {
    id: 31,
    category: "Observability & SRE",
    question: "What is the mathematical relationship between SLI, SLO, SLA, and Error Budget?",
    answer: "• SLI: Metric of current behavior (e.g. 99.92% success rate).\n• SLO: Internal target (e.g. 99.9% over 30 days).\n• SLA: Legal contract with financial penalties (e.g. 99.5%).\n• Error Budget: $1 - \\text{SLO}$. For a 99.9% SLO over 30 days, Error Budget = 0.1% = 43.8 minutes of downtime.",
    seniorTip: "When Error Budget is exhausted, feature deployments are frozen and engineering focuses 100% on reliability."
  },
  {
    id: 32,
    category: "Observability & SRE",
    question: "Why should you alert on Error Budget Burn Rates rather than point-in-time threshold spikes?",
    answer: "Point-in-time alerts (e.g. '5xx errors > 2% for 5 mins') cause massive alert fatigue from momentary spikes that don't harm the monthly SLA. Burn rate alerts page only when error consumption velocity threatens to deplete the 30-day error budget within a specific window (e.g. 14.4x burn rate = 10% budget in 5h).",
    seniorTip: "This Google SRE pattern reduces false-positive pages by over 80%."
  },
  {
    id: 33,
    category: "Observability & SRE",
    question: "What are the 4 Golden Signals of monitoring according to Google SRE?",
    answer: "1. Latency (time taken to service a request).\n2. Traffic (demand/throughput on system, e.g. req/s).\n3. Errors (rate of failed requests: 5xx, timeouts, drops).\n4. Saturation (how full the resource is: CPU %, RAM %, connection pool utilization).",
    seniorTip: "If you only have 4 graphs on your incident dashboard, make them the 4 Golden Signals."
  },
  {
    id: 34,
    category: "Observability & SRE",
    question: "What is High Cardinality in Prometheus and why does it crash TSDB?",
    answer: "Cardinality is the number of unique time series created by label combinations. If you attach high-cardinality labels (like `user_id`, `email`, or `ip_address`) to a metric, Prometheus creates millions of individual time-series chunks in memory, causing rapid memory exhaustion and OOM crashes.",
    seniorTip: "Keep Prometheus labels bounded to low-cardinality sets (status_code, method, handler). Put high-cardinality data in distributed traces (Jaeger) or logs."
  },

  // Category: System Design & Production Triage
  {
    id: 35,
    category: "System Design & Production",
    question: "What is the difference between RTO and RPO in Disaster Recovery?",
    answer: "• RTO (Recovery Time Objective): The maximum acceptable duration of system downtime before service is restored.\n• RPO (Recovery Point Objective): The maximum acceptable data loss measured in time (delta between last data backup/sync and failure).",
    seniorTip: "Active-Active multi-region provides near-zero RTO and RPO at high cost; Warm Standby provides low RTO (minutes) with low RPO (seconds)."
  },
  {
    id: 36,
    category: "System Design & Production",
    question: "What is connection pool exhaustion and how does PgBouncer or AWS RDS Proxy prevent it?",
    answer: "PostgreSQL forks a backend process for every client connection (~10MB RAM per connection). When 500 pods scale to 2,000 pods, 20,000 direct database connections choke DB memory and CPU lock contention. A connection pooler multiplexes thousands of pod connections over a small, reuse pool of ~100 physical DB connections.",
    seniorTip: "Never scale microservices to hundreds of replicas without database connection pooling."
  },
  {
    id: 37,
    category: "System Design & Production",
    question: "What is a Circuit Breaker pattern and how does it prevent cascading failures across microservices?",
    answer: "When service A calls service B, and service B starts timing out or throwing 500 errors, the circuit breaker 'trips' (opens). Service A immediately returns a fast fallback response or cached error without calling service B, preventing service A's thread pool from becoming exhausted waiting for timeouts.",
    seniorTip: "Circuit breakers give downstream services breathing room to recover during outages."
  },
  {
    id: 38,
    category: "System Design & Production",
    question: "What is the Expand and Contract (Parallel Run) pattern for zero-downtime database migrations?",
    answer: "• Expand: Add new column or table without removing old one. Application writes to BOTH old and new, reads from old.\n• Backfill: Migrate historical data in the background.\n• Switch: Update application to read and write to the new schema.\n• Contract: Safely drop the old column/table in a subsequent release.",
    seniorTip: "Never drop or rename a database column in the same deployment as application code changes!"
  },
  {
    id: 39,
    category: "Linux & Networking",
    question: "What does the command `lsof -i :8080` do and what does it tell you?",
    answer: "Lists open file descriptors and processes utilizing network port 8080. It displays the process name, PID, user, protocol (TCP/UDP), and socket connection state (LISTEN, ESTABLISHED).",
    seniorTip: "If a service fails to start with `Address already in use`, run `lsof -i :port` to find and kill the lingering zombie process."
  },
  {
    id: 40,
    category: "Kubernetes",
    question: "What is the difference between `externalTrafficPolicy: Cluster` vs `Local` on a Kubernetes Service?",
    answer: "• Cluster (Default): Node receiving traffic can forward packets to pods on other nodes via SNAT. Hides the real client source IP (source IP becomes node IP).\n• Local: Traffic is routed ONLY to pods on the node that received the packet. Preserves the real client source IP and avoids extra network hops, but can cause uneven traffic distribution.",
    seniorTip: "Use `Local` when your application requires real client IP logging for security/geolocation or to eliminate cross-node hop latency."
  },
  {
    id: 41,
    category: "Kubernetes",
    question: "What is the role of the etcd consensus algorithm (Raft) in Kubernetes control plane high availability?",
    answer: "etcd uses the Raft distributed consensus algorithm. An etcd cluster of $N$ nodes can tolerate $(N-1)/2$ failures. A 3-node cluster tolerates 1 node failure; a 5-node cluster tolerates 2 node failures. Clusters must always have an odd number of nodes to maintain quorum.",
    seniorTip: "Never deploy an even number of etcd nodes (e.g. 4 nodes); 4 nodes still only tolerate 1 failure, increasing failure probability without increasing fault tolerance."
  },
  {
    id: 42,
    category: "CI/CD & DevSecOps",
    question: "What is GitOps and how does ArgoCD enforce continuous reconciliation?",
    answer: "GitOps uses a Git repository as the single declarative source of truth for desired infrastructure. The ArgoCD controller runs inside Kubernetes, continuously comparing live cluster state against Git. If drift occurs (e.g. manual `kubectl edit`), ArgoCD automatically self-heals cluster state back to Git.",
    seniorTip: "GitOps eliminates direct human write permissions (`kubectl apply`) to production clusters, creating a complete audit trail."
  },
  {
    id: 43,
    category: "Observability & SRE",
    question: "What is the difference between Prometheus rate() and irate() functions?",
    answer: "• `rate()`: Calculates the per-second average rate of increase across the entire specified time range (e.g. `[5m]`). Smooths out momentary spikes; ideal for alerting and SLOs.\n• `irate()`: Calculates instant per-second rate using strictly the last 2 data points. Captures volatile, high-frequency spikes; ideal for zooming into fast bursts on dashboards.",
    seniorTip: "Always use `rate()` for alerting rules; `irate()` is too noisy and causes false-positive alerts."
  },
  {
    id: 44,
    category: "Cloud Infrastructure",
    question: "What is the difference between AWS Security Groups and Network ACLs (NACLs)?",
    answer: "• Security Group: Operates at instance/ENI level. StateFUL (return traffic automatically allowed regardless of outbound rules). Evaluates all rules before deciding.\n• NACL: Operates at subnet boundary. StateLESS (return traffic must be explicitly allowed). Evaluates rules in numbered order from lowest to highest.",
    seniorTip: "Use Security Groups for fine-grained microservice isolation; use NACLs as a subnet-level defensive firewall (e.g. blocking known malicious IP subnets)."
  },
  {
    id: 45,
    category: "Linux & Networking",
    question: "What is Epoll in Linux and why is it superior to select() and poll() for high-concurrency servers?",
    answer: "`select()` and `poll()` require $O(N)$ linear scans through all file descriptors to find which sockets have active data. `epoll` uses event-driven kernel callbacks ($O(1)$ complexity); it returns only the active file descriptors that are ready for I/O, allowing servers (like Nginx/Node.js) to scale to 100,000+ concurrent connections.",
    seniorTip: "This is the underlying reason Nginx outperforms traditional Apache prefork web servers."
  },
  {
    id: 46,
    category: "Kubernetes",
    question: "What happens when a node experiences DiskPressure in Kubernetes?",
    answer: "When node disk usage breaches the eviction threshold (default > 85%), kubelet marks node condition as `DiskPressure: True`. Kubelet stops scheduling new BestEffort pods and begins evicting existing pods based on priority and QoS classes, deleting dead containers and unused images.",
    seniorTip: "If log rotation is broken on worker nodes, DiskPressure cascades across the cluster as evicted pods crowd onto surviving nodes."
  },
  {
    id: 47,
    category: "Terraform & IaC",
    question: "What is the difference between `count` and `for_each` in Terraform resource blocks?",
    answer: "• `count`: References resources by integer index (`aws_subnet.sub[0]`). If an item is deleted from the middle of the list, Terraform will destroy and recreate every subsequent resource!\n• `for_each`: References resources by unique map or set key (`aws_subnet.sub[\"us-east-1a\"]`). Deleting an item touches only that specific resource without mutating others.",
    seniorTip: "Always prefer `for_each` over `count` when managing collections of cloud resources."
  },
  {
    id: 48,
    category: "System Design & Production",
    question: "What are the DORA metrics and why do top tech companies measure them?",
    answer: "1. Deployment Frequency: How often code is successfully deployed to production.\n2. Lead Time for Changes: Time from code commit to running in production.\n3. Change Failure Rate: % of deployments causing production degradation requiring rollback.\n4. Time to Restore Service (MTTR): How long it takes to recover from a production incident.",
    seniorTip: "Elite engineering organizations deploy multiple times per day with lead time < 1 hour and MTTR < 1 hour."
  },
  {
    id: 49,
    category: "Kubernetes",
    question: "What is CNI and how does Cilium's eBPF bypass the Linux network stack?",
    answer: "The CNI (Container Network Interface) assigns pod IPs and routes inter-pod packets. Traditional CNIs (Calico) inject iptables rules into the Linux netfilter framework. Cilium loads eBPF programs into the kernel network socket layer (tc/XDP), routing packets directly in kernel space without traversal through the heavy iptables connection tracking stack.",
    seniorTip: "Cilium eBPF drastically lowers CPU overhead and enables deep Layer 7 network observability without sidecar proxies."
  },
  {
    id: 50,
    category: "Linux & Networking",
    question: "How do you capture only TCP SYN packets on port 443 using `tcpdump`?",
    answer: "`sudo tcpdump -i any -nn 'tcp port 443 and (tcp[tcpflags] & tcp-syn != 0 and tcp[tcpflags] & tcp-ack == 0)'`\nThis filter inspects the TCP header byte offset flags using Berkeley Packet Filter (BPF) bitmask syntax to isolate new incoming connection attempts.",
    seniorTip: "Essential for verifying whether clients are reaching your server during suspected firewall drops or SYN floods."
  }
];

if (typeof window !== "undefined") {
  window.FLASHCARDS_DATA = FLASHCARDS_DATA;
}
