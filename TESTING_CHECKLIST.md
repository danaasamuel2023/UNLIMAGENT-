# 🧪 Testing Checklist - Agent Store System

Use this checklist to verify all features are working correctly after running the database migration.

---

## ✅ Pre-Testing Setup

- [ ] Database migration completed successfully
- [ ] Admin account created via `npx tsx scripts/setup-admin.ts`
- [ ] Agent account created (with role set to 'agent')
- [ ] Test data seeded via `npx tsx scripts/seed-test-data.ts`
- [ ] Dev server running on http://localhost:3001

---

## 🔐 Authentication Tests

### Login & Signup
- [ ] Can sign up with new account
- [ ] Email verification works (if enabled)
- [ ] Can login with correct credentials
- [ ] Login redirects based on role (admin/agent)
- [ ] Logout works correctly
- [ ] Protected routes redirect to login

---

## 👤 Agent Dashboard Tests

### Access Control
- [ ] Agent can access `/agent` routes
- [ ] Agent cannot access `/admin` routes
- [ ] Unauthenticated users redirected to login

### Dashboard View
- [ ] Wallet summary shows correct balances
- [ ] Recent transactions display
- [ ] Empty state shows when no data exists
- [ ] All navigation links work

### Store Management
- [ ] Can create new store at `/agent/store/create`
- [ ] Store information displays correctly
- [ ] Store slug is unique
- [ ] Contact info saved properly
- [ ] Error handling for missing fields
- [ ] Redirect to store page after creation

### Product Management
- [ ] Product list page loads at `/agent/products`
- [ ] Can create new product at `/agent/products/create`
- [ ] Profit calculation works correctly
- [ ] Network selection works
- [ ] Can edit product at `/agent/products/edit/[id]`
- [ ] Product status toggle works
- [ ] Products display with correct information

### Order Management
- [ ] Order list page loads at `/agent/orders`
- [ ] Orders display with correct information
- [ ] Can view order details at `/agent/orders/[id]`
- [ ] Can update order status
- [ ] Can update payment status
- [ ] Wallet updates when order marked completed
- [ ] Order status changes reflect in database

### Earnings & Withdrawals
- [ ] Earnings page shows correct wallet balance
- [ ] Available balance displays correctly
- [ ] Total earnings calculated properly
- [ ] Can request withdrawal at `/agent/withdrawals/request`
- [ ] Minimum withdrawal validation (GHS 10)
- [ ] Withdrawal methods display (Mobile Money, Bank)
- [ ] Account details captured correctly
- [ ] Withdrawal history displays

### Customers
- [ ] Customer list page loads at `/agent/customers`
- [ ] Customers created when orders placed
- [ ] Customer purchase history tracked
- [ ] Customer type displayed correctly

---

## 👨‍💼 Admin Dashboard Tests

### Access Control
- [ ] Admin can access `/admin` routes
- [ ] Admin can access all sections
- [ ] Non-admins cannot access admin routes

### Dashboard View
- [ ] Dashboard stats display correctly
- [ ] Total stores count accurate
- [ ] Pending withdrawals count accurate
- [ ] Total transactions count accurate

### Withdrawal Management
- [ ] Withdrawal list displays at `/admin/withdrawals`
- [ ] Status counts are accurate (pending, processing, completed, rejected)
- [ ] Can approve pending withdrawals
- [ ] Can reject withdrawals
- [ ] Can mark processing as completed
- [ ] Wallet updates correctly on status change
- [ ] Agent balance updated appropriately

---

## 🌐 Public Store Page Tests

### Store Access
- [ ] Can access store at `/store/[slug]`
- [ ] Store not found error displays for invalid slugs
- [ ] Store information displays correctly
- [ ] Contact details display from JSONB
- [ ] WhatsApp button works (if number provided)

