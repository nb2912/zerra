const db = require("../services/db");

module.exports = async (req, res) => {
  const users = await db.query("SELECT * FROM users");
  res.end(`Hello from Zerra! Database is connected. Found ${users.length} users.`);
};
