const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { verifyGoogleToken } = require('../middleware/auth');

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ status: false, message: 'Google token is required' });
    }

    const { payload, error } = await verifyGoogleToken(token);
    if (error) {
      return res.status(401).json({ status: false, message: error });
    }

    const { sub: googleId, email, name, picture } = payload;
    
    // Find or create a user in our database
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        displayName: name,
        profilePicture: picture,
      });
    }

    // Generate a JWT for the user
    const jwtPayload = {
      id: user._id,
      role: user.role,
    };
    const userToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      status: true,
      message: 'Login successful',
      token: userToken,
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
};