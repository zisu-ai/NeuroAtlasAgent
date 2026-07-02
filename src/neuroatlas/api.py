from fastapi import FastAPI
from pydantic import BaseModel, Field

from .service import NeuroAtlasService

app = FastAPI(title="NeuroAtlasAgent", version="0.1.0")
service = NeuroAtlasService()


class Question(BaseModel):
    question: str = Field(min_length=3, max_length=1000)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ask")
def ask(payload: Question) -> dict:
    return service.ask(payload.question).to_dict()

