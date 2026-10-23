/* data.js - DỮ LIỆU TẠM của C để test giỏ hàng. A sẽ thay bằng bản đầy đủ (cùng cấu trúc). */
if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify([
        { id: 1, name: "Bóng đá Động Lực UHV 2.07", category: "bongda", brand: "Động Lực", price: 450000, oldPrice: 500000, discount: 10, image: "images/products/bong1.jpg", desc: "Bóng đá số 5", stock: 20 },
        { id: 2, name: "Vợt cầu lông Yonex Astrox 77", category: "caulong", brand: "Yonex", price: 2350000, oldPrice: 2800000, discount: 16, image: "images/products/vot1.jpg", desc: "Vợt cầu lông", stock: 8 },
        { id: 3, name: "Tạ tay cao su 5kg (đôi)", category: "tapluyen", brand: "Kettler", price: 380000, oldPrice: 420000, discount: 10, image: "images/products/ta1.jpg", desc: "Tạ tay tập gym", stock: 15 },
        { id: 4, name: "Thảm yoga TPE 6mm", category: "tapluyen", brand: "Adidas", price: 290000, oldPrice: 350000, discount: 17, image: "images/products/tham1.jpg", desc: "Thảm yoga", stock: 30 }
    ]));
}