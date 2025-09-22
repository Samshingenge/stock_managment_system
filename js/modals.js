/**
 * Modal Management for Stock Management System
 */

let currentModal = null;

// Modal HTML templates
const modalTemplates = {
    product: `
        <div class="modal-overlay fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900" id="productModalTitle">Add Product</h3>
                        <button type="button" class="text-gray-400 hover:text-gray-600" onclick="closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <form id="productForm" class="px-6 py-4 space-y-4">
                    <div class="form-group">
                        <label class="form-label" for="productName">Product Name *</label>
                        <input type="text" id="productName" name="name" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="productSku">SKU</label>
                        <input type="text" id="productSku" name="sku" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="productCategory">Category</label>
                        <input type="text" id="productCategory" name="category" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="productDescription">Description</label>
                        <textarea id="productDescription" name="description" rows="3" class="form-input"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label" for="productUnitPrice">Unit Price *</label>
                            <input type="number" id="productUnitPrice" name="unit_price" step="0.01" min="0" class="form-input" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="productMinStock">Min Stock Level</label>
                            <input type="number" id="productMinStock" name="min_stock_level" min="0" class="form-input">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label" for="productCurrentStock">Current Stock</label>
                            <input type="number" id="productCurrentStock" name="current_stock" min="0" class="form-input">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="productStatus">Status</label>
                            <select id="productStatus" name="status" class="form-input form-select">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="discontinued">Discontinued</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="productSupplier">Supplier</label>
                        <select id="productSupplier" name="supplier_id" class="form-input form-select">
                            <option value="">Select Supplier</option>
                        </select>
                    </div>
                </form>
                
                <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="button" onclick="saveProduct()" id="saveProductBtn" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        Save Product
                    </button>
                </div>
            </div>
        </div>
    `,
    
    stockIn: `
        <div class="modal-overlay fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900">Stock In</h3>
                        <button type="button" class="text-gray-400 hover:text-gray-600" onclick="closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <form id="stockInForm" class="px-6 py-4 space-y-4">
                    <div class="form-group">
                        <label class="form-label" for="stockInProduct">Product *</label>
                        <select id="stockInProduct" name="product_id" class="form-input form-select" required>
                            <option value="">Select Product</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="stockInQuantity">Quantity *</label>
                        <input type="number" id="stockInQuantity" name="quantity" min="1" step="1" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="stockInUnitPrice">Unit Price *</label>
                        <input type="number" id="stockInUnitPrice" name="unit_price" step="0.01" min="0" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="stockInReference">Reference Number</label>
                        <input type="text" id="stockInReference" name="reference_number" class="form-input" placeholder="Invoice/PO Number">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="stockInNotes">Notes</label>
                        <textarea id="stockInNotes" name="notes" rows="3" class="form-input" placeholder="Additional notes..."></textarea>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-gray-700">Total Amount:</span>
                            <span id="stockInTotal" class="text-lg font-bold text-gray-900">$0.00</span>
                        </div>
                    </div>
                </form>
                
                <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="button" onclick="processStockIn()" id="processStockInBtn" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                        <i class="fas fa-arrow-up mr-2"></i>Process Stock In
                    </button>
                </div>
            </div>
        </div>
    `,
    
    stockOut: `
        <div class="modal-overlay fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900">Stock Out</h3>
                        <button type="button" class="text-gray-400 hover:text-gray-600" onclick="closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <form id="stockOutForm" class="px-6 py-4 space-y-4">
                    <div class="form-group">
                        <label class="form-label" for="stockOutProduct">Product *</label>
                        <select id="stockOutProduct" name="product_id" class="form-input form-select" required>
                            <option value="">Select Product</option>
                        </select>
                    </div>
                    
                    <div id="currentStockInfo" class="hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div class="flex items-center">
                            <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                            <span class="text-sm text-blue-700">
                                Current Stock: <span id="currentStockAmount" class="font-medium"></span> units
                            </span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="stockOutQuantity">Quantity *</label>
                        <input type="number" id="stockOutQuantity" name="quantity" min="1" step="1" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="stockOutUnitPrice">Unit Price *</label>
                        <input type="number" id="stockOutUnitPrice" name="unit_price" step="0.01" min="0" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="stockOutReference">Reference Number</label>
                        <input type="text" id="stockOutReference" name="reference_number" class="form-input" placeholder="Sales Order/Invoice Number">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="stockOutNotes">Notes</label>
                        <textarea id="stockOutNotes" name="notes" rows="3" class="form-input" placeholder="Additional notes..."></textarea>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-gray-700">Total Amount:</span>
                            <span id="stockOutTotal" class="text-lg font-bold text-gray-900">$0.00</span>
                        </div>
                    </div>
                </form>
                
                <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="button" onclick="processStockOut()" id="processStockOutBtn" class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
                        <i class="fas fa-arrow-down mr-2"></i>Process Stock Out
                    </button>
                </div>
            </div>
        </div>
    `,
    
    supplier: `
        <div class="modal-overlay fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900" id="supplierModalTitle">Add Supplier</h3>
                        <button type="button" class="text-gray-400 hover:text-gray-600" onclick="closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <form id="supplierForm" class="px-6 py-4 space-y-4">
                    <div class="form-group">
                        <label class="form-label" for="supplierName">Company Name *</label>
                        <input type="text" id="supplierName" name="name" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="supplierContact">Contact Person</label>
                        <input type="text" id="supplierContact" name="contact_person" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="supplierEmail">Email</label>
                        <input type="email" id="supplierEmail" name="email" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="supplierPhone">Phone</label>
                        <input type="tel" id="supplierPhone" name="phone" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="supplierAddress">Address</label>
                        <textarea id="supplierAddress" name="address" rows="3" class="form-input"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="supplierPaymentTerms">Payment Terms</label>
                        <input type="text" id="supplierPaymentTerms" name="payment_terms" class="form-input" placeholder="e.g., Net 30 Days">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="supplierStatus">Status</label>
                        <select id="supplierStatus" name="status" class="form-input form-select">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </form>
                
                <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="button" onclick="saveSupplier()" id="saveSupplierBtn" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        Save Supplier
                    </button>
                </div>
            </div>
        </div>
    `
};

