const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  accountNumber: { type: String, unique: true },
  fullName: String,
  email: String,
  phone: String,
  balance: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  status: { type: String, default: "ACTIVE" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Client", ClientSchema);
