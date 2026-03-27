// The Living Site — makes mangeshbide.tech feel alive
// Loaded async, fails silently, zero Lighthouse impact

(function () {
  'use strict';

  var WORKER_URL = 'https://portfolio-ai-proxy.mangeshbide1.workers.dev';
  var POLL_INTERVAL = 1500;
  var VISITOR_ID = crypto.randomUUID();
  var EMOJIS = ['\u{1F98A}','\u{1F419}','\u{1F989}','\u{1F41D}','\u{1F98B}','\u{1F42C}','\u{1F98E}','\u{1F422}','\u{1F9A9}','\u{1F427}','\u{1F996}','\u{1F433}','\u{1F99C}','\u{1F43A}','\u{1F9A6}','\u{1F43E}'];
  var COLORS = ['#a78bfa','#f472b6','#34d399','#fbbf24','#60a5fa','#f87171','#a3e635','#c084fc'];
  var EMOJI = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  var COLOR = COLORS[Math.floor(Math.random() * COLORS.length)];

  // Shared state
  var state = {
    cursorX: 0,
    cursorY: 0,
    page: window.location.pathname,
    cursors: [],
    visitorCount: 0,
    tabVisible: true,
  };

  // Track cursor position
  document.addEventListener('mousemove', function (e) {
    state.cursorX = (e.clientX / window.innerWidth) * 100;
    state.cursorY = ((e.clientY + window.scrollY) / document.documentElement.scrollHeight) * 100;
  });

  // Pause polling when tab hidden
  document.addEventListener('visibilitychange', function () {
    state.tabVisible = !document.hidden;
  });

  // Presence polling loop
  async function presenceLoop() {
    if (!state.tabVisible) return;
    try {
      // POST our position
      await fetch(WORKER_URL + '/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: VISITOR_ID,
          x: state.cursorX,
          y: state.cursorY,
          page: state.page,
          emoji: EMOJI,
          color: COLOR,
        }),
      });

      // GET all cursors
      var res = await fetch(WORKER_URL + '/presence');
      var data = await res.json();
      state.cursors = data.cursors.filter(function (c) { return c.id !== VISITOR_ID; });
      state.visitorCount = data.cursors.length;

      // Dispatch events for other modules
      window.dispatchEvent(new CustomEvent('living-site:presence', { detail: state }));
    } catch (e) {
      // Silent fail
    }
  }

  // Start modules after DOM ready
  function init() {
    // Load sub-modules
    var modules = [
      '/living-site/ambient-mood.js',
      '/living-site/ghost-cursors.js',
      '/living-site/visitor-count.js',
      '/living-site/heatmap.js',
      '/living-site/footprints.js',
    ];
    modules.forEach(function (src) {
      var s = document.createElement('script');
      s.src = src;
      document.head.appendChild(s);
    });

    // Start presence loop
    setInterval(presenceLoop, POLL_INTERVAL);
    presenceLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for other modules
  window.__livingSite = { state: state, WORKER_URL: WORKER_URL, VISITOR_ID: VISITOR_ID };
})();
