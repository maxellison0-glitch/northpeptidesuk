let basket = [];

// Load from session on page load
window.addEventListener('load', () => {
  const saved = sessionStorage.getItem('npuk_basket');
  if (saved) basket = JSON.parse(saved);
  updateBasketUI();
});

function saveBasket() {
  sessionStorage.setItem('npuk_basket', JSON.stringify(basket));
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
  showBasket();
}

function addToBasketVariant(selectId, name) {
  const select = document.getElementById(selectId);
  const parts = select.value.split('|');
  const price = parseInt(parts[0]);
  const dose = parts[2];
  addToBasket(name, price, dose);
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
      <div class="basket-item-price">£${item.price * item.qty}</div>
      <button class="basket-item-remove" onclick="removeFromBasket(${i})">✕</button>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = '£' + getTotal();
}

function showBasket() {
  const overlay = document.getElementById('basket-overlay');
  const drawer = document.getElementById('basket-drawer');
  if (overlay) overlay.classList.add('active');
  if (drawer) drawer.classList.add('active');
  renderBasketItems();
}

function hideBasket() {
  const overlay = document.getElementById('basket-overlay');
  const drawer = document.getElementById('basket-drawer');
  if (overlay) overlay.classList.remove('active');
  if (drawer) drawer.classList.remove('active');
}

function goToCheckout() {
  if (basket.length === 0) return;
  saveBasket();
  window.location.href = 'checkout.html';
}

function updatePrice(selectId, priceId, stockId) {
  const select = document.getElementById(selectId);
  const parts = select.value.split('|');
  document.getElementById(priceId).textContent = '£' + parts[0];
  document.getElementById(stockId).textContent = parts[1];
}
