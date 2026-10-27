/* SportPro Store - Phan B. Chi la demo LocalStorage, khong phai he thong xac thuc that. */
(function () {
  'use strict';
  const getUsers = () => { try { const users = JSON.parse(localStorage.getItem('users') || '[]'); return Array.isArray(users) ? users : []; } catch { return []; } };
  const regex = {
    username: /^[A-Za-z][A-Za-z0-9_]{2,19}$/,
    password: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/,
    fullname: /^\p{Lu}[\p{L}]*(?:\s+\p{Lu}[\p{L}]*)+$/u,
    phone: /^(09|03|07|06|05|04)\d{8}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  };
  function validBirthday(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const dob = new Date(value + 'T00:00:00');
    if (Number.isNaN(dob.valueOf()) || dob.getFullYear() !== +value.slice(0, 4) || dob.getMonth() + 1 !== +value.slice(5, 7) || dob.getDate() !== +value.slice(8, 10)) return false;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
    return age > 16 && age < 120;
  }
  function validate(v) {
    const e = {};
    if (!regex.fullname.test(v.fullname)) e.fullname = 'Cần ít nhất 2 từ, mỗi từ viết hoa chữ đầu.';
    if (!regex.username.test(v.username)) e.username = 'Bắt đầu bằng chữ, dài 3–20 ký tự; chỉ chữ, số, dấu _.';
    else if (getUsers().some(u => u.username?.toLowerCase() === v.username.toLowerCase())) e.username = 'Tên đăng nhập đã tồn tại.';
    if (!regex.password.test(v.password)) e.password = 'Từ 8 ký tự, có chữ hoa, số và ký tự đặc biệt; không có khoảng trắng.';
    if (v.confirmPassword !== v.password) e.confirmPassword = 'Nhập lại mật khẩu không khớp.';
    if (!validBirthday(v.birthday)) e.birthday = 'Ngày sinh hợp lệ và trên 16 tuổi.';
    if (!['nam','nu','khac'].includes(v.gender)) e.gender = 'Vui lòng chọn giới tính.';
    if (!v.address) e.address = 'Vui lòng nhập địa chỉ.';
    if (!regex.phone.test(v.phone)) e.phone = 'Phải có 10 số, bắt đầu bằng 09, 03, 07, 06, 05 hoặc 04.';
    if (!regex.email.test(v.email)) e.email = 'Email không hợp lệ.';
    return e;
  }
  function dangKy(data) {
    const v = Object.fromEntries(['fullname','username','password','confirmPassword','birthday','gender','address','phone','email'].map(k => [k,String(data[k] || '').trim()]));
    v.fullname = v.fullname.replace(/\s+/g, ' ');
    const errors = validate(v);
    if (Object.keys(errors).length) return {ok:false, errors};
    const {confirmPassword, ...user} = v;
    try { localStorage.setItem('users', JSON.stringify([...getUsers(),user])); return {ok:true,user}; }
    catch { return {ok:false,errors:{global:'Không thể lưu dữ liệu vào LocalStorage.'}}; }
  }
  // Hop dong A-B: ham nay bat buoc tra ve boolean.
  function dangNhap(username,password) {
    const user = getUsers().find(u => u.username?.toLowerCase() === String(username || '').trim().toLowerCase() && u.password === String(password || ''));
    if (!user) return false;
    try { localStorage.setItem('currentUser', JSON.stringify(user.username)); window.dispatchEvent(new Event('sportpro:auth-change')); return true; }
    catch {return false;}
  }
  function bindRegister() {
    const f = document.getElementById('register-form'); if (!f) return;
    const keys = ['fullname','username','password','confirmPassword','birthday','gender','address','phone','email'];
    f.addEventListener('submit', event => {
      event.preventDefault();
      const v = Object.fromEntries(keys.map(k=>[k, document.getElementById(k).value]));
      const r = dangKy(v);
      keys.forEach(k => {const el=document.getElementById(k), err=document.getElementById('error-'+k), msg=r.errors?.[k]||''; el.classList.toggle('is-invalid',!!msg); el.setAttribute('aria-invalid',String(!!msg)); err.textContent=msg;});
      const note=document.getElementById('register-notice');
      note.className='alert '+(r.ok?'alert-success':'alert-danger');
      note.textContent=r.ok?`Đăng ký thành công! Họ tên: ${r.user.fullname}; tên đăng nhập: ${r.user.username}; email: ${r.user.email}.`:r.errors?.global||'Vui lòng kiểm tra các ô đánh dấu đỏ.';
      if (r.ok) {f.reset();document.getElementById('login-after-register').classList.remove('d-none');}
      else document.querySelector('.is-invalid')?.focus();
    });
    keys.forEach(k => document.getElementById(k).addEventListener('input',()=> {const el=document.getElementById(k);el.classList.remove('is-invalid');document.getElementById('error-'+k).textContent='';}));
  }
  function bindLogin() {
    const f=document.getElementById('login-form');if(!f)return;
    f.addEventListener('submit',event=>{
      event.preventDefault();
      if(dangNhap(document.getElementById('login-username').value,document.getElementById('login-password').value)) window.location.href='index.html';
      else {const n=document.getElementById('login-message');n.className='alert alert-danger';n.textContent='Tên đăng nhập hoặc mật khẩu không đúng.';}
    });
  }
  window.dangNhap=dangNhap;
  window.dangKy=dangKy;
  window.SportProAuth={validate,validBirthday,getUsers};
  document.addEventListener('DOMContentLoaded',()=>{bindRegister();bindLogin();});
})();
