import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [breakdown, setBreakdown] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const askAgent = async () => {
    if (!question.trim()) {
      setError("Please enter a question first!");
      return;
    }

    setLoading(true);
    setIsProcessing(true);
    setError("");
    setShowBreakdown(false);
    
    try {
      const res = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      if (data.answer && data.answer.includes('\n\nRecommendations:\n')) {
        const parts = data.answer.split('\n\nRecommendations:\n');
        setAnswer(parts[0]);
        const recLines = parts[1].split(/\n+/).map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
        setRecommendations(recLines);
      } else {
        setAnswer(data.answer);
        setRecommendations([]);
      }
      
      setHistory(prev => [
        { question, answer: data.answer, timestamp: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4)
      ]);
    } catch (err) {
      setError(`Failed to get answer: ${err.message}`);
      console.error("Error:", err);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const askExample = async (exampleQuestion) => {
    setQuestion(exampleQuestion);
    setLoading(true);
    setIsProcessing(true);
    setError("");
    setShowBreakdown(false);

    try {
      const res = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: exampleQuestion }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      if (data.answer && data.answer.includes('\n\nRecommendations:\n')) {
        const parts = data.answer.split('\n\nRecommendations:\n');
        setAnswer(parts[0]);
        const recLines = parts[1].split(/\n+/).map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
        setRecommendations(recLines);
      } else {
        setAnswer(data.answer);
        setRecommendations([]);
      }
      setHistory((prev) => [
        { question: exampleQuestion, answer: data.answer, timestamp: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setError(`Failed to get answer: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      askAgent();
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const loadHistoryItem = (item) => {
    setQuestion(item.question);
    setShowBreakdown(false);
    setError("");
    
    const fullAnswer = item.answer;
    if (fullAnswer && fullAnswer.includes('\n\nRecommendations:\n')) {
      const parts = fullAnswer.split('\n\nRecommendations:\n');
      const answerPart = parts[0];
      const recPart = parts[1];
      
      setAnswer(answerPart);
      const recLines = recPart.split(/\n+/).map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
      setRecommendations(recLines);
    } else {
      setAnswer(fullAnswer);
      setRecommendations([]);
    }
  };

  const askForBreakdown = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError("");
    setShowBreakdown(true);

    try {
      const res = await fetch("http://localhost:5000/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setBreakdown(data.breakdown || "No breakdown available.");
    } catch (err) {
      setError(`Failed to get breakdown: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatAnswerLine = (line) => {
    let cleaned = line;
    // remove LaTeX/math delimiters and common formatting artifacts
    cleaned = cleaned.replace(/\\\[|\\\]|\$\$|\$/g, '');
    cleaned = cleaned.replace(/\\boxed\{/g, '').replace(/\}/g, '');
    cleaned = cleaned.replace(/\\begin\{[^}]*\}/g, '').replace(/\\end\{[^}]*\}/g, '');
    cleaned = cleaned.replace(/\\\(/g, '').replace(/\\\)/g, '');
    cleaned = cleaned.replace(/\{/g, '').replace(/\}/g, '');
    cleaned = cleaned.replace(/\*\*/g, '');
    // remove any leftover backslashes (escape characters) so they don't render
    cleaned = cleaned.replace(/\\/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    const isHeader = /^(Step|Final|Result|Answer|Solution|Calculation|Problem|Expression|Step-by-Step)/.test(line) || line.endsWith(':');
    const isMath = line.includes('=') || (line.includes('^') && /\d/.test(line));
    
    return <span className={isHeader ? 'answer-header' : isMath ? 'math-expression' : ''}>{cleaned}</span>;
  };

  return (
    <div className="app-container">
      {/* Animated Background Elements */}
      <div className="bg-animation">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>
      
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-icon">🧮</div>
            <h1>Agentic Calculator</h1>
            <div className="logo-subtitle">
              AI-Powered Calculations Made Simple
            </div>
          </div>
          <p className="subtitle">
            Ask anything mathematical. The AI agent will calculate automatically with step-by-step explanations.
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="content-wrapper">
          {/* Left Column - Input & Results */}
          <div className="main-content">
            {/* Input Section */}
            <div className="input-section glass-card">
              <div className="input-header">
                <h2><span className="input-icon">✏️</span> Enter Your Calculation</h2>
                <div className="input-stats">
                  <span className="stat-tag">AI-Powered</span>
                  <span className="stat-tag">Instant Results</span>
                </div>
              </div>
              
              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="What would you like to calculate? Try '15% of 200' or 'Solve 2x + 5 = 15'..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="modern-input"
                    autoFocus
                  />
                  <div className="input-decoration">
                    <div className="input-line"></div>
                  </div>
                </div>
                
                <div className="button-group">
                  <button 
                    onClick={askAgent} 
                    disabled={loading || !question.trim()}
                    className={`ask-button primary-btn ${isProcessing ? 'processing' : ''}`}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">🚀</span>
                        Calculate Now
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setQuestion("")}
                    disabled={loading}
                    className="clear-button secondary-btn"
                  >
                    <span className="btn-icon">🗑️</span>
                    Clear
                  </button>
                </div>
              </div>

              {/* Quick Examples */}
              <div className="quick-examples">
                <div className="examples-header">
                  <span className="examples-icon">⚡</span>
                  <h4>Quick Examples</h4>
                </div>
                <div className="example-tags">
                  {["25 × 4 + 18", "15% of 300", "2^10", "(15 + 7) × 3"].map((example, idx) => (
                    <div 
                      key={idx} 
                      className="example-tag"
                      onClick={() => askExample(example)}
                    >
                      <span className="example-icon">🔍</span>
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-card slide-in">
                <div className="error-icon">⚠️</div>
                <div className="error-content">
                  <h4>Oops!</h4>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Results Section */}
            {answer && (
              <div className="result-section slide-in">
                <div className="result-card glass-card">
                  {/* Question Display */}
                  <div className="question-display">
                    <div className="question-header">
                      <div className="question-icon-bg">
                        <span className="question-icon">❓</span>
                      </div>
                      <div className="question-content">
                        <h3>Your Question</h3>
                        <p className="user-question">{question}</p>
                      </div>
                    </div>
                  </div>

                  {/* Answer Display */}
                  <div className="answer-display">
                    <div className="answer-header">
                      <div className="answer-icon-bg">
                        <span className="answer-icon">💡</span>
                      </div>
                      <div className="answer-title">
                        <h3>AI Calculation Result</h3>
                        <div className="answer-badge">
                          <span className="badge-dot"></span>
                          Verified Calculation
                        </div>
                      </div>
                    </div>
                    
                    {/* Answer Content */}
                    <div className="answer-content">
                      {(() => {
                        // Preprocess and clean lines, then remove consecutive duplicates
                        const rawLines = answer.split(/\r?\n/).filter(Boolean);
                        const cleanedLines = rawLines.map((line) =>
                          line
                            .replace(/\\\\\[|\\\\\]|\$\$|\$/g, '')
                            .replace(/\\boxed\{/g, '').replace(/\}/g, '')
                            .replace(/\\begin\{[^}]*\}/g, '').replace(/\\end\{[^}]*\}/g, '')
                            .replace(/\\\\\(/g, '').replace(/\\\\\)/g, '')
                            .replace(/\{/g, '')
                            .replace(/\*\*/g, '')
                            .replace(/\\\\/g, '')
                            .replace(/\s+/g, ' ')
                            .trim()
                        ).filter(Boolean);

                        const deduped = cleanedLines.filter((ln, i) => i === 0 || ln !== cleanedLines[i - 1]);

                        return deduped.map((cleanedLine, idx) => {
                          const isHeader = /^(Step|Final|Result|Answer|Solution|Calculation|Problem|Expression|Step-by-Step)/.test(cleanedLine) || cleanedLine.endsWith(':');
                          const isMath = cleanedLine.includes('=') || (cleanedLine.includes('^') && /\d/.test(cleanedLine));
                          const isFinal = /Final (Answer|Result)/i.test(cleanedLine);

                          return (
                            <div 
                              key={idx} 
                              className={`answer-line ${isHeader ? 'answer-header-line' : ''} ${isMath ? 'math-line' : ''} ${isFinal ? 'final-result' : ''}`}
                            >
                              {isHeader && <div className="line-number">Step {idx + 1}</div>}
                              <div className="line-content">
                                {formatAnswerLine(cleanedLine)}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                      <div className="recommendations-section">
                        <div className="section-header">
                          <div className="section-icon">✨</div>
                          <h3>AI Recommendations</h3>
                        </div>
                        <div className="recommendations-grid">
                          {recommendations.map((rec, i) => (
                            <div 
                              key={i} 
                              className="recommendation-card"
                              onClick={() => {
                                if (rec.toLowerCase().includes('step-by-step') || rec.toLowerCase().includes('breakdown')) {
                                  askForBreakdown();
                                }
                              }}
                            >
                              <div className="recommendation-number">{i + 1}</div>
                              <div className="recommendation-content">
                                <div className="recommendation-text">{rec}</div>
                                {(rec.toLowerCase().includes('step-by-step') || rec.toLowerCase().includes('breakdown')) && (
                                  <span className="recommendation-hint">Click to view</span>
                                )}
                              </div>
                              <div className="recommendation-arrow">→</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="action-buttons">
                      <button 
                        onClick={askForBreakdown}
                        className="breakdown-btn tertiary-btn"
                        disabled={loading}
                      >
                        <span className="btn-icon">📊</span>
                        View Detailed Breakdown
                      </button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(answer);
                        }}
                        className="copy-btn tertiary-btn"
                      >
                        <span className="btn-icon">📋</span>
                        Copy Answer
                      </button>
                    </div>

                    {/* Breakdown Section */}
                    {showBreakdown && breakdown && (
                      <div className="breakdown-section slide-in">
                        <div className="section-header">
                          <div className="section-icon">📈</div>
                          <div className="section-title">
                            <h3>Step-by-Step Breakdown</h3>
                            <p className="section-subtitle">Detailed calculation process</p>
                          </div>
                          <button 
                            onClick={() => setShowBreakdown(false)}
                            className="close-btn"
                          >
                            ×
                          </button>
                        </div>
                        <div className="breakdown-content">
                          {breakdown.split(/\r?\n/).filter(Boolean).map((line, idx) => (
                            <div key={idx} className="breakdown-step">
                              <div className="step-number">{idx + 1}</div>
                              <div className="step-content">
                                <div className="step-text">{line}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - History */}
          <div className="sidebar">
            <div className="history-section glass-card">
              <div className="section-header">
                <div className="section-icon">📚</div>
                <div className="section-title">
                  <h3>Calculation History</h3>
                  <p className="section-subtitle">Recent calculations</p>
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory} 
                    className="clear-history-btn"
                    title="Clear all history"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {history.length > 0 ? (
                <div className="history-list">
                  {history.map((item, index) => (
                    <div 
                      key={index} 
                      className="history-item"
                      onClick={() => loadHistoryItem(item)}
                    >
                      <div className="history-item-header">
                        <div className="history-icon">🧮</div>
                        <div className="history-time">
                          <span className="time-icon">🕒</span>
                          {item.timestamp}
                        </div>
                      </div>
                      <div className="history-question">
                        {item.question.length > 40 ? `${item.question.substring(0, 40)}...` : item.question}
                      </div>
                      <div className="history-answer-preview">
                        {item.answer.split('\n')[0]}
                      </div>
                      <div className="history-actions">
                        <span className="history-action">Click to load →</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h4>No History Yet</h4>
                  <p>Your calculations will appear here</p>
                </div>
              )}
            </div>

            {/* Stats Card */}
            <div className="stats-card glass-card">
              <div className="section-header">
                <div className="section-icon">📊</div>
                <h3>Statistics</h3>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{history.length}</div>
                  <div className="stat-label">Total Calculations</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {history.length > 0 ? Math.floor(history.reduce((acc, item) => acc + item.answer.length, 0) / history.length) : 0}
                  </div>
                  <div className="stat-label">Avg. Answer Length</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>Agentic Calculator v1.0 • AI-Powered Mathematical Assistant</p>
          <div className="footer-links">
            <span>Powered by React & Node.js</span>
            <span className="footer-divider">•</span>
            <span>Made with ❤️ for calculations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;