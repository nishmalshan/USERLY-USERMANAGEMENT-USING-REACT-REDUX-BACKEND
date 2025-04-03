const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const connectDB = require("./config/connection")


// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000


// Middleware 
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/", userRoutes)
app.use('/admin',adminRoutes);


// Connect to the database
connectDB;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`)
})