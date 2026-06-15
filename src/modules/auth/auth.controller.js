const { registerUser, loginUser } = require('./auth.service');

const register = async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({ message: 'Please fill all required fields' });
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

    const data = await loginUser({ email, password });

    res.status(200).json({ message: 'Login successful', ...data });
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { register, login };
