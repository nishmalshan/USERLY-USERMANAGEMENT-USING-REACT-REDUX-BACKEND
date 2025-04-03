const User = require('../models/users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const cloudinary = require('../config/cloudinary')


// Generate JWT token 
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};


const registerNewUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: { id: user._id, name: user.name, email: user.email}
             })
        } else {
            res.status(400).json({ message: 'Invalid user data'})
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}




const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (user.isBlocked) {
            return res.status(400).json({ message: 'You are not allowed to login'})
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);
        
        // Set cookie with token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            sameSite: 'strict'
        });

        res.json({
            success: true,
            message: 'User logged in successfully',
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                role: user.role,
                profileImage: user?.profileImage,
                isBlocked: user.isBlocked
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};





const updateUsername = async (req, res) => {
    const { username } = req.body;
    try {
    const updatedUser = await User.findByIdAndUpdate(
        req.user,
        { name: username },
        { new: true, select: '-password' } // Return updated user without password
      );

      if (!updatedUser) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Username updated successfully',
        user: updatedUser.name
      });

    } catch (error) {
        console.error('Error updating username:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating profile' 
    });
    }
}



const uploadProfileImage = async (req, res) => {
    try {

        const user = await User.findById(req.user);
        if (!user) {
            throw new Error('User not found')
        }

        if (user.profileImagePublicId) {
            await cloudinary.uploader.destroy(user.profileImagePublicId);
        }
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'profile-images',
            width: 150,
            height: 150,
            crop: 'fill'
        });

        const updatedUserImage = await User.findByIdAndUpdate(
            req.user,
            {
                profileImage: result.secure_url,
                profileImagePublicId: result.public_id
            },
            { new: true }
          );
      
          if (!updatedUserImage) {
            throw new Error('User not found or update failed');
          }
      
          // Delete temporary file
          fs.unlinkSync(req.file.path);
      
          // Send success response
          res.status(200).json({
            success: true,
            imageUrl: result.secure_url,
            user: updatedUserImage, // Send the full updated user object
          });
    } catch (error) {
        console.error('Error in uploadProfileImage:', error);

    // Clean up file if it exists (in case of Cloudinary failure)
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    // Send error response
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile image',
    });
    }
}

const fetchUserStatus = async (req, res) => {
    try {
        const token = req.cookies?.token; 
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            isBlocked: user.isBlocked,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



module.exports = {
    registerNewUser,
    loginUser,
    updateUsername,
    uploadProfileImage,
    fetchUserStatus
}