const Order = require("../models/Order");

async function autoUpdateOrderStatus() {
  const orders = await Order.find();

  for (let order of orders) {
    const now = new Date();
    const diffDays =
      Math.floor((now - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));

    let newStatus = order.status;

    if (diffDays === 1) newStatus = "Shipped";
    else if (diffDays === 2) newStatus = "Out for Delivery";
    else if (diffDays >= 3) newStatus = "Delivered";

    if (newStatus !== order.status) {
      order.status = newStatus;
      order.statusUpdatedAt = new Date();
      await order.save();
    }
  }
}

module.exports = autoUpdateOrderStatus;
