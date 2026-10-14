/* ShopEasy CX Lab — local classroom demo, no real payment processing. */
const PRODUCTS = {
  headphones: { id: "headphones", name: "Wireless Headphones", price: 1499 },
  watch: { id: "watch", name: "Smart Watch", price: 2499 },
  speaker: { id: "speaker", name: "Bluetooth Speaker", price: 999 }
};
const KEYS = {
  cart: "shopeasy_cart_v2",
  feedback: "shopeasy_feedback_v2",
  visitorsA: "visitors_A",
  visitorsB: "visitors_B",
  completedA: "completed_A",
  completedB: "completed_B"
};
const money = value => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(value);
const readJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const getCart = () => readJSON(KEYS.cart, {});
const saveCart = cart => localStorage.setItem(KEYS.cart, JSON.stringify(cart));
const currentVersion = () => document.body.dataset.version || null;

document.addEventListener("DOMContentLoaded", () => {
  const version = currentVersion();
  if (version) trackVisitor(version);
  setupStorefront();
  setupCheckout(version);
  setupFeedback();
  setupDashboard();
  renderCart();
  renderCheckoutSummary();
});

function trackVisitor(version) {
  const key = `shopeasy_seen_${version}`;
  if (sessionStorage.getItem(key)) return;
  const metric = version === "B" ? KEYS.visitorsB : KEYS.visitorsA;
  localStorage.setItem(metric, Number(localStorage.getItem(metric) || 0) + 1);
  sessionStorage.setItem(key, "1");
}

function setupStorefront() {
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const product = PRODUCTS[button.dataset.id];
      if (!product) return;
      const cart = getCart();
      cart[product.id] = (cart[product.id] || 0) + 1;
      saveCart(cart);
      renderCart();
      button.textContent = "Added ✓";
      setTimeout(() => button.textContent = "Add to cart", 900);
    });
  });
  document.getElementById("clear-cart")?.addEventListener("click", () => {
    saveCart({});
    renderCart();
  });
  document.getElementById("continue-checkout")?.addEventListener("click", event => {
    const cart = getCart();
    if (!Object.keys(cart).length) {
      event.preventDefault();
      return;
    }
    // Version A uses the same form but a simple presentation. The shared checkout
    // page is Version B; this link changes the URL hash to signal the demo flow.
    event.preventDefault();
    window.location.href = "checkout-a.html";
  });
  // When launched with ?from=A, use Version A metrics for the demo checkout.
  const params = new URLSearchParams(window.location.search);
  if (params.get("from") === "A") sessionStorage.setItem("shopeasy_checkout_version", "A");
}

function renderCart() {
  const cartHost = document.getElementById("cart-items");
  const countHost = document.getElementById("cart-count");
  const subtotalHost = document.getElementById("cart-subtotal");
  const continueLink = document.getElementById("continue-checkout");
  if (!cartHost) return;
  const cart = getCart();
  const entries = Object.entries(cart).filter(([id, qty]) => PRODUCTS[id] && qty > 0);
  const count = entries.reduce((sum, [, qty]) => sum + qty, 0);
  const subtotal = entries.reduce((sum, [id, qty]) => sum + PRODUCTS[id].price * qty, 0);
  countHost.textContent = count;
  subtotalHost.textContent = money(subtotal);
  if (!entries.length) {
    cartHost.innerHTML = '<p class="muted">Your cart is empty. Add a product to get started.</p>';
  } else {
    cartHost.innerHTML = entries.map(([id, qty]) => `
      <div class="cart-row">
        <div><div class="cart-product">${PRODUCTS[id].name}</div><span class="muted small">${money(PRODUCTS[id].price)} each</span></div>
        <div class="qty-controls">
          <button type="button" data-action="minus" data-id="${id}" aria-label="Decrease quantity">−</button>
          <strong>${qty}</strong>
          <button type="button" data-action="plus" data-id="${id}" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="remove-item" data-action="remove" data-id="${id}">Remove</button>
      </div>`).join("");
    cartHost.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => {
      const updated = getCart(), id = button.dataset.id, action = button.dataset.action;
      if (action === "plus") updated[id] = (updated[id] || 0) + 1;
      if (action === "minus") updated[id] = Math.max(0, (updated[id] || 0) - 1);
      if (action === "remove" || updated[id] === 0) delete updated[id];
      saveCart(updated);
      renderCart();
    }));
  }
  if (continueLink) continueLink.classList.toggle("disabled", !entries.length);
}

