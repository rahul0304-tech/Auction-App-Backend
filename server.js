require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/dbconnect');
const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctionRoutes');

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use('/api', authRoutes);
app.use('/api', auctionRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
