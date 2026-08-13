/**
 * BUG SWEEPER
 * Minesweeper with a code-review twist: the board is a codebase,
 * the mines are bugs. Flag them before you step on one.
 * - 3 board sizes, first click always safe
 * - Flag mode toggle for touch devices, right-click on desktop
 * - Best times per difficulty in localStorage
 */

class BugSweeper {
  constructor() {
    this.container = document.getElementById('bug-sweeper-game');
    this.difficulties = {
      easy: { rows: 9, cols: 9, bugs: 10, label: '9×9 · 10 bugs' },
      medium: { rows: 12, cols: 12, bugs: 24, label: '12×12 · 24 bugs' },
      hard: { rows: 14, cols: 14, bugs: 35, label: '14×14 · 35 bugs' },
    };
    this.numberColors = [
      '', 'text-blue-600', 'text-green-700', 'text-red-600', 'text-indigo-700',
      'text-amber-700', 'text-teal-700', 'text-purple-700', 'text-gray-700',
    ];
    this.difficulty = 'easy';
    this.timerInterval = null;
    this.render();
    this.newGame();
  }

  render() {
    this.container.innerHTML = `
      <div class="flex flex-col items-center">
        <div class="flex flex-wrap justify-center gap-2 mb-4" id="sweeper-difficulty">
          ${Object.entries(this.difficulties).map(([key, d]) => `
            <button data-difficulty="${key}" class="px-3 py-2 rounded-md text-sm font-medium transition-colors ${key === this.difficulty ? 'bg-slate-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}">${d.label}</button>
          `).join('')}
        </div>

        <div class="grid grid-cols-3 gap-3 mb-4 w-full max-w-sm">
          <div class="text-center p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <div class="text-lg font-bold text-red-600" id="sweeper-bugs">0</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Bugs Left</div>
          </div>
          <div class="text-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <div class="text-lg font-bold text-blue-600" id="sweeper-time">0s</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Time</div>
          </div>
          <div class="text-center p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <div class="text-lg font-bold text-green-700" id="sweeper-best">--</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Best</div>
          </div>
        </div>

        <div class="flex gap-2 mb-4">
          <button id="sweeper-flag-mode" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium transition-colors">🚩 Flag Mode: OFF</button>
          <button id="sweeper-reset" class="px-4 py-2 bg-slate-700 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors">🔄 New Board</button>
        </div>

        <div id="sweeper-grid" class="select-none mb-4" style="display: grid; gap: 2px; touch-action: manipulation;"></div>

        <div id="sweeper-status" class="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm w-full max-w-sm">Click a cell to start. Right-click (or Flag Mode) to mark bugs.</div>
      </div>
    `;

    this.container.querySelector('#sweeper-difficulty').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-difficulty]');
      if (!btn) return;
      this.difficulty = btn.dataset.difficulty;
      this.render();
      this.newGame();
    });
    this.container.querySelector('#sweeper-flag-mode').addEventListener('click', () => {
      this.flagMode = !this.flagMode;
      const btn = this.container.querySelector('#sweeper-flag-mode');
      btn.textContent = `🚩 Flag Mode: ${this.flagMode ? 'ON' : 'OFF'}`;
      btn.classList.toggle('bg-red-600', this.flagMode);
      btn.classList.toggle('text-white', this.flagMode);
    });
    this.container.querySelector('#sweeper-reset').addEventListener('click', () => this.newGame());

    const grid = this.container.querySelector('#sweeper-grid');
    grid.addEventListener('click', (e) => {
      const cell = e.target.closest('[data-idx]');
      if (!cell) return;
      const idx = Number(cell.dataset.idx);
      if (this.flagMode) this.toggleFlag(idx);
      else this.handleReveal(idx);
    });
    grid.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const cell = e.target.closest('[data-idx]');
      if (cell) this.toggleFlag(Number(cell.dataset.idx));
    });
  }

  newGame() {
    const d = this.difficulties[this.difficulty];
    this.rows = d.rows;
    this.cols = d.cols;
    this.bugCount = d.bugs;
    this.cells = Array.from({ length: this.rows * this.cols }, () => ({
      bug: false, revealed: false, flagged: false, adj: 0,
    }));
    this.started = false;
    this.gameOver = false;
    this.revealedCount = 0;
    this.flagCount = 0;
    this.time = 0;
    this.flagMode = this.flagMode || false;
    this.stopTimer();
    this.setStatus('Click a cell to start. Right-click (or Flag Mode) to mark bugs.');
    this.updateStats();
    this.drawGrid();
  }

  neighbors(idx) {
    const r = Math.floor(idx / this.cols);
    const c = idx % this.cols;
    const out = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          out.push(nr * this.cols + nc);
        }
      }
    }
    return out;
  }

  placeBugs(safeIdx) {
    const forbidden = new Set([safeIdx, ...this.neighbors(safeIdx)]);
    let placed = 0;
    while (placed < this.bugCount) {
      const idx = Math.floor(Math.random() * this.cells.length);
      if (forbidden.has(idx) || this.cells[idx].bug) continue;
      this.cells[idx].bug = true;
      placed++;
    }
    this.cells.forEach((cell, idx) => {
      cell.adj = this.neighbors(idx).filter((n) => this.cells[n].bug).length;
    });
  }

  handleReveal(idx) {
    if (this.gameOver) return;
    const cell = this.cells[idx];
    if (cell.revealed || cell.flagged) return;

    if (!this.started) {
      this.placeBugs(idx);
      this.started = true;
      this.startTimer();
    }

    if (cell.bug) {
      this.lose(idx);
      return;
    }

    const stack = [idx];
    while (stack.length) {
      const i = stack.pop();
      const c = this.cells[i];
      if (c.revealed || c.flagged) continue;
      c.revealed = true;
      this.revealedCount++;
      if (c.adj === 0) {
        this.neighbors(i).forEach((n) => {
          if (!this.cells[n].revealed) stack.push(n);
        });
      }
    }

    if (this.revealedCount === this.cells.length - this.bugCount) {
      this.win();
    }
    this.updateStats();
    this.drawGrid();
  }

  toggleFlag(idx) {
    if (this.gameOver || !this.started) return;
    const cell = this.cells[idx];
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
    this.flagCount += cell.flagged ? 1 : -1;
    this.updateStats();
    this.drawGrid();
  }

  lose(hitIdx) {
    this.gameOver = true;
    this.stopTimer();
    this.hitIdx = hitIdx;
    this.cells.forEach((c) => { if (c.bug) c.revealed = true; });
    this.setStatus('💥 Segfault! You stepped on a bug. New Board to retry.');
    this.drawGrid();
  }

  win() {
    this.gameOver = true;
    this.stopTimer();
    const key = `bugSweeperBest_${this.difficulty}`;
    let best = null;
    try {
      best = Number(localStorage.getItem(key)) || null;
      if (!best || this.time < best) {
        localStorage.setItem(key, String(this.time));
        best = this.time;
      }
    } catch (e) {}
    this.setStatus(`✅ All bugs contained in ${this.time}s! ${best === this.time ? 'New best time!' : ''}`);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.time++;
      const el = this.container.querySelector('#sweeper-time');
      if (el) el.textContent = `${this.time}s`;
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateStats() {
    this.container.querySelector('#sweeper-bugs').textContent = String(this.bugCount - this.flagCount);
    this.container.querySelector('#sweeper-time').textContent = `${this.time}s`;
    let best = null;
    try { best = localStorage.getItem(`bugSweeperBest_${this.difficulty}`); } catch (e) {}
    this.container.querySelector('#sweeper-best').textContent = best ? `${best}s` : '--';
  }

  drawGrid() {
    const grid = this.container.querySelector('#sweeper-grid');
    grid.style.gridTemplateColumns = `repeat(${this.cols}, minmax(0, 1fr))`;
    grid.style.width = `min(100%, ${this.cols * 34}px)`;
    // ponytail: full grid re-render each action; fine at 14x14, diff cells if it ever grows
    grid.innerHTML = this.cells.map((cell, idx) => {
      let content = '';
      let classes = 'aspect-square flex items-center justify-center rounded text-sm font-bold cursor-pointer transition-colors ';
      if (cell.revealed) {
        if (cell.bug) {
          content = '🐛';
          classes += idx === this.hitIdx ? 'bg-red-500' : 'bg-red-200 dark:bg-red-900/40';
        } else {
          classes += 'bg-gray-100 dark:bg-gray-800 ';
          if (cell.adj > 0) {
            content = String(cell.adj);
            classes += this.numberColors[cell.adj];
          }
        }
      } else if (cell.flagged) {
        content = '🚩';
        classes += 'bg-slate-400 dark:bg-slate-600';
      } else {
        classes += 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600';
      }
      return `<div data-idx="${idx}" class="${classes}" style="font-size: clamp(10px, 2.2vw, 14px);">${content}</div>`;
    }).join('');
  }

  setStatus(msg) {
    const el = this.container.querySelector('#sweeper-status');
    if (el) el.textContent = msg;
  }

  destroy() {
    this.stopTimer();
  }
}

window.BugSweeper = BugSweeper;
