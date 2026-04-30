const stats = [
  { value: '6B+', label: 'People exposed to fake news daily', icon: '🌐' },
  { value: '70%', label: 'Faster spread than real news on social media', icon: '📱' },
  { value: '$78B', label: 'Annual economic damage from misinformation', icon: '💸' },
  { value: '59%', label: 'Adults struggle to identify fake news', icon: '🎭' },
]

const challenges = [
  {
    title: 'Linguistic Deception',
    description: 'Fake news often mimics the writing style of legitimate journalism, using authoritative language to deceive readers.',
    icon: '✍️',
  },
  {
    title: 'Speed of Spread',
    description: 'Misinformation travels 6x faster than factual news on social media, making manual verification impossible at scale.',
    icon: '⚡',
  },
  {
    title: 'Evolving Tactics',
    description: 'Bad actors constantly adapt their language and narratives, making static rule-based systems quickly obsolete.',
    icon: '🔄',
  },
  {
    title: 'Context Blindness',
    description: 'Simple text models miss relational context — who said what, where, and in connection with which other entities.',
    icon: '🧩',
  },
]

export default function ProblemStatement() {
  return (
    <section id="problem" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">The Challenge</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-6">
            Why Fake News is a
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              Critical Problem
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            The digital age has weaponized misinformation. Distinguishing real news from fabricated narratives
            is one of the most pressing challenges in modern society.
          </p>
        </div>

        {/* Impact stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/8 transition-colors"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs text-slate-400 leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Challenges */}
        <div className="grid md:grid-cols-2 gap-6">
          {challenges.map((c) => (
            <div
              key={c.title}
              className="flex gap-4 bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors"
            >
              <span className="text-3xl flex-shrink-0">{c.icon}</span>
              <div>
                <h3 className="font-bold text-white text-lg mb-2">{c.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
