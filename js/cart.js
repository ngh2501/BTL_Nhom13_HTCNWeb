function layGio() {
    try {
        var gio = JSON.parse(localStorage.getItem("cart"));
        return Array.isArray(gio) ? gio : [];
    } catch (e) {
        return [];
    }
}

function luuGio(gio) {
    localStorage.setItem("cart", JSON.stringify(gio));
    /* Báo cho navbar cập nhật số lượng (hàm này do B viết trong common.js, chưa có thì bỏ qua) */
    if (typeof capNhatSoLuongGio === "function") {
        capNhatSoLuongGio();
    }
}

/* Thêm sản phẩm vào giỏ. Trả về true nếu thành công, false nếu id/số lượng sai hoặc hết hàng.
   A gọi hàm này ở nút "Thêm vào giỏ": themVaoGio(id, qty) */
function themVaoGio(id, qty) {
    id = parseInt(id, 10);
    qty = (qty === undefined) ? 1 : parseInt(qty, 10);
    if (isNaN(id) || isNaN(qty) || qty < 1) {
        return false;
    }

    /* Kiểm tra sản phẩm có tồn tại và còn hàng không (nếu products đã được nạp) */
    var sanPham = null;
    try {
        var ds = JSON.parse(localStorage.getItem("products")) || [];
        sanPham = ds.filter(function (p) { return p.id === id; })[0] || null;
    } catch (e) {}
    if (sanPham && sanPham.stock !== undefined && sanPham.stock < 1) {
        return false;
    }

    var gio = layGio();
    var dong = gio.filter(function (d) { return d.id === id; })[0];
    if (dong) {
        dong.qty += qty;
    } else {
        gio.push({ id: id, qty: qty });
        dong = gio[gio.length - 1];
    }
    /* Không cho vượt quá tồn kho */
    if (sanPham && sanPham.stock !== undefined && dong.qty > sanPham.stock) {
        dong.qty = sanPham.stock;
    }

    luuGio(gio);
    return true;
}

/* ===================== HIỂN THỊ GIỎ HÀNG (giohang.html) ===================== */

function dinhDangGia(so) {
    return so.toLocaleString("vi-VN") + " ₫";
}

function thoatHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* Ghép giỏ (id, qty) với products để có tên, giá, ảnh. Bỏ qua sản phẩm không còn trong products. */
function layChiTietGio() {
    var ds = [];
    try { ds = JSON.parse(localStorage.getItem("products")) || []; } catch (e) {}
    var ketQua = [];
    layGio().forEach(function (d) {
        var sp = ds.filter(function (p) { return p.id === d.id; })[0];
        if (sp) {
            ketQua.push({
                id: sp.id, name: sp.name, image: sp.image, price: sp.price,
                stock: sp.stock, qty: d.qty, thanhTien: sp.price * d.qty
            });
        }
    });
    return ketQua;
}

function tinhTongTien() {
    return layChiTietGio().reduce(function (tong, d) { return tong + d.thanhTien; }, 0);
}

/* Đổi số lượng. qty <= 0 thì xóa. Không vượt quá tồn kho. */
function doiSoLuong(id, qty) {
    id = parseInt(id, 10);
    qty = parseInt(qty, 10);
    if (isNaN(id) || isNaN(qty)) { return false; }
    if (qty < 1) { return xoaKhoiGio(id); }
    var ct = layChiTietGio().filter(function (d) { return d.id === id; })[0];
    if (ct && ct.stock !== undefined && qty > ct.stock) { qty = ct.stock; }
    var gio = layGio();
    var dong = gio.filter(function (d) { return d.id === id; })[0];
    if (!dong) { return false; }
    dong.qty = qty;
    luuGio(gio);
    return true;
}

function xoaKhoiGio(id) {
    id = parseInt(id, 10);
    var gio = layGio();
    var moi = gio.filter(function (d) { return d.id !== id; });
    if (moi.length === gio.length) { return false; }
    luuGio(moi);
    return true;
}

/* Tạo HTML bảng giỏ hàng (tách riêng để dễ kiểm tra) */
function taoHtmlGio() {
    var ds = layChiTietGio();
    if (ds.length === 0) {
        return '<div class="text-center py-5">' +
               '<p class="fs-5">Giỏ hàng của bạn đang trống.</p>' +
               '<a href="sanpham.html" class="btn btn-orange">Tiếp tục mua hàng</a></div>';
    }
    var h = '<div class="table-responsive"><table class="table align-middle">' +
            '<thead><tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th><th></th></tr></thead><tbody>';
    ds.forEach(function (d) {
        h += '<tr data-id="' + d.id + '">' +
             '<td><img src="' + thoatHtml(d.image) + '" alt="' + thoatHtml(d.name) + '" class="cart-img me-2">' + thoatHtml(d.name) + '</td>' +
             '<td>' + dinhDangGia(d.price) + '</td>' +
             '<td><div class="input-group input-group-sm cart-qty">' +
             '<button type="button" class="btn btn-outline-secondary btn-giam" data-id="' + d.id + '">-</button>' +
             '<input type="text" class="form-control text-center o-so-luong" data-id="' + d.id + '" value="' + d.qty + '" aria-label="Số lượng">' +
             '<button type="button" class="btn btn-outline-secondary btn-tang" data-id="' + d.id + '">+</button>' +
             '</div></td>' +
             '<td class="fw-bold price-new">' + dinhDangGia(d.thanhTien) + '</td>' +
             '<td><button type="button" class="btn btn-sm btn-outline-danger btn-xoa" data-id="' + d.id + '">Xóa</button></td>' +
             '</tr>';
    });
    h += '</tbody></table></div>' +
         '<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">' +
         '<a href="sanpham.html" class="btn btn-outline-secondary">Tiếp tục mua hàng</a>' +
         '<div class="text-end"><p class="fs-5 mb-2">Tổng tiền: <strong class="price-new">' + dinhDangGia(tinhTongTien()) + '</strong></p>' +
         '<a href="thanhtoan.html" class="btn btn-orange">Thanh toán</a></div></div>';
    return h;
}

function hienGioHang() {
    var vung = document.getElementById("cart-content");
    if (vung) { vung.innerHTML = taoHtmlGio(); }
}

/* Gắn sự kiện một lần cho cả vùng giỏ hàng (bấm +, -, xóa, nhập số) */
function khoiTaoGioHang() {
    var vung = document.getElementById("cart-content");
    if (!vung) { return; }
    vung.addEventListener("click", function (e) {
        var nut = e.target;
        var id = nut.getAttribute("data-id");
        if (!id) { return; }
        var hienTai = (layGio().filter(function (d) { return d.id === parseInt(id, 10); })[0] || {}).qty || 0;
        if (nut.classList.contains("btn-tang")) { doiSoLuong(id, hienTai + 1); }
        else if (nut.classList.contains("btn-giam")) { doiSoLuong(id, hienTai - 1); }
        else if (nut.classList.contains("btn-xoa")) { xoaKhoiGio(id); }
        else { return; }
        hienGioHang();
    });
    vung.addEventListener("change", function (e) {
        if (e.target.classList.contains("o-so-luong")) {
            var v = parseInt(e.target.value, 10);
            doiSoLuong(e.target.getAttribute("data-id"), isNaN(v) ? 1 : v);
            hienGioHang();
        }
    });
    hienGioHang();
}