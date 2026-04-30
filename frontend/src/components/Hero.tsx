export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          NLP + Knowledge Graph Hybrid Model
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
          Detect Fake News
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            with AI Precision
          </span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A hybrid machine learning system combining <strong className="text-slate-200">TF-IDF text analysis</strong> with
          a <strong className="text-slate-200">Named Entity Knowledge Graph</strong> to classify news articles with
          up to <strong className="text-indigo-300">99.48% accuracy</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#predict"
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-500/25"
          >
            Try the Detector →
          </a>
          <a
            href="#approach"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl border border-white/10 transition-all"
          >
            How It Works
          </a>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-6 mt-20 max-w-2xl mx-auto">
          {[
            { value: '44,898', label: 'Training Articles' },
            { value: '99.48%', label: 'Peak Accuracy' },
            { value: '128K', label: 'Graph Entities' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-white">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
      </div>
    </section>
  )
}
