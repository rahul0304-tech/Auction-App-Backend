require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const authenticate = require('../middleware/authenticate');
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Required fields missing' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Signin successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/user/auctions', authenticate, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId)
        .populate('postedAuctions')
        .populate('participatedAuctions')
        .populate('wonAuctions');
  
      res.json({
        postedAuctions: user.postedAuctions,
        participatedAuctions: user.participatedAuctions,
        wonAuctions: user.wonAuctions
      });
    } catch (error) {
      console.error("Fetching User Auctions Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  
module.exports = router;