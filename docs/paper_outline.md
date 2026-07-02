# Proposed paper outline

## Working title

**NeuroAtlasAgent: Provenance-Aware Knowledge-Graph Agents for Reducing Hallucinations in Neurosurgical Anatomy Question Answering**

## Claimed contributions (only after validation)

1. A provenance-aware ontology and expert-curated benchmark for a bounded neurosurgical corridor.
2. An agent workflow that constrains natural-language answers to verified graph paths and explicitly abstains outside graph support.
3. A controlled comparison against direct prompting, text RAG, and KG-only reasoning, including component ablations and expert error analysis.

## Structure synthesized from the reference papers

### Abstract

Clinical-domain motivation; hallucination problem; method; benchmark; primary quantitative result; scoped conclusion.

### 1. Introduction

Why physical/anatomical relations challenge LLMs; why text retrieval alone may not enforce relational consistency; research question; contributions.

### 2. Related Work

LLM hallucination in medicine; biomedical/anatomical knowledge graphs; agentic RAG; graph-grounded reasoning; surgical anatomy QA.

### 3. NeuroAtlasAgent

Ontology and provenance model; agent roles; graph traversal; conflict checking; claim verification; abstention; audit trail.

### 4. Dataset and Experimental Setup

Sources and licensing; expert annotation; benchmark construction; baselines; ablations; metrics; statistical analysis; implementation details.

### 5. Results

Main comparison; per-stratum results; ablation table; calibration/cost analysis; qualitative graph-path examples.

### 6. Discussion

Why graph constraints help or fail; implications for physical-world grounding; generalizability beyond one corridor; workflow limitations.

### 7. Limitations, Safety, and Ethics

Graph incompleteness; source disagreement; base-model dependence; non-clinical status; expert oversight.

### 8. Conclusion

One restrained paragraph tied directly to measured outcomes.

### Appendices

Ontology, prompts, annotation guide, benchmark templates, extended results, failure cases, and reproducibility checklist.

## Positioning note

The paper should not “imitate” wording or claims from KARMA, AGENTiGraph, or GraphAgents. It can reuse the broad scientific rhythm—problem, framework, controlled evaluation, ablation, limitations—while presenting original methods, data, figures, and prose.

