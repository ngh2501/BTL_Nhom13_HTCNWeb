
function getProducts() {
    return JSON.parse(localStorage.getItem("products")) || [];
}

function formatCurrency(amount) {
    return amount.toLocaleString("vi-VN") + " đ";
}

// 1. Hiển thị danh sách sản phẩm
function renderProductList(productList, containerId) {
    const container = document.getElementById(containerId);

    if (!container) return;

    if (productList.length === 0) {
        container.innerHTML = `
            <div>
                <p>Không tìm thấy dụng cụ thể thao nào phù hợp.</p>
            </div>
        `;
        return;
    }

    let html = "";

    productList.forEach(p => {
        html += `
            <div>
                <div>
                    <span>${p.discount}</span>

                    <div>
                        <div>
                            <small>${p.brand}</small>
                            <h6 title="${p.name}">${p.name}</h6>
                        </div>

                        <div>
                            <div>
                                <span>${formatCurrency(p.price)}</span>
                                <span>${formatCurrency(p.oldPrice)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// 2. Chuyển sang trang chi tiết sản phẩm
function viewDetail(productId) {
    localStorage.setItem("currentProduct", productId);
    window.location.href = "chitiet.html";
}

// 3. Thêm sản phẩm vào giỏ hàng
function addToCartClick(productId) {
    if (typeof themVaoGio === "function") {
        themVaoGio(productId, 1);
    } else {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        let idx = cart.findIndex(item => item.id === productId);

        if (idx !== -1) {
            cart[idx].qty += 1;
        } else {
            cart.push({
                id: productId,
                qty: 1
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        alert("Đã thêm sản phẩm vào giỏ hàng!");

        if (typeof updateCartBadge === "function") {
            updateCartBadge();
        }
    }
}

// 4. Lọc và tìm kiếm sản phẩm
function filterProductsPage() {
    const urlParams = new URLSearchParams(window.location.search);

    const category = urlParams.get("loai");
    const searchKey = urlParams.get("search");

    let products = getProducts();

    if (category) {
        products = products.filter(p => p.category === category);
    }

    if (searchKey) {
        const key = searchKey.toLowerCase();

        products = products.filter(p =>
            p.name.toLowerCase().includes(key) ||
            p.brand.toLowerCase().includes(key)
        );
    }

    const catTitleMap = {
        bongda: "Dụng Cụ Bóng Đá",
        caulong: "Dụng Cụ Cầu Lông",
        tennis: "Dụng Cụ Tennis",
        chaybo: "Thiết Bị Chạy Bộ",
        tapluyen: "Dụng Cụ Tập Gym & Yoga"
    };

    const titleEl = document.getElementById("category-title");

    if (titleEl) {
        titleEl.textContent = category
            ? (catTitleMap[category] || "Tất Cả Sản Phẩm")
            : (searchKey
                ? `Kết quả tìm kiếm: "${searchKey}"`
                : "Tất Cả Sản Phẩm");
    }

    renderProductList(products, "product-list-container");
}

// 5. Hiển thị chi tiết và sản phẩm liên quan
function loadProductDetailPage() {
    const currentId = localStorage.getItem("currentProduct");
    const products = getProducts();

    const product = products.find(p => p.id == currentId);

    if (!product) return;

    const breadcrumbEl = document.getElementById("breadcrumb-product-name");

    if (breadcrumbEl) {
        breadcrumbEl.textContent = product.name;
    }

    const container = document.getElementById("product-detail-container");

    if (container) {
        container.innerHTML = `
            <div>
                <div>
                </div>

                <div>
                    <small>Thương hiệu: ${product.brand}</small>

                    <h3>${product.name}</h3>

                    <div>
                        <span>${formatCurrency(product.price)}</span>
                        <span>${formatCurrency(product.oldPrice)}</span>
                        <span>${product.discount}</span>
                    </div>

                    <p>${product.desc}</p>

                    <p>
                        <strong>Tình trạng:</strong>
                        <span>Còn hàng (${product.stock} sản phẩm)</span>
                    </p>

                    <div>
                    </div>

                    <div>
                    </div>
                </div>
            </div>
        `;
    }

    // Hiển thị tối đa 4 sản phẩm cùng danh mục
    const related = products.filter(p =>
        p.category === product.category &&
        p.id !== product.id
    );

    renderProductList(
        related.slice(0, 4),
        "related-products-container"
    );
}

// 6. Thêm sản phẩm từ trang chi tiết vào giỏ hàng
function addDetailToCart(productId) {
    const qtyInput = document.getElementById("detail-qty");
    const qty = parseInt(qtyInput ? qtyInput.value : 1);

    if (typeof themVaoGio === "function") {
        themVaoGio(productId, qty);
    } else {
        addToCartClick(productId);
    }
}

// 7. Mua ngay
function buyNow(productId) {
    addDetailToCart(productId);
    window.location.href = "giohang.html";
}
