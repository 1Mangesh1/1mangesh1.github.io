/**
 * CODE TYPER: SPEED CODING CHALLENGE
 * A unique typing speed test focused on code snippets
 * - Real code snippets from popular languages
 * - Syntax highlighting as you type
 * - Multiple difficulty levels and languages
 * - WPM, accuracy, and keystroke metrics
 * - Visual feedback with animations (Power Mode!)
 */

class CodeTyper {
  constructor() {
    this.codeDisplay = document.getElementById('code-display');
    this.inputArea = document.getElementById('typing-input');
    this.language = 'javascript';
    this.difficulty = 'medium';
    this.gameStarted = false;
    this.gameEnded = false;

    this.currentText = '';
    this.currentIndex = 0;
    this.startTime = 0;
    this.errors = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    
    // Streak system
    this.streak = 0;
    this.maxStreak = 0;

    this.wpm = 0;
    this.accuracy = 100;
    this.bestWPM = localStorage.getItem('codeTyperBestWPM') || 0;

    // Code snippets database
    this.snippets = {
      javascript: {
        easy: [
          'const hello = "world";',
          'let x = 10 + 5;',
          'if (true) { return; }',
          'for (let i = 0; i < 10; i++) {}',
          'const arr = [1, 2, 3];',
          'console.log("Hello World");',
          'const isEven = n => n % 2 === 0;'
        ],
        medium: [
          'const fetchData = async () => { const res = await fetch(url); return res.json(); };',
          'const sum = arr.reduce((acc, val) => acc + val, 0);',
          'const fibonacci = (n) => n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);',
          'const debounce = (fn, delay) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; };',
          'const unique = [...new Set(array)];',
          'const flatten = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);'
        ],
        hard: [
          'class BinarySearchTree { constructor() { this.root = null; } insert(value) { const node = { value, left: null, right: null }; if (!this.root) { this.root = node; } else { this.insertNode(this.root, node); } } }',
          'const quickSort = (arr) => { if (arr.length <= 1) return arr; const pivot = arr[0]; const left = arr.slice(1).filter(x => x < pivot); const right = arr.slice(1).filter(x => x >= pivot); return [...quickSort(left), pivot, ...quickSort(right)]; };',
          'function curry(fn) { return function curried(...args) { if (args.length >= fn.length) return fn.apply(this, args); return function(...args2) { return curried.apply(this, args.concat(args2)); } }; }'
        ]
      },
      python: {
        easy: [
          'x = 10',
          'if x > 5: print("yes")',
          'for i in range(10): pass',
          'def hello(): return "world"',
          'list = [1, 2, 3, 4, 5]',
          'print(f"Hello {name}")'
        ],
        medium: [
          '@decorator\ndef function(x, y): return x + y',
          'result = [x**2 for x in range(10) if x % 2 == 0]',
          'with open("file.txt", "r") as f: data = f.read()',
          'lambda x: x * 2 if x > 0 else 0',
          'dictionary = {key: value for key, value in iterable}'
        ],
        hard: [
          'class Node: def __init__(self, data): self.data = data; self.next = None\nclass LinkedList: def __init__(self): self.head = None',
          'def merge_sort(arr): if len(arr) <= 1: return arr; mid = len(arr) // 2; left = merge_sort(arr[:mid]); right = merge_sort(arr[mid:]); return merge(left, right)',
          'def generator(n): i = 0; while i < n: yield i; i += 1'
        ]
      },
      typescript: {
        easy: [
          'const x: number = 10;',
          'let name: string = "John";',
          'type User = { id: number; name: string; };',
          'interface Person { age: number; }',
          'const add = (a: number, b: number): number => a + b;'
        ],
        medium: [
          'const greet = <T extends { name: string }>(user: T): string => `Hello, ${user.name}`;',
          'type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };',
          'const map = <T, U>(arr: T[], fn: (item: T) => U): U[] => arr.map(fn);',
          'interface ReadonlyPoint { readonly x: number; readonly y: number; }'
        ],
        hard: [
          'type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]; };',
          'function compose<T>(...fns: Array<(arg: T) => T>) { return (x: T) => fns.reduceRight((acc, fn) => fn(acc), x); }',
          'type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;'
        ]
      }
    };

    this.setupControls();
    this.updateUI();
    this.selectSnippet();
  }

