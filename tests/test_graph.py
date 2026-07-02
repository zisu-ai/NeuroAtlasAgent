from neuroatlas.graph import AnatomyGraph
from neuroatlas.service import DEFAULT_GRAPH


def test_graph_loads_and_every_edge_has_evidence():
    graph = AnatomyGraph.from_json(DEFAULT_GRAPH)
    assert graph.entities
    assert all(edge.evidence for edge in graph.relations)


def test_entity_linking_supports_aliases():
    graph = AnatomyGraph.from_json(DEFAULT_GRAPH)
    assert graph.link_entities("Where is AICA?")[0].id == "artery:aica"

