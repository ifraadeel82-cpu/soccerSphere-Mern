const User = require('../models/User');
const Fan = require('../models/Fan');
const { generateToken } = require('../config/jwt');

// POST /api/auth/register — Fan registration (replaces sp_RegisterFan)
const registerFan = async (req, res, next) => {
  try {
    const { username, password, name, contact, address } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ message: 'Username, password and name are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Username already exists' });

    const user = await User.create({ username, passwordHash: password, role: 'FAN' });
    const fan = await Fan.create({ user: user._id, name, contact, address });

    const token = generateToken(user._id, user.role);
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, role: user.role, fanId: fan._id, name: fan.name },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login — Login for both Fan and Admin
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const user = await User.findOne({ username });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    let fanId = null;
    let fanName = null;
    if (user.role === 'FAN') {
      const fan = await Fan.findOne({ user: user._id });
      if (fan) { fanId = fan._id; fanName = fan.name; }
    }

    const token = generateToken(user._id, user.role);
    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role, fanId, name: fanName },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/create-admin — Admin creates another admin (replaces sp_CreateAdmin)
const createAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Username already exists' });

    const user = await User.create({ username, passwordHash: password, role: 'ADMIN' });
    res.status(201).json({ message: 'Admin created', id: user._id, username: user.username });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me — Get current user info
const getMe = async (req, res) => {
  const user = req.user;
  let fanId = null, fanName = null;
  if (user.role === 'FAN') {
    const fan = await Fan.findOne({ user: user._id });
    if (fan) { fanId = fan._id; fanName = fan.name; }
  }
  res.json({ id: user._id, username: user.username, role: user.role, fanId, name: fanName });
};

module.exports = { registerFan, login, createAdmin, getMe };
