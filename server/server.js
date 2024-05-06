const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
// const { Pool } = require('pg');

const pool = require("./dbConfig");

const app = express();

app.use(express.json());
app.use(cors());

const port = 3001;

// User registration
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];

      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "1h" });
        res.json({ token });
      } else {
        res.status(400).send("Invalid Credentials");
      }
    } else {
      res.status(400).send("User does not exist");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