function renderCheckoutSummary() {
  const host = document.getElementById("checkout-items");
  if (!host) return;
  const cart = getCart();
  const entries = Object.entries(cart).filter(([id, qty]) => PRODUCTS[id] && qty > 0);
  const subtotal = entries.reduce((sum, [id, qty]) => sum + PRODUCTS[id].price * qty, 0);
  host.innerHTML = entries.length
    ? entries.map(([id, qty]) => `<div class="checkout-item"><span>${PRODUCTS[id].name} × ${qty}</span><strong>${money(PRODUCTS[id].price * qty)}</strong></div>`).join("")
    : '<p class="muted">Your cart is empty. <a href="index.html">Choose products</a>.</p>';
  ["checkout-subtotal", "checkout-total"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = money(subtotal);
  });
}

function setupCheckout(version) {
  const form = document.getElementById("checkout-form");
  if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const cart = getCart();
    if (!Object.keys(cart).some(id => cart[id] > 0)) {
      alert("Your cart is empty. Please add a product first.");
      return;
    }
    const selectedVersion = version || "B";
    const key = selectedVersion === "A" ? KEYS.completedA : KEYS.completedB;
    localStorage.setItem(key, Number(localStorage.getItem(key) || 0) + 1);
    saveCart({});
    sessionStorage.removeItem("shopeasy_checkout_version");
    alert(`Demo order completed! You tested Version ${selectedVersion}. No payment was taken.`);
    form.reset();
    renderCart();
    renderCheckoutSummary();
    refreshDashboard();
  });
}

function setupFeedback() {
  const button = document.getElementById("submit-feedback");
  if (!button) return;
  button.addEventListener("click", () => {
    const rating = Number(document.getElementById("rating")?.value);
    const message = document.getElementById("feedback-message");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      if (message) message.textContent = "Please select a valid rating.";
      return;
    }
    const feedback = readJSON(KEYS.feedback, []);
    feedback.push({ rating, version: currentVersion() || "B", date: new Date().toISOString() });
    localStorage.setItem(KEYS.feedback, JSON.stringify(feedback));
    if (message) message.textContent = "Thanks! Your rating has been saved in this browser.";
    refreshDashboard();
  });
}

function setupDashboard() {
  if (!document.getElementById("winner-message")) return;
  refreshDashboard();
  document.getElementById("reset-data")?.addEventListener("click", () => {
    if (!confirm("Reset ShopEasy demo metrics and feedback for this browser?")) return;
    [KEYS.visitorsA, KEYS.visitorsB, KEYS.completedA, KEYS.completedB, KEYS.feedback].forEach(key => localStorage.removeItem(key));
    sessionStorage.removeItem("shopeasy_seen_A");
    sessionStorage.removeItem("shopeasy_seen_B");
    refreshDashboard();
  });
  window.addEventListener("storage", refreshDashboard);
  setInterval(refreshDashboard, 2000);
}

function getMetrics(version) {
  const visitors = Number(localStorage.getItem(version === "A" ? KEYS.visitorsA : KEYS.visitorsB) || 0);
  const completed = Number(localStorage.getItem(version === "A" ? KEYS.completedA : KEYS.completedB) || 0);
  return { visitors, completed, rate: visitors ? Math.min(100, completed / visitors * 100) : 0, uncompleted: Math.max(0, visitors - completed) };
}

function refreshDashboard() {
  if (!document.getElementById("winner-message")) return;
  const a = getMetrics("A"), b = getMetrics("B");
  const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  set("visitors-a", a.visitors); set("completed-a", a.completed); set("rate-a", `${a.rate.toFixed(2)}%`); set("abandoned-a", a.uncompleted);
  set("visitors-b", b.visitors); set("completed-b", b.completed); set("rate-b", `${b.rate.toFixed(2)}%`); set("abandoned-b", b.uncompleted);
  const barA = document.getElementById("bar-a"), barB = document.getElementById("bar-b");
  if (barA) barA.style.width = `${a.rate}%`;
  if (barB) barB.style.width = `${b.rate}%`;
  const message = document.getElementById("winner-message");
  if (a.visitors < 10 || b.visitors < 10) {
    message.textContent = "Early result only: collect more sessions from both versions before deciding which design performs better.";
  } else if (a.rate === b.rate) {
    message.textContent = "Both versions currently have the same observed completion rate. More data is needed for a reliable conclusion.";
  } else {
    const winner = a.rate > b.rate ? "A (Original)" : "B (Improved)";
    message.textContent = `Version ${winner} currently has the higher observed completion rate. This is descriptive, not proof of statistical significance.`;
  }
  const feedback = readJSON(KEYS.feedback, []);
  set("feedback-count", feedback.length ? `${feedback.length} rating${feedback.length === 1 ? "" : "s"} collected` : "No ratings yet");
  set("feedback-average", feedback.length ? `${(feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1)}/5` : "—");
}
