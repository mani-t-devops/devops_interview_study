/**
 * High-Frequency DevOps & SRE Cheat Sheets Dataset
 */

const CHEATSHEETS_DATA = [
  {
    id: "linux-triage",
    title: "Linux Production Troubleshooting Cheatsheet",
    description: "High-frequency commands for rapid CPU, memory, disk, and socket diagnosis under pressure.",
    sections: [
      {
        sectionTitle: "CPU & System Load",
        commands: [
          { cmd: "uptime", desc: "View system load averages (1, 5, 15 min) and system uptime." },
          { cmd: "top -H -p <PID>", desc: "Display per-thread CPU utilization for a specific process." },
          { cmd: "mpstat -P ALL 1", desc: "View per-core CPU breakdown (%us, %sy, %wa, %st)." },
          { cmd: "pidstat -u 1 5", desc: "Print top CPU consuming processes sampled every second for 5 intervals." },
          { cmd: "strace -c -p <PID>", desc: "Profile system call overhead and count for a hung process." }
        ]
      },
      {
        sectionTitle: "Memory & Storage",
        commands: [
          { cmd: "free -h", desc: "Check total, used, free, and available physical RAM and Swap." },
          { cmd: "vmstat 1 5", desc: "Check memory paging, run queue ('r'), and blocked I/O ('b')." },
          { cmd: "dmesg -T | grep -i -E 'oom|killed'", desc: "Check kernel ring buffer for Linux OOM-killer invocations." },
          { cmd: "df -h && df -i", desc: "Check disk storage usage and inode saturation." },
          { cmd: "lsof +L1", desc: "Find deleted open files holding unreleased disk space." },
          { cmd: "iostat -xz 1 5", desc: "Inspect disk saturation (%util) and average queue size (avgqu-sz)." }
        ]
      },
      {
        sectionTitle: "Networking & Sockets",
        commands: [
          { cmd: "ss -tulpn", desc: "List all listening TCP/UDP sockets with associated process names and PIDs." },
          { cmd: "ss -s", desc: "View summary of total sockets, TCP states (ESTABLISHED, TIME_WAIT)." },
          { cmd: "lsof -i :8080", desc: "Identify which process is actively listening on port 8080." },
          { cmd: "tcpdump -i any -nn 'tcp port 443 and (tcp[tcpflags] & tcp-syn != 0)'", desc: "Capture incoming TLS SYN connection attempts." },
          { cmd: "curl -Iv -k --resolve api.company.com:443:10.0.1.5 https://api.company.com", desc: "Test TLS handshake against a specific target IP bypassing DNS." }
        ]
      }
    ]
  },
  {
    id: "kubectl-ninja",
    title: "Kubectl Ninja Cheatsheet (Senior Edition)",
    description: "Advanced Kubectl inspection, sorting, JSONPath extractions, and debugging tricks.",
    sections: [
      {
        sectionTitle: "Troubleshooting Pods & Containers",
        commands: [
          { cmd: "kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded", desc: "List all failing pods across all namespaces instantly." },
          { cmd: "kubectl logs <pod-name> -c <container> --previous", desc: "View stdout/stderr logs from the previous crashed container instance." },
          { cmd: "kubectl get events --sort-by=.metadata.creationTimestamp -A", desc: "Stream cluster events sorted chronologically to catch probe/image failures." },
          { cmd: "kubectl debug pod/<pod-name> -it --image=busybox --target=<container>", desc: "Attach an ephemeral debug container sharing the target pod's process namespace." },
          { cmd: "kubectl top pods -A --sort-by=memory | head -n 15", desc: "Identify top 15 memory-consuming pods across the cluster." }
        ]
      },
      {
        sectionTitle: "JSONPath & Custom Columns Magic",
        commands: [
          { cmd: "kubectl get pods -A -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName,IP:.status.podIP", desc: "Print clean tabular view of pod names, scheduled node, and assigned pod IP." },
          { cmd: "kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.status.addresses[?(@.type==\"InternalIP\")].address}{\"\\n\"}{end}'", desc: "Extract private IPs of all worker nodes." },
          { cmd: "kubectl get deployment -A -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.spec.template.spec.containers[*].image}{\"\\n\"}{end}'", desc: "List all running deployments and their active container image tags." }
        ]
      },
      {
        sectionTitle: "Cluster Management & Draining",
        commands: [
          { cmd: "kubectl cordon <node-name>", desc: "Mark worker node unschedulable (prevents new pods from landing)." },
          { cmd: "kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data", desc: "Safely evict all workloads respecting PodDisruptionBudgets." },
          { cmd: "kubectl uncordon <node-name>", desc: "Mark node schedulable again after maintenance/patching." },
          { cmd: "kubectl rollout status deployment/<deployment-name>", desc: "Watch rolling update progress in real time." },
          { cmd: "kubectl rollout undo deployment/<deployment-name>", desc: "Perform immediate zero-downtime rollback to previous revision." }
        ]
      }
    ]
  },
  {
    id: "terraform-ref",
    title: "Terraform State & Drift Quick Reference",
    description: "Commands for managing state files, drift detection, imports, and emergency unlocks.",
    sections: [
      {
        sectionTitle: "State Inspection & Management",
        commands: [
          { cmd: "terraform state list", desc: "List all tracked resources in the current state file." },
          { cmd: "terraform state show <resource_address>", desc: "Inspect all attributes and cloud IDs of a specific managed resource." },
          { cmd: "terraform state mv <source> <destination>", desc: "Rename or move a resource in state without destroying/recreating cloud infrastructure." },
          { cmd: "terraform state rm <resource_address>", desc: "Stop tracking a resource in Terraform without deleting it from AWS/Azure." },
          { cmd: "terraform force-unlock <LOCK_ID>", desc: "Emergency unlock of a stuck DynamoDB/Blob state lock (use with extreme care!)." }
        ]
      },
      {
        sectionTitle: "Drift & Migration",
        commands: [
          { cmd: "terraform plan -detailed-exitcode", desc: "Check for drift: Exit 0 = clean, Exit 2 = drift detected." },
          { cmd: "terraform import <resource_address> <cloud_id>", desc: "Import existing pre-created cloud resource into Terraform state." },
          { cmd: "terraform plan -replace=\"<resource_address>\"", desc: "Force recreation of a specific tainted or degraded cloud resource." },
          { cmd: "terraform fmt -recursive && terraform validate", desc: "Enforce standard HCL formatting and validate syntax across all modules." }
        ]
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.CHEATSHEETS_DATA = CHEATSHEETS_DATA;
}
