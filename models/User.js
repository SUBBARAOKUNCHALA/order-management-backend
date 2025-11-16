const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },        // plain string
  userType: { type: String, default: "customer" },
  email: { type: String, required: true, unique: true }, // plain string
  emailHash: { type: String, unique: true },
  password: { type: String, required: true }    // hashed password
});

module.exports = mongoose.model("User", UserSchema);
