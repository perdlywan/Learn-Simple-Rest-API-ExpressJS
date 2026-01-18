// Represents a user record and contains all database interactions for users.
const { pool } = require('../config/database');

class User {
  constructor({ id, name, email, created_at: createdAt, updated_at: updatedAt, password }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  // Paginate users with total counts for API responses.
  static async findAll({ page, perPage }) {
    const offset = (page - 1) * perPage;
    const [rowsResult, totalResult] = await Promise.all([
      pool.query(
        'SELECT id, name, email, created_at, updated_at FROM users WHERE deleted_at is null ORDER BY id DESC LIMIT ? OFFSET ?',
        [perPage, offset]
      ),
      pool.query('SELECT COUNT(*) AS total FROM users'),
    ]);
    const rows = rowsResult[0];
    const total = totalResult[0][0].total;

    return {
      data: rows.map((row) => new User(row)),
      meta: {
        page,
        per_page: perPage,
        count: rows.length,
        total_count: total,
        total_pages: Math.max(1, Math.ceil(total / perPage)),
      },
    };
  }

  // Fetch a single user record or null when the id is missing.
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? and deleted_at is null',
      [id]
    );
    if (!rows.length) {
      return null;
    }

    return new User(rows[0]);
  }

  // Insert a new user and return the hydrated model with the generated id.
  static async create({ name, email, password }) {
    const [res] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
    return User.findById(res.insertId);
  }

  static async findWithPasswordByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, created_at, updated_at FROM users WHERE email = ?',
      [email],
    );

    if (!rows.length) {
      return null;
    }

    const row = rows[0];
    return {
      user: new User(row),
      passwordHash: row.password,
    };
  }

  // Update an existing user with partial payloads; returns null when the record is absent.
  static async update(id, payload) {
    const { name, email } = payload;
    await pool.query('UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE id = ?', [
      name,
      email,
      id,
    ]);
    return User.findById(id);
  }

  static async updatePassword(id, hashedPassword) {
    await pool.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [
      hashedPassword,
      id,
    ]);
    return User.findById(id);
  }

  // Delete a user after confirming existence to report a friendly null instead of success.
  static async remove(id) {
    const existing = await User.findById(id);
    // if (!existing) {
    //   return null;
    // }

    await pool.query('UPDATE users SET deleted_at = now() WHERE id = ? and deleted_at is null', [id]);
    return existing;
  }

  static async getUserRoles(id) {
    const [rows] = await pool.query(
      `SELECT r.tag FROM roles r
       JOIN user_role ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [id]
    );

    return rows.map(row => row.tag);
  }
}

module.exports = User;
