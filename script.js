
const products = [
    {
        id: 1, name: "Air Flex Sneakers", category: "Shoes",
        price: 2499, emoji: "👟",
        desc: "Everyday comfort and style"
    },
    {
        id: 2, name: "Classic Street Shoes", category: "Shoes",
        price: 1899, emoji: "👞",
        desc: "Casual shoes for daily wear"
    },
    {
        id: 3, name: "Essential T-Shirt", category: "Clothing",
        price: 699, emoji: "👕",
        desc: "Simple, comfortable and versatile"
    },
    {
        id: 4, name: "Urban Hoodie", category: "Clothing",
        price: 1499, emoji: "🧥",
        desc: "A cosy layer for cool days"
    },
    {
        id: 5, name: "Wireless Headphones", category: "Gadgets",
        price: 2999, emoji: "🎧",
        desc: "Enjoy your favourite music"
    },
    {
        id: 6, name: "Smart Speaker", category: "Gadgets",
        price: 2199, emoji: "🔊",
        desc: "Compact sound for your desk"
    },
    {
        id: 7, name: "Classic Wrist Watch", category: "Watches",
        price: 1799, emoji: "⌚",
        desc: "A timeless everyday accessory"
    },
    {
        id: 8, name: "Smart Watch", category: "Watches",
        price: 3499, emoji: "⌚",
        desc: "A modern look for every day"
    },
    {
        id: 9, name: "Running Sneakers", category: "Shoes",
        price: 2799, emoji: "👟",
        desc: "Made for active days"
    },
    {
        id: 10, name: "Backpack", category: "Clothing",
        price: 1299, emoji: "🎒",
        desc: "Carry your everyday essentials"
    },
    {
        id: 11, name: "Wireless Earbuds", category: "Gadgets",
        price: 1599, emoji: "🎵",
        desc: "Small earbuds for music on the go"
    },
    {
        id: 12, name: "Sport Watch", category: "Watches",
        price: 999, emoji: "⌚",
        desc: "A sporty everyday accessory"
    }
];

// Website state
let activeCategory = "All";
let showWishlistOnly = false;
let cart = [];
let wishlist = new Set();

// Find HTML elements
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const categories = document.getElementById("categories");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");

const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const wishCount = document.getElementById("wishCount");
const toast = document.getElementById("toast");

// Format prices in Indian Rupees
function money(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
}

// Show a small notification
let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

