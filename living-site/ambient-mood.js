// Ambient Mood — site background subtly shifts based on time of day and visitor count
(function () {
  'use strict';

  function getTimeHue() {
    var hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return { hue: 210, sat: 20 };  // cool blue
    if (hour >= 12 && hour < 17) return { hue: 35, sat: 15 };   // warm neutral
    if (hour >= 17 && hour < 21) return { hue: 30, sat: 30 };   // golden amber
    return { hue: 240, sat: 25 };                                 // deep indigo
  }

  function getVisitorShift(count) {
    if (count >= 10) return { hueDelta: 20, opacity: 0.06 };
    if (count >= 5) return { hueDelta: 10, opacity: 0.04 };
    return { hueDelta: 0, opacity: 0.02 };
  }

  function update(visitorCount) {
    var time = getTimeHue();
    var shift = getVisitorShift(visitorCount || 1);
    var isDark = document.documentElement.classList.contains('dark');

    var hue = isDark ? 240 : time.hue + shift.hueDelta;
    var sat = isDark ? 30 : time.sat;
    var opacity = shift.opacity;

    document.documentElement.style.setProperty('--ambient-hue', hue);
    document.documentElement.style.setProperty('--ambient-sat', sat + '%');
    document.documentElement.style.setProperty('--ambient-opacity', opacity);
  }

  // Add the CSS for the ambient overlay
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var style = document.createElement('style');
  style.textContent =
    'body::after{' +
      'content:"";' +
      'position:fixed;inset:0;' +
      'pointer-events:none;z-index:0;' +
      'background:radial-gradient(ellipse at 50% 30%,' +
        'hsla(var(--ambient-hue,210),var(--ambient-sat,20%),60%,var(--ambient-opacity,0.02)),' +
        'transparent 70%);' +
      'transition:' + (prefersReducedMotion ? 'none' : 'background 5s ease') + ';' +
    '}';
  document.head.appendChild(style);

  // Initial update
  update(1);

  // Listen for presence updates
  window.addEventListener('living-site:presence', function (e) {
    update(e.detail.visitorCount);
  });

  // Update time-based hue every minute
  setInterval(function () {
    var ls = window.__livingSite;
    update(ls ? ls.state.visitorCount : 1);
  }, 60000);
})();
