const auth = require('../../services/auth');

module.exports = async (req, res) => {
  const { email, password } = req.body;

  // Mock user for the starter
  const mockUser = { id: 1, email: 'user@example.com', password: auth.hashPassword('password123') };

  if (email === mockUser.email && auth.comparePassword(password, mockUser.password)) {
    const token = auth.generateToken(mockUser);
    return res.json({ token, message: "Login successful" });
  }

  res.status(401).json({ error: "Invalid credentials" });
};
