import Product from '../models/product.model.js';

// Create a new product
export const createProduct = async (req, res) => {
    const { name, description, price, stock,category } = req.body;
    try {
        const product = new Product({
            name,
            description,
            category,
            price,
            stock,
            seller: req.user.id, 
            status: 'pending',
        });
        const savedProduct = await product.save();
        res.status(201).json({ message: 'Product created successfully', product: savedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};

// Approve a product (Admin only)
export const approveProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.status = 'approved';
        const updatedProduct = await product.save();
        res.status(200).json({ message: 'Product approved successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error approving product', error: error.message });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to delete this product' });
        }

        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

// Update a product
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to update this product' });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.stock = stock || product.stock;

        const updatedProduct = await product.save();
        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};



// Get products with pagination and filters
export const getProducts = async (req, res) => {
    const { page = 1, limit = 10, status, category, seller, minPrice, maxPrice } = req.query;

    try {
        // Build the query object dynamically
        const query = {};
        if (status) query.status = status; // Filter by status (e.g., approved, pending)
        if (category) query.category = category; // Filter by category
        if (seller) query.seller = seller; // Filter by seller ID
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice); // Greater than or equal to minPrice
            if (maxPrice) query.price.$lte = Number(maxPrice); // Less than or equal to maxPrice
        }

        // Pagination and sorting
        const products = await Product.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalProducts = await Product.countDocuments(query);

        res.status(200).json({
            totalProducts,
            currentPage: Number(page),
            totalPages: Math.ceil(totalProducts / limit),
            products,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//get by product id
export const getProductById = async (req, res) => {
    const { id } = req.params; // Extract ID from the request parameters

    try {
        // Find the product by ID
        const product = await Product.findById(id);

        // If no product is found, return a 404 response
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Return the found product
        res.status(200).json(product);
    } catch (error) {
        // Handle errors, such as invalid ObjectID or database issues
        console.error('Error fetching product:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
