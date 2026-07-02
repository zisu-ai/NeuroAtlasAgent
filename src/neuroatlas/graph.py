import json
from collections import defaultdict, deque
from pathlib import Path

from .models import Entity, Path as GraphPath, Relation

SYMMETRIC_PREDICATES = {"adjacent_to"}


class AnatomyGraph:
    def __init__(self, entities: list[Entity], relations: list[Relation]):
        self.entities = {entity.id: entity for entity in entities}
        self.relations = relations
        self._adjacency: dict[str, list[Relation]] = defaultdict(list)
        for relation in relations:
            if relation.source not in self.entities or relation.target not in self.entities:
                raise ValueError(f"Relation references unknown entity: {relation}")
            if not relation.evidence:
                raise ValueError(f"Relation lacks provenance: {relation}")
            self._adjacency[relation.source].append(relation)
            if relation.predicate in SYMMETRIC_PREDICATES:
                self._adjacency[relation.target].append(
                    Relation(
                        source=relation.target,
                        predicate=relation.predicate,
                        target=relation.source,
                        evidence=relation.evidence,
                        confidence=relation.confidence,
                    )
                )

    @classmethod
    def from_json(cls, path: str | Path) -> "AnatomyGraph":
        raw = json.loads(Path(path).read_text(encoding="utf-8"))
        entities = [
            Entity(
                id=item["id"],
                name=item["name"],
                type=item["type"],
                aliases=tuple(item.get("aliases", [])),
            )
            for item in raw["entities"]
        ]
        relations = [
            Relation(
                source=item["source"],
                predicate=item["predicate"],
                target=item["target"],
                evidence=tuple(item["evidence"]),
                confidence=float(item.get("confidence", 1.0)),
            )
            for item in raw["relations"]
        ]
        return cls(entities, relations)

    def link_entities(self, text: str) -> list[Entity]:
        normalized = text.casefold()
        matches = []
        for entity in self.entities.values():
            labels = (entity.name, *entity.aliases)
            if any(label.casefold() in normalized for label in labels):
                matches.append(entity)
        return sorted(matches, key=lambda entity: (-len(entity.name), entity.id))

    def paths_from(
        self,
        start_ids: list[str],
        predicates: set[str] | None = None,
        max_hops: int = 2,
    ) -> list[GraphPath]:
        results: list[GraphPath] = []
        queue = deque((node, tuple(), frozenset({node})) for node in start_ids)
        while queue:
            node, prefix, visited = queue.popleft()
            if len(prefix) >= max_hops:
                continue
            for edge in self._adjacency.get(node, []):
                if edge.target in visited:
                    continue
                candidate = (*prefix, edge)
                if predicates is None or edge.predicate in predicates:
                    results.append(GraphPath(candidate))
                queue.append((edge.target, candidate, visited | {edge.target}))
        return results
