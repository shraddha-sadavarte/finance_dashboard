# Finance Dashboard Backend

A RESTful backend API for a finance dashboard system built with Node.js, Express, and MySQL. Supports role-based access control, financial record management, and dashboard analytics.

---

## Tech Stack

| Layer          | Technology        |
|----------------|-------------------|
| Runtime        | Node.js (ES Modules) |
| Framework      | Express.js        |
| Database       | MySQL             |
| Authentication | JWT (JSON Web Tokens) |
| Password Hash  | bcryptjs          |
| Environment    | dotenv            |

---

## Project Structure
finance-dashboard/
├── src/
│   ├── app.js                        ← Entry point
│   ├── config/
│   │   ├── db.js                     ← MySQL connection pool
│   │   └── env.js                    ← Environment variable loader
│   ├── middleware/
│   │   ├── auth.js                   ← JWT authentication
│   │   ├── rbac.js                   ← Role based access control
│   │   └── errorHandler.js           ← Global error handler
│   ├── modules/
│   │   ├── auth/                     ← Register & Login
│   │   ├── users/                    ← User management
│   │   ├── records/                  ← Financial records CRUD
│   │   └── dashboard/                ← Analytics & summaries
│   └── utils/
│       ├── errors.js                 ← Custom error classes
│       └── response.js               ← Standard response helpers
├── .env.example                      ← Environment variable template
├── README.md
└── package.json

---

## Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd finance-dashboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Open `.env` and fill in your values:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=finance_dashboard
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Set up the database

Open MySQL and run:
```sql
CREATE DATABASE IF NOT EXISTS finance_dashboard;
USE finance_dashboard;

CREATE TABLE users (
  id          INT           NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('VIEWER','ANALYST','ADMIN') NOT NULL DEFAULT 'VIEWER',
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email (email),
  INDEX idx_role  (role)
);

CREATE TABLE financial_records (
  id          INT             NOT NULL AUTO_INCREMENT,
  user_id     INT             NOT NULL,
  amount      DECIMAL(15, 2)  NOT NULL,
  type        ENUM('INCOME','EXPENSE') NOT NULL,
  category    VARCHAR(100)    NOT NULL,
  date        DATE            NOT NULL,
  description TEXT,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_records_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_user_id  (user_id),
  INDEX idx_type     (type),
  INDEX idx_category (category),
  INDEX idx_date     (date)
);
```

### 5. Start the server
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3000`

---

## Roles and Permissions

| Action                  | VIEWER | ANALYST | ADMIN |
|-------------------------|--------|---------|-------|
| Login / Register        | ✅     | ✅      | ✅    |
| View own profile        | ✅     | ✅      | ✅    |
| View own records        | ✅     | ✅      | ✅    |
| View all records        | ❌     | ✅      | ✅    |
| Create records          | ❌     | ❌      | ✅    |
| Update records          | ❌     | ❌      | ✅    |
| Delete records          | ❌     | ❌      | ✅    |
| View dashboard summary  | ✅     | ✅      | ✅    |
| View recent activity    | ✅     | ✅      | ✅    |
| View analytics/trends   | ❌     | ✅      | ✅    |
| Manage users            | ❌     | ❌      | ✅    |

## API Reference

### Authentication
All protected routes require this header:
Authorization: Bearer <your_jwt_token>

### Auth Routes — Public

| Method | Endpoint                  | Description        |
|--------|---------------------------|--------------------|
| POST   | /api/v1/auth/register     | Register new user  |
| POST   | /api/v1/auth/login        | Login, get token   |

**Register request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "ADMIN"
}
```

**Login request body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ADMIN"
    }
  }
}
```

### User Routes — ADMIN only (except /me)

| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | /api/v1/users/me              | Get own profile          |
| GET    | /api/v1/users                 | List all users           |
| GET    | /api/v1/users/:id             | Get single user          |
| PATCH  | /api/v1/users/:id/role        | Update user role         |
| PATCH  | /api/v1/users/:id/status      | Activate or deactivate   |
| DELETE | /api/v1/users/:id             | Delete user              |

**Query params for GET /users:**

?page=1&limit=10&search=john&role=VIEWER
---

### Records Routes

| Method | Endpoint                | Role Required       | Description          |
|--------|-------------------------|---------------------|----------------------|
| POST   | /api/v1/records         | ADMIN               | Create record        |
| GET    | /api/v1/records         | ADMIN, ANALYST      | Get all records      |
| GET    | /api/v1/records/my      | Any logged in user  | Get own records      |
| GET    | /api/v1/records/:id     | ADMIN, ANALYST      | Get single record    |
| PATCH  | /api/v1/records/:id     | ADMIN               | Update record        |
| DELETE | /api/v1/records/:id     | ADMIN               | Delete record        |

**Create record request body:**
```json
{
  "amount": 50000,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01",
  "description": "Monthly salary"
}
```

**Query params for GET /records:**
?page=1&limit=10&type=EXPENSE&category=Food&startDate=2026-01-01&endDate=2026-04-30&search=salary

---

### Dashboard Routes

| Method | Endpoint                          | Role Required      | Description            |
|--------|-----------------------------------|--------------------|------------------------|
| GET    | /api/v1/dashboard/summary         | All roles          | Income, expenses, net  |
| GET    | /api/v1/dashboard/recent          | All roles          | Last 10 transactions   |
| GET    | /api/v1/dashboard/categories      | ANALYST, ADMIN     | Category breakdown     |
| GET    | /api/v1/dashboard/trends/monthly  | ANALYST, ADMIN     | Monthly trends         |
| GET    | /api/v1/dashboard/trends/weekly   | ANALYST, ADMIN     | Weekly trends          |

**Query params:**
/dashboard/categories?type=EXPENSE
/dashboard/recent?limit=20

---

## Standard Response Format

Every API response follows this structure:

**Success:**
```json
{
  "success": true,
  "message": "Description of what happened",
  "data": { }
}
```

**Paginated:**
```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": [ ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Description of what went wrong",
  "data": null
}
```

---

## Error Codes

| Status Code | Meaning                              |
|-------------|--------------------------------------|
| 200         | Success                              |
| 201         | Created successfully                 |
| 400         | Bad request / validation error       |
| 401         | Unauthorized — missing or invalid token |
| 403         | Forbidden — insufficient role        |
| 404         | Resource not found                   |
| 409         | Conflict — duplicate entry           |
| 500         | Internal server error                |

---

## Design Decisions

**Why MySQL over MongoDB?**
Financial data is relational by nature — users own records, records have strict types. A relational database with ACID compliance is the correct choice for financial systems where data integrity is critical.

**Why JWT over sessions?**
JWT is stateless — the server doesn't need to store session data. This makes the API scalable and easy to consume from any frontend or mobile client.

**Why role is stored in JWT token?**
To avoid hitting the database on every request just to check the user's role. The role is embedded in the token at login time and verified by the RBAC middleware without any DB query.

**Why DECIMAL for amounts?**
Floating point numbers (FLOAT, DOUBLE) cannot represent all decimal values exactly due to binary representation. For financial data, DECIMAL stores exact values — 0.1 + 0.2 = 0.3, always.

**Why connection pooling?**
Opening a new database connection for every request is expensive. A pool of reusable connections handles concurrent requests efficiently without resource exhaustion.