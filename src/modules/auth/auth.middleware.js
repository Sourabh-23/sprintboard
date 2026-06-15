const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Organization = require('../../models/Organization');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const registerUser = async ({ name, email, password, organizationName }) => {
  // Step 1: Email already exist karta hai?
  const existingUser = await User.query().where({ email }).first();
  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Step 2: Slug generate karo
  const slug = generateSlug(organizationName);

  // Step 3: Slug already exist karta hai?
  const existingOrg = await Organization.query().where({ slug }).first();
  if (existingOrg) {
    throw new Error('Organization name already taken');
  }

  // Step 4: Password hash karo
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Step 5: Organization banao
  const organization = await Organization.query().insert({
    name: organizationName,
    slug,
  });

  // Step 6: User banao (owner)
  const user = await User.query().insert({
    organization_id: organization.id,
    name,
    email,
    password: hashedPassword,
    role: 'owner',
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
  };
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.query().findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission.' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };

