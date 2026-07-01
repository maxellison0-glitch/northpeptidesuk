/* ============================================================================
   North Peptides UK — Dynamic Dispatch Announcement Bar
   Self-contained, no dependencies. Include in <head> on every page:
       <script src="/dispatch-bar.js"></script>
   (no `defer` — it injects its space-reservation CSS during head parse so the
    fixed bar causes zero layout shift / CLS.)

   Dispatch policy: Monday–Friday, same-day dispatch on orders placed before
   13:00 (1 PM) UK time. All times are computed in Europe/London regardless of
   the visitor's own timezone, so the cut-off is always correct.

   Behaviour (updates live, every second, no reload needed):
   - Mon–Fri before 1 PM : live countdown to the 1 PM cut-off for same-day dispatch.
   - Mon–Thu after 1 PM  : "dispatched first thing tomorrow morning".
   - Fri after 1 PM / Sat / Sun : "dispatched first thing Monday morning".
   ========================================================================== */
(function () {
  'use strict';

  var CUTOFF_HOUR = 13;          // 1 PM UK time
  var BAR_ID = 'np-dispatch-bar';

  // --- Reserve space + style the bar before the page paints (anti-CLS) ------
  var css =
    ':root{--npbar-h:36px;}' +
    'body{padding-top:var(--npbar-h)!important;}' +
    // sticky navs (why-us, lab-reports, blog articles) stick *below* the bar;
    // harmless on static navs (compliance, product, blog index, checkout).
    '.nav{top:var(--npbar-h)!important;}' +
    // index.html: nav is absolute over the hero, so shift it down explicitly.
    '.shop-nav{top:calc(34px + var(--npbar-h))!important;}' +
    '@media(max-width:768px){.shop-nav{top:calc(30px + var(--npbar-h))!important;}}' +
    '.npbar{position:fixed;top:0;left:0;right:0;height:var(--npbar-h);z-index:300;' +
      'display:flex;align-items:center;justify-content:center;gap:9px;' +
      'background:#12211A;color:#E6EFEA;font-family:"DM Mono",monospace;' +
      'font-size:.7rem;letter-spacing:.03em;padding:0 16px;box-sizing:border-box;' +
      'white-space:nowrap;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.08);}' +
    '.npbar-inner{display:flex;align-items:center;gap:9px;max-width:100%;overflow:hidden;transition:opacity .26s ease;}' +
    '.npbar-inner.is-swapping{opacity:0;}' +
    '.npbar-text{overflow:hidden;text-overflow:ellipsis;}' +
    '.npbar strong{color:#fff;font-weight:500;}' +
    '.npbar .npbar-hl{color:#5FD0AE;font-weight:500;}' +
    '.npbar-dot{width:6px;height:6px;border-radius:50%;background:#3FBE92;flex-shrink:0;transition:background .26s ease;}' +
    '.npbar.is-sameday .npbar-dot{animation:npbar-pulse 2s infinite;}' +
    '.npbar.is-next .npbar-dot{background:#C9A24B;animation:none;}' +
    '.npbar.is-ship .npbar-dot{background:#5FD0AE;animation:none;}' +
    '@keyframes npbar-pulse{0%{box-shadow:0 0 0 0 rgba(63,190,146,.55)}' +
      '70%{box-shadow:0 0 0 6px rgba(63,190,146,0)}100%{box-shadow:0 0 0 0 rgba(63,190,146,0)}}' +
    '@media(max-width:768px){.npbar{font-size:.6rem;gap:7px;}}' +
    '@media(max-width:380px){.npbar{font-size:.55rem;}}';

  var style = document.createElement('style');
  style.setAttribute('data-dispatch-bar', '');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  // --- UK-time helpers ------------------------------------------------------
  var DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function londonNow() {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    var o = {};
    for (var i = 0; i < parts.length; i++) o[parts[i].type] = parts[i].value;
    return {
      day: DAY_INDEX[o.weekday],     // 0=Sun … 6=Sat
      h: (+o.hour) % 24,             // some engines emit "24" at midnight
      m: +o.minute,
      s: +o.second
    };
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function countdownText(t) {
    // seconds remaining until 13:00 today (UK)
    var rem = ((CUTOFF_HOUR - t.h) * 3600) - (t.m * 60) - t.s;
    if (rem < 0) rem = 0;
    var h = Math.floor(rem / 3600);
    var m = Math.floor((rem % 3600) / 60);
    var s = rem % 60;
    if (h > 0) return h + 'h ' + pad(m) + 'm';
    if (m > 0) return m + 'm ' + pad(s) + 's';
    return s + 's';
  }

  // --- Build the message for the current UK moment --------------------------
  function buildMessage(t) {
    var isWeekday = t.day >= 1 && t.day <= 5;
    var beforeCutoff = t.h < CUTOFF_HOUR;

    if (isWeekday && beforeCutoff) {
      return {
        mode: 'sameday',
        html: 'Order within <span class="npbar-hl">' + countdownText(t) +
              '</span> for <strong>same-day dispatch</strong>'
      };
    }

    // Otherwise work out the next dispatch day.
    // Mon–Thu after cut-off -> tomorrow; Fri after cut-off / Sat / Sun -> Monday.
    var nextLabel = (t.day >= 1 && t.day <= 4) ? 'tomorrow' : 'Monday';
    return {
      mode: 'next',
      html: '<strong>Order today</strong> — dispatched first thing ' +
            '<span class="npbar-hl">' + nextLabel + '</span> morning'
    };
  }

  // --- Slides: rotate the dispatch message with the free-delivery offer ------
  var SLIDE_SECONDS = 5;
  var slides = [
    function () { return buildMessage(londonNow()); },
    function () {
      return {
        mode: 'ship',
        html: 'Free UK delivery on orders over <span class="npbar-hl">&pound;50</span>'
      };
    }
  ];

  // --- Mount + live update ---------------------------------------------------
  var bar, innerEl, textEl, idx = 0, secondsOnSlide = 0, lastMode;

  function apply(content) {
    if (textEl.innerHTML !== content.html) textEl.innerHTML = content.html;
    if (content.mode !== lastMode) {
      bar.classList.remove('is-sameday', 'is-next', 'is-ship');
      bar.classList.add('is-' + content.mode);
      lastMode = content.mode;
    }
  }

  function tick() {
    secondsOnSlide++;
    if (slides.length > 1 && secondsOnSlide >= SLIDE_SECONDS) {
      secondsOnSlide = 0;
      idx = (idx + 1) % slides.length;
      innerEl.classList.add('is-swapping');              // fade out
      setTimeout(function () {
        apply(slides[idx]());
        innerEl.classList.remove('is-swapping');         // fade in new slide
      }, 270);
    } else {
      apply(slides[idx]());                              // live update (countdown ticks), no fade
    }
  }

  function mount() {
    bar = document.createElement('div');
    bar.className = 'npbar';
    bar.id = BAR_ID;
    bar.innerHTML = '<div class="npbar-inner"><span class="npbar-dot"></span><span class="npbar-text"></span></div>';
    document.body.appendChild(bar);
    innerEl = bar.querySelector('.npbar-inner');
    textEl = bar.querySelector('.npbar-text');
    apply(slides[idx]());
    setInterval(tick, 1000);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
