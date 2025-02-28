const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // New fields to track auctions
  postedAuctions: [{ type: mongoose.Schema.Types.ObjectId, ref: "AuctionItem" }], // Auctions user created
  participatedAuctions: [{ type: mongoose.Schema.Types.ObjectId, ref: "AuctionItem" }], // Auctions user bid on
  wonAuctions: [{ type: mongoose.Schema.Types.ObjectId, ref: "AuctionItem" }] // Auctions user won
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
