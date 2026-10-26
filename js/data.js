
const defaultProducts = [
    {
        id: 1,
        name: "Bóng Đá Động Lực UHV 2.05 Chuẩn Thi Đấu",
        category: "bongda",
        brand: "Động Lực",
        price: 450000,
        oldPrice: 550000,
        discount: "-18%",
        image: "images/products/bongda1.jpg",
        desc: "Bóng đá số 5 vỏ PU cao cấp, độ nảy chuẩn thi đấu chuyên nghiệp, chống thấm nước tốt.",
        stock: 20
    },
    {
        id: 2,
        name: "Vợt Cầu Lông Yonex Astrox 88D Pro",
        category: "caulong",
        brand: "Yonex",
        price: 3200000,
        oldPrice: 3800000,
        discount: "-15%",
        image: "images/products/caulong1.jpg",
        desc: "Vợt cầu lông công nghệ Namd giúp tăng lực đập cầu, khung siêu nhẹ bền bỉ.",
        stock: 10
    },
    {
        id: 3,
        name: "Vợt Tennis Wilson Pro Staff 97 v13",
        category: "tennis",
        brand: "Wilson",
        price: 4900000,
        oldPrice: 5500000,
        discount: "-11%",
        image: "images/products/tennis1.jpg",
        desc: "Khung carbon đan mật độ cao cho khả năng kiểm soát bóng chuẩn xác từng đường đánh.",
        stock: 8
    },
    {
        id: 4,
        name: "Tạ Tay Cao Su Lõi Thép Khối 5kg",
        category: "tapluyen",
        brand: "Ziva",
        price: 250000,
        oldPrice: 300000,
        discount: "-16%",
        image: "images/products/tatay1.jpg",
        desc: "Tạ bọc cao su nguyên khối chống va đập sàn, tay cầm mạ crom chống gỉ sét.",
        stock: 30
    },
    {
        id: 5,
        name: "Thảm Tập Yoga Định Tuyến TPE 6mm",
        category: "tapluyen",
        brand: "Liforme",
        price: 350000,
        oldPrice: 450000,
        discount: "-22%",
        image: "images/products/tham-yoga.jpg",
        desc: "Chất liệu TPE thân thiện môi trường, chống trượt 2 mặt, có vạch định tuyến chuẩn.",
        stock: 25
    },
    {
        id: 6,
        name: "Đai Bó Gối Thể Thao Co Giãn 4 Chiều",
        category: "chaybo",
        brand: "Aolikes",
        price: 120000,
        oldPrice: 150000,
        discount: "-20%",
        image: "images/products/bogoi.jpg",
        desc: "Hỗ trợ cố định khớp gối khi chạy bộ và đá bóng, giảm nguy cơ chấn thương dây chằng.",
        stock: 50
    },
    {
        id: 7,
        name: "Găng Tay Thủ Môn Adidas Predator Pro",
        category: "bongda",
        brand: "Adidas",
        price: 1250000,
        oldPrice: 1500000,
        discount: "-17%",
        image: "images/products/gangtay.jpg",
        desc: "Mặt xốp Latex URG 2.0 bám dính bóng tối ưu trong mọi điều kiện thời tiết.",
        stock: 15
    },
    {
        id: 8,
        name: "Túi Đựng Vợt Cầu Lông Yonex 6 Ngăn",
        category: "caulong",
        brand: "Yonex",
        price: 850000,
        oldPrice: 1000000,
        discount: "-15%",
        image: "images/products/tuivot.jpg",
        desc: "Vải tráng PU chống thấm, có ngăn cách nhiệt bảo vệ dây vợt và ngăn để giày riêng.",
        stock: 12
    }
];

// Khởi tạo dữ liệu sản phẩm trong LocalStorage
function initProductsData() {
    if (!localStorage.getItem("products")) {
        localStorage.setItem("products", JSON.stringify(defaultProducts));
    }
}

// Chạy khởi tạo dữ liệu
initProductsData();
