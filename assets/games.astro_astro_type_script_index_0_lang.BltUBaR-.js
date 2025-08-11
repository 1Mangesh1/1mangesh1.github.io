function a(t){const r=document.getElementById("game-container"),s=document.getElementById("game-title");if(!(!r||!s)){if(document.querySelectorAll(".game-content").forEach(e=>{e.classList.add("hidden")}),t==="pixel-drawer"){s.textContent="🎨 Pixel Sandbox / ASCII Drawer";const e=document.getElementById("pixel-drawer-game");if(!e)return;e.innerHTML=`
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
        `,e.classList.remove("hidden"),o("/game-scripts/pixel-drawer.js",()=>{window.PixelDrawer&&new window.PixelDrawer})}else if(t==="useless-machine"){s.textContent="🤖 Useless Machine";const e=document.getElementById("useless-machine-game");if(!e)return;e.innerHTML=`
          <!-- Game Area -->
          <div class="flex flex-col items-center">
            <!-- Useless Machine Drawing -->
            <div class="mb-6">
              <canvas id="useless-machine-canvas" width="500" height="350" class="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-900 cursor-crosshair"></canvas>
            </div>

            <!-- Game Controls -->
            <div class="w-full max-w-md">
              <h3 class="text-lg font-semibold mb-4 text-center">Click to interact:</h3>
              <div class="flex flex-wrap justify-center gap-2 mb-4 useless-machine-controls">
                <button id="start-btn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  🚀 Start
                </button>
                <button id="stop-btn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  ⏹️ Stop
                </button>
                <button id="reset-btn" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                  ↩️ Reset
                </button>
              </div>
              
              <!-- Status Display -->
              <div id="status" class="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                Ready to be useless!
              </div>
              
              <!-- Energy Display -->
              <div class="text-center mb-4">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Energy Level</div>
                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div id="energy-bar" class="bg-green-500 h-3 rounded-full transition-all duration-300" style="width: 100%"></div>
                </div>
                <div id="energy-text" class="text-xs text-gray-500 dark:text-gray-400 mt-1">100%</div>
              </div>
              
              <!-- Emotion Buttons -->
              <div class="mb-4">
                <h4 class="text-sm font-semibold mb-2 text-center">Force Emotions:</h4>
                <div class="grid grid-cols-4 gap-2">
                  <button id="emotion-happy" class="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors">
                    😊 Happy
                  </button>
                  <button id="emotion-sad" class="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
                    😢 Sad
                  </button>
                  <button id="emotion-angry" class="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors">
                    😠 Angry
                  </button>
                  <button id="emotion-confused" class="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors">
                    😵 Confused
                  </button>
                </div>
                <div class="grid grid-cols-4 gap-2 mt-2">
                  <button id="emotion-scared" class="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors">
                    😨 Scared
                  </button>
                  <button id="emotion-tired" class="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors">
                    😴 Tired
                  </button>
                  <button id="emotion-neutral" class="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition-colors">
                    😐 Neutral
                  </button>
                  <button id="emotion-random" class="px-2 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 transition-colors">
                    🎲 Random
                  </button>
                </div>
              </div>
              
              <!-- Enhanced Instructions -->
              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                <p><strong>🎮 Controls:</strong></p>
                <ul class="space-y-1 ml-4">
                  <li>• <strong>Click</strong> to trigger random useless actions</li>
                  <li>• <strong>Double-click</strong> to trigger a tantrum!</li>
                  <li>• <strong>Move mouse</strong> near the machine to watch it run away</li>
                  <li>• <strong>Watch</strong> for thought bubbles and mood changes</li>
                  <li>• <strong>Use emotion buttons</strong> to force specific moods</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 class="font-semibold mb-2">🎯 What This Machine Does (Absolutely Nothing Useful!):</h3>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• <strong>Runs away</strong> from your mouse cursor like a scared robot</li>
              <li>• <strong>Turns itself off</strong> when you try to interact with it</li>
              <li>• <strong>Performs random actions:</strong> spin, bounce, shake, hide, teleport, dance, shrink, grow, sleep, protest, malfunction, and more!</li>
              <li>• <strong>Changes mood and color</strong> based on its current state</li>
              <li>• <strong>Shows thought bubbles</strong> with amusing messages</li>
              <li>• <strong>Creates particle effects</strong> for visual flair</li>
              <li>• <strong>Has an energy system</strong> that affects its behavior</li>
              <li>• <strong>Completely pointless</strong> but endlessly entertaining!</li>
            </ul>
          </div>
        `,e.classList.remove("hidden"),o("/game-scripts/useless-machine.js",()=>{window.UselessMachine&&setTimeout(()=>{new window.UselessMachine},100)})}else if(t==="wack-a-bug"){s.textContent="🐛 Wack a Bug";const e=document.getElementById("wack-a-bug-game");if(!e)return;e.innerHTML=`
          <!-- Game Area -->
          <div class="flex flex-col items-center">
            <!-- Wack a Bug Canvas -->
            <div class="mb-6">
              <canvas id="wack-a-bug-canvas" width="500" height="400" class="border border-gray-300 dark:border-gray-600 rounded-lg bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900 dark:to-green-800"></canvas>
            </div>

            <!-- Game Controls -->
            <div class="w-full max-w-md">
              <h3 class="text-lg font-semibold mb-4 text-center">🐛 Bug Wacking Fun!</h3>
              
              <!-- Score Display -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-yellow-600" id="score">0</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Score</div>
                </div>
                <div class="text-center p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600" id="high-score">0</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">High Score</div>
                </div>
              </div>
              
              <!-- Game Controls -->
              <div class="flex flex-wrap justify-center gap-2 mb-4 wack-a-bug-controls">
                <button id="start-game-btn" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  🚀 Start Game
                </button>
                <button id="pause-game-btn" class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors">
                  ⏸️ Pause
                </button>
                <button id="reset-game-btn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  🔄 Reset
                </button>
              </div>
              
              <!-- Game Status -->
              <div id="game-status" class="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                Click Start Game to begin!
              </div>
              
              <!-- Instructions -->
              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-center">
                <p><strong>🎯 How to Play:</strong></p>
                <ul class="space-y-1">
                  <li>• Click bugs as they appear to score points</li>
                  <li>• Bigger bugs = more points</li>
                  <li>• Don't let bugs escape!</li>
                  <li>• Try to beat your high score!</li>
                </ul>
              </div>
            </div>
          </div>
        `,e.classList.remove("hidden"),o("/game-scripts/wack-a-bug.js",()=>{window.WackABug&&setTimeout(()=>{new window.WackABug},100)})}else if(t==="hangman"){s.textContent="🎯 Hangman Game";const e=document.getElementById("hangman-game");if(!e)return;e.innerHTML=`
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
        `,e.classList.remove("hidden"),o("/game-scripts/hangman.js",()=>{window.HangmanGame&&setTimeout(()=>{new window.HangmanGame},100)})}r.classList.remove("hidden"),r.scrollIntoView({behavior:"smooth"})}}function i(){const t=document.getElementById("game-container");t&&t.classList.add("hidden")}function o(t,r){const s=document.createElement("script");s.src=t,s.onload=r,s.onerror=()=>console.error(`Failed to load script: ${t}`),document.head.appendChild(s)}window.showGame=a;window.hideGame=i;
