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

  const askAgent = async () => {
    if (!question.trim()) {
      setError("Please enter a question first!");
      return;
    }

    setLoading(true);
    setError("");
    setShowBreakdown(false); // Close breakdown when asking new question
    
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
      // Parse recommendations if present
      if (data.answer && data.answer.includes('\n\nRecommendations:\n')) {
        const parts = data.answer.split('\n\nRecommendations:\n');
        setAnswer(parts[0]);
        const recLines = parts[1].split(/\n+/).map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
        setRecommendations(recLines);
      } else {
        setAnswer(data.answer);
        setRecommendations([]);
      }
      
      // Add to history
      setHistory(prev => [
        { question, answer: data.answer, timestamp: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4) // Keep only last 5 items
      ]);
    } catch (err) {
      setError(`Failed to get answer: ${err.message}`);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Ask using a provided example immediately (sets question and sends request)
  const askExample = async (exampleQuestion) => {
    setQuestion(exampleQuestion);
    setLoading(true);
    setError("");
    setShowBreakdown(false); // Close breakdown when asking new question

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

  // Load history item and display its answer
  const loadHistoryItem = (item) => {
    console.log("Loading history item:", item); // Debug
    setQuestion(item.question);
    setShowBreakdown(false); // Close breakdown when loading history
    setError("");
    
    // Parse the full answer to extract recommendations if present
    const fullAnswer = item.answer;
    if (fullAnswer && fullAnswer.includes('\n\nRecommendations:\n')) {
      const parts = fullAnswer.split('\n\nRecommendations:\n');
      const answerPart = parts[0]; // Just the answer without recommendations
      const recPart = parts[1]; // The recommendations section
      
      setAnswer(answerPart);
      const recLines = recPart.split(/\n+/).map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
      setRecommendations(recLines);
      console.log("Parsed answer:", answerPart); // Debug
      console.log("Parsed recommendations:", recLines); // Debug
    } else {
      setAnswer(fullAnswer);
      setRecommendations([]);
      console.log("No recommendations found, full answer:", fullAnswer); // Debug
    }
  };

  // Request step-by-step breakdown and related calculations
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

  // Function to format answer lines with proper styling
  const formatAnswerLine = (line) => {
    // Check if line contains mathematical operations
    if (line.includes('=') || line.includes('+') || line.includes('-') || 
        line.includes('*') || line.includes('/') || line.includes('^')) {
      return <span className="math-expression">{line}</span>;
    }
    // Check if line is a header or important point
    if (line.endsWith(':') || line.includes('➜') || line.includes('▶')) {
      return <span className="answer-header">{line}</span>;
    }
    return line;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🤖 Agentic Calculator</h1>
          <p className="subtitle">Ask anything. The AI agent will calculate automatically if needed.</p>
        </div>
      </header>

      <main className="app-main">
        <div className="content-wrapper">
          <div className="input-section">
            <div className="input-group">
              <input
                type="text"
                placeholder="Ask me anything like 'What is 15% of 200?' or 'Calculate 5^3'..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                autoFocus
              />
              
              <div className="button-group">
                <button 
                  onClick={askAgent} 
                  disabled={loading || !question.trim()}
                  className="ask-button primary-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Thinking...
                    </>
                  ) : "Ask Agent"}
                </button>
                
                <button 
                  onClick={() => setQuestion("")}
                  disabled={loading}
                  className="clear-button secondary-btn"
                >
                  Clear
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {answer && (
              <div className="result-section">
                <div className="result-card">
                  <div className="result-header">
                    <div className="question-icon">❓</div>
                    <div>
                      <h3>Your Question</h3>
                      <p className="user-question">{question}</p>
                    </div>
                  </div>
                  
                  <div className="answer-display">
                    <div className="answer-header">
                      <div className="answer-icon">💡</div>
                      <h3>Answer</h3>
                    </div>
                    
                    <div className="answer-content">
                      {answer.split(/\r?\n/).filter(Boolean).map((line, idx) => (
                        <div key={idx} className="answer-line">
                          <div className="line-number">{idx + 1}</div>
                          <div className="line-content">
                            {formatAnswerLine(line)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {recommendations.length > 0 && (
                      <div className="recommendations-section">
                        <div className="recommendations-header">
                          <div className="recommendations-icon">✨</div>
                          <h3>Recommendations</h3>
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
                              style={rec.toLowerCase().includes('step-by-step') || rec.toLowerCase().includes('breakdown') ? { cursor: 'pointer' } : {}}
                            >
                              <div className="recommendation-number">{i + 1}</div>
                              <div className="recommendation-content">
                                <span className="recommendation-icon">✓</span>
                                {rec}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="answer-footer">
                      <div className="stats">
                        <span className="stat-item">
                          <span className="stat-icon">📝</span>
                          {answer.split(/\r?\n/).filter(Boolean).length} lines
                        </span>
                        <span className="stat-item">
                          <span className="stat-icon">⏱️</span>
                          Generated just now
                        </span>
                      </div>
                    </div>

                    {showBreakdown && breakdown && (
                      <div className="breakdown-section">
                        <div className="breakdown-header">
                          <div className="breakdown-icon">📊</div>
                          <h3>Step-by-Step Breakdown & Related Calculations</h3>
                          <button 
                            onClick={() => setShowBreakdown(false)}
                            className="close-breakdown"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="breakdown-content">
                          {breakdown.split(/\r?\n/).filter(Boolean).map((line, idx) => (
                            <div key={idx} className="breakdown-line">
                              <div className="breakdown-bullet">→</div>
                              <div className="breakdown-text">
                                {line}
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

            <div className="examples-section">
              <h4>💡 Try asking:</h4>
              <div className="example-tags">
                <span onClick={() => askExample("What is 25 * 4 + 18?")}>25 * 4 + 18</span>
                <span onClick={() => askExample("Calculate 15% of 300")}>15% of 300</span>
                <span onClick={() => askExample("How much is 2^10?")}>2^10</span>
                <span onClick={() => askExample("Solve: (15 + 7) * 3")}>(15 + 7) * 3</span>
              </div>
            </div>
          </div>

          {history.length > 0 && (
            <div className="history-section">
              <div className="history-header">
                <h3>📚 Recent Questions</h3>
                <button onClick={clearHistory} className="clear-history-btn tertiary-btn">
                  Clear History
                </button>
              </div>
              <div className="history-list">
                {history.map((item, index) => (
                  <div 
                    key={index} 
                    className="history-card"
                    onClick={() => loadHistoryItem(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="history-content">
                      <div className="history-question">
                        <span className="q-label">Q:</span>
                        <span className="question-text">{item.question}</span>
                      </div>
                      <div className="history-answer">
                        <span className="a-label">A:</span>
                        <span className="answer-text">
                          {item.answer.split('\n\nRecommendations:\n')[0]}
                        </span>
                      </div>
                    </div>
                    <div className="history-time">
                      <span className="time-icon">🕒</span>
                      {item.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;