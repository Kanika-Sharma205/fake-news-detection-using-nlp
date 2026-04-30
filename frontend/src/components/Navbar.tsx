export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="FakeGuard AI" className="w-8 h-8" />
          <span className="font-bold text-white text-lg">FakeGuard <span className="text-indigo-400">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#problem" className="hover:text-white transition-colors">Problem</a>
          <a href="#approach" className="hover:text-white transition-colors">Approach</a>
          <a href="#metrics" className="hover:text-white transition-colors">Performance</a>
          <a href="#predict" className="hover:text-white transition-colors">Try It</a>
        </div>
        <a
          href="#predict"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Detect Now
        </a>
      </div>
    </nav>
  )
}
