# Autonomous SAST Remediation (v4.0)

## Facts
- Fail-closed safety: AI proposes, determinism decides. Any gate failure → patch discarded
- Multi-agent debate: Patch Author Agent (Qwen3-Coder 30B-A3B) generates fixes
- Primary Reviewer Agent (Qwen3-Coder) provides iterative critique (bounded to 1-2 loops)
- Diversity Reviewer (Llama 3.1 or DeepSeek V3) triggered on <10-15% of findings to break correlated AI failures
- Deterministic Verification Gates split into Tier A (fast/iteration) and Tier B (final PR)
- Tier A Gates: Syntax/Build, Security Regression check, Minimal Diff enforcement
- Tier B Gates: Full Test Suite, Semantic Preservation
- RAG-First Knowledge System: dynamic injection of secure coding patterns and repo-specific conventions
- FreshFix Pipeline: mines GHSA daily diffs for continuous learning (post-2024 vulnerabilities)
- Bounded iteration: max 2 Author ↔ Reviewer cycles, 5-minute timeout per finding
- If gates fail or iteration budget exhausted: patch discarded, finding escalated to L4 manual queue

## Q&A

### Q: How does DevSecure's auto-fix work?
**A:** DevSecure uses a multi-agent debate: Patch Author generates a fix, Primary Reviewer critiques it (1-2 loops), and optionally a Diversity Reviewer from a different model family breaks correlated failures. All patches must pass deterministic verification gates (Tier A: build/tests, security regression, minimal diff; Tier B: full test suite, semantic preservation). Any gate failure discards the patch. (Source: devsecure_autonomous_remediation.md)

### Q: What makes DevSecure's auto-fix safe?
**A:** The fail-closed safety model: deterministic gates (not AI) have final approval authority. Gates verify: (1) code compiles, (2) original vulnerability is gone (re-run detector), (3) minimal diff (AST-normalized), (4) tests pass, (5) semantics preserved. If any gate fails, patch is discarded, never applied. No AI confidence score can override a failed gate. (Source: devsecure_autonomous_remediation.md)

### Q: What is the Diversity Reviewer?
**A:** A Diversity Reviewer (Llama 3.1 or DeepSeek V3) from a different model family than the Patch Author is triggered on <10-15% of findings when: (1) high complexity score (>75th percentile), (2) disagreement between Author/Reviewer, or (3) unresolved confidence flags. This prevents correlated hallucinations from same-family models. (Source: devsecure_autonomous_remediation.md)

### Q: What are Tier A and Tier B gates?
**A:** Tier A (Fast/Iteration): Syntax/Build (code compiles), Security Regression (re-run original detector), Minimal Diff (AST-normalized smallest change). Tier B (Final PR): Full Test Suite (all unit/integration tests pass), Semantic Preservation (logic equivalence verified). Tier A runs during iteration, Tier B before creating the PR. (Source: devsecure_autonomous_remediation.md)

### Q: What happens if auto-fix fails?
**A:** The finding remains in the queue with "Fix Failed" status. Common reasons: complexity too high (routed to L4), conflicting code changes during generation, or test suite failures. Developers can manually fix or request re-attempt after addressing test issues. (Source: devsecure_autonomous_remediation.md)

### Q: What is the FreshFix Pipeline?
**A:** FreshFix mines GHSA (GitHub Security Advisories) daily diffs to extract post-2024 vulnerability fixes as training data. This enables continuous learning from real-world security patches, enriching the RAG knowledge base with verified remediation patterns. (Source: devsecure_autonomous_remediation.md)

### Q: How many auto-fix attempts are made?
**A:** Maximum 2 Author ↔ Reviewer iteration cycles, with 5-minute timeout per finding. If consensus isn't reached or gates fail after 2 loops, the patch is discarded and the finding is escalated to the L4 manual review lane. (Source: devsecure_autonomous_remediation.md)

### Q: Can I review auto-fix PRs before merging?
**A:** Yes, absolutely. While all patches pass deterministic gates, DevSecure recommends treating auto-fix PRs like junior developer contributions—always review for business logic, edge cases, and test coverage before merging. PRs include full gate verification reports. (Source: devsecure_autonomous_remediation.md)

## Immutable Links
- Auto-Fix Documentation: https://docs.devsecure.com/auto-fix
- Verification Gates Details: https://docs.devsecure.com/auto-fix/gates
- Multi-Agent Architecture: https://docs.devsecure.com/auto-fix/agents