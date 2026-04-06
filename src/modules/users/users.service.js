import { pool } from '../../config/db.js';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from '../../utils/errors.js';

// Get All Users (with pagination + search) 
export const getAllUsers = async ({ page, limit, search, role }) => {

  // Calculate offset — if page=2, limit=10 → skip first 10 rows
  const offset = (page - 1) * limit;

  // Base query 
  let whereClause = 'WHERE 1=1'; //1=1 is alwys true, so we can safely append AND conditions without worrying about syntax
  const params = [];

  // Search by name or email
  if (search) {
    whereClause += ' AND (name LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
    // LIKE %search% means "contains this text anywhere"
  }

  // Filter by role
  if (role) {
    whereClause += ' AND role = ?';
    params.push(role);
  }

  // Get total count first (for pagination metadata)
  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM users ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  // Get actual paginated data
  const [users] = await pool.query(
    `SELECT id, name, email, role, is_active, created_at, updated_at
     FROM users
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { users, total };
};

// Get Single User 
export const getUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, name, email, role, is_active, created_at, updated_at
     FROM users
     WHERE id = ?`,
    [id]
  );

  if (rows.length === 0) {
    throw new NotFoundError('User');
  }

  return rows[0];
};

// Update User Role
export const updateUserRole = async (id, role) => {
  const allowedRoles = ['VIEWER', 'ANALYST', 'ADMIN'];

  if (!allowedRoles.includes(role)) {
    throw new ValidationError(`Invalid role. Must be one of: ${allowedRoles.join(', ')}`);
  }

  // Check user exists first
  await getUserById(id);

  await pool.query(
    'UPDATE users SET role = ? WHERE id = ?',
    [role, id]
  );

  return getUserById(id);
};

// Update User Status (activate/deactivate) 
export const updateUserStatus = async (id, isActive, requestingUserId) => {

  // Prevent admin from deactivating themselves
  if (Number(id) === Number(requestingUserId)) {
    throw new ValidationError('You cannot change your own account status');
  }

  // Check user exists
  await getUserById(id);

  await pool.query(
    'UPDATE users SET is_active = ? WHERE id = ?',
    [isActive, id]
  );

  return getUserById(id);
};

// Delete User 
export const deleteUser = async (id, requestingUserId) => {

  // Prevent admin from deleting themselves
  if (Number(id) === Number(requestingUserId)) {
    throw new ValidationError('You cannot delete your own account');
  }

  // Check user exists
  await getUserById(id);

  await pool.query('DELETE FROM users WHERE id = ?', [id]);

  return { message: 'User deleted successfully' };
};