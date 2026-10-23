// cart.js - Quản lý giỏ hàng (Dữ liệu lưu dạng: [{ id, qty }])

// 1. Lấy danh sách giỏ hàng từ LocalStorage (trả về mảng rỗng nếu chưa có)
function layGio() {
    try {
        var gio = JSON.parse(localStorage.getItem("cart"));
        return Array.isArray(gio) ? gio : [];
    } catch (e) {
        return [];
    }
}

// 2. Lưu giỏ hàng và cập nhật số lượng hiển thị trên thanh menu
function luuGio(gio) {
    localStorage.setItem("cart", JSON.stringify(gio));
    
    // Gọi hàm cập nhật icon giỏ hàng (nếu bạn B đã viết)
    if (typeof capNhatSoLuongGio === "function") {
        capNhatSoLuongGio();
    }
}

// 3. Thêm sản phẩm vào giỏ (dùng khi bấm nút "Thêm vào giỏ hàng")
// Trả về true: thành công | false: lỗi hoặc hết hàng
function themVaoGio(id, qty) {
    id = parseInt(id, 10);
    qty = (qty === undefined) ? 1 : parseInt(qty, 10);
    
    // Kiểm tra dữ liệu đầu vào hợp lệ
    if (isNaN(id) || isNaN(qty) || qty < 1) {
        return false;
    }

    // Kiểm tra sản phẩm còn hàng trong kho hay không
    var sanPham = null;
    try {
        var ds = JSON.parse(localStorage.getItem("products")) || [];
        sanPham = ds.filter(function (p) { return p.id === id; })[0] || null;
    } catch (e) {}
    
    if (sanPham && sanPham.stock !== undefined && sanPham.stock < 1) {
        return false; // Hết hàng
    }

    var gio = layGio();
    var dong = gio.filter(function (d) { return d.id === id; })[0];
    
    if (dong) {
        dong.qty += qty; // Đã có trong giỏ -> tăng số lượng
    } else {
        gio.push({ id: id, qty: qty }); // Chưa có -> thêm món mới
        dong = gio[gio.length - 1];
    }
    
    // Giới hạn: Không cho mua vượt quá số lượng trong kho
    if (sanPham && sanPham.stock !== undefined && dong.qty > sanPham.stock) {
        dong.qty = sanPham.stock;
    }

    luuGio(gio);
    return true;
}