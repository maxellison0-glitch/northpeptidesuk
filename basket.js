// NORTH PEPTIDES UK — Basket System

let basket = [];

function fmt(v) { return Number(v).toFixed(2).replace(/\.00$/, ''); }

// Persist the basket in localStorage so it survives navigation to checkout.html AND
// a tab/browser close (returning visitors keep their cart). Shared key with
// product.html and checkout.html.
const FREE_SHIP_THRESHOLD = 50;
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
        <button onclick="changeQty(${i}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${i}, 1)">+</button>
      </div>
      <div class="basket-item-price">£${fmt(item.price * item.qty)}</div>
      <button class="basket-item-remove" onclick="removeFromBasket(${i})">✕</button>
    </div>
  `).join('') + renderShipNote();

  if (totalEl) totalEl.textContent = '£' + fmt(getTotal());
}

// Free-shipping progress nudge — surfaces the £50 threshold right in the drawer so
// shoppers add one more item instead of discovering it only at checkout.
function renderShipNote() {
  const total = getTotal();
  if (total >= FREE_SHIP_THRESHOLD) {
    return '<div class="basket-ship-note unlocked">✓ You’ve unlocked free UK delivery</div>';
  }
  const remaining = FREE_SHIP_THRESHOLD - total;
  const pct = Math.min(100, Math.round((total / FREE_SHIP_THRESHOLD) * 100));
  return '<div class="basket-ship-note">Add <strong>£' + fmt(remaining) + '</strong> more for free UK delivery'
    + '<div class="basket-ship-bar"><span style="width:' + pct + '%"></span></div></div>';
}

function showBasket() {
  document.getElementById('basket-overlay').classList.add('active');
  document.getElementById('basket-drawer').classList.add('active');
  renderBasketItems();
}

function hideBasket() {
  document.getElementById('basket-overlay').classList.remove('active');
  document.getElementById('basket-drawer').classList.remove('active');
}

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
  const price = parseInt(parts[0]);
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
