import json
import random
from functools import lru_cache
from pathlib import Path

DATA_DIR    = Path(__file__).parent.parent.parent
BUNDLED     = Path(__file__).parent.parent / "data" / "sample_articles.json"


@lru_cache(maxsize=1)
def _load_samples() -> dict[str, list[dict]]:
    """
    Load article pool for the /api/sample endpoint.

    Priority:
      1. Full CSVs (True.csv / Fake.csv at project root) — 500 samples each
      2. Bundled JSON (backend/data/sample_articles.json) — 100 each, always present
    """
    real_csv = DATA_DIR / "True.csv"
    fake_csv = DATA_DIR / "Fake.csv"

    if real_csv.exists() and fake_csv.exists():
        try:
            import pandas as pd
            real_df = pd.read_csv(real_csv, usecols=["title", "text"])
            fake_df = pd.read_csv(fake_csv, usecols=["title", "text"])
            real_df = real_df.dropna(subset=["title", "text"])
            fake_df = fake_df.dropna(subset=["title", "text"])
            real_df = real_df[real_df["text"].str.len() > 80]
            fake_df = fake_df[fake_df["text"].str.len() > 80]
            return {
                "real": real_df.sample(min(500, len(real_df))).to_dict("records"),
                "fake": fake_df.sample(min(500, len(fake_df))).to_dict("records"),
            }
        except Exception:
            pass  # fall through to bundled JSON

    # Always-available fallback: 100 + 100 bundled articles
    with open(BUNDLED) as f:
        return json.load(f)


def get_random_sample(label: str = "random") -> dict:
    """
    label: "real" | "fake" | "random"
    Returns {"headline": str, "content": str, "label": str}
    """
    if label == "random":
        label = random.choice(["real", "fake"])

    pool = _load_samples()
    rows = pool.get(label, [])

    if not rows:
        return {"error": f"No {label} samples available."}

    row = random.choice(rows)
    return {
        "headline": row.get("title", "").strip(),
        "content":  row.get("text",  "").strip()[:1500],
        "label":    label,
    }
