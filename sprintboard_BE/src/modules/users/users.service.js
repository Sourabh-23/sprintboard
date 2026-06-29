const bcrypt = require('bcryptjs');
const User = require('../../models/User');

const ROLES = ['owner', 'admin', 'member', 'viewer'];
const selectSafe = (query) => query.select('id', 'organization_id', 'name', 'email', 'role', 'created_at', 'updated_at');

const assertRole = (role) => {
  if (role !== undefined && !ROLES.includes(role)) throw new Error('Invalid role');
};

const getUsers = async (organization_id) => {
  return User.query().where({ organization_id }).modify(selectSafe).orderBy('created_at', 'asc');
};

const createUser = async ({ organization_id, name, email, password, role = 'member' }) => {
  assertRole(role);
  const existing = await User.query().where({ email }).first();
  if (existing) throw new Error('Email already exists');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.query().insert({
    organization_id,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    password: hashedPassword,
    role,
  });

  return User.query().findById(user.id).modify(selectSafe);
};

const updateUserRole = async ({ organization_id, id, role, currentUserId }) => {
  assertRole(role);
  if (Number(id) === Number(currentUserId)) throw new Error('You cannot change your own role');

  const user = await User.query().where({ organization_id, id }).first();
  if (!user) throw new Error('User not found');
  await User.query().patchAndFetchById(user.id, { role });
  return User.query().findById(user.id).modify(selectSafe);
};

module.exports = { getUsers, createUser, updateUserRole };
