import { pool } from '../../config/db.js';

// ─── Summary ──────────────────────────────────────────────────────
// Total income, total expenses, net balance
export const getSummary = async () => {

  const [rows] = await pool.query(`
    SELECT
      SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS total_expenses,
      SUM(CASE WHEN type = 'INCOME'  THEN amount
               WHEN type = 'EXPENSE' THEN -amount
               ELSE 0 END)                                   AS net_balance,
      COUNT(*)                                               AS total_records,
      COUNT(CASE WHEN type = 'INCOME'  THEN 1 END)          AS income_count,
      COUNT(CASE WHEN type = 'EXPENSE' THEN 1 END)          AS expense_count
    FROM financial_records
  `);

  const summary = rows[0];

  // If no records yet — return zeros instead of null
  return {
    total_income:   Number(summary.total_income)   || 0,
    total_expenses: Number(summary.total_expenses) || 0,
    net_balance:    Number(summary.net_balance)    || 0,
    total_records:  Number(summary.total_records)  || 0,
    income_count:   Number(summary.income_count)   || 0,
    expense_count:  Number(summary.expense_count)  || 0,
  };
};

// ─── Category Breakdown ───────────────────────────────────────────
// How much spent/earned per category
export const getCategoryBreakdown = async (type) => {

  // type param lets frontend ask for INCOME or EXPENSE breakdown
  // if not provided — show all categories
  let whereClause = '';
  const params = [];

  if (type && ['INCOME', 'EXPENSE'].includes(type)) {
    whereClause = 'WHERE type = ?';
    params.push(type);
  }

  const [rows] = await pool.query(`
    SELECT
      category,
      type,
      COUNT(*)        AS record_count,
      SUM(amount)     AS total_amount,
      AVG(amount)     AS avg_amount,
      MIN(amount)     AS min_amount,
      MAX(amount)     AS max_amount
    FROM financial_records
    ${whereClause}
    GROUP BY category, type
    ORDER BY total_amount DESC
  `, params);

  // Convert decimals to numbers
  return rows.map(row => ({
    category:     row.category,
    type:         row.type,
    record_count: Number(row.record_count),
    total_amount: Number(row.total_amount),
    avg_amount:   Number(Number(row.avg_amount).toFixed(2)),
    min_amount:   Number(row.min_amount),
    max_amount:   Number(row.max_amount),
  }));
};

// ─── Monthly Trends ───────────────────────────────────────────────
// Income vs Expense for each month — last 12 months
export const getMonthlyTrends = async () => {

  const [rows] = await pool.query(`
    SELECT
      DATE_FORMAT(date, '%Y-%m')                              AS month,
      DATE_FORMAT(date, '%b %Y')                             AS month_label,
      SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS expenses,
      SUM(CASE WHEN type = 'INCOME'  THEN amount
               WHEN type = 'EXPENSE' THEN -amount
               ELSE 0 END)                                   AS net
    FROM financial_records
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY
      DATE_FORMAT(date, '%Y-%m'),
      DATE_FORMAT(date, '%b %Y')
    ORDER BY month ASC
  `);

  return rows.map(row => ({
    month:       row.month,
    month_label: row.month_label,
    income:      Number(row.income),
    expenses:    Number(row.expenses),
    net:         Number(row.net),
  }));
};

// ─── Weekly Trends ────────────────────────────────────────────────
// Income vs Expense per week — last 8 weeks
export const getWeeklyTrends = async () => {

  const [rows] = await pool.query(`
    SELECT
      YEAR(date)                                             AS year,
      WEEK(date, 1)                                         AS week_number,
      MIN(date)                                             AS week_start,
      MAX(date)                                             AS week_end,
      SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS expenses,
      SUM(CASE WHEN type = 'INCOME'  THEN amount
               WHEN type = 'EXPENSE' THEN -amount
               ELSE 0 END)                                   AS net
    FROM financial_records
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK)
    GROUP BY YEAR(date), WEEK(date, 1)
    ORDER BY year ASC, week_number ASC
  `);

  return rows.map(row => ({
    week_number: row.week_number,
    week_start:  row.week_start,
    week_end:    row.week_end,
    income:      Number(row.income),
    expenses:    Number(row.expenses),
    net:         Number(row.net),
  }));
};

// ─── Recent Activity ──────────────────────────────────────────────
// Last 10 transactions across all users
export const getRecentActivity = async (limit = 10) => {

  const [rows] = await pool.query(`
    SELECT
      r.id,
      r.amount,
      r.type,
      r.category,
      r.date,
      r.description,
      r.created_at,
      u.name  AS user_name,
      u.email AS user_email
    FROM financial_records r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
    LIMIT ?
  `, [limit]);

  return rows.map(row => ({
    ...row,
    amount: Number(row.amount),
  }));
};