// Display products
function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();

    let filtered = products.filter(product => {
        const matchesCategory =
            activeCategory === "All" ||
            product.category === activeCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.desc.toLowerCase().includes(query);

        const matchesWishlist =
            !showWishlistOnly || wishlist.has(product.id);

        return matchesCategory && matchesSearch && matchesWishlist;
    });

    if (sortSelect.value === "low") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortSelect.value === "high") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortSelect.value === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    resultCount.textContent =
        `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`;

    emptyState.hidden = filtered.length !== 0;
    productGrid.hidden = filtered.length === 0;

    productGrid.innerHTML = filtered.map(product => `
        <article class="product-card">
            <div class="product-image">
                <span class="product-emoji" aria-hidden="true">
                    ${product.emoji}
                </span>

                <button
                    class="wish-btn ${wishlist.has(product.id) ? "active" : ""}"
                    data-wish="${product.id}"
                    aria-label="${wishlist.has(product.id) ? "Remove from" : "Add to"} wishlist"
                    aria-pressed="${wishlist.has(product.id)}"
                    type="button">
                    ${wishlist.has(product.id) ? "♥" : "♡"}
                </button>
            </div>

            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3>${product.name}</h3>
                <p class="product-desc">${product.desc}</p>

                <div class="product-bottom">
                    <span class="price">${money(product.price)}</span>
                    <button class="add-btn" data-add="${product.id}" type="button">
                        + Add to Cart
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

// Update wishlist counter
function updateWishlistCount() {
    wishCount.textContent = wishlist.size;
}

// Add product to cart
function addToCart(id) {
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id, quantity: 1 });
    }

    renderCart();
    showToast("Product added to cart!");
}

// Update cart contents and total
function renderCart() {
    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    const totalPrice = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + product.price * item.quantity;
    }, 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = money(totalPrice);

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <p style="font-size: 42px;">🛒</p>
                <p>Your cart is empty.</p>
                <p>Add a product to get started!</p>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);

        return `
            <div class="cart-item">
                <div>
                    <h3>${product.emoji} ${product.name}</h3>
                    <p>${money(product.price)} each</p>

                    <div class="quantity-controls">
                        <button data-minus="${item.id}"
                            aria-label="Decrease quantity" type="button">−</button>
                        <span>${item.quantity}</span>
                        <button data-plus="${item.id}"
                            aria-label="Increase quantity" type="button">+</button>
                    </div>
                </div>

                <button class="remove-btn"
                    data-remove="${item.id}" type="button">
                    Remove
                </button>
            </div>
        `;
    }).join("");
}

// Cart open and close
function openCart() {
    cartPanel.hidden = false;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("closeCart").focus();
}

function closeCart() {
    cartPanel.hidden = true;
    overlay.hidden = true;
    document.body.style.overflow = "";
    document.getElementById("cartToggle").focus();
}

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !cartPanel.hidden) {
        closeCart();
    }
});

// Handle product card buttons
productGrid.addEventListener("click", event => {
    const addButton = event.target.closest("[data-add]");
    const wishButton = event.target.closest("[data-wish]");

    if (addButton) {
        addToCart(Number(addButton.dataset.add));
    }

    if (wishButton) {
        const id = Number(wishButton.dataset.wish);

        if (wishlist.has(id)) {
            wishlist.delete(id);
            showToast("Removed from wishlist");
        } else {
            wishlist.add(id);
            showToast("Added to wishlist ♥");
        }

        updateWishlistCount();
        renderProducts();
    }
});

// Handle quantity and remove buttons
cartItems.addEventListener("click", event => {
    const plusButton = event.target.closest("[data-plus]");
    const minusButton = event.target.closest("[data-minus]");
    const removeButton = event.target.closest("[data-remove]");

    if (plusButton) {
        const item = cart.find(
            p => p.id === Number(plusButton.dataset.plus)
        );
        if (item) item.quantity++;
    }

    if (minusButton) {
        const item = cart.find(
            p => p.id === Number(minusButton.dataset.minus)
        );

        if (item) {
            item.quantity--;

            if (item.quantity <= 0) {
                cart = cart.filter(p => p.id !== item.id);
            }
        }
    }

    if (removeButton) {
        const id = Number(removeButton.dataset.remove);
        cart = cart.filter(item => item.id !== id);
        showToast("Product removed");
    }

    renderCart();
});

// Search products as you type
searchInput.addEventListener("input", renderProducts);

// Sort products
sortSelect.addEventListener("change", renderProducts);

// Category filters
categories.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    activeCategory = button.dataset.category;
    showWishlistOnly = false;

    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.toggle("active", btn === button);
    });

    document.getElementById("wishlistFilter").classList.remove("selected");
    renderProducts();
});

// Show wishlist
document.getElementById("wishlistFilter").addEventListener("click", () => {
    showWishlistOnly = !showWishlistOnly;
    activeCategory = "All";

    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.category === "All");
    });

    document.getElementById("wishlistFilter")
        .classList.toggle("selected", showWishlistOnly);

    renderProducts();

    document.getElementById("shop").scrollIntoView({
        behavior: "smooth"
    });
});

// Reset search and filters
document.getElementById("resetFilters").addEventListener("click", () => {
    searchInput.value = "";
    sortSelect.value = "featured";
    activeCategory = "All";
    showWishlistOnly = false;

    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.category === "All");
    });

    document.getElementById("wishlistFilter").classList.remove("selected");
    renderProducts();
});

// Demo checkout
document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    alert(
        "Demo checkout only!\n\n" +
        "Items: " + cart.reduce((sum, item) => sum + item.quantity, 0) +
        "\nTotal: " + cartTotal.textContent +
        "\n\nNo payment was taken and no order was placed."
    );
});

// Footer year
document.getElementById("year").textContent =
    new Date().getFullYear();

// Start the store
renderProducts();
renderCart();
updateWishlistCount();
