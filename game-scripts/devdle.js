/**
 * DEVDLE
 * Wordle, but every answer is a five-letter word from a developer's
 * vocabulary: languages, tools, keywords, infrastructure.
 * - 6 guesses, on-screen + physical keyboard
 * - Correct duplicate-letter handling (count-based, like the original)
 * - Win/streak stats in localStorage
 */

class Devdle {
  constructor() {
    this.container = document.getElementById('devdle-game');
    this.words = [
      'ARRAY', 'ASYNC', 'AWAIT', 'BATCH', 'BREAK', 'BUILD', 'CACHE', 'CATCH',
      'CHAIN', 'CHECK', 'CHMOD', 'CLASS', 'CLONE', 'CLOUD', 'CONST', 'CRASH',
      'DEBUG', 'DELTA', 'EMACS', 'ERROR', 'EVENT', 'FETCH', 'FLOAT', 'FRAME',
      'GRAPH', 'HOOKS', 'INDEX', 'INPUT', 'KAFKA', 'LAYER', 'LINUX', 'LOCAL',
      'LOGIC', 'MACRO', 'MERGE', 'MODEL', 'MONGO', 'MOUNT', 'NGINX', 'NODES',
      'PARSE', 'PATCH', 'PIXEL', 'PROTO', 'PROXY', 'QUERY', 'QUEUE', 'REACT',
      'REDIS', 'REGEX', 'RESET', 'ROUTE', 'SCALA', 'SCOPE', 'SHARD', 'SHELL',
      'SLICE', 'SPLIT', 'STACK', 'STASH', 'STATE', 'STDIN', 'STORE', 'SWIFT',
      'TABLE', 'THROW', 'TOKEN', 'TRACE', 'TRAIT', 'TUPLE', 'VAULT', 'WHILE',
      'YIELD',
    ];
    this.keyHandler = (e) => this.onKeydown(e);
    document.addEventListener('keydown', this.keyHandler);
    this.render();
    this.newGame();
  }

