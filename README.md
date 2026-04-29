# 🕵️ Fake News Detection with Knowledge Graph-Enhanced NLP

> A hybrid machine learning pipeline that combines **TF-IDF text features** with a **Named Entity Knowledge Graph** to detect fake news articles — built using a Passive Aggressive Classifier (PAC).

**Author:** Kanika Sharma

---

## 📌 Overview

This project implements two variants of a fake news detector and compares their performance:

| Model | Approach | Accuracy |
|-------|----------|----------|
| **Text-only PAC** | TF-IDF features → Passive Aggressive Classifier | **99.48%** |
| **Graph-enhanced PAC** | TF-IDF + Knowledge Graph entity features → PAC | **95.91%** |

The graph-enhanced model enriches text features with structural signals extracted from a **co-occurrence knowledge graph** built from named entities (people, organisations, locations, dates, events) across the entire dataset.

---

## 📁 Project Structure

```
FAKE_NEWS_DETECTION/
├── models/
│   ├── knowledge_graph.pkl       # Serialised NetworkX entity graph
│   ├── pac_graph_model.pkl       # Trained Graph-enhanced PAC
│   └── tfidf_vectorizer.pkl      # Fitted TF-IDF vectoriser
├── Fake_News_Detection.ipynb     # Main notebook (end-to-end pipeline)
├── Fake.csv                      # Fake news articles (Kaggle dataset)
├── True.csv                      # Real news articles (Kaggle dataset)
├── accuracy_comparison.png       # Bar chart: model accuracy comparison
├── confusion_matrix_comparison.png
└── entity_graph_comparison.png   # Knowledge graph subgraphs (FAKE vs REAL)
```

---

## 🔧 How It Works

### Phase 1 — Text-only Baseline
1. **Data preparation** — Fake and real articles are labelled (1 / 0), merged, and the title + body are concatenated into a single `content` field.
2. **TF-IDF vectorisation** — Top 50,000 unigrams/bigrams are extracted (stopwords removed, `max_df=0.7`).
3. **Passive Aggressive Classifier** — Trained on 80% of the data; evaluated on the remaining 20%.

### Phase 2 — Knowledge Graph Enhancement
1. **Named Entity Recognition** — spaCy (`en_core_web_sm`) extracts `PERSON`, `ORG`, `GPE`, `DATE`, and `EVENT` entities from every article.
2. **Graph construction** — A weighted NetworkX graph is built where nodes are entities and edges represent co-occurrence within the same article. Each node stores `fake_count` and `real_count` to track which class it appears in more often.
3. **Graph feature extraction** — For each article's entity subgraph, 5 features are computed:
   - Number of recognised entities
   - Number of co-occurrence edges
   - Average node degree
   - Subgraph density
   - Mean fake/real ratio of entities
4. **Combined classifier** — TF-IDF features and graph features are horizontally stacked (`scipy.sparse.hstack`) and fed to a second PAC.

---

## 📊 Results

### Model Accuracy Comparison
![Accuracy Comparison](accuracy_comparison.png)

### Confusion Matrices
![Confusion Matrix Comparison](confusion_matrix_comparison.png)

The text-only model achieves near-perfect accuracy on this dataset. The graph-enhanced variant trades a small drop in accuracy for richer interpretability — the knowledge graph visually reveals *which entities* are statistically associated with fake vs. real news.

### Knowledge Graph — Entity Subgraphs
![Entity Graph Comparison](entity_graph_comparison.png)

Node colour encodes the fake/real ratio: **red nodes** tend to appear in fake news; **green nodes** tend to appear in real news. The graph clearly captures entity-level signals invisible to pure text models.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- A virtual environment (recommended)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Kanika-Sharma205/fake-news-detection-using-nlp.git
cd fake-news-detection

# 2A. Create and activate a virtual environment [ For Linux ]
python -m venv ml_env
source ml_env/bin/activate      # Windows: ml_env\Scripts\activate

# 2B. Create and activate a virtual environment [ For Windows ]
python -m venv ml_env
ml_env\Scripts\activate

# 3. Install dependencies
pip install pandas numpy spacy networkx matplotlib scipy scikit-learn kaggle

# 4. Download the spaCy English model
python -m spacy download en_core_web_sm
```

### Dataset Setup (Kaggle API)

```bash
# One-time setup: place your kaggle.json API token
mkdir -p ~/.kaggle
cp ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

The notebook's **Cell 3** will automatically download and extract `Fake.csv` and `True.csv` from the [Fake and Real News Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset) on Kaggle.

### Run the Notebook

```bash
jupyter notebook Fake_News_Detection.ipynb
```

Run cells in order (Cell 0 → Cell 13). Cell 14 can be used in a **fresh session** to reload saved models without retraining.

---

## 🔮 Predicting on New Articles

After training (or reloading with Cell 14), call `predict_article()` with any text:

```python
predict_article(
    "NASA confirms discovery of water ice on the Moon's south pole, "
    "opening new possibilities for future lunar missions and human settlement."
)
# → REAL NEWS 🟢

predict_article(
    "Obama secretly signed a deal to hand over the US military to the "
    "United Nations in a shocking midnight ceremony last Tuesday."
)
# → FAKE NEWS 🔴
```

---

## 💾 Saved Model Components

Three artefacts are saved to the `models/` folder (Cell 13):

| File | Description |
|------|-------------|
| `pac_graph_model.pkl` | Trained Passive Aggressive Classifier (graph-enhanced) |
| `tfidf_vectorizer.pkl` | Fitted TF-IDF vectoriser (50,000 features) |
| `knowledge_graph.pkl` | NetworkX entity co-occurrence graph with fake/real counts |

---

## 🛠️ Tech Stack

| Library | Purpose |
|---------|---------|
| `scikit-learn` | TF-IDF vectorisation, PAC, metrics |
| `spaCy` | Named Entity Recognition (`en_core_web_sm`) |
| `NetworkX` | Knowledge graph construction and analysis |
| `scipy` | Sparse matrix operations (`hstack`) |
| `pandas / numpy` | Data manipulation |
| `matplotlib` | Visualisation |

---

## 📈 Dataset

- **Source:** [Fake and Real News Dataset — Kaggle](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset)
- **Size:** ~44,000 articles (balanced between fake and real)
- **Split:** 80% training / 20% testing (stratified)

---

## 📄 License

This project is released for educational and research purposes.

---

*Made with ❤️ by Kanika Sharma*
