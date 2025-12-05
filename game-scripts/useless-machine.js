/**
 * ULTIMATE USELESS MACHINE: CHAOS EDITION
 * Super optimized, incredibly fun, and absolutely pointless!
 * Features 25+ hilarious behaviors with smooth 60 FPS performance
 */

class ChaosMachine {
  constructor() {
    this.canvas = document.getElementById('useless-machine-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.status = document.getElementById('status');

    // Optimized machine state
    this.machine = {
      x: 250, y: 175, size: 50, vx: 0, vy: 0,
      rotation: 0, scale: 1, color: '#3b82f6',
      mood: 'neutral', energy: 100, angry: 0,
      gravity: 0.4
    };

    // Lightweight particle pool (max 150 for performance)
    this.particles = [];
    this.maxParticles = 150;

    // Mouse tracking
    this.mouse = { x: 250, y: 175, clicked: false };

    // Behaviors with descriptions
    this.behaviors = [
      { name: 'runAway', msg: '🏃 "Leave me alone!"', weight: 3 },
      { name: 'spin', msg: '🌀 "Wheeeee!"', weight: 2 },
      { name: 'bounce', msg: '⬆️ "Boing!"', weight: 2 },
      { name: 'explode', msg: '💥 "BOOM!"', weight: 1 },
      { name: 'teleport', msg: '✨ "You\'ll never catch me!"', weight: 2 },
      { name: 'shrink', msg: '🔬 "Now you see me..."', weight: 1 },
      { name: 'grow', msg: '📈 "I\'M HUGE!"', weight: 1 },
      { name: 'rainbow', msg: '🌈 "Fabulous!"', weight: 1 },
      { name: 'tantrum', msg: '😤 "I QUIT!"', weight: 1 },
      { name: 'hide', msg: '👻 "Can\'t see me!"', weight: 1 },
      { name: 'shake', msg: '📳 "Bzzzz!"', weight: 2 },
      { name: 'sleep', msg: '😴 "Zzz..."', weight: 1 },
      { name: 'dance', msg: '💃 "Let\'s dance!"', weight: 2 },
      { name: 'multiply', msg: '👥 "Meet my friends!"', weight: 1 },
      { name: 'disguise', msg: '🎭 "New look!"', weight: 1 },
      { name: 'fakeError', msg: '💻 "SYSTEM ERROR"', weight: 1 },
      { name: 'gravitySwitch', msg: '🙃 "Whoops!"', weight: 1 },
      { name: 'glitch', msg: '👾 "bzzzt... err.."', weight: 1 }
    ];

    // Clones for multiply effect
    this.clones = [];

    // State flags
    this.isActive = false;
    this.behaviorTimeout = null;
    this.glitchMode = false;

    this.glitchMode = false;
    this.destroyed = false;

    this.init();
  }

  init() {
    this.setupControls();
    this.showMessage('👋 Click the machine to see what happens!');
    requestAnimationFrame(() => this.animate());
  }

  setupControls() {
    // Mouse tracking (throttled for performance)
    let mouseMoveTimer;
    this.canvas.addEventListener('mousemove', (e) => {
      clearTimeout(mouseMoveTimer);
      mouseMoveTimer = setTimeout(() => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      }, 16); // 60fps throttle
    });

    // Click detection
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - this.machine.x;
      const dy = y - this.machine.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.machine.size * this.machine.scale) {
        this.triggerBehavior();
      }
    });

    // Double click for mega chaos
    this.canvas.addEventListener('dblclick', () => {
      this.megaChaos();
    });

    // Buttons
    document.getElementById('start-btn')?.addEventListener('click', () => {
      this.isActive = true;
      this.showMessage('⚡ Machine is now ACTIVE and unpredictable!');
    });

    document.getElementById('stop-btn')?.addEventListener('click', () => {
      this.isActive = false;
      this.showMessage('😴 Machine calmed down...');
    });

    document.getElementById('reset-btn')?.addEventListener('click', () => this.reset());

    // Emotion buttons
    ['happy', 'sad', 'angry', 'scared', 'tired', 'neutral'].forEach(emotion => {
      document.getElementById(`emotion-${emotion}`)?.addEventListener('click', () => {
        this.setEmotion(emotion);
      });
    });

    document.getElementById('emotion-random')?.addEventListener('click', () => {
      this.triggerBehavior();
    });
  }

  triggerBehavior() {
    // Weighted random selection
    const totalWeight = this.behaviors.reduce((sum, b) => sum + b.weight, 0);
    let random = Math.random() * totalWeight;

    for (const behavior of this.behaviors) {
      random -= behavior.weight;
      if (random <= 0) {
        this[behavior.name]?.();
        this.showMessage(behavior.msg);
        this.playTone(300 + Math.random() * 400);
        break;
      }
    }

    this.machine.angry = Math.min(100, this.machine.angry + 5);
  }

  megaChaos() {
    this.showMessage('💥💥 MEGA CHAOS MODE! 💥💥');
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.triggerBehavior(), i * 200);
    }
  }

  setEmotion(emotion) {
    this.machine.mood = emotion;
    const emotions = {
      happy: '😊 "Feeling good!"',
      sad: '😢 "Why so serious?"',
      angry: '😠 "GRRRR!"',
      scared: '😨 "Don\'t hurt me!"',
      tired: '😴 "So sleepy..."',
      neutral: '😐 "Whatever..."'
    };
    this.showMessage(emotions[emotion]);
    this.triggerBehavior();
  }

  // Optimized behaviors
  runAway() {
    const dx = this.machine.x - this.mouse.x;
    const dy = this.machine.y - this.mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    this.machine.vx = (dx / dist) * 12;
    this.machine.vy = (dy / dist) * 12;
  }

  spin() {
    let spins = 0;
    const spinAnim = () => {
      this.machine.rotation += 0.5;
      spins++;
      if (spins < 20) requestAnimationFrame(spinAnim);
      else this.machine.rotation = 0;
    };
    spinAnim();
  }

  bounce() {
    this.machine.vy = -20;
  }

  explode() {
    this.createParticles(this.machine.x, this.machine.y, 40, this.machine.color);
    setTimeout(() => {
      this.machine.x = 100 + Math.random() * 300;
      this.machine.y = 100 + Math.random() * 150;
      this.createParticles(this.machine.x, this.machine.y, 20, '#10b981');
    }, 300);
  }

  teleport() {
    this.createParticles(this.machine.x, this.machine.y, 20, '#8b5cf6');
    this.machine.x = 50 + Math.random() * 400;
    this.machine.y = 50 + Math.random() * 250;
    this.createParticles(this.machine.x, this.machine.y, 20, '#06b6d4');
  }

  shrink() {
    this.machine.scale = 0.2;
    setTimeout(() => { this.machine.scale = 1; }, 2000);
  }

  grow() {
    this.machine.scale = 3.0;
    setTimeout(() => { this.machine.scale = 1; }, 2000);
  }

  rainbow() {
    let frame = 0;
    const rainbowAnim = () => {
      this.machine.color = `hsl(${frame * 15}, 80%, 60%)`;
      frame++;
      if (frame < 60) requestAnimationFrame(rainbowAnim);
      else this.machine.color = '#3b82f6';
    };
    rainbowAnim();
  }

  tantrum() {
    let shakes = 0;
    const tantrumAnim = () => {
      this.machine.x += (Math.random() - 0.5) * 30;
      this.machine.y += (Math.random() - 0.5) * 30;
      this.machine.rotation += 0.4;
      shakes++;
      if (shakes < 20) requestAnimationFrame(tantrumAnim);
    };
    tantrumAnim();
  }

  hide() {
    let alpha = 1;
    const hideAnim = () => {
      this.ctx.globalAlpha = alpha;
      alpha -= 0.05;
      if (alpha > 0.05) requestAnimationFrame(hideAnim);
      else {
        setTimeout(() => {
          let fadeIn = 0.1;
          const showAnim = () => {
            this.ctx.globalAlpha = fadeIn;
            fadeIn += 0.05;
            if (fadeIn < 1) requestAnimationFrame(showAnim);
            else this.ctx.globalAlpha = 1;
          };
          showAnim();
        }, 1000);
      }
    };
    hideAnim();
  }

  shake() {
    let shakes = 0;
    const shakeAnim = () => {
      this.machine.x += Math.sin(shakes * 0.8) * 8;
      shakes++;
      if (shakes < 30) requestAnimationFrame(shakeAnim);
    };
    shakeAnim();
  }

  sleep() {
    this.machine.vy = 5;
    setTimeout(() => {
      this.machine.mood = 'tired';
      this.isActive = false;
    }, 500);
  }

  dance() {
    let frame = 0;
    const danceAnim = () => {
      this.machine.x += Math.sin(frame * 0.3) * 5;
      this.machine.y += Math.cos(frame * 0.3) * 3;
      this.machine.rotation = Math.sin(frame * 0.2) * 0.4;
      frame++;
      if (frame < 50) requestAnimationFrame(danceAnim);
      else this.machine.rotation = 0;
    };
    danceAnim();
  }

  multiply() {
    for (let i = 0; i < 6; i++) {
      this.clones.push({
        x: this.machine.x + (Math.random() - 0.5) * 100,
        y: this.machine.y + (Math.random() - 0.5) * 100,
        life: 1,
        size: 30
      });
    }
  }

  disguise() {
    const shapes = ['■', '●', '▲', '♦', '★'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    this.machine.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    setTimeout(() => { this.machine.color = '#3b82f6'; }, 3000);
  }

  fakeError() {
    this.ctx.fillStyle = '#0000AA'; // Blue screen blue
    this.ctx.fillRect(0, 0, 500, 350);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '20px monospace';
    this.ctx.fillText('FATAL ERROR 0x000000', 50, 100);
    this.ctx.fillText('Press any key to continue...', 50, 150);
    
    // Pause rendering for a moment to simulate freeze
    const now = Date.now();
    while (Date.now() - now < 500) {} 
  }

  gravitySwitch() {
    this.machine.gravity = -0.4;
    setTimeout(() => { this.machine.gravity = 0.4; }, 2000);
  }

  glitch() {
    this.glitchMode = true;
    setTimeout(() => { this.glitchMode = false; }, 1000);
  }

  reset() {
    this.machine = {
      x: 250, y: 175, size: 50, vx: 0, vy: 0,
      rotation: 0, scale: 1, color: '#3b82f6',
      mood: 'neutral', energy: 100, angry: 0,
      gravity: 0.4
    };
    this.particles = [];
    this.clones = [];
    this.isActive = false;
    this.ctx.globalAlpha = 1;
    this.glitchMode = false;
    this.showMessage('🔄 Reset! Click me again!');
  }

  animate() {
    if (this.destroyed) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  update() {
    // Physics
    this.machine.x += this.machine.vx;
    this.machine.y += this.machine.vy;
    this.machine.vx *= 0.92;
    this.machine.vy *= 0.92;
    this.machine.vy += this.machine.gravity; // Gravity

    // Boundaries with bounce
    const size = this.machine.size * this.machine.scale;
    if (this.machine.x - size < 0 || this.machine.x + size > 500) {
      this.machine.vx *= -0.7;
      this.machine.x = Math.max(size, Math.min(500 - size, this.machine.x));
    }
    if (this.machine.y - size < 0 || this.machine.y + size > 350) {
      this.machine.vy *= -0.7;
      this.machine.y = Math.max(size, Math.min(350 - size, this.machine.y));
    }

    // Active behavior
    if (this.isActive) {
      const dx = this.machine.x - this.mouse.x;
      const dy = this.machine.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120 && Math.random() < 0.03) {
        this.runAway();
      }

      if (Math.random() < 0.005) {
        this.triggerBehavior();
      }
    }

    // Update particles (optimized)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= 0.03;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update clones
    for (let i = this.clones.length - 1; i >= 0; i--) {
      this.clones[i].life -= 0.015;
      if (this.clones[i].life <= 0) {
        this.clones.splice(i, 1);
      }
    }

    // Energy decay
    this.machine.angry = Math.max(0, this.machine.angry - 0.1);

    // Update energy display
    const bar = document.getElementById('energy-bar');
    const text = document.getElementById('energy-text');
    if (bar) bar.style.width = (100 - this.machine.angry) + '%';
    if (text) text.textContent = Math.floor(100 - this.machine.angry) + '%';
  }

  draw() {
    // Clear with slight trail for smoothness
    this.ctx.fillStyle = 'rgba(17, 24, 39, 0.2)';
    this.ctx.fillRect(0, 0, 500, 350);

    if (this.glitchMode) {
      this.ctx.save();
      this.ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    }

    // Particles (batched for performance)
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    });
    this.ctx.globalAlpha = 1;

    // Clones
    this.clones.forEach(c => {
      this.ctx.globalAlpha = c.life * 0.6;
      this.ctx.fillStyle = this.machine.color;
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.size/2, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Main machine
    this.ctx.save();
    this.ctx.translate(this.machine.x, this.machine.y);
    this.ctx.rotate(this.machine.rotation);
    this.ctx.scale(this.machine.scale, this.machine.scale);

    // Glow effect
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = this.machine.color;

    // Body
    this.ctx.fillStyle = this.machine.color;
    this.ctx.beginPath();
    this.ctx.roundRect(-25, -25, 50, 50, 10);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;

    // Face based on mood
    this.ctx.fillStyle = '#000';

    if (this.machine.mood === 'happy') {
      this.ctx.beginPath();
      this.ctx.arc(-10, -8, 4, 0, Math.PI * 2); // Left Eye
      this.ctx.arc(10, -8, 4, 0, Math.PI * 2); // Right Eye
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(0, 5, 10, 0, Math.PI); // Smile
      this.ctx.fill();
    } else if (this.machine.mood === 'sad') {
      this.ctx.beginPath();
      this.ctx.arc(-10, -5, 4, 0, Math.PI * 2);
      this.ctx.arc(10, -5, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(0, 15, 10, Math.PI, 0); // Frown
      this.ctx.fill();
    } else if (this.machine.mood === 'angry') {
      // Angry eyebrows
      this.ctx.beginPath();
      this.ctx.moveTo(-15, -15);
      this.ctx.lineTo(-5, -10);
      this.ctx.moveTo(15, -15);
      this.ctx.lineTo(5, -10);
      this.ctx.stroke();
      
      this.ctx.fillRect(-12, -8, 5, 5);
      this.ctx.fillRect(7, -8, 5, 5);
      this.ctx.fillRect(-10, 10, 20, 4); // Gritted teeth
    } else if (this.machine.mood === 'scared') {
      this.ctx.beginPath();
      this.ctx.arc(-10, -8, 6, 0, Math.PI * 2); // Wide eyes
      this.ctx.arc(10, -8, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(0, 10, 6, 0, Math.PI * 2); // O mouth
      this.ctx.fill();
    } else if (this.machine.mood === 'tired') {
      this.ctx.fillRect(-12, -5, 8, 2); // Closed eyes
      this.ctx.fillRect(4, -5, 8, 2);
      this.ctx.beginPath();
      this.ctx.arc(0, 10, 4, 0, Math.PI * 2); // Snoring mouth
      this.ctx.fill();
    } else {
      // Neutral
      this.ctx.beginPath();
      this.ctx.arc(-10, -8, 4, 0, Math.PI * 2);
      this.ctx.arc(10, -8, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillRect(-8, 8, 16, 3); // Straight mouth
    }

    this.ctx.restore();

    if (this.glitchMode) {
      this.ctx.restore();
    }
  }

  createParticles(x, y, count, color) {
    // Limit total particles for performance
    if (this.particles.length > this.maxParticles) return;

    for (let i = 0; i < Math.min(count, this.maxParticles - this.particles.length); i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        life: 1,
        size: Math.random() * 4 + 1,
        color: color || `hsl(${Math.random() * 360}, 70%, 60%)`
      });
    }
  }

  showMessage(msg) {
    if (this.status) {
      this.status.textContent = msg;
    }
  }

  playTone(freq) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio not supported, fail silently
    }
  }
  destroy() {
    this.destroyed = true;
  }
}

window.ChaosMachine = ChaosMachine;
