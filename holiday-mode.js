/* ============================================================================
   North Peptides UK - Summer break mode (self-contained, temporary)
   Include with defer on index.html and checkout.html:
       <script src="/holiday-mode.js" defer></script>

   Timeline (Europe/London):
     - PRE   : until Mon 10 Aug 2026, 23:59  -> urgency: final pre-break
               dispatch is Tuesday 11 August.
     - BREAK : 11 Aug 00:00 -> 31 Aug        -> pre-orders open at 10% off
               with code SUMMER10; dispatch resumes 1 September.
     - After 1 Sept this file does nothing and can be deleted.

   Test override: localStorage.npuk_holiday_force = 'pre' | 'break' | 'normal'
   ========================================================================== */
(function () {
  'use strict';

  var CUTOFF = Date.parse('2026-08-10T22:59:00Z'); /* Mon 10 Aug 23:59 UK */
  var RESUME = Date.parse('2026-08-31T23:00:00Z'); /* Tue 1 Sept 00:00 UK */
  var CODE = 'SUMMER10';

  function livePhase() {
    var now = Date.now();
    if (now < CUTOFF) return 'pre';
    if (now < RESUME) return 'break';
    return 'normal';
  }

  var forced = null;
  try { forced = localStorage.getItem('npuk_holiday_force'); } catch (e) {}
  var PHASE = (forced === 'pre' || forced === 'break' || forced === 'normal') ? forced : livePhase();
  if (PHASE === 'normal') return;

  /* ---------------------------------------------------------------- styles */
  var css =
    '.np-holiday{margin:0;padding:26px 40px;background:#EDF3F9;border-top:1px solid #E3ECF4;border-bottom:1px solid #E3ECF4;}' +
    '.np-holiday-inner{max-width:1180px;margin:0 auto;display:flex;align-items:center;gap:26px;flex-wrap:wrap;}' +
    '.np-holiday-copy{flex:1;min-width:260px;}' +
    '.np-holiday-eyebrow{display:block;font-family:"DM Mono",monospace;font-size:.62rem;font-weight:500;letter-spacing:.18em;text-transform:uppercase;margin-bottom:8px;}' +
    '.np-holiday-pre .np-holiday-eyebrow{color:#B45309;}' +
    '.np-holiday-break .np-holiday-eyebrow{color:#1F6FEB;}' +
    '.np-holiday-title{font-family:"Space Grotesk","Inter",sans-serif;font-weight:600;font-size:1.25rem;letter-spacing:-.015em;color:#0E1F38;margin:0 0 6px;}' +
    '.np-holiday-body{margin:0;font-size:.9rem;color:#5B6B7E;line-height:1.6;max-width:640px;}' +
    '.np-holiday-body strong{color:#0E1F38;}' +
    '.np-holiday-side{flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:8px;}' +
    '.np-holiday-count{font-family:"DM Mono",monospace;font-size:1.1rem;font-weight:500;color:#B45309;background:#FCF3E8;border:1px solid rgba(180,83,9,.3);border-radius:12px;padding:12px 20px;white-space:nowrap;}' +
    '.np-holiday-count small{display:block;font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;color:#B45309;opacity:.8;margin-top:3px;text-align:center;}' +
    '.np-holiday-cta{display:inline-flex;align-items:center;justify-content:center;font-family:"DM Mono",monospace;font-size:.68rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;background:#1F6FEB;color:#fff;border-radius:11px;padding:14px 26px;text-decoration:none;transition:background .18s;}' +
    '.np-holiday-cta:hover{background:#174EA6;color:#fff;}' +
    '.np-holiday-code{font-family:"DM Mono",monospace;font-size:.62rem;letter-spacing:.08em;color:#5B6B7E;}' +
    '.np-holiday-code b{color:#174EA6;}' +
    '@media(max-width:768px){.np-holiday{padding:20px;}.np-holiday-inner{gap:14px;}.np-holiday-side{width:100%;align-items:stretch;}}' +
    /* checkout note */
    '.np-holiday-note{display:flex;align-items:center;gap:14px;flex-wrap:wrap;border-radius:14px;padding:15px 18px;margin:0 0 22px;font-size:.86rem;line-height:1.55;}' +
    '.np-holiday-note-amber{background:#FCF3E8;border:1px solid rgba(180,83,9,.3);color:#7C4A10;}' +
    '.np-holiday-note-deal{background:#EAF2FE;border:1px solid rgba(31,111,235,.3);color:#2A3B52;}' +
    '.np-holiday-note strong{color:#0E1F38;}' +
    '.np-holiday-note-copy{flex:1;min-width:220px;margin:0;}' +
    '.np-holiday-apply{flex-shrink:0;font-family:"DM Mono",monospace;font-size:.62rem;font-weight:500;letter-spacing:.09em;text-transform:uppercase;background:#1F6FEB;color:#fff;border:none;border-radius:9px;padding:12px 18px;cursor:pointer;transition:background .18s;white-space:nowrap;}' +
    '.np-holiday-apply:hover{background:#174EA6;}' +
    '.np-holiday-apply.is-done{background:#0E9F6E;cursor:default;}';

  var style = document.createElement('style');
  style.setAttribute('data-holiday-mode', '');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  function countdownText() {
    var ms = CUTOFF - Date.now();
    if (ms < 0) ms = 0;
    var d = Math.floor(ms / 86400000);
    var h = Math.floor((ms % 86400000) / 3600000);
    var m = Math.floor((ms % 3600000) / 60000);
    return (d > 0 ? d + 'd ' : '') + h + 'h ' + ('0' + m).slice(-2) + 'm';
  }

  function mount() {
    /* ---------------- homepage ---------------- */
    var hero = document.querySelector('.hero-banner');
    if (hero) {
      var band = document.createElement('aside');
      band.id = 'np-holiday-band';
      band.setAttribute('aria-label', 'Summer break notice');
      if (PHASE === 'pre') {
        band.className = 'np-holiday np-holiday-pre';
        band.innerHTML =
          '<div class="np-holiday-inner">' +
            '<div class="np-holiday-copy">' +
              '<span class="np-holiday-eyebrow">Summer break &middot; 12 Aug &ndash; 1 Sept</span>' +
              '<h2 class="np-holiday-title">Final pre-break dispatch: Tuesday 11 August.</h2>' +
              '<p class="np-holiday-body">Order by <strong>midnight Monday</strong> and your order ships before we go. From Tuesday, pre-orders open at <strong>10% off</strong> and dispatch from 1 September.</p>' +
            '</div>' +
            '<div class="np-holiday-side">' +
              '<div class="np-holiday-count"><span data-holiday-count>' + countdownText() + '</span><small>left to order for pre-break dispatch</small></div>' +
            '</div>' +
          '</div>';
      } else {
        band.className = 'np-holiday np-holiday-break';
        band.innerHTML =
          '<div class="np-holiday-inner">' +
            '<div class="np-holiday-copy">' +
              '<span class="np-holiday-eyebrow">Summer pre-orders &middot; 10% off</span>' +
              '<h2 class="np-holiday-title">10% off everything while we&rsquo;re away.</h2>' +
              '<p class="np-holiday-body">We&rsquo;re on our summer break until <strong>1 September</strong>. Order now with code <strong>SUMMER10</strong> &mdash; 10% comes straight off at checkout, your items are reserved from current stock, and every pre-order is dispatched in order from 1 September.</p>' +
            '</div>' +
            '<div class="np-holiday-side">' +
              '<a class="np-holiday-cta" href="#products">Shop with 10% off</a>' +
              '<span class="np-holiday-code">Code <b>SUMMER10</b> at checkout</span>' +
            '</div>' +
          '</div>';
      }
      hero.insertAdjacentElement('afterend', band);

      /* hero swaps */
      var pill = document.querySelector('.hero-dispatch-pill');
      if (pill) {
        pill.innerHTML = '<span class="dispatch-live-dot"></span>' +
          (PHASE === 'pre' ? 'Final dispatch: Tuesday 11 August' : '10% off pre-orders &middot; dispatch resumes 1 Sept');
      }
      if (PHASE === 'break') {
        var titleDispatch = document.querySelector('.hero-title-dispatch');
        if (titleDispatch) titleDispatch.textContent = '10% Off Pre-Orders.';
        var accentNum = document.querySelector('.hero-stat-num.accent');
        if (accentNum) {
          accentNum.textContent = '1 Sept';
          var accentLabel = accentNum.parentElement && accentNum.parentElement.querySelector('.hero-stat-label');
          if (accentLabel) accentLabel.textContent = 'Dispatch resumes';
        }
      }

      if (PHASE === 'pre') {
        setInterval(function () {
          var el = document.querySelector('[data-holiday-count]');
          if (el) el.textContent = countdownText();
        }, 30000);
      }
    }

    /* ---------------- checkout ---------------- */
    var checkout = document.getElementById('main-checkout');
    if (checkout) {
      var note = document.createElement('div');
      note.id = 'np-holiday-checkout-note';
      if (PHASE === 'pre') {
        note.className = 'np-holiday-note np-holiday-note-amber';
        note.innerHTML =
          '<p class="np-holiday-note-copy"><strong>Summer break from 12 August.</strong> Order by midnight Monday and this ships <strong>Tuesday 11 August</strong> &mdash; the final dispatch before our break. We&rsquo;re back dispatching 1 September.</p>';
      } else {
        note.className = 'np-holiday-note np-holiday-note-deal';
        note.innerHTML =
          '<p class="np-holiday-note-copy"><strong>Summer pre-order &mdash; 10% off.</strong> We&rsquo;re away until 1 September: order now, your items are reserved, and dispatch starts <strong>1 September</strong>. Use code <strong>SUMMER10</strong> for 10% off this order.</p>' +
          '<button type="button" class="np-holiday-apply" id="np-holiday-apply">Apply SUMMER10 &mdash; 10% off</button>';
      }
      var title = checkout.querySelector('.checkout-title');
      if (title) title.insertAdjacentElement('afterend', note);
      else checkout.insertAdjacentElement('afterbegin', note);

      if (PHASE === 'break') {
        var applyBtn = document.getElementById('np-holiday-apply');
        if (applyBtn) {
          applyBtn.addEventListener('click', function () {
            var input = document.getElementById('discount-input');
            if (input && typeof window.applyDiscount === 'function') {
              input.value = CODE;
              window.applyDiscount();
              applyBtn.textContent = '10% applied';
              applyBtn.classList.add('is-done');
              applyBtn.disabled = true;
            }
          });
        }

        /* keep the dispatch promises honest during the break */
        var reassure = document.querySelector('.checkout-reassure');
        if (reassure) reassure.textContent = 'Payment is by bank transfer (Faster Payments — usually clears within hours). We confirm by email; summer pre-orders are reserved and dispatched in order from 1 September.';
        var steps = document.querySelectorAll('.next-step-body');
        for (var i = 0; i < steps.length; i++) {
          if (steps[i].textContent.indexOf('24') !== -1) {
            steps[i].textContent = 'Once received (usually within a few hours via Faster Payments), we’ll confirm by email. Your pre-order is reserved and dispatches from 1 September.';
          }
        }
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
