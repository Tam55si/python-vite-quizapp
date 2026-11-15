import { useState, useEffect } from 'react';

function App() {
  const [name, setName] = useState('');
  const [nameEntered, setNameEntered] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [submitted, setSubmitted] = useState(false);

  // Fetch the full question bank on load
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/questions')
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(err => console.error("Backend not running:", err));
  }, []);

  // Timer logic: Only runs when a domain is selected and quiz isn't submitted
  useEffect(() => {
    if (selectedDomain && timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && selectedDomain && !submitted) {
      handleSubmit();
    }
  }, [selectedDomain, timeLeft, submitted]);

  // Extract unique domains from the fetched JSON
  const availableDomains = [...new Set(questions.map(q => q.domain))].sort();
  
  // Filter questions only for the active domain
  const activeQuestions = questions.filter(q => q.domain === selectedDomain);

  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
    setAnswers({});
    setTimeLeft(3600); // Reset timer to 1 hr
    setSubmitted(false);
  };

  const handleGoBack = () => {
    setSelectedDomain(null);
    setAnswers({});
    setTimeLeft(3600); // Reset timer if they back out
    setSubmitted(false);
  };

  const handleOptionChange = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let score = 0;
    
    // Generate results ONLY for the active domain
    const resultsHtml = `
      <html>
      <head><title>Results: ${selectedDomain}</title></head>
      <body style="font-family: sans-serif; padding: 20px;">
        <h2>Name: ${name}</h2>
        <h3>Domain: ${selectedDomain}</h3>
        <p>Time remaining upon submission: ${formatTime(timeLeft)}</p>
        <hr/>
        ${activeQuestions.map((q, index) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.answer;
          if (isCorrect) score++;
          
          return `
            <div style="margin-bottom: 20px;">
              <p><strong>${index + 1}. ${q.question}</strong></p>
              <p>Your Answer: ${userAnswer || '<i>Not answered</i>'}</p>
              <p style="color: ${isCorrect ? 'green' : 'red'}; font-weight: bold;">
                ${isCorrect ? 'Correct' : `Incorrect (Correct Answer: ${q.answer})`}
              </p>
            </div>
          `;
        }).join('')}
      </body>
      </html>
    `;

    const newTab = window.open();
    newTab.document.write(resultsHtml);
    newTab.document.close();

    // Send domain data to backend log
    fetch('http://127.0.0.1:8000/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        domain: selectedDomain, 
        score, 
        total: activeQuestions.length 
      })
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Screen 1: Name Entry
  if (!nameEntered) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h2>Candidate Login</h2>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter your name" 
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <br/><br/>
        <button onClick={() => { if(name.trim()) setNameEntered(true) }} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Continue to Domains
        </button>
      </div>
    );
  }

  // Screen 2: Domain Selection
  if (nameEntered && !selectedDomain) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h2>Select an Exam Domain</h2>
        <p>Clicking a domain will immediately start your 1-hour timer.</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {availableDomains.map(domain => (
            <button 
              key={domain} 
              onClick={() => handleDomainSelect(domain)} 
              style={{ padding: '15px 25px', fontSize: '16px', cursor: 'pointer', background: '#eee', border: '1px solid #ccc', borderRadius: '5px' }}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Screen 3: Post-Submit
  if (submitted) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h2>Quiz submitted!</h2>
        <p>Your detailed results for <strong>{selectedDomain}</strong> are in the newly opened tab.</p>
        <button onClick={handleGoBack} style={{ padding: '10px 20px', fontSize: '16px', marginTop: '20px', cursor: 'pointer' }}>
          Start Another Domain
        </button>
      </div>
    );
  }

  // Screen 4: Active Quiz
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ position: 'sticky', top: 0, background: '#fff', padding: '10px 0', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>{selectedDomain}</h2>
          <h3 style={{ margin: '5px 0 0 0', color: '#d9534f' }}>Time Left: {formatTime(timeLeft)}</h3>
        </div>
        <button onClick={handleGoBack} style={{ padding: '8px 15px', cursor: 'pointer' }}>
          Cancel & Return to Domains
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        {activeQuestions.map((q, index) => (
          <div key={q.id} style={{ marginBottom: '30px' }}>
            <p><strong>{index + 1}. {q.question}</strong></p>
            {q.options.map(opt => (
              <label key={opt} style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name={`question-${q.id}`} 
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => handleOptionChange(q.id, opt)}
                  style={{ marginRight: '10px' }}
                />
                {opt}
              </label>
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} style={{ padding: '10px 20px', fontSize: '16px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Submit Quiz
      </button>
    </div>
  );
}

export default App;