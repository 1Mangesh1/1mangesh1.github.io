/**
 * Earth Observatory — 3D Globe with NASA EONET Live Events
 * Powered by globe.gl (Three.js) — lazy-loaded with viewport-aware rendering
 */
(function () {
  'use strict';

  var API_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100';
  var CACHE_KEY = 'eonet_cache';
  var CACHE_TTL = 5 * 60 * 1000;
  var isMobile = window.innerWidth < 768;

  var TEXTURES = {
    dark: {
      globe: '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg',
      bump: isMobile ? '' : '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png',
      background: isMobile ? '' : '//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png',
      bgColor: '#0b0f1a',
      atmosphere: '#3a7bd5'
    },
    light: {
      globe: '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
      bump: isMobile ? '' : '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png',
      background: '',
      bgColor: '#f0f4f8',
      atmosphere: '#6ec6ff'
    }
  };

  var CATEGORY_CONFIG = {
    wildfires:    { color: '#f59e0b', label: 'Wildfires',      icon: '\u{1F525}' },
    severeStorms: { color: '#3b82f6', label: 'Severe Storms',  icon: '\u{1F32A}' },
    volcanoes:    { color: '#ef4444', label: 'Volcanoes',      icon: '\u{1F30B}' },
    floods:       { color: '#14b8a6', label: 'Floods',         icon: '\u{1F30A}' },
    earthquakes:  { color: '#a855f7', label: 'Earthquakes',    icon: '\u{1F4E1}' },
    seaLakeIce:   { color: '#67e8f9', label: 'Sea & Lake Ice', icon: '\u{1F9CA}' },
    landslides:   { color: '#d97706', label: 'Landslides',     icon: '\u{26F0}' },
    drought:      { color: '#eab308', label: 'Drought',        icon: '\u{2600}' },
    dustHaze:     { color: '#a3a3a3', label: 'Dust & Haze',    icon: '\u{1F32B}' },
    tempExtremes: { color: '#f43f5e', label: 'Temp Extremes',  icon: '\u{1F321}' },
    waterColor:   { color: '#06b6d4', label: 'Water Color',    icon: '\u{1F4A7}' },
    snow:         { color: '#e2e8f0', label: 'Snow',           icon: '\u{2744}' },
    manmade:      { color: '#78716c', label: 'Man-Made',       icon: '\u{1F3ED}' }
  };

  // ─── State ───────────────────────────────────────────────
  var globe;
  var allEvents = [];
  var filteredEvents = [];
  var processedPoints = [];
  var activeCategories = new Set(Object.keys(CATEGORY_CONFIG));
  var eventsContainer, eventsLoading, statsEl;
  var globeVisible = true;

  // ─── Helpers ─────────────────────────────────────────────

  function isDarkMode() {
    return document.documentElement.classList.contains('dark');
  }

  function getEventCoord(event) {
    if (!event.geometry || event.geometry.length === 0) return null;
    var geo = event.geometry[event.geometry.length - 1];
    if (geo.type === 'Point') return geo.coordinates;
    if (geo.type === 'Polygon' && geo.coordinates && geo.coordinates[0]) {
      var ring = geo.coordinates[0];
      var sumLng = 0, sumLat = 0;
      ring.forEach(function (c) { sumLng += c[0]; sumLat += c[1]; });
      return [sumLng / ring.length, sumLat / ring.length];
    }
    return null;
  }

  function getCategoryId(event) {
    if (!event.categories || event.categories.length === 0) return 'unknown';
    return event.categories[0].id;
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // ─── API ─────────────────────────────────────────────────

  async function fetchEvents() {
    try {
      var cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) return parsed.data;
      }
    } catch (e) {}

    var res = await fetch(API_URL);
    if (!res.ok) throw new Error('API returned ' + res.status);
    var json = await res.json();
    var events = json.events || [];

    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: events, timestamp: Date.now() }));
    } catch (e) {}

    return events;
  }

  // ─── Process Events ──────────────────────────────────────

  function processEventsToPoints(events) {
    return events.map(function (ev) {
      var coord = getEventCoord(ev);
      if (!coord) return null;
      var catId = getCategoryId(ev);
      var config = CATEGORY_CONFIG[catId] || { color: '#9ca3af', label: 'Unknown', icon: '\u{2753}' };
      var geo = ev.geometry[ev.geometry.length - 1];
      return {
        id: ev.id,
        lat: coord[1],
        lng: coord[0],
        color: config.color,
        title: ev.title,
        category: config.label,
        categoryIcon: config.icon,
        categoryId: catId,
        date: geo ? formatDate(geo.date) : '',
        isActive: !ev.closed,
        event: ev
      };
    }).filter(Boolean);
  }

  // ─── Globe ───────────────────────────────────────────────

  function initGlobe() {
    var mountEl = document.getElementById('globe-mount');
    if (!mountEl) return;

    var dark = isDarkMode();
    var tex = dark ? TEXTURES.dark : TEXTURES.light;

    globe = new Globe(mountEl)
      .globeImageUrl(tex.globe)
      .bumpImageUrl(tex.bump)
      .backgroundImageUrl(tex.background)
      .backgroundColor(tex.bgColor)
      .showAtmosphere(true)
      .atmosphereColor(tex.atmosphere)
      .atmosphereAltitude(0.18)
      // Points layer
      .pointsData([])
      .pointLat('lat')
      .pointLng('lng')
      .pointColor('color')
      .pointAltitude(0.035)
      .pointRadius(isMobile ? 0.5 : 0.4)
      .pointsMerge(false)
      .pointLabel(function (d) {
        return '<div style="background:rgba(15,23,42,0.92);color:#e2e8f0;padding:8px 14px;border-radius:10px;' +
          'font-size:13px;max-width:260px;border:1px solid rgba(100,160,240,0.15);' +
          'backdrop-filter:blur(8px);box-shadow:0 8px 24px rgba(0,0,0,0.4);pointer-events:none">' +
          '<div style="font-weight:600;margin-bottom:3px">' + escapeHtml(d.title) + '</div>' +
          '<div style="font-size:11px;color:' + d.color + '">' + d.categoryIcon + ' ' + d.category + '</div>' +
          '<div style="font-size:11px;color:#64748b;margin-top:2px">' + d.date +
          (d.isActive ? ' &middot; <span style="color:#22c55e">Active</span>' : '') + '</div>' +
          '</div>';
      })
      .onPointClick(function (d) {
        var card = document.querySelector('.event-card[data-event-id="' + d.id + '"]');
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('flash-highlight');
          setTimeout(function () { card.classList.remove('flash-highlight'); }, 1500);
        }
      })
      // Rings layer — pulsing emanation from active events
      .ringsData([])
      .ringLat('lat')
      .ringLng('lng')
      .ringColor(function (d) {
        return function (t) { return hexToRgba(d.color, (1 - t) * 0.5); };
      })
      .ringMaxRadius(4)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(1800);

    // Camera controls
    var controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = true;
    controls.minDistance = 140;
    controls.maxDistance = 450;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // Initial view
    globe.pointOfView({ lat: 25, lng: -20, altitude: 2.2 });

    // Responsive
    handleResize();
    window.addEventListener('resize', handleResize);

    // Theme change observer
    new MutationObserver(function () {
      var d = isDarkMode();
      var t = d ? TEXTURES.dark : TEXTURES.light;
      globe
        .globeImageUrl(t.globe)
        .backgroundImageUrl(t.background)
        .backgroundColor(t.bgColor)
        .atmosphereColor(t.atmosphere);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Pause/resume rendering when globe scrolls in/out of viewport
    setupVisibilityObserver();
  }

  function handleResize() {
    var mountEl = document.getElementById('globe-mount');
    if (!mountEl || !globe) return;
    var w = mountEl.clientWidth;
    var h = Math.min(w, 600);
    globe.width(w).height(h);
  }

  function setupVisibilityObserver() {
    var mountEl = document.getElementById('globe-mount');
    if (!mountEl || !globe) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!globeVisible) {
            globeVisible = true;
            globe.resumeAnimation();
            var controls = globe.controls();
            if (controls) controls.autoRotate = true;
          }
        } else {
          if (globeVisible) {
            globeVisible = false;
            globe.pauseAnimation();
          }
        }
      });
    }, { threshold: 0.05 });

    observer.observe(mountEl);
  }

  function updateGlobeData() {
    if (!globe) return;
    var visible = processedPoints.filter(function (p) {
      return activeCategories.has(p.categoryId);
    });
    var rings = visible.filter(function (p) { return p.isActive; });
    globe.pointsData(visible).ringsData(rings);
  }

  // ─── Category Toggles ───────────────────────────────────

  function buildCategoryToggles() {
    var filtersEl = document.getElementById('category-filters');
    if (!filtersEl) return;

    var counts = {};
    allEvents.forEach(function (ev) {
      var catId = getCategoryId(ev);
      counts[catId] = (counts[catId] || 0) + 1;
    });

    filtersEl.innerHTML = '';

    var allBtn = document.createElement('button');
    allBtn.className = 'category-toggle all-toggle active';
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', function () {
      if (activeCategories.size === Object.keys(CATEGORY_CONFIG).length) {
        activeCategories.clear();
      } else {
        activeCategories = new Set(Object.keys(CATEGORY_CONFIG));
      }
      syncToggleStates();
      applyFilter();
    });
    filtersEl.appendChild(allBtn);

    Object.keys(CATEGORY_CONFIG).forEach(function (catId) {
      if (!counts[catId]) return;
      var config = CATEGORY_CONFIG[catId];
      var btn = document.createElement('button');
      btn.className = 'category-toggle' + (activeCategories.has(catId) ? ' active' : '');
      btn.dataset.category = catId;

      var dot = document.createElement('span');
      dot.className = 'cat-dot';
      dot.style.backgroundColor = config.color;
      btn.appendChild(dot);
      btn.appendChild(document.createTextNode(config.label + ' (' + counts[catId] + ')'));

      btn.addEventListener('click', function () {
        if (activeCategories.has(catId)) activeCategories.delete(catId);
        else activeCategories.add(catId);
        syncToggleStates();
        applyFilter();
      });
      filtersEl.appendChild(btn);
    });
  }

  function syncToggleStates() {
    document.querySelectorAll('.category-toggle').forEach(function (btn) {
      if (btn.classList.contains('all-toggle')) {
        btn.classList.toggle('active', activeCategories.size === Object.keys(CATEGORY_CONFIG).length);
      } else {
        btn.classList.toggle('active', activeCategories.has(btn.dataset.category));
      }
    });
  }

  // ─── Filtering ───────────────────────────────────────────

  function applyFilter() {
    filteredEvents = allEvents.filter(function (ev) {
      return activeCategories.has(getCategoryId(ev));
    });
    updateGlobeData();
    renderEventList();
    updateStats();
  }

  // ─── Event List ──────────────────────────────────────────

  function renderEventList() {
    if (!eventsContainer) return;

    if (filteredEvents.length === 0) {
      eventsContainer.innerHTML = '<div class="empty-state">No events match the selected filters.</div>';
      return;
    }

    var sorted = filteredEvents.slice().sort(function (a, b) {
      var dateA = a.geometry && a.geometry.length ? new Date(a.geometry[a.geometry.length - 1].date) : 0;
      var dateB = b.geometry && b.geometry.length ? new Date(b.geometry[b.geometry.length - 1].date) : 0;
      return dateB - dateA;
    });

    eventsContainer.innerHTML = sorted.map(function (event) {
      var catId = getCategoryId(event);
      var config = CATEGORY_CONFIG[catId] || { color: '#9ca3af', label: 'Unknown', icon: '\u{2753}' };
      var geo = event.geometry && event.geometry.length ? event.geometry[event.geometry.length - 1] : null;
      var dateStr = geo ? formatDate(geo.date) : 'Unknown date';
      var magnitude = '';
      if (geo && geo.magnitudeValue != null) {
        magnitude = geo.magnitudeValue + (geo.magnitudeUnit ? ' ' + geo.magnitudeUnit : '');
      } else if (event.geometry) {
        for (var i = event.geometry.length - 1; i >= 0; i--) {
          if (event.geometry[i].magnitudeValue != null) {
            magnitude = event.geometry[i].magnitudeValue + (event.geometry[i].magnitudeUnit ? ' ' + event.geometry[i].magnitudeUnit : '');
            break;
          }
        }
      }
      var sourceLink = event.sources && event.sources[0] ? event.sources[0].url : '';
      var sourceId = event.sources && event.sources[0] ? event.sources[0].id : '';
      var statusClass = event.closed ? 'status-closed' : 'status-open';
      var statusText = event.closed ? 'Closed' : 'Active';

      return '<div class="event-card" data-event-id="' + event.id + '">' +
        '<div class="event-card-inner">' +
          '<span class="event-dot" style="background:' + config.color + ';box-shadow:0 0 8px ' + config.color + '50"></span>' +
          '<div class="event-info">' +
            '<h3 class="event-title">' + escapeHtml(event.title) + '</h3>' +
            '<div class="event-meta">' +
              '<span class="event-category" style="color:' + config.color + '">' + config.icon + ' ' + config.label + '</span>' +
              '<span class="event-date">' + dateStr + '</span>' +
              (magnitude ? '<span class="event-magnitude">' + magnitude + '</span>' : '') +
              '<span class="' + statusClass + '">' + statusText + '</span>' +
            '</div>' +
            (sourceLink ? '<a href="' + escapeHtml(sourceLink) + '" target="_blank" rel="noopener" class="event-source">Source: ' + escapeHtml(sourceId) + ' \u2197</a>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // Card click → globe focus
    eventsContainer.querySelectorAll('.event-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var eventId = card.dataset.eventId;
        var point = processedPoints.find(function (p) { return p.id === eventId; });
        if (point && globe) {
          globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.8 }, 1000);
        }
      });
    });
  }

  // ─── Stats ───────────────────────────────────────────────

  function updateStats() {
    if (!statsEl) return;
    var cats = new Set();
    filteredEvents.forEach(function (ev) { cats.add(getCategoryId(ev)); });
    var openCount = filteredEvents.filter(function (ev) { return !ev.closed; }).length;

    document.getElementById('stat-total').textContent = filteredEvents.length;
    document.getElementById('stat-active').textContent = openCount;
    document.getElementById('stat-categories').textContent = cats.size;
    document.getElementById('stat-updated').textContent = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  // ─── Error ───────────────────────────────────────────────

  function showError(msg) {
    var loadingEl = document.getElementById('globe-loading');
    if (loadingEl) loadingEl.style.display = 'none';
    if (eventsLoading) eventsLoading.style.display = 'none';

    var errEl = document.getElementById('globe-error');
    if (errEl) {
      errEl.innerHTML =
        '<div class="error-content">' +
          '<p class="error-icon">\u{1F6F0}</p>' +
          '<p class="error-msg">' + escapeHtml(msg) + '</p>' +
          '<button class="retry-btn" onclick="location.reload()">Retry</button>' +
        '</div>';
      errEl.style.display = 'flex';
    }
  }

  // ─── Lazy-load globe.gl from CDN ─────────────────────────

  function loadGlobeLib() {
    return new Promise(function (resolve, reject) {
      if (typeof Globe !== 'undefined') { resolve(); return; }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/globe.gl';
      script.onload = resolve;
      script.onerror = function () { reject(new Error('Failed to load globe.gl')); };
      document.head.appendChild(script);
    });
  }

  // ─── Init ────────────────────────────────────────────────

  async function init() {
    eventsContainer = document.getElementById('events-container');
    eventsLoading = document.getElementById('events-loading');
    statsEl = document.getElementById('globe-stats');

    // Lazy-load globe.gl library
    try {
      await loadGlobeLib();
    } catch (err) {
      console.error('Failed to load globe.gl:', err);
      showError('Failed to load 3D globe library.');
      return;
    }

    // Init globe
    try {
      initGlobe();
    } catch (err) {
      console.error('Globe init error:', err);
    }

    // Hide loading overlay once globe has rendered
    setTimeout(function () {
      var loadingEl = document.getElementById('globe-loading');
      if (loadingEl) {
        loadingEl.style.opacity = '0';
        setTimeout(function () { loadingEl.style.display = 'none'; }, 400);
      }
    }, 2000);

    // Fetch events
    try {
      allEvents = await fetchEvents();
      filteredEvents = allEvents.slice();
      processedPoints = processEventsToPoints(allEvents);

      if (eventsLoading) eventsLoading.style.display = 'none';

      buildCategoryToggles();
      updateGlobeData();
      renderEventList();
      updateStats();
    } catch (err) {
      console.error('EONET fetch error:', err);
      showError('Unable to load event data. NASA\'s EONET API may be temporarily unavailable.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
