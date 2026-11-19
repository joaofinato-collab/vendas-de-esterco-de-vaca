// Banco de Produtos
const products = [
  {
    id: 1,
    name: "Esterco Curtido Peneirado - 5kg",
    category: "jardim",
    badge: "Ideal para Vasos",
    emoji: "🪴",
    weightKg: 5,
    price: 12.90,
    description: "Textura fina e sem odor. Perfeito para plantas ornamentais, flores e vasos internos.",
    yieldText: "Rende até 10 vasos médios"
  },
  {
    id: 2,
    name: "Saco Esterco Bovino Curtido - 20kg",
    category: "horta",
    badge: "Mais Vendido",
    emoji: "🥬",
    weightKg: 20,
    price: 28.00,
    description: "Pronto para canteiros de hortaliças, temperos, gramados e jardins residenciais.",
    yieldText: "Cobre até 5m² de horta"
  },
  {
    id: 3,
    name: "Saco Produtor Rural - 40kg",
    category: "horta",
    badge: "Melhor Custo-Benefício",
    emoji: "🌳",
    weightKg: 40,
    price: 49.90,
    description: "Saco reforçado para pomares, frutíferas, paisagismo e canteiros maiores.",
    yieldText: "Cobre até 10m² de cultivo"
  },
  {
    id: 4,
    name: "Big Bag Agrícola - 500kg",
    category: "atacado",
    badge: "Atacado / Lavoura",
    emoji: "🚜",
    weightKg: 500,
    price: 460.00,
    description: "Volume ideal para chácaras, sítios, estufas e produtores rurais. Entrega com descarga.",
    yieldText: "Cobre até 125m² de área"
  }
];

let cart = [];
let shippingCost = null;
let recommendedOrder = { productId: 2, qty: 4 };

// Elementos do DOM
const productsGrid = document.getElementById("productsGrid");
const filterBtns = document.querySelectorAll(".filter-btn");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItemsContainer = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const subtotalEl = document.getElementById("subtotalValue");
const shippingEl = document.getElementById("shippingValue");
const totalEl = document.getElementById("totalValue");
const toastEl = document.getElementById("toast");

// Formatar moeda BRL
function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Mostrar Toast
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2600);
}

// Renderizar Catálogo
function renderProducts(filter = "todos") {
  productsGrid.innerHTML = "";
  const filtered = filter === "todos"
    ? products
    : products.filter(p => p.category === filter);

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div>
        <span class="product-badge">${product.badge}</span>
        <div class="product-emoji">${product.emoji}</div>
        <h3>${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <p class="product-meta">✓ ${product.yieldText}</p>
      </div>
      <div>
        <div class="product-price">
          ${formatBRL(product.price)} <small>/ unidade</small>
        </div>
        <button class="btn btn-primary btn-full" onclick="addToCart(${product.id}, 1)">
          + Adicionar ao Carrinho
        </button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// Filtros do Catálogo
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.filter);
  });
});

// Adicionar ao Carrinho
function addToCart(productId, quantity = 1) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({ ...product, qty: quantity });
  }

  updateCartUI();
  showToast(`${product.name} adicionado!`);
}

// Alterar Quantidade
function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  updateCartUI();
}

// Atualizar Interface do Carrinho
function updateCartUI() {
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  cartCountEl.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="empty-cart">Seu carrinho está vazio.<br>Escolha um saco de adubo para começar!</p>`;
    subtotalEl.textContent = "R$ 0,00";
    shippingEl.textContent = "A calcular";
    totalEl.textContent = "R$ 0,00";
    return;
  }

  cartItemsContainer.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <span>${formatBRL(item.price * item.qty)}</span>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
        <strong>${item.qty}</strong>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    `;
    cartItemsContainer.appendChild(div);
  });

  subtotalEl.textContent = formatBRL(subtotal);

  let finalShipping = 0;
  if (subtotal >= 250) {
    shippingEl.textContent = "GRÁTIS";
    finalShipping = 0;
  } else if (shippingCost !== null) {
    shippingEl.textContent = formatBRL(shippingCost);
    finalShipping = shippingCost;
  } else {
    shippingEl.textContent = "A calcular";
  }

  totalEl.textContent = formatBRL(subtotal + finalShipping);
}

// Abrir e Fechar Carrinho
function toggleCart(open) {
  cartDrawer.classList.toggle("open", open);
  cartOverlay.classList.toggle("open", open);
}

openCartBtn.addEventListener("click", () => toggleCart(true));
closeCartBtn.addEventListener("click", () => toggleCart(false));
cartOverlay.addEventListener("click", () => toggleCart(false));

// Simulador de Frete por CEP
document.getElementById("calcShippingBtn").addEventListener("click", () => {
  const cep = document.getElementById("cepInput").value.replace(/\D/g, "");
  const msg = document.getElementById("shippingMsg");

  if (cep.length !== 8) {
    msg.textContent = "Digite um CEP válido com 8 dígitos.";
    msg.style.color = "#c0392b";
    return;
  }

  shippingCost = cep.startsWith("8") ? 18.00 : 32.00;
  msg.style.color = "#2e6f40";
  msg.textContent = "Prazo estimado: 1 a 2 dias úteis.";
  updateCartUI();
});

// Calculadora de Adubo
document.getElementById("calcForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const area = parseFloat(document.getElementById("areaInput").value) || 1;
  const kgPerM2 = parseFloat(document.getElementById("cultivoSelect").value);
  const totalKg = Math.ceil(area * kgPerM2);

  document.getElementById("kgResult").textContent = `${totalKg} kg`;

  let chosenProduct;
  let qty;

  if (totalKg >= 350) {
    chosenProduct = products.find(p => p.id === 4); // Big Bag 500kg
    qty = Math.ceil(totalKg / 500);
  } else if (totalKg >= 40) {
    chosenProduct = products.find(p => p.id === 3); // Saco 40kg
    qty = Math.ceil(totalKg / 40);
  } else if (totalKg >= 15) {
    chosenProduct = products.find(p => p.id === 2); // Saco 20kg
    qty = Math.ceil(totalKg / 20);
  } else {
    chosenProduct = products.find(p => p.id === 1); // Saco 5kg
    qty = Math.ceil(totalKg / 5);
  }

  recommendedOrder = { productId: chosenProduct.id, qty };
  const totalPrice = formatBRL(chosenProduct.price * qty);

  document.getElementById("suggestionText").innerHTML =
    `Sugestão ideal: <strong>${qty}x ${chosenProduct.name}</strong> (Total: ${totalPrice}).`;
});

document.getElementById("addRecommendedBtn").addEventListener("click", () => {
  addToCart(recommendedOrder.productId, recommendedOrder.qty);
  toggleCart(true);
});

// Finalizar Pedido no WhatsApp
document.getElementById("checkoutWhatsAppBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Adicione produtos ao carrinho primeiro!");
    return;
  }

  const phone = "5541995494667";
  let message = "Olá, AgroVerde! Gostaria de fazer o seguinte pedido:\n\n";

  cart.forEach(item => {
    message += `• ${item.qty}x ${item.name} - ${formatBRL(item.price * item.qty)}\n`;
  });

  message += `\n*Total estimado:* ${totalEl.textContent}`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
});

// Inicializar página
renderProducts();
updateCartUI();