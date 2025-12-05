/**
 * DEV MEMORY: CODE MATCH
 * A unique memory card game with programming themes
 * - Match code concepts, tech logos, and programming terms
 * - 3D card flip animations
 * - Multiple difficulty levels and themes
 * - Streak bonuses and time challenges
 * - Beautiful particle effects
 */

class DevMemory {
  constructor() {
    this.container = document.getElementById('memory-game-container');
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.timer = 0;
    this.timerInterval = null;
    this.difficulty = 'medium';
    this.theme = 'languages';
    this.gameStarted = false;
    this.canFlip = true;
    this.timeLimit = 0;

    // Themes
    this.themes = {
      languages: [
        { id: 'js', content: 'JS', emoji: '📜', color: '#f7df1e', name: 'JavaScript' },
        { id: 'py', content: 'PY', emoji: '🐍', color: '#3776ab', name: 'Python' },
        { id: 'go', content: 'GO', emoji: '🔵', color: '#00add8', name: 'Go' },
        { id: 'rs', content: 'RS', emoji: '🦀', color: '#dea584', name: 'Rust' },
        { id: 'ts', content: 'TS', emoji: '💙', color: '#3178c6', name: 'TypeScript' },
        { id: 'rb', content: 'RB', emoji: '💎', color: '#cc342d', name: 'Ruby' },
        { id: 'java', content: 'JAVA', emoji: '☕', color: '#007396', name: 'Java' },
        { id: 'cpp', content: 'C++', emoji: '⚡', color: '#00599c', name: 'C++' },
        { id: 'php', content: 'PHP', emoji: '🐘', color: '#777bb4', name: 'PHP' },
        { id: 'swift', content: 'SWIFT', emoji: '🔶', color: '#fa7343', name: 'Swift' },
        { id: 'kt', content: 'KT', emoji: '🎨', color: '#7f52ff', name: 'Kotlin' },
        { id: 'dart', content: 'DART', emoji: '🎯', color: '#0175c2', name: 'Dart' }
      ],
      concepts: [
        { id: 'api', content: 'API', emoji: '🔌', color: '#10b981', name: 'API' },
        { id: 'db', content: 'DB', emoji: '🗄️', color: '#3b82f6', name: 'Database' },
        { id: 'git', content: 'GIT', emoji: '🌿', color: '#f05032', name: 'Git' },
        { id: 'docker', content: 'DOCK', emoji: '🐳', color: '#2496ed', name: 'Docker' },
        { id: 'cloud', content: 'CLOUD', emoji: '☁️', color: '#8b5cf6', name: 'Cloud' },
        { id: 'ci', content: 'CI/CD', emoji: '🔄', color: '#f59e0b', name: 'CI/CD' },
        { id: 'test', content: 'TEST', emoji: '🧪', color: '#ec4899', name: 'Testing' },
        { id: 'debug', content: 'DEBUG', emoji: '🐛', color: '#ef4444', name: 'Debug' },
        { id: 'deploy', content: 'DEPLOY', emoji: '🚀', color: '#06b6d4', name: 'Deploy' },
        { id: 'cache', content: 'CACHE', emoji: '⚡', color: '#84cc16', name: 'Cache' },
        { id: 'auth', content: 'AUTH', emoji: '🔐', color: '#a855f7', name: 'Auth' },
        { id: 'async', content: 'ASYNC', emoji: '⏱️', color: '#14b8a6', name: 'Async' }
      ],
      tools: [
        { id: 'vscode', content: 'VS CODE', emoji: '📝', color: '#007acc', name: 'VS Code' },
        { id: 'github', content: 'GITHUB', emoji: '🐙', color: '#181717', name: 'GitHub' },
        { id: 'npm', content: 'NPM', emoji: '📦', color: '#cb3837', name: 'NPM' },
        { id: 'webpack', content: 'WEBPACK', emoji: '📦', color: '#8dd6f9', name: 'Webpack' },
        { id: 'react', content: 'REACT', emoji: '⚛️', color: '#61dafb', name: 'React' },
        { id: 'vue', content: 'VUE', emoji: '💚', color: '#42b883', name: 'Vue' },
        { id: 'angular', content: 'ANGULAR', emoji: '🅰️', color: '#dd0031', name: 'Angular' },
        { id: 'node', content: 'NODE', emoji: '🟢', color: '#339933', name: 'Node.js' },
        { id: 'mongodb', content: 'MONGO', emoji: '🍃', color: '#47a248', name: 'MongoDB' },
        { id: 'redis', content: 'REDIS', emoji: '🔴', color: '#dc382d', name: 'Redis' },
        { id: 'postgres', content: 'PGSQL', emoji: '🐘', color: '#336791', name: 'PostgreSQL' },
        { id: 'aws', content: 'AWS', emoji: '☁️', color: '#ff9900', name: 'AWS' }
      ]
    };

    this.difficulties = {
      easy: { pairs: 6, timeLimit: 0 },
      medium: { pairs: 8, timeLimit: 60 },
      hard: { pairs: 12, timeLimit: 90 }
    };

    this.setupControls();
    this.updateUI();
  }

  setupControls() {
    // Difficulty buttons
    document.querySelectorAll('[data-difficulty]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.difficulty = btn.dataset.difficulty;
        document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (!this.gameStarted) this.start();
      });
    });

    // Theme buttons
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.theme = btn.dataset.theme;
        document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (!this.gameStarted) this.start();
      });
    });

    // Control buttons
    document.getElementById('start-memory-btn').addEventListener('click', () => this.start());
    document.getElementById('reset-memory-btn').addEventListener('click', () => this.reset());
  }

  start() {
    this.reset();
    this.gameStarted = true;
    const config = this.difficulties[this.difficulty];
    const themeCards = this.themes[this.theme];

    // Select random cards
    const selectedCards = this.shuffle([...themeCards]).slice(0, config.pairs);

    // Create pairs
    const cardPairs = [];
    selectedCards.forEach(card => {
      cardPairs.push({ ...card, pairId: Math.random() });
      cardPairs.push({ ...card, pairId: Math.random() });
    });

    this.totalPairs = config.pairs;
    this.cards = this.shuffle(cardPairs);
    this.timeLimit = config.timeLimit;
    this.timer = this.timeLimit > 0 ? this.timeLimit : 0;

    // Start timer if needed
    if (this.timeLimit > 0) {
      this.timerInterval = setInterval(() => {
        this.timer--;
        this.updateUI();
        if (this.timer <= 0) {
          this.gameOver(false);
        }
      }, 1000);
    } else {
      // Count up for easy mode
      this.timerInterval = setInterval(() => {
        this.timer++;
        this.updateUI();
      }, 1000);
    }

    this.render();
    this.updateStatus('🎮 Find all matching pairs!');
  }

  reset() {
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.score = 0;
    this.streak = 0;
    this.timer = 0;
    this.gameStarted = false;
    this.canFlip = true;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.container.innerHTML = '';
    this.updateUI();
    this.updateStatus('🎮 Select difficulty and theme to start!');
  }

  render() {
    this.container.innerHTML = '';
    this.container.className = `memory-grid memory-grid-${this.difficulty}`;

    this.cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.index = index;

      cardEl.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-front">
            <div class="card-pattern"></div>
            <span class="card-logo">{ }</span>
          </div>
          <div class="memory-card-back" style="background: linear-gradient(135deg, ${card.color}dd, ${card.color}99);">
            <div class="card-emoji">${card.emoji}</div>
            <div class="card-content">${card.content}</div>
          </div>
        </div>
      `;

      cardEl.addEventListener('click', () => this.flipCard(index));
      this.container.appendChild(cardEl);
    });
  }

  flipCard(index) {
    if (!this.canFlip) return;
    if (this.flippedCards.length >= 2) return;

    const cardEl = this.container.children[index];
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    // Flip animation
    cardEl.classList.add('flipped');
    this.flippedCards.push({ index, card: this.cards[index] });

    this.playSound(400, 0.1);

    if (this.flippedCards.length === 2) {
      this.moves++;
      this.canFlip = false;

      setTimeout(() => this.checkMatch(), 600);
    }
  }

  checkMatch() {
    const [first, second] = this.flippedCards;
    const firstEl = this.container.children[first.index];
    const secondEl = this.container.children[second.index];

    if (first.card.id === second.card.id) {
      // Match!
      firstEl.classList.add('matched');
      secondEl.classList.add('matched');

      this.matchedPairs++;
      this.streak++;
      this.bestStreak = Math.max(this.bestStreak, this.streak);

      // Score calculation
      const baseScore = 100;
      const streakBonus = this.streak * 20;
      const timeBonus = this.timeLimit > 0 ? Math.floor(this.timer * 2) : 0;
      this.score += baseScore + streakBonus + timeBonus;

      this.playSound(600 + (this.streak * 50), 0.2);
      this.createMatchParticles(firstEl, first.card.color);
      this.createMatchParticles(secondEl, first.card.color);

      if (this.streak > 1) {
        this.updateStatus(`🔥 ${this.streak}x Streak! +${baseScore + streakBonus} points!`);
      }

      // Check win
      if (this.matchedPairs === this.totalPairs) {
        setTimeout(() => this.gameOver(true), 500);
      }
    } else {
      // No match
      this.streak = 0;

      setTimeout(() => {
        firstEl.classList.remove('flipped');
        secondEl.classList.remove('flipped');
        this.playSound(200, 0.1);
      }, 400);
    }

    this.flippedCards = [];
    this.canFlip = true;
    this.updateUI();
  }

  gameOver(win) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.gameStarted = false;

    if (win) {
      const perfectionBonus = this.moves === this.totalPairs ? 500 : 0;
      this.score += perfectionBonus;

      let message = '🎉 You Won!';
      if (perfectionBonus > 0) message += ' PERFECT! 🏆';
      message += `\nScore: ${this.score} | Moves: ${this.moves}`;
      
      this.updateStatus(message);
      this.playSound(800, 0.3);
      this.createWinAnimation();
    } else {
      this.updateStatus('⌛ Time\'s Up! Game Over.');
      this.playSound(200, 0.5);
      // Reveal all cards
      Array.from(this.container.children).forEach(card => card.classList.add('flipped'));
    }
    
    this.updateUI();
  }

  createMatchParticles(cardEl, color) {
    const rect = cardEl.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'memory-particle';
      particle.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
      particle.style.top = (rect.top - containerRect.top + rect.height / 2) + 'px';
      particle.style.background = color;
      
      // Random size
      const size = Math.random() * 6 + 4;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';

      const angle = (Math.PI * 2 * i) / 15;
      const velocity = 100 + Math.random() * 50;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      particle.style.setProperty('--vx', vx + 'px');
      particle.style.setProperty('--vy', vy + 'px');

      this.container.appendChild(particle);

      setTimeout(() => particle.remove(), 800);
    }
  }

  createWinAnimation() {
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'memory-particle';
        particle.style.left = Math.random() * this.container.offsetWidth + 'px';
        particle.style.top = '-20px';
        particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
        particle.style.setProperty('--vx', (Math.random() - 0.5) * 100 + 'px');
        particle.style.setProperty('--vy', (Math.random() * 200 + 300) + 'px');

        this.container.appendChild(particle);
        setTimeout(() => particle.remove(), 2000);
      }, i * 30);
    }
  }

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  updateUI() {
    document.getElementById('memory-score').textContent = this.score;
    document.getElementById('memory-moves').textContent = this.moves;
    document.getElementById('memory-matches').textContent = `${this.matchedPairs}/${this.totalPairs || 0}`;
    document.getElementById('memory-streak').textContent = this.streak;

    const timeText = this.formatTime(this.timer);
    document.getElementById('memory-time').textContent = timeText;
    
    // Warning color for low time
    const timeEl = document.getElementById('memory-time');
    if (this.timeLimit > 0 && this.timer < 10) {
      timeEl.style.color = '#ef4444';
    } else {
      timeEl.style.color = '';
    }
  }

  updateStatus(msg) {
    document.getElementById('memory-status').textContent = msg;
  }

  playSound(freq, duration) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }
  destroy() {
    this.gameStarted = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}

window.DevMemory = DevMemory;
