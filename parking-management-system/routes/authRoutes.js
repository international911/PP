const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const router = express.Router();

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

router.post('/register', async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO users (username, email) VALUES (?, ?)',
      [name, email] 
    );

    const token = jwt.sign({ id: result.insertId, email: email, username: name }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(200).json({ token, userId: result.insertId, username: name, email: email });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

module.exports = router;
