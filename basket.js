// NORTH PEPTIDES UK — Basket System

let basket = [];

function fmt(v) { return Number(v).toFixed(2).replace(/\.00$/, ''); }
function escapeAttr(v) { return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

// Persist the basket in localStorage so it survives navigation to checkout.html AND
// a tab/browser close (returning visitors keep their cart). Shared key with
// product.html and checkout.html.
const FREE_SHIP_THRESHOLD = 100;
function loadBasket() {
  try { return JSON.parse(localStorage.getItem('npuk_basket') || '[]'); } catch (e) { return []; }
}
function saveBasket() {
  try { localStorage.setItem('npuk_basket', JSON.stringify(basket)); } catch (e) {}
}
basket = loadBasket();
function trackBasketEvent(eventName, items, value) {
  if (!window.NPUKAnalytics) return;
  window.NPUKAnalytics.track(eventName, {
    contents: items.map(item => ({
      content_id: item.name + ':' + item.dose,
      content_name: item.name,
      content_type: 'product',
      quantity: item.qty || 1,
      price: Number(item.price)
    })),
    value: Number(value),
    currency: 'GBP'
  });
}

function addToBasket(name, price, dose) {
  const existing = basket.find(i => i.name === name && i.dose === dose);
  if (existing) {
    existing.qty++;
  } else {
    basket.push({ name, price, dose, qty: 1 });
  }
  saveBasket();
  updateBasketUI();
  trackBasketEvent('AddToCart', [{ name, price, dose, qty: 1 }], price);
  showBasket();
}

// Persist the basket and hand off to the checkout page.
function goToCheckout() {
  saveBasket();
  trackBasketEvent('InitiateCheckout', basket, getTotal());
  window.location.href = '/checkout.html';
}

function removeFromBasket(index) {
  basket.splice(index, 1);
  saveBasket();
  updateBasketUI();
}

function changeQty(index, delta) {
  basket[index].qty += delta;
  if (basket[index].qty <= 0) basket.splice(index, 1);
  saveBasket();
  updateBasketUI();
}

function getTotal() {
  return basket.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function updateBasketUI() {
  const count = basket.reduce((sum, item) => sum + item.qty, 0);
  const countEl = document.getElementById('basket-count');
  if (countEl) {
    countEl.textContent = count;
    countEl.style.display = count > 0 ? 'flex' : 'none';
  }
  renderBasketItems();
}

function renderBasketItems() {
  const el = document.getElementById('basket-items');
  const totalEl = document.getElementById('basket-total');
  if (!el) return;

  if (basket.length === 0) {
    el.innerHTML = '<p class="basket-empty">Your basket is empty.</p>';
    if (totalEl) totalEl.textContent = '£0';
    return;
  }

  el.innerHTML = basket.map((item, i) => `
    <div class="basket-item">
      <div class="basket-item-info">
        <span class="basket-item-name">${item.name}</span>
        <span class="basket-item-dose">${item.dose}</span>
      </div>
      <div class="basket-item-controls">
        <button type="button" aria-label="Decrease quantity of ${escapeAttr(item.name)}" onclick="changeQty(${i}, -1)">−</button>
        <span aria-live="polite">${item.qty}</span>
        <button type="button" aria-label="Increase quantity of ${escapeAttr(item.name)}" onclick="changeQty(${i}, 1)">+</button>
      </div>
      <div class="basket-item-price">£${fmt(item.price * item.qty)}</div>
      <button class="basket-item-remove" type="button" aria-label="Remove ${escapeAttr(item.name)} ${escapeAttr(item.dose)} from basket" onclick="removeFromBasket(${i})">✕</button>
    </div>
  `).join('') + renderShipNote();

  if (totalEl) totalEl.textContent = '£' + fmt(getTotal());
}

// Free-delivery progress nudge — surfaces the £100 threshold right in the drawer so
// shoppers add one more item instead of discovering it only at checkout.
// role="status" so the change is announced; the bar itself is decorative.
function renderShipNote() {
  const total = getTotal();
  if (total >= FREE_SHIP_THRESHOLD) {
    return '<div class="basket-ship-note unlocked" role="status">✓ You have unlocked free UK delivery</div>';
  }
  const remaining = FREE_SHIP_THRESHOLD - total;
  const pct = Math.min(100, Math.round((total / FREE_SHIP_THRESHOLD) * 100));
  return '<div class="basket-ship-note" role="status">Add <strong>£' + fmt(remaining) + '</strong> more for free UK delivery'
    + '<div class="basket-ship-bar" aria-hidden="true"><span style="width:' + pct + '%"></span></div></div>';
}

// Focus management: remember what opened the drawer, move focus inside it,
// and hand focus back on close. Escape closes the drawer (and the product
// modal on index.html, when that page defines closeModalBtn).
let basketLastFocus = null;

function showBasket() {
  const overlay = document.getElementById('basket-overlay');
  const drawer = document.getElementById('basket-drawer');
  if (!overlay || !drawer) return;
  if (!drawer.classList.contains('active')) {
    basketLastFocus = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
  }
  overlay.classList.add('active');
  drawer.classList.add('active');
  renderBasketItems();
  const closeBtn = drawer.querySelector('.basket-close');
  if (closeBtn && typeof closeBtn.focus === 'function') {
    try { closeBtn.focus({ preventScroll: true }); } catch (e) { closeBtn.focus(); }
  }
}

function hideBasket() {
  const overlay = document.getElementById('basket-overlay');
  const drawer = document.getElementById('basket-drawer');
  if (!overlay || !drawer) return;
  const wasOpen = drawer.classList.contains('active');
  overlay.classList.remove('active');
  drawer.classList.remove('active');
  if (wasOpen && basketLastFocus && document.contains(basketLastFocus) && typeof basketLastFocus.focus === 'function') {
    try { basketLastFocus.focus({ preventScroll: true }); } catch (e) { basketLastFocus.focus(); }
  }
  basketLastFocus = null;
}

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  hideBasket();
  if (typeof closeModalBtn === 'function') closeModalBtn();
});

