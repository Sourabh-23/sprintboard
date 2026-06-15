const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Organization = require('../../models/Organization');
const User = require('../../models/User');
const crypto = require('crypto');
require('dotenv').config();

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

const loginUser = async ({ email, password }) => {
  const user = await User.query().where({ email }).first();
  if (!user) throw new Error('Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  const accessToken = jwt.sign(
    { id: user.id, organization_id: user.organization_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
    },
  };
};

module.exports = { registerUser, loginUser };

