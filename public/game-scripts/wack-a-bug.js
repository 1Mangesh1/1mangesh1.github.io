class WackABug {
  constructor() {
    this.canvas = document.getElementById("wack-a-bug-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.isRunning = false;
    this.isPaused = false;
    this.animationId = null;

    // Game state
    this.score = 0;
    this.highScore = localStorage.getItem("wackABugHighScore") || 0;
    this.level = 1;
    this.bugs = [];
    this.particles = [];

    // Game settings
    this.bugSpawnRate = 2000; // milliseconds
    this.maxBugs = 5;
    this.bugSpeed = 1;

    // UI elements
    this.scoreEl = document.getElementById("score");
    this.highScoreEl = document.getElementById("high-score");
    this.gameStatusEl = document.getElementById("game-status");

    this.setupEventListeners();
    this.updateHighScore();
    this.draw();
  }

  setupEventListeners() {
    // Canvas click for bug wacking
    this.canvas.addEventListener("click", (e) => {
      if (!this.isRunning || this.isPaused) return;
      this.handleClick(e);
    });

    // Button controls
    const startBtn = document.getElementById("start-game-btn");
    const pauseBtn = document.getElementById("pause-game-btn");
    const resetBtn = document.getElementById("reset-game-btn");

    if (startBtn) startBtn.addEventListener("click", () => this.startGame());
    if (pauseBtn) pauseBtn.addEventListener("click", () => this.togglePause());
    if (resetBtn) resetBtn.addEventListener("click", () => this.resetGame());
  }

  startGame() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.level = 1;
    this.bugs = [];
    this.particles = [];
    this.bugSpawnRate = 2000;
    this.bugSpeed = 1;

    this.updateScore();
    this.updateStatus("Game started! Click the bugs!");
    this.animate();
    this.spawnBugs();
  }

  togglePause() {
    if (!this.isRunning) return;

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.updateStatus("Game paused");
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    } else {
      this.updateStatus("Game resumed!");
      this.animate();
    }
  }

  resetGame() {
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.level = 1;
    this.bugs = [];
    this.particles = [];

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.updateScore();
    this.updateStatus("Click Start Game to begin!");
    this.draw();
  }

  spawnBugs() {
    if (!this.isRunning || this.isPaused) return;

    if (this.bugs.length < this.maxBugs) {
      this.createBug();
    }

    // Schedule next spawn
    setTimeout(() => {
      this.spawnBugs();
    }, this.bugSpawnRate);
  }

  createBug() {
    const bug = {
      x: Math.random() * (this.canvas.width - 40) + 20,
      y: this.canvas.height + 20,
      size: Math.random() * 20 + 15, // 15-35 pixels
      speed: this.bugSpeed + Math.random() * 0.5,
      type: Math.floor(Math.random() * 3), // 0: ladybug, 1: beetle, 2: fly
      points: 0,
      escaped: false,
    };

    // Set points based on size (bigger = more points)
    if (bug.size > 25) {
      bug.points = 3;
    } else if (bug.size > 20) {
      bug.points = 2;
    } else {
      bug.points = 1;
    }

    this.bugs.push(bug);
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if any bug was clicked
    for (let i = this.bugs.length - 1; i >= 0; i--) {
      const bug = this.bugs[i];
      const distance = Math.sqrt(
        Math.pow(clickX - bug.x, 2) + Math.pow(clickY - bug.y, 2)
      );

      if (distance < bug.size) {
        // Bug was wacked!
        this.score += bug.points;
        this.updateScore();
        this.addWackParticles(bug.x, bug.y, bug.size);
        this.bugs.splice(i, 1);

        // Check for level up
        if (this.score > 0 && this.score % 10 === 0) {
          this.levelUp();
        }

        return;
      }
    }
  }

  levelUp() {
    this.level++;
    this.bugSpeed += 0.2;
    this.bugSpawnRate = Math.max(500, this.bugSpawnRate - 100);
    this.maxBugs = Math.min(8, this.maxBugs + 1);

    this.updateStatus(`Level ${this.level}! Bugs are getting faster!`);

    // Add celebration particles
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 60,
        maxLife: 60,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        size: Math.random() * 4 + 2,
      });
    }
  }

  addWackParticles(x, y, size) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 40,
        maxLife: 40,
        color: "#FFD700",
        size: Math.random() * 3 + 2,
      });
    }
  }

  animate() {
    if (!this.isRunning || this.isPaused) return;

    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  update() {
    // Update bugs
    for (let i = this.bugs.length - 1; i >= 0; i--) {
      const bug = this.bugs[i];
      bug.y -= bug.speed;

      // Check if bug escaped
      if (bug.y < -bug.size) {
        bug.escaped = true;
        this.bugs.splice(i, 1);

        // Lose points for escaped bugs
        this.score = Math.max(0, this.score - 1);
        this.updateScore();
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity
      p.vx *= 0.98; // Air resistance
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Check game over
    if (this.score < 0) {
      this.gameOver();
    }
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background pattern (simple grass)
    this.drawBackground();

    // Draw bugs
    this.bugs.forEach((bug) => this.drawBug(bug));

    // Draw particles
    this.particles.forEach((p) => this.drawParticle(p));

    // Draw level indicator
    this.drawLevelIndicator();
  }

  drawBackground() {
    // Simple grass pattern
    this.ctx.fillStyle = "#90EE90";
    this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);

    // Grass blades
    this.ctx.strokeStyle = "#228B22";
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.canvas.width; i += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, this.canvas.height - 50);
      this.ctx.lineTo(i + 5, this.canvas.height - 80);
      this.ctx.stroke();
    }
  }

  drawBug(bug) {
    this.ctx.save();
    this.ctx.translate(bug.x, bug.y);

    // Bug body
    if (bug.type === 0) {
      // Ladybug
      this.ctx.fillStyle = "#FF0000";
      this.ctx.beginPath();
      this.ctx.arc(0, 0, bug.size, 0, Math.PI * 2);
      this.ctx.fill();

      // Spots
      this.ctx.fillStyle = "#000000";
      this.ctx.beginPath();
      this.ctx.arc(-bug.size / 3, -bug.size / 3, bug.size / 6, 0, Math.PI * 2);
      this.ctx.arc(bug.size / 3, -bug.size / 3, bug.size / 6, 0, Math.PI * 2);
      this.ctx.arc(0, bug.size / 3, bug.size / 6, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (bug.type === 1) {
      // Beetle
      this.ctx.fillStyle = "#8B4513";
      this.ctx.fillRect(-bug.size / 2, -bug.size / 2, bug.size, bug.size);

      // Antennae
      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(-bug.size / 3, -bug.size / 2);
      this.ctx.lineTo(-bug.size / 2, -bug.size);
      this.ctx.moveTo(bug.size / 3, -bug.size / 2);
      this.ctx.lineTo(bug.size / 2, -bug.size);
      this.ctx.stroke();
    } else {
      // Fly
      this.ctx.fillStyle = "#000000";
      this.ctx.beginPath();
      this.ctx.arc(0, 0, bug.size / 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Wings
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      this.ctx.beginPath();
      this.ctx.ellipse(
        -bug.size / 3,
        0,
        bug.size / 4,
        bug.size / 6,
        0,
        0,
        Math.PI * 2
      );
      this.ctx.ellipse(
        bug.size / 3,
        0,
        bug.size / 4,
        bug.size / 6,
        0,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }

    // Bug eyes
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.beginPath();
    this.ctx.arc(-bug.size / 3, -bug.size / 3, bug.size / 8, 0, Math.PI * 2);
    this.ctx.arc(bug.size / 3, -bug.size / 3, bug.size / 8, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#000000";
    this.ctx.beginPath();
    this.ctx.arc(-bug.size / 3, -bug.size / 3, bug.size / 12, 0, Math.PI * 2);
    this.ctx.arc(bug.size / 3, -bug.size / 3, bug.size / 12, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawParticle(p) {
    this.ctx.save();
    this.ctx.globalAlpha = p.life / p.maxLife;
    this.ctx.fillStyle = p.color;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawLevelIndicator() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(10, 10, 80, 30);

    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "14px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(`Level ${this.level}`, 30, 30);
  }

  updateScore() {
    if (this.scoreEl) {
      this.scoreEl.textContent = this.score;
    }

    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.updateHighScore();
      localStorage.setItem("wackABugHighScore", this.highScore);
    }
  }

  updateHighScore() {
    if (this.highScoreEl) {
      this.highScoreEl.textContent = this.highScore;
    }
  }

  updateStatus(message) {
    if (this.gameStatusEl) {
      this.gameStatusEl.textContent = message;
    }
  }

  gameOver() {
    this.isRunning = false;
    this.updateStatus(`Game Over! Final Score: ${this.score}`);

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Add game over particles
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 12,
        life: 80,
        maxLife: 80,
        color: "#FF0000",
        size: Math.random() * 5 + 3,
      });
    }

    this.draw();
  }
}

// Make it globally available
window.WackABug = WackABug;
