import hashlib
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


def _build_features(text: str):
    doc = _nlp(text[:3000])
    # Match training exactly: deduplicate, strip, and filter len > 2 (Cell 6 of notebook)
    entities = list({
        ent.text.lower().strip()
        for ent in doc.ents
        if ent.label_ in ["PERSON", "ORG", "GPE", "DATE", "EVENT"]
        and len(ent.text.strip()) > 2
    })

    subgraph_nodes = [e for e in entities if e in _graph]
    num_entities = len(subgraph_nodes)

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
    return combined, entities, {
        "num_entities": num_entities,
        "num_edges": num_edges,
        "avg_degree": round(avg_degree, 4),
        "density": round(density, 4),
        "fake_ratio": round(fake_ratio, 4),
    }


def _resolve_fake_label(classes: list) -> object:
    fake_label = None
    if classes:
        for cls in classes:
            if isinstance(cls, str) and "fake" in cls.lower():
                fake_label = cls
                break
        if fake_label is None and all(
            isinstance(cls, (int, np.integer, float, np.floating)) for cls in classes
        ):
            if 1 in classes:
                fake_label = 1
            else:
                fake_label = max(classes)

    if fake_label is None:
        fake_label = 1

    return fake_label


def _file_sha256(path: Path) -> str | None:
    if not path.exists():
        return None
    digest = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _to_builtin(value):
    if isinstance(value, np.generic):
        return value.item()
    if isinstance(value, list):
        return [_to_builtin(v) for v in value]
    if isinstance(value, dict):
        return {k: _to_builtin(v) for k, v in value.items()}
    return value


def model_metadata() -> dict:
    model_files = {}
    for name in ("tfidf_vectorizer.pkl", "pac_graph_model.pkl", "knowledge_graph.pkl"):
        path = MODELS_DIR / name
        exists = path.exists()
        model_files[name] = {
            "exists": exists,
            "size_bytes": path.stat().st_size if exists else 0,
            "sha256": _file_sha256(path) if exists else None,
        }

    return {
        "models_loaded": _models_loaded,
        "load_error": _load_error,
        "model_class": type(_model).__name__ if _model else None,
        "vectorizer_class": type(_vectorizer).__name__ if _vectorizer else None,
        "classes": _to_builtin(list(getattr(_model, "classes_", []))) if _model else [],
        "model_files": model_files,
    }


def predict(text: str) -> dict:
    if not _models_loaded:
        raise RuntimeError(
            _load_error or "Models are not loaded. Please check the server logs."
        )

    combined, entities, graph_features = _build_features(text)

    prediction = _model.predict(combined)[0]
    decision_score = float(_model.decision_function(combined)[0])

    # Sigmoid to convert raw decision score to a 0–1 confidence value
    confidence = float(1 / (1 + np.exp(-abs(decision_score))))
    classes = list(getattr(_model, "classes_", []))
    fake_label = _resolve_fake_label(classes)
    is_fake = bool(prediction == fake_label)

    return {
        "label": "FAKE NEWS" if is_fake else "REAL NEWS",
        "is_fake": is_fake,
        "confidence": round(confidence, 4),
        "entities_detected": list(set(entities))[:20],
        "graph_features": graph_features,
        "message": (
            "This article shows strong indicators of being fake news."
            if is_fake
            else "This article appears to be legitimate news."
        ),
    }


def debug_predict(text: str) -> dict:
    if not _models_loaded:
        raise RuntimeError(
            _load_error or "Models are not loaded. Please check the server logs."
        )

    combined, entities, graph_features = _build_features(text)
    prediction = _model.predict(combined)[0]
    decision_score = float(_model.decision_function(combined)[0])
    classes = list(getattr(_model, "classes_", []))
    fake_label = _resolve_fake_label(classes)
    is_fake = bool(prediction == fake_label)

    return {
        "prediction_raw": _to_builtin(prediction),
        "decision_score": round(decision_score, 6),
        "classes": _to_builtin(classes),
        "fake_label": _to_builtin(fake_label),
        "is_fake": is_fake,
        "entities_detected": list(set(entities))[:20],
        "graph_features": _to_builtin(graph_features),
    }
