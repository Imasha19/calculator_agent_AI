import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [recommendations, setRecommendations] = useState([]);
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
                    <h3>🤔 Your Question:</h3>
                    <p className="user-question">{question}</p>
                  </div>
                  <div className="answer-section">
                    <h3>📊 Answer:</h3>
                    {answer && (
                      <ul className="answer-list">
                        {answer.split(/\r?\n/).filter(Boolean).map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                      </ul>
                    )}
                    {recommendations.length > 0 && (
                      <div className="recommendations">
                        <h4>🔎 Recommendations</h4>
                        <ul>
                          {recommendations.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
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
                  <div key={index} className="history-card">
                    <div className="history-content">
                      <div className="history-question">
                        <span className="q-label">Q:</span>
                        <span className="question-text">{item.question}</span>
                      </div>
                      <div className="history-answer">
                        <span className="a-label">A:</span>
                        <span className="answer-text">{item.answer}</span>
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