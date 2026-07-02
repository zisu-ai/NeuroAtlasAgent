from neuroatlas import NeuroAtlasService


def test_supported_question_returns_cited_graph_path():
    answer = NeuroAtlasService().ask("What does the retrosigmoid approach expose?")
    assert not answer.abstained
    assert "cerebellopontine angle" in answer.text
    assert answer.citations


def test_unknown_question_abstains():
    answer = NeuroAtlasService().ask("What is the safe drilling distance in millimeters?")
    assert answer.abstained
    assert not answer.paths

