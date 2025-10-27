import { useState, useEffect } from 'react'
import './App.css'

interface HealthResponse {
  status: string
  timestamp: string
  uptime?: number
  memory?: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
    arrayBuffers: number
  }
  version?: string
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHealth()
  }, [])

  const fetchHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/health')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setHealth(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>WhatsApp Gateway Dashboard</h1>
        <p>Laravel-style Routing Pattern - Frontend + Backend in Monorepo</p>
      </header>

      <main>
        <div className="card">
          <h2>API Health Check</h2>
          <button onClick={fetchHealth} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Health'}
          </button>

          {error && (
            <div className="error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {health && !error && (
            <div className="health-info">
              <div className="status-badge status-ok">
                Status: {health.status}
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Timestamp:</span>
                  <span className="value">{new Date(health.timestamp).toLocaleString()}</span>
                </div>
                {health.uptime !== undefined && (
                  <div className="info-item">
                    <span className="label">Uptime:</span>
                    <span className="value">{Math.floor(health.uptime)} seconds</span>
                  </div>
                )}
                {health.version && (
                  <div className="info-item">
                    <span className="label">Node Version:</span>
                    <span className="value">{health.version}</span>
                  </div>
                )}
                {health.memory && (
                  <div className="info-item">
                    <span className="label">Memory (Heap Used):</span>
                    <span className="value">
                      {(health.memory.heapUsed / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Features</h2>
          <ul className="features-list">
            <li>✅ All API routes under <code>/api/*</code></li>
            <li>✅ Frontend served at root and all non-API routes</li>
            <li>✅ History API fallback for SPA routing</li>
            <li>✅ Single server entrypoint</li>
            <li>✅ CORS configured for dev and production</li>
            <li>✅ Security headers (CSP, X-Frame-Options)</li>
            <li>✅ Cache headers for static assets</li>
          </ul>
        </div>

        <div className="card">
          <h2>Routes</h2>
          <div className="routes-info">
            <p><strong>Frontend:</strong> <code>/</code>, <code>/dashboard</code>, etc.</p>
            <p><strong>API:</strong> <code>/api/health</code>, <code>/api/session</code>, <code>/api/message</code>, etc.</p>
          </div>
        </div>
      </main>

      <footer>
        <p>WhatsApp Gateway - Monorepo Architecture</p>
      </footer>
    </div>
  )
}

export default App
