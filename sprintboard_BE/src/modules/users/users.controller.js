const { getUsers, createUser, updateUserRole } = require('./users.service');

const getAll = async (req, res) => {
  try {
    const users = await getUsers(req.user.organization_id);
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const create = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password are required' });

    const user = await createUser({ organization_id: req.user.organization_id, name, email, password, role });
    res.status(201).json({ message: 'Member created successfully', user });
  } catch (error) {
    if (error.message === 'Email already exists') return res.status(409).json({ message: error.message });
    if (error.message === 'Invalid role') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateRole = async (req, res) => {
  try {
    const user = await updateUserRole({
      organization_id: req.user.organization_id,
      id: req.params.id,
      role: req.body.role,
      currentUserId: req.user.id,
    });
    res.status(200).json({ message: 'Member role updated successfully', user });
  } catch (error) {
    if (error.message === 'User not found') return res.status(404).json({ message: error.message });
    if (['Invalid role', 'You cannot change your own role'].includes(error.message)) return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getAll, create, updateRole };
