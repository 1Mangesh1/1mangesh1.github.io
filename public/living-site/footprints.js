// Footprints — "Mangesh was here" indicator
(function () {
  'use strict';

  var ls = window.__livingSite;
  if (!ls) return;

  var WORKER_URL = ls.WORKER_URL;
  var page = window.location.pathname;

  // If owner, POST footprint
  var token = localStorage.getItem('footprint_token');
  if (token) {
    fetch(WORKER_URL + '/footprints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token, page: page }),
    }).catch(function () {});
  }

  // Fetch trail for all visitors
  async function showFootprint() {
    try {
      var res = await fetch(WORKER_URL + '/footprints');
      var data = await res.json();
      var entry = (data.trail || []).find(function (t) { return t.page === page; });
      if (!entry) return;

      var secondsAgo = Math.floor(Date.now() / 1000) - entry.time;
      var text;
      if (secondsAgo < 60) {
        text = '\uD83D\uDC63 Mangesh is here right now';
      } else if (secondsAgo < 3600) {
        var mins = Math.floor(secondsAgo / 60);
        text = '\uD83D\uDC63 Mangesh was here ' + mins + ' min ago';
      } else {
        return; // Too old, don't show
      }

      var el = document.createElement('div');
      el.style.cssText =
        'position:fixed;top:60px;left:50%;' +
        'transform:translateX(-50%);' +
        'background:rgba(0,0,0,0.7);' +
        'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
        'color:#fff;font-size:13px;' +
        'padding:6px 16px;border-radius:20px;' +
        'z-index:9995;pointer-events:none;' +
        'opacity:0;transition:opacity 0.5s ease;' +
        'font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
      el.textContent = text;
      document.body.appendChild(el);

      requestAnimationFrame(function () { el.style.opacity = '1'; });

      // Add breathing animation if "right now"
      if (secondsAgo < 60) {
        el.style.animation = 'footprint-breathe 2s ease-in-out infinite';
        var styleEl = document.createElement('style');
        styleEl.textContent =
          '@keyframes footprint-breathe{0%,100%{opacity:1}50%{opacity:0.7}}';
        document.head.appendChild(styleEl);
      }

      // Auto-hide after 8 seconds
      setTimeout(function () {
        el.style.opacity = '0';
        setTimeout(function () { el.remove(); }, 500);
      }, 8000);
    } catch (e) { /* silent */ }
  }

  showFootprint();
})();
