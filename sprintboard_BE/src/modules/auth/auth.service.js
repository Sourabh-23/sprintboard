const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Organization = require('../../models/Organization');
const User = require('../../models/User');
const logger = require('../../utils/logger');
const { sendWelcomeEmail } = require('../../utils/mailer');
require('dotenv').config();

const getAccessTokenOptions = () => ({
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
});

const getRefreshTokenSecret = () => {
  return process.env.JWT_REFRESH_SECRET || `${process.env.JWT_SECRET}_refresh`;
};

const getRefreshTokenOptions = () => ({
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
});

const signAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, organization_id: user.organization_id, role: user.role },
    process.env.JWT_SECRET,
    getAccessTokenOptions()
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, token_type: 'refresh' },
    getRefreshTokenSecret(),
    getRefreshTokenOptions()
  );
};

const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const registerUser = async ({ name, email, password, organizationName }) => {
  // Step 1: Email already exist karta hai?
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.query().where({ email: normalizedEmail }).first();
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
    email: normalizedEmail,
    password: hashedPassword,
    role: 'owner',
  });

  sendWelcomeEmail({
    to: user.email,
    name: user.name,
    organizationName: organization.name,
  }).catch((error) => logger.error('Failed to send welcome email', error));

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

const loginUser = async ({ email, password }) => {
  const user = await User.query().where({ email: email.toLowerCase() }).first();
  if (!user) throw new Error('Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
    },
  };
};

const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, getRefreshTokenSecret());
    if (decoded.token_type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    const user = await User.query().findById(decoded.id);
    if (!user) throw new Error('User not found');

    return {
      accessToken: signAccessToken(user),
    };
  } catch (error) {
    if (error.message === 'User not found') throw error;
    throw new Error('Invalid refresh token');
  }
};

module.exports = { registerUser, loginUser, refreshAccessToken };

