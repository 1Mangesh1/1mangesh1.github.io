class TypingTest {
  constructor(container) {
    this.container = container || document.getElementById('typing-test-game');
    this.codeSnippets = [
      {
        language: 'JavaScript',
        code: 'const sum = (a, b) => a + b;'
      },
      {
        language: 'JavaScript',
        code: 'function greet(name) { return `Hello, ${name}!`; }'
      },
      {
        language: 'Python',
        code: 'def fibonacci(n): return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)'
      },
      {
        language: 'JavaScript',
        code: 'const arr = [1, 2, 3].map(x => x * 2);'
      },
      {
        language: 'TypeScript',
        code: 'interface User { name: string; age: number; }'
      },
      {
        language: 'Python',
        code: 'squares = [x**2 for x in range(10)]'
      },
      {
        language: 'JavaScript',
        code: 'async function fetchData() { return await fetch(url); }'
      },
      {
        language: 'SQL',
        code: 'SELECT * FROM users WHERE age > 18 ORDER BY name;'
      },
      {
        language: 'CSS',
        code: '.container { display: flex; justify-content: center; }'
      },
      {
        language: 'HTML',
        code: '<button onclick="handleClick()">Click me</button>'
      },
      {
        language: 'JavaScript',
        code: 'const { name, age } = person;'
      },
      {
        language: 'Python',
        code: 'with open("file.txt", "r") as f: content = f.read()'
      },
      {
        language: 'JavaScript',
        code: 'arr.filter(x => x > 5).reduce((a, b) => a + b, 0)'
      },
      {
        language: 'TypeScript',
        code: 'type Status = "pending" | "success" | "error";'
      },
      {
        language: 'Bash',
        code: 'find . -name "*.js" | xargs grep "TODO"'
      },
      {
        language: 'JavaScript',
        code: 'localStorage.setItem("key", JSON.stringify(data));'
      },
      {
        language: 'Python',
        code: 'sorted_list = sorted(items, key=lambda x: x.name)'
      },
      {
        language: 'JavaScript',
        code: 'document.querySelectorAll(".item").forEach(el => el.remove());'
      },
      {
        language: 'SQL',
        code: 'INSERT INTO users (name, email) VALUES ($1, $2);'
      },
      {
        language: 'JavaScript',
        code: 'new Promise((resolve, reject) => setTimeout(resolve, 1000));'
      }
    ];

    this.currentSnippet = null;
    this.startTime = null;
    this.endTime = null;
    this.isRunning = false;
    this.typed = '';
    this.errors = 0;
    this.totalChars = 0;
    this.bestWPM = parseInt(localStorage.getItem('typingTestBestWPM') || '0');

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.loadNewSnippet();
  }

  render() {
    this.container.innerHTML = `
      <div class="typing-test-container">
        <div class="typing-header">
          <h2>Code Typing Test</h2>
          <p class="typing-subtitle">Test your typing speed with real code snippets</p>
        </div>

        <div class="typing-stats">
          <div class="stat-box">
            <span class="stat-value" id="wpm">0</span>
            <span class="stat-label">WPM</span>
          </div>
          <div class="stat-box">
            <span class="stat-value" id="accuracy">100</span>
            <span class="stat-label">Accuracy %</span>
          </div>
          <div class="stat-box">
            <span class="stat-value" id="time">0</span>
            <span class="stat-label">Seconds</span>
          </div>
          <div class="stat-box best">
            <span class="stat-value" id="best-wpm">${this.bestWPM}</span>
            <span class="stat-label">Best WPM</span>
          </div>
        </div>

        <div class="code-display-wrapper">
          <div class="language-badge" id="language-badge">JavaScript</div>
          <div class="code-display" id="code-display"></div>
        </div>

        <input
          type="text"
          id="typing-input"
          class="typing-input"
          placeholder="Start typing here..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />

        <div class="typing-controls">
          <button id="restart-btn" class="typing-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            New Snippet
          </button>
          <button id="focus-btn" class="typing-btn secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Focus Mode
          </button>
        </div>

        <div class="typing-results hidden" id="results">
          <h3>Results</h3>
          <div class="results-grid">
            <div class="result-item">
              <span class="result-value" id="final-wpm">0</span>
              <span class="result-label">Words Per Minute</span>
            </div>
            <div class="result-item">
              <span class="result-value" id="final-accuracy">0%</span>
              <span class="result-label">Accuracy</span>
            </div>
            <div class="result-item">
              <span class="result-value" id="final-time">0s</span>
              <span class="result-label">Time</span>
            </div>
            <div class="result-item">
              <span class="result-value" id="final-chars">0</span>
              <span class="result-label">Characters</span>
            </div>
          </div>
          <button id="try-again-btn" class="typing-btn primary">Try Again</button>
        </div>
      </div>
    `;

    this.addStyles();
  }

  addStyles() {
    if (document.getElementById('typing-test-styles')) return;

    const style = document.createElement('style');
    style.id = 'typing-test-styles';
    style.textContent = `
      .typing-test-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }

      .typing-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .typing-header h2 {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }

      .typing-subtitle {
        color: #6b7280;
      }

      .dark .typing-subtitle {
        color: #9ca3af;
      }

      .typing-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .stat-box {
        background: #f3f4f6;
        border-radius: 0.75rem;
        padding: 1rem;
        text-align: center;
      }

      .dark .stat-box {
        background: #1f2937;
      }

      .stat-box.best {
        background: linear-gradient(135deg, #fef3c7, #fde68a);
      }

      .dark .stat-box.best {
        background: linear-gradient(135deg, #78350f, #92400e);
      }

      .stat-value {
        display: block;
        font-size: 2rem;
        font-weight: bold;
        color: #3b82f6;
      }

      .stat-box.best .stat-value {
        color: #d97706;
      }

      .dark .stat-value {
        color: #60a5fa;
      }

      .stat-label {
        font-size: 0.75rem;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .code-display-wrapper {
        position: relative;
        margin-bottom: 1.5rem;
      }

      .language-badge {
        position: absolute;
        top: -0.5rem;
        right: 1rem;
        background: #3b82f6;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .code-display {
        background: #1f2937;
        border-radius: 0.75rem;
        padding: 1.5rem;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 1.125rem;
        line-height: 1.8;
        min-height: 80px;
        color: #9ca3af;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .code-display .correct {
        color: #10b981;
      }

      .code-display .incorrect {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.2);
        border-radius: 2px;
      }

      .code-display .current {
        background: #3b82f6;
        color: white;
        border-radius: 2px;
        animation: blink 1s infinite;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      .typing-input {
        width: 100%;
        padding: 1rem 1.5rem;
        font-size: 1.125rem;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        background: white;
        margin-bottom: 1.5rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .dark .typing-input {
        background: #111827;
        border-color: #374151;
        color: white;
      }

      .typing-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }

      .typing-controls {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      .typing-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        background: #3b82f6;
        color: white;
      }

      .typing-btn:hover {
        background: #2563eb;
        transform: translateY(-1px);
      }

      .typing-btn.secondary {
        background: #6b7280;
      }

      .typing-btn.secondary:hover {
        background: #4b5563;
      }

      .typing-btn.primary {
        background: #10b981;
      }

      .typing-btn.primary:hover {
        background: #059669;
      }

      .typing-results {
        background: #f3f4f6;
        border-radius: 1rem;
        padding: 2rem;
        text-align: center;
        margin-top: 2rem;
      }

      .dark .typing-results {
        background: #1f2937;
      }

      .typing-results h3 {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .result-item {
        padding: 1rem;
      }

      .result-value {
        display: block;
        font-size: 2rem;
        font-weight: bold;
        color: #3b82f6;
      }

      .result-label {
        font-size: 0.875rem;
        color: #6b7280;
      }

      .hidden {
        display: none !important;
      }

      .focus-mode .typing-stats,
      .focus-mode .typing-header,
      .focus-mode .typing-controls {
        opacity: 0.3;
        transition: opacity 0.3s;
      }

      .focus-mode:hover .typing-stats,
      .focus-mode:hover .typing-header,
      .focus-mode:hover .typing-controls {
        opacity: 1;
      }

      @media (max-width: 640px) {
        .typing-stats {
          grid-template-columns: repeat(2, 1fr);
        }

        .typing-test-container {
          padding: 1rem;
        }

        .code-display {
          font-size: 0.875rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  bindEvents() {
    const input = document.getElementById('typing-input');
    const restartBtn = document.getElementById('restart-btn');
    const focusBtn = document.getElementById('focus-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');

    input.addEventListener('input', (e) => this.handleInput(e));
    input.addEventListener('keydown', (e) => this.handleKeydown(e));
    restartBtn.addEventListener('click', () => this.loadNewSnippet());
    focusBtn.addEventListener('click', () => this.toggleFocusMode());
    tryAgainBtn.addEventListener('click', () => this.loadNewSnippet());
  }

  loadNewSnippet() {
    const randomIndex = Math.floor(Math.random() * this.codeSnippets.length);
    this.currentSnippet = this.codeSnippets[randomIndex];
    this.typed = '';
    this.errors = 0;
    this.totalChars = 0;
    this.startTime = null;
    this.endTime = null;
    this.isRunning = false;

    document.getElementById('language-badge').textContent = this.currentSnippet.language;
    document.getElementById('typing-input').value = '';
    document.getElementById('typing-input').disabled = false;
    document.getElementById('results').classList.add('hidden');
    document.getElementById('wpm').textContent = '0';
    document.getElementById('accuracy').textContent = '100';
    document.getElementById('time').textContent = '0';

    this.updateDisplay();
    document.getElementById('typing-input').focus();
  }

  handleKeydown(e) {
    // Prevent tab from moving focus
    if (e.key === 'Tab') {
      e.preventDefault();
      // Insert actual tab character
      const input = e.target;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = input.value.substring(0, start) + '\t' + input.value.substring(end);
      input.selectionStart = input.selectionEnd = start + 1;
      this.handleInput({ target: input });
    }
  }

  handleInput(e) {
    const input = e.target;
    this.typed = input.value;

    // Start timer on first input
    if (!this.isRunning && this.typed.length > 0) {
      this.isRunning = true;
      this.startTime = Date.now();
      this.updateTimer();
    }

    this.updateDisplay();
    this.updateStats();

    // Check if completed
    if (this.typed.length >= this.currentSnippet.code.length) {
      this.endTest();
    }
  }

  updateDisplay() {
    const display = document.getElementById('code-display');
    const code = this.currentSnippet.code;
    let html = '';

    for (let i = 0; i < code.length; i++) {
      const char = code[i] === ' ' ? '&nbsp;' : this.escapeHtml(code[i]);

      if (i < this.typed.length) {
        if (this.typed[i] === code[i]) {
          html += `<span class="correct">${char}</span>`;
        } else {
          html += `<span class="incorrect">${char}</span>`;
        }
      } else if (i === this.typed.length) {
        html += `<span class="current">${char}</span>`;
      } else {
        html += `<span>${char}</span>`;
      }
    }

    display.innerHTML = html;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  updateStats() {
    if (!this.isRunning) return;

    const code = this.currentSnippet.code;
    let correctChars = 0;
    let errors = 0;

    for (let i = 0; i < this.typed.length; i++) {
      if (i < code.length) {
        if (this.typed[i] === code[i]) {
          correctChars++;
        } else {
          errors++;
        }
      }
    }

    const elapsed = (Date.now() - this.startTime) / 1000 / 60; // minutes
    const words = correctChars / 5; // Standard: 5 chars = 1 word
    const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
    const accuracy = this.typed.length > 0
      ? Math.round((correctChars / this.typed.length) * 100)
      : 100;

    document.getElementById('wpm').textContent = wpm;
    document.getElementById('accuracy').textContent = accuracy;
  }

  updateTimer() {
    if (!this.isRunning) return;

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    document.getElementById('time').textContent = elapsed;

    requestAnimationFrame(() => this.updateTimer());
  }

  endTest() {
    this.isRunning = false;
    this.endTime = Date.now();

    const code = this.currentSnippet.code;
    let correctChars = 0;

    for (let i = 0; i < this.typed.length && i < code.length; i++) {
      if (this.typed[i] === code[i]) {
        correctChars++;
      }
    }

    const elapsed = (this.endTime - this.startTime) / 1000;
    const elapsedMinutes = elapsed / 60;
    const words = correctChars / 5;
    const wpm = Math.round(words / elapsedMinutes);
    const accuracy = Math.round((correctChars / code.length) * 100);

    // Update best WPM
    if (wpm > this.bestWPM) {
      this.bestWPM = wpm;
      localStorage.setItem('typingTestBestWPM', wpm.toString());
      document.getElementById('best-wpm').textContent = wpm;
    }

    // Show results
    document.getElementById('final-wpm').textContent = wpm;
    document.getElementById('final-accuracy').textContent = accuracy + '%';
    document.getElementById('final-time').textContent = elapsed.toFixed(1) + 's';
    document.getElementById('final-chars').textContent = code.length;
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('typing-input').disabled = true;
  }

  toggleFocusMode() {
    this.container.classList.toggle('focus-mode');
    document.getElementById('typing-input').focus();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('typing-test-game');
  if (container) {
    new TypingTest(container);
  }
});

// Expose to window for dynamic loading
window.TypingTest = TypingTest;
