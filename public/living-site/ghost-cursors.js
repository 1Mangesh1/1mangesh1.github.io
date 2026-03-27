// Ghost Cursors — see other visitors' cursors in real-time
(function () {
  'use strict';

  var MAX_CURSORS = 20;
  var container = document.createElement('div');
  container.id = 'ghost-cursors';
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;';
  document.body.appendChild(container);

  var cursorElements = new Map();

  function updateCursors(cursors, currentPage) {
    var pageCursors = cursors
      .filter(function (c) { return c.page === currentPage; })
      .slice(0, MAX_CURSORS);

    var activeIds = new Set(pageCursors.map(function (c) { return c.id; }));

    // Remove departed cursors
    cursorElements.forEach(function (el, id) {
      if (!activeIds.has(id)) {
        el.style.opacity = '0';
        setTimeout(function () { el.remove(); cursorElements.delete(id); }, 300);
      }
    });

    // Update or create cursors
    pageCursors.forEach(function (cursor) {
      var el = cursorElements.get(cursor.id);
      if (!el) {
        el = document.createElement('div');
        el.style.cssText =
          'position:absolute;width:8px;height:8px;border-radius:50%;' +
          'opacity:0;transition:transform 1.2s ease-out,opacity 0.3s ease;' +
          'pointer-events:none;z-index:9998;';
        el.style.color = cursor.color;
        el.style.backgroundColor = cursor.color;
        el.style.boxShadow = '0 0 6px 2px ' + cursor.color;

        // Emoji label
        var label = document.createElement('span');
        label.textContent = cursor.emoji;
        label.style.cssText = 'position:absolute;top:-18px;left:-4px;font-size:12px;';
        el.appendChild(label);

        container.appendChild(el);
        cursorElements.set(cursor.id, el);

        // Fade in
        requestAnimationFrame(function () { el.style.opacity = '0.2'; });
      }

      // Smooth move via transform
      var x = (cursor.x / 100) * window.innerWidth;
      var y = (cursor.y / 100) * document.documentElement.scrollHeight - window.scrollY;
      el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });
  }

  window.addEventListener('living-site:presence', function (e) {
    updateCursors(e.detail.cursors, e.detail.page);
  });
})();
