import argparse
import json
from pathlib import Path

from neuroatlas import NeuroAtlasService


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--benchmark", default="data/benchmark.jsonl")
    args = parser.parse_args()
    service = NeuroAtlasService()
    rows = [
        json.loads(line)
        for line in Path(args.benchmark).read_text(encoding="utf-8-sig").splitlines()
        if line.strip()
    ]
    results = []
    for row in rows:
        answer = service.ask(row["question"])
        predicted = {
            (edge.source, edge.predicate, edge.target)
            for path in answer.paths
            for edge in path.relations
        }
        expected = {tuple(item) for item in row.get("expected_relations", [])}
        results.append(
            {
                "id": row["id"],
                "relation_recall": len(predicted & expected) / len(expected) if expected else None,
                "abstained": answer.abstained,
                "abstention_correct": answer.abstained == row.get("should_abstain", False),
            }
        )
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
