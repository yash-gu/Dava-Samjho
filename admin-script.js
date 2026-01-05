import { 
    supabase, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    getAllProducts, 
    subscribeToProducts 
} from './supabase-config.js';

// DOM Elements
const productsSection = document.getElementById('products-section');
const productFormSection = document.getElementById('product-form-section');
const productsList = document.getElementById('products-list');
const productForm = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const addNewProductBtn = document.getElementById('add-new-product');
const cancelEditBtn = document.getElementById('cancel-edit');

// Form fields
const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productStockInput = document.getElementById('product-stock');
const productCategoryInput = document.getElementById('product-category');
const productDescriptionInput = document.getElementById('product-description');
const productImageInput = document.getElementById('product-image');

// Current product being edited
let currentProductId = null;

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        // Redirect to login or show login form
        window.location.href = 'admin-login.html';
        return;
    }
    loadProducts();
    setupEventListeners();
});

function setupEventListeners() {
    // Add new product button
    addNewProductBtn.addEventListener('click', showAddProductForm);
    
    // Cancel edit button
    cancelEditBtn.addEventListener('click', hideProductForm);
    
    // Form submission
    productForm.addEventListener('submit', handleFormSubmit);
}

// Load products
async function loadProducts() {
    try {
        // Real-time subscription to products
        subscribeToProducts((products) => {
            renderProducts(products);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products. Please try again.', 'error');
    }
}

// Render products in the table
function renderProducts(products) {
    productsList.innerHTML = '';
    
    if (products.length === 0) {
        productsList.innerHTML = `
            <tr>
                <td colspan="5" class="py-4 text-center text-gray-500">
                    No products found. Click "Add Product" to get started.
                </td>
            </tr>
        `;
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.className = 'border-t border-gray-200 hover:bg-gray-50';
        row.innerHTML = `
            <td class="py-3 px-4">
                <div class="flex items-center">
                    ${product.imageUrl ? `
                        <img src="${product.imageUrl}" alt="${product.name}" 
                             class="h-10 w-10 rounded-md object-cover mr-3">
                    ` : ''}
                    <div>
                        <div class="font-medium text-gray-900">${product.name}</div>
                        <div class="text-sm text-gray-500">${product.description?.substring(0, 50)}${product.description?.length > 50 ? '...' : ''}</div>
                    </div>
                </div>
            </td>
            <td class="py-3 px-4 text-gray-600 capitalize">${product.category || 'N/A'}</td>
            <td class="py-3 px-4 text-right font-medium">₹${product.price?.toFixed(2) || '0.00'}</td>
            <td class="py-3 px-4 text-right">
                <span class="px-2 py-1 text-sm rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${product.stock || 0} in stock
                </span>
            </td>
            <td class="py-3 px-4 text-center">
                <button class="text-blue-600 hover:text-blue-800 mr-3 edit-product" data-id="${product.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-800 delete-product" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        productsList.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.currentTarget.getAttribute('data-id');
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.currentTarget.getAttribute('data-id');
            confirmDeleteProduct(productId);
        });
    });
}

// Show add product form
function showAddProductForm() {
    currentProductId = null;
    formTitle.textContent = 'Add New Product';
    productForm.reset();
    productIdInput.value = '';
    showProductForm();
}

// Show edit product form
async function editProduct(productId) {
    try {
        const products = await getAllProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        currentProductId = productId;
        formTitle.textContent = 'Edit Product';
        
        // Fill form with product data
        productIdInput.value = productId;
        productNameInput.value = product.name || '';
        productPriceInput.value = product.price || '';
        productStockInput.value = product.stock || 0;
        productCategoryInput.value = product.category || '';
        productDescriptionInput.value = product.description || '';
        productImageInput.value = product.imageUrl || '';
        
        showProductForm();
    } catch (error) {
        console.error('Error editing product:', error);
        showNotification('Error loading product details. Please try again.', 'error');
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const productData = {
        name: productNameInput.value.trim(),
        price: parseFloat(productPriceInput.value),
        stock: parseInt(productStockInput.value, 10),
        category: productCategoryInput.value,
        description: productDescriptionInput.value.trim(),
        imageUrl: productImageInput.value.trim() || null,
        updatedAt: new Date().toISOString()
    };
    
    try {
        if (currentProductId) {
            // Update existing product
            await updateProduct(currentProductId, productData);
            showNotification('Product updated successfully!', 'success');
        } else {
            // Add new product
            await addProduct(productData);
            showNotification('Product added successfully!', 'success');
        }
        
        hideProductForm();
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error saving product. Please try again.', 'error');
    }
}

// Confirm product deletion
function confirmDeleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        deleteProductById(productId);
    }
}

// Delete product
async function deleteProductById(productId) {
    try {
        await deleteProduct(productId);
        showNotification('Product deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product. Please try again.', 'error');
    }
}

// Show/hide product form
function showProductForm() {
    productsSection.classList.add('hidden');
    productFormSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideProductForm() {
    productFormSection.classList.add('hidden');
    productsSection.classList.remove('hidden');
    productForm.reset();
    currentProductId = null;
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 max-w-sm transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white`;
    
    // Add message
    notification.textContent = message;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-1 right-2 text-white hover:text-gray-200';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    notification.appendChild(closeButton);
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Initialize the admin panel
function initAdmin() {
    // Check if user is logged in (you should implement proper authentication)
    // For now, we'll just show the admin panel
    loadProducts();
}

// Start the admin panel
initAdmin();