// Open Product Modal
function openProductModal(productId = null) {
    const container = document.getElementById('modalContainer');
    container.innerHTML = modalTemplates.product;
    
    currentModal = 'product';
    
    // Populate suppliers dropdown
    populateSuppliersDropdown();
    
    // If editing existing product
    if (productId) {
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('saveProductBtn').textContent = 'Update Product';
        loadProductData(productId);
    }
    
    // Add event listeners
    document.getElementById('productUnitPrice').addEventListener('input', calculateProductValue);
    document.getElementById('productCurrentStock').addEventListener('input', calculateProductValue);
    
    // Show modal
    container.classList.remove('hidden');
    
    // Focus first input
    setTimeout(() => {
        document.getElementById('productName').focus();
    }, 100);
}

// Open Stock In Modal
function openStockInModal() {
    const container = document.getElementById('modalContainer');
    container.innerHTML = modalTemplates.stockIn;
    
    currentModal = 'stockIn';
    
    // Populate products dropdown
    populateProductsDropdown('stockInProduct');
    
    // Add event listeners
    document.getElementById('stockInQuantity').addEventListener('input', calculateStockInTotal);
    document.getElementById('stockInUnitPrice').addEventListener('input', calculateStockInTotal);
    document.getElementById('stockInProduct').addEventListener('change', updateStockInPrice);
    
    // Show modal
    container.classList.remove('hidden');
    
    // Focus first select
    setTimeout(() => {
        document.getElementById('stockInProduct').focus();
    }, 100);
}

// Open Stock Out Modal
function openStockOutModal() {
    const container = document.getElementById('modalContainer');
    container.innerHTML = modalTemplates.stockOut;
    
    currentModal = 'stockOut';
    
    // Populate products dropdown
    populateProductsDropdown('stockOutProduct');
    
    // Add event listeners
    document.getElementById('stockOutQuantity').addEventListener('input', calculateStockOutTotal);
    document.getElementById('stockOutUnitPrice').addEventListener('input', calculateStockOutTotal);
    document.getElementById('stockOutProduct').addEventListener('change', updateStockOutInfo);
    
    // Show modal
    container.classList.remove('hidden');
    
    // Focus first select
    setTimeout(() => {
        document.getElementById('stockOutProduct').focus();
    }, 100);
}

