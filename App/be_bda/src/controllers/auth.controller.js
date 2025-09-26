const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { verifyGoogleToken } = require('../middleware/auth');

function generateToken(user) {
  const jwtPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(jwtPayload, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ status: false, message: 'Google token is required' });
    }

    // Verify token with Google
    const { payload, error } = await verifyGoogleToken(token);
    if (error) {
      return res.status(401).json({ status: false, message: error });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        displayName: name,
        profilePicture: picture,
      });
    }

    // Generate a JWT
    const userToken = generateToken(user);

    res.status(200).json({
      status: true,
      message: 'Login successful',
      token: userToken,
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
