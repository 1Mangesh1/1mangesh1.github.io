class DevBingo {
  constructor(container) {
    this.container = container || document.getElementById('dev-bingo-game');
    this.bingoItems = [
      "Mass edited node_modules",
      "git push --force to main",
      "It works on my machine",
      "Forgot to pull before push",
      "Debugged with console.log",
      "Copied from Stack Overflow",
      "Blamed the intern",
      "Said 'quick fix' (wasn't quick)",
      "Merged without review",
      "Forgot semicolon (2+ hours)",
      "Tab vs spaces argument",
      "Deleted production data",
      "Rage quit vim",
      "Wrote TODO, never did",
      "Meeting that was an email",
      "Fixed bug by restarting",
      "Rubber duck debugging",
      "Deployed on Friday",
      "Infinite loop in prod",
      "Forgot to save file",
      "Wrong branch commit",
      "DNS issue blame",
      "Works in incognito only",
      "Cleared cache fixed it",
      "Accidentally leaked API key",
      "Regex that nobody understands",
      "100+ browser tabs open",
      "Named variable 'temp' forever",
      "Googled own code",
      "Broke build before vacation",
      "Spent hour on typo",
      "Blamed the framework",
      "Said 'I'll refactor later'",
      "Off-by-one error",
      "Empty catch block",
      "Hardcoded credentials",
      "npm install solved it",
      "Commented out code shipped",
      "Wrote no tests",
      "Undefined is not a function",
      "CSS z-index: 99999",
      "!important everywhere",
      "Merge conflict nightmare",
      "Forgot environment variable",
      "Cache invalidation bug"
    ];

    this.board = [];
    this.selected = new Set();
    this.init();
  }

  init() {
    this.generateBoard();
    this.render();
    this.bindEvents();
    this.loadState();
  }

  generateBoard() {
    // Shuffle and pick 25 items (5x5 grid)
    const shuffled = [...this.bingoItems].sort(() => Math.random() - 0.5);
    this.board = shuffled.slice(0, 25);
    // Make center a free space
    this.board[12] = "FREE SPACE";
  }

  render() {
    this.container.innerHTML = `
      <div class="bingo-container">
        <div class="bingo-header">
          <h2>Developer Bingo</h2>
          <p class="bingo-subtitle">How many of these have you done? Click to mark!</p>
        </div>

        <div class="bingo-board" id="bingo-board">
          ${this.board.map((item, index) => `
            <div class="bingo-cell ${index === 12 ? 'free selected' : ''}" data-index="${index}">
              <span class="cell-text">${item}</span>
            </div>
          `).join('')}
        </div>

        <div class="bingo-controls">
          <div class="bingo-score">
            <span class="score-label">Selected:</span>
            <span class="score-value" id="score-count">1</span>
            <span class="score-label">/ 25</span>
          </div>
          <div class="bingo-buttons">
            <button id="new-board-btn" class="bingo-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 4v6h6M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              New Board
            </button>
            <button id="share-btn" class="bingo-btn secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share
            </button>
            <button id="reset-btn" class="bingo-btn danger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Reset
            </button>
          </div>
        </div>

        <div class="bingo-message hidden" id="bingo-message">
          <div class="bingo-celebration">
            <span class="bingo-text">BINGO!</span>
            <p>You got 5 in a row! Share your achievement!</p>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
    this.selected.add(12); // Free space is always selected
  }

  addStyles() {
    if (document.getElementById('dev-bingo-styles')) return;

    const style = document.createElement('style');
    style.id = 'dev-bingo-styles';
    style.textContent = `
      .bingo-container {
        max-width: 700px;
        margin: 0 auto;
        padding: 1.5rem;
      }

      .bingo-header {
        text-align: center;
        margin-bottom: 1.5rem;
      }

      .bingo-header h2 {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }

      .bingo-subtitle {
        color: #6b7280;
      }

      .dark .bingo-subtitle {
        color: #9ca3af;
      }

      .bingo-board {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .bingo-cell {
        aspect-ratio: 1;
        background: #f3f4f6;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
      }

      .dark .bingo-cell {
        background: #1f2937;
      }

      .bingo-cell:hover {
        transform: scale(1.02);
        border-color: #3b82f6;
      }

      .bingo-cell.selected {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border-color: #059669;
      }

      .bingo-cell.free {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        cursor: default;
      }

      .bingo-cell.free:hover {
        transform: none;
      }

      .bingo-cell.bingo-win {
        animation: pulse-win 0.5s ease-in-out;
      }

      @keyframes pulse-win {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .cell-text {
        font-size: 0.65rem;
        text-align: center;
        line-height: 1.3;
        font-weight: 500;
      }

      @media (min-width: 640px) {
        .cell-text {
          font-size: 0.75rem;
        }
      }

      .bingo-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
      }

      @media (min-width: 640px) {
        .bingo-controls {
          flex-direction: row;
          justify-content: space-between;
        }
      }

      .bingo-score {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.125rem;
      }

      .score-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #3b82f6;
      }

      .bingo-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .bingo-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        background: #3b82f6;
        color: white;
      }

      .bingo-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .bingo-btn.secondary {
        background: #6b7280;
      }

      .bingo-btn.danger {
        background: #ef4444;
      }

      .bingo-message {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
      }

      .bingo-celebration {
        background: white;
        padding: 3rem;
        border-radius: 1rem;
        text-align: center;
        animation: bounce-in 0.5s ease-out;
      }

      .dark .bingo-celebration {
        background: #1f2937;
      }

      @keyframes bounce-in {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }

      .bingo-text {
        font-size: 4rem;
        font-weight: bold;
        background: linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        display: block;
        margin-bottom: 1rem;
      }

      .hidden {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  bindEvents() {
    const board = document.getElementById('bingo-board');
    const newBoardBtn = document.getElementById('new-board-btn');
    const shareBtn = document.getElementById('share-btn');
    const resetBtn = document.getElementById('reset-btn');
    const message = document.getElementById('bingo-message');

    board.addEventListener('click', (e) => {
      const cell = e.target.closest('.bingo-cell');
      if (!cell || cell.classList.contains('free')) return;

      const index = parseInt(cell.dataset.index);
      this.toggleCell(index, cell);
    });

    newBoardBtn.addEventListener('click', () => {
      this.selected.clear();
      this.generateBoard();
      this.render();
      this.bindEvents();
      localStorage.removeItem('devBingoState');
    });

    shareBtn.addEventListener('click', () => this.shareBoard());

    resetBtn.addEventListener('click', () => {
      this.selected.clear();
      this.selected.add(12);
      document.querySelectorAll('.bingo-cell').forEach((cell, i) => {
        if (i !== 12) cell.classList.remove('selected');
      });
      this.updateScore();
      this.saveState();
    });

    message.addEventListener('click', () => {
      message.classList.add('hidden');
    });
  }

  toggleCell(index, cell) {
    if (this.selected.has(index)) {
      this.selected.delete(index);
      cell.classList.remove('selected');
    } else {
      this.selected.add(index);
      cell.classList.add('selected');
    }

    this.updateScore();
    this.checkBingo();
    this.saveState();
  }

  updateScore() {
    document.getElementById('score-count').textContent = this.selected.size;
  }

  checkBingo() {
    const winPatterns = [
      // Rows
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      // Columns
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      // Diagonals
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20]
    ];

    for (const pattern of winPatterns) {
      if (pattern.every(index => this.selected.has(index))) {
        this.showBingo(pattern);
        return true;
      }
    }
    return false;
  }

  showBingo(pattern) {
    // Highlight winning cells
    pattern.forEach(index => {
      const cell = document.querySelector(`[data-index="${index}"]`);
      cell.classList.add('bingo-win');
    });

    // Show message
    document.getElementById('bingo-message').classList.remove('hidden');
  }

  shareBoard() {
    const count = this.selected.size;
    const items = Array.from(this.selected)
      .filter(i => i !== 12)
      .map(i => this.board[i])
      .slice(0, 5);

    const text = `I scored ${count}/25 on Developer Bingo! 🎯\n\nSome highlights:\n${items.map(i => '✅ ' + i).join('\n')}\n\nPlay at: ${window.location.href}`;

    if (navigator.share) {
      navigator.share({
        title: 'Developer Bingo',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
      });
    }
  }

  saveState() {
    const state = {
      board: this.board,
      selected: Array.from(this.selected)
    };
    localStorage.setItem('devBingoState', JSON.stringify(state));
  }

  loadState() {
    const saved = localStorage.getItem('devBingoState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.board = state.board;
        this.selected = new Set(state.selected);
        this.render();
        this.bindEvents();

        // Re-apply selected state
        this.selected.forEach(index => {
          const cell = document.querySelector(`[data-index="${index}"]`);
          if (cell) cell.classList.add('selected');
        });
        this.updateScore();
      } catch (e) {
        console.error('Failed to load bingo state:', e);
      }
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dev-bingo-game');
  if (container) {
    new DevBingo(container);
  }
});

// Expose to window for dynamic loading
window.DevBingo = DevBingo;
