// Supabase configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Product operations
async function addProduct(product) {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select();
            
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
}

async function updateProduct(productId, updates) {
    try {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', productId)
            .select();
            
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

async function deleteProduct(productId) {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
            
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

async function getAllProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting products:', error);
        return [];
    }
}

async function updateStock(productId, quantityChange) {
    try {
        // First get current stock
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock')
            .eq('id', productId)
            .single();
            
        if (fetchError) throw fetchError;
        
        const newStock = (product.stock || 0) + quantityChange;
        
        // Update with new stock
        const { data, error } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', productId)
            .select();
            
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
    }
}

function subscribeToProducts(callback) {
    // Set up real-time subscription
    const subscription = supabase
        .channel('products')
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'products' 
            }, 
            (payload) => {
                // When any change happens, fetch all products to keep in sync
                getAllProducts().then(products => {
                    callback(products);
                });
            }
        )
        .subscribe();

    // Return unsubscribe function
    return () => {
        supabase.removeChannel(subscription);
    };
}

export {
    supabase,
    addProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    updateStock,
    subscribeToProducts
};
