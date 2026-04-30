import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import type { Metrics, TopEntity } from '../types'

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
    </div>
  )
}

function ModelCard({ model, color }: { model: Metrics['text_only_model']; color: string }) {
  const radarData = [
    { metric: 'Accuracy', value: model.accuracy * 100 },
    { metric: 'Precision\n(Real)', value: model.precision_real * 100 },
    { metric: 'Recall\n(Real)', value: model.recall_real * 100 },
    { metric: 'Precision\n(Fake)', value: model.precision_fake * 100 },
    { metric: 'Recall\n(Fake)', value: model.recall_fake * 100 },
    { metric: 'F1 (Fake)', value: model.f1_fake * 100 },
  ]

  const cm = model.confusion_matrix
  const total = cm.true_positive + cm.true_negative + cm.false_positive + cm.false_negative

  return (
    <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6">
      <h3 className="font-bold text-white text-xl mb-1">{model.name}</h3>
      <p className="text-slate-500 text-sm mb-6">{model.description}</p>

      {/* Accuracy hero */}
      <div className={`text-5xl font-black mb-6 ${color}`}>
        {(model.accuracy * 100).toFixed(2)}%
        <span className="text-sm font-normal text-slate-500 ml-2">accuracy</span>
      </div>

      {/* Radar chart */}
      <div className="h-56 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#ffffff15" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Radar dataKey="value" stroke={color === 'text-blue-400' ? '#60a5fa' : '#818cf8'} fill={color === 'text-blue-400' ? '#3b82f620' : '#6366f120'} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Prec. Real', value: model.precision_real },
          { label: 'Rec. Real', value: model.recall_real },
          { label: 'F1 Real', value: model.f1_real },
          { label: 'Prec. Fake', value: model.precision_fake },
          { label: 'Rec. Fake', value: model.recall_fake },
          { label: 'F1 Fake', value: model.f1_fake },
        ].map((m) => (
          <div key={m.label} className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-white font-bold text-lg">{(m.value * 100).toFixed(1)}%</div>
            <div className="text-slate-500 text-xs">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Confusion matrix */}
      <div className="border border-white/8 rounded-xl p-4">
        <div className="text-xs text-slate-500 mb-3 text-center font-mono uppercase tracking-widest">Confusion Matrix</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-500/15 border border-green-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-black text-green-400">{cm.true_negative.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">True Real</div>
          </div>
          <div className="bg-red-500/15 border border-red-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-black text-red-400">{cm.false_positive.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">False Fake</div>
          </div>
          <div className="bg-orange-500/15 border border-orange-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-black text-orange-400">{cm.false_negative.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">False Real</div>
          </div>
          <div className="bg-green-500/15 border border-green-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-black text-green-400">{cm.true_positive.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">True Fake</div>
          </div>
        </div>
        <div className="text-xs text-slate-600 text-center mt-2">Tested on {total.toLocaleString()} articles</div>
      </div>
    </div>
  )
}

function EntityBar({ entity }: { entity: TopEntity }) {
  const pct = Math.round(entity.fake_ratio * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-right text-sm text-slate-300 font-medium truncate capitalize">{entity.name}</div>
      <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, #22c55e ${100 - pct}%, #ef4444 100%)`,
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-white">
          {pct}% fake
        </span>
      </div>
      <div className="w-20 text-xs text-slate-500 text-right">{(entity.connections / 1000).toFixed(1)}K links</div>
    </div>
  )
}

export default function MetricsDashboard({ metrics }: { metrics: Metrics | null }) {
  const [activeTab, setActiveTab] = useState<'text' | 'graph'>('text')

  if (!metrics) {
    return (
      <section id="metrics" className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center text-slate-500">Loading metrics...</div>
      </section>
    )
  }

  const comparisonData = [
    { name: 'Accuracy', 'Text-Only': metrics.text_only_model.accuracy * 100, 'Graph-Enhanced': metrics.graph_enhanced_model.accuracy * 100 },
    { name: 'F1 (Real)', 'Text-Only': metrics.text_only_model.f1_real * 100, 'Graph-Enhanced': metrics.graph_enhanced_model.f1_real * 100 },
    { name: 'F1 (Fake)', 'Text-Only': metrics.text_only_model.f1_fake * 100, 'Graph-Enhanced': metrics.graph_enhanced_model.f1_fake * 100 },
    { name: 'Prec. Real', 'Text-Only': metrics.text_only_model.precision_real * 100, 'Graph-Enhanced': metrics.graph_enhanced_model.precision_real * 100 },
    { name: 'Prec. Fake', 'Text-Only': metrics.text_only_model.precision_fake * 100, 'Graph-Enhanced': metrics.graph_enhanced_model.precision_fake * 100 },
  ]

  const ds = metrics.dataset
  const kg = metrics.knowledge_graph

  return (
    <section id="metrics" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">Results</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-6">
            Model Performance
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Validation and test metrics from the last training run on {ds.total_articles.toLocaleString()} articles.
          </p>
        </div>

        {/* Dataset overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <MetricCard label="Total Articles" value={ds.total_articles.toLocaleString()} sub="Balanced dataset" />
          <MetricCard label="Training Set" value={ds.train_samples.toLocaleString()} sub="80% split" />
          <MetricCard label="Test Set" value={ds.test_samples.toLocaleString()} sub="20% split" />
          <MetricCard label="TF-IDF Features" value={ds.features_tfidf.toLocaleString()} sub="+5 graph features" />
        </div>

        {/* Comparison bar chart */}
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 mb-10">
          <h3 className="font-bold text-white text-lg mb-6">Side-by-Side Model Comparison</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[88, 101]} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ background: '#1e1e2e', border: '1px solid #ffffff20', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(v: number) => [`${v.toFixed(2)}%`]}
                />
                <Bar dataKey="Text-Only" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Graph-Enhanced" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 justify-center mt-4">
            <div className="flex items-center gap-2 text-sm text-slate-400"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Text-Only PAC</div>
            <div className="flex items-center gap-2 text-sm text-slate-400"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Graph-Enhanced PAC</div>
          </div>
        </div>

        {/* Individual model deep-dives */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'text' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            Text-Only Model
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'graph' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            Graph-Enhanced Model
          </button>
        </div>

        {activeTab === 'text' ? (
          <ModelCard model={metrics.text_only_model} color="text-blue-400" />
        ) : (
          <ModelCard model={metrics.graph_enhanced_model} color="text-indigo-400" />
        )}

        {/* Knowledge graph stats */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white text-lg mb-2">Knowledge Graph Statistics</h3>
            <p className="text-slate-500 text-sm mb-6">Entity co-occurrence graph built from the training corpus</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-purple-400">{(kg.total_nodes / 1000).toFixed(0)}K</div>
                <div className="text-slate-500 text-sm">Unique Entities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-400">{(kg.total_edges / 1_000_000).toFixed(1)}M</div>
                <div className="text-slate-500 text-sm">Co-occurrence Edges</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-400">{kg.avg_entities_per_article}</div>
                <div className="text-slate-500 text-sm">Avg Entities / Article</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-400">{kg.entity_types.length}</div>
                <div className="text-slate-500 text-sm">Entity Types</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {kg.entity_types.map((t) => (
                <span key={t} className="px-3 py-1 bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs rounded-full">{t}</span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white text-lg mb-2">Top Entities by Connectivity</h3>
            <p className="text-slate-500 text-sm mb-5">Bar shows fake news ratio — green = real-leaning, red = fake-leaning</p>
            <div className="space-y-3">
              {kg.top_entities.map((e) => (
                <EntityBar key={e.name} entity={e} />
              ))}
            </div>
          </div>
        </div>

        {/* Visualization images */}
        <div className="mt-10">
          <h3 className="font-bold text-white text-lg mb-6 text-center">Training Visualizations</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
              <img src="/images/accuracy_comparison.png" alt="Accuracy Comparison" className="w-full object-cover" />
              <div className="p-4 text-sm text-slate-400 text-center">Accuracy comparison between models</div>
            </div>
            <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
              <img src="/images/confusion_matrix_comparison.png" alt="Confusion Matrices" className="w-full object-cover" />
              <div className="p-4 text-sm text-slate-400 text-center">Confusion matrices for both models</div>
            </div>
          </div>
          <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden mt-6">
            <img src="/images/entity_graph_comparison.png" alt="Knowledge Graph Visualization" className="w-full object-cover max-h-96 object-top" />
            <div className="p-4 text-sm text-slate-400 text-center">Entity knowledge graph — blue nodes = real-leaning, red nodes = fake-leaning</div>
          </div>
        </div>
      </div>
    </section>
  )
}
