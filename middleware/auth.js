// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const authenticateUser = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user to request object
        req.user = decoded.id
        
        if (!req.user) {
            return res.status(401).json({ message: 'User not found, authorization denied' });
        }
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = {
    authenticateUser
};