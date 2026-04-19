// ===================== بيانات وهمية (بدون Supabase) =====================
let products = [
    { id: 1, name: 'لابتوب ايسر', category_id: 1, barcode: '123456789012', stock_quantity: 15, price: 2500 },
    { id: 2, name: 'هاتف ايفون', category_id: 1, barcode: '123456789013', stock_quantity: 8, price: 3200 },
    { id: 3, name: 'تي شيرت قطني', category_id: 2, barcode: '123456789014', stock_quantity: 50, price: 75 },
    { id: 4, name: 'جبنة شيدر', category_id: 3, barcode: '123456789015', stock_quantity: 100, price: 12 },
    { id: 5, name: 'احمر شفاه', category_id: 4, barcode: '123456789016', stock_quantity: 30, price: 35 },
];

let suppliers = [
    { id: 1, name: 'الرائد للإلكترونيات', phone: '0555123456', email: 'info@alraed.com', address: 'الرياض' },
    { id: 2, name: 'الملابس العصرية', phone: '0555234567', email: 'sales@moderncloth.com', address: 'جدة' },
];

let categories = [
    { id: 1, name: 'الكترونيات' },
    { id: 2, name: 'ملابس' },
    { id: 3, name: 'مواد غذائية' },
    { id: 4, name: 'مستحضرات تجميل' },
];

let orders = [];

let nextProductId = 6;
let nextSupplierId = 3;
let nextOrderId = 1;

// ===================== المتغيرات العامة =====================
let currentUser = null;
let currentPage = 'dashboard';

// ===================== دوال تسجيل الدخول =====================
function login(username, password) {
    if (username === 'admin' && password === 'admin123') {
        currentUser = { username: 'admin', role: 'Manager' };
        localStorage.setItem('user', JSON.stringify(currentUser));
        return true;
    }
    return false;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('mainScreen').classList.remove('active');
}

function checkAuth() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');
        document.getElementById('userRole').textContent = currentUser.role;
        loadPage('dashboard');
    }
}

// ===================== تحميل البيانات =====================
function loadDashboard() {
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.stock_quantity < 10).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
    const totalSuppliers = suppliers.length;
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('lowStock').textContent = lowStock;
    document.getElementById('totalValue').textContent = totalValue.toLocaleString() + ' ر.س';
    document.getElementById('totalSuppliers').textContent = totalSuppliers;
}

function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    
    if (products.length > 0) {
        products.forEach((product, idx) => {
            const category = categories.find(c => c.id === product.category_id);
            const row = tbody.insertRow();
            row.insertCell(0).textContent = idx + 1;
            row.insertCell(1).textContent = product.name;
            row.insertCell(2).textContent = product.barcode || '-';
            row.insertCell(3).innerHTML = `<span class="${product.stock_quantity < 10 ? 'low-stock' : ''}">${product.stock_quantity}</span>`;
            row.insertCell(4).textContent = product.price.toLocaleString() + ' ر.س';
            const actionsCell = row.insertCell(5);
            actionsCell.innerHTML = `
                <button class="edit-btn" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
            `;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">لا توجد منتجات</td></tr>';
    }
    
    // تعبئة قائمة التصنيفات في المودال
    const categorySelect = document.getElementById('productCategory');
    categorySelect.innerHTML = '<option value="">اختر التصنيف</option>';
    categories.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
}

function loadSuppliers() {
    const grid = document.getElementById('suppliersGrid');
    grid.innerHTML = '';
    
    if (suppliers.length > 0) {
        suppliers.forEach(supplier => {
            const card = document.createElement('div');
            card.className = 'supplier-card';
            card.innerHTML = `
                <h3>${supplier.name}</h3>
                ${supplier.phone ? `<p><i class="fas fa-phone"></i> ${supplier.phone}</p>` : ''}
                ${supplier.email ? `<p><i class="fas fa-envelope"></i> ${supplier.email}</p>` : ''}
                ${supplier.address ? `<p><i class="fas fa-map-marker-alt"></i> ${supplier.address}</p>` : ''}
                <div class="supplier-card-actions">
                    <button class="edit-btn" onclick="editSupplier(${supplier.id})"><i class="fas fa-edit"></i> تعديل</button>
                    <button class="delete-btn" onclick="deleteSupplier(${supplier.id})"><i class="fas fa-trash"></i> حذف</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } else {
        grid.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:40px;">لا توجد موردين</div>';
    }
    
    // تعبئة قائمة الموردين في مودال الطلبات
    const orderSupplierSelect = document.getElementById('orderSupplier');
    orderSupplierSelect.innerHTML = '<option value="">اختر المورد</option>';
    suppliers.forEach(sup => {
        orderSupplierSelect.innerHTML += `<option value="${sup.id}">${sup.name}</option>`;
    });
}

function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';
    
    if (orders.length > 0) {
        orders.forEach((order, idx) => {
            const supplier = suppliers.find(s => s.id === order.supplier_id);
            const row = tbody.insertRow();
            row.insertCell(0).textContent = idx + 1;
            row.insertCell(1).textContent = supplier?.name || 'غير محدد';
            row.insertCell(2).textContent = order.date;
            row.insertCell(3).textContent = order.total_amount.toLocaleString() + ' ر.س';
            row.insertCell(4).innerHTML = `<span style="background:#854d0e; padding:4px 12px; border-radius:20px;">${order.status === 'pending' ? 'قيد الانتظار' : order.status}</span>`;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">لا توجد طلبات شراء</td></tr>';
    }
}

function loadReports() {
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
    const totalOrders = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const lowStock = products.filter(p => p.stock_quantity < 10).length;
    
    const reportsGrid = document.getElementById('reportsGrid');
    reportsGrid.innerHTML = `
        <div class="report-card">
            <h3>📊 ملخص المخزون</h3>
            <div class="report-item"><span>إجمالي المنتجات:</span><span>${products.length}</span></div>
            <div class="report-item"><span>القيمة الإجمالية للمخزون:</span><span>${totalValue.toLocaleString()} ر.س</span></div>
            <div class="report-item"><span>منتجات منخفضة المخزون:</span><span class="low-stock">${lowStock}</span></div>
        </div>
        <div class="report-card">
            <h3>💰 ملخص المشتريات</h3>
            <div class="report-item"><span>إجمالي طلبات الشراء:</span><span>${orders.length}</span></div>
            <div class="report-item"><span>إجمالي قيمة المشتريات:</span><span>${totalOrders.toLocaleString()} ر.س</span></div>
        </div>
    `;
}

// ===================== عمليات المنتجات =====================
function addProduct(productData) {
    const newProduct = {
        id: nextProductId++,
        ...productData
    };
    products.push(newProduct);
    loadProducts();
    loadDashboard();
    return true;
}

function updateProduct(id, productData) {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...productData };
        loadProducts();
        loadDashboard();
        return true;
    }
    return false;
}

function deleteProduct(id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        products = products.filter(p => p.id !== id);
        loadProducts();
        loadDashboard();
    }
}

// ===================== عمليات الموردين =====================
function addSupplier(supplierData) {
    const newSupplier = {
        id: nextSupplierId++,
        ...supplierData
    };
    suppliers.push(newSupplier);
    loadSuppliers();
    loadDashboard();
    return true;
}

function updateSupplier(id, supplierData) {
    const index = suppliers.findIndex(s => s.id === id);
    if (index !== -1) {
        suppliers[index] = { ...suppliers[index], ...supplierData };
        loadSuppliers();
        loadDashboard();
        return true;
    }
    return false;
}

function deleteSupplier(id) {
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
        suppliers = suppliers.filter(s => s.id !== id);
        loadSuppliers();
        loadDashboard();
    }
}

// ===================== عمليات طلبات الشراء =====================
function addOrder(orderData) {
    const newOrder = {
        id: nextOrderId++,
        ...orderData,
        date: new Date().toLocaleDateString('ar-SA'),
        status: 'pending'
    };
    orders.push(newOrder);
    loadOrders();
    return true;
}

// ===================== التنقل بين الصفحات =====================
function loadPage(page) {
    currentPage = page;
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(`${page}Page`).classList.add('active-page');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.nav-btn[data-page="${page}"]`).classList.add('active');
    
    if (page === 'dashboard') loadDashboard();
    else if (page === 'products') loadProducts();
    else if (page === 'suppliers') loadSuppliers();
    else if (page === 'orders') loadOrders();
    else if (page === 'reports') loadReports();
}

// ===================== أحداث الصفحة =====================
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (login(username, password)) {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');
        document.getElementById('userRole').textContent = currentUser.role;
        loadPage('dashboard');
    } else {
        errorDiv.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
    }
});

document.getElementById('logoutBtn').addEventListener('click', logout);

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        loadPage(btn.dataset.page);
    });
});

