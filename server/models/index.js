const { getDatabaseConnection } = require("./main.model");

let db = {};
try {
  db = getDatabaseConnection();
} catch (error) {
  console.error("Database connection error", error);
  process.exit();
}

module.exports = db;
