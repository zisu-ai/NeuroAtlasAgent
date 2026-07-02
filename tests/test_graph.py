from neuroatlas.graph import AnatomyGraph
from neuroatlas.service import DEFAULT_GRAPH


def test_graph_loads_and_every_edge_has_evidence():
    graph = AnatomyGraph.from_json(DEFAULT_GRAPH)
    assert graph.entities
    assert all(edge.evidence for edge in graph.relations)


def test_entity_linking_supports_aliases():
    graph = AnatomyGraph.from_json(DEFAULT_GRAPH)
    assert graph.link_entities("Where is AICA?")[0].id == "artery:aica"


def test_symmetric_relations_are_traversable_in_both_directions():
    graph = AnatomyGraph.from_json(DEFAULT_GRAPH)
    paths = graph.paths_from(["nerve:cn7_8"], predicates={"adjacent_to"}, max_hops=1)
    assert {path.relations[0].target for path in paths} == {
        "artery:aica",
        "structure:flocculus",
    }
