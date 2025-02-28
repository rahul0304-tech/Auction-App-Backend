const express = require('express');
const AuctionItem = require('../models/auctions');
const authenticate = require('../middleware/authenticate');
const User = require('../models/users');


const router = express.Router();

router.post('/auction', authenticate, async (req, res) => {
  try {
    const { itemName, description, startingBid, closingTime } = req.body;

    if (!itemName || !description || !startingBid || !closingTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newItem = new AuctionItem({
      itemName,
      description,
      currentBid: startingBid,
      highestBidder: "",
      closingTime,
      seller: req.user.userId
    });

    await newItem.save();

    // Add this auction to the user's posted auctions
    await User.findByIdAndUpdate(req.user.userId, { 
      $push: { postedAuctions: newItem._id } 
    });

    res.status(201).json({ message: "Auction item created", item: newItem });
  } catch (error) {
    console.error("Auction Post Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

router.post('/bid/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { bid } = req.body;
    const item = await AuctionItem.findById(id);

    if (!item) return res.status(404).json({ message: "Auction item not found" });
    if (item.isClosed) return res.status(400).json({ message: "Auction is closed" });

    if (new Date() > new Date(item.closingTime)) {
      item.isClosed = true;
      await item.save();
      return res.json({ message: "Auction closed", winner: item.highestBidder });
    }

    if (bid > item.currentBid) {
      item.currentBid = bid;
      item.highestBidder = req.user.userId;
      await item.save();

      // Add this auction to the user's participated auctions
      await User.findByIdAndUpdate(req.user.userId, { 
        $addToSet: { participatedAuctions: item._id } // Avoid duplicates
      });

      res.json({ message: "Bid successful", item });
    } else {
      res.status(400).json({ message: "Bid too low" });
    }
  } catch (error) {
    console.error("Bidding Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put('/auction/:id', authenticate, async (req, res) => {
  try {
    const updatedAuction = await AuctionItem.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // If the auction is closed, add it to the winner's wonAuctions
    if (updatedAuction.isClosed && updatedAuction.highestBidder) {
      await User.findByIdAndUpdate(updatedAuction.highestBidder, {
        $push: { wonAuctions: updatedAuction._id }
      });
    }

    res.json(updatedAuction);
  } catch (error) {
    console.error("Updating Auction Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get('/auctions/user', authenticate, async (req, res) => {
  try {
    console.log("Authenticated user ID:", req.user.userId); // Debug log

    const userAuctions = await AuctionItem.find({ seller: req.user.userId });

    console.log("User Auctions:", userAuctions); // Debug log

    res.json(userAuctions);
  } catch (error) {
    console.error("Fetching User Auctions Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});


module.exports = router;
