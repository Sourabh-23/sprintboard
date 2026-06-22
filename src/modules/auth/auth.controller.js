const { registerUser, loginUser, refreshAccessToken } = require('./auth.service');
const { isValidEmail, isStrongEnoughPassword } = require('../../utils/validators');

const register = async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }
    if (!isStrongEnoughPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const data = await registerUser({ name, email, password, organizationName });

    res.status(201).json({
      message: 'Organization and user created successfully',
      ...data,
    });
  } catch (error) {
    if (error.message === 'Email already exists' || error.message === 'Organization name already taken') {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    const data = await loginUser({ email, password });

    res.status(200).json({ message: 'Login successful', ...data });
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken is required' });
    }

    const data = await refreshAccessToken(refreshToken);
    res.status(200).json(data);
  } catch (error) {
    if (error.message === 'Invalid refresh token' || error.message === 'User not found') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { register, login, refresh };
