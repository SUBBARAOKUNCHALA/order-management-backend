const Cart = require('../models/cart.model');
const Product = require('../models/Product');
const { decrypt, encrypt } = require('../services/encryption.service');

exports.addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity, sizes } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    const existing = cart.items.find(
      item =>
        item.product.toString() === productId &&
        item.sizes === sizes
    );

    if (existing) {
      existing.quantity += quantity || 1;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imagePath
          ? `http://localhost:5000${product.imagePath}`
          : null,
        quantity: quantity || 1,
        sizes: sizes
      });
    }

    await cart.save();

    res.status(200).json({
      message: "Item added to cart",
      cart
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
};




exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const decryptedItems = cart.items.map(item => {
      const product = item.product;
      return {
        product: {
          _id: product._id,
          name: product.name?.iv ? decrypt(product.name) : product.name,
          description: product.description?.iv ? decrypt(product.description) : product.description,
          category: product.category?.iv ? decrypt(product.category) : product.category,
          price: product.price,
          imageUrl: product.imagePath
          ? `http://localhost:5000${product.imagePath}`
          : null,
        },
        quantity: item.quantity,
        sizes:item.sizes
      };
    });

    res.status(200).json({ items: decryptedItems });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve cart' });
  }
};

//"  Update item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== 'number' || quantity < 1)
      return res.status(400).json({ message: 'Invalid input' });

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    item.quantity = quantity;
    // ❌ remove sizes — it caused your 500 error
    // item.sizes = sizes;

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: "Cart item updated", cart });
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
};


// " Remove item by product ID
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Item removed', cart });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
};

// " Clear entire cart for logged-in user
exports.clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    await Cart.findOneAndDelete({ user: userId });
    res.status(200).json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
