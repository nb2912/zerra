const logger = require("../services/logger");

module.exports = (req, res) => {
  logger.info("Hello endpoint was hit!");
  res.end("Hello from Zerra! 🚀");
};
