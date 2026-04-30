export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img src="/logo.svg" alt="FakeGuard AI" className="w-7 h-7" />
              <span className="font-bold text-white">FakeGuard AI</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              An NLP + Knowledge Graph hybrid model for fake news detection. Built with scikit-learn,
              spaCy, and NetworkX.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Stack</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li>scikit-learn · Passive Aggressive Classifier</li>
              <li>spaCy · Named Entity Recognition</li>
              <li>NetworkX · Knowledge Graph</li>
              <li>FastAPI · Backend API</li>
              <li>React + Vite + Tailwind · Frontend</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Dataset</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li>44,898 labeled news articles</li>
              <li>Fake and Real News Dataset (Kaggle)</li>
              <li>80 / 20 train / test split</li>
              <li>Stratified sampling</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            Built by <span className="text-slate-400">Kanika Sharma</span>
          </p>
          <p className="text-slate-700 text-xs">
            For educational purposes · Not a substitute for professional fact-checking
          </p>
        </div>
      </div>
    </footer>
  )
}
