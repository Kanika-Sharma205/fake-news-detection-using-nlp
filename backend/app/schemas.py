from pydantic import BaseModel
from typing import List, Optional


class PredictRequest(BaseModel):
    text: str


class GraphFeatures(BaseModel):
    num_entities: int
    num_edges: int
    avg_degree: float
    density: float
    fake_ratio: float


class PredictResponse(BaseModel):
    label: str
    is_fake: bool
    confidence: float
    entities_detected: List[str]
    graph_features: GraphFeatures
    message: str


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    model_type: str


class SampleResponse(BaseModel):
    headline: str
    content: str
    label: str
