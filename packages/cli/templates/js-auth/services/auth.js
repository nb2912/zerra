const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'zerra-secret-key';

module.exports = {
  hashPassword: (password) => bcrypt.hashSync(password, 10),
  comparePassword: (password, hash) => bcrypt.compareSync(password, hash),
  generateToken: (user) => jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' }),
  verifyToken: (token) => jwt.verify(token, JWT_SECRET)
};
