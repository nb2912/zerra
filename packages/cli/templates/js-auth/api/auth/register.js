const auth = require('../../services/auth');

// Note: This is a starter. In a real app, you would save the user to your database.
module.exports = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const hashedPassword = auth.hashPassword(password);
  
  // Here you would: await db.users.create({ email, password: hashedPassword })

  res.status(201).json({ 
    message: "User registered successfully (Starter Mock)",
    user: { email }
  });
};

module.exports.schema = {
  email: 'string',
  password: 'string'
};
