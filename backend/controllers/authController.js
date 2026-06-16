const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || null,
  isAdmin: user.isAdmin || false,
});

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    const user = await User.create({ name, email, password });
    return res.status(201).json({ ...sanitizeUser(user), token: generateToken(user._id) });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.password) {
      return res.status(401).json({ message: 'This account uses Google Sign-In. Please sign in with Google.' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    return res.json({ ...sanitizeUser(user), token: generateToken(user._id) });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE AUTH  (access_token + googleUser from frontend)
// ─────────────────────────────────────────────────────────────────────────────
const authGoogle = async (req, res) => {
  const { access_token, googleUser } = req.body;

  if (!googleUser || !googleUser.email) {
    return res.status(400).json({ message: 'Missing Google user data.' });
  }

  try {
    // Lightweight token verification via Google tokeninfo
    if (access_token) {
      const check = await fetch(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`
      );
      if (!check.ok) return res.status(401).json({ message: 'Invalid Google access token.' });
    }

    const { sub: googleId, email, name, picture } = googleUser;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({ googleId, name, email, avatar: picture });
    } else if (!user.googleId) {
      // Link Google to an existing email-based account
      user.googleId = googleId;
      user.avatar = picture || user.avatar;
      await user.save();
    }
    return res.json({ ...sanitizeUser(user), token: generateToken(user._id) });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(401).json({ message: 'Google authentication failed.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLE AUTH
// ─────────────────────────────────────────────────────────────────────────────
const appleAuth = async (req, res) => {
  const { email, name } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: name || email.split('@')[0], email });
    }
    return res.json({ ...sanitizeUser(user), token: generateToken(user._id) });
  } catch (error) {
    console.error('Apple auth error:', error);
    return res.status(500).json({ message: 'Apple sign-in failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ME
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -googleId');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { authGoogle, register, login, getMe, appleAuth };