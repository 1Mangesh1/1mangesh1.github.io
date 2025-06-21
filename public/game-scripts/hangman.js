class HangmanGame {
  constructor() {
    console.log('Initializing Hangman Game...');
    
    this.words = [
      // Programming Terms
      'JAVASCRIPT', 'PYTHON', 'TYPESCRIPT', 'ALGORITHM', 'FUNCTION', 'VARIABLE', 'ARRAY', 'OBJECT',
      'CLASS', 'METHOD', 'INTERFACE', 'DATABASE', 'FRAMEWORK', 'LIBRARY', 'COMPONENT', 'PACKAGE',
      'REPOSITORY', 'DEBUGGING', 'TESTING', 'DEPLOYMENT', 'BACKEND', 'FRONTEND', 'FULLSTACK',
      
      // Tech Companies & Tools
      'GITHUB', 'DOCKER', 'KUBERNETES', 'REACT', 'ANGULAR', 'NODEJS', 'EXPRESS', 'MONGODB',
      'POSTGRESQL', 'REDIS', 'GRAPHQL', 'WEBPACK', 'BABEL', 'ESLINT', 'PRETTIER', 'VSCODE',
      
      // General Words
      'COMPUTER', 'INTERNET', 'NETWORK', 'SERVER', 'CLIENT', 'BROWSER', 'WEBSITE', 'APPLICATION',
      'SOFTWARE', 'HARDWARE', 'PROGRAMMING', 'DEVELOPER', 'ENGINEER', 'TECHNOLOGY', 'INNOVATION'
    ];
    
    this.currentWord = '';
    this.guessedLetters = [];
    this.wrongGuesses = 0;
    this.maxWrongGuesses = 6;
    this.gameState = 'playing'; // 'playing', 'won', 'lost'
    this.score = { wins: 0, losses: 0 };
    
    console.log('Loading score...');
    this.loadScore();
    console.log('Initializing game...');
    this.initializeGame();
    console.log('Setting up event listeners...');
    this.setupEventListeners();
    console.log('Hangman Game initialized successfully!');
  }

  initializeGame() {
    this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
    this.guessedLetters = [];
    this.wrongGuesses = 0;
    this.gameState = 'playing';
    
    this.updateDisplay();
    this.drawHangman();
    this.createKeyboard();
  }

  updateDisplay() {
    // Update word display
    const wordDisplay = document.getElementById('word-display');
    if (wordDisplay) {
      const displayWord = this.currentWord
        .split('')
        .map(letter => this.guessedLetters.includes(letter) ? letter : '_')
        .join(' ');
      wordDisplay.textContent = displayWord;
    }

    // Update wrong guesses
    const wrongGuessesEl = document.getElementById('wrong-guesses');
    if (wrongGuessesEl) {
      wrongGuessesEl.textContent = `${this.wrongGuesses}/${this.maxWrongGuesses}`;
    }

    // Update guessed letters
    const guessedEl = document.getElementById('guessed-letters');
    if (guessedEl) {
      guessedEl.textContent = this.guessedLetters.length > 0 
        ? this.guessedLetters.join(', ') 
        : 'None';
    }

    // Update score
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
      scoreEl.textContent = `Wins: ${this.score.wins} | Losses: ${this.score.losses}`;
    }

    // Update game status
    const statusEl = document.getElementById('game-status');
    if (statusEl) {
      if (this.gameState === 'won') {
        statusEl.textContent = '🎉 Congratulations! You won!';
        statusEl.className = 'text-green-600 dark:text-green-400 font-semibold';
      } else if (this.gameState === 'lost') {
        statusEl.textContent = `💀 Game Over! The word was: ${this.currentWord}`;
        statusEl.className = 'text-red-600 dark:text-red-400 font-semibold';
      } else {
        statusEl.textContent = '🎯 Guess the word letter by letter!';
        statusEl.className = 'text-gray-600 dark:text-gray-400';
      }
    }
  }

  createKeyboard() {
    const keyboardEl = document.getElementById('keyboard');
    if (!keyboardEl) {
      console.error('Keyboard element not found!');
      return;
    }

    console.log('Creating keyboard...');
    keyboardEl.innerHTML = '';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    alphabet.split('').forEach(letter => {
      const button = document.createElement('button');
      button.textContent = letter;
      button.className = `px-3 py-2 m-1 rounded-md border font-medium transition-colors ${
        this.guessedLetters.includes(letter)
          ? this.currentWord.includes(letter)
            ? 'bg-green-500 text-white border-green-500'
            : 'bg-red-500 text-white border-red-500'
          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
      }`;
      
      button.disabled = this.guessedLetters.includes(letter) || this.gameState !== 'playing';
      
      button.addEventListener('click', () => {
        console.log('Button clicked:', letter);
        this.guessLetter(letter);
      });
      keyboardEl.appendChild(button);
    });
    console.log('Keyboard created with', alphabet.length, 'buttons');
  }

  guessLetter(letter) {
    if (this.guessedLetters.includes(letter) || this.gameState !== 'playing') return;

    this.guessedLetters.push(letter);

    if (this.currentWord.includes(letter)) {
      // Correct guess
      this.playSound('correct');
      
      // Check if word is complete
      if (this.currentWord.split('').every(l => this.guessedLetters.includes(l))) {
        this.gameState = 'won';
        this.score.wins++;
        this.saveScore();
        this.playSound('win');
      }
    } else {
      // Wrong guess
      this.wrongGuesses++;
      this.playSound('wrong');
      
      if (this.wrongGuesses >= this.maxWrongGuesses) {
        this.gameState = 'lost';
        this.score.losses++;
        this.saveScore();
        this.playSound('lose');
      }
    }

    this.updateDisplay();
    this.drawHangman();
    this.createKeyboard();
  }

  drawHangman() {
    const canvas = document.getElementById('hangman-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up drawing style
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Draw gallows base
    if (this.wrongGuesses >= 1) {
      ctx.beginPath();
      ctx.moveTo(50, 230);
      ctx.lineTo(150, 230);
      ctx.stroke();
    }

    // Draw gallows pole
    if (this.wrongGuesses >= 2) {
      ctx.beginPath();
      ctx.moveTo(100, 230);
      ctx.lineTo(100, 20);
      ctx.stroke();
    }

    // Draw gallows arm
    if (this.wrongGuesses >= 3) {
      ctx.beginPath();
      ctx.moveTo(100, 20);
      ctx.lineTo(180, 20);
      ctx.stroke();
    }

    // Draw noose
    if (this.wrongGuesses >= 4) {
      ctx.beginPath();
      ctx.moveTo(180, 20);
      ctx.lineTo(180, 50);
      ctx.stroke();
    }

    // Draw head
    if (this.wrongGuesses >= 5) {
      ctx.beginPath();
      ctx.arc(180, 70, 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw body
    if (this.wrongGuesses >= 6) {
      ctx.beginPath();
      ctx.moveTo(180, 90);
      ctx.lineTo(180, 180);
      ctx.stroke();

      // Draw arms
      ctx.beginPath();
      ctx.moveTo(160, 120);
      ctx.lineTo(200, 120);
      ctx.stroke();

      // Draw legs
      ctx.beginPath();
      ctx.moveTo(160, 200);
      ctx.lineTo(180, 180);
      ctx.lineTo(200, 200);
      ctx.stroke();
    }
  }

  playSound(type) {
    // Create audio feedback using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      let frequency;
      let duration;

      switch (type) {
        case 'correct':
          frequency = 800;
          duration = 200;
          break;
        case 'wrong':
          frequency = 300;
          duration = 400;
          break;
        case 'win':
          frequency = 1000;
          duration = 600;
          break;
        case 'lose':
          frequency = 200;
          duration = 800;
          break;
        default:
          frequency = 400;
          duration = 200;
      }

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      // Audio not supported, silently continue
    }
  }

  newGame() {
    this.initializeGame();
  }

  getHint() {
    if (this.gameState !== 'playing') return;

    const unguessedLetters = this.currentWord
      .split('')
      .filter(letter => !this.guessedLetters.includes(letter));

    if (unguessedLetters.length > 0) {
      const hintLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
      this.guessLetter(hintLetter);
    }
  }

  saveScore() {
    try {
      localStorage.setItem('hangman-score', JSON.stringify(this.score));
    } catch (error) {
      // localStorage not available, silently continue
    }
  }

  loadScore() {
    try {
      const savedScore = localStorage.getItem('hangman-score');
      if (savedScore) {
        this.score = JSON.parse(savedScore);
      }
    } catch (error) {
      // localStorage not available or invalid data, use default score
      this.score = { wins: 0, losses: 0 };
    }
  }

  resetScore() {
    this.score = { wins: 0, losses: 0 };
    this.saveScore();
    this.updateDisplay();
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // New game button
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => this.newGame());
      console.log('New game button event listener added');
    } else {
      console.warn('New game button not found');
    }

    // Hint button
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => this.getHint());
      console.log('Hint button event listener added');
    } else {
      console.warn('Hint button not found');
    }

    // Reset score button
    const resetScoreBtn = document.getElementById('reset-score-btn');
    if (resetScoreBtn) {
      resetScoreBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset your score?')) {
          this.resetScore();
        }
      });
      console.log('Reset score button event listener added');
    } else {
      console.warn('Reset score button not found');
    }

    // Keyboard input
    document.addEventListener('keydown', (event) => {
      const letter = event.key.toUpperCase();
      if (letter >= 'A' && letter <= 'Z') {
        console.log('Key pressed:', letter);
        this.guessLetter(letter);
      }
    });
    console.log('Keyboard event listener added');
  }
}

// Initialize the game when this script is loaded
if (typeof window !== 'undefined') {
  window.HangmanGame = HangmanGame;
} 