from dataclasses import dataclass, field


@dataclass(frozen=True)
class Entity:
    id: str
    name: str
    type: str
    aliases: tuple[str, ...] = ()


@dataclass(frozen=True)
class Relation:
    source: str
    predicate: str
    target: str
    evidence: tuple[str, ...]
    confidence: float = 1.0


@dataclass(frozen=True)
class Path:
    relations: tuple[Relation, ...]


@dataclass
class Answer:
    question: str
    text: str
    intent: str
    entities: list[str] = field(default_factory=list)
    paths: list[Path] = field(default_factory=list)
    citations: list[str] = field(default_factory=list)
    abstained: bool = False

    def to_dict(self) -> dict:
        return {
            "question": self.question,
            "answer": self.text,
            "intent": self.intent,
            "entities": self.entities,
            "paths": [
                [
                    {
                        "source": edge.source,
                        "predicate": edge.predicate,
                        "target": edge.target,
                        "evidence": list(edge.evidence),
                    }
                    for edge in path.relations
                ]
                for path in self.paths
            ],
            "citations": self.citations,
            "abstained": self.abstained,
        }

