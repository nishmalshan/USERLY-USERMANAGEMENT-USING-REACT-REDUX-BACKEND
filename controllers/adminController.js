const User = require('../models/users');



const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user'})
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message,
          });
    }
}



const blockUser = async (req, res) => {
    try {
        const id = req.params.userId;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Toggle the isBlocked value
        user.isBlocked = true

        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user status',
            error: error.message
        });
    }
};
const unblockUser = async (req, res) => {
    try {
        const id = req.params.userId;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Toggle the isBlocked value
        user.isBlocked = false

        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user status',
            error: error.message
        });
    }
};



module.exports = {
    getAllUsers,
    blockUser,
    unblockUser
}