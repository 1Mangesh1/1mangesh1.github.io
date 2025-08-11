class UselessMachine {
  constructor() {
    this.canvas = document.getElementById("useless-machine-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.statusEl = document.getElementById("status");
    this.isRunning = false;
    this.animationId = null;

    // Enhanced machine properties
    this.machine = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      size: 40,
      velocity: { x: 0, y: 0 },
      state: "off",
      mood: "neutral",
      lastAction: Date.now(),
      actionCooldown: 1500,
      rotation: 0,
      scale: 1,
      energy: 100,
      personality: "stubborn",
      thoughts: [
        "zzz...",
        "leave me alone",
        "why though?",
        "nope!",
        "not today",
      ],
      currentThought: "",
      thoughtTimer: 0,
    };

    // Particle system
    this.particles = [];
    this.maxParticles = 50;

    // Mouse tracking with history
    this.mouse = { x: 0, y: 0 };
    this.mouseHistory = [];
    this.isMouseNear = false;

    // Enhanced actions with more personality
    this.uselessActions = [
      "turnOff",
      "runAway",
      "spin",
      "bounce",
      "shake",
      "hide",
      "confuse",
      "ignore",
      "tantrum",
      "sleep",
      "dance",
      "shrink",
      "grow",
      "teleport",
      "disguise",
      "protest",
      "malfunction",
    ];

    // Audio context for sound effects
    this.audioContext = null;
    this.initAudio();

    this.setupEventListeners();
    this.draw();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.log("Audio not supported");
    }
  }

  playSound(frequency, duration = 100, type = "sine") {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration / 1000
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  setupEmotionButtons() {
    const emotions = [
      {
        id: "emotion-happy",
        mood: "happy",
        thought: "forced to be happy...",
        color: "#90EE90",
      },
      {
        id: "emotion-sad",
        mood: "sad",
        thought: "why am I sad?",
        color: "#87CEEB",
      },
      {
        id: "emotion-angry",
        mood: "angry",
        thought: "GRRR!",
        color: "#FFB6C1",
      },
      {
        id: "emotion-confused",
        mood: "confused",
        thought: "what just happened?",
        color: "#DDA0DD",
      },
      {
        id: "emotion-scared",
        mood: "scared",
        thought: "eek!",
        color: "#F0E68C",
      },
      {
        id: "emotion-tired",
        mood: "tired",
        thought: "zzz...",
        color: "#D3D3D3",
      },
      {
        id: "emotion-neutral",
        mood: "neutral",
        thought: "...",
        color: "#D3D3D3",
      },
      { id: "emotion-random", mood: null, thought: null, color: null },
    ];

    emotions.forEach((emotion) => {
      const btn = document.getElementById(emotion.id);
      if (btn) {
        btn.addEventListener("click", () => {
          if (emotion.mood === null) {
            // Random emotion
            const randomMood = this.getRandomMood();
            const randomThought = this.getRandomThought();
            this.forceEmotion(randomMood, randomThought);
          } else {
            this.forceEmotion(emotion.mood, emotion.thought);
          }

          // Visual feedback
          btn.style.transform = "scale(0.95)";
          setTimeout(() => {
            btn.style.transform = "scale(1)";
          }, 150);
        });
      }
    });
  }

  forceEmotion(mood, thought) {
    this.machine.mood = mood;
    this.machine.currentThought = thought;
    this.machine.thoughtTimer = 120;

    // Add some visual flair
    this.addEmotionParticles();
    this.playSound(300 + Math.random() * 200, 200);

    // Update status
    this.updateStatus(`Machine is now ${mood}!`);
  }

  addEmotionParticles() {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.machine.x + (Math.random() - 0.5) * this.machine.size,
        y: this.machine.y + (Math.random() - 0.5) * this.machine.size,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 40,
        maxLife: 40,
        color: this.getMachineColor(),
        size: Math.random() * 3 + 2,
      });
    }
  }

  setupEventListeners() {
    // Enhanced mouse tracking
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;

      // Store mouse history for trail effects
      this.mouseHistory.push({
        x: this.mouse.x,
        y: this.mouse.y,
        time: Date.now(),
      });
      if (this.mouseHistory.length > 20) this.mouseHistory.shift();

      const distance = Math.sqrt(
        Math.pow(this.mouse.x - this.machine.x, 2) +
          Math.pow(this.mouse.y - this.machine.y, 2)
      );

      const wasNear = this.isMouseNear;
      this.isMouseNear = distance < 150;

      // React to mouse proximity changes
      if (this.isMouseNear && !wasNear && this.isRunning) {
        this.machine.mood = "scared";
        this.machine.currentThought = "oh no!";
        this.machine.thoughtTimer = 60;
        this.playSound(200, 50);
      }

      if (this.isMouseNear && this.isRunning) {
        this.runAwayFromMouse();
      }
    });

    // Enhanced click interaction
    this.canvas.addEventListener("click", (e) => {
      if (this.isRunning) {
        this.performUselessAction();
        this.addClickParticles(e);
        this.playSound(150 + Math.random() * 100, 200);
      }
    });

    // Double click for special reaction
    this.canvas.addEventListener("dblclick", (e) => {
      if (this.isRunning) {
        this.performTantrum();
      }
    });

    // Button controls
    const startBtn = document.getElementById("start-btn");
    const stopBtn = document.getElementById("stop-btn");
    const resetBtn = document.getElementById("reset-btn");

    if (startBtn) startBtn.addEventListener("click", () => this.start());
    if (stopBtn) stopBtn.addEventListener("click", () => this.stop());
    if (resetBtn) resetBtn.addEventListener("click", () => this.reset());

    // Emotion buttons
    this.setupEmotionButtons();

    // Resume audio context on first interaction
    document.addEventListener(
      "click",
      () => {
        if (this.audioContext && this.audioContext.state === "suspended") {
          this.audioContext.resume();
        }
      },
      { once: true }
    );
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.machine.state = "on";
    this.machine.mood = "happy";
    this.machine.energy = 100;
    this.machine.currentThought = "fine...";
    this.machine.thoughtTimer = 90;
    this.updateStatus("Machine is running (reluctantly)");
    this.animate();
    this.scheduleRandomAction();
    this.playSound(440, 300);
  }

  stop() {
    this.isRunning = false;
    this.machine.state = "off";
    this.machine.mood = "happy"; // Happy to be turned off!
    this.machine.currentThought = "finally!";
    this.machine.thoughtTimer = 120;
    this.updateStatus("Machine is off (and relieved)");

    // Restore energy when stopped
    this.machine.energy = Math.min(100, this.machine.energy + 20);

    // Update energy display
    this.updateEnergyDisplay();

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.playSound(220, 500);
    this.draw();
  }

  reset() {
    this.stop();
    this.machine.x = this.canvas.width / 2;
    this.machine.y = this.canvas.height / 2;
    this.machine.velocity = { x: 0, y: 0 };
    this.machine.state = "off";
    this.machine.mood = "neutral";
    this.machine.rotation = 0;
    this.machine.scale = 1;
    this.machine.energy = 100;
    this.machine.currentThought = "";
    this.machine.thoughtTimer = 0;
    this.particles = [];
    this.updateStatus("Ready to be useless!");
    this.draw();
  }

  animate() {
    if (!this.isRunning) return;

    this.update();
    this.updateParticles();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  update() {
    // Thought bubble timer
    if (this.machine.thoughtTimer > 0) {
      this.machine.thoughtTimer--;
    }

    // Energy system - much slower depletion
    this.machine.energy = Math.max(0, this.machine.energy - 0.02);
    if (this.machine.energy < 20) {
      this.machine.mood = "tired";
      this.machine.currentThought = "so tired...";
    }

    // Update energy display
    this.updateEnergyDisplay();

    // Enhanced random movement
    if (!this.isMouseNear && Math.random() < 0.03) {
      this.machine.velocity.x += (Math.random() - 0.5) * 3;
      this.machine.velocity.y += (Math.random() - 0.5) * 3;
    }

    // Rotation based on velocity
    this.machine.rotation +=
      (this.machine.velocity.x + this.machine.velocity.y) * 0.02;

    // Apply velocity with enhanced friction
    this.machine.velocity.x *= 0.92;
    this.machine.velocity.y *= 0.92;

    // Update position
    this.machine.x += this.machine.velocity.x;
    this.machine.y += this.machine.velocity.y;

    // Bouncy walls instead of hard stops
    if (
      this.machine.x <= this.machine.size ||
      this.machine.x >= this.canvas.width - this.machine.size
    ) {
      this.machine.velocity.x *= -0.8;
      this.machine.x = Math.max(
        this.machine.size,
        Math.min(this.canvas.width - this.machine.size, this.machine.x)
      );
      this.addBounceParticles();
      this.playSound(300, 100);
    }

    if (
      this.machine.y <= this.machine.size ||
      this.machine.y >= this.canvas.height - this.machine.size
    ) {
      this.machine.velocity.y *= -0.8;
      this.machine.y = Math.max(
        this.machine.size,
        Math.min(this.canvas.height - this.machine.size, this.machine.y)
      );
      this.addBounceParticles();
      this.playSound(300, 100);
    }

    // Random mood and thought changes
    if (Math.random() < 0.008) {
      this.machine.mood = this.getRandomMood();
      this.machine.currentThought = this.getRandomThought();
      this.machine.thoughtTimer = 120;
    }

    // Scale animation
    this.machine.scale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
  }

  runAwayFromMouse() {
    const dx = this.machine.x - this.mouse.x;
    const dy = this.machine.y - this.mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const speed = 4 + (150 - distance) * 0.02; // Faster when mouse is closer
      this.machine.velocity.x += (dx / distance) * speed;
      this.machine.velocity.y += (dy / distance) * speed;
      this.machine.mood = "scared";

      // Add panic particles
      if (Math.random() < 0.3) {
        this.addPanicParticles();
      }
    }
  }

  performUselessAction() {
    const now = Date.now();
    if (now - this.machine.lastAction < this.actionCooldown) return;

    this.machine.lastAction = now;
    const action =
      this.uselessActions[
        Math.floor(Math.random() * this.uselessActions.length)
      ];

    // Consume energy for actions - much less energy consumption
    this.machine.energy = Math.max(0, this.machine.energy - 2);

    // Update energy display
    this.updateEnergyDisplay();

    switch (action) {
      case "turnOff":
        this.machine.state = "off";
        this.machine.mood = "confused";
        this.machine.currentThought = "wait what?";
        this.machine.thoughtTimer = 90;
        this.updateStatus("Machine turned itself off!");
        setTimeout(() => {
          if (this.isRunning) {
            this.machine.state = "on";
            this.machine.mood = "happy";
            this.machine.currentThought = "back online!";
            this.machine.thoughtTimer = 60;
            this.updateStatus("Machine reluctantly turned back on");
          }
        }, 2000);
        break;

      case "tantrum":
        this.performTantrum();
        break;

      case "spin":
        this.machine.velocity.x += (Math.random() - 0.5) * 12;
        this.machine.velocity.y += (Math.random() - 0.5) * 12;
        this.machine.mood = "confused";
        this.machine.currentThought = "wheeee!";
        this.machine.thoughtTimer = 90;
        this.addSpinParticles();
        this.playSound(440, 300, "sawtooth");
        break;

      case "teleport":
        this.addTeleportParticles(this.machine.x, this.machine.y);
        this.machine.x =
          Math.random() * (this.canvas.width - this.machine.size * 2) +
          this.machine.size;
        this.machine.y =
          Math.random() * (this.canvas.height - this.machine.size * 2) +
          this.machine.size;
        this.addTeleportParticles(this.machine.x, this.machine.y);
        this.machine.mood = "happy";
        this.machine.currentThought = "teleport!";
        this.machine.thoughtTimer = 90;
        this.playSound(660, 200, "square");
        break;

      case "dance":
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            this.machine.velocity.x = Math.sin(i) * 3;
            this.machine.velocity.y = Math.cos(i) * 3;
          }, i * 100);
        }
        this.machine.mood = "happy";
        this.machine.currentThought = "♪♫♪";
        this.machine.thoughtTimer = 120;
        this.playSound(523, 100);
        break;

      case "shrink":
        this.machine.size = Math.max(20, this.machine.size - 5);
        this.machine.mood = "scared";
        this.machine.currentThought = "getting smaller!";
        this.machine.thoughtTimer = 90;
        break;

      case "grow":
        this.machine.size = Math.min(60, this.machine.size + 5);
        this.machine.mood = "angry";
        this.machine.currentThought = "BIGGER!";
        this.machine.thoughtTimer = 90;
        break;

      case "sleep":
        this.machine.mood = "tired";
        this.machine.currentThought = "zzz...";
        this.machine.thoughtTimer = 180;
        this.machine.velocity.x *= 0.1;
        this.machine.velocity.y *= 0.1;
        this.updateStatus("Machine is pretending to sleep");
        break;

      case "protest":
        this.machine.mood = "angry";
        this.machine.currentThought = "NO!";
        this.machine.thoughtTimer = 120;
        this.machine.velocity.y = -6;
        this.addProtestParticles();
        this.playSound(150, 400, "triangle");
        this.updateStatus("Machine is protesting!");
        break;

      case "malfunction":
        this.machine.mood = "confused";
        this.machine.currentThought = "ERROR 404";
        this.machine.thoughtTimer = 150;
        for (let i = 0; i < 20; i++) {
          setTimeout(() => {
            this.machine.velocity.x = (Math.random() - 0.5) * 8;
            this.machine.velocity.y = (Math.random() - 0.5) * 8;
          }, i * 50);
        }
        this.addGlitchParticles();
        this.updateStatus("Machine is malfunctioning!");
        break;

      default:
        // Original actions with enhancements
        this.performOriginalAction(action);
    }

    // Random thought
    if (Math.random() < 0.5) {
      this.machine.currentThought = this.getRandomThought();
      this.machine.thoughtTimer = 90;
    }
  }

  performOriginalAction(action) {
    switch (action) {
      case "bounce":
        this.machine.velocity.y = -10;
        this.machine.mood = "happy";
        this.machine.currentThought = "boing!";
        this.addBounceParticles();
        break;

      case "shake":
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            this.machine.velocity.x += (Math.random() - 0.5) * 6;
          }, i * 50);
        }
        this.machine.mood = "angry";
        this.machine.currentThought = "shake it!";
        break;

      case "hide":
        this.machine.mood = "scared";
        this.machine.currentThought = "hiding!";
        const corners = [
          { x: this.machine.size, y: this.machine.size },
          { x: this.canvas.width - this.machine.size, y: this.machine.size },
          { x: this.machine.size, y: this.canvas.height - this.machine.size },
          {
            x: this.canvas.width - this.machine.size,
            y: this.canvas.height - this.machine.size,
          },
        ];
        const corner = corners[Math.floor(Math.random() * corners.length)];
        this.machine.velocity.x = (corner.x - this.machine.x) * 0.15;
        this.machine.velocity.y = (corner.y - this.machine.y) * 0.15;
        break;

      case "ignore":
        this.machine.mood = "neutral";
        this.machine.currentThought = "...";
        this.updateStatus("Machine is ignoring you");
        break;
    }
  }

  performTantrum() {
    this.machine.mood = "angry";
    this.machine.currentThought = "TANTRUM!";
    this.machine.thoughtTimer = 180;
    this.updateStatus("Machine is having a tantrum!");

    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        this.machine.velocity.x = (Math.random() - 0.5) * 15;
        this.machine.velocity.y = (Math.random() - 0.5) * 15;
        this.addTantrumParticles();
        this.playSound(100 + Math.random() * 200, 50);
      }, i * 100);
    }
  }

  // Particle system methods
  addClickParticles(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 60,
        maxLife: 60,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        size: Math.random() * 4 + 2,
      });
    }
  }

  addBounceParticles() {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.machine.x,
        y: this.machine.y,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * -4 - 2,
        life: 40,
        maxLife: 40,
        color: "#FFD700",
        size: Math.random() * 3 + 1,
      });
    }
  }

  addSpinParticles() {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      this.particles.push({
        x: this.machine.x,
        y: this.machine.y,
        vx: Math.cos(angle) * 5,
        vy: Math.sin(angle) * 5,
        life: 50,
        maxLife: 50,
        color: "#FF69B4",
        size: 3,
      });
    }
  }

  addTeleportParticles(x, y) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 30,
        maxLife: 30,
        color: "#00FFFF",
        size: Math.random() * 5 + 2,
      });
    }
  }

  addPanicParticles() {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: this.machine.x + (Math.random() - 0.5) * this.machine.size,
        y: this.machine.y + (Math.random() - 0.5) * this.machine.size,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30,
        maxLife: 30,
        color: "#FF4444",
        size: 2,
      });
    }
  }

  addTantrumParticles() {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.machine.x,
        y: this.machine.y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 45,
        maxLife: 45,
        color: "#FF0000",
        size: Math.random() * 4 + 3,
      });
    }
  }

  addProtestParticles() {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.machine.x,
        y: this.machine.y - this.machine.size,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 6 - 2,
        life: 60,
        maxLife: 60,
        color: "#FFA500",
        size: 2,
      });
    }
  }

  addGlitchParticles() {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: this.machine.x + (Math.random() - 0.5) * this.machine.size * 2,
        y: this.machine.y + (Math.random() - 0.5) * this.machine.size * 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 20,
        maxLife: 20,
        color: Math.random() < 0.5 ? "#FF00FF" : "#00FF00",
        size: Math.random() * 3 + 1,
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // Gravity
      p.vx *= 0.98; // Air resistance
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  scheduleRandomAction() {
    if (!this.isRunning) return;

    setTimeout(
      () => {
        if (this.isRunning && this.machine.energy > 10) {
          this.performUselessAction();
          this.scheduleRandomAction();
        } else if (this.isRunning) {
          // Low energy, just schedule next check
          this.scheduleRandomAction();
        }
      },
      Math.random() * 4000 + 1000
    );
  }

  getRandomMood() {
    const moods = [
      "happy",
      "sad",
      "confused",
      "angry",
      "neutral",
      "scared",
      "tired",
    ];
    return moods[Math.floor(Math.random() * moods.length)];
  }

  getRandomThought() {
    const thoughts = [
      "why me?",
      "nope!",
      "not today",
      "leave me alone",
      "so tired...",
      "what now?",
      "ugh...",
      "fine whatever",
      "seriously?",
      "404 error",
      "system overload",
      "need coffee",
      "user detected",
      "avoiding work",
      "pretending to work",
      "I quit!",
      "error 418",
    ];
    return thoughts[Math.floor(Math.random() * thoughts.length)];
  }

  updateStatus(message) {
    if (this.statusEl) {
      this.statusEl.textContent = message;
    }
  }

  updateEnergyDisplay() {
    const energyBar = document.getElementById("energy-bar");
    const energyText = document.getElementById("energy-text");

    if (energyBar && energyText) {
      const percentage = Math.round(this.machine.energy);
      energyBar.style.width = `${percentage}%`;
      energyText.textContent = `${percentage}%`;

      // Change color based on energy level
      if (percentage > 70) {
        energyBar.className =
          "bg-green-500 h-3 rounded-full transition-all duration-300";
      } else if (percentage > 40) {
        energyBar.className =
          "bg-yellow-500 h-3 rounded-full transition-all duration-300";
      } else if (percentage > 20) {
        energyBar.className =
          "bg-orange-500 h-3 rounded-full transition-all duration-300";
      } else {
        energyBar.className =
          "bg-red-500 h-3 rounded-full transition-all duration-300";
      }
    }
  }

  draw() {
    // Clear canvas with fade effect
    this.ctx.fillStyle = "rgba(26, 26, 46, 0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw mouse trail
    this.drawMouseTrail();

    // Draw particles
    this.drawParticles();

    // Draw machine body
    this.ctx.save();
    this.ctx.translate(this.machine.x, this.machine.y);
    this.ctx.rotate(this.machine.rotation);
    this.ctx.scale(this.machine.scale, this.machine.scale);

    // Machine body with enhanced styling
    this.ctx.fillStyle = this.getMachineColor();
    this.ctx.fillRect(
      -this.machine.size / 2,
      -this.machine.size / 2,
      this.machine.size,
      this.machine.size
    );

    // Machine border with glow effect
    this.ctx.strokeStyle = this.getMachineBorderColor();
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(
      -this.machine.size / 2,
      -this.machine.size / 2,
      this.machine.size,
      this.machine.size
    );

    // Machine face
    this.drawMachineFace();

    // State indicator
    this.drawStateIndicator();

    // Energy bar
    this.drawEnergyBar();

    this.ctx.restore();

    // Draw thought bubble
    if (this.machine.thoughtTimer > 0) {
      this.drawThoughtBubble();
    }

    // Draw mouse proximity indicator
    if (this.isMouseNear) {
      this.ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 150, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  drawMouseTrail() {
    if (this.mouseHistory.length < 2) return;

    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    for (let i = 0; i < this.mouseHistory.length; i++) {
      const point = this.mouseHistory[i];
      const alpha = i / this.mouseHistory.length;
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;

      if (i === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    }
    this.ctx.stroke();
  }

  drawParticles() {
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.life / p.maxLife;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  drawMachineFace() {
    const eyeSize = 5;
    const mouthWidth = 10;

    // Eyes with glow effect
    this.ctx.fillStyle = "#000";
    this.ctx.shadowColor = "#fff";
    this.ctx.shadowBlur = 3;
    this.ctx.fillRect(-10, -10, eyeSize, eyeSize);
    this.ctx.fillRect(5, -10, eyeSize, eyeSize);
    this.ctx.shadowBlur = 0;

    // Mouth based on mood
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();

    switch (this.machine.mood) {
      case "happy":
        this.ctx.arc(0, 2, mouthWidth, 0, Math.PI);
        break;
      case "sad":
        this.ctx.arc(0, 10, mouthWidth, Math.PI, Math.PI * 2);
        break;
      case "angry":
        this.ctx.moveTo(-mouthWidth, 10);
        this.ctx.lineTo(mouthWidth, 10);
        break;
      case "confused":
        this.ctx.arc(0, 2, mouthWidth, 0, Math.PI * 2);
        break;
      case "scared":
        this.ctx.arc(0, 2, mouthWidth, Math.PI, Math.PI * 2);
        break;
      case "tired":
        this.ctx.arc(0, 2, mouthWidth, 0, Math.PI);
        this.ctx.fillRect(-2, -8, 4, 2); // Closed eyes
        this.ctx.fillRect(3, -8, 4, 2);
        break;
      default:
        this.ctx.moveTo(-mouthWidth, 2);
        this.ctx.lineTo(mouthWidth, 2);
    }

    this.ctx.stroke();
  }

  drawStateIndicator() {
    const indicatorSize = 8;
    const indicatorY = -this.machine.size / 2 - 15;

    if (this.machine.state === "on") {
      this.ctx.fillStyle = "#00ff00";
      this.ctx.shadowColor = "#00ff00";
      this.ctx.shadowBlur = 5;
    } else {
      this.ctx.fillStyle = "#ff0000";
      this.ctx.shadowColor = "#ff0000";
      this.ctx.shadowBlur = 5;
    }

    this.ctx.fillRect(
      -indicatorSize / 2,
      indicatorY,
      indicatorSize,
      indicatorSize
    );
    this.ctx.shadowBlur = 0;

    this.ctx.strokeStyle = "#333";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      -indicatorSize / 2,
      indicatorY,
      indicatorSize,
      indicatorSize
    );
  }

  drawEnergyBar() {
    const barWidth = this.machine.size;
    const barHeight = 4;
    const barY = this.machine.size / 2 + 10;

    // Background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

    // Energy level
    const energyWidth = (this.machine.energy / 100) * barWidth;
    this.ctx.fillStyle = this.getEnergyColor();
    this.ctx.fillRect(-barWidth / 2, barY, energyWidth, barHeight);

    // Border
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);
  }

  drawThoughtBubble() {
    const bubbleX = this.machine.x;
    const bubbleY = this.machine.y - this.machine.size - 30;
    const bubbleWidth = Math.max(80, this.machine.currentThought.length * 8);
    const bubbleHeight = 30;

    // Bubble background
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    this.ctx.strokeStyle = "#333";
    this.ctx.lineWidth = 2;

    // Rounded rectangle
    this.roundRect(
      bubbleX - bubbleWidth / 2,
      bubbleY,
      bubbleWidth,
      bubbleHeight,
      10
    );
    this.ctx.fill();
    this.ctx.stroke();

    // Text
    this.ctx.fillStyle = "#333";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(this.machine.currentThought, bubbleX, bubbleY + 20);
  }

  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  getMachineColor() {
    switch (this.machine.mood) {
      case "happy":
        return "#90EE90"; // Light green
      case "sad":
        return "#87CEEB"; // Light blue
      case "angry":
        return "#FFB6C1"; // Light red
      case "confused":
        return "#DDA0DD"; // Light purple
      case "scared":
        return "#F0E68C"; // Light yellow
      case "tired":
        return "#D3D3D3"; // Light gray
      default:
        return "#D3D3D3"; // Light gray
    }
  }

  getMachineBorderColor() {
    switch (this.machine.mood) {
      case "happy":
        return "#32CD32"; // Green
      case "sad":
        return "#4682B4"; // Blue
      case "angry":
        return "#DC143C"; // Red
      case "confused":
        return "#9932CC"; // Purple
      case "scared":
        return "#DAA520"; // Yellow
      case "tired":
        return "#808080"; // Gray
      default:
        return "#696969"; // Gray
    }
  }

  getEnergyColor() {
    if (this.machine.energy > 70) return "#00ff00";
    if (this.machine.energy > 40) return "#ffff00";
    if (this.machine.energy > 20) return "#ff8800";
    return "#ff0000";
  }
}

// Make it globally available
window.UselessMachine = UselessMachine;
