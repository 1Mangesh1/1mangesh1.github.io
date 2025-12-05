/**
 * BUG BLASTER: EXTREME EDITION
 * An action-packed bug hunting game with power-ups, bosses, and mayhem!
 * Features:
 * - Multiple bug types with unique behaviors
 * - Power-ups and combo system
 * - Boss battles every 5 waves
 * - Particle effects and screen shake
 * - Achievement system
 * - Endless mode and daily challenges
 */

class BugBlaster {
  constructor() {
    this.canvas = document.getElementById('wack-a-bug-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Game state
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('bugBlasterHighScore') || '0');
    this.lives = 3;
    this.level = 1;
    this.wave = 1;
    this.combo = 0;
    this.maxCombo = 0;
    this.gameRunning = false;
    this.gameOver = false;

    // Entities
    this.bugs = [];
    this.powerUps = [];
    this.particles = [];
    this.splats = [];
    this.projectiles = [];
    this.boss = null;

    // Power-up states
    this.activePowerUps = {};
    this.powerUpTimers = {};

    // Bug types with different behaviors
    this.bugTypes = {
      basic: { size: 20, speed: 1, points: 10, color: '#ef4444', health: 1 },
      fast: { size: 15, speed: 3, points: 20, color: '#3b82f6', health: 1 },
      tank: { size: 30, speed: 0.5, points: 30, color: '#8b5cf6', health: 3 },
      splitter: { size: 25, speed: 1.5, points: 25, color: '#f59e0b', health: 2, splits: true },
      teleporter: { size: 18, speed: 2, points: 35, color: '#06b6d4', health: 1, teleports: true },
      bomber: { size: 22, speed: 1, points: 40, color: '#ec4899', health: 2, explodes: true },
      golden: { size: 15, speed: 4, points: 100, color: '#fbbf24', health: 1, golden: true },
      trap: { size: 22, speed: 0.8, points: -50, color: '#1f2937', health: 1, trap: true } // Don't click!
    };

    // Power-ups
    this.powerUpTypes = {
      autofire: { duration: 10000, icon: '⚡', name: 'Auto-Fire' },
      slowmo: { duration: 8000, icon: '🐌', name: 'Slow Motion' },
      shield: { duration: 15000, icon: '🛡️', name: 'Shield' },
      multishot: { duration: 12000, icon: '✨', name: 'Multi-Shot' },
      nuke: { duration: 0, icon: '💣', name: 'Nuke', instant: true },
      freeze: { duration: 5000, icon: '❄️', name: 'Freeze' }
    };

    // Camera shake
    this.shake = { x: 0, y: 0, intensity: 0 };

    // Achievements
    this.achievements = this.loadAchievements();

    // Sounds
    this.sounds = {
      hit: () => this.playSound(400, 0.1),
      miss: () => this.playSound(200, 0.1),
      powerUp: () => this.playSound(600, 0.2),
      bossHit: () => this.playSound(300, 0.15),
      gameOver: () => this.playSound(150, 0.5),
      splat: () => this.playSound(100, 0.2),
      trap: () => this.playSound(100, 0.5)
    };

    this.autoFireInterval = null;
    this.destroyed = false;

    this.init();
  }

  init() {
    this.setupControls();
    this.updateUI();
  }

