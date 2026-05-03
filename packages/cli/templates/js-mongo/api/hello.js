const db = require("../services/db");

module.exports = async (req, res) => {
  const users = await db.find("users", {});
  res.end(`Hello from Zerra! MongoDB is connected. Found ${users.length} documents.`);
};