function showCheckout() {
  if (basket.length === 0) return;
  document.getElementById('basket-view').style.display = 'none';
  document.getElementById('checkout-view').style.display = 'block';

  const summary = document.getElementById('checkout-summary');
  summary.innerHTML = basket.map(item =>
    `<div class="checkout-line"><span>${item.name} ${item.dose} x${item.qty}</span><span>£${fmt(item.price * item.qty)}</span></div>`
  ).join('') + `<div class="checkout-line checkout-total-line"><span>Total</span><span>£${fmt(getTotal())}</span></div>`;

  document.getElementById('order-details').value = basket.map(item =>
    `${item.name} ${item.dose} x${item.qty} = £${fmt(item.price * item.qty)}`
  ).join('\n') + `\n\nTOTAL: £${fmt(getTotal())}`;
}

function backToBasket() {
  document.getElementById('basket-view').style.display = 'block';
  document.getElementById('checkout-view').style.display = 'none';
}

function addToBasketVariant(selectId, name) {
  const select = document.getElementById(selectId);
  const parts = select.value.split('|');
  const price = parseFloat(parts[0]);
  const dose = parts[2];
  addToBasket(name, price, dose);
}

document.addEventListener('DOMContentLoaded', () => {
  updateBasketUI();

  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submit-btn');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const data = new FormData(form);

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          document.getElementById('checkout-view').style.display = 'none';
          document.getElementById('success-view').style.display = 'block';
          basket = [];
          saveBasket();
          updateBasketUI();
        } else {
          btn.textContent = 'Error — try again';
          btn.disabled = false;
        }
      } catch {
        btn.textContent = 'Error — try again';
        btn.disabled = false;
      }
    });
  }
});