  render() {
    const keyRows = ['QWERTYUIOP', 'ASDFGHJKL', '⏎ZXCVBNM⌫'];
    this.container.innerHTML = `
      <div class="flex flex-col items-center">
        <div class="grid grid-cols-3 gap-3 mb-4 w-full max-w-sm">
          <div class="text-center p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
            <div class="text-lg font-bold text-emerald-700" id="devdle-played">0</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Played</div>
          </div>
          <div class="text-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <div class="text-lg font-bold text-blue-600" id="devdle-winrate">0%</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Win Rate</div>
          </div>
          <div class="text-center p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <div class="text-lg font-bold text-orange-700" id="devdle-streak">0</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Streak</div>
          </div>
        </div>

        <div id="devdle-board" class="grid grid-rows-6 gap-1.5 mb-4"></div>

        <div id="devdle-status" class="text-center p-2 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm w-full max-w-sm">Guess the 5-letter dev word. Any letters accepted!</div>

        <div id="devdle-keyboard" class="flex flex-col items-center gap-1.5 mb-4 w-full max-w-md">
          ${keyRows.map((row) => `
            <div class="flex gap-1 justify-center w-full">
              ${row.split('').map((key) => {
                const label = key === '⏎' ? 'ENTER' : key === '⌫' ? '⌫' : key;
                const wide = key === '⏎' || key === '⌫' ? 'px-2 text-xs' : 'flex-1 max-w-[36px]';
                return `<button data-key="${label === 'ENTER' ? 'Enter' : label === '⌫' ? 'Backspace' : key}" class="devdle-key ${wide} h-12 rounded font-bold text-sm bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors">${label}</button>`;
              }).join('')}
            </div>
          `).join('')}
        </div>

        <button id="devdle-new" class="px-4 py-2 bg-emerald-700 text-white rounded-md text-sm font-medium hover:bg-emerald-800 transition-colors">🔄 New Word</button>
      </div>
    `;

    this.container.querySelector('#devdle-keyboard').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-key]');
      if (btn) this.onKeydown({ key: btn.dataset.key });
    });
    this.container.querySelector('#devdle-new').addEventListener('click', () => this.newGame());
  }

  newGame() {
    this.answer = this.words[Math.floor(Math.random() * this.words.length)];
    this.guesses = [];
    this.current = '';
    this.done = false;
    this.keyStates = {};
    this.setStatus('Guess the 5-letter dev word. Any letters accepted!');
    this.drawBoard();
    this.drawKeyboard();
    this.updateStats();
  }

  onKeydown(e) {
    if (this.done || !this.container.isConnected) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key;
    if (key === 'Enter') this.submit();
    else if (key === 'Backspace') { this.current = this.current.slice(0, -1); this.drawBoard(); }
    else if (/^[a-zA-Z]$/.test(key) && this.current.length < 5) {
      this.current += key.toUpperCase();
      this.drawBoard();
    }
  }

  submit() {
    if (this.current.length !== 5) {
      this.setStatus('Need 5 letters!');
      return;
    }
    const guess = this.current;
    const result = this.evaluate(guess);
    this.guesses.push({ guess, result });
    this.current = '';

    result.forEach((state, i) => {
      const letter = guess[i];
      const rank = { absent: 0, present: 1, correct: 2 };
      if (!this.keyStates[letter] || rank[state] > rank[this.keyStates[letter]]) {
        this.keyStates[letter] = state;
      }
    });

    if (guess === this.answer) {
      this.done = true;
      const compliments = ['🤯 Compiled first try!', '🚀 Shipped it!', '✅ Merged without review!', '👏 LGTM!', '😅 CI barely passed.', '🫣 Deployed on a Friday.'];
      this.setStatus(compliments[Math.min(this.guesses.length - 1, 5)]);
      this.recordResult(true);
    } else if (this.guesses.length === 6) {
      this.done = true;
      this.setStatus(`💀 Build failed. The word was ${this.answer}.`);
      this.recordResult(false);
    }
    this.drawBoard();
    this.drawKeyboard();
    this.updateStats();
  }

  evaluate(guess) {
    const result = Array(5).fill('absent');
    const remaining = {};
    for (let i = 0; i < 5; i++) {
      if (guess[i] === this.answer[i]) result[i] = 'correct';
      else remaining[this.answer[i]] = (remaining[this.answer[i]] || 0) + 1;
    }
    for (let i = 0; i < 5; i++) {
      if (result[i] === 'correct') continue;
      if (remaining[guess[i]] > 0) {
        result[i] = 'present';
        remaining[guess[i]]--;
      }
    }
    return result;
  }

  tileClasses(state) {
    if (state === 'correct') return 'bg-green-600 border-green-600 text-white';
    if (state === 'present') return 'bg-yellow-500 border-yellow-500 text-white';
    if (state === 'absent') return 'bg-gray-500 border-gray-500 text-white';
    return 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100';
  }

  drawBoard() {
    const board = this.container.querySelector('#devdle-board');
    const rows = [];
    for (let r = 0; r < 6; r++) {
      const done = this.guesses[r];
      const typing = r === this.guesses.length ? this.current : '';
      const tiles = [];
      for (let c = 0; c < 5; c++) {
        const letter = done ? done.guess[c] : typing[c] || '';
        const state = done ? done.result[c] : null;
        tiles.push(`<div class="w-12 h-12 sm:w-14 sm:h-14 border-2 rounded flex items-center justify-center text-xl font-bold uppercase ${this.tileClasses(state)} ${letter && !done ? 'border-gray-500 dark:border-gray-400' : ''}">${letter}</div>`);
      }
      rows.push(`<div class="grid grid-cols-5 gap-1.5">${tiles.join('')}</div>`);
    }
    board.innerHTML = rows.join('');
  }

  drawKeyboard() {
    const base = 'devdle-key flex-1 max-w-[36px] h-12 rounded font-bold text-sm transition-colors';
    this.container.querySelectorAll('.devdle-key').forEach((btn) => {
      const key = btn.dataset.key;
      if (key.length !== 1) return;
      const state = this.keyStates[key];
      if (state === 'correct') btn.className = `${base} bg-green-600 text-white`;
      else if (state === 'present') btn.className = `${base} bg-yellow-500 text-white`;
      else if (state === 'absent') btn.className = `${base} bg-gray-500 text-gray-200`;
      else btn.className = `${base} bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200`;
    });
  }

  loadStats() {
    try {
      return JSON.parse(localStorage.getItem('devdleStats')) || { played: 0, wins: 0, streak: 0 };
    } catch (e) {
      return { played: 0, wins: 0, streak: 0 };
    }
  }

  recordResult(won) {
    const stats = this.loadStats();
    stats.played++;
    if (won) { stats.wins++; stats.streak++; } else { stats.streak = 0; }
    try { localStorage.setItem('devdleStats', JSON.stringify(stats)); } catch (e) {}
  }

  updateStats() {
    const stats = this.loadStats();
    this.container.querySelector('#devdle-played').textContent = String(stats.played);
    this.container.querySelector('#devdle-winrate').textContent = stats.played ? `${Math.round((stats.wins / stats.played) * 100)}%` : '0%';
    this.container.querySelector('#devdle-streak').textContent = String(stats.streak);
  }

  setStatus(msg) {
    const el = this.container.querySelector('#devdle-status');
    if (el) el.textContent = msg;
  }

  destroy() {
    document.removeEventListener('keydown', this.keyHandler);
  }
}

window.Devdle = Devdle;
