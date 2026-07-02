from pathlib import Path

from .agents import EntityLinkingAgent, IntentAgent, ResponseAgent, RetrievalAgent, VerificationAgent
from .graph import AnatomyGraph
from .models import Answer


DEFAULT_GRAPH = Path(__file__).resolve().parents[2] / "data" / "seed_graph.json"


class NeuroAtlasService:
    def __init__(self, graph_path: str | Path = DEFAULT_GRAPH, max_hops: int = 2):
        self.graph = AnatomyGraph.from_json(graph_path)
        self.intent_agent = IntentAgent()
        self.entity_agent = EntityLinkingAgent(self.graph)
        self.retrieval_agent = RetrievalAgent(self.graph, max_hops=max_hops)
        self.verification_agent = VerificationAgent()
        self.response_agent = ResponseAgent(self.graph)

    def ask(self, question: str) -> Answer:
        intent = self.intent_agent.classify(question)
        entities = self.entity_agent.link(question)
        paths = self.retrieval_agent.retrieve(entities, intent)
        verified = self.verification_agent.verify(paths)
        return self.response_agent.compose(question, intent, entities, verified)

