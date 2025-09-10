const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expense_tracker',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
  timeout: parseInt(process.env.DB_TIMEOUT) || 60000
};

let connection;

// Create database connection
async function createConnection() {
  try {
    if (!connection) {
      connection = await mysql.createConnection(dbConfig);
      console.log('Database connected successfully');

      // Test the connection
      await connection.execute('SELECT 1');
      console.log('Database connection test successful');
    }
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// Get database connection
async function getConnection() {
  if (!connection) {
    await createConnection();
  }
  return connection;
}

// Execute query with parameters
async function executeQuery(query, params = []) {
  try {
    const conn = await getConnection();
    const [rows, fields] = await conn.execute(query, params);
    return [rows, fields];
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
}

// Execute query and return first row
async function executeQuerySingle(query, params = []) {
  const [rows] = await executeQuery(query, params);
  return rows.length > 0 ? rows[0] : null;
}

// Execute query and return first column of first row
async function executeQueryScalar(query, params = []) {
  const [rows] = await executeQuery(query, params);
  if (rows.length > 0) {
    const firstRow = rows[0];
    return Object.values(firstRow)[0];
  }
  return null;
}

// Initialize database tables
async function initializeTables() {
  try {
    const conn = await getConnection();

    // Create users table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        avatar VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create transactions table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        tags JSON,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_type (type),
        INDEX idx_category (category),
        INDEX idx_timestamp (timestamp),
        INDEX idx_user_timestamp (user_id, timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create categories table for predefined categories
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(7),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_category_type (name, type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Insert default categories
    await insertDefaultCategories(conn);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Insert default categories
async function insertDefaultCategories(conn) {
  const defaultCategories = [
    // Income categories
    ['Salary', 'income', '💼', '#27ae60'],
    ['Freelance', 'income', '💻', '#3498db'],
    ['Investment', 'income', '📈', '#9b59b6'],
    ['Business', 'income', '🏢', '#e67e22'],
    ['Other Income', 'income', '💰', '#f39c12'],

    // Expense categories
    ['Food & Dining', 'expense', '🍽️', '#e74c3c'],
    ['Transportation', 'expense', '🚗', '#3498db'],
    ['Shopping', 'expense', '🛍️', '#9b59b6'],
    ['Entertainment', 'expense', '🎬', '#e67e22'],
    ['Bills & Utilities', 'expense', '💡', '#f39c12'],
    ['Healthcare', 'expense', '🏥', '#27ae60'],
    ['Education', 'expense', '📚', '#1abc9c'],
    ['Travel', 'expense', '✈️', '#34495e'],
    ['Other Expense', 'expense', '📦', '#95a5a6']
  ];

  for (const [name, type, icon, color] of defaultCategories) {
    await conn.execute(
      'INSERT IGNORE INTO categories (name, type, icon, color, is_default) VALUES (?, ?, ?, ?, TRUE)',
      [name, type, icon, color]
    );
  }
}

// Close database connection
async function closeConnection() {
  if (connection) {
    await connection.end();
    connection = null;
    console.log('Database connection closed');
  }
}

// Health check
async function healthCheck() {
  try {
    const conn = await getConnection();
    await conn.execute('SELECT 1');
    return { status: 'healthy', message: 'Database connection is working' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
}

module.exports = {
  createConnection,
  getConnection,
  executeQuery,
  executeQuerySingle,
  executeQueryScalar,
  initializeTables,
  closeConnection,
  healthCheck,
  dbConfig
};
