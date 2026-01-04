import React, { useState } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:8000/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          user_token: null // For MVP: no token required
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🎓 EduSphere AI</h1>
          <p className="subtitle">AI-powered orchestration for Google Workspace education tools</p>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label htmlFor="prompt">Enter your request:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a 15-question quiz from chapter 5 physics notes and assign it to my class"
              rows={4}
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading || !prompt.trim()}>
            {loading ? 'Processing...' : 'Orchestrate'}
          </button>
        </form>

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="result">
            <h2>Result</h2>
            <div className="result-section">
              <strong>Status:</strong> {result.success ? '✅ Success' : '❌ Failed'}
            </div>
            <div className="result-section">
              <strong>Message:</strong> {result.message}
            </div>
            
            {result.intent && (
              <div className="result-section">
                <strong>Detected Intent:</strong>
                <ul>
                  <li>Type: {result.intent.intent_type}</li>
                  <li>Source: {result.intent.source}</li>
                  <li>Target: {result.intent.target}</li>
                  {result.intent.num_questions && (
                    <li>Questions: {result.intent.num_questions}</li>
                  )}
                  <li>Confidence: {(result.intent.confidence * 100).toFixed(0)}%</li>
                </ul>
              </div>
            )}

            {result.data && (
              <div className="result-section">
                <strong>Data:</strong>
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