  setupControls() {
    // Language selection
    document.querySelectorAll('[data-language]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.language = btn.dataset.language;
        document.querySelectorAll('[data-language]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectSnippet();
      });
    });

    // Difficulty selection
    document.querySelectorAll('[data-diff]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.difficulty = btn.dataset.diff;
        document.querySelectorAll('[data-diff]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectSnippet();
      });
    });

    // Input handling
    this.inputArea.addEventListener('input', (e) => this.handleInput(e));
    this.inputArea.addEventListener('paste', (e) => e.preventDefault());

    this.inputArea.addEventListener('focus', () => {
      if (!this.gameStarted && !this.gameEnded) {
        this.start();
      }
    });

    // Buttons
    document.getElementById('start-typer-btn').addEventListener('click', () => this.start());
    document.getElementById('reset-typer-btn').addEventListener('click', () => this.reset());
    document.getElementById('new-snippet-btn').addEventListener('click', () => this.selectSnippet());
  }

  selectSnippet() {
    if (this.gameStarted) return;

    const snippets = this.snippets[this.language][this.difficulty];
    this.currentText = snippets[Math.floor(Math.random() * snippets.length)];
    this.renderText();
  }

  start() {
    if (this.gameEnded) this.reset();

    this.gameStarted = true;
    this.startTime = Date.now();
    this.inputArea.disabled = false;
    this.inputArea.focus();
    this.updateStatus('⌨️ Type the code as fast as you can!');

    this.updateInterval = setInterval(() => this.updateMetrics(), 100);
  }

  reset() {
    this.gameStarted = false;
    this.gameEnded = false;
    this.currentIndex = 0;
    this.errors = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.wpm = 0;
    this.accuracy = 100;
    this.streak = 0;
    this.maxStreak = 0;

    this.inputArea.value = '';
    this.inputArea.disabled = false;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.selectSnippet();
    this.updateUI();
    this.updateStatus('🎮 Click Start or focus input to begin!');
  }

  handleInput(e) {
    if (!this.gameStarted || this.gameEnded) return;

    const typed = this.inputArea.value;
    const lastChar = typed[typed.length - 1];
    const expectedChar = this.currentText[typed.length - 1];
    
    this.currentIndex = typed.length;
    this.totalKeystrokes++;

    // Check if character is correct
    if (lastChar === expectedChar) {
      this.correctKeystrokes++;
      this.streak++;
      this.maxStreak = Math.max(this.streak, this.maxStreak);
      
      // Pitch increases with streak
      const pitch = Math.min(800, 300 + this.streak * 20);
      this.playSound(pitch, 0.05);
      
      // Power mode particles
      this.createParticles();
      
      // Shake screen slightly on high streak
      if (this.streak > 10) {
        this.shakeScreen(2);
      }
    } else {
      this.streak = 0;
      this.errors++;
      this.playSound(150, 0.1);
      this.shakeScreen(5);
      
      // Flash red
      this.inputArea.style.backgroundColor = '#fee2e2';
      setTimeout(() => this.inputArea.style.backgroundColor = '', 100);
    }

    this.renderText();

    // Check completion
    if (typed === this.currentText) {
      this.complete();
    }
  }

  createParticles() {
    const cursor = document.querySelector('.current');
    if (!cursor) return;
    
    const rect = cursor.getBoundingClientRect();
    const container = document.getElementById('code-typer-game'); // Use game container as parent
    
    // Create 3-5 particles
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.style.position = 'absolute';
      p.style.left = (rect.left + rect.width / 2) + 'px';
      p.style.top = (rect.top + rect.height / 2) + 'px';
      p.style.width = '4px';
      p.style.height = '4px';
      p.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      p.style.borderRadius = '50%';
      p.style.pointerEvents = 'none';
      p.style.zIndex = '100';
      
      // Random velocity
      const vx = (Math.random() - 0.5) * 100;
      const vy = (Math.random() - 0.5) * 100;
      
      p.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
      ], {
        duration: 500,
        easing: 'cubic-bezier(0, .9, .57, 1)'
      }).onfinish = () => p.remove();
      
      document.body.appendChild(p); // Append to body to avoid clipping
    }
  }

  shakeScreen(intensity) {
    const container = document.getElementById('code-display');
    container.style.transform = `translate(${Math.random() * intensity - intensity/2}px, ${Math.random() * intensity - intensity/2}px)`;
    setTimeout(() => container.style.transform = 'none', 50);
  }

  renderText() {
    const typed = this.inputArea.value;
    let html = '';

    for (let i = 0; i < this.currentText.length; i++) {
      const char = this.currentText[i];
      let className = '';

      if (i < typed.length) {
        className = typed[i] === char ? 'correct' : 'incorrect';
      } else if (i === typed.length) {
        className = 'current';
      }

      // Add syntax highlighting classes
      const syntaxClass = this.getSyntaxClass(char, i);

      html += `<span class="${className} ${syntaxClass}">${char === ' ' ? '␣' : char}</span>`;
    }

    this.codeDisplay.innerHTML = html;
  }

  getSyntaxClass(char, index) {
    const text = this.currentText;

    // Keywords
    const keywords = ['const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while', 'return', 'async', 'await', 'def', 'type', 'interface'];
    for (const keyword of keywords) {
      const startIdx = text.lastIndexOf(keyword, index);
      if (startIdx !== -1 && index >= startIdx && index < startIdx + keyword.length) {
        if ((startIdx === 0 || !/\w/.test(text[startIdx - 1])) &&
            (startIdx + keyword.length === text.length || !/\w/.test(text[startIdx + keyword.length]))) {
          return 'syntax-keyword';
        }
      }
    }

    // Strings
    if (char === '"' || char === "'" || char === '`') return 'syntax-string';

    // Numbers
    if (/\d/.test(char)) return 'syntax-number';

    // Operators
    if (/[+\-*/<>=!&|]/.test(char)) return 'syntax-operator';

    // Brackets
    if (/[{}()\[\]]/.test(char)) return 'syntax-bracket';

    return '';
  }

  updateMetrics() {
    if (!this.gameStarted || this.gameEnded) return;

    const elapsed = (Date.now() - this.startTime) / 1000 / 60; // minutes
    const wordsTyped = this.correctKeystrokes / 5; // Standard: 5 chars = 1 word
    this.wpm = Math.round(wordsTyped / elapsed) || 0;
    this.accuracy = this.totalKeystrokes > 0
      ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
      : 100;

    this.updateUI();
  }

  complete() {
    this.gameEnded = true;
    this.inputArea.disabled = true;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateMetrics();

    // Save best WPM
    if (this.wpm > this.bestWPM) {
      this.bestWPM = this.wpm;
      localStorage.setItem('codeTyperBestWPM', this.bestWPM);
      this.updateStatus(`🏆 NEW RECORD! ${this.wpm} WPM with ${this.accuracy}% accuracy!`);
      this.celebrate();
    } else {
      this.updateStatus(`✅ Complete! ${this.wpm} WPM with ${this.accuracy}% accuracy`);
    }

    this.playSound(600, 0.3);
    this.updateUI();
  }

  celebrate() {
    // Create confetti effect
    const container = document.querySelector('.typing-container') || document.body;
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'typing-confetti';
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
        confetti.style.zIndex = '1000';
        
        // Physics animation
        const duration = 2000 + Math.random() * 2000;
        confetti.animate([
          { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
          duration: duration,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => confetti.remove();
        
        container.appendChild(confetti);
      }, i * 50);
    }
  }

  updateUI() {
    document.getElementById('typer-wpm').textContent = this.wpm;
    document.getElementById('typer-accuracy').textContent = this.accuracy + '%';
    document.getElementById('typer-errors').textContent = this.errors;
    document.getElementById('typer-best').textContent = this.bestWPM;

    const elapsed = this.gameStarted ? ((Date.now() - this.startTime) / 1000).toFixed(1) : '0.0';
    document.getElementById('typer-time').textContent = elapsed + 's';
    
    // Update streak UI if element exists (might need to add it to HTML later)
    const streakEl = document.getElementById('typer-streak');
    if (streakEl) streakEl.textContent = this.streak;
  }

  updateStatus(msg) {
    document.getElementById('typer-status').textContent = msg;
  }

  playSound(freq, duration) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }
  destroy() {
    this.gameStarted = false;
    this.gameEnded = true;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

window.CodeTyper = CodeTyper;
