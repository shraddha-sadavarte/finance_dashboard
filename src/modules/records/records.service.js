import { pool } from '../../config/db.js';
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from '../../utils/errors.js';

// ─── Validate Record Input ────────────────────────────────────────
const validateRecordInput = ({ amount, type, category, date }) => {
  if (amount !== undefined) {
    if (isNaN(amount) || Number(amount) <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }
  }
  if (type !== undefined) {
    if (!['INCOME', 'EXPENSE'].includes(type)) {
      throw new ValidationError('Type must be either INCOME or EXPENSE');
    }
  }
  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim() === '') {
      throw new ValidationError('Category cannot be empty');
    }
  }
  if (date !== undefined) {
    if (isNaN(new Date(date).getTime())) {
      throw new ValidationError('Invalid date format. Use YYYY-MM-DD');
    }
  }
};

// ─── Create Record ────────────────────────────────────────────────
// Any logged in user creates record under their own user_id
export const createRecord = async ({ amount, type, category, date, description, userId }) => {
  if (!amount || !type || !category || !date) {
    throw new ValidationError('Amount, type, category and date are required');
  }
  validateRecordInput({ amount, type, category, date });

  const [result] = await pool.query(
    `INSERT INTO financial_records
      (user_id, amount, type, category, date, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, Number(amount), type, category.trim(), date, description || null]
  );

  return getRecordById(result.insertId);
};

// ─── Get All Records ──────────────────────────────────────────────
export const getAllRecords = async ({ page, limit, type, category, startDate, endDate, search }) => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE 1=1';
  const params = [];

  if (type)      { whereClause += ' AND r.type = ?';             params.push(type); }
  if (category)  { whereClause += ' AND r.category LIKE ?';      params.push(`%${category}%`); }
  if (startDate) { whereClause += ' AND r.date >= ?';            params.push(startDate); }
  if (endDate)   { whereClause += ' AND r.date <= ?';            params.push(endDate); }
  if (search)    { whereClause += ' AND (r.category LIKE ? OR r.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM financial_records r ${whereClause}`, params
  );
  const total = countResult[0].total;

  const [records] = await pool.query(
    `SELECT r.id, r.amount, r.type, r.category, r.date, r.description,
            r.created_at, r.updated_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email
     FROM financial_records r
     JOIN users u ON r.user_id = u.id
     ${whereClause}
     ORDER BY r.date DESC, r.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { records, total };
};

export const getMyRecords = async ({ userId, page, limit, type, category, startDate, endDate, search }) => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE r.user_id = ?';
  const params = [userId];

  if (type)      { whereClause += ' AND r.type = ?';                                   params.push(type); }
  if (category)  { whereClause += ' AND r.category LIKE ?';                            params.push(`%${category}%`); }
  if (startDate) { whereClause += ' AND r.date >= ?';                                  params.push(startDate); }
  if (endDate)   { whereClause += ' AND r.date <= ?';                                  params.push(endDate); }
  if (search)    { whereClause += ' AND (r.category LIKE ? OR r.description LIKE ?)';  params.push(`%${search}%`, `%${search}%`); }

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM financial_records r ${whereClause}`, params
  );
  const total = countResult[0].total;

  const [records] = await pool.query(
    `SELECT
       r.id,
       r.user_id,        
       r.amount,
       r.type,
       r.category,
       r.date,
       r.description,
       r.created_at,
       r.updated_at
     FROM financial_records r
     ${whereClause}
     ORDER BY r.date DESC, r.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { records, total };
};

// ─── Get Single Record ────────────────────────────────────────────
export const getRecordById = async (id) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.amount, r.type, r.category, r.date,
            r.description, r.created_at, r.updated_at,
            u.id AS user_id, u.name AS user_name
     FROM financial_records r
     JOIN users u ON r.user_id = u.id
     WHERE r.id = ?`,
    [id]
  );
  if (rows.length === 0) throw new NotFoundError('Record');
  return rows[0];
};

// ─── Update Record ────────────────────────────────────────────────
// Users can only update their OWN records
export const updateRecord = async (id, { amount, type, category, date, description }, requestingUserId, requestingUserRole) => {

  const record = await getRecordById(id);

  // ✅ Ownership check — only owner or ADMIN can update
  if (record.user_id !== requestingUserId && requestingUserRole !== 'ADMIN') {
    throw new ForbiddenError('You can only edit your own records');
  }

  validateRecordInput({ amount, type, category, date });

  const updates = [];
  const params  = [];

  if (amount      !== undefined) { updates.push('amount = ?');      params.push(Number(amount)); }
  if (type        !== undefined) { updates.push('type = ?');        params.push(type); }
  if (category    !== undefined) { updates.push('category = ?');    params.push(category.trim()); }
  if (date        !== undefined) { updates.push('date = ?');        params.push(date); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }

  if (updates.length === 0) throw new ValidationError('No fields provided to update');

  params.push(id);
  await pool.query(
    `UPDATE financial_records SET ${updates.join(', ')} WHERE id = ?`, params
  );

  return getRecordById(id);
};

// ─── Delete Record ────────────────────────────────────────────────
// Users can only delete their OWN records
export const deleteRecord = async (id, requestingUserId, requestingUserRole) => {

  const record = await getRecordById(id);

  // ✅ Ownership check — only owner or ADMIN can delete
  if (record.user_id !== requestingUserId && requestingUserRole !== 'ADMIN') {
    throw new ForbiddenError('You can only delete your own records');
  }

  await pool.query('DELETE FROM financial_records WHERE id = ?', [id]);
  return { message: 'Record deleted successfully' };
};