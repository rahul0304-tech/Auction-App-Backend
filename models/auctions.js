const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  currentBid: { type: Number, default: 0 },
  highestBidder: { type: String, default: "" },
  closingTime: { type: Date, required: true },
  isClosed: { type: Boolean, default: false },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // Link auction to user
});

module.exports = mongoose.model('AuctionItem', auctionSchema);
