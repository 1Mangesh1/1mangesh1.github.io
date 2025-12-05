/**
 * PIXEL STUDIO PRO
 * Advanced pixel art editor with ASCII support
 * - Brush, Eraser, and Bucket Fill tools
 * - ASCII Art mode
 * - Export to JSON, PNG, and Clipboard
 * - Dynamic grid resizing
 */

class PixelStudio {
  constructor() {
    this.canvas = document.getElementById('pixel-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 32;
    this.cellSize = 0;
    this.currentColor = '#000000';
    this.isDrawing = false;
    this.mode = 'pixel'; // 'pixel' or 'ascii'
    this.tool = 'brush'; // 'brush', 'eraser', 'bucket'
    this.grid = [];
    this.asciiChars = ['█', '▓', '▒', '░', '●', '○', '■', '□', '▲', '▼', '◆', '◇', '★', '☆'];
    this.currentChar = '█';

    this.init();
  }

  init() {
    this.injectTools(); // Inject new tool buttons if missing
    this.updateCanvasSize();
    this.clearGrid();
    this.setupControls();
    this.setupCanvas();
    this.render();
  }

  injectTools() {
    // Check if tool buttons exist, if not, inject them into the controls
    const controls = document.querySelector('.bg-gray-50 .flex.flex-wrap.gap-3');
    if (controls && !document.getElementById('tool-brush')) {
      const toolsHtml = `
        <div class="flex gap-1 mr-2 border-r pr-2 border-gray-300">
          <button id="tool-brush" class="p-2 bg-gray-200 rounded hover:bg-gray-300 active" title="Brush">🖌️</button>
          <button id="tool-bucket" class="p-2 bg-gray-200 rounded hover:bg-gray-300" title="Bucket Fill">🪣</button>
          <button id="tool-eraser" class="p-2 bg-gray-200 rounded hover:bg-gray-300" title="Eraser">🧼</button>
        </div>
      `;
      const temp = document.createElement('div');
      temp.innerHTML = toolsHtml;
      while (temp.firstChild) {
        controls.insertBefore(temp.firstChild, controls.firstChild);
      }
    }
  }

  updateCanvasSize() {
    const size = Math.min(500, window.innerWidth - 40);
    this.cellSize = Math.floor(size / this.gridSize);
    const totalSize = this.cellSize * this.gridSize;
    this.canvas.width = totalSize;
    this.canvas.height = totalSize;
  }

  clearGrid() {
    this.grid = Array(this.gridSize).fill(null).map(() =>
      Array(this.gridSize).fill(null).map(() => ({ color: null, char: '█' }))
    );
  }

  setupControls() {
    // Tools
    ['brush', 'bucket', 'eraser'].forEach(t => {
      const btn = document.getElementById(`tool-${t}`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.tool = t;
          document.querySelectorAll('[id^="tool-"]').forEach(b => b.classList.remove('active', 'bg-blue-200'));
          btn.classList.add('active', 'bg-blue-200');
        });
      }
    });

    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle) {
      modeToggle.addEventListener('change', (e) => {
        this.mode = e.target.checked ? 'ascii' : 'pixel';
        this.render();
      });
    }

    const gridSlider = document.getElementById('grid-size');
    const gridValue = document.getElementById('grid-size-value');
    if (gridSlider && gridValue) {
      gridSlider.addEventListener('input', (e) => {
        this.gridSize = parseInt(e.target.value);
        gridValue.textContent = `${this.gridSize}×${this.gridSize}`;
        this.updateCanvasSize();
        this.clearGrid();
        this.render();
      });
    }

    const colorPicker = document.getElementById('color-picker');
    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        this.currentColor = e.target.value;
      });
    }

    const charSelector = document.getElementById('char-selector');
    if (charSelector) {
      charSelector.innerHTML = this.asciiChars.map(c => `<option value="${c}">${c}</option>`).join('');
      charSelector.addEventListener('change', (e) => {
        this.currentChar = e.target.value;
      });
    }

    document.getElementById('clear-btn')?.addEventListener('click', () => {
      this.clearGrid();
      this.render();
    });

    document.getElementById('save-json-btn')?.addEventListener('click', () => this.saveJSON());
    document.getElementById('download-png-btn')?.addEventListener('click', () => this.downloadPNG());
    document.getElementById('copy-ascii-btn')?.addEventListener('click', () => this.copyASCII());
  }

  setupCanvas() {
    const getCell = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor(((e.clientX || e.touches?.[0]?.clientX) - rect.left) / this.cellSize);
      const y = Math.floor(((e.clientY || e.touches?.[0]?.clientY) - rect.top) / this.cellSize);
      return { x, y };
    };

    const handleStart = (e) => {
      if (e.type === 'touchstart') e.preventDefault();
      const { x, y } = getCell(e);
      
      if (this.tool === 'bucket') {
        this.floodFill(x, y, this.currentColor);
      } else {
        this.isDrawing = true;
        this.draw(x, y);
      }
    };

    const handleMove = (e) => {
      if (e.type === 'touchmove') e.preventDefault();
      if (!this.isDrawing) return;
      const { x, y } = getCell(e);
      this.draw(x, y);
    };

    const handleEnd = () => this.isDrawing = false;

    this.canvas.addEventListener('mousedown', handleStart);
    this.canvas.addEventListener('mousemove', handleMove);
    this.canvas.addEventListener('mouseup', handleEnd);
    this.canvas.addEventListener('mouseleave', handleEnd);

    this.canvas.addEventListener('touchstart', handleStart);
    this.canvas.addEventListener('touchmove', handleMove);
    this.canvas.addEventListener('touchend', handleEnd);
  }

  draw(x, y) {
    if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return;
    
    const cell = this.grid[y][x];
    const newColor = this.tool === 'eraser' ? null : this.currentColor;
    
    // Optimize: Don't redraw if same
    if (cell.color === newColor && cell.char === this.currentChar) return;

    this.grid[y][x] = { 
      color: newColor, 
      char: this.tool === 'eraser' ? ' ' : this.currentChar 
    };
    
    this.render();
  }

  floodFill(startX, startY, fillColor) {
    if (startX < 0 || startX >= this.gridSize || startY < 0 || startY >= this.gridSize) return;

    const startCell = this.grid[startY][startX];
    const targetColor = startCell.color;
    
    // Don't fill if same color
    if (targetColor === fillColor) return;

    const stack = [[startX, startY]];
    
    while (stack.length) {
      const [x, y] = stack.pop();
      
      if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) continue;
      
      const currentCell = this.grid[y][x];
      if (currentCell.color !== targetColor) continue;

      this.grid[y][x] = { color: fillColor, char: this.currentChar };
      
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    this.render();
  }

  render() {
    // Clear
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid background (checkerboard for transparency)
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if ((x + y) % 2 === 0) {
          this.ctx.fillStyle = '#f9fafb';
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
      }
    }

    // Draw cells
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cell = this.grid[y][x];
        const px = x * this.cellSize;
        const py = y * this.cellSize;

        if (cell.color) {
          this.ctx.fillStyle = cell.color;
          this.ctx.fillRect(px, py, this.cellSize, this.cellSize);

          if (this.mode === 'ascii') {
            this.ctx.fillStyle = this.getContrastColor(cell.color);
            this.ctx.font = `${Math.floor(this.cellSize * 0.7)}px monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(cell.char, px + this.cellSize / 2, py + this.cellSize / 2);
          }
        }
      }
    }

    // Grid lines
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.gridSize; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.cellSize, 0);
      this.ctx.lineTo(i * this.cellSize, this.canvas.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.cellSize);
      this.ctx.lineTo(this.canvas.width, i * this.cellSize);
      this.ctx.stroke();
    }

    this.updateASCIIPreview();
  }

  updateASCIIPreview() {
    const preview = document.getElementById('ascii-preview');
    if (!preview) return;

    let ascii = '';
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        ascii += this.grid[y][x].color ? this.grid[y][x].char : ' ';
      }
      ascii += '\n';
    }
    preview.textContent = ascii;
  }

  getContrastColor(hex) {
    if (!hex) return '#000';
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000000' : '#FFFFFF';
  }

  saveJSON() {
    const data = { gridSize: this.gridSize, grid: this.grid };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pixel-art.json';
    a.click();
  }

  downloadPNG() {
    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = this.canvas.toDataURL();
    link.click();
  }

  copyASCII() {
    const text = document.getElementById('ascii-preview')?.textContent;
    if (text) {
      navigator.clipboard.writeText(text).then(() => alert('Copied!')).catch(() => alert('Failed to copy'));
    }
  }
}

window.PixelStudio = PixelStudio;
