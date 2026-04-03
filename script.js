const SHEET_URL = "PASTE_YOUR_GOOGLE_SCRIPT_URL_HERE";

let orders = JSON.parse(localStorage.getItem("orders")) || [];

function addOrder() {
  const name = document.getElementById("customerName").value.trim() || "Guest";
  const phone = document.getElementById("customerPhone").value.trim();
  const item = document.getElementById("orderItem").value.trim();

  if (!item) {
    alert("Please enter order item");
    return;
  }

  const order = {
    id: Date.now(),
    token: orders.length + 1,
    name,
    phone,
    item,
    time: new Date().toLocaleTimeString(),
    status: "Pending"
  };

  orders.unshift(order);
  saveOrders();

  fetch(SHEET_URL, {
  method: 'POST',
  body: JSON.stringify(order)
});
  
  document.getElementById("customerName").value = "";
  document.getElementById("customerPhone").value = "";
  document.getElementById("orderItem").value = "";
}

function saveOrders() {
  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders();
}

function markReady(id) {
  const order = orders.find(o => o.id === id);
  order.status = "Ready";
  saveOrders();
}

function markCompleted(id) {
  const order = orders.find(o => o.id === id);

  const feedback = prompt(
    `Customer feedback for ${order.name}?
Example: Very Good / Tasty / Need Improvement`
  );

  order.status = "Completed";
  order.feedback = feedback || "No Feedback";

  saveOrders();

  fetch(SHEET_URL, {
    method: 'POST',
    body: JSON.stringify(order)
  });
}

function notifyCustomer(id) {
  const order = orders.find(o => o.id === id);

  if (!order.phone) {
    alert("Customer number not available");
    return;
  }

  const message = `Hello ${order.name}, your order \"${order.item}\" is ready. Please collect it from counter. - The Food Corner`;

  const whatsappURL = `https://wa.me/91${order.phone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappURL, '_blank');
}

function slideOrd
  ers(direction) {
  const container = document.getElementById("ordersList");
  container.scrollBy({
    left: direction * 380,
    behavior: "smooth"
  });
}

function renderOrders() {
  const search = document.getElementById("search")?.value.toLowerCase() || "";

  const list = document.getElementById("ordersList");
  list.innerHTML = "";

  let pending = 0;
  let ready = 0;

  orders
    .filter(order =>
      order.name.toLowerCase().includes(search) ||
      order.phone.includes(search)
    )
    .forEach(order => {
      if (order.status === "Pending") pending++;
      if (order.status === "Ready") ready++;

      const div = document.createElement("div");
      div.className = "order-card " + order.status.toLowerCase();

      div.innerHTML = `
        <h3>Token #${order.token}</h3>
        <p><strong>Name:</strong> ${order.name}</p>
        <p><strong>Phone:</strong> ${order.phone || 'Not Provided'}</p>
        <p><strong>Item:</strong> ${order.item}</p>
        <p><strong>Time:</strong> ${order.time}</p>
        <p><strong>Status:</strong> ${order.status}</p>

        <div class="order-buttons">
          ${order.status === "Pending" ? `
            <button onclick="markReady(${order.id})">Mark Ready</button>
          ` : ''}

          ${order.phone ? `
            <button class="notify-btn" onclick="notifyCustomer(${order.id})">Notify on WhatsApp</button>
          ` : ''}

          ${order.status !== "Completed" ? `
            <button class="complete-btn" onclick="markCompleted(${order.id})">Completed</button>
          ` : ''}
        </div>
      `;

      list.appendChild(div);
    });

  document.getElementById("pendingCount").innerText = pending;
  document.getElementById("readyCount").innerText = ready;
}

renderOrders();
${order.feedback ? `<p><strong>Feedback:</strong> ${order.feedback}</p>` : ''}
    }
