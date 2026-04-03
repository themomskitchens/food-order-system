const SHEET_URL = "PASTE_YOUR_GOOGLE_SCRIPT_URL_HERE";

let orders = JSON.parse(localStorage.getItem("orders")) || [];

function saveOrders() {
  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders();
}

function addOrder() {
  const nameInput = document.getElementById("customerName");
  const phoneInput = document.getElementById("customerPhone");
  const itemInput = document.getElementById("orderItem");

  const name = nameInput.value.trim() || "Guest";
  const phone = phoneInput.value.trim();
  const item = itemInput.value.trim();

  if (!item) {
    alert("Please enter order item");
    return;
  }

  const existing = orders.find(o => o.phone === phone && phone);
  const finalName = existing ? existing.name : name;

  const order = {
    id: Date.now(),
    token: orders.length + 1,
    name: finalName,
    phone,
    item,
    time: new Date().toLocaleString(),
    status: "Pending",
    feedback: ""
  };

  orders.unshift(order);
  saveOrders();

  fetch(SHEET_URL, {
    method: "POST",
    body: JSON.stringify(order)
  });

  const sound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
  sound.play();

  nameInput.value = "";
  phoneInput.value = "";
  itemInput.value = "";
}

function markReady(id) {
  const order = orders.find(o => o.id === id);
  order.status = "Ready";
  saveOrders();
}

function notifyCustomer(id) {
  const order = orders.find(o => o.id === id);

  if (!order.phone) {
    alert("Customer number not available");
    return;
  }

  const message = `Hello ${order.name}, your order ${order.item} is ready. Please collect it from counter. - The Food Corner`;

  window.open(
    `https://wa.me/91${order.phone}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

function markCompleted(id) {
  const order = orders.find(o => o.id === id);

  const feedback = prompt(
    `Customer feedback for ${order.name}`,
    "Very Good"
  );

  order.status = "Completed";
  order.feedback = feedback || "No Feedback";

  saveOrders();

  fetch(SHEET_URL, {
    method: "POST",
    body: JSON.stringify(order)
  });
}

function clearCompleted() {
  orders = orders.filter(order => order.status !== "Completed");
  saveOrders();
}

function exportCSV() {
  let csv = "Token,Name,Phone,Item,Time,Status,Feedback
";

  orders.forEach(order => {
    csv += `${order.token},${order.name},${order.phone},${order.item},${order.time},${order.status},${order.feedback}
`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "food-corner-orders.csv";
  a.click();
}

function renderOrders() {
  const list = document.getElementById("ordersList");
  const search = document.getElementById("search").value.toLowerCase();

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

      const card = document.createElement("div");
      card.className = `order-card ${order.status.toLowerCase()}`;

      card.innerHTML = `
        <h3>Token #${order.token}</h3>
        <p><strong>Name:</strong> ${order.name}</p>
        <p><strong>Phone:</strong> ${order.phone || "Guest"}</p>
        <p><strong>Item:</strong> ${order.item}</p>
        <p><strong>Time:</strong> ${order.time}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        ${order.feedback ? `<p><strong>Feedback:</strong> ${order.feedback}</p>` : ""}

        <div class="order-buttons">
          ${order.status === "Pending" ? `<button onclick="markReady(${order.id})">Mark Ready</button>` : ""}

          ${order.phone ? `<button class="notify-btn" onclick="notifyCustomer(${order.id})">WhatsApp Notify</button>` : ""}

          ${order.status !== "Completed" ? `<button class="complete-btn" onclick="markCompleted(${order.id})">Complete</button>` : ""}
        </div>
      `;

      list.appendChild(card);
    });

  document.getElementById("pendingCount").innerText = pending;
  document.getElementById("readyCount").innerText = ready;
  document.getElementById("todayOrders").innerText = orders.length;
}

renderOrders();
