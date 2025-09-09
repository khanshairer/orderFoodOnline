// ---------------------------
// Cart storage helpers
// ---------------------------
let orderItems = [];

function loadCart() {
  try {
    const raw = localStorage.getItem("orderItems");
    orderItems = raw ? JSON.parse(raw) : [];
  } catch {
    orderItems = [];
  }
}

function saveCart() {
  localStorage.setItem("orderItems", JSON.stringify(orderItems));
}

// Add or increase an item in the cart
function addItemToCart({ id, name, price, quantity }) {
  // normalize
  const qty = Number(quantity) || 1;
  const priceNum = typeof price === "number" ? price
                  : parseFloat(String(price).replace("$", "")) || 0;

  const existing = orderItems.find((it) => it.id === id);
  if (existing) {
    existing.quantity += qty;
  } else {
    orderItems.push({ id, name, price: priceNum, quantity: qty });
  }
  saveCart();
}

// ---------------------------
// Rendering (used on cart.html and also index if you show a mini summary)
// ---------------------------
function updateOrderSummary() {
  const orderSummary = document.getElementById("order-summary");
  if (!orderSummary) return; // this page doesn't have a summary section

  orderSummary.innerHTML = "";

  if (orderItems.length === 0) {
    orderSummary.innerHTML = "<p>No items in your order.</p>";
    return;
  }

  let total = 0;

  orderItems.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    orderSummary.innerHTML +=
    `<table>
    <tr>
    <td>
      <div class="order-item">
        <p>${item.name} — ${item.quantity} × $${item.price.toFixed(2)} 
        = $${itemTotal.toFixed(2)}</p>
      </div>
    </td>
    <td>
      <button class="remove-item" data-id="${item.id}">-</button>
    </td>
    <td>
      <button class="add-item" data-id="${item.id}">+</button>
    </td>
    </tr>
    </table>
    `;
  });

  orderSummary.innerHTML += `<h3>Total: $${total.toFixed(2)}</h3>`;
}

// ---------------------------
// Product card wiring (index.html)
// ---------------------------
function wireProductCards() {
  // + and − buttons
  document.querySelectorAll(".add-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const photo = btn.closest(".photo");
      const counter = photo?.querySelector(".total-items");
      if (!counter) return;
      counter.textContent = String((parseInt(counter.textContent, 10) || 1) + 1);
    });
  });

  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const photo = btn.closest(".photo");
      const counter = photo?.querySelector(".total-items");
      if (!counter) return;
      const next = Math.max(1, (parseInt(counter.textContent, 10) || 1) - 1);
      counter.textContent = String(next);
    });
  });

  // "Order Now" buttons (can be many)
  document.querySelectorAll(".order-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const photo = btn.closest(".photo");
      if (!photo) return;

      // Name: first <p> inside the card
      const itemName = photo.querySelector("p")?.textContent?.trim() || "Item";
      // Price: any <p> whose id ends with -price
      const priceText = photo.querySelector('p[id$="-price"]')?.textContent?.trim() || "$0";
      // Quantity: .total-items counter
      const qtyText = photo.querySelector(".total-items")?.textContent?.trim() || "1";

      // Optional stable id: use the price element id if present, else name
      const id =
        photo.querySelector('p[id$="-price"]')?.id ||
        itemName.toLowerCase().replace(/\s+/g, "-");

      addItemToCart({
        id,
        name: itemName,
        price: priceText,     // can be "$12.99" or number; we normalize inside addItemToCart
        quantity: parseInt(qtyText, 10) || 1,
      });

      // Optional feedback on the same page
      updateOrderSummary();
      alert("Added to cart! 🛒");
    });
  });
}

// ---------------------------
// Optional: checkout clear (cart.html)
// Add a button with id="checkout" in cart.html to use this.
// ---------------------------
function wireCheckout() {
  const btn = document.getElementById("checkout");
  if (!btn) return;
  btn.addEventListener("click", () => {
    // ...perform your real checkout here...
    orderItems = [];
    saveCart();
    updateOrderSummary();
    alert("Thanks for your order!");
  });
}

// ---------------------------
// Init (runs on every page that includes script.js)
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  wireProductCards();   // harmless on pages without product cards
  wireCheckout();       // harmless on pages without #checkout
  updateOrderSummary(); // renders if #order-summary exists
});

function wireContinueShopping() {
  const btn = document.getElementById("continue-shopping");
  if (!btn) return;
  btn.addEventListener("click", () => {
    // Redirect to the main shopping page
    window.location.href = "index.html";
  });
}


document.addEventListener("DOMContentLoaded", () => {
  wireContinueShopping(); // Set up the continue shopping button
});