// Get the client
const mysql = require('mysql2/promise');
// Create the connection to database
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'practice_express',
  password: '1234',
  waitForConnections: true,
  connectionLimit: 50
});

module.exports = connection;