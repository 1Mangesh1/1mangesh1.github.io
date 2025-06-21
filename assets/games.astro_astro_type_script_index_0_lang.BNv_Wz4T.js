function s(t){const a=document.getElementById("game-container"),r=document.getElementById("game-title");if(!(!a||!r)){if(document.querySelectorAll(".game-content").forEach(e=>{e.classList.add("hidden")}),t==="pixel-drawer"){r.textContent="🎨 Pixel Sandbox / ASCII Drawer";const e=document.getElementById("pixel-drawer-game");if(!e)return;e.innerHTML=`
          <!-- Game Controls -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <div class="grid md:grid-cols-4 gap-4 mb-6">
              <div>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" id="mode-toggle" class="form-checkbox">
                  <span class="text-sm font-medium">ASCII Mode</span>
                </label>
              </div>
              
              <div>
                <label for="grid-size" class="block text-sm font-medium mb-2">Grid Size</label>
                <input type="range" id="grid-size" min="16" max="48" value="32" class="w-full">
                <span id="grid-size-value" class="text-sm text-gray-600">32×32</span>
              </div>

              <div>
                <label for="color-picker" class="block text-sm font-medium mb-2">Color</label>
                <input type="color" id="color-picker" value="#000000" class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md">
              </div>

              <div>
                <label for="char-selector" class="block text-sm font-medium mb-2">Character</label>
                <select id="char-selector" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                  <!-- Options will be populated by JavaScript -->
                </select>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <button id="clear-btn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                Clear Grid
              </button>
              <button id="save-json-btn" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Save as JSON
              </button>
              <button id="load-json-btn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Load JSON
              </button>
              <button id="export-code-btn" class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Export Code
              </button>
              <button id="download-png-btn" class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
                Download PNG
              </button>
              <button id="copy-ascii-btn" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                Copy ASCII
              </button>
            </div>
          </div>

          <!-- Drawing Canvas -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <div class="flex justify-center">
              <canvas id="pixel-canvas" class="border-2 border-gray-400 dark:border-gray-600 bg-white cursor-crosshair"></canvas>
            </div>
          </div>

          <!-- ASCII Output -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">ASCII Preview</h3>
            <pre id="ascii-preview" class="font-mono text-sm bg-white dark:bg-gray-900 p-4 rounded border overflow-auto max-h-64 whitespace-pre"></pre>
          </div>

          <!-- Hidden file input for loading -->
          <input type="file" id="json-file-input" accept=".json" style="display: none;">
        `,e.classList.remove("hidden"),d("/game-scripts/pixel-drawer.js",()=>{window.PixelDrawer&&new window.PixelDrawer})}else if(t==="hangman"){r.textContent="🎯 Hangman Game";const e=document.getElementById("hangman-game");if(!e)return;e.innerHTML=`
          <!-- Game Stats -->
          <div class="grid md:grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold" id="score">Wins: 0 | Losses: 0</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Score</div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold" id="wrong-guesses">0/6</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Wrong Guesses</div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div class="text-sm" id="guessed-letters">None</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Guessed Letters</div>
            </div>
          </div>

          <!-- Game Status -->
          <div class="text-center mb-6">
            <div id="game-status" class="text-lg mb-4">🎯 Guess the word letter by letter!</div>
            <div id="word-display" class="text-4xl font-mono font-bold tracking-widest mb-6">_ _ _ _ _</div>
          </div>

          <!-- Game Area -->
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Hangman Drawing -->
            <div class="flex justify-center">
              <canvas id="hangman-canvas" width="250" height="250" class="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"></canvas>
            </div>

            <!-- Keyboard -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Click letters to guess:</h3>
              <div id="keyboard" class="flex flex-wrap justify-center gap-1 mb-6">
                <!-- Keyboard will be generated here -->
              </div>

              <!-- Game Controls -->
              <div class="flex flex-wrap gap-3">
                <button id="new-game-btn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  🎮 New Game
                </button>
                <button id="hint-btn" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  💡 Hint
                </button>
                <button id="reset-score-btn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  🔄 Reset Score
                </button>
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 class="font-semibold mb-2">How to Play:</h3>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Guess letters by clicking the buttons or using your keyboard</li>
              <li>• You have 6 wrong guesses before the game ends</li>
              <li>• Words are programming and technology related</li>
              <li>• Use the hint button if you're stuck (reveals a random letter)</li>
            </ul>
          </div>
        `,e.classList.remove("hidden"),d("/game-scripts/hangman.js",()=>{window.HangmanGame&&setTimeout(()=>{new window.HangmanGame},100)})}a.classList.remove("hidden"),a.scrollIntoView({behavior:"smooth"})}}function o(){const t=document.getElementById("game-container");t&&t.classList.add("hidden")}function d(t,a){const r=document.createElement("script");r.src=t,r.onload=a,r.onerror=()=>console.error(`Failed to load script: ${t}`),document.head.appendChild(r)}window.showGame=s;window.hideGame=o;
