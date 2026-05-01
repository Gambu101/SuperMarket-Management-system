# SuperMarket Management System - TODO

## Phase 1: Hide Credentials from GitHub ✅ COMPLETE

### 1.1 Create `.gitignore`
- [x] Add entries to exclude `.env`, `node_modules/`, and other sensitive files
- [x] Add `.DS_Store`, `*.log`, `package-lock.json` to exclude

### 1.2 Create `.env.example`
- [x] Create template showing required environment variables without values
- [x] Include: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, SECRET_KEY, DB_PASSWORD

### 1.3 Update `server/db.js`
- [x] Use environment variables instead of hardcoded credentials
- [x] Add dotenv require

---

## Phase 2: Features

### 2.1 Stock Activity Log
- [ ] Create `StockActivityLog` table
- [ ] Track all inventory changes (ADD, EDIT, DELETE)
- [ ] Include user_id, timestamp, previous/new quantities

### 2.2 Unit Price in Transactions
- [ ] Add `unit_price` column to Transactions table
- [ ] Track individual item prices at time of sale

### 2.3 User Roles
- [ ] Add `role` column to Users table
- [ ] Implement role-based access control (admin, manager, user)

---

## Status: Phase 1 - In Progress
