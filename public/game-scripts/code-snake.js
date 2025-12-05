/**
 * CODE SNAKE: MATRIX EDITION
 * A unique snake game where you're debugging code in the matrix!
 * - Enhanced Matrix rain background effect
 * - Code snippet eating with syntax highlighting
 * - Power-ups: Speed, Ghost, Magnet, Glitch
 * - Particle effects and smooth animations
 * - Portal teleportation
 * - No traditional grid movement!
 */

class CodeSnake {
  constructor() {
    this.canvas = document.getElementById('snake-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;

    // Snake with smooth movement
    this.snake = [];
    this.snakeLength = 5;
    this.headX = this.tileCount / 2;
    this.headY = this.tileCount / 2;
    this.velocityX = 0;
    this.velocityY = 0;
    this.nextVelocityX = 0;
    this.nextVelocityY = 0;

    // Game state
    this.score = 0;
    this.highScore = localStorage.getItem('codeSnakeHigh') || 0;
    this.gameRunning = false;
    this.gameOver = false;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;

    // Matrix background
    this.matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    this.matrixColumns = [];
    this.initMatrixRain();

    // Code snippets as food
    this.codeSnippets = [
      { code: 'if()', color: '#3b82f6', points: 10 },
      { code: 'for()', color: '#10b981', points: 15 },
      { code: 'func()', color: '#f59e0b', points: 20 },
      { code: 'class{}', color: '#8b5cf6', points: 25 },
      { code: 'async', color: '#ec4899', points: 30 },
      { code: 'import', color: '#06b6d4', points: 35 },
      { code: 'return', color: '#ef4444', points: 40 },
      { code: 'await', color: '#8b5cf6', points: 45 }
    ];
    this.currentFood = null;

    // Power-ups
    this.portals = [];
    this.powerUp = null;
    this.powerUpActive = null;
    this.powerUpTimer = 0;
    
    // Effects
    this.glitchIntensity = 0;
    this.particles = [];
    this.shake = 0;

    // Animation
    this.lastTime = 0;
    this.gameSpeed = 150;
    this.gameLoopTimeout = null;
    this.handleKeydown = this.handleKeydown.bind(this);

    this.init();
  }

  init() {
    // Initialize snake
    for (let i = 0; i < this.snakeLength; i++) {
      this.snake.push({
        x: this.headX - i,
        y: this.headY,
        glow: 0
      });
    }

    this.spawnFood();
    this.setupControls();
    this.updateUI();
    this.draw();
  }

  initMatrixRain() {
    const columnCount = Math.floor(this.canvas.width / 14);
    this.matrixColumns = [];
    for (let i = 0; i < columnCount; i++) {
      this.matrixColumns.push({
        x: i * 14,
        y: Math.random() * this.canvas.height,
        speed: Math.random() * 3 + 1,
        chars: [],
        color: '#00ff00'
      });
    }
  }

  handleKeydown(e) {
    const handleDirection = (x, y) => {
      if ((x !== -this.velocityX || this.velocityX === 0) &&
          (y !== -this.velocityY || this.velocityY === 0)) {
        this.nextVelocityX = x;
        this.nextVelocityY = y;
        if (!this.gameRunning && !this.gameOver) {
          this.start();
        }
      }
    };

    switch(e.key) {
      case 'ArrowUp': case 'w': case 'W':
        handleDirection(0, -1);
        e.preventDefault();
        break;
      case 'ArrowDown': case 's': case 'S':
        handleDirection(0, 1);
        e.preventDefault();
        break;
      case 'ArrowLeft': case 'a': case 'A':
        handleDirection(-1, 0);
        e.preventDefault();
        break;
      case 'ArrowRight': case 'd': case 'D':
        handleDirection(1, 0);
        e.preventDefault();
        break;
      case ' ':
        if (this.gameOver) this.reset();
        else if (!this.gameRunning) this.start();
        e.preventDefault();
        break;
    }
  }

  setupControls() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.addEventListener('keydown', this.handleKeydown);

    const handleDirection = (x, y) => {
      if ((x !== -this.velocityX || this.velocityX === 0) &&
          (y !== -this.velocityY || this.velocityY === 0)) {
        this.nextVelocityX = x;
        this.nextVelocityY = y;
        if (!this.gameRunning && !this.gameOver) {
          this.start();
        }
      }
    };

    // Mobile controls
    ['start-snake-btn', 'pause-snake-btn', 'reset-snake-btn',
     'snake-up', 'snake-down', 'snake-left', 'snake-right'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      if (id === 'start-snake-btn') el.onclick = () => this.start();
      else if (id === 'pause-snake-btn') el.onclick = () => this.pause();
      else if (id === 'reset-snake-btn') el.onclick = () => this.reset();
      else if (id === 'snake-up') el.onclick = () => handleDirection(0, -1);
      else if (id === 'snake-down') el.onclick = () => handleDirection(0, 1);
      else if (id === 'snake-left') el.onclick = () => handleDirection(-1, 0);
      else if (id === 'snake-right') el.onclick = () => handleDirection(1, 0);
    });