  setupControls() {
    // Click handling
    this.canvas.addEventListener('click', (e) => this.handleClick(e));

    // Touch handling
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.checkHit(x, y);
    });

    // Buttons
    document.getElementById('start-game-btn')?.addEventListener('click', () => this.start());
    document.getElementById('pause-game-btn')?.addEventListener('click', () => this.togglePause());
    document.getElementById('reset-game-btn')?.addEventListener('click', () => this.reset());
  }

  start() {
    this.gameRunning = true;
    this.gameOver = false;
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.wave = 1;
    this.combo = 0;
    this.bugs = [];
    this.powerUps = [];
    this.particles = [];
    this.splats = [];
    this.projectiles = [];
    this.boss = null;
    this.activePowerUps = {};

    this.updateStatus('🎮 Get ready! Wave 1 starting...');
    setTimeout(() => this.spawnWave(), 1000);
    this.gameLoop();
  }

  togglePause() {
    this.gameRunning = !this.gameRunning;
    if (this.gameRunning) {
      this.updateStatus('▶️ Game resumed!');
      this.gameLoop();
    } else {
      this.updateStatus('⏸️ Game paused');
    }
  }

  reset() {
    this.gameRunning = false;
    this.gameOver = false;
    this.bugs = [];
    this.powerUps = [];
    this.particles = [];
    this.splats = [];
    this.boss = null;
    this.draw();
    this.updateStatus('Click Start to begin!');
  }

  spawnWave() {
    // Boss wave every 5 waves
    if (this.wave % 5 === 0) {
      this.spawnBoss();
      return;
    }

    const bugCount = 5 + this.wave * 2;
    const types = Object.keys(this.bugTypes);

    for (let i = 0; i < bugCount; i++) {
      setTimeout(() => {
        if (this.destroyed) return;
        const typeIndex = Math.min(Math.floor(this.wave / 2), types.length - 1);
        const availableTypes = types.slice(0, typeIndex + 1);
        
        // Add chance for golden bug and trap bug
        if (Math.random() < 0.05) availableTypes.push('golden');
        if (Math.random() < 0.1) availableTypes.push('trap');

        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        this.spawnBug(type);
      }, i * 300);
    }

    this.updateStatus(`Wave ${this.wave} - ${bugCount} bugs incoming!`);
  }

  spawnBug(type) {
    const bugType = this.bugTypes[type];
    const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let x, y, vx, vy;

    switch(side) {
      case 0: x = Math.random() * this.canvas.width; y = -30; vx = 0; vy = 1; break;
      case 1: x = this.canvas.width + 30; y = Math.random() * this.canvas.height; vx = -1; vy = 0; break;
      case 2: x = Math.random() * this.canvas.width; y = this.canvas.height + 30; vx = 0; vy = -1; break;
      case 3: x = -30; y = Math.random() * this.canvas.height; vx = 1; vy = 0; break;
    }

    this.bugs.push({
      x, y,
      vx: vx * bugType.speed,
      vy: vy * bugType.speed,
      type,
      ...bugType,
      health: bugType.health,
      maxHealth: bugType.health,
      teleportTimer: 0
    });
  }

  spawnBoss() {
    this.updateStatus(`🦑 BOSS WAVE ${this.wave / 5}! 🦑`);

    const bossHealth = 20 + (this.wave / 5) * 10;

    this.boss = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      size: 60,
      health: bossHealth,
      maxHealth: bossHealth,
      phase: 1,
      attackTimer: 0,
      moveTimer: 0,
      vx: 0,
      vy: 0,
      color: '#dc2626',
      angry: false
    };
  }

  spawnPowerUp(x, y) {
    if (Math.random() < 0.3) { // 30% chance
      const types = Object.keys(this.powerUpTypes);
      const type = types[Math.floor(Math.random() * types.length)];

      this.powerUps.push({
        x, y,
        type,
        ...this.powerUpTypes[type],
        vy: 2,
        life: 1
      });
    }
  }

  handleClick(e) {
    if (!this.gameRunning || this.gameOver) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.checkHit(x, y);
  }

  checkHit(x, y) {
    let hit = false;

    // Check power-ups first
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      const dx = x - p.x;
      const dy = y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 20) {
        this.collectPowerUp(p);
        this.powerUps.splice(i, 1);
        return;
      }
    }

    // Check boss
    if (this.boss) {
      const dx = x - this.boss.x;
      const dy = y - this.boss.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.boss.size) {
        this.hitBoss();
        hit = true;
      }
    }

    // Check bugs
    for (let i = this.bugs.length - 1; i >= 0; i--) {
      const bug = this.bugs[i];
      const dx = x - bug.x;
      const dy = y - bug.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < bug.size) {
        this.hitBug(i);
        hit = true;
        break;
      }
    }

    if (!hit) {
      this.combo = 0;
      this.sounds.miss();
    }
  }

  hitBug(index) {
    const bug = this.bugs[index];
    
    if (bug.trap) {
      this.triggerTrap(index);
      return;
    }

    bug.health--;

    if (bug.health <= 0) {
      this.killBug(index);
    } else {
      // Flash effect
      bug.damaged = true;
      setTimeout(() => { bug.damaged = false; }, 100);
      this.sounds.hit();
    }
  }

  triggerTrap(index) {
    const bug = this.bugs[index];
    this.score -= 50;
    this.lives--;
    this.combo = 0;
    this.screenShake(20);
    this.sounds.trap();
    this.createExplosion(bug.x, bug.y, '#000', 30);
    this.bugs.splice(index, 1);
    this.updateStatus('⚠️ TRAP TRIGGERED! -50 Points!');
    
    if (this.lives <= 0) {
      this.endGame();
    }
    this.updateUI();
  }

  killBug(index) {
    const bug = this.bugs[index];

    // Score
    const comboMultiplier = 1 + (this.combo * 0.1);
    const points = Math.floor(bug.points * comboMultiplier);
    this.score += points;
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);

    // Effects
    this.createExplosion(bug.x, bug.y, bug.color);
    this.createSplat(bug.x, bug.y, bug.color);
    this.sounds.splat();

    // Special bug behaviors
    if (bug.splits) {
      // Splitter creates 2 smaller bugs
      for (let i = 0; i < 2; i++) {
        this.bugs.push({
          x: bug.x,
          y: bug.y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          type: 'basic',
          ...this.bugTypes.basic,
          size: bug.size * 0.6
        });
      }
    }

    if (bug.explodes) {
      // Bomber damages nearby bugs
      this.bugs.forEach((b, i) => {
        if (i !== index) {
          const dx = b.x - bug.x;
          const dy = b.y - bug.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            b.health--;
            if (b.health <= 0) {
              this.killBug(i);
            }
          }
        }
      });

      this.createExplosion(bug.x, bug.y, '#ff6600', 50);
      this.screenShake(10);
    }

    // Chance to spawn power-up
    this.spawnPowerUp(bug.x, bug.y);

    this.bugs.splice(index, 1);

    // Check wave complete
    if (this.bugs.length === 0 && !this.boss) {
      this.wave++;
      setTimeout(() => this.spawnWave(), 2000);
    }

    this.updateUI();
  }

  hitBoss() {
    if (!this.boss) return;

    const damage = this.activePowerUps.multishot ? 2 : 1;
    this.boss.health -= damage;

    this.createExplosion(this.boss.x, this.boss.y, this.boss.color, 10);
    this.sounds.bossHit();
    this.screenShake(5);

    // Boss phases
    if (this.boss.health < this.boss.maxHealth / 2 && this.boss.phase === 1) {
      this.boss.phase = 2;
      this.boss.angry = true;
      this.boss.color = '#991b1b';
      this.updateStatus('💢 Boss is ANGRY!');
    }

    if (this.boss.health <= 0) {
      this.defeatBoss();
    }
  }

  defeatBoss() {
    const bossPoints = 500 + (this.wave / 5) * 200;
    this.score += bossPoints;

    this.createExplosion(this.boss.x, this.boss.y, this.boss.color, 100);
    this.createSplat(this.boss.x, this.boss.y, '#991b1b', 100);
    this.screenShake(20);

    // Spawn multiple power-ups
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (this.destroyed) return;
        this.spawnPowerUp(
          this.boss.x + (Math.random() - 0.5) * 100,
          this.boss.y + (Math.random() - 0.5) * 100
        );
      }, i * 200);
    }

    this.updateStatus(`🎉 Boss defeated! +${bossPoints} points!`);
    this.boss = null;

    this.wave++;
    setTimeout(() => this.spawnWave(), 3000);
    this.updateUI();

    // Check achievement
    if (this.wave === 11) { // Defeated 2 bosses
      this.unlockAchievement('boss_slayer');
    }
  }

  collectPowerUp(powerUp) {
    this.sounds.powerUp();
    this.updateStatus(`⚡ ${powerUp.name} activated!`);

    if (powerUp.instant) {
      // Instant power-ups
      if (powerUp.type === 'nuke') {
        this.activateNuke();
      }
    } else {
      // Timed power-ups
      this.activePowerUps[powerUp.type] = true;
      this.powerUpTimers[powerUp.type] = Date.now() + powerUp.duration;

      if (powerUp.type === 'autofire') {
        this.startAutoFire();
      }
    }
  }

  activateNuke() {
    // Clear all bugs
    this.bugs.forEach(bug => {
      this.createExplosion(bug.x, bug.y, bug.color);
      this.score += bug.points;
    });

    this.bugs = [];
    this.screenShake(30);

    // Damage boss if present
    if (this.boss) {
      this.boss.health -= 5;
      if (this.boss.health <= 0) {
        this.defeatBoss();
      }
    }
  }

  startAutoFire() {
    if (this.autoFireInterval) clearInterval(this.autoFireInterval);
    this.autoFireInterval = setInterval(() => {
      if (!this.activePowerUps.autofire || !this.gameRunning || this.destroyed) {
        clearInterval(this.autoFireInterval);
        this.autoFireInterval = null;
        return;
      }

      // Auto-target nearest bug
      if (this.bugs.length > 0) {
        const target = this.bugs[0];
        this.checkHit(target.x, target.y);
      } else if (this.boss) {
        this.checkHit(this.boss.x, this.boss.y);
      }
    }, 500);
  }

  gameLoop() {
    if (!this.gameRunning || this.destroyed) return;

    this.update();
    this.draw();

    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    const speed = this.activePowerUps.slowmo ? 0.3 : 1;

    // Update bugs
    this.bugs.forEach((bug, i) => {
      if (this.activePowerUps.freeze) {
        return;
      }

      bug.x += bug.vx * speed;
      bug.y += bug.vy * speed;

      // Teleporter behavior
      if (bug.teleports) {
        bug.teleportTimer++;
        if (bug.teleportTimer > 120) {
          bug.x = Math.random() * this.canvas.width;
          bug.y = Math.random() * this.canvas.height;
          bug.teleportTimer = 0;
          this.createExplosion(bug.x, bug.y, bug.color, 15);
        }
      }

      // Check if bug escaped
      if (bug.x < -50 || bug.x > this.canvas.width + 50 ||
          bug.y < -50 || bug.y > this.canvas.height + 50) {
        this.bugs.splice(i, 1);
        if (!this.activePowerUps.shield && !bug.trap) {
          this.lives--;
          this.screenShake(15);
          if (this.lives <= 0) {
            this.endGame();
          }
        }
      }
    });

    // Update boss
    if (this.boss && !this.activePowerUps.freeze) {
      this.boss.moveTimer++;
      this.boss.attackTimer++;

      // Boss movement
      if (this.boss.moveTimer > 60) {
        this.boss.vx = (Math.random() - 0.5) * 4;
        this.boss.vy = (Math.random() - 0.5) * 4;
        this.boss.moveTimer = 0;
      }

      this.boss.x += this.boss.vx * (this.boss.phase === 2 ? 1.5 : 1);
      this.boss.y += this.boss.vy * (this.boss.phase === 2 ? 1.5 : 1);

      // Keep boss in bounds
      this.boss.x = Math.max(this.boss.size, Math.min(this.canvas.width - this.boss.size, this.boss.x));
      this.boss.y = Math.max(this.boss.size, Math.min(this.canvas.height - this.boss.size, this.boss.y));

      // Boss attacks
      if (this.boss.attackTimer > (this.boss.phase === 2 ? 60 : 120)) {
        this.bossAttack();
        this.boss.attackTimer = 0;
      }
    }

    // Update power-ups
    this.powerUps = this.powerUps.filter(p => {
      p.y += p.vy;
      p.life -= 0.005;
      return p.life > 0 && p.y < this.canvas.height + 50;
    });

    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life -= 0.02;
      return p.life > 0;
    });

    // Update splats
    this.splats = this.splats.filter(s => {
      s.life -= 0.005;
      return s.life > 0;
    });

    // Check power-up expiration
    Object.keys(this.powerUpTimers).forEach(type => {
      if (Date.now() > this.powerUpTimers[type]) {
        delete this.activePowerUps[type];
        delete this.powerUpTimers[type];
      }
    });

    // Update screen shake
    if (this.shake.intensity > 0) {
      this.shake.x = (Math.random() - 0.5) * this.shake.intensity;
      this.shake.y = (Math.random() - 0.5) * this.shake.intensity;
      this.shake.intensity *= 0.9;
    }
  }

  bossAttack() {
    // Spawn minion bugs
    for (let i = 0; i < (this.boss.phase === 2 ? 3 : 2); i++) {
      this.bugs.push({
        x: this.boss.x,
        y: this.boss.y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        type: 'basic',
        ...this.bugTypes.basic
      });
    }

    this.createExplosion(this.boss.x, this.boss.y, this.boss.color, 20);
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.shake.x, this.shake.y);

    // Background
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw splats
    this.splats.forEach(s => {
      this.ctx.globalAlpha = s.life;
      this.ctx.fillStyle = s.color;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
      // Drips
      this.ctx.beginPath();
      this.ctx.arc(s.x + 5, s.y + 5, s.size/2, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Draw particles
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    this.ctx.globalAlpha = 1;

    // Draw power-ups
    this.powerUps.forEach(p => {
      this.ctx.globalAlpha = p.life;
      const pulse = Math.sin(Date.now() / 200) * 5 + 25;

      this.ctx.fillStyle = '#fbbf24';
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = '#fbbf24';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, pulse / 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.shadowBlur = 0;
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(p.icon, p.x, p.y + 7);
    });
    this.ctx.globalAlpha = 1;

    // Draw bugs
    this.bugs.forEach(bug => {
      if (bug.damaged) {
        this.ctx.globalAlpha = 0.5;
      }

      this.ctx.fillStyle = bug.color;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = bug.color;

      this.ctx.beginPath();
      this.ctx.arc(bug.x, bug.y, bug.size, 0, Math.PI * 2);
      this.ctx.fill();

      // Trap visual
      if (bug.trap) {
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(bug.x - 10, bug.y - 10);
        this.ctx.lineTo(bug.x + 10, bug.y + 10);
        this.ctx.moveTo(bug.x + 10, bug.y - 10);
        this.ctx.lineTo(bug.x - 10, bug.y + 10);
        this.ctx.stroke();
      }

      this.ctx.shadowBlur = 0;

      // Health bar for tanks
      if (bug.maxHealth > 1) {
        const barWidth = bug.size * 2;
        const barHeight = 4;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(bug.x - barWidth/2, bug.y - bug.size - 10, barWidth, barHeight);
        this.ctx.fillStyle = '#10b981';
        this.ctx.fillRect(bug.x - barWidth/2, bug.y - bug.size - 10, (bug.health / bug.maxHealth) * barWidth, barHeight);
      }

      this.ctx.globalAlpha = 1;
    });

    // Draw boss
    if (this.boss) {
      this.ctx.fillStyle = this.boss.color;
      this.ctx.shadowBlur = 30;
      this.ctx.shadowColor = this.boss.color;

      // Angry pulsing effect
      const pulse = this.boss.angry ? Math.sin(Date.now() / 100) * 5 : 0;

      this.ctx.beginPath();
      this.ctx.arc(this.boss.x, this.boss.y, this.boss.size + pulse, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.shadowBlur = 0;

      // Boss health bar
      const barWidth = 150;
      const barHeight = 10;
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(this.canvas.width / 2 - barWidth/2, 20, barWidth, barHeight);
      this.ctx.fillStyle = this.boss.health > this.boss.maxHealth / 2 ? '#10b981' : '#ef4444';
      this.ctx.fillRect(this.canvas.width / 2 - barWidth/2, 20, (this.boss.health / this.boss.maxHealth) * barWidth, barHeight);

      // Boss label
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('BOSS', this.canvas.width / 2, 15);
    }

    // Draw active power-ups indicators
    let powerUpX = 10;
    Object.keys(this.activePowerUps).forEach(type => {
      const timeLeft = Math.ceil((this.powerUpTimers[type] - Date.now()) / 1000);
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.font = '20px Arial';
      this.ctx.fillText(this.powerUpTypes[type].icon, powerUpX, this.canvas.height - 20);
      this.ctx.font = '12px Arial';
      this.ctx.fillText(timeLeft + 's', powerUpX, this.canvas.height - 5);
      powerUpX += 40;
    });

    // Combo display
    if (this.combo > 1) {
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`${this.combo}x COMBO!`, this.canvas.width - 10, 40);
    }

    this.ctx.restore();
  }

  createExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 1,
        size: Math.random() * 3 + 1,
        color
      });
    }
  }

  createSplat(x, y, color, size = 20) {
    this.splats.push({
      x, y,
      color,
      size,
      life: 1
    });
  }

  screenShake(intensity) {
    this.shake.intensity = intensity;
  }

  endGame() {
    this.gameOver = true;
    this.gameRunning = false;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('bugBlasterHighScore', this.highScore);
      this.updateStatus(`🏆 NEW HIGH SCORE: ${this.score}!`);
    } else {
      this.updateStatus(`💀 Game Over! Score: ${this.score}`);
    }

    this.sounds.gameOver();
    this.updateUI();

    // Check achievements
    if (this.score > 1000) {
      this.unlockAchievement('score_master');
    }
    if (this.maxCombo >= 10) {
      this.unlockAchievement('combo_king');
    }
  }

  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('high-score').textContent = this.highScore;
  }

  updateStatus(msg) {
    document.getElementById('game-status').textContent = msg;
  }

  loadAchievements() {
    const saved = localStorage.getItem('bugBlasterAchievements');
    return saved ? JSON.parse(saved) : {
      boss_slayer: false,
      score_master: false,
      combo_king: false
    };
  }

  unlockAchievement(id) {
    if (!this.achievements[id]) {
      this.achievements[id] = true;
      localStorage.setItem('bugBlasterAchievements', JSON.stringify(this.achievements));
      console.log(`Achievement unlocked: ${id}!`);
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
    this.gameRunning = false;
    if (this.autoFireInterval) {
      clearInterval(this.autoFireInterval);
      this.autoFireInterval = null;
    }
  }
}

window.BugBlaster = BugBlaster;
