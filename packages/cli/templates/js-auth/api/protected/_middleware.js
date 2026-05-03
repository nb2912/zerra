const auth = require('../../services/auth');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = auth.verifyToken(token);
    req.user = decoded;
    await next();
  } catch (e) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
