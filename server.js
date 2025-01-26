const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your_secret_key'; // Replace with a secure key

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/flight_search', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  searchHistory: [
    {
      depAirport: String,
      arrAirport: String,
      statusFilter: String,
      date: { type: Date, default: Date.now },
    },
  ],
  watchlist: [
    {
      id: String, // Unique flight ID
      airline: String,
      flightNumber: String,
      departure: String,
      arrival: String,
      url: String, // URL for sharing
    },
  ],
});

const User = mongoose.model('User', userSchema);

// Routes

// Register a new user
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid username or password' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Save search history
app.post('/history', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { depAirport, arrAirport, statusFilter } = req.body;
    user.searchHistory.push({ depAirport, arrAirport, statusFilter });
    await user.save();

    res.json({ message: 'Search history saved' });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Add a flight to the watchlist
app.post('/watchlist', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { flight } = req.body;
    user.watchlist = user.watchlist || [];
    user.watchlist.push(flight);
    await user.save();

    res.json({ message: 'Flight added to watchlist' });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Get the user's watchlist
app.get('/watchlist', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user.watchlist || []);
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Remove a flight from the watchlist
app.delete('/watchlist/:flightId', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { flightId } = req.params;
    user.watchlist = user.watchlist.filter((flight) => flight.id !== flightId);
    await user.save();

    res.json({ message: 'Flight removed from watchlist' });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
