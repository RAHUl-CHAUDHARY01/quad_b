const mongoose = require('mongoose');
const axios = require('axios');
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;
app.use(cors());

// MongoDB connection (Replace with your MongoDB URI)
mongoose.connect('mongodb+srv://chaudharyrahul9315:rahul2004@cluster0.lseoq.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define schema for tickers
const tickerSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String,
});

// Create Ticker model
const Ticker = mongoose.model('Ticker', tickerSchema);

axios.get('https://api.wazirx.com/api/v2/tickers')
  .then(async (response) => {
    const data = response.data;
    const entries = Object.entries(data).slice(0, 10);

    for (const [name, value] of entries) {
      const { last, buy, sell, volume, base_unit } = value;
      try {
        await Ticker.findOneAndUpdate(
          { name },
          { name, last, buy, sell, volume, base_unit },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`Inserted/Updated data for: ${name}`);
      } catch (err) {
        console.error(`Error inserting data for ${name}:`, err);
      }
    }
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// API route to fetch the top 10 tickers from MongoDB
app.get('/api/tickers', async (req, res) => {
  try {
    const tickers = await Ticker.find().limit(10); // Fetch top 10 tickers
    res.json(tickers); // Send the data as JSON
  } catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).send('Error retrieving data');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