// مودال المنتجات
const productModal = document.getElementById('productModal');
let editingProductId = null;

document.getElementById('addProductBtn').addEventListener('click', () => {
    editingProductId = null;
    document.getElementById('productModalTitle').textContent = 'إضافة منتج جديد';
    document.getElementById('productForm').reset();
    productModal.classList.add('active');
});

document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const productData = {
        name: document.getElementById('productName').value,
        category_id: parseInt(document.getElementById('productCategory').value),
        barcode: document.getElementById('productBarcode').value,
        stock_quantity: parseInt(document.getElementById('productStock').value),
        price: parseFloat(document.getElementById('productPrice').value)
    };
    
    let success;
    if (editingProductId) {
        success = updateProduct(editingProductId, productData);
    } else {
        success = addProduct(productData);
    }
    
    if (success) {
        productModal.classList.remove('active');
    }
});

// مودال الموردين
const supplierModal = document.getElementById('supplierModal');
let editingSupplierId = null;

document.getElementById('addSupplierBtn').addEventListener('click', () => {
    editingSupplierId = null;
    document.getElementById('supplierModalTitle').textContent = 'إضافة مورد جديد';
    document.getElementById('supplierForm').reset();
    supplierModal.classList.add('active');
});

document.getElementById('supplierForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const supplierData = {
        name: document.getElementById('supplierName').value,
        phone: document.getElementById('supplierPhone').value,
        email: document.getElementById('supplierEmail').value,
        address: document.getElementById('supplierAddress').value
    };
    
    let success;
    if (editingSupplierId) {
        success = updateSupplier(editingSupplierId, supplierData);
    } else {
        success = addSupplier(supplierData);
    }
    
    if (success) {
        supplierModal.classList.remove('active');
    }
});

// مودال طلبات الشراء
const orderModal = document.getElementById('orderModal');

document.getElementById('addOrderBtn').addEventListener('click', () => {
    document.getElementById('orderForm').reset();
    orderModal.classList.add('active');
});

document.getElementById('orderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const orderData = {
        supplier_id: parseInt(document.getElementById('orderSupplier').value),
        total_amount: parseFloat(document.getElementById('orderAmount').value),
    };
    
    const success = addOrder(orderData);
    if (success) {
        orderModal.classList.remove('active');
    }
});

// إغلاق المودالات
document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
        productModal.classList.remove('active');
        supplierModal.classList.remove('active');
        orderModal.classList.remove('active');
    });
});

// البحث في المنتجات
document.getElementById('searchProduct').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#productsTableBody tr');
    rows.forEach(row => {
        const name = row.cells[1]?.textContent.toLowerCase() || '';
        if (name.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// دوال عامة للـ HTML
window.editProduct = (id) => {
    const product = products.find(p => p.id === id);
    if (product) {
        editingProductId = id;
        document.getElementById('productModalTitle').textContent = 'تعديل منتج';
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category_id;
        document.getElementById('productBarcode').value = product.barcode || '';
        document.getElementById('productStock').value = product.stock_quantity;
        document.getElementById('productPrice').value = product.price;
        productModal.classList.add('active');
    }
};

window.editSupplier = (id) => {
    const supplier = suppliers.find(s => s.id === id);
    if (supplier) {
        editingSupplierId = id;
        document.getElementById('supplierModalTitle').textContent = 'تعديل مورد';
        document.getElementById('supplierName').value = supplier.name;
        document.getElementById('supplierPhone').value = supplier.phone || '';
        document.getElementById('supplierEmail').value = supplier.email || '';
        document.getElementById('supplierAddress').value = supplier.address || '';
        supplierModal.classList.add('active');
    }
};

window.deleteProduct = deleteProduct;
window.deleteSupplier = deleteSupplier;

// ===================== بدء التطبيق =====================
checkAuth();