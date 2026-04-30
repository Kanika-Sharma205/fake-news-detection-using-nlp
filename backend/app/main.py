import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .predictor import load_models, models_loaded, load_error, predict
from .sampler import get_random_sample
from .schemas import HealthResponse, PredictRequest, PredictResponse, GraphFeatures, SampleResponse

METRICS_PATH = Path(__file__).parent.parent / "metrics" / "model_metrics.json"


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    yield


app = FastAPI(
    title="Fake News Detection API",
    description="API for detecting fake news using TF-IDF + Knowledge Graph + Passive Aggressive Classifier",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok" if models_loaded() else "models_unavailable",
        models_loaded=models_loaded(),
        model_type="TF-IDF + Knowledge Graph + Passive Aggressive Classifier",
    )


@app.get("/api/metrics")
def get_metrics():
    with open(METRICS_PATH, "r") as f:
        return json.load(f)


@app.get("/api/sample", response_model=SampleResponse)
def get_sample(type: str = "random"):
    if type not in ("real", "fake", "random"):
        raise HTTPException(status_code=400, detail="type must be 'real', 'fake', or 'random'")
    result = get_random_sample(type)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return SampleResponse(**result)


@app.post("/api/predict", response_model=PredictResponse)
def predict_article(request: PredictRequest):
    if not request.text or len(request.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Please provide at least 20 characters of text.")

    if not models_loaded():
        err = load_error() or "Models are not loaded. Run the training notebook first."
        raise HTTPException(status_code=503, detail=err)

    result = predict(request.text)
    return PredictResponse(
        label=result["label"],
        is_fake=result["is_fake"],
        confidence=result["confidence"],
        entities_detected=result["entities_detected"],
        graph_features=GraphFeatures(**result["graph_features"]),
        message=result["message"],
    )
