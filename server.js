const express = require('express');
const dotenv = require('dotenv');
const fileUpload = require("express-fileupload");
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes=require("./routes/authRoutes")
const productRoutes = require("./routes/product.routes");
const cartRoutes = require('./routes/cart.routes');
const paymentRoutes = require('./routes/paymentRoutes');
const path = require('path');
const autoUpdateOrderStatus = require("./services/autoStatus");


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use("/brandings", express.static(path.join(__dirname, "brandings")));
app.use('/api/auth',authRoutes);
app.use('/api/orders', require('./routes/orderRoutes'));
app.use("/api/products", productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
setInterval(() => {
  autoUpdateOrderStatus();
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