### Product Display
- [ ] Products display on public page
- [ ] Active products only shown
- [ ] Products sorted correctly
- [ ] Network labels display correctly
- [ ] Pricing formatted correctly
- [ ] Stock status displays

### Purchase Flow
- [ ] "Buy Now" button shows form
- [ ] Form validates required fields
- [ ] Can submit order with phone number
- [ ] Order creates transaction record
- [ ] Customer record created/updated
- [ ] Success message displays
- [ ] Order appears in agent dashboard

---

## 🔄 Order Processing Flow

### Complete Purchase Cycle
1. [ ] Customer places order on public store page
2. [ ] Transaction created with "pending" status
3. [ ] Order appears in agent's order list
4. [ ] Agent views order details
5. [ ] Agent updates payment status to "completed"
6. [ ] Agent updates order status to "processing"
7. [ ] Agent updates order status to "completed"
8. [ ] Agent's wallet balance increases by profit amount
9. [ ] Agent's total earnings updated

---

## 💰 Withdrawal Processing Flow

### Complete Withdrawal Cycle
1. [ ] Agent has sufficient balance (GHS 10+)
2. [ ] Agent requests withdrawal
3. [ ] Withdrawal appears in admin panel
4. [ ] Admin approves withdrawal (status: processing)
5. [ ] Wallet pending balance increases
6. [ ] Admin marks as completed
7. [ ] Agent's withdrawn total increases
8. [ ] Pending balance returns to zero

---

## 📊 Data Integrity Tests

### Database Relations
- [ ] Products linked to correct store
- [ ] Transactions linked to correct agent
- [ ] Customers linked to correct store
- [ ] Withdrawals linked to correct agent
- [ ] Foreign key constraints work

### Calculations
- [ ] Profit = selling_price - base_price
- [ ] Profit margin calculated correctly
- [ ] Wallet balances sum correctly
- [ ] Total earnings update correctly
- [ ] Capacity in MB = capacity in GB * 1024

---

## 🐛 Error Handling Tests

### Validation
- [ ] Phone number format validation
- [ ] Email format validation
- [ ] Required fields enforced
- [ ] Min/max values enforced
- [ ] Price validation (selling > base)

### Edge Cases
- [ ] Store creation with duplicate slug handled
- [ ] Empty product list handled gracefully
- [ ] Withdrawal with insufficient balance rejected
- [ ] Order updates when no products exist
- [ ] Navigation with no store created

---

## 🎨 UI/UX Tests

### Responsive Design
- [ ] Desktop layout works correctly
- [ ] Mobile layout works correctly
- [ ] Tablet layout works correctly
- [ ] Forms are usable on mobile

### User Experience
- [ ] Loading states display during async operations
- [ ] Error messages are clear and helpful
- [ ] Success messages display appropriately
- [ ] Navigation is intuitive
- [ ] Breadcrumbs work where applicable

---

## 🚀 Performance Tests

### Basic Performance
- [ ] Pages load in reasonable time
- [ ] Database queries are efficient
- [ ] No N+1 query issues
- [ ] Images load properly (if applicable)

---

## 🔒 Security Tests

### Access Control
- [ ] Users can only forward their own data
- [ ] Agents cannot access other agents' stores
- [Image] Unauthorized API requests rejected
- [ ] SQL injection prevention works
- [ ] XSS prevention works

---

## 📝 Known Issues / Notes

Document any issues found during testing:

```
Issue: [Description]
Severity: [High/Medium/Low]
Status: [Open/Fixed]
```

---

## ✨ Post-Testing

- [ ] All critical tests passed
- [ ] No blocking bugs found
- [ ] System ready for production
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Backup strategy in place

---

## 🎉 Testing Complete!

**Date:** _______________

**Tested By:** _______________

**Overall Status:** [ ] ✅ Pass  [ ] ⚠️ Pass with issues  [ ] ❌ Fail

**Production Ready:** [ ] Yes  [ ] No

**Notes:**
```
[Add any additional notes or observations]




```

