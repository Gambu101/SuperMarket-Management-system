const pool = require('./db');

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('Connection successful:', rows[0].result); // Should print 2
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();