/**
 * CODE HANGMAN: SYSTEM FAILURE
 * Advanced hangman game with a "System Failure" theme
 * - Prevent the system from crashing by guessing the password (word)
 * - Visual "Server Status" indicator instead of a hanging man
 * - Multiple categories (languages, frameworks, algorithms, etc.)
 * - Achievement system with unlockables
 * - Hint system with penalties
 */

class CodeHangman {
  constructor() {
    this.canvas = document.getElementById('hangman-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Game state
    this.word = '';
    this.category = '';
    this.guessedLetters = new Set();
    this.wrongGuesses = 0;
    this.maxWrongs = 6;
    this.gameOver = false;
    this.won = false;

    // Stats
    this.wins = parseInt(localStorage.getItem('hangmanWins') || '0');
    this.losses = parseInt(localStorage.getItem('hangmanLosses') || '0');
    this.currentStreak = 0;
    this.bestStreak = parseInt(localStorage.getItem('hangmanBestStreak') || '0');
    this.hintsUsed = 0;
    this.score = 0;
    this.totalScore = parseInt(localStorage.getItem('hangmanTotalScore') || '0');

    // Achievements
    this.achievements = this.loadAchievements();

    // Word database with categories
    this.wordDatabase = {
      languages: {
        easy: ['PYTHON', 'JAVA', 'RUBY', 'PHP', 'RUST', 'SWIFT', 'DART'],
        medium: ['JAVASCRIPT', 'TYPESCRIPT', 'KOTLIN', 'HASKELL', 'CLOJURE'],
        hard: ['OBJECTIVE-C', 'COFFEESCRIPT', 'FORTRAN', 'ASSEMBLY']
      },
      frameworks: {
        easy: ['REACT', 'VUE', 'FLASK', 'DJANGO'],
        medium: ['ANGULAR', 'SVELTE', 'EXPRESS', 'NEXTJS', 'GATSBY'],
        hard: ['TENSORFLOW', 'PYTORCH', 'KUBERNETES', 'ELASTICSEARCH']
      },
      algorithms: {
        easy: ['SORT', 'SEARCH', 'MERGE', 'BINARY'],
        medium: ['QUICKSORT', 'RECURSION', 'HASHING', 'DIJKSTRA'],
        hard: ['BACKTRACKING', 'DYNAMICPROGRAMMING', 'BELLMANFORD']
      },
      concepts: {
        easy: ['LOOP', 'CLASS', 'ARRAY', 'FUNCTION'],
        medium: ['CLOSURE', 'PROMISE', 'CALLBACK', 'INTERFACE'],
        hard: ['POLYMORPHISM', 'ENCAPSULATION', 'ASYNCHRONOUS']
      },
      tools: {
        easy: ['GIT', 'VSCODE', 'DOCKER', 'NGINX'],
        medium: ['WEBPACK', 'JENKINS', 'TERRAFORM', 'ANSIBLE'],
        hard: ['PROMETHEUS', 'GRAFANA', 'ELASTICSEARCH']
      }
    };

    this.difficulty = 'medium';
    this.currentCategory = 'languages';

    // Particles for effects
    this.particles = [];

    // Sounds
    this.sounds = {
      correct: () => this.playSound(400, 0.1),
      wrong: () => this.playSound(200, 0.15),
      win: () => this.playSound(600, 0.3),
      lose: () => this.playSound(150, 0.4),
      hint: () => this.playSound(500, 0.1)
    };

    this.init();
    this.destroyed = false;
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  init() {
    this.setupControls();
    this.newGame();
    this.updateStats();
    this.renderAchievements();
  }

  handleKeydown(e) {
    if (this.gameOver) return;
    const letter = e.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
      this.guessLetter(letter);
    }
  }

  setupControls() {
    // Keyboard
    document.getElementById('keyboard')?.addEventListener('click', (e) => {
      if (e.target.dataset.letter) {
        this.guessLetter(e.target.dataset.letter);
      }
    });

    document.removeEventListener('keydown', this.handleKeydown);
    document.addEventListener('keydown', this.handleKeydown);

    // Category selection
    document.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentCategory = btn.dataset.category;
        document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.newGame();
      });
    });

    // Difficulty selection
    document.querySelectorAll('[data-difficulty]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.difficulty = btn.dataset.difficulty;
        document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.newGame();
      });
    });

    // Buttons
    document.getElementById('new-game-btn')?.addEventListener('click', () => this.newGame());
    document.getElementById('hint-btn')?.addEventListener('click', () => this.useHint());
    document.getElementById('reset-stats-btn')?.addEventListener('click', () => this.resetStats());
  }

  newGame() {
    // Select word
    const words = this.wordDatabase[this.currentCategory][this.difficulty];
    this.word = words[Math.floor(Math.random() * words.length)];
    this.category = this.currentCategory.toUpperCase();

    // Reset state
    this.guessedLetters.clear();
    this.wrongGuesses = 0;
    this.gameOver = false;
    this.won = false;
    this.hintsUsed = 0;
    this.particles = [];

    // Generate keyboard
    this.generateKeyboard();
    this.updateDisplay();
    this.draw();
    this.updateStatus(`🎮 System Secure. Category: ${this.category}`);
  }

  generateKeyboard() {
    const keyboard = document.getElementById('keyboard');
    if (!keyboard) return;

    keyboard.innerHTML = '';
    const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

    rows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row flex justify-center gap-1 mb-1';

      row.split('').forEach(letter => {
        const btn = document.createElement('button');
        btn.textContent = letter;
        btn.dataset.letter = letter;
        btn.className = 'keyboard-key w-8 h-10 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded font-bold text-sm transition-all';
        rowDiv.appendChild(btn);
      });

      keyboard.appendChild(rowDiv);
    });
  }

  guessLetter(letter) {
    if (this.gameOver || this.guessedLetters.has(letter)) return;

    this.guessedLetters.add(letter);

    // Update keyboard
    const btn = document.querySelector(`[data-letter="${letter}"]`);
    if (btn) {
      btn.disabled = true;
    }

    if (this.word.includes(letter)) {
      // Correct guess
      this.sounds.correct();
      if (btn) {
        btn.classList.add('bg-green-500', 'text-white');
        btn.classList.remove('bg-gray-200', 'dark:bg-gray-700');
      }

      // Create particles
      this.createParticles(this.canvas.width / 2, this.canvas.height / 2, '#10b981', 10);

      // Check win
      if (this.isWordComplete()) {
        this.win();
      }
    } else {
      // Wrong guess
      this.wrongGuesses++;
      this.sounds.wrong();

      if (btn) {
        btn.classList.add('bg-red-500', 'text-white');
        btn.classList.remove('bg-gray-200', 'dark:bg-gray-700');
      }

      // Shake effect
      this.canvas.style.animation = 'shake 0.3s';
      setTimeout(() => { this.canvas.style.animation = ''; }, 300);

      // Check lose
      if (this.wrongGuesses >= this.maxWrongs) {
        this.lose();
      }
    }

    this.updateDisplay();
    this.draw();
  }

  isWordComplete() {
    return this.word.split('').every(letter => this.guessedLetters.has(letter) || letter === '-');
  }

  useHint() {
    if (this.gameOver) return;

    const unguessedLetters = this.word.split('').filter(letter =>
      !this.guessedLetters.has(letter) && letter !== '-'
    );

    if (unguessedLetters.length === 0) return;

    const hintLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
    this.hintsUsed++;
    this.sounds.hint();

    // Highlight hint letter
    const btn = document.querySelector(`[data-letter="${hintLetter}"]`);
    if (btn) {
      btn.classList.add('animate-pulse', 'ring-4', 'ring-yellow-400');
      setTimeout(() => {
        btn.classList.remove('animate-pulse', 'ring-4', 'ring-yellow-400');
      }, 2000);
    }

    this.updateStatus(`💡 Hint: The word contains the letter "${hintLetter}"`);
  }

  win() {
    this.gameOver = true;
    this.won = true;
    this.wins++;
    this.currentStreak++;
    this.bestStreak = Math.max(this.bestStreak, this.currentStreak);

    // Calculate score
    const baseScore = 100;
    const difficultyMultiplier = { easy: 1, medium: 2, hard: 3 }[this.difficulty];
    const hintPenalty = this.hintsUsed * 20;
    const wrongPenalty = this.wrongGuesses * 10;
    const streakBonus = this.currentStreak * 50;

    this.score = Math.max(0, (baseScore * difficultyMultiplier) - hintPenalty - wrongPenalty + streakBonus);
    this.totalScore += this.score;

    localStorage.setItem('hangmanWins', this.wins);
    localStorage.setItem('hangmanBestStreak', this.bestStreak);
    localStorage.setItem('hangmanTotalScore', this.totalScore);

    this.sounds.win();
    this.createWinAnimation();
    this.checkAchievements();

    let statusMsg = `🎉 System Restored! +${this.score} points!`;
    if (this.currentStreak > 1) statusMsg += ` | ${this.currentStreak}x Streak! 🔥`;
    this.updateStatus(statusMsg);

    this.updateStats();
  }

  lose() {
    this.gameOver = true;
    this.won = false;
    this.losses++;
    this.currentStreak = 0;

    localStorage.setItem('hangmanLosses', this.losses);

    this.sounds.lose();
    this.updateStatus(`💀 System Failure! The password was: ${this.word}`);
    this.updateStats();
  }

  createWinAnimation() {
    // Confetti explosion
    for (let i = 0; i < 50; i++) {
      this.createParticles(
        this.canvas.width / 2,
        this.canvas.height / 2,
        `hsl(${Math.random() * 360}, 70%, 60%)`,
        1
      );
    }
  }

  createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 1,
        color,
        size: Math.random() * 4 + 2
      });
    }
  }

  updateDisplay() {
    // Word display
    const display = this.word.split('').map(letter => {
      if (letter === '-') return ' ';
      return this.guessedLetters.has(letter) ? letter : '_';
    }).join(' ');

    document.getElementById('word-display').textContent = display;

    // Wrong guesses
    document.getElementById('wrong-guesses').textContent = `${this.wrongGuesses}/${this.maxWrongs}`;

    // Guessed letters
    const guessed = Array.from(this.guessedLetters).sort().join(', ');
    document.getElementById('guessed-letters').textContent = guessed || 'None';
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Server Rack
    const rackX = 100;
    const rackY = 50;
    const rackW = 100;
    const rackH = 200;

    // Rack Frame
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(rackX, rackY, rackW, rackH);
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(rackX, rackY, rackW, rackH);

    // Server Units
    const unitH = 30;
    const units = 5;
    
    for (let i = 0; i < units; i++) {
      const y = rackY + 10 + i * (unitH + 5);
      
      // Determine unit state based on wrong guesses
      // 0 wrongs = all green
      // 1 wrong = bottom unit red
      // ...
      // 5 wrongs = all red
      
      // Map wrong guesses to units (approximate)
      const isDamaged = i >= (units - this.wrongGuesses);
      
      this.ctx.fillStyle = isDamaged ? '#450a0a' : '#064e3b'; // Dark red or dark green
      this.ctx.fillRect(rackX + 10, y, rackW - 20, unitH);
      
      // Lights
      this.ctx.fillStyle = isDamaged ? '#ef4444' : '#10b981'; // Bright red or bright green
      
      // Blinking effect for damaged units
      if (isDamaged && Date.now() % 500 < 250) {
        this.ctx.fillStyle = '#7f1d1d'; // Dim red
      }

      this.ctx.beginPath();
      this.ctx.arc(rackX + 20, y + unitH/2, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(rackX + 35, y + unitH/2, 4, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Status bar on unit
      this.ctx.fillRect(rackX + 50, y + 10, 30, 10);
    }

    // Critical Warning
    if (this.wrongGuesses >= 4) {
      this.ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.font = 'bold 20px monospace';
      this.ctx.fillStyle = '#ef4444';
      this.ctx.textAlign = 'center';
      if (Date.now() % 1000 < 500) {
        this.ctx.fillText('CRITICAL ERROR', 150, 30);
      }
    }

    // Win/Lose Overlay
    if (this.won) {
      this.ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.font = 'bold 40px Arial';
      this.ctx.fillStyle = '#065f46';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('SECURE', 150, 150);
    } else if (this.gameOver) {
      this.ctx.font = 'bold 40px Arial';
      this.ctx.fillStyle = '#7f1d1d';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('FAILED', 150, 150);
    }

    // Particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    this.ctx.globalAlpha = 1;

    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life -= 0.02;
      return p.life > 0;
    });

    if (!this.destroyed && (this.particles.length > 0 || this.wrongGuesses > 0)) {
      requestAnimationFrame(() => this.draw());
    }
  }

  updateStats() {
    document.getElementById('score').textContent = `Wins: ${this.wins} | Losses: ${this.losses}`;
  }

  updateStatus(msg) {
    document.getElementById('game-status').textContent = msg;
  }

  loadAchievements() {
    const defaults = {
      firstWin: false,
      streak5: false,
      streak10: false,
      hardMode: false,
      noHints: false,
      allCategories: false,
      score1000: false
    };

    const saved = localStorage.getItem('hangmanAchievements');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  }

  saveAchievements() {
    localStorage.setItem('hangmanAchievements', JSON.stringify(this.achievements));
  }

  checkAchievements() {
    let newAchievement = false;

    if (!this.achievements.firstWin && this.wins === 1) {
      this.achievements.firstWin = true;
      newAchievement = true;
      this.showAchievement('🏆 First Win!', 'You won your first game!');
    }

    if (!this.achievements.streak5 && this.currentStreak >= 5) {
      this.achievements.streak5 = true;
      newAchievement = true;
      this.showAchievement('🔥 Hot Streak!', '5 wins in a row!');
    }

    if (!this.achievements.streak10 && this.currentStreak >= 10) {
      this.achievements.streak10 = true;
      newAchievement = true;
      this.showAchievement('🔥🔥 On Fire!', '10 wins in a row!');
    }

    if (!this.achievements.hardMode && this.difficulty === 'hard' && this.won) {
      this.achievements.hardMode = true;
      newAchievement = true;
      this.showAchievement('💪 Hard Mode Master!', 'Won a hard mode game!');
    }

    if (!this.achievements.noHints && this.won && this.hintsUsed === 0) {
      this.achievements.noHints = true;
      newAchievement = true;
      this.showAchievement('🧠 Pure Skill!', 'Won without using hints!');
    }

    if (!this.achievements.score1000 && this.totalScore >= 1000) {
      this.achievements.score1000 = true;
      newAchievement = true;
      this.showAchievement('⭐ Score Master!', 'Reached 1000 total points!');
    }

    if (newAchievement) {
      this.saveAchievements();
      this.renderAchievements();
    }
  }

  showAchievement(title, description) {
    // Could show a toast notification here
    console.log('Achievement unlocked:', title, description);
  }

  renderAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;

    const achievementList = [
      { id: 'firstWin', icon: '🏆', title: 'First Win', desc: 'Win your first game' },
      { id: 'streak5', icon: '🔥', title: 'Hot Streak', desc: '5 wins in a row' },
      { id: 'streak10', icon: '🔥🔥', title: 'On Fire', desc: '10 wins in a row' },
      { id: 'hardMode', icon: '💪', title: 'Hard Mode', desc: 'Win on hard difficulty' },
      { id: 'noHints', icon: '🧠', title: 'Pure Skill', desc: 'Win without hints' },
      { id: 'score1000', icon: '⭐', title: 'Score Master', desc: 'Reach 1000 points' }
    ];

    container.innerHTML = achievementList.map(a => `
      <div class="achievement ${this.achievements[a.id] ? 'unlocked' : 'locked'}" title="${a.desc}">
        <span class="text-2xl">${a.icon}</span>
        <span class="text-xs mt-1">${a.title}</span>
      </div>
    `).join('');
  }

  resetStats() {
    if (confirm('Reset all stats and achievements?')) {
      this.wins = 0;
      this.losses = 0;
      this.currentStreak = 0;
      this.bestStreak = 0;
      this.totalScore = 0;
      this.achievements = this.loadAchievements();

      localStorage.removeItem('hangmanWins');
      localStorage.removeItem('hangmanLosses');
      localStorage.removeItem('hangmanBestStreak');
      localStorage.removeItem('hangmanTotalScore');
      localStorage.removeItem('hangmanAchievements');

      this.updateStats();
      this.renderAchievements();
      this.newGame();
    }
  }

  playSound(freq, duration) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }
  destroy() {
    this.destroyed = true;
    document.removeEventListener('keydown', this.handleKeydown);
  }
}

window.CodeHangman = CodeHangman;
