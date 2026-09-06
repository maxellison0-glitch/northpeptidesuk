/* ============================================================================
   North Peptides UK - Dynamic Dispatch Announcement Bar
   Self-contained, no dependencies. Include in <head> on every page:
       <script src="/dispatch-bar.js"></script>
   (no `defer` - it injects its space-reservation CSS during head parse so the
    fixed bar causes zero layout shift / CLS.)

   Dispatch policy: orders placed before 12:00 (noon) UK time, Monday-Friday,
   are aimed to be dispatched the next working day. All times are computed in
   Europe/London regardless of the visitor's own timezone.

   Behaviour (updates live, every second, no reload needed):
   - Mon-Fri before 12 PM : live countdown to the real operational cut-off
                            ("dispatch tomorrow", or "dispatch Monday" on a
                            Friday). This is the one approved deadline on the
                            site - it is not a marketing timer.
   - Otherwise            : reminder that orders before 12pm Mon-Fri are aimed
                            at next-working-day dispatch.
   The bar rotates the dispatch message with the free-delivery offer. Rotation
   pauses while the bar is hovered or focused, and under
   prefers-reduced-motion it never rotates (dispatch message only, no fades).
   The bar is role="status" aria-live="off" so screen readers do not read
   every tick.
   ========================================================================== */
(function () {
  'use strict';

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
      'background:#10233F;color:#E6EFEA;font-family:"DM Mono",monospace;' +
      'font-size:.74rem;letter-spacing:.03em;padding:0 16px;box-sizing:border-box;' +
      'white-space:nowrap;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.08);}' +
    '.npbar-inner{display:flex;align-items:center;gap:9px;max-width:100%;overflow:hidden;transition:opacity .26s ease;}' +
    '.npbar-inner.is-swapping{opacity:0;}' +
    '.npbar-text{overflow:hidden;text-overflow:ellipsis;}' +
    '.npbar strong{color:#fff;font-weight:500;}' +
    '.npbar .npbar-hl{color:#7DD3FC;font-weight:500;}' +
    '.npbar-dot{width:6px;height:6px;border-radius:50%;background:#38BDF8;flex-shrink:0;transition:background .26s ease;}' +
    '.npbar.is-countdown .npbar-dot{animation:npbar-pulse 2s infinite;}' +
    '.npbar.is-next .npbar-dot{background:#C9A24B;animation:none;}' +
    '.npbar.is-ship .npbar-dot{background:#7DD3FC;animation:none;}' +
    '@keyframes npbar-pulse{0%{box-shadow:0 0 0 0 rgba(56,189,248,.55)}' +
      '70%{box-shadow:0 0 0 6px rgba(56,189,248,0)}100%{box-shadow:0 0 0 0 rgba(56,189,248,0)}}' +
    '@media(max-width:768px){.npbar{font-size:.7rem;gap:7px;}}' +
    // never below .68rem on any viewport; no separate <=380px rule.
    '@media(prefers-reduced-motion:reduce){.npbar-inner{transition:none;}.npbar-dot{animation:none!important;}}';

  var style = document.createElement('style');
  style.setAttribute('data-dispatch-bar', '');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  // --- UK-time helpers ------------------------------------------------------
  var CUTOFF_HOUR = 12;          // 12 PM (noon) UK time
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
      day: DAY_INDEX[o.weekday],     // 0=Sun ... 6=Sat
      h: (+o.hour) % 24,             // some engines emit "24" at midnight
      m: +o.minute,
      s: +o.second
    };
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function countdownText(t) {
    // time remaining until the 12:00 cut-off today (UK)
    var rem = ((CUTOFF_HOUR - t.h) * 3600) - (t.m * 60) - t.s;
    if (rem < 0) rem = 0;
    var h = Math.floor(rem / 3600);
    var m = Math.floor((rem % 3600) / 60);
    var s = rem % 60;
    if (h > 0) return h + 'h ' + pad(m) + 'm';
    if (m > 0) return m + 'm ' + pad(s) + 's';
    return s + 's';
  }

  // --- Build the dispatch message for the current UK moment -----------------
  function buildMessage(t) {
    var isWeekday = t.day >= 1 && t.day <= 5;
    if (isWeekday && t.h < CUTOFF_HOUR) {
      // Mon-Thu before cut-off -> tomorrow; Fri before cut-off -> Monday.
      var nextLabel = t.day <= 4 ? 'tomorrow' : 'Monday';
      return {
        mode: 'countdown',
        html: 'Order within <span class="npbar-hl">' + countdownText(t) +
              '</span> and we aim to dispatch <strong>' + nextLabel + '</strong>'
      };
    }
    return {
      mode: 'next',
      html: 'Order before <span class="npbar-hl">12pm</span> Mon&ndash;Fri for ' +
            '<strong>next-working-day dispatch</strong>'
    };
  }

  // --- Slides: rotate the dispatch message with the free-delivery offer ------
  var SLIDE_SECONDS = 5;
  var reduceMotion = false;
  try {
    reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) { reduceMotion = false; }

  var slides = [
    function () { return buildMessage(londonNow()); }
  ];
  if (!reduceMotion) {
    slides.push(function () {
      return {
        mode: 'ship',
        html: 'Free UK delivery on orders over <span class="npbar-hl">&pound;100</span>'
      };
    });
  }

  // --- Mount + live update ---------------------------------------------------
  var bar, innerEl, textEl, idx = 0, secondsOnSlide = 0, lastMode;
  var paused = false;                    // hover / focus-within pauses rotation

  function apply(content) {
    if (textEl.innerHTML !== content.html) textEl.innerHTML = content.html;
    if (content.mode !== lastMode) {
      bar.classList.remove('is-countdown', 'is-next', 'is-ship');
      bar.classList.add('is-' + content.mode);
      lastMode = content.mode;
    }
  }

  function tick() {
    if (!paused) secondsOnSlide++;
    if (!paused && slides.length > 1 && secondsOnSlide >= SLIDE_SECONDS) {
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
    bar.setAttribute('role', 'status');
    bar.setAttribute('aria-live', 'off');
    bar.innerHTML = '<div class="npbar-inner"><span class="npbar-dot" aria-hidden="true"></span><span class="npbar-text"></span></div>';
    document.body.appendChild(bar);
    innerEl = bar.querySelector('.npbar-inner');
    textEl = bar.querySelector('.npbar-text');
    // Pause the slide rotation while the bar is hovered or holds focus
    // (WCAG 2.2.2). The countdown itself keeps ticking - it is a real deadline.
    function pause() { paused = true; }
    function resume() { paused = false; }
    bar.addEventListener('mouseenter', pause);
    bar.addEventListener('mouseleave', resume);
    bar.addEventListener('focusin', pause);
    bar.addEventListener('focusout', resume);
    apply(slides[idx]());
    setInterval(tick, 1000);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
