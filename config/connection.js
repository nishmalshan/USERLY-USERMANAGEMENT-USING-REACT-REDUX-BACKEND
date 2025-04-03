const mongoose = require('mongoose');
const dotenv= require('dotenv');

// Load environment variables
dotenv.config();


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to DB'))
.catch(err => console.error('MongoDB connection error:', err))