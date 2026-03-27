// Visitor Count Pill — shows "N people exploring right now" with page breakdown
(function () {
  'use strict';

  // Create pill element
  var pill = document.createElement('div');
  pill.id = 'visitor-pill';
  pill.style.cssText =
    'position:fixed;bottom:20px;left:20px;' +
    'background:rgba(0,0,0,0.6);' +
    'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
    'color:#fff;font-size:13px;' +
    'padding:6px 12px;border-radius:20px;' +
    'z-index:9997;cursor:default;' +
    'transition:all 0.3s ease;' +
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif;' +
    'opacity:0;max-width:200px;';

  var summary = document.createElement('span');
  summary.id = 'visitor-summary';
  pill.appendChild(summary);

  var breakdown = document.createElement('div');
  breakdown.id = 'visitor-breakdown';
  breakdown.style.cssText =
    'display:none;margin-top:6px;font-size:11px;' +
    'opacity:0.8;line-height:1.6;white-space:nowrap;';
  pill.appendChild(breakdown);

  document.body.appendChild(pill);

  // Hide on narrow screens
  var mq = window.matchMedia('(max-width: 480px)');
  if (mq.matches) pill.style.display = 'none';
  mq.addEventListener('change', function (e) { pill.style.display = e.matches ? 'none' : ''; });

  // Hover to expand
  pill.addEventListener('mouseenter', function () { breakdown.style.display = 'block'; });
  pill.addEventListener('mouseleave', function () { breakdown.style.display = 'none'; });

  var lastCount = 0;

  window.addEventListener('living-site:presence', function (e) {
    var count = e.detail.visitorCount;
    var cursors = e.detail.cursors;

    // Update summary
    if (count <= 1) {
      summary.textContent = '\uD83D\uDC64 Just you';
    } else if (count > 50) {
      summary.textContent = '\uD83D\uDC65 50+ exploring';
    } else {
      summary.textContent = '\uD83D\uDC65 ' + count + ' exploring';
    }

    // Pulse on change
    if (count !== lastCount) {
      pill.style.transform = 'scale(1.05)';
      setTimeout(function () { pill.style.transform = ''; }, 200);
      lastCount = count;
    }

    // Page breakdown
    var pages = {};
    pages[window.location.pathname] = (pages[window.location.pathname] || 0) + 1;
    cursors.forEach(function (c) {
      pages[c.page] = (pages[c.page] || 0) + 1;
    });
    var sorted = Object.entries(pages).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
    breakdown.textContent = '';
    sorted.forEach(function (entry, i) {
      var prefix = i === sorted.length - 1 ? '\u2514' : '\u251C';
      var page = entry[0];
      var n = entry[1];
      var short = page.length > 15 ? page.slice(0, 15) + '\u2026' : page;
      var line = document.createElement('div');
      line.style.cssText = 'display:flex;justify-content:space-between;';
      line.textContent = prefix + ' ' + short;
      var count = document.createElement('span');
      count.textContent = n;
      line.appendChild(count);
      breakdown.appendChild(line);
    });

    // Fade in
    pill.style.opacity = '1';
  });
})();