// Open Supplier Modal
function openSupplierModal(supplierId = null) {
    const container = document.getElementById('modalContainer');
    container.innerHTML = modalTemplates.supplier;
    
    currentModal = 'supplier';
    
    // If editing existing supplier
    if (supplierId) {
        document.getElementById('supplierModalTitle').textContent = 'Edit Supplier';
        document.getElementById('saveSupplierBtn').textContent = 'Update Supplier';
        loadSupplierData(supplierId);
    }
    
    // Show modal
    container.classList.remove('hidden');
    
    // Focus first input
    setTimeout(() => {
        document.getElementById('supplierName').focus();
    }, 100);
}

// Close Modal
function closeModal() {
    const container = document.getElementById('modalContainer');
    container.innerHTML = '';
    container.classList.add('hidden');
    currentModal = null;
}

// Populate dropdowns
function populateProductsDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select || !app.products) return;
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">Select Product</option>';
    
    // Add active products
    app.products
        .filter(product => product.status === 'active')
        .forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${product.sku || 'No SKU'})`;
            option.dataset.unitPrice = product.unit_price || 0;
            option.dataset.currentStock = product.current_stock || 0;
            select.appendChild(option);
        });
}

function populateSuppliersDropdown() {
    const select = document.getElementById('productSupplier');
    if (!select || !app.suppliers) return;
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">Select Supplier</option>';
    
    // Add active suppliers
    app.suppliers
        .filter(supplier => supplier.status === 'active')
        .forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            select.appendChild(option);
        });
}

// Load data for editing
async function loadProductData(productId) {
    try {
        const product = await stockAPI.getProduct(productId);
        if (!product) {
            showToast('Product not found', 'error');
            return;
        }
        
        const form = document.getElementById('productForm');
        populateForm(form, product);
        
        // Store product ID for updating
        form.dataset.productId = productId;
        
    } catch (error) {
        console.error('Error loading product data:', error);
        showToast('Failed to load product data', 'error');
    }
}

async function loadSupplierData(supplierId) {
    try {
        const supplier = await stockAPI.getSupplier(supplierId);
        if (!supplier) {
            showToast('Supplier not found', 'error');
            return;
        }
        
        const form = document.getElementById('supplierForm');
        populateForm(form, supplier);
        
        // Store supplier ID for updating
        form.dataset.supplierId = supplierId;
        
    } catch (error) {
        console.error('Error loading supplier data:', error);
        showToast('Failed to load supplier data', 'error');
    }
}

// Update functions for stock modals
function updateStockInPrice() {
    const select = document.getElementById('stockInProduct');
    const priceInput = document.getElementById('stockInUnitPrice');
    
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption && selectedOption.dataset.unitPrice) {
        priceInput.value = selectedOption.dataset.unitPrice;
        calculateStockInTotal();
    }
}

function updateStockOutInfo() {
    const select = document.getElementById('stockOutProduct');
    const priceInput = document.getElementById('stockOutUnitPrice');
    const stockInfo = document.getElementById('currentStockInfo');
    const stockAmount = document.getElementById('currentStockAmount');
    
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption && selectedOption.dataset.unitPrice) {
        priceInput.value = selectedOption.dataset.unitPrice;
        
        // Show current stock info
        stockAmount.textContent = selectedOption.dataset.currentStock;
        stockInfo.classList.remove('hidden');
        
        calculateStockOutTotal();
    } else {
        stockInfo.classList.add('hidden');
    }
}

// Calculate totals
function calculateStockInTotal() {
    const quantity = parseFloat(document.getElementById('stockInQuantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('stockInUnitPrice').value) || 0;
    const total = quantity * unitPrice;
    
    document.getElementById('stockInTotal').textContent = formatCurrency(total);
}

function calculateStockOutTotal() {
    const quantity = parseFloat(document.getElementById('stockOutQuantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('stockOutUnitPrice').value) || 0;
    const total = quantity * unitPrice;
    
    document.getElementById('stockOutTotal').textContent = formatCurrency(total);
}

function calculateProductValue() {
    // This could be used to show estimated inventory value for the product
    const stock = parseFloat(document.getElementById('productCurrentStock').value) || 0;
    const price = parseFloat(document.getElementById('productUnitPrice').value) || 0;
    const value = stock * price;
    
    // Could add a field to display this value if needed
    console.log('Product value:', formatCurrency(value));
}

// Save functions
async function saveProduct() {
    try {
        const form = document.getElementById('productForm');
        const data = getFormData(form);
        
        // Validate required fields
        validateRequired(data.name, 'Product Name');
        validateNumber(data.unit_price, 'Unit Price', 0);
        
        // Validate email if provided
        if (data.email) {
            validateEmail(data.email);
        }
        
        // Convert numeric fields
        data.unit_price = parseFloat(data.unit_price) || 0;
        data.min_stock_level = parseInt(data.min_stock_level) || 0;
        data.current_stock = parseInt(data.current_stock) || 0;
        
        let result;
        const productId = form.dataset.productId;
        
        if (productId) {
            // Update existing product
            result = await stockAPI.updateProduct(productId, data);
        } else {
            // Create new product
            result = await stockAPI.createProduct(data);
        }
        
        showToast(`Product ${productId ? 'updated' : 'created'} successfully`, 'success');
        closeModal();
        
        // Refresh data
        await app.loadInitialData();
        if (app.currentTab === 'products') {
            app.showProducts();
        }
        
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Failed to save product: ' + error.message, 'error');
    }
}

async function processStockIn() {
    try {
        const form = document.getElementById('stockInForm');
        const data = getFormData(form);
        
        // Validate required fields
        validateRequired(data.product_id, 'Product');
        validateNumber(data.quantity, 'Quantity', 1);
        validateNumber(data.unit_price, 'Unit Price', 0);
        
        // Process stock in
        await stockAPI.processStockIn(
            data.product_id,
            parseFloat(data.quantity),
            parseFloat(data.unit_price),
            data.reference_number || '',
            data.notes || '',
            'User'
        );
        
        closeModal();
        
        // Refresh data
        await app.loadInitialData();
        if (app.currentTab === 'transactions') {
            app.showTransactions();
        }
        
    } catch (error) {
        console.error('Error processing stock in:', error);
    }
}

async function processStockOut() {
    try {
        const form = document.getElementById('stockOutForm');
        const data = getFormData(form);
        
        // Validate required fields
        validateRequired(data.product_id, 'Product');
        validateNumber(data.quantity, 'Quantity', 1);
        validateNumber(data.unit_price, 'Unit Price', 0);
        
        // Process stock out
        await stockAPI.processStockOut(
            data.product_id,
            parseFloat(data.quantity),
            parseFloat(data.unit_price),
            data.reference_number || '',
            data.notes || '',
            'User'
        );
        
        closeModal();
        
        // Refresh data
        await app.loadInitialData();
        if (app.currentTab === 'transactions') {
            app.showTransactions();
        }
        
    } catch (error) {
        console.error('Error processing stock out:', error);
    }
}

async function saveSupplier() {
    try {
        const form = document.getElementById('supplierForm');
        const data = getFormData(form);
        
        // Validate required fields
        validateRequired(data.name, 'Company Name');
        
        // Validate email if provided
        if (data.email) {
            validateEmail(data.email);
        }
        
        // Validate phone if provided
        if (data.phone) {
            validatePhone(data.phone);
        }
        
        let result;
        const supplierId = form.dataset.supplierId;
        
        if (supplierId) {
            // Update existing supplier
            result = await stockAPI.updateSupplier(supplierId, data);
        } else {
            // Create new supplier
            result = await stockAPI.createSupplier(data);
        }
        
        showToast(`Supplier ${supplierId ? 'updated' : 'created'} successfully`, 'success');
        closeModal();
        
        // Refresh data
        await app.loadInitialData();
        if (app.currentTab === 'suppliers') {
            app.showSuppliers();
        }
        
    } catch (error) {
        console.error('Error saving supplier:', error);
        showToast('Failed to save supplier: ' + error.message, 'error');
    }
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentModal) {
        closeModal();
    }
});