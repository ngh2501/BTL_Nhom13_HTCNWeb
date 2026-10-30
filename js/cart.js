/* cart.js - Thành viên C: giỏ hàng
   Key LocalStorage: cart = [{ id, qty }]  (tên và giá lấy lại từ products) */

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
    /* Báo cho navbar (common.js của B) cập nhật số lượng trên biểu tượng giỏ hàng */
    if (typeof window !== "undefined" && typeof Event === "function") {
        window.dispatchEvent(new Event("sportpro:cart-change"));
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

/* ===================== THANH TOÁN (thanhtoan.html) ===================== */

var PHI_VAN_CHUYEN = 30000;
var MIEN_PHI_TU = 500000;
var TEN_THANH_TOAN = {
    cod: "Thanh toán khi nhận hàng (COD)",
    bank: "Chuyển khoản ngân hàng",
    wallet: "Ví điện tử"
};

/* B lưu currentUser dạng JSON.stringify(username), ví dụ "\"huy123\"" nên phải JSON.parse */
function layTenDangNhap() {
    var raw = localStorage.getItem("currentUser");
    if (!raw) { return ""; }
    try {
        var v = JSON.parse(raw);
        return typeof v === "string" ? v : "";
    } catch (e) {
        return raw;
    }
}

/* Trả về tài khoản đang đăng nhập (lấy từ users), hoặc null nếu chưa đăng nhập */
function layNguoiDung() {
    var ten = layTenDangNhap();
    if (!ten) { return null; }
    var ds = [];
    try { ds = JSON.parse(localStorage.getItem("users")) || []; } catch (e) {}
    var u = ds.filter(function (x) { return x && String(x.username).toLowerCase() === ten.toLowerCase(); })[0];
    return u || { username: ten };
}

function phiVanChuyen(tienHang) {
    return (tienHang <= 0 || tienHang >= MIEN_PHI_TU) ? 0 : PHI_VAN_CHUYEN;
}

/* Kiểm tra form thanh toán, trả về object lỗi (rỗng = hợp lệ) */
function kiemTraThanhToan(v) {
    var loi = {};
    if (!/^\p{Lu}\p{L}*(?:\s+\p{Lu}\p{L}*)+$/u.test(v.receiver)) {
        loi.receiver = "Cần ít nhất 2 từ, mỗi từ viết hoa chữ cái đầu.";
    }
    if (!/^(09|03|07|06|05|04)\d{8}$/.test(v.phone)) {
        loi.phone = "Phải có 10 số, bắt đầu bằng 09, 03, 07, 06, 05 hoặc 04.";
    }
    if (v.address.length < 5) {
        loi.address = "Vui lòng nhập địa chỉ nhận hàng (ít nhất 5 ký tự).";
    }
    if (!TEN_THANH_TOAN[v.payment]) {
        loi.payment = "Vui lòng chọn hình thức thanh toán.";
    }
    return loi;
}

function taoMaDon() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return "DH" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + Math.floor(1000 + Math.random() * 9000);
}

/* Tạo đơn hàng từ giỏ, lưu vào orders và xóa giỏ. Trả về đơn, hoặc null nếu giỏ trống. */
function datHang(tt) {
    var ds = layChiTietGio();
    if (ds.length === 0) { return null; }
    var tienHang = ds.reduce(function (t, d) { return t + d.thanhTien; }, 0);
    var don = {
        orderId: taoMaDon(),
        username: layTenDangNhap(),
        items: ds.map(function (d) { return { id: d.id, name: d.name, price: d.price, qty: d.qty }; }),
        total: tienHang + phiVanChuyen(tienHang),
        receiver: tt.receiver,
        phone: tt.phone,
        address: tt.address,
        payment: tt.payment,
        date: new Date().toISOString()
    };
    var orders = [];
    try { orders = JSON.parse(localStorage.getItem("orders")) || []; } catch (e) {}
    orders.push(don);
    localStorage.setItem("orders", JSON.stringify(orders));
    luuGio([]);
    return don;
}

function hienThongBaoThanhToan(noiDung, nutHref, nutChu) {
    var tb = document.getElementById("checkout-notice");
    tb.innerHTML = '<p class="fs-5">' + noiDung + '</p><a href="' + nutHref + '" class="btn btn-orange">' + nutChu + '</a>';
    tb.classList.remove("d-none");
    document.getElementById("checkout-main").classList.add("d-none");
}

function hienTomTatDon() {
    var ds = layChiTietGio();
    var tienHang = ds.reduce(function (t, d) { return t + d.thanhTien; }, 0);
    var phi = phiVanChuyen(tienHang);
    var h = '<ul class="list-unstyled mb-3">';
    ds.forEach(function (d) {
        h += '<li class="d-flex justify-content-between gap-3 border-bottom py-2">' +
             '<span>' + thoatHtml(d.name) + ' <span class="text-muted">× ' + d.qty + '</span></span>' +
             '<span class="text-nowrap">' + dinhDangGia(d.thanhTien) + '</span></li>';
    });
    h += '</ul>' +
         '<div class="d-flex justify-content-between mb-1"><span>Tạm tính</span><span>' + dinhDangGia(tienHang) + '</span></div>' +
         '<div class="d-flex justify-content-between mb-2"><span>Phí vận chuyển</span><span>' +
         (phi === 0 ? "Miễn phí" : dinhDangGia(phi)) + '</span></div>' +
         '<div class="d-flex justify-content-between fs-5 fw-bold border-top pt-2"><span>Tổng thanh toán</span>' +
         '<span class="price-new">' + dinhDangGia(tienHang + phi) + '</span></div>' +
         (phi > 0 ? '<p class="small text-muted mt-2 mb-0">Mua thêm ' + dinhDangGia(MIEN_PHI_TU - tienHang) + ' để được miễn phí vận chuyển.</p>' : '') +
         '<a href="giohang.html" class="btn btn-outline-secondary btn-sm mt-3">&laquo; Sửa giỏ hàng</a>';
    document.getElementById("order-summary").innerHTML = h;
}

function hienDonThanhCong(don) {
    document.getElementById("checkout-main").classList.add("d-none");
    var h = '<div class="text-center mb-4"><h2 class="h3 fw-bold price-new">Đặt hàng thành công!</h2>' +
            '<p class="mb-0">Cảm ơn bạn đã mua sắm tại SportPro. Mã đơn hàng của bạn là <strong>' + thoatHtml(don.orderId) + '</strong>.</p></div>' +
            '<div class="row justify-content-center"><div class="col-lg-8">' +
            '<table class="table"><tbody>' +
            '<tr><th scope="row">Người nhận</th><td>' + thoatHtml(don.receiver) + '</td></tr>' +
            '<tr><th scope="row">Điện thoại</th><td>' + thoatHtml(don.phone) + '</td></tr>' +
            '<tr><th scope="row">Địa chỉ</th><td>' + thoatHtml(don.address) + '</td></tr>' +
            '<tr><th scope="row">Thanh toán</th><td>' + thoatHtml(TEN_THANH_TOAN[don.payment]) + '</td></tr>' +
            '<tr><th scope="row">Ngày đặt</th><td>' + new Date(don.date).toLocaleString("vi-VN") + '</td></tr>' +
            '</tbody></table>' +
            '<table class="table align-middle"><thead><tr><th>Sản phẩm</th><th class="text-end">Số lượng</th><th class="text-end">Thành tiền</th></tr></thead><tbody>';
    don.items.forEach(function (d) {
        h += '<tr><td>' + thoatHtml(d.name) + '</td><td class="text-end">' + d.qty + '</td><td class="text-end">' + dinhDangGia(d.price * d.qty) + '</td></tr>';
    });
    h += '</tbody><tfoot><tr><th colspan="2">Tổng thanh toán (đã gồm phí vận chuyển)</th><th class="text-end price-new">' + dinhDangGia(don.total) + '</th></tr></tfoot></table>' +
         '<div class="d-flex justify-content-center gap-2"><a href="index.html" class="btn btn-orange">Về trang chủ</a>' +
         '<a href="sanpham.html" class="btn btn-outline-secondary">Tiếp tục mua sắm</a></div></div></div>';
    var vung = document.getElementById("checkout-success");
    vung.innerHTML = h;
    vung.classList.remove("d-none");
}

function khoiTaoThanhToan() {
    var form = document.getElementById("checkout-form");
    if (!form) { return; }

    var nguoiDung = layNguoiDung();
    if (!nguoiDung) {
        hienThongBaoThanhToan("Bạn cần đăng nhập để thanh toán.", "dangnhap.html", "Đăng nhập");
        return;
    }
    if (layChiTietGio().length === 0) {
        hienThongBaoThanhToan("Giỏ hàng của bạn đang trống, chưa có gì để thanh toán.", "sanpham.html", "Tiếp tục mua hàng");
        return;
    }

    /* Điền sẵn thông tin từ tài khoản */
    document.getElementById("receiver").value = nguoiDung.fullname || "";
    document.getElementById("phone").value = nguoiDung.phone || "";
    document.getElementById("address").value = nguoiDung.address || "";
    hienTomTatDon();
    document.getElementById("checkout-main").classList.remove("d-none");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!layNguoiDung()) { location.href = "dangnhap.html"; return; }
        var chon = form.querySelector('input[name="payment"]:checked');
        var v = {
            receiver: document.getElementById("receiver").value.trim().replace(/\s+/g, " "),
            phone: document.getElementById("phone").value.trim(),
            address: document.getElementById("address").value.trim(),
            payment: chon ? chon.value : ""
        };
        var loi = kiemTraThanhToan(v);
        ["receiver", "phone", "address", "payment"].forEach(function (k) {
            var o = document.getElementById(k) || document.getElementById("pay-cod");
            var vungLoi = document.getElementById("error-" + k);
            if (k !== "payment") { o.classList.toggle("is-invalid", !!loi[k]); }
            vungLoi.textContent = loi[k] || "";
            vungLoi.classList.toggle("d-block", !!loi[k]);
        });
        if (Object.keys(loi).length) {
            var dau = form.querySelector(".is-invalid");
            if (dau) { dau.focus(); }
            return;
        }
        var don = datHang(v);
        if (!don) { location.href = "giohang.html"; return; }
        hienDonThanhCong(don);
        window.scrollTo(0, 0);
    });
}