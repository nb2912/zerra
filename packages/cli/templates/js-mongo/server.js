const { startServer } = require("zerra-core");
const connectDB = require("./config/db");

// Initialize Database
connectDB();

// Start Zerra Engine
startServer(3000);
