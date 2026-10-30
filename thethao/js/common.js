/**
 * SportPro Store - Phần B
 * Cập nhật số lượng giỏ hàng, thông tin thành viên và chức năng đăng xuất.
 *
 * Hợp đồng dữ liệu chung:
 * - users:       [{ fullname, username, ... }]
 * - currentUser: JSON.stringify(username)
 * - cart:        [{ id, qty }]
 *
 * Sử dụng LocalStorage cho bài tập frontend, không phải xác thực thực tế.
 */
(function () {
    'use strict';

    const STORAGE_KEYS = {
        USERS: 'users',
        CURRENT_USER: 'currentUser',
        CART: 'cart'
    };

    // Đọc LocalStorage an toàn, tránh lỗi khi dữ liệu bị xóa hoặc không hợp lệ.
    function readStorage(key, fallback) {
        try {
            const raw = localStorage.getItem(key);

            if (raw === null) {
                return fallback;
            }

            const value = JSON.parse(raw);
            return value === null ? fallback : value;
        } catch (error) {
            return fallback;
        }
    }

    function getCurrentUsername() {
        const username = readStorage(STORAGE_KEYS.CURRENT_USER, '');
        return typeof username === 'string' ? username : '';
    }

    // Nếu tài khoản có họ tên thì ưu tiên hiển thị họ tên trên navbar.
    function getDisplayName(username) {
        const users = readStorage(STORAGE_KEYS.USERS, []);

        if (!Array.isArray(users)) {
            return username;
        }

        const account = users.find(function (user) {
            return user && typeof user.username === 'string' &&
                user.username.toLowerCase() === username.toLowerCase();
        });

        return account && typeof account.fullname === 'string' && account.fullname.trim()
            ? account.fullname.trim()
            : username;
    }

    function getCartQuantity() {
        const cart = readStorage(STORAGE_KEYS.CART, []);

        if (!Array.isArray(cart)) {
            return 0;
        }

        return cart.reduce(function (total, item) {
            const quantity = Number(item && item.qty);

            if (!Number.isSafeInteger(quantity) || quantity <= 0) {
                return total;
            }

            return total + quantity;
        }, 0);
    }

    // Cập nhật badge có ID cart-count từ mẫu navbar của thành viên A.
    function updateCartCount() {
        const quantity = getCartQuantity();
        const cartBadges = document.querySelectorAll('#cart-count');

        cartBadges.forEach(function (badge) {
            badge.textContent = String(quantity);
            badge.setAttribute('aria-label', quantity + ' sản phẩm trong giỏ hàng');
        });
    }

    function createLink(text, href, className) {
        const link = document.createElement('a');
        link.href = href;
        link.className = className;
        link.textContent = text;
        return link;
    }

    function createLoginControl() {
        // Trang chủ có modal đăng nhập; các trang còn lại dẫn đến dangnhap.html.
        if (!document.getElementById('loginModal')) {
            return createLink('Đăng nhập', 'dangnhap.html', 'btn btn-orange btn-sm');
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-orange btn-sm';
        button.textContent = 'Đăng nhập';
        button.setAttribute('data-bs-toggle', 'modal');
        button.setAttribute('data-bs-target', '#loginModal');
        return button;
    }

    // Đọc currentUser để hiển thị trạng thái tài khoản trên mọi trang.
    function updateUserArea() {
        const userArea = document.getElementById('user-area');

        if (!userArea) {
            return;
        }

        const username = getCurrentUsername();
        userArea.replaceChildren();

        if (!username) {
            const loginControl = createLoginControl();
            const registerLink = createLink(
                'Đăng ký',
                'dangky.html',
                'btn btn-outline-secondary btn-sm'
            );

            userArea.append(loginControl, registerLink);
            return;
        }

        const greeting = document.createElement('span');
        greeting.className = 'small fw-semibold align-self-center';
        greeting.textContent = 'Xin chào, ' + getDisplayName(username);

        const logoutButton = document.createElement('button');
        logoutButton.type = 'button';
        logoutButton.className = 'btn btn-outline-secondary btn-sm';
        logoutButton.textContent = 'Đăng xuất';
        logoutButton.addEventListener('click', dangXuat);

        userArea.append(greeting, logoutButton);
    }

    function dangXuat() {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(''));
        updateUserArea();
        window.dispatchEvent(new Event('sportpro:auth-change'));
    }

    function refreshNavbar() {
        updateCartCount();
        updateUserArea();
    }

    // Các hàm dùng chung cho các thành viên khác gọi nếu cần.
    window.dangXuat = dangXuat;
    window.updateCartCount = updateCartCount;
    window.updateUserArea = updateUserArea;
    window.refreshNavbar = refreshNavbar;

    document.addEventListener('DOMContentLoaded', refreshNavbar);

    // Đồng bộ khi LocalStorage thay đổi từ tab khác.
    window.addEventListener('storage', function (event) {
        if (event.key === STORAGE_KEYS.CART ||
            event.key === STORAGE_KEYS.CURRENT_USER ||
            event.key === STORAGE_KEYS.USERS || event.key === null) {
            refreshNavbar();
        }
    });

    // Cùng tab: auth.js phát auth-change sau khi đăng nhập.
    window.addEventListener('sportpro:auth-change', updateUserArea);

    // Cùng tab: cart.js có thể phát cart-change sau khi thêm/xóa/sửa giỏ.
    window.addEventListener('sportpro:cart-change', updateCartCount);
})();
