// Heatmap — track clicks and show aggregated heat overlay
(function () {
  'use strict';

  var ls = window.__livingSite;
  if (!ls) return;

  var WORKER_URL = ls.WORKER_URL;
  var page = window.location.pathname;
  var clickBuffer = [];
  var lastClickTime = 0;
  var heatmapVisible = false;
  var overlayCanvas = null;

  // Track clicks (throttled 500ms)
  document.addEventListener('click', function (e) {
    var now = Date.now();
    if (now - lastClickTime < 500) return;
    lastClickTime = now;

    var x = (e.clientX / window.innerWidth) * 100;
    var y = ((e.clientY + window.scrollY) / document.documentElement.scrollHeight) * 100;
    clickBuffer.push({ x: x, y: y });

    // Flush every 10 clicks
    if (clickBuffer.length >= 10) flushClicks();
  });

  function flushClicks() {
    if (clickBuffer.length === 0) return;
    var clicks = clickBuffer.splice(0, clickBuffer.length);
    try {
      fetch(WORKER_URL + '/heatmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: page, clicks: clicks }),
      }).catch(function () {});
    } catch (e) { /* silent */ }
  }

  // Flush remaining clicks before page unload
  window.addEventListener('beforeunload', function () { if (clickBuffer.length) flushClicks(); });

  // Add toggle button to visitor pill
  function addToggle() {
    var pill = document.getElementById('visitor-pill');
    if (!pill) { setTimeout(addToggle, 500); return; }

    var btn = document.createElement('span');
    btn.textContent = ' \uD83D\uDD25';
    btn.style.cssText = 'cursor:pointer;margin-left:4px;';
    btn.title = 'Toggle heatmap';
    btn.addEventListener('click', toggleHeatmap);
    var summaryEl = pill.querySelector('#visitor-summary');
    if (summaryEl) summaryEl.appendChild(btn);
  }
  addToggle();

  async function toggleHeatmap() {
    heatmapVisible = !heatmapVisible;
    if (!heatmapVisible) {
      if (overlayCanvas) { overlayCanvas.remove(); overlayCanvas = null; }
      return;
    }

    try {
      var res = await fetch(WORKER_URL + '/heatmap?page=' + encodeURIComponent(page));
      var data = await res.json();
      renderHeatmap(data);
    } catch (e) { /* silent */ }
  }

  function renderHeatmap(data) {
    if (!data.grid || !data.grid.length) return;

    if (overlayCanvas) overlayCanvas.remove();
    overlayCanvas = document.createElement('canvas');
    overlayCanvas.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;' +
      'pointer-events:none;z-index:9996;opacity:0;transition:opacity 0.3s;';
    document.body.appendChild(overlayCanvas);
    requestAnimationFrame(function () { overlayCanvas.style.opacity = '0.4'; });

    var ctx = overlayCanvas.getContext('2d');
    overlayCanvas.width = window.innerWidth;
    overlayCanvas.height = window.innerHeight;

    var maxVal = Math.max(1, Math.max.apply(null, data.grid.flat()));
    var cellW = overlayCanvas.width / 50;
    var cellH = overlayCanvas.height / 50;

    for (var y = 0; y < data.grid.length; y++) {
      for (var x = 0; x < data.grid[y].length; x++) {
        var val = data.grid[y][x];
        if (val === 0) continue;
        var intensity = val / maxVal;
        var radius = Math.max(cellW, cellH) * (0.5 + intensity);
        var cx = x * cellW + cellW / 2;
        var cy = y * cellH + cellH / 2;

        var gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, 'rgba(255,' + Math.floor(120 * (1 - intensity)) + ',0,' + (0.3 * intensity) + ')');
        gradient.addColorStop(1, 'rgba(255,120,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      }
    }
  }
})();
