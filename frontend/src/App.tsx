import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProblemStatement from './components/ProblemStatement'
import ModelApproach from './components/ModelApproach'
import MetricsDashboard from './components/MetricsDashboard'
import PredictionForm from './components/PredictionForm'
import Footer from './components/Footer'
import type { Metrics } from './types'

export default function App() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  useEffect(() => {
    fetch('/api/metrics')
      .then((r) => r.json())
      .then(setMetrics)
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100">
      <Navbar />
      <Hero />
      <ProblemStatement />
      <ModelApproach />
      <MetricsDashboard metrics={metrics} />
      <PredictionForm />
      <Footer />
    </div>
  )
}
