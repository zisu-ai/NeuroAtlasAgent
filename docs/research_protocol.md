# Research protocol

## Central hypothesis

A schema-constrained, provenance-aware agent pipeline will reduce unsupported anatomical claims relative to direct LLM and retrieval-only baselines, with the largest gains on multi-hop spatial and surgical-corridor questions.

## Scope of the first study

Use one bounded anatomical region (recommended: cerebellopontine angle and retrosigmoid corridor). This makes exhaustive expert annotation feasible and avoids claiming broad neurosurgical competence from a shallow graph.

## Dataset construction

1. Pre-register the ontology and relation vocabulary.
2. Select licensed, citable anatomy sources and record page/figure-level provenance.
3. Have two neurosurgical annotators independently curate entities and relations.
4. Adjudicate disagreements; report Cohen's kappa or Krippendorff's alpha.
5. Split sources, not merely questions, to reduce evidence leakage.
6. Build question strata: one-hop, multi-hop, negative/unanswerable, synonym-heavy, and adversarial false-premise.

The bundled JSON is only a software fixture. It is not study data.

## Comparators

- B0: closed-book LLM prompting.
- B1: text RAG using the same source corpus.
- B2: KG retrieval plus a single LLM prompt.
- NAA: full intent/link/retrieve/verify/respond pipeline.

Use the same base model, temperature, context budget, and source corpus wherever applicable.

## Ablations

- remove claim verification;
- remove provenance from the response context;
- restrict retrieval to one hop;
- replace specialized agents with one monolithic prompt;
- remove abstention instruction.

## Outcomes

Primary: unsupported claim rate and expert-rated anatomical relation correctness.

Secondary: completeness, citation precision/recall, multi-hop accuracy, false-premise rejection, abstention sensitivity/specificity, latency, and token cost.

Report bootstrap 95% confidence intervals and paired tests because systems answer the same questions. Adjust for multiple primary comparisons. Analyze errors by question stratum rather than reporting only a pooled score.

## Minimum credible sample

Run a pilot of 50-100 questions to estimate variance, then conduct a power analysis. A practical full benchmark is likely 300-500 expert-authored questions with at least 20% unanswerable/adversarial items. Claims should remain scoped to the sampled corridor and source set.

## Safety and governance

Do not use patient data in version 1. Do not describe the system as clinical decision support. Require visible source provenance, calibrated abstention, an audit log, and expert review. Any later clinical study needs institutional review, data governance, and prospective validation.

## Publication gates

- G1: ontology and annotation guide frozen;
- G2: inter-annotator agreement acceptable;
- G3: benchmark and analysis plan frozen before final model runs;
- G4: full system significantly improves the primary endpoint over B1 and B2;
- G5: code, non-restricted data, prompts, seeds, and model versions archived.

