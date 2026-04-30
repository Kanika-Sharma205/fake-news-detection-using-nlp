const pipeline = [
  {
    step: '01',
    title: 'Data Ingestion',
    description: '44,898 labeled news articles — 23,481 fake and 21,417 real — sourced from a curated Kaggle dataset. Articles include title, body text, subject, and date.',
    color: 'from-blue-500 to-cyan-500',
    icon: '📥',
    detail: '80/20 stratified train/test split',
  },
  {
    step: '02',
    title: 'TF-IDF Vectorization',
    description: 'Text is transformed into a 50,000-dimensional sparse feature vector. Terms appearing in more than 70% of documents are ignored to reduce noise. Bigrams are included.',
    color: 'from-violet-500 to-purple-500',
    icon: '🔢',
    detail: 'max_features=50,000 · max_df=0.7',
  },
  {
    step: '03',
    title: 'Named Entity Recognition',
    description: "spaCy's en_core_web_sm model extracts PERSON, ORG, GPE, DATE, and EVENT entities from each article. Average of 19.3 entities per article are identified.",
    color: 'from-emerald-500 to-teal-500',
    icon: '🏷️',
    detail: '5 entity types · spaCy NER',
  },
  {
    step: '04',
    title: 'Knowledge Graph Construction',
    description: 'Entities become nodes. When two entities co-occur in an article, an edge is created between them. Each node tracks how often it appears in fake vs. real articles.',
    color: 'from-orange-500 to-amber-500',
    icon: '🕸️',
    detail: '127,994 nodes · 4.3M edges',
  },
  {
    step: '05',
    title: 'Graph Feature Extraction',
    description: 'For each article, 5 structural features are computed from its entity subgraph: entity count, edge count, average node degree, subgraph density, and fake/real entity ratio.',
    color: 'from-pink-500 to-rose-500',
    icon: '📊',
    detail: '5 graph features per article',
  },
  {
    step: '06',
    title: 'Feature Fusion & Classification',
    description: 'TF-IDF (50,000 dims) and graph features (5 dims) are horizontally stacked. A Passive Aggressive Classifier is trained on this combined representation.',
    color: 'from-indigo-500 to-blue-500',
    icon: '🤖',
    detail: 'PAC · max_iter=50 · 95.91% accuracy',
  },
]

const models = [
  {
    name: 'Text-Only Baseline',
    accuracy: '99.48%',
    description: 'TF-IDF + PAC. Excellent accuracy through pure text analysis. Fast, lightweight, and highly effective on this dataset.',
    pro: 'Highest accuracy',
    con: 'No entity context',
    color: 'border-blue-500/30 bg-blue-500/5',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  {
    name: 'Graph-Enhanced Model',
    accuracy: '95.91%',
    description: 'TF-IDF + Knowledge Graph + PAC. Slightly lower accuracy but reveals entity-level patterns and provides interpretable signals.',
    pro: 'Interpretable & context-aware',
    con: 'Slower inference',
    color: 'border-indigo-500/30 bg-indigo-500/5',
    badge: 'bg-indigo-500/20 text-indigo-300',
    deployed: true,
  },
]

export default function ModelApproach() {
  return (
    <section id="approach" className="py-24 px-6 bg-white/2">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">Our Solution</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-6">
            How the Model
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Works
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A six-stage pipeline that fuses classical NLP with graph-based entity reasoning for robust,
            interpretable fake news classification.
          </p>
        </div>

        {/* Pipeline steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {pipeline.map((step) => (
            <div
              key={step.step}
              className="relative bg-gray-900/60 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all group"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} mb-4 text-xl`}>
                {step.icon}
              </div>
              <div className="text-xs text-slate-600 font-mono mb-1">STEP {step.step}</div>
              <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{step.description}</p>
              <div className="text-xs text-slate-500 font-mono border-t border-white/5 pt-3">
                {step.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Model comparison */}
        <div>
          <h3 className="text-2xl font-bold text-white text-center mb-8">Two Model Variants</h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {models.map((model) => (
              <div key={model.name} className={`border rounded-2xl p-6 ${model.color} relative`}>
                {model.deployed && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                    Deployed
                  </div>
                )}
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${model.badge}`}>
                  {model.accuracy} Accuracy
                </div>
                <h4 className="text-white font-bold text-lg mb-2">{model.name}</h4>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">{model.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <span>✓</span> {model.pro}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>–</span> {model.con}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
