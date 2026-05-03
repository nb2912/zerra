const db = require("../services/db");

module.exports = async (req, res) => {
  const users = await db.find("users", {});
  res.json({
    message: "Hello from Zerra! MongoDB is connected.",
    count: users.length,
    users: users
  });
};
