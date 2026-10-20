/**
 * Interactive Architecture Flows Dataset
 */

const ARCHITECTURES_DATA = [
  {
    id: "packet-life",
    title: "The End-to-End Life of a Production Packet",
    subtitle: "From Browser Keystroke to Database Query and Container Network Socket",
    description: "Follow a single HTTP GET request through all 7 OSI layers, cloud edge routing, ingress controllers, Kubernetes IPVS/iptables translation, and container namespaces.",
    steps: [
      {
        step: 1,
        layer: "Browser & Client DNS",
        component: "Client Browser & OS Resolver",
        details: "User visits https://api.company.com. Browser checks HSTS cache (enforcing HTTPS) -> checks local DNS cache. If miss, sends UDP query to resolver. In K8s, resolver checks /etc/hosts -> CoreDNS with ndots:5 configuration.",
        techDetails: "HSTS preload, DNS UDP Port 53, CoreDNS ndots:5 latency optimization."
      },
      {
        step: 2,
        layer: "Global Edge & CDN",
        component: "Anycast DNS & Cloudflare/CloudFront CDN",
        details: "BGP Anycast routes the user to the geographically closest Edge Point of Presence (PoP). Edge terminates TCP 3-way handshake and negotiates 1-RTT TLS 1.3 handshake with ECDHE key exchange. Static assets served from edge cache.",
        techDetails: "BGP Anycast routing, TLS 1.3 0-RTT/1-RTT resumption, WAF bot mitigation."
      },
      {
        step: 3,
        layer: "Cloud Ingress",
        component: "AWS ALB / Azure Application Gateway",
        details: "Edge forwards dynamic API traffic to Cloud Public Load Balancer across multiple AZs. ALB evaluates path rules (/api/v1/checkout -> TargetGroup-Checkout), decrypts TLS, injects X-Forwarded-For headers, and forwards to healthy worker node ports.",
        techDetails: "Layer 7 HTTP/2 reverse proxy, cross-AZ target groups, health probe verification."
      },
      {
        step: 4,
        layer: "Kubernetes Ingress",
        component: "Ingress-Nginx / Envoy Gateway Controller",
        details: "Traffic arrives at worker node. Ingress Controller matches Host and Ingress CRDs, executes rate-limiting and authentication middleware, and resolves backend Service endpoints.",
        techDetails: "Envoy/Nginx dynamic upstream configuration via Kubernetes EndpointSlices API."
      },
      {
        step: 5,
        layer: "Service NAT Translation",
        component: "Kube-Proxy (IPVS / iptables Mode)",
        details: "Virtual Service ClusterIP is translated into a physical Pod IP. In IPVS mode, an O(1) hash table lookup matches the target pod; in iptables mode, PREROUTING chain DNAT modifies the destination IP.",
        techDetails: "Netfilter DNAT / IPVS hash table lookup, conntrack table tracking."
      },
      {
        step: 6,
        layer: "Container Network Stack",
        component: "Linux veth Pair & Container Namespace",
        details: "CNI (Cilium eBPF or Calico) routes packet across host virtual ethernet (veth) pair directly into the container's isolated network namespace. Process socket receives data on port 8080.",
        techDetails: "Linux network namespaces, eBPF XDP socket bypass, Linux epoll() event notification."
      },
      {
        step: 7,
        layer: "Database Connection",
        component: "RDS Proxy / PgBouncer -> Aurora PostgreSQL",
        details: "Application checkout worker acquires a pre-warmed connection from the local connection pool, executes parameterized SQL query against PostgreSQL Aurora cluster, and streams 200 OK response back.",
        techDetails: "Connection multiplexing, MVCC read-committed isolation, sub-10ms response."
      }
    ]
  },
  {
    id: "gitops-pipeline",
    title: "Secure Enterprise GitOps Delivery Pipeline",
    subtitle: "End-to-End Software Supply Chain Security from Git Commit to Multi-Cluster Production",
    description: "Architectural blueprint of an automated GitOps release pipeline featuring cryptographic image signing, policy admission control, and canary metric verification.",
    steps: [
      {
        step: 1,
        layer: "Developer Commit",
        component: "Git Feature Branch & Pre-Commit Hooks",
        details: "Developer commits code. Local pre-commit hook runs Gitleaks to block accidentally hardcoded secrets. Branch protection enforces peer approval and passing CI status before merging to main.",
        techDetails: "Git hooks, TruffleHog/Gitleaks secret scanning, branch protection policies."
      },
      {
        step: 2,
        layer: "Continuous Integration",
        component: "GitHub Actions / Azure Pipelines (Ephemeral Runners)",
        details: "Ephemeral runner spins up inside private VPC. Authenticates via OIDC token (no permanent AWS/Azure keys). Runs unit tests, SAST analysis (Semgrep), and compiles optimized multi-stage Docker container.",
        techDetails: "OIDC JWT federation, Docker BuildKit caching, SAST vulnerability gate."
      },
      {
        step: 3,
        layer: "Supply Chain Hardening",
        component: "Trivy Vulnerability Scan & Sigstore Cosign",
        details: "Trivy scans container filesystem for CVEs (fails if CRITICAL > 0). Syft generates machine-readable SBOM. Cosign signs container digest cryptographically and pushes signature to OCI container registry (ECR/ACR).",
        techDetails: "Trivy exit-code gates, Cosign keyless signing via Rekor transparency log, SBOM generation."
      },
      {
        step: 4,
        layer: "GitOps Pull Reconciliation",
        component: "ArgoCD Application Controller",
        details: "Automated PR updates image tag in Git manifest repository. ArgoCD controller inside cluster detects git commit hash change and pulls manifests; compares Desired State vs Live Cluster State.",
        techDetails: "ArgoCD pull-based reconciliation loop, declarative Kustomize overlays."
      },
      {
        step: 5,
        layer: "Admission Verification",
        component: "Kyverno / OPA Gatekeeper Admission Controller",
        details: "API server intercepts pod creation request. Kyverno validates: 1) Container image signature is verified by Cosign, 2) Container runs as non-root (UID 10001), 3) Root filesystem is mounted read-only.",
        techDetails: "Validating webhook admission controller, cryptographically verified provenance."
      },
      {
        step: 6,
        layer: "Progressive Delivery",
        component: "Argo Rollouts Canary & Prometheus Analysis",
        details: "Argo Rollouts routes 10% traffic to canary pods. AnalysisTemplate queries Prometheus every 60s for error rates (< 0.5%) and p99 latency (< 200ms). Upon success, automatically promotes to 100% traffic.",
        techDetails: "Canary traffic splitting via Service Mesh / Ingress, automated metric analysis rollback."
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.ARCHITECTURES_DATA = ARCHITECTURES_DATA;
}
