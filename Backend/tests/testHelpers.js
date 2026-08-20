const User = require('../src/models/User');
const generateToken = require('../src/utils/generateToken');
const { ROLES } = require('../src/config/constants');

const createUser = async (overrides = {}) => {
  const defaults = {
    name: 'Test User',
    email: `user${Date.now()}${Math.random().toString(36).slice(2)}@test.com`,
    password: 'Password@123',
    role: ROLES.TEAM_MEMBER,
    isActive: true,
  };
  const user = await User.create({ ...defaults, ...overrides });
  const token = generateToken(user);
  return { user, token };
};

const authHeader = (token) => `Bearer ${token}`;

module.exports = { createUser, authHeader, ROLES };
