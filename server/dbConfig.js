const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgres://postgres:@developers@localhost:5432/logindb",
});

module.exports = pool;