    // Touch swipe
    let touchStart = { x: 0, y: 0 };
    this.canvas.addEventListener('touchstart', e => {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    this.canvas.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        handleDirection(dx > 0 ? 1 : -1, 0);
      } else {
        handleDirection(0, dy > 0 ? 1 : -1);
      }
    });
  }

  start() {
    if (this.gameOver) {
      this.reset();
      return;
    }
    this.gameRunning = true;
    this.updateStatus('🐍 Navigate through the matrix!');
    this.gameLoop();
  }

  pause() {
    this.gameRunning = !this.gameRunning;
    this.updateStatus(this.gameRunning ? '▶️ Resumed' : '⏸️ Paused');
    if (this.gameRunning) this.gameLoop();
    else if (this.gameLoopTimeout) clearTimeout(this.gameLoopTimeout);
  }

  reset() {
    this.snake = [];
    this.snakeLength = 5;
    this.headX = this.tileCount / 2;
    this.headY = this.tileCount / 2;
    this.velocityX = 0;
    this.velocityY = 0;
    this.nextVelocityX = 0;
    this.nextVelocityY = 0;
    this.score = 0;
    this.combo = 0;
    this.gameRunning = false;
    this.gameOver = false;
    this.portals = [];
    this.powerUp = null;
    this.powerUpActive = null;
    this.particles = [];
    this.glitchIntensity = 0;
    if (this.gameLoopTimeout) clearTimeout(this.gameLoopTimeout);
    this.init();
  }

  gameLoop() {
    if (!this.gameRunning) return;

    this.gameLoopTimeout = setTimeout(() => {
      this.update();
      this.draw();
      if (!this.gameOver) this.gameLoop();
    }, this.powerUpActive === 'speed' ? this.gameSpeed * 0.6 : this.gameSpeed);
  }

  update() {
    // Update velocity
    if (this.nextVelocityX !== 0 || this.nextVelocityY !== 0) {
      this.velocityX = this.nextVelocityX;
      this.velocityY = this.nextVelocityY;
    }

    // Move head
    this.headX += this.velocityX;
    this.headY += this.velocityY;

    // Magnet effect
    if (this.powerUpActive === 'magnet' && this.currentFood) {
      const dx = this.currentFood.x - this.headX;
      const dy = this.currentFood.y - this.headY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < 5) {
        this.currentFood.x -= dx * 0.1;
        this.currentFood.y -= dy * 0.1;
      }
    }

    // Check portal teleportation
    for (const portal of this.portals) {
      if (Math.floor(this.headX) === portal.x && Math.floor(this.headY) === portal.y) {
        const otherPortal = this.portals.find(p => p !== portal);
        if (otherPortal) {
          this.headX = otherPortal.x;
          this.headY = otherPortal.y;
          this.createPortalParticles(otherPortal.x, otherPortal.y);
          this.playSound(600, 0.1);
          this.shake = 5;
        }
      }
    }

    // Check walls (with ghost mode)
    if (this.powerUpActive !== 'ghost') {
      if (this.headX < 0 || this.headX >= this.tileCount ||
          this.headY < 0 || this.headY >= this.tileCount) {
        this.endGame();
        return;
      }
    } else {
      // Wrap around in ghost mode
      if (this.headX < 0) this.headX = this.tileCount - 1;
      if (this.headX >= this.tileCount) this.headX = 0;
      if (this.headY < 0) this.headY = this.tileCount - 1;
      if (this.headY >= this.tileCount) this.headY = 0;
    }

    // Add new head
    this.snake.unshift({
      x: this.headX,
      y: this.headY,
      glow: 1
    });

    // Check self collision (not in ghost mode)
    if (this.powerUpActive !== 'ghost') {
      for (let i = 4; i < this.snake.length; i++) {
        const dist = Math.sqrt(
          Math.pow(this.snake[i].x - this.headX, 2) +
          Math.pow(this.snake[i].y - this.headY, 2)
        );
        if (dist < 0.5) {
          this.endGame();
          return;
        }
      }
    }

    // Check food collision
    if (this.currentFood) {
      const dist = Math.sqrt(
        Math.pow(this.currentFood.x - this.headX, 2) +
        Math.pow(this.currentFood.y - this.headY, 2)
      );
      if (dist < 1) {
        this.eatFood();
      }
    }

    // Check power-up collision
    if (this.powerUp) {
      const dist = Math.sqrt(
        Math.pow(this.powerUp.x - this.headX, 2) +
        Math.pow(this.powerUp.y - this.headY, 2)
      );
      if (dist < 1) {
        this.activatePowerUp();
      }
    }

    // Trim snake
    while (this.snake.length > this.snakeLength) {
      this.snake.pop();
    }

    // Fade glow
    this.snake.forEach(segment => {
      if (segment.glow > 0) segment.glow -= 0.05;
    });

    // Update power-up timer
    if (this.powerUpActive && Date.now() > this.powerUpTimer) {
      this.powerUpActive = null;
      this.updateStatus('⚡ Power-up expired!');
      this.glitchIntensity = 0;
    }

    // Update particles
    this.particles = this.particles.filter(p => {
      p.life -= 0.02;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      return p.life > 0;
    });
    
    // Shake decay
    if (this.shake > 0) this.shake *= 0.9;
  }

  draw() {
    // Apply shake
    this.ctx.save();
    if (this.shake > 0.5) {
      this.ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }

    // Glitch effect
    if (this.glitchIntensity > 0 && Math.random() < this.glitchIntensity) {
      this.ctx.translate((Math.random() - 0.5) * 10, 0);
      this.ctx.fillStyle = `rgba(${Math.random() * 255}, 0, 0, 0.1)`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Matrix background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Matrix rain
    this.ctx.font = '12px monospace';
    this.matrixColumns.forEach(col => {
      const char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
      this.ctx.fillStyle = col.color + '40'; // Transparent
      this.ctx.fillText(char, col.x, col.y);
      
      // Bright head of rain
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(char, col.x, col.y + 12);
      
      col.y += col.speed;
      if (col.y > this.canvas.height && Math.random() > 0.975) {
        col.y = 0;
        col.color = this.powerUpActive === 'glitch' ? '#ff0000' : '#00ff00';
      }
    });

    // Grid (subtle)
    this.ctx.strokeStyle = '#00ff0008';
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }

    // Portals
    this.portals.forEach(portal => {
      const time = Date.now() / 200;
      this.ctx.save();
      this.ctx.translate(portal.x * this.gridSize + this.gridSize/2, portal.y * this.gridSize + this.gridSize/2);
      this.ctx.rotate(time);

      for (let i = 0; i < 3; i++) {
        this.ctx.strokeStyle = `hsl(${(time * 50 + i * 120) % 360}, 100%, 50%)`;
        this.ctx.lineWidth = 3 - i;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8 + i * 2, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      this.ctx.restore();
    });

    // Food
    if (this.currentFood) {
      const pulse = Math.sin(Date.now() / 200) * 2 + this.gridSize - 4;

      // Glow
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = this.currentFood.color;

      this.ctx.fillStyle = this.currentFood.color;
      this.ctx.beginPath();
      this.ctx.arc(
        this.currentFood.x * this.gridSize + this.gridSize/2,
        this.currentFood.y * this.gridSize + this.gridSize/2,
        pulse / 2,
        0, Math.PI * 2
      );
      this.ctx.fill();

      this.ctx.shadowBlur = 0;

      // Code text
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        this.currentFood.code,
        this.currentFood.x * this.gridSize + this.gridSize/2,
        this.currentFood.y * this.gridSize + this.gridSize/2 - 15
      );
    }

    // Power-up
    if (this.powerUp) {
      const spin = Date.now() / 100;
      this.ctx.save();
      this.ctx.translate(
        this.powerUp.x * this.gridSize + this.gridSize/2,
        this.powerUp.y * this.gridSize + this.gridSize/2
      );
      this.ctx.rotate(spin);
      this.ctx.fillStyle = this.powerUp.color;
      this.ctx.fillRect(-8, -8, 16, 16);
      this.ctx.restore();

      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        this.powerUp.emoji,
        this.powerUp.x * this.gridSize + this.gridSize/2,
        this.powerUp.y * this.gridSize + this.gridSize/2 + 1
      );
    }

    // Snake
    for (let i = 0; i < this.snake.length; i++) {
      const segment = this.snake[i];
      const alpha = 1 - (i / this.snake.length) * 0.7;

      // Glow effect
      if (segment.glow > 0) {
        this.ctx.shadowBlur = 15 * segment.glow;
        this.ctx.shadowColor = this.powerUpActive === 'ghost' ? '#a78bfa' : '#10b981';
      }

      // Color based on power-up
      let color;
      if (this.powerUpActive === 'ghost') {
        color = `rgba(167, 139, 250, ${alpha * 0.6})`;
      } else if (this.powerUpActive === 'speed') {
        color = `rgba(251, 191, 36, ${alpha})`;
      } else if (this.powerUpActive === 'glitch') {
        color = `rgba(239, 68, 68, ${alpha})`;
      } else {
        const hue = 150 - (i * 2);
        color = `hsla(${hue}, 80%, 60%, ${alpha})`;
      }

      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(
        segment.x * this.gridSize + this.gridSize/2,
        segment.y * this.gridSize + this.gridSize/2,
        this.gridSize / 2 - 1,
        0, Math.PI * 2
      );
      this.ctx.fill();

      this.ctx.shadowBlur = 0;

      // Eyes on head
      if (i === 0) {
        this.ctx.fillStyle = '#000';
        const eyeSize = 3;
        const eyeOffset = 4;

        if (this.velocityX > 0) {
          this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffset - eyeSize, segment.y * this.gridSize + 5, eyeSize, eyeSize);
          this.ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffset - eyeSize, segment.y * this.gridSize + 12, eyeSize, eyeSize);
        } else if (this.velocityX < 0) {
          this.ctx.fillRect(segment.x * this.gridSize + eyeOffset, segment.y * this.gridSize + 5, eyeSize, eyeSize);
          this.ctx.fillRect(segment.x * this.gridSize + eyeOffset, segment.y * this.gridSize + 12, eyeSize, eyeSize);
        } else if (this.velocityY < 0) {
          this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + eyeOffset, eyeSize, eyeSize);
          this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + eyeOffset, eyeSize, eyeSize);
        } else if (this.velocityY > 0) {
          this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
          this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
        }
      }
    }

    // Particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    // Combo display
    if (this.combo > 1) {
      this.ctx.font = 'bold 24px Arial';
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${this.combo}x COMBO!`, this.canvas.width / 2, 30);
    }
    
    this.ctx.restore();
  }

  spawnFood() {
    const level = Math.floor(this.score / 100);
    const maxFoodIndex = Math.min(level, this.codeSnippets.length - 1);
    const foodType = this.codeSnippets[Math.floor(Math.random() * (maxFoodIndex + 1))];

    this.currentFood = {
      ...foodType,
      x: Math.floor(Math.random() * this.tileCount),
      y: Math.floor(Math.random() * this.tileCount)
    };

    // Spawn power-up occasionally
    if (Math.random() < 0.15 && !this.powerUp) {
      const powerUpTypes = [
        { emoji: '⚡', name: 'Speed', color: '#fbbf24', effect: 'speed', duration: 5000 },
        { emoji: '👻', name: 'Ghost', color: '#a78bfa', effect: 'ghost', duration: 6000 },
        { emoji: '🌀', name: 'Portal', color: '#06b6d4', effect: 'portal', duration: 0 },
        { emoji: '🧲', name: 'Magnet', color: '#ec4899', effect: 'magnet', duration: 8000 },
        { emoji: '👾', name: 'Glitch', color: '#ef4444', effect: 'glitch', duration: 5000 }
      ];
      const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      this.powerUp = {
        ...type,
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
    }
  }

  eatFood() {
    this.score += this.currentFood.points * (this.combo + 1);
    this.snakeLength += 2;
    this.combo++;
    this.maxCombo = Math.max(this.combo, this.maxCombo);

    this.createParticles(this.currentFood.x, this.currentFood.y, this.currentFood.color);
    this.playSound(400 + this.combo * 50, 0.1);
    this.shake = 2;

    this.spawnFood();
    this.updateUI();

    // Reset combo timer
    clearTimeout(this.comboTimeout);
    this.comboTimeout = setTimeout(() => {
      if (this.combo > 1) {
        this.updateStatus(`🎉 ${this.combo}x combo ended!`);
      }
      this.combo = 0;
    }, 3000);
  }

  activatePowerUp() {
    this.playSound(500, 0.2);

    if (this.powerUp.effect === 'portal') {
      // Create two portals
      this.portals = [
        { x: Math.floor(Math.random() * this.tileCount), y: Math.floor(Math.random() * this.tileCount) },
        { x: Math.floor(Math.random() * this.tileCount), y: Math.floor(Math.random() * this.tileCount) }
      ];
      this.updateStatus('🌀 Portals activated!');
      setTimeout(() => {
        this.portals = [];
        this.updateStatus('🌀 Portals closed');
      }, 10000);
    } else {
      this.powerUpActive = this.powerUp.effect;
      this.powerUpTimer = Date.now() + this.powerUp.duration;
      this.updateStatus(`${this.powerUp.emoji} ${this.powerUp.name} activated!`);
      
      if (this.powerUp.effect === 'glitch') {
        this.glitchIntensity = 0.1;
      }
    }

    this.powerUp = null;
  }

  createParticles(x, y, color) {
    const rgb = color.match(/\d+/g) || [0, 255, 0];
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x * this.gridSize + this.gridSize / 2,
        y: y * this.gridSize + this.gridSize / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 2,
        life: 1,
        size: Math.random() * 4 + 2,
        color: rgb.join(',')
      });
    }
  }

  createPortalParticles(x, y) {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: x * this.gridSize + this.gridSize / 2,
        y: y * this.gridSize + this.gridSize / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        size: Math.random() * 3 + 1,
        color: '6, 182, 212'
      });
    }
  }

  endGame() {
    this.gameOver = true;
    this.gameRunning = false;
    this.glitchIntensity = 0.3;
    this.shake = 10;
    
    setTimeout(() => { this.glitchIntensity = 0; }, 1000);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('codeSnakeHigh', this.highScore);
      this.updateStatus('🏆 NEW HIGH SCORE! Press SPACE to retry');
    } else {
      this.updateStatus('💀 Game Over! Press SPACE to retry');
    }

    this.playSound(200, 0.4);
    this.updateUI();
  }

  updateUI() {
    document.getElementById('snake-score').textContent = this.score;
    document.getElementById('snake-high-score').textContent = this.highScore;
    document.getElementById('snake-level').textContent = Math.floor(this.score / 100) + 1;
    document.getElementById('snake-length').textContent = this.snakeLength;
  }

  updateStatus(msg) {
    document.getElementById('snake-status').textContent = msg;
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
    this.gameRunning = false;
    this.gameOver = true;
    if (this.gameLoopTimeout) clearTimeout(this.gameLoopTimeout);
    document.removeEventListener('keydown', this.handleKeydown);
    
    // Remove button listeners by replacing elements
    ['start-snake-btn', 'pause-snake-btn', 'reset-snake-btn', 'snake-up', 'snake-left', 'snake-right', 'snake-down'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
      }
    });
  }
}

window.CodeSnake = CodeSnake;
