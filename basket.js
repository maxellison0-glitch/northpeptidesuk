// NORTH PEPTIDES UK — Basket System

let basket = [];

function addToBasket(name, price, dose) {
  const existing = basket.find(i => i.name === name && i.dose === dose);
  if (existing) {
    existing.qty++;
  } else {
    basket.push({ name, price, dose, qty: 1 });
  }
  updateBasketUI();
  showBasket();
}

function removeFromBasket(index) {
  basket.splice(index, 1);
  updateBasketUI();
}

function changeQty(index, delta) {
  basket[index].qty += delta;
  if (basket[index].qty <= 0) basket.splice(index, 1);
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
      <div class="basket-item-price">£${(item.price * item.qty).toFixed(0)}</div>
      <button class="basket-item-remove" onclick="removeFromBasket(${i})">✕</button>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = '£' + getTotal().toFixed(0);
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

  // Build order summary for checkout
  const summary = document.getElementById('checkout-summary');
  summary.innerHTML = basket.map(item =>
    `<div class="checkout-line"><span>${item.name} ${item.dose} x${item.qty}</span><span>£${(item.price * item.qty).toFixed(0)}</span></div>`
  ).join('') + `<div class="checkout-line checkout-total-line"><span>Total</span><span>£${getTotal().toFixed(0)}</span></div>`;

  // Set hidden order field
  document.getElementById('order-details').value = basket.map(item =>
    `${item.name} ${item.dose} x${item.qty} = £${(item.price * item.qty).toFixed(0)}`
  ).join('\n') + `\n\nTOTAL: £${getTotal().toFixed(0)}`;
}

function backToBasket() {
  document.getElementById('basket-view').style.display = 'block';
  document.getElementById('checkout-view').style.display = 'none';
}

function getSelectedVariant(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return null;
  const parts = sel.value.split('|');
  return { price: parseInt(parts[0]), stock: parts[1], dose: sel.options[sel.selectedIndex].text.split('—')[0].trim() };
}

document.addEventListener('DOMContentLoaded', () => {
  updateBasketUI();

  // Handle checkout form submission
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
