from dataclasses import dataclass

from .graph import AnatomyGraph
from .models import Answer, Entity, Path


INTENT_PREDICATES = {
    "risk": {"at_risk_during", "adjacent_to", "traverses"},
    "exposure": {"exposes", "provides_access_to"},
    "spatial": {"adjacent_to", "anterior_to", "posterior_to", "superior_to", "inferior_to"},
    "general": None,
}


class IntentAgent:
    def classify(self, question: str) -> str:
        text = question.casefold()
        if any(token in text for token in ("risk", "injur", "danger", "at risk")):
            return "risk"
        if any(token in text for token in ("expose", "access", "approach")):
            return "exposure"
        if any(token in text for token in ("where", "relation", "adjacent", "anterior", "posterior")):
            return "spatial"
        return "general"


class EntityLinkingAgent:
    def __init__(self, graph: AnatomyGraph):
        self.graph = graph

    def link(self, question: str) -> list[Entity]:
        return self.graph.link_entities(question)


class RetrievalAgent:
    def __init__(self, graph: AnatomyGraph, max_hops: int = 2):
        self.graph = graph
        self.max_hops = max_hops

    def retrieve(self, entities: list[Entity], intent: str) -> list[Path]:
        predicates = INTENT_PREDICATES[intent]
        return self.graph.paths_from(
            [entity.id for entity in entities], predicates=predicates, max_hops=self.max_hops
        )


class VerificationAgent:
    def verify(self, paths: list[Path]) -> list[Path]:
        return [
            path
            for path in paths
            if path.relations
            and all(edge.evidence and edge.confidence >= 0.5 for edge in path.relations)
        ]


@dataclass
class ResponseAgent:
    graph: AnatomyGraph

    def compose(self, question: str, intent: str, entities: list[Entity], paths: list[Path]) -> Answer:
        if not entities:
            return Answer(
                question=question,
                text="I could not link the question to an entity in the current anatomy graph.",
                intent=intent,
                abstained=True,
            )
        if not paths:
            return Answer(
                question=question,
                text="The current graph has no sufficiently supported relation for this question.",
                intent=intent,
                entities=[entity.id for entity in entities],
                abstained=True,
            )

        statements = []
        citations: set[str] = set()
        seen: set[tuple[str, str, str]] = set()
        for path in paths[:8]:
            edge = path.relations[-1]
            key = (edge.source, edge.predicate, edge.target)
            if key in seen:
                continue
            seen.add(key)
            source = self.graph.entities[edge.source].name
            target = self.graph.entities[edge.target].name
            predicate = edge.predicate.replace("_", " ")
            statements.append(f"{source} {predicate} {target}")
            citations.update(edge.evidence)
        return Answer(
            question=question,
            text="; ".join(statements) + ".",
            intent=intent,
            entities=[entity.id for entity in entities],
            paths=paths[:8],
            citations=sorted(citations),
        )

