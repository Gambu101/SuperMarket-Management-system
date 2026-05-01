# TODO: Admin and Manager Functionality Implementation

## Analysis Complete - What's Left to Build

Based on thorough analysis of the codebase, here's what's currently implemented and what's missing:

---

## Current Implementation (What Works)

| Feature | Status | Description |
|---------|--------|-------------|
| User Sign Up | ✅ | Username, firstname, lastname, email, password registration |
| User Sign In | ✅ | JWT token-based authentication |
| Dashboard | ✅ | Welcome message with username |
| Inventory Management | ✅ | Add, edit, delete products with CRUD |
| POS/Sales | ✅ | Cart-based sale system |
| Transaction History | ✅ | View own transactions |
| Low Stock Alerts | ✅ | Email notifications when items are low |

---

## What's Missing for Admin & Manager Roles

### 1. Database Schema Updates (HIGH PRIORITY)

- [x] **Add `role` column to Users table**
  - Added: `role` ENUM('user', 'manager', 'admin') DEFAULT 'user'
  - Migration script created: `add_role_to_users.sql`
  - Index created for performance

- [x] **Fix Transactions table schema**
  - Added `unit_price` column (DECIMAL(10,2))
  - Migration script created: `add_unit_price_to_transactions.sql`
  - Updated existing records to calculate unit_price = total_price / quantity

### 2. Backend API Updates (HIGH PRIORITY)

- [x] **Update `/api/signup`** to accept role (admin-only)
  - Updated to accept optional role parameter, defaults to 'user'
  - Admin can create users with specific roles via `/api/admin/users`

- [x] **Update `/api/signin`** to return user role in token
  - JWT token now includes role in payload
  - Token structure: `{ userId, role }`

- [x] **Update `authenticateToken`** middleware to decode role from token
  - Middleware now fetches role from database and adds to req.user
  - req.user now contains: `{ id, username, role }`

- [x] **Add Admin APIs:**
  - [x] `GET /api/admin/users` - List all users with roles
  - [x] `POST /api/admin/users` - Create user (with role assignment)
  - [x] `PUT /api/admin/users/:id/role` - Change user role
  - [x] `DELETE /api/admin/users/:id` - Delete user (prevents self-deletion)
  - [x] `GET /api/admin/all-transactions` - View all transactions with user info

- [x] **Add Manager APIs:**
  - [x] `GET /api/manager/inventory` - View all inventory
  - [x] `GET /api/manager/transactions` - View all transactions
  - [x] `GET /api/manager/reports` - Sales reports (product sales, daily sales, inventory value)

### 3. Additional Updates Made

- [x] **Updated `/api/user`** endpoint to return role information
- [x] **Fixed `/api/sale`** endpoint to properly store unit_price in transactions
- [x] **Added role-based middleware:** `requireAdmin()` and `requireManager()`
- [x] **Created migration SQL scripts** for database schema changes

---

## Next Steps

1. **Run Database Migrations:**
   - Execute `add_role_to_users.sql` in your MySQL database
   - Execute `add_unit_price_to_transactions.sql` in your MySQL database

2. **Frontend Updates Needed:**
   - Update SignIn/SignUp components to handle roles
   - Add admin/manager dashboards with appropriate UI
   - Implement role-based routing and component visibility
   - Update API calls to handle new endpoints

3. **Testing:**
   - Test all new admin and manager endpoints
   - Verify role-based access control works correctly
   - Test database migrations don't break existing data

### 3. Frontend Updates (HIGH PRIORITY)

- [ ] **Update Sign Up** to include role selection (admin only)
- [ ] **Update Sign In** to store role in localStorage
- [ ] **Create Admin Dashboard** (`/admin`)
  - User management panel
  - System-wide inventory view
  - All transactions view
  - Settings management

- [ ] **Create Manager Dashboard** (`/manager`)
  - Store-wide inventory
  - Sales reports
  - Transaction oversight

- [ ] **Update App.jsx** with role-based routing
- [ ] **Create role-based Navbar** (show different links based on role)

### 4. Implementation Order (Recommended)

#### Phase 1: Database & Auth (Do First)
1. Add `role` column to Users table
2. Update backend to include role in JWT
3. Update sign-in to return role
4. Update client to store role

#### Phase 2: Admin Features (Do Second)
5. Create Admin Dashboard page
6. Create User Management component
7. Add admin API endpoints

#### Phase 3: Manager Features (Do Third)
8. Create Manager Dashboard page
9. Add reports functionality
10. Add manager API endpoints

---

## Quick Summary

**Currently the system treats ALL users the same** - there's NO role-based access control. Every user can:
- See their own transactions only
- Manage their own inventory only
- There's no distinction between regular staff, managers, or admins

**To add Admin & Manager functionality, you need to:**
1. Add a `role` column to the database
2. Update authentication to handle roles
3. Create admin-only endpoints
4. Create manager-only endpoints  
5. Build admin/manager dashboards in React
6. Add role-based routing

---

## Files to Modify

| File | Changes Needed |
|------|----------------|
| `server/index.js` | Add role to JWT, new admin/manager endpoints |
| Database | Add role column, fix transactions schema |
| `client/superinv/src/App.jsx` | Add role-based routes |
| `client/superinv/src/pages/SignIn/SignIn.jsx` | Store role in localStorage |
| `client/superinv/src/pages/SignUp/SignUp.jsx` | Allow role selection (admin) |
| New: `AdminDashboard.jsx` | Admin panel |
| New: `ManagerDashboard.jsx` | Manager panel |
| New: `UserManagement.jsx` | Admin user management |
