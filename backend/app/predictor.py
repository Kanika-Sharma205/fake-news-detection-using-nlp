import pickle
import numpy as np
from pathlib import Path
from scipy.sparse import hstack

MODELS_DIR = Path(__file__).parent.parent.parent / "models"

_vectorizer = None
_model = None
_graph = None
_nlp = None
_models_loaded = False
_load_error: str | None = None


def load_models():
    global _vectorizer, _model, _graph, _nlp, _models_loaded, _load_error

    missing = [
        name for name in ("tfidf_vectorizer.pkl", "pac_graph_model.pkl", "knowledge_graph.pkl")
        if not (MODELS_DIR / name).exists()
    ]
    if missing:
        _load_error = (
            f"Model files not found in {MODELS_DIR}: {', '.join(missing)}. "
            "Run the training notebook to generate them."
        )
        print(f"WARNING: {_load_error}")
        return

    try:
        import spacy
        _nlp = spacy.load("en_core_web_sm")

        with open(MODELS_DIR / "tfidf_vectorizer.pkl", "rb") as f:
            _vectorizer = pickle.load(f)

        with open(MODELS_DIR / "pac_graph_model.pkl", "rb") as f:
            _model = pickle.load(f)

        with open(MODELS_DIR / "knowledge_graph.pkl", "rb") as f:
            _graph = pickle.load(f)

        _models_loaded = True
        print("Models loaded successfully.")
    except Exception as exc:
        _load_error = str(exc)
        print(f"ERROR loading models: {exc}")


def models_loaded() -> bool:
    return _models_loaded


def load_error() -> str | None:
    return _load_error


def predict(text: str) -> dict:
    if not _models_loaded:
        raise RuntimeError(
            _load_error or "Models are not loaded. Please check the server logs."
        )

    doc = _nlp(text[:3000])
    entities = [
        ent.text.lower()
        for ent in doc.ents
        if ent.label_ in ["PERSON", "ORG", "GPE", "DATE", "EVENT"]
    ]

    subgraph_nodes = [e for e in entities if e in _graph]
    num_entities = len(entities)

    if subgraph_nodes:
        import networkx as nx
        subgraph = _graph.subgraph(subgraph_nodes)
        num_edges = subgraph.number_of_edges()
        degrees = [d for _, d in subgraph.degree()]
        avg_degree = float(np.mean(degrees)) if degrees else 0.0
        density = float(nx.density(subgraph))

        fake_ratios = []
        for node in subgraph_nodes:
            node_data = _graph.nodes[node]
            total = node_data.get("fake_count", 0) + node_data.get("real_count", 0)
            if total > 0:
                fake_ratios.append(node_data.get("fake_count", 0) / total)
        fake_ratio = float(np.mean(fake_ratios)) if fake_ratios else 0.5
    else:
        num_edges = 0
        avg_degree = 0.0
        density = 0.0
        fake_ratio = 0.5

    graph_features = np.array([[num_entities, num_edges, avg_degree, density, fake_ratio]])
    tfidf_features = _vectorizer.transform([text])
    combined = hstack([tfidf_features, graph_features])

    prediction = _model.predict(combined)[0]
    decision_score = float(_model.decision_function(combined)[0])

    # Sigmoid to convert raw decision score to a 0–1 confidence value
    confidence = float(1 / (1 + np.exp(-abs(decision_score))))
    is_fake = bool(prediction == 1)

    return {
        "label": "FAKE NEWS" if is_fake else "REAL NEWS",
        "is_fake": is_fake,
        "confidence": round(confidence, 4),
        "entities_detected": list(set(entities))[:20],
        "graph_features": {
            "num_entities": num_entities,
            "num_edges": num_edges,
            "avg_degree": round(avg_degree, 4),
            "density": round(density, 4),
            "fake_ratio": round(fake_ratio, 4),
        },
        "message": (
            "This article shows strong indicators of being fake news."
            if is_fake
            else "This article appears to be legitimate news."
        ),
    }
