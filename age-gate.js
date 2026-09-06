/* ============================================================================
   North Peptides UK - Age Verification Gate
   Self-contained, no dependencies. Include in <head> on every page:
       <script src="/age-gate.js"></script>
   (no `defer` - it must run during head parse so the anti-flash backdrop
    paints before page content does.)

   Behaviour:
   - First visit: full-screen 18+ gate, page scroll locked.
   - "I am 18 or older"  -> remembers the choice for 90 days, fades out.
   - "I am under 18"     -> shows a polite block, then redirects away.
   - Choice persists across pages/sessions via localStorage, so returning
     visitors never see it again until it expires.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'npuk_age_verified';
  var MAX_AGE_DAYS = 90;
  var LOCK_CLASS = 'npuk-age-locked';

  // --- Already verified (and not expired)? Do nothing. ----------------------
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      var ts = parseInt(saved, 10);
      if (!isNaN(ts) && (Date.now() - ts) < MAX_AGE_DAYS * 86400000) return;
    }
  } catch (e) { /* storage blocked - fall through and show the gate */ }

  // --- Inject styles + lock the page as early as possible (anti-flash) ------
  var css =
    'html.' + LOCK_CLASS + '{overflow:hidden!important;}' +
    'html.' + LOCK_CLASS + '::before{content:"";position:fixed;inset:0;background:#0c2016;z-index:2147483640;}' +
    '.npag-overlay{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;' +
      'padding:24px;box-sizing:border-box;font-family:"Inter",sans-serif;opacity:0;transition:opacity .28s ease;' +
      'background:radial-gradient(120% 120% at 50% 0%,rgba(15,31,54,.86),rgba(7,18,38,.95));' +
      '-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);}' +
    '.npag-overlay.is-visible{opacity:1;}' +
    '.npag-overlay.is-closing{opacity:0;}' +
    '.npag-card{background:#fff;border:1px solid #D8E5F2;border-radius:20px;max-width:384px;width:100%;' +
      'padding:38px 32px 28px;box-sizing:border-box;text-align:center;box-shadow:0 30px 80px rgba(7,18,38,.45);' +
      'transform:translateY(12px) scale(.98);transition:transform .3s cubic-bezier(.2,.8,.2,1);}' +
    '.npag-overlay.is-visible .npag-card{transform:none;}' +
    '.npag-logo{font-family:"Syne",sans-serif;font-weight:800;font-size:1.02rem;letter-spacing:.08em;color:#132A46;margin-bottom:22px;}' +
    '.npag-logo span{color:#1F6FEB;}' +
    '.npag-eyebrow{font-family:"DM Mono",monospace;font-size:.56rem;letter-spacing:.22em;text-transform:uppercase;color:#1F6FEB;margin-bottom:14px;}' +
    '.npag-title{font-family:"Syne",sans-serif;font-weight:800;font-size:1.5rem;line-height:1.15;color:#10233F;margin:0 0 12px;}' +
    '.npag-body{font-family:"Inter",sans-serif;font-size:.86rem;line-height:1.6;color:#53677D;margin:0 0 24px;}' +
    '.npag-actions{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}' +
    '.npag-btn{width:100%;padding:14px;border-radius:11px;font-family:"DM Mono",monospace;font-size:.7rem;letter-spacing:.14em;' +
      'text-transform:uppercase;font-weight:600;cursor:pointer;box-sizing:border-box;' +
      'transition:background .18s ease,border-color .18s ease,color .18s ease;}' +
    '.npag-btn-primary{background:#1F6FEB;color:#fff;border:1px solid #1F6FEB;}' +
    '.npag-btn-primary:hover{background:#174EA6;border-color:#174EA6;}' +
    '.npag-btn-secondary{background:transparent;color:#53677D;border:1px solid #D8E5F2;}' +
    '.npag-btn-secondary:hover{border-color:#AFC4DA;color:#10233F;}' +
    '.npag-fine{font-family:"DM Mono",monospace;font-size:.72rem;line-height:1.7;color:#5B6B7E;border-top:1px solid #EAF0F7;padding-top:16px;margin:0;}' +
    '@media(max-width:420px){.npag-card{padding:32px 22px 24px;}.npag-title{font-size:1.32rem;}}';

  var style = document.createElement('style');
  style.setAttribute('data-age-gate', '');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
  document.documentElement.classList.add(LOCK_CLASS);

  // --- Build + mount the overlay -------------------------------------------
  var LOGO = 'NORTH<span>PEPTIDES</span>UK';

  function mount() {
    var overlay = document.createElement('div');
    overlay.className = 'npag-overlay';
    overlay.id = 'npuk-age-gate';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'npag-title');
    overlay.innerHTML =
      '<div class="npag-card">' +
        '<div class="npag-logo">' + LOGO + '</div>' +
        '<div class="npag-eyebrow">Research Use Only</div>' +
        '<h2 class="npag-title" id="npag-title">Age Verification Required</h2>' +
        '<p class="npag-body">You must be 18 or older to enter. North Peptides UK products are supplied strictly for laboratory and research use &mdash; not for human consumption.</p>' +
        '<div class="npag-actions">' +
          '<button type="button" class="npag-btn npag-btn-primary" data-age-confirm>I am 18 or older &mdash; Enter</button>' +
          '<button type="button" class="npag-btn npag-btn-secondary" data-age-deny>I am under 18</button>' +
        '</div>' +
        '<p class="npag-fine">By entering you confirm you are of legal age in your jurisdiction and that all products are purchased solely for research purposes.</p>' +
      '</div>';

    document.body.appendChild(overlay);
    overlay.querySelector('[data-age-confirm]').addEventListener('click', confirm18);
    overlay.querySelector('[data-age-deny]').addEventListener('click', denyUnder18);

    // Reveal on next frame so the fade/scale transitions run.
    requestAnimationFrame(function () {
      overlay.classList.add('is-visible');
      var primary = overlay.querySelector('[data-age-confirm]');
      if (primary) primary.focus();
    });
  }

  function confirm18() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}
    document.documentElement.classList.remove(LOCK_CLASS);
    var overlay = document.getElementById('npuk-age-gate');
    if (overlay) {
      overlay.classList.add('is-closing');
      setTimeout(function () {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 320);
    }
  }

  function denyUnder18() {
    var overlay = document.getElementById('npuk-age-gate');
    if (!overlay) return;
    var card = overlay.querySelector('.npag-card');
    if (card) {
      card.innerHTML =
        '<div class="npag-logo">' + LOGO + '</div>' +
        '<div class="npag-eyebrow">Access Restricted</div>' +
        '<h2 class="npag-title">Sorry &mdash; you cannot enter</h2>' +
        '<p class="npag-body">You must be 18 or older to access this website. You will be redirected shortly.</p>';
    }
    setTimeout(function () { window.location.href = 'https://www.google.com/'; }, 2400);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
