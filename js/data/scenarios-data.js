/**
 * Interactive Incident Scenarios Dataset (Production Root Cause Analysis Game)
 */

const INCIDENTS_DATA = [
  {
    id: "incident-504",
    title: "SEV-1: High 504 Gateway Timeouts During Peak Traffic",
    severity: "SEV-1 (CRITICAL)",
    service: "Checkout & Payments API",
    impact: "35% of customer transactions failing with HTTP 504 Gateway Timeout. Revenue loss ~$12,000/min.",
    initialDescription: "During the 12:00 PM promotional flash sale, traffic surged from 2,000 QPS to 12,000 QPS. The AWS Application Load Balancer reports a spike in HTTP 504 errors. HPA scaled checkout pods from 12 to 75 replicas.",
    
    stages: [
      {
        stageId: 1,
        question: "What is your immediate first diagnostic step as Incident Commander?",
        options: [
          {
            id: "opt-1a",
            text: "Reboot the PostgreSQL database server immediately to clear any hung queries.",
            resultType: "failure",
            feedback: "CRITICAL MISTAKE! Rebooting the primary database without diagnosis will terminate thousands of active transactions, corrupt replication lag, and prolong the outage by at least 15 minutes."
          },
          {
            id: "opt-1b",
            text: "Check ALB target response time metrics vs Upstream Pod metrics to isolate where the delay originates.",
            resultType: "success",
            feedback: "EXCELLENT TRIAGE. Telemetry shows ALB CPU is at 25%, but Target Response Time spiked to 30.2 seconds. The delay is NOT in the ALB, but within the backend checkout pods.",
            nextStageId: 2
          },
          {
            id: "opt-1c",
            text: "Scale HPA from 75 to 200 replicas immediately to absorb the traffic burst.",
            resultType: "failure",
            feedback: "DANGEROUS ACTION. If downstream dependencies (like the database) are saturated, tripling the number of pods will exacerbate connection starvation and crash the database completely."
          }
        ]
      },
      {
        stageId: 2,
        question: "Inspecting checkout pods shows CPU is at 35% and memory is healthy. However, all HTTP requests to pods are hanging for 30s. What do you inspect next?",
        options: [
          {
            id: "opt-2a",
            text: "Check database active connections and lock contention using `pg_stat_activity` on PostgreSQL.",
            resultType: "success",
            feedback: "ROOT CAUSE LOCATED! `pg_stat_activity` shows 75 checkout pods * 20 threads = 1,500 attempted connections. PostgreSQL `max_connections` is set to 200! 1,300 connections are blocked waiting for pool sockets, causing HTTP requests to hit the 30s ALB timeout.",
            nextStageId: 3
          },
          {
            id: "opt-2b",
            text: "Check Kubernetes CoreDNS logs for DNS query drops.",
            resultType: "failure",
            feedback: "INCORRECT LEAD. CoreDNS query latency is healthy at 1.8ms. External and internal DNS resolution are working normally."
          },
          {
            id: "opt-2c",
            text: "Inspect Linux iptables rules on worker nodes with `iptables -L -n -v`.",
            resultType: "failure",
            feedback: "WRONG FOCUS. Kube-proxy iptables rules are synced and packets are arriving at the pods. The delay is internal to the application process."
          }
        ]
      },
      {
        stageId: 3,
        question: "PostgreSQL connections are exhausted because 75 pods overwhelmed the 200 connection limit. What is the immediate mitigation?",
        options: [
          {
            id: "opt-3a",
            text: "Immediately edit postgresql.conf, set `max_connections = 5000`, and restart PostgreSQL.",
            resultType: "failure",
            feedback: "POOR CHOICE. PostgreSQL forks a backend OS process for each connection (~10MB RAM). 5,000 connections would require 50GB of RAM, immediately triggering Linux kernel OOM Killer on the DB server!"
          },
          {
            id: "opt-3b",
            text: "Deploy connection pooling (PgBouncer / AWS RDS Proxy) and reduce pod client pool size from 20 to 3 connections per pod.",
            resultType: "success",
            feedback: "PERFECT RESOLUTION! By routing traffic through connection pooling, 75 pods safely multiplex transactions across 40 physical DB connections. Target response time drops back to 85ms, 504 errors vanish, and checkout is fully restored!",
            isResolved: true
          }
        ]
      }
    ],
    postMortemLessons: [
      "Never scale microservices to high replica counts without a database connection pooler (PgBouncer / RDS Proxy).",
      "Configure alerts on `pg_stat_activity` connection saturation at 80% capacity.",
      "Implement circuit breakers in checkout pods to fail fast with informative user errors rather than holding connections for 30 seconds."
    ]
  },

  {
    id: "incident-crashloop",
    title: "SEV-2: Payment Pods in CrashLoopBackOff (Exit Code 137)",
    severity: "SEV-2 (HIGH)",
    service: "Payment Processing Engine",
    impact: "Payment workers failing to process async payment reconciliation queue. Backlog growing rapidly.",
    initialDescription: "After a routine deployment of release v2.4.0, all 8 payment worker pods in namespace `payments` entered CrashLoopBackOff. Kubernetes events show pods restarting every 20-40 seconds.",
    
    stages: [
      {
        stageId: 1,
        question: "What is your first command to diagnose why the pods are crashing?",
        options: [
          {
            id: "opt-c1a",
            text: "Run `kubectl logs payment-worker-xxx` directly.",
            resultType: "partial",
            feedback: "The pod just restarted, so `kubectl logs` shows only the initial 2 lines of startup: 'Initializing engine...'. To see why it crashed, you must pass the `--previous` flag!",
            nextStageId: 2
          },
          {
            id: "opt-c1b",
            text: "Run `kubectl describe pod payment-worker-xxx` and inspect `Last State`.",
            resultType: "success",
            feedback: "EXCELLENT. `kubectl describe` reveals: `Last State: Terminated, Reason: OOMKilled, Exit Code: 137`. The container was killed by the kernel because it exceeded its memory limit of 512Mi!",
            nextStageId: 2
          }
        ]
      },
      {
        stageId: 2,
        question: "Now that you know the container is OOMKilled (Exit Code 137), how do you determine what caused the memory surge?",
        options: [
          {
            id: "opt-c2a",
            text: "Run `kubectl logs payment-worker-xxx --previous` and review Git commit diff for v2.4.0.",
            resultType: "success",
            feedback: "BULLSEYE! Logs show: 'Loading exchange rate cache into memory...'. The git diff reveals that v2.4.0 added an in-memory cache fetching 10 years of historical currency records (1.4 GB) on boot, blowing past the 512Mi pod memory limit!",
            nextStageId: 3
          },
          {
            id: "opt-c2b",
            text: "SSH into the worker node and run `dmesg -T`.",
            resultType: "partial",
            feedback: "`dmesg` confirms the kernel OOM killer invoked `kill_all_tasks` on the container cgroup, but doesn't explain the application logic bug.",
            nextStageId: 3
          }
        ]
      },
      {
        stageId: 3,
        question: "How do you mitigate and restore payment processing immediately?",
        options: [
          {
            id: "opt-c3a",
            text: "Remove memory limits completely from the deployment YAML (`limits: memory: null`).",
            resultType: "failure",
            feedback: "ANTI-PATTERN! Removing memory limits will allow leaky containers to consume all physical RAM on the worker node, crashing other co-located critical pods.",
            nextStageId: 3
          },
          {
            id: "opt-c3b",
            text: "Roll back to previous stable release v2.3.9 via `kubectl rollout undo deployment/payment-worker -n payments`.",
            resultType: "success",
            feedback: "OUTSTANDING SRE PRACTICE! Rollback immediately restores the worker pods to healthy status. The engineering team is notified to refactor the exchange rate cache to query Redis on-demand rather than preloading 10 years of data on startup.",
            isResolved: true
          }
        ]
      }
    ],
    postMortemLessons: [
      "Always inspect `Exit Code 137` and `--previous` logs during CrashLoopBackOff triage.",
      "Enforce memory profiling in CI staging load tests to catch unbounded in-memory cache allocations before reaching production.",
      "Rollback is always preferred over in-place live surgery during active incidents."
    ]
  },

  {
    id: "incident-notready",
    title: "SEV-1: Kubernetes Worker Node 'NotReady' Cascade",
    severity: "SEV-1 (CRITICAL)",
    service: "Core Cluster Infrastructure",
    impact: "3 worker nodes flipped to NotReady. 60 microservice pods evicted, causing cluster capacity crunch.",
    initialDescription: "Cluster monitoring alerts that nodes `worker-04`, `worker-05`, and `worker-06` have changed status to `NotReady`. Pods running on these nodes are being evicted to surviving nodes.",
    
    stages: [
      {
        stageId: 1,
        question: "What is your first command to investigate the NotReady nodes?",
        options: [
          {
            id: "opt-n1a",
            text: "Run `kubectl delete node worker-04` so the cloud autoscaler replaces it.",
            resultType: "failure",
            feedback: "DANGEROUS! Deleting the node object from the API server without understanding the root cause will cause the newly spawned node to suffer the exact same fate within minutes."
          },
          {
            id: "opt-n1b",
            text: "Run `kubectl describe node worker-04` and inspect the `Conditions` section.",
            resultType: "success",
            feedback: "GREAT FIRST STEP. Conditions show: `DiskPressure: True`, `Ready: False`. Kubelet stopped heartbeating because the root filesystem reached 100% capacity!",
            nextStageId: 2
          }
        ]
      },
      {
        stageId: 2,
        question: "You access the node via AWS SSM / SSH and run `df -h`. `/var/lib/containerd` is at 100% (200GB used). What do you check next?",
        options: [
          {
            id: "opt-n2a",
            text: "Check container log sizes in `/var/log/pods` and investigate containerd image storage.",
            resultType: "success",
            feedback: "EXACT DIAGNOSIS! A debug logging loop in a logging daemon generated 140GB of unrotated `.log` files in 6 hours because container log rotation was misconfigured in containerd config.toml!",
            nextStageId: 3
          },
          {
            id: "opt-n2b",
            text: "Run `reboot` on the node.",
            resultType: "failure",
            feedback: "Rebooting will not free filled disk space. The node will boot right back into DiskPressure: True."
          }
        ]
      },
      {
        stageId: 3,
        question: "How do you safely restore the node and prevent this failure from cascading to other nodes?",
        options: [
          {
            id: "opt-n3a",
            text: "Safely truncate the overflowing log files, run `crictl rmi --prune` to clear dead images, restart kubelet, and deploy standard logrotate DaemonSet / containerd `max_size` caps.",
            resultType: "success",
            feedback: "FLAWLESS RESOLUTION! Disk usage drops to 24%, kubelet clears DiskPressure, node flips back to `Ready`, and log rotation caps prevent future recurrence across the entire cluster.",
            isResolved: true
          }
        ]
      }
    ],
    postMortemLessons: [
      "Always configure container log rotation limits (`max-size: 50m`, `max-file: 3`) in container runtime settings.",
      "Set alert triggers on node root disk utilization at 75% and 85% to triage before Kubelet initiates emergency pod evictions.",
      "Separate OS root disk from `/var/lib/containerd` using dedicated NVMe storage partitions."
    ]
  }
];

if (typeof window !== "undefined") {
  window.INCIDENTS_DATA = INCIDENTS_DATA;
}
