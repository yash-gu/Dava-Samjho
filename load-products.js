// Import Supabase client
import { supabase, subscribeToProducts } from './supabase-config.js';

// DOM Elements
const productsContainer = document.getElementById('products-container');

// Format price with Indian Rupee symbol and commas
function formatPrice(price) {
    if (!price && price !== 0) return 'Price not available';
    return '₹' + parseFloat(price).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
    });
}

// Render products on the page
function renderProducts(products) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    // Filter out out-of-stock products if needed
    const inStockProducts = products.filter(product => product.stock > 0);
    
    if (inStockProducts.length === 0) {
        productsContainer.innerHTML = `
            <div class="col-span-3 text-center py-12">
                <div class="text-gray-500 text-lg">No products available at the moment.</div>
                <p class="mt-2">Please check back later or contact us for more information.</p>
            </div>
        `;
        return;
    }
    
    // Clear loading indicators
    productsContainer.innerHTML = '';
    
    // Add products to the page
    inStockProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-transform transform hover:-translate-y-1';
        
        // Default image if none provided
        const imageUrl = product.imageUrl || 'https://via.placeholder.com/400x300?text=Medical+Product';
        
        productCard.innerHTML = `
            <img src="${imageUrl}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">${product.name}</h3>
                ${product.description ? `<p class="text-gray-600 mb-4">${product.description}</p>` : ''}
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold">${formatPrice(product.price || 0)}</span>
                    <a href="https://wa.me/919876543210?text=Hello%20Dava%20Samjho,%20I%20want%20to%20order:%0AProduct:%20${encodeURIComponent(product.name)}%0APrice:%20${encodeURIComponent(formatPrice(product.price || 0))}%0AQty:%201%0AAddress:%20%5BYour%20Address%5D" 
                       class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors flex items-center"
                       target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-whatsapp mr-2"></i> Order Now
                    </a>
                </div>
                ${product.stock < 5 ? 
                    `<div class="mt-3 text-sm text-yellow-600">
                        <i class="fas fa-exclamation-triangle mr-1"></i> Only ${product.stock} left in stock!
                    </div>` : ''
                }
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
}

// Initialize the products
function initProducts() {
    // Show loading state
    productsContainer.innerHTML = `
        <div class="col-span-3 text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Loading products...</p>
        </div>
    `;
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToProducts((products) => {
        renderProducts(products);
    });
    
    // Return cleanup function
    return unsubscribe;
}

// Start the products functionality
document.addEventListener('DOMContentLoaded', () => {
    // Only run on the main page, not the admin page
    if (document.getElementById('products-container')) {
        initProducts();
    }
});
