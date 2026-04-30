import { useState } from 'react'
import type { PredictResponse, SampleResponse } from '../types'

function GraphFeatureRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-mono">
          {value % 1 !== 0 ? value.toFixed(4) : value}
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

type SampleLoading = 'real' | 'fake' | 'random' | null

export default function PredictionForm() {
  const [headline, setHeadline] = useState('')
  const [content, setContent]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [sampleLoading, setSampleLoading] = useState<SampleLoading>(null)
  const [result, setResult]     = useState<PredictResponse | null>(null)
  const [error, setError]       = useState<string | null>(null)

  const combinedText = [headline.trim(), content.trim()].filter(Boolean).join(' ')
  const canSubmit    = combinedText.length >= 20

  async function fetchSample(type: 'real' | 'fake' | 'random') {
    setSampleLoading(type)
    setResult(null)
    setError(null)
    try {
      const res = await fetch(`/api/sample?type=${type}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Could not load sample.')
      }
      const data: SampleResponse = await res.json()
      setHeadline(data.headline)
      setContent(data.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sample.')
    } finally {
      setSampleLoading(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: combinedText }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Prediction failed.')
      }
      setResult(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setHeadline('')
    setContent('')
    setResult(null)
    setError(null)
  }

  const isFake     = result?.is_fake
  const confidence = result ? Math.round(result.confidence * 100) : 0
  const anyLoading = loading || sampleLoading !== null

  return (
    <section id="predict" className="py-24 px-6 bg-white/2">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
            Live Demo
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
            Try the Detector
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Enter a headline and article body — or pull a random article straight from our
            44,898-article dataset.
          </p>
        </div>

        <div className="bg-gray-900/70 border border-white/10 rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Sample buttons row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 mr-1">Load from dataset:</span>

              {/* Real article */}
              <button
                type="button"
                disabled={anyLoading}
                onClick={() => fetchSample('real')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-500/15 border border-green-500/25 text-green-400 rounded-lg hover:bg-green-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {sampleLoading === 'real' ? (
                  <span className="w-3 h-3 border border-green-400/40 border-t-green-400 rounded-full animate-spin" />
                ) : (
                  <span>🟢</span>
                )}
                Real article
              </button>

              {/* Fake article */}
              <button
                type="button"
                disabled={anyLoading}
                onClick={() => fetchSample('fake')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/15 border border-red-500/25 text-red-400 rounded-lg hover:bg-red-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {sampleLoading === 'fake' ? (
                  <span className="w-3 h-3 border border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                ) : (
                  <span>🔴</span>
                )}
                Fake article
              </button>

              {/* Generate random testcase */}
              <button
                type="button"
                disabled={anyLoading}
                onClick={() => fetchSample('random')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 rounded-lg hover:bg-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {sampleLoading === 'random' ? (
                  <span className="w-3 h-3 border border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
                ) : (
                  <span>🎲</span>
                )}
                Generate New Testcase
              </button>

              {/* Clear */}
              {(headline || content) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear ✕
                </button>
              )}
            </div>

            {/* Headline */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Headline / Title
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => { setHeadline(e.target.value); setResult(null) }}
                placeholder="e.g. Federal Reserve holds interest rates steady…"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {/* Article body */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Article Body
                </label>
                <span className="text-xs text-slate-600 font-mono">{content.length} chars</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => { setContent(e.target.value); setResult(null) }}
                placeholder="Paste the article body here… (headline alone works if it's 20+ characters)"
                rows={7}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all leading-relaxed"
              />
            </div>

            {combinedText.length > 0 && combinedText.length < 20 && (
              <p className="text-xs text-amber-400/80">
                Need at least 20 characters total ({combinedText.length} so far).
              </p>
            )}

            <button
              type="submit"
              disabled={anyLoading || !canSubmit}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing article…
                </span>
              ) : (
                'Analyse Article →'
              )}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
              ⚠ {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div
              className={`mt-8 border rounded-2xl overflow-hidden ${
                isFake ? 'border-red-500/30' : 'border-green-500/30'
              }`}
            >
              {/* Verdict banner */}
              <div className={`px-6 py-5 flex items-center justify-between ${isFake ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{isFake ? '🔴' : '🟢'}</span>
                  <div>
                    <div className={`text-2xl font-black ${isFake ? 'text-red-400' : 'text-green-400'}`}>
                      {result.label}
                    </div>
                    <div className="text-slate-400 text-sm mt-0.5">{result.message}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-black ${isFake ? 'text-red-400' : 'text-green-400'}`}>
                    {confidence}%
                  </div>
                  <div className="text-slate-500 text-xs">confidence</div>
                </div>
              </div>

              {/* Analysed text preview */}
              {(headline || content) && (
                <div className="px-6 pt-4 pb-3 border-b border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
                    Analysed text
                  </p>
                  {headline && (
                    <p className="text-sm text-slate-300 font-medium mb-1">"{headline}"</p>
                  )}
                  {content && (
                    <p className="text-xs text-slate-500 line-clamp-2">{content}</p>
                  )}
                </div>
              )}

              {/* Details grid */}
              <div className="p-6 grid md:grid-cols-2 gap-6">
                {/* Graph features */}
                <div>
                  <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                    Graph Features
                  </h4>
                  <div className="space-y-4">
                    <GraphFeatureRow label="Entities Detected"    value={result.graph_features.num_entities} max={50} />
                    <GraphFeatureRow label="Co-occurrence Edges"  value={result.graph_features.num_edges}    max={500} />
                    <GraphFeatureRow label="Avg Node Degree"      value={result.graph_features.avg_degree}   max={50} />
                    <GraphFeatureRow label="Subgraph Density"     value={result.graph_features.density}      max={1} />
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Entity Fake Ratio</span>
                        <span className="text-slate-300 font-mono">
                          {result.graph_features.fake_ratio.toFixed(4)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${result.graph_features.fake_ratio * 100}%`,
                            background: 'linear-gradient(90deg, #22c55e, #ef4444)',
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1 text-slate-600">
                        <span>real-leaning</span>
                        <span>fake-leaning</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Entities */}
                <div>
                  <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                    Detected Entities ({result.entities_detected.length})
                  </h4>
                  {result.entities_detected.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.entities_detected.map((e) => (
                        <span
                          key={e}
                          className="px-3 py-1 bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs rounded-full capitalize"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">
                      No named entities found. Classification relied entirely on TF-IDF text features.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          This model was trained on a specific dataset and may not generalise to all news sources.
          Use as a supplementary tool, not a sole source of truth.
        </p>
      </div>
    </section>
  )
}
