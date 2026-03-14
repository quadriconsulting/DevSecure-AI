# DevSecure SAST Engine (v4.0)

## Facts
- AI-powered hybrid router system with CCN-aware detection
- Low complexity (CCN ≤ 15): OpenGrep/Semgrep deterministic pattern matching
- High complexity (CCN > 15): Qwen3-Coder LLM deep semantic analysis
- Primary model: Qwen3-Coder serves as code reasoning and patch-generation engine
- L1 Execution Plane: Security Router v2.0 (Go-based) handles file ingestion and scanner orchestration
- L2 Classification Plane: Qwen2.5-Coder-1.5B (Advisory SLM) for CWE identification with JSON Schema guardrails
- L3 Control Plane: 26-dimensional complexity vector for remediation lane routing (L1-L4)
- Supports 50+ languages including JavaScript, TypeScript, Python, Java, C#, Go, Ruby, PHP, Kotlin, Swift, Rust
- Fail-closed architecture: uncertain outputs default to manual review
- False positive reduction via reachability analysis and confidence scoring (Team/Enterprise)
- Integration: CI/CD pipeline checks, IDE real-time linting, SCM inline PR comments

## Q&A

### Q: How does DevSecure's SAST work?
**A:** DevSecure uses CCN-aware hybrid routing: low-complexity code (CCN ≤ 15) routes to OpenGrep/Semgrep for fast deterministic scanning, while high-complexity code (CCN > 15) routes to Qwen3-Coder LLM for deep semantic analysis. This balances speed, coverage, and precision. (Source: devsecure_sast_engine.md)

### Q: What is CCN-aware detection?
**A:** CCN (Cyclomatic Complexity Number) measures code branching density. DevSecure's router evaluates each file's CCN: simple logic uses pattern matching (fast), complex logic uses LLM reasoning (accurate). This prevents both false negatives in complex code and performance waste on simple patterns. (Source: devsecure_sast_engine.md)

### Q: What languages does SAST support?
**A:** DevSecure SAST supports 50+ languages including JavaScript, TypeScript, Python, Java, C#, Go, Ruby, PHP, Kotlin, Swift, Rust, Scala, Objective-C, C, C++, and more. Language detection is automatic via Security Router v2.0. (Source: devsecure_sast_engine.md)

### Q: How does CWE classification work?
**A:** The L2 Classification Plane uses Qwen2.5-Coder-1.5B to identify CWE IDs from vulnerability context. Outputs are JSON Schema-validated with confidence scores (0-100). Low-confidence findings (<60%) are flagged for review. This provides 3-tier CWE resolution: coarse → specific → variant. (Source: devsecure_sast_engine.md)

### Q: What are the remediation lanes (L1-L4)?
**A:** L1 (Trivial): Single-line fixes, minimal context. L2 (Localized): Single-file changes. L3 (Multi-File): Cross-module dataflow. L4 (Manual): High-risk/semantics-heavy requiring human review. Routing is driven by a 26-dimensional complexity vector including dataflow complexity, blast radius, test coverage. (Source: devsecure_sast_engine.md)

### Q: How does DevSecure reduce false positives?
**A:** Reachability filtering (Team/Enterprise) suppresses unreachable code paths. Confidence thresholds flag findings below 60% for review. Historical learning via FreshFix pipeline mines verified fixes to tune detection. This reduces false positive rate from 60-80% (legacy SAST) to 20-30%. (Source: devsecure_sast_engine.md)

### Q: Can SAST block CI/CD pipelines?
**A:** Yes, CI/CD integration can fail builds on Critical/High findings (configurable). Scan modes: Full scan for main branch, Incremental scan for PRs (faster). Admins configure fail thresholds per project. (Source: devsecure_sast_engine.md)

### Q: What is Security Router v2.0?
**A:** The L1 Execution Plane component written in Go that handles file ingestion, multi-heuristic language identification, and dispatches to appropriate scanners (OpenGrep/Semgrep or Qwen3-Coder) via RabbitMQ based on CCN evaluation. (Source: devsecure_sast_engine.md)

### Q: Does SAST provide real-time IDE feedback?
**A:** Yes, IDE plugins (VSCode, IntelliJ) provide as-you-type SAST linting with inline code actions for auto-remediation. Available in Developer tier and above. (Source: devsecure_sast_engine.md)

## Immutable Links
- SAST Documentation: https://docs.devsecure.com/sast
- Supported Languages: https://docs.devsecure.com/sast/languages
- CWE Database: https://docs.devsecure.com/sast/cwe-mapping