// Emoji Clicker - A fun, fast-paced clicking game
// Click emojis as they fall from the top!

const gameContainer = document.getElementById('emoji-clicker-game');
if (!gameContainer) throw new Error('Game container not found');

const game = {
  score: 0,
  multiplier: 1,
  gameActive: false,
  currentEmojis: [],
  gameSpeed: 1,
  level: 1,
  emojis: ['🐛', '🎮', '💻', '🚀', '📱', '⚡', '🎯', '🏆', '💡', '🌟'],

  init() {
    this.renderUI();
    this.attachEventListeners();
  },

  renderUI() {
    gameContainer.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white mb-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">Emoji Clicker</h2>
            <button id="start-game" class="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-all">
              Start Game
            </button>
          </div>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <p class="text-sm opacity-80">Score</p>
              <p class="text-3xl font-bold">${this.score}</p>
            </div>
            <div>
              <p class="text-sm opacity-80">Level</p>
              <p class="text-3xl font-bold">${this.level}</p>
            </div>
            <div>
              <p class="text-sm opacity-80">Multiplier</p>
              <p class="text-3xl font-bold">x${this.multiplier}</p>
            </div>
          </div>
        </div>

        <div id="game-area" class="relative w-full h-96 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border-4 border-purple-300 dark:border-purple-600 overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none" id="game-prompt">
            <p class="text-xl">Click "Start Game" to begin!</p>
          </div>
        </div>

        <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          <p>Click falling emojis as quickly as you can! Level up by reaching score milestones.</p>
        </div>
      </div>
    `;
  },

  attachEventListeners() {
    document.getElementById('start-game').addEventListener('click', () => this.startGame());
  },

  startGame() {
    this.gameActive = true;
    this.score = 0;
    this.multiplier = 1;
    this.level = 1;
    this.gameSpeed = 1;
    this.currentEmojis = [];
    this.renderUI();
    this.attachEventListeners();

    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';
    gameArea.style.overflow = 'hidden';

    // Game loop
    const gameTimer = setInterval(() => {
      if (!this.gameActive) {
        clearInterval(gameTimer);
        this.endGame();
        return;
      }

      // Spawn new emoji
      if (Math.random() < 0.3 + 0.02 * this.level) {
        this.spawnEmoji(gameArea);
      }

      // Update positions
      const emojiElements = gameArea.querySelectorAll('.game-emoji');
      emojiElements.forEach((el, idx) => {
        const currentTop = parseFloat(el.style.top) || 0;
        const newTop = currentTop + (2 + this.gameSpeed);
        el.style.top = newTop + 'px';

        if (newTop > 400) {
          this.gameActive = false;
        }
      });

      // Level up based on score
      const newLevel = Math.floor(this.score / 50) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
        this.multiplier = 1 + (this.level - 1) * 0.5;
        this.gameSpeed = 1 + (this.level - 1) * 0.3;
      }
    }, 30);

    setTimeout(() => {
      if (this.gameActive) {
        this.gameActive = false;
      }
    }, 30000); // 30 second game
  },

  spawnEmoji(container) {
    const emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    const left = Math.random() * (container.clientWidth - 40);
    
    const emojiEl = document.createElement('div');
    emojiEl.className = 'game-emoji absolute cursor-pointer select-none transition-transform hover:scale-110';
    emojiEl.textContent = emoji;
    emojiEl.style.left = left + 'px';
    emojiEl.style.top = '0px';
    emojiEl.style.fontSize = '32px';
    emojiEl.style.width = '40px';
    emojiEl.style.height = '40px';
    emojiEl.style.display = 'flex';
    emojiEl.style.alignItems = 'center';
    emojiEl.style.justifyContent = 'center';

    emojiEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const points = Math.floor(10 * this.multiplier);
      this.score += points;

      // Floating text
      const floatingText = document.createElement('div');
      floatingText.textContent = `+${points}`;
      floatingText.style.position = 'absolute';
      floatingText.style.left = e.clientX + 'px';
      floatingText.style.top = e.clientY + 'px';
      floatingText.style.color = '#10b981';
      floatingText.style.fontWeight = 'bold';
      floatingText.style.pointerEvents = 'none';
      floatingText.style.animation = 'float 1s ease-out forwards';
      document.getElementById('game-area').appendChild(floatingText);

      setTimeout(() => floatingText.remove(), 1000);
      emojiEl.remove();

      this.renderUI();
      this.attachEventListeners();
    });

    container.appendChild(emojiEl);
  },

  endGame() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = `
      <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
        <h3 class="text-4xl font-bold mb-4">Game Over!</h3>
        <p class="text-2xl mb-2">Final Score: ${this.score}</p>
        <p class="text-xl mb-6">Level ${this.level} reached!</p>
        <button id="restart-game" class="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-bold transition-all">
          Play Again
        </button>
      </div>
    `;
    document.getElementById('restart-game')?.addEventListener('click', () => this.startGame());
  }
};

// Add floating animation
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-40px);
    }
  }
`;
document.head.appendChild(style);

game.init();
