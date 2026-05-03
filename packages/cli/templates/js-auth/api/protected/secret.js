module.exports = async (req, res) => {
  res.json({ 
    message: "Welcome to the secret area!",
    user: req.user 
  });
};
