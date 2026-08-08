/* ============================================================================
   North Peptides UK - Dynamic Dispatch Announcement Bar
   Self-contained, no dependencies. Include in <head> on every page:
       <script src="/dispatch-bar.js"></script>
   (no `defer` - it injects its space-reservation CSS during head parse so the
    fixed bar causes zero layout shift / CLS.)

   Dispatch policy: orders are dispatched within 24-48 hours after confirmed
   payment on business days. The bar rotates this with the delivery offer.
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
      'font-size:.7rem;letter-spacing:.03em;padding:0 16px;box-sizing:border-box;' +
      'white-space:nowrap;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.08);}' +
    '.npbar-inner{display:flex;align-items:center;gap:9px;max-width:100%;overflow:hidden;transition:opacity .26s ease;}' +
    '.npbar-inner.is-swapping{opacity:0;}' +
    '.npbar-text{overflow:hidden;text-overflow:ellipsis;}' +
    '.npbar strong{color:#fff;font-weight:500;}' +
    '.npbar .npbar-hl{color:#7DD3FC;font-weight:500;}' +
    '.npbar-dot{width:6px;height:6px;border-radius:50%;background:#38BDF8;flex-shrink:0;transition:background .26s ease;}' +
    '.npbar.is-sameday .npbar-dot{animation:npbar-pulse 2s infinite;}' +
    '.npbar.is-next .npbar-dot{background:#C9A24B;animation:none;}' +
    '.npbar.is-ship .npbar-dot{background:#7DD3FC;animation:none;}' +
    '@keyframes npbar-pulse{0%{box-shadow:0 0 0 0 rgba(56,189,248,.55)}' +
      '70%{box-shadow:0 0 0 6px rgba(56,189,248,0)}100%{box-shadow:0 0 0 0 rgba(56,189,248,0)}}' +
    '@media(max-width:768px){.npbar{font-size:.6rem;gap:7px;}}' +
    '@media(max-width:380px){.npbar{font-size:.55rem;}}';

  var style = document.createElement('style');
  style.setAttribute('data-dispatch-bar', '');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  // --- Slides: rotate the dispatch message with the free-delivery offer ------
  // Summer break 2026: last pre-break order Mon 10 Aug 23:59 UK, dispatch
  // resumes 1 Sept. Slides switch automatically; delete the block after.
  var HB_CUTOFF = Date.parse('2026-08-10T22:59:00Z');
  var HB_RESUME = Date.parse('2026-08-31T23:00:00Z');
  function hbPhase() {
    var now = Date.now();
    if (now < HB_CUTOFF) return 'pre';
    if (now < HB_RESUME) return 'break';
    return 'normal';
  }
  function hbCountdown() {
    var ms = HB_CUTOFF - Date.now();
    if (ms < 0) ms = 0;
    var d = Math.floor(ms / 86400000);
    var h = Math.floor((ms % 86400000) / 3600000);
    var m = Math.floor((ms % 3600000) / 60000);
    return (d > 0 ? d + 'd ' : '') + h + 'h ' + ('0' + m).slice(-2) + 'm';
  }

  var SLIDE_SECONDS = 5;
  var normalSlides = [
    function () {
      return {
        mode: 'next',
        html: '<strong>UK stocked</strong> - dispatched within <span class="npbar-hl">24-48 hours</span> of confirmed payment'
      };
    },
    function () {
      return {
        mode: 'ship',
        html: 'Free UK delivery on orders over <span class="npbar-hl">&pound;100</span>'
      };
    }
  ];
  var slides;
  if (hbPhase() === 'pre') {
    slides = [
      function () {
        return {
          mode: 'sameday',
          html: '<strong>Final dispatch before summer break: Tue 11 Aug</strong> - order within <span class="npbar-hl">' + hbCountdown() + '</span>'
        };
      },
      normalSlides[0],
      function () {
        return {
          mode: 'ship',
          html: 'From 11 Aug: <span class="npbar-hl">10% off pre-orders</span> - dispatched from 1 September'
        };
      },
      normalSlides[1]
    ];
  } else if (hbPhase() === 'break') {
    slides = [
      function () {
        return {
          mode: 'sameday',
          html: '<strong>Summer pre-orders open</strong> - <span class="npbar-hl">10% off everything</span> with code SUMMER10'
        };
      },
      function () {
        return {
          mode: 'next',
          html: 'Items reserved on order - <span class="npbar-hl">dispatched from 1 September</span>'
        };
      },
      normalSlides[1]
    ];
  } else {
    slides = normalSlides;
  }

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
