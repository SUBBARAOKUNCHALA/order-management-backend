const Order = require('../models/Order');
const Product = require('../models/Product');

const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";

// Helper: returns full image URL correctly
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath}`;
};

// ---------------- CREATE ORDER ----------------
exports.createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { customerName, customerPhone, shippingAddress, paymentMethod, items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });

      const quantity = item.quantity || 1;
      const price = product.price;
      totalAmount += quantity * price;

      orderItems.push({
        productId: product._id,
        quantity,
        productName: product.name,
        price,
        image: getImageUrl(product.imagePath)
      });
    }

    const newOrder = new Order({
      userId: req.user._id,
      customerName,
      customerPhone,
      shippingAddress,
      paymentMethod,
      items: orderItems,
      orderAmount: totalAmount,
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      orderId: newOrder._id
    });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// ---------------- GET ALL ORDERS ----------------
exports.getAllOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId }).populate("items.productId");

    const formatted = orders.map(order => ({
      _id: order._id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      orderAmount: order.orderAmount,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        productId: item.productId?._id,
        productName: item.productName,
        image: getImageUrl(item.productId?.imagePath) || item.image,
        quantity: item.quantity,
        price: item.price
      }))
    }));

    res.status(200).json(formatted);

  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

// ---------------- GET ORDER DETAILS ----------------
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate("items.productId");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const formatted = {
      _id: order._id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      orderAmount: order.orderAmount,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        productId: item.productId?._id,
        productName: item.productName,
        image: getImageUrl(item.productId?.imagePath) || item.image,
        quantity: item.quantity,
        price: item.price
      }))
    };

    res.status(200).json(formatted);

  } catch (err) {
    console.error("Get order details error:", err);
    res.status(500).json({ message: "Failed to fetch details", error: err.message });
  }
};

// ---------------- DELETE ORDER ----------------
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!deleted) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully" });

  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
};
