const logger = require("../services/logger");

module.exports = (req, res) => {
  logger.info("Hello endpoint was hit!");
  res.json({
    message: "Hello from Zerra! 🚀",
    timestamp: new Date().toISOString(),
    query: req.query
  });
};
