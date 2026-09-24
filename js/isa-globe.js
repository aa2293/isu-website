/* ISA MEMBER MAP (auto-synced from teams.html) - Leaflet + GeoJSON vector world.
   On load this reads teams.html and derives EVERYTHING from the member cards:
   the pins, each person's photo, subteam and countries of origin, plus the
   "Total Active Members" and "Countries Represented" counters. Edit teams.html
   (add/remove/change a member card) and this map updates automatically.
   Executive Board cards are skipped on purpose (their subtitle is a role, not a
   country) - every e-board member also appears in their functional committee
   section, which is where their country is read from.
   To remove this feature: restore the original About Us section and delete this
   file plus its <script> tag in index.html. */
(function () {
  var BLUE = '#2f4bff';
  var GEO = 'https://cdn.jsdelivr.net/gh/johan/world.geo.json/countries.geo.json';
  var COUNTRIES = [];            // built from teams.html: [{country,lat,lng,people:[...]}]
  var current = null, closing = false;

  /* country name -> [lat, lng]. Covers every country currently in use plus a
     broad set of extras so newly added members' countries just work. If a member
     from a country not listed here is added, add one line below with its capital
     coordinates and the pin will appear. */
  var COORDS = {
    "Afghanistan":[34.53,69.17],"Argentina":[-34.61,-58.38],"Armenia":[40.18,44.51],
    "Azerbaijan":[40.41,49.87],"Brazil":[-15.79,-47.88],"Bulgaria":[42.70,23.32],
    "Canada":[45.42,-75.70],"China":[39.90,116.40],"Croatia":[45.81,15.98],
    "Dominican Republic":[18.49,-69.93],"Georgia":[41.72,44.78],"Germany":[52.52,13.40],
    "Greece":[37.98,23.73],"Hong Kong":[22.32,114.17],"India":[28.61,77.21],
    "Indonesia":[-6.21,106.85],"Italy":[41.90,12.50],"Japan":[35.68,139.69],
    "Jordan":[31.95,35.93],"Latvia":[56.95,24.11],"Luxembourg":[49.61,6.13],
    "North Macedonia":[41.99,21.43],"Mexico":[19.43,-99.13],"Monaco":[43.73,7.42],
    "Nepal":[27.72,85.32],"Pakistan":[33.69,73.06],"Palestine":[31.90,35.20],
    "Philippines":[14.60,120.98],"Poland":[52.23,21.01],"Portugal":[38.72,-9.14],
    "Russia":[55.75,37.62],"Rwanda":[-1.94,30.06],"Saudi Arabia":[24.71,46.68],
    "Singapore":[1.35,103.82],"South Africa":[-25.75,28.19],"South Korea":[37.57,126.98],
    "Spain":[40.42,-3.70],"Sri Lanka":[6.93,79.85],"Sweden":[59.33,18.07],
    "Switzerland":[46.95,7.44],"Taiwan":[25.03,121.57],"Türkiye":[39.93,32.86],
    "United Arab Emirates":[24.45,54.38],"Ukraine":[50.45,30.52],"United Kingdom":[51.51,-0.13],
    "United States":[38.90,-77.04],"Uzbekistan":[41.31,69.24],"Vietnam":[21.03,105.85],
    /* extras for future members */
    "France":[48.85,2.35],"Netherlands":[52.37,4.90],"Belgium":[50.85,4.35],
    "Austria":[48.21,16.37],"Ireland":[53.35,-6.26],"Norway":[59.91,10.75],
    "Finland":[60.17,24.94],"Denmark":[55.68,12.57],"Czechia":[50.08,14.44],
    "Hungary":[47.50,19.04],"Romania":[44.43,26.10],"Serbia":[44.79,20.45],
    "Slovakia":[48.15,17.11],"Slovenia":[46.06,14.51],"Estonia":[59.44,24.75],
    "Lithuania":[54.69,25.28],"Belarus":[53.90,27.57],"Albania":[41.33,19.82],
    "Bosnia and Herzegovina":[43.87,18.41],"Montenegro":[42.44,19.26],"Kosovo":[42.67,21.17],
    "Cyprus":[35.19,33.38],"Iceland":[64.15,-21.94],"Egypt":[30.04,31.24],
    "Morocco":[34.02,-6.83],"Nigeria":[9.08,7.40],"Kenya":[-1.29,36.82],
    "Ghana":[5.60,-0.19],"Ethiopia":[9.03,38.74],"Tanzania":[-6.79,39.21],
    "Uganda":[0.35,32.58],"Zimbabwe":[-17.83,31.05],"Colombia":[4.71,-74.07],
    "Chile":[-33.45,-70.67],"Peru":[-12.05,-77.04],"Venezuela":[10.48,-66.90],
    "Thailand":[13.76,100.50],"Malaysia":[3.14,101.69],"Bangladesh":[23.81,90.41],
    "Iran":[35.69,51.39],"Iraq":[33.31,44.36],"Lebanon":[33.89,35.50],
    "Israel":[31.77,35.21],"Kazakhstan":[51.16,71.47],"Kyrgyzstan":[42.87,74.59],
    "Tajikistan":[38.56,68.79],"Mongolia":[47.89,106.91],"Cambodia":[11.56,104.92],
    "Myanmar":[16.87,96.20],"Kuwait":[29.38,47.99],"Qatar":[25.29,51.53],
    "Bahrain":[26.23,50.59],"Oman":[23.59,58.41],"Australia":[-35.28,149.13],
    "New Zealand":[-41.29,174.78]
  };

  /* normalize common spellings/abbreviations to a COORDS key (case-insensitive) */
  var ALIAS = {
    "UK":"United Kingdom","U.K.":"United Kingdom","ENGLAND":"United Kingdom",
    "SCOTLAND":"United Kingdom","WALES":"United Kingdom","BRITAIN":"United Kingdom",
    "GREAT BRITAIN":"United Kingdom","USA":"United States","U.S.":"United States",
    "U.S.A.":"United States","US":"United States","AMERICA":"United States",
    "UAE":"United Arab Emirates","U.A.E.":"United Arab Emirates","TURKEY":"Türkiye",
    "TURKIYE":"Türkiye","KOREA":"South Korea","S. KOREA":"South Korea",
    "SOUTH KOREA":"South Korea","MACEDONIA":"North Macedonia",
    "CZECH REPUBLIC":"Czechia","HOLLAND":"Netherlands"
  };
  var TEAM_ALIAS = { "Internal Ops":"Internal Operations" };

  function normCountry(s) {
    s = ('' + s).replace(/\s+/g, ' ').trim();
    return ALIAS[s.toUpperCase()] || s;
  }
  function splitCountries(t) {
    return ('' + t).replace(/\s*&\s*/g, ',').replace(/\band\b/gi, ',')
      .split(',').map(normCountry).filter(Boolean);
  }

  /* Parse teams.html into map data + counter totals. */
  function buildData(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var members = {}, order = [], cur = '';
    var nodes = doc.body.querySelectorAll('.page-heading, .our_team .iso-item');
    Array.prototype.forEach.call(nodes, function (node) {
      if (node.classList.contains('page-heading')) {
        var h2 = node.querySelector('h2');
        var t = (h2 && h2.childNodes[0]) ? h2.childNodes[0].textContent.replace(/\s+/g, ' ').trim() : '';
        cur = TEAM_ALIAS[t] || t;
        return;
      }
      if (cur === 'Executive Board') return;               // roles, not countries
      var nameEl = node.querySelector('.member-detail h5');
      var h6 = node.querySelector('.member-detail h6');
      var imgEl = node.querySelector('.pic-sec img');
      if (!nameEl || !h6 || !imgEl) return;
      var nm = nameEl.textContent.trim();
      if (!members[nm]) { members[nm] = { name: nm, img: imgEl.getAttribute('src'), team: cur, countries: [] }; order.push(nm); }
      splitCountries(h6.textContent).forEach(function (c) {
        if (members[nm].countries.indexOf(c) < 0) members[nm].countries.push(c);
      });
    });

    var byCountry = {}, countrySet = {};
    order.forEach(function (nm) {
      var m = members[nm];
      m.countries.forEach(function (c) {
        countrySet[c] = true;
        (byCountry[c] || (byCountry[c] = [])).push({ name: m.name, img: m.img, team: m.team, countries: m.countries });
      });
    });

    var list = [];
    Object.keys(byCountry).forEach(function (c) {
      var co = COORDS[c];
      if (!co) { if (window.console) console.warn('[ISA map] no coordinates for country: ' + c + ' (add it to COORDS in js/isa-globe.js)'); return; }
      list.push({ country: c, lat: co[0], lng: co[1], people: byCountry[c] });
    });
    return { countries: list, memberCount: order.length, countryCount: Object.keys(countrySet).length };
  }

  /* Update the two About-Us stat cards from the parsed totals. */
  function setCounters(memberCount, countryCount) {
    var cols = document.querySelectorAll('.about-us-map-exp .counter-column');
    Array.prototype.forEach.call(cols, function (col) {
      var titleEl = col.querySelector('.title');
      var title = titleEl ? titleEl.textContent : '';
      var num = col.querySelector('.counter');
      if (!num) return;
      if (/member/i.test(title)) num.textContent = memberCount;
      else if (/countr/i.test(title)) num.textContent = countryCount;
    });
  }

  /* ---------- map rendering (visuals unchanged) ---------- */
  function css(h) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = h; document.head.appendChild(l); }
  function js(s, cb) { var x = document.createElement('script'); x.src = s; x.onload = cb; x.onerror = fallback; document.head.appendChild(x); }
  function fallback() { var el = document.getElementById('isa-globe'); if (el) el.innerHTML = '<img src="img/world.png" alt="Countries represented" style="max-width:100%;height:auto;">'; }
  function esc(s) { return ('' + s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function styles() {
    var s = document.createElement('style');
    s.textContent =
      '.isa-pin .pinwrap{transform-origin:bottom center;animation:isaDrop .5s cubic-bezier(.34,1.7,.5,1) backwards;transition:transform .15s ease;will-change:transform;}' +
      '.isa-pin .pinwrap:hover{transform:scale(1.18);}' +
      '@keyframes isaDrop{0%{opacity:0;transform:translateY(-28px) scale(.2);}55%{opacity:1;}100%{opacity:1;transform:none;}}' +
      '@keyframes isaPop{0%{opacity:0;transform:scale(.9) translateY(6px);}100%{opacity:1;transform:none;}}' +
      '@keyframes isaPopOut{0%{opacity:1;transform:none;}100%{opacity:0;transform:scale(.92) translateY(6px);}}' +
      '#isa-map-panel{transform-origin:top right;}';
    document.head.appendChild(s);
  }
  function hidePanel() {
    var el = document.getElementById('isa-map-panel'); if (!el || el.style.display !== 'block') return;
    current = null; closing = true; el.style.animation = 'none'; void el.offsetWidth;
    el.style.animation = 'isaPopOut .2s ease forwards';
    setTimeout(function () { if (closing) { el.style.display = 'none'; el.style.animation = ''; } }, 200);
  }
  function showPanel(c) {
    var el = document.getElementById('isa-map-panel'); if (!el) return;
    if (current === c && el.style.display === 'block') { hidePanel(); return; }
    current = c;
    var rows = c.people.map(function (p) {
      return '<div style="display:flex;align-items:center;gap:11px;padding:9px 0;border-bottom:1px solid #f1f1f4;">' +
        '<img src="' + p.img + '" alt="" style="width:48px;height:48px;border-radius:50%;object-fit:cover;object-position:center 22%;flex:0 0 auto;">' +
        '<div style="min-width:0;"><div style="font-weight:600;font-size:13px;color:#111;">' + esc(p.name) + '</div>' +
        '<div style="font-size:11px;color:' + BLUE + ';font-weight:600;">' + esc(p.team) + '</div>' +
        '<div style="font-size:11px;color:#777;margin-top:1px;">' + esc(p.countries.join(', ')) + '</div></div></div>';
    }).join('');
    el.innerHTML = '<button type="button" aria-label="Close" style="position:absolute;top:8px;right:12px;border:0;background:none;font-size:22px;line-height:1;color:#aaa;cursor:pointer;">&times;</button>' +
      '<div style="font-weight:800;font-size:17px;color:#111;margin:2px 26px 8px 0;">' + esc(c.country) + '</div>' + rows;
    el.style.display = 'block'; closing = false;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = 'isaPop .22s ease';
    el.querySelector('button').onclick = function () { hidePanel(); };
  }
  function pin(i) {
    var svg = '<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M13 0C5.82 0 0 5.82 0 13c0 9.2 11.1 19.7 12.4 20.9.34.32.86.32 1.2 0C14.9 32.7 26 22.2 26 13 26 5.82 20.18 0 13 0z" fill="' + BLUE + '" stroke="#fff" stroke-width="2"/>' +
      '<circle cx="13" cy="13" r="4.6" fill="#fff"/></svg>';
    var html = '<div class="pinwrap" style="animation-delay:' + (i * 0.03).toFixed(2) + 's;cursor:pointer;">' + svg + '</div>';
    return L.divIcon({ html: html, className: 'isa-pin', iconSize: [26, 34], iconAnchor: [13, 34] });
  }
  function draw(map, geo) {
    if (geo) { L.geoJSON(geo, { style: { fillColor: '#c2d2ef', fillOpacity: 1, color: '#a8bde3', weight: 0.7 }, interactive: false }).addTo(map); }
    var g = [];
    COUNTRIES.forEach(function (c, i) {
      var m = L.marker([c.lat, c.lng], { icon: pin(i) });
      m.bindTooltip(esc(c.country), { direction: 'top', offset: [0, -32], opacity: 0.95 });
      m.on('click', function () { showPanel(c); });
      m.addTo(map); g.push(m);
    });
    map.on('click', function () { hidePanel(); });
    try { map.fitBounds(L.featureGroup(g).getBounds().pad(0.15), { maxZoom: 4 }); } catch (e) {}
    map.setMaxBounds([[-58, -170], [76, 185]]);
    setTimeout(function () { map.invalidateSize(); map.setMaxBounds([[-58, -170], [76, 185]]); map.setMinZoom(map.getZoom()); }, 300);
  }

  function init() {
    var el = document.getElementById('isa-globe'); if (!el || !window.L) { fallback(); return; }
    styles();
    var map = L.map(el, { scrollWheelZoom: false, minZoom: 2, maxZoom: 6, attributionControl: false, zoomControl: true, maxBoundsViscosity: 1.0, worldCopyJump: false }).setView([25, 10], 2);
    fetch('teams.html', { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var data = buildData(html);
        if (data.countries.length) { COUNTRIES = data.countries; setCounters(data.memberCount, data.countryCount); }
      })
      .catch(function (e) { if (window.console) console.warn('[ISA map] could not read teams.html; showing map without pins', e); })
      .then(function () {
        fetch(GEO).then(function (r) { return r.json(); }).then(function (gj) { draw(map, gj); }).catch(function () { draw(map, null); });
      });
  }
  function boot() { css('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'); js('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
