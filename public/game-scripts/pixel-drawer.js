class PixelDrawer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.mode = 'pixel'; // 'pixel' or 'ascii'
    this.gridSize = 16;
    this.cellSize = 20;
    this.currentColor = '#000000';
    this.currentChar = '█';
    this.isDrawing = false;
    this.grid = [];
    this.characters = ['█', '▓', '▒', '░', '●', '○', '■', '□', '▲', '▼', '◆', '◇', '★', '☆', '@', '#', '$', '%', '&', '*'];
    
    this.initializeCanvas();
    this.setupControls();
    this.setupEventListeners();
    this.clearGrid();
  }

  initializeCanvas() {
    this.canvas = document.getElementById('pixel-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.updateCanvasSize();
    }
  }

  updateCanvasSize() {
    if (!this.canvas) return;
    
    const totalSize = this.gridSize * this.cellSize;
    this.canvas.width = totalSize;
    this.canvas.height = totalSize;
    this.canvas.style.width = `${Math.min(totalSize, 400)}px`;
    this.canvas.style.height = `${Math.min(totalSize, 400)}px`;
  }

  setupControls() {
    // Mode toggle
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle) {
      modeToggle.addEventListener('change', (e) => {
        this.mode = e.target.checked ? 'ascii' : 'pixel';
        this.updateDisplay();
      });
    }

    // Grid size
    const gridSizeSlider = document.getElementById('grid-size');
    const gridSizeValue = document.getElementById('grid-size-value');
    if (gridSizeSlider && gridSizeValue) {
      gridSizeSlider.addEventListener('input', (e) => {
        this.gridSize = parseInt(e.target.value);
        gridSizeValue.textContent = `${this.gridSize}×${this.gridSize}`;
        this.cellSize = Math.max(8, Math.min(25, 400 / this.gridSize));
        this.updateCanvasSize();
        this.clearGrid();
      });
    }

    // Color picker
    const colorPicker = document.getElementById('color-picker');
    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        this.currentColor = e.target.value;
      });
    }

    // Character selector
    const charSelector = document.getElementById('char-selector');
    if (charSelector) {
      this.characters.forEach(char => {
        const option = document.createElement('option');
        option.value = char;
        option.textContent = char;
        charSelector.appendChild(option);
      });
      
      charSelector.addEventListener('change', (e) => {
        this.currentChar = e.target.value;
      });
    }
  }

  setupEventListeners() {
    if (!this.canvas) return;

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDrawing = true;
      this.draw(e);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDrawing) {
        this.draw(e);
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDrawing = false;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isDrawing = false;
    });

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.draw(mouseEvent);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.isDrawing) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        this.draw(mouseEvent);
      }
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isDrawing = false;
    });

    // Button events
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearGrid());
    }

    const saveJsonBtn = document.getElementById('save-json-btn');
    if (saveJsonBtn) {
      saveJsonBtn.addEventListener('click', () => this.saveAsJSON());
    }

    const loadJsonBtn = document.getElementById('load-json-btn');
    const fileInput = document.getElementById('json-file-input');
    if (loadJsonBtn && fileInput) {
      loadJsonBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => this.loadFromJSON(e));
    }

    const exportCodeBtn = document.getElementById('export-code-btn');
    if (exportCodeBtn) {
      exportCodeBtn.addEventListener('click', () => this.exportAsCode());
    }

    const downloadPngBtn = document.getElementById('download-png-btn');
    if (downloadPngBtn) {
      downloadPngBtn.addEventListener('click', () => this.downloadAsPNG());
    }

    const copyAsciiBtn = document.getElementById('copy-ascii-btn');
    if (copyAsciiBtn) {
      copyAsciiBtn.addEventListener('click', () => this.copyASCIIToClipboard());
    }
  }

  draw(e) {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / this.cellSize);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / this.cellSize);

    if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
      this.grid[y][x] = {
        color: this.currentColor,
        char: this.currentChar,
        active: true
      };
      this.updateDisplay();
    }
  }

  clearGrid() {
    this.grid = [];
    for (let y = 0; y < this.gridSize; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        this.grid[y][x] = {
          color: '#ffffff',
          char: ' ',
          active: false
        };
      }
    }
    this.updateDisplay();
  }

  updateDisplay() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cell = this.grid[y][x];
        const pixelX = x * this.cellSize;
        const pixelY = y * this.cellSize;

        if (this.mode === 'pixel') {
          // Pixel mode
          if (cell.active) {
            this.ctx.fillStyle = cell.color;
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
          }
        } else {
          // ASCII mode
          if (cell.active) {
            this.ctx.fillStyle = cell.color;
            this.ctx.font = `${this.cellSize * 0.8}px monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
              cell.char,
              pixelX + this.cellSize / 2,
              pixelY + this.cellSize / 2
            );
          }
        }

        // Draw grid lines
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
      }
    }

    // Update ASCII preview
    this.updateASCIIPreview();
  }

  updateASCIIPreview() {
    const asciiPreview = document.getElementById('ascii-preview');
    if (!asciiPreview) return;

    let asciiArt = '';
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cell = this.grid[y][x];
        asciiArt += cell.active ? cell.char : ' ';
      }
      asciiArt += '\n';
    }
    asciiPreview.textContent = asciiArt;
  }

  saveAsJSON() {
    const data = {
      gridSize: this.gridSize,
      mode: this.mode,
      grid: this.grid,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-art-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  loadFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.gridSize && data.grid) {
          this.gridSize = data.gridSize;
          this.grid = data.grid;
          
          // Update UI
          const gridSizeSlider = document.getElementById('grid-size');
          const gridSizeValue = document.getElementById('grid-size-value');
          if (gridSizeSlider && gridSizeValue) {
            gridSizeSlider.value = this.gridSize;
            gridSizeValue.textContent = `${this.gridSize}×${this.gridSize}`;
          }

          this.cellSize = Math.max(8, Math.min(25, 400 / this.gridSize));
          this.updateCanvasSize();
          this.updateDisplay();
        }
      } catch (error) {
        alert('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  }

  exportAsCode() {
    let code = '';
    
    if (this.mode === 'pixel') {
      // Generate CSS/HTML code
      code = `<!-- Pixel Art - ${this.gridSize}x${this.gridSize} -->\n`;
      code += `<div style="display: inline-grid; grid-template-columns: repeat(${this.gridSize}, 1fr); gap: 1px; background: #fff;">\n`;
      
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          const cell = this.grid[y][x];
          const color = cell.active ? cell.color : '#ffffff';
          code += `  <div style="width: 10px; height: 10px; background: ${color};"></div>\n`;
        }
      }
      code += `</div>`;
    } else {
      // Generate ASCII art
      code = `// ASCII Art - ${this.gridSize}x${this.gridSize}\n`;
      code += 'const asciiArt = `\n';
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          const cell = this.grid[y][x];
          code += cell.active ? cell.char : ' ';
        }
        code += '\n';
      }
      code += '`;\n\nconsole.log(asciiArt);';
    }

    // Create and download file
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-art-code-${Date.now()}.${this.mode === 'pixel' ? 'html' : 'js'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  downloadAsPNG() {
    if (!this.canvas) return;

    const link = document.createElement('a');
    link.download = `pixel-art-${Date.now()}.png`;
    link.href = this.canvas.toDataURL();
    link.click();
  }

  copyASCIIToClipboard() {
    let asciiArt = '';
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cell = this.grid[y][x];
        asciiArt += cell.active ? cell.char : ' ';
      }
      asciiArt += '\n';
    }

    navigator.clipboard.writeText(asciiArt).then(() => {
      // Show feedback
      const btn = document.getElementById('copy-ascii-btn');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('bg-green-500', 'text-white');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('bg-green-500', 'text-white');
        }, 2000);
      }
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  }
}

// Initialize when script loads
if (typeof window !== 'undefined') {
  window.PixelDrawer = PixelDrawer;
} 