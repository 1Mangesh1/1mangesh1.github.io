/**
 * HEXLE: GUESS THE HEX
 * A color swatch appears; four hex codes claim to be it. Pick the right one.
 * - 10 rounds, distractors converge on the answer as you progress
 * - Streak bonus scoring, ranks, best score in localStorage
 * - Trains the eyedropper eye every frontend dev pretends to have
 */

class HexGuess {
  constructor() {
    this.container = document.getElementById('hex-guess-game');
    this.totalRounds = 10;
    this.timeouts = [];
    this.render();
    this.newGame();
  }

  render() {
    this.container.innerHTML = `
      <div class="flex flex-col items-center">
        <div class="grid grid-cols-3 gap-3 mb-4 w-full max-w-sm">
          <div class="text-center p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
            <div class="text-lg font-bold text-indigo-600" id="hex-round">1/10</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Round</div>
          </div>
          <div class="text-center p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <div class="text-lg font-bold text-green-700" id="hex-score">0</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Score</div>
          </div>
          <div class="text-center p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <div class="text-lg font-bold text-orange-700" id="hex-best">0</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Best</div>
          </div>
        </div>

        <div id="hex-swatch" class="w-40 h-40 sm:w-48 sm:h-48 rounded-xl border-4 border-gray-300 dark:border-gray-600 shadow-lg mb-6"></div>

        <div id="hex-options" class="grid grid-cols-2 gap-3 mb-4 w-full max-w-sm"></div>

        <div id="hex-status" class="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm w-full max-w-sm">Which hex code is this color?</div>

        <button id="hex-restart" class="hidden mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">🔄 Play Again</button>
      </div>
    `;

    this.container.querySelector('#hex-options').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-hex]');
      if (btn && !this.locked) this.pick(btn.dataset.hex);
    });
    this.container.querySelector('#hex-restart').addEventListener('click', () => this.newGame());
  }

  newGame() {
    this.round = 0;
    this.score = 0;
    this.streak = 0;
    this.locked = false;
    this.container.querySelector('#hex-restart').classList.add('hidden');
    this.nextRound();
  }

  randChannel() {
    return Math.floor(Math.random() * 256);
  }

  toHex(rgb) {
    return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  makeDistractor(target, spread) {
    const clamp = (v) => Math.max(0, Math.min(255, v));
    return target.map((v) => {
      const offset = (Math.floor(Math.random() * spread) + Math.floor(spread / 2)) * (Math.random() < 0.5 ? -1 : 1);
      return clamp(v + offset);
    });
  }

  nextRound() {
    this.round++;
    this.locked = false;
    if (this.round > this.totalRounds) {
      this.finish();
      return;
    }

    // Distractors start ~90 per channel off and tighten to ~15 by round 10
    const spread = Math.max(15, 90 - (this.round - 1) * 8);
    this.target = [this.randChannel(), this.randChannel(), this.randChannel()];
    const targetHex = this.toHex(this.target);

    const options = new Set([targetHex]);
    while (options.size < 4) {
      options.add(this.toHex(this.makeDistractor(this.target, spread)));
    }
    const shuffled = [...options].sort(() => Math.random() - 0.5);

    this.container.querySelector('#hex-swatch').style.backgroundColor = targetHex;
    this.container.querySelector('#hex-round').textContent = `${this.round}/${this.totalRounds}`;
    this.container.querySelector('#hex-options').innerHTML = shuffled.map((hex) => `
      <button data-hex="${hex}" class="px-4 py-3 rounded-lg font-mono text-sm font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">${hex}</button>
    `).join('');
    this.setStatus(this.round === 1 ? 'Which hex code is this color?' : `Round ${this.round}. Spread is tightening...`);
    this.updateStats();
  }

  pick(hex) {
    this.locked = true;
    const targetHex = this.toHex(this.target);
    const correct = hex === targetHex;

    const base = 'px-4 py-3 rounded-lg font-mono text-sm font-bold transition-colors';
    this.container.querySelectorAll('#hex-options button').forEach((btn) => {
      if (btn.dataset.hex === targetHex) {
        btn.className = `${base} bg-green-600 text-white`;
      } else if (btn.dataset.hex === hex) {
        btn.className = `${base} bg-red-600 text-white`;
      }
    });

    if (correct) {
      this.streak++;
      const bonus = Math.min(this.streak - 1, 5);
      this.score += 10 + bonus;
      this.setStatus(`✅ Correct! +${10 + bonus} points${bonus ? ` (streak +${bonus})` : ''}`);
    } else {
      this.streak = 0;
      this.setStatus(`❌ It was ${targetHex}. Eyes need a recalibration.`);
    }
    this.updateStats();
    this.timeouts.push(setTimeout(() => this.nextRound(), 1200));
  }

  finish() {
    let best = 0;
    try {
      best = Number(localStorage.getItem('hexGuessBest')) || 0;
      if (this.score > best) {
        localStorage.setItem('hexGuessBest', String(this.score));
        best = this.score;
      }
    } catch (e) {}

    const ranks = [
      [140, '🧙 CSS wizard. Are you even human?'],
      [110, '🎯 Certified eyedropper.'],
      [80, '🎨 Design-adjacent. Respectable.'],
      [50, '🔍 Needs DevTools open at all times.'],
      [0, '🖨️ console.log(color) kind of person.'],
    ];
    const rank = ranks.find(([min]) => this.score >= min)[1];
    this.setStatus(`Final score: ${this.score}. ${rank}${this.score === best && best > 0 ? ' New best!' : ''}`);
    this.container.querySelector('#hex-options').innerHTML = '';
    this.container.querySelector('#hex-swatch').style.backgroundColor = 'transparent';
    this.container.querySelector('#hex-restart').classList.remove('hidden');
    this.updateStats();
  }

  updateStats() {
    this.container.querySelector('#hex-score').textContent = String(this.score);
    let best = 0;
    try { best = Number(localStorage.getItem('hexGuessBest')) || 0; } catch (e) {}
    this.container.querySelector('#hex-best').textContent = String(Math.max(best, this.score));
  }

  setStatus(msg) {
    const el = this.container.querySelector('#hex-status');
    if (el) el.textContent = msg;
  }

  destroy() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }
}

window.HexGuess = HexGuess;
