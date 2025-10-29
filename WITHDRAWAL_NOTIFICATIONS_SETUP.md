# Withdrawal Notifications Setup

## Overview
When agents request withdrawals, admins are automatically notified through the admin notification system.

## What Was Implemented

### 1. Notification System
- Created `admin_notifications` table to store admin notifications
- Added notification types: `withdrawal_request`, `store_approval`, `transaction_issue`, etc.
- Automatic notification creation when agents request withdrawals

### 2. Database Migration
- **File**: `supabase/migrations/005_create_notifications.sql`
- Creates the `admin_notifications` table
- Adds database trigger that automatically creates notifications for withdrawal requests
- Includes priority levels (low, normal, high, urgent)

### 3. Updated Withdrawal API
- **File**: `app/api/agent/withdrawals/create/route.ts`
- Automatically creates admin notification when withdrawal is requested
- Includes withdrawal details: amount, agent info, payment method
- Sets priority based on withdrawal amount (> GHS 1000 = high priority)
- Provides direct link to view withdrawal in admin panel

### 4. Agent Features
- Agents can request withdrawals from their dashboard
- Withdrawal requests show admin approval details and payment information
- Full history of all withdrawal requests

## How It Works

### Agent Side
1. Agent navigates to `/agent/withdrawals/request`
2. Fills in withdrawal details (amount, payment method, account details)
3. Submits the request
4. Balance moves from `available_balance` to `pending_balance`
5. Admin receives automatic notification

### Admin Side
1. Admin receives notification in `admin_notifications` table
2. Notification includes:
   - Withdrawal ID
   - Agent name and store
   - Amount requested
   - Payment method
   - Direct link to process the withdrawal

### Processing Flow
1. **Pending**: Agent requests withdrawal, admin is notified
2. **Processing**: Admin reviews and starts processing
3. **Completed**: Admin confirms payment, balance moves to `total_withdrawn`
4. **Rejected**: Admin rejects, balance returns to `available_balance`

## Notification Structure

```json
{
  "type": "withdrawal_request",
  "title": "New Withdrawal Request",
  "message": "Agent 'Store Name' requested withdrawal of 500.00 GHS",
  "priority": "normal", // or "high" for amounts > 1000
  "action_data": {
    "withdrawal_id": "WDL123...",
    "agent_id": "uuid",
    "agent_store_name": "Store Name",
    "amount": 500.00,
    "method": "momo",
    "view_url": "/admin/withdrawals?view=uuid"
  }
}
```

## Setup Instructions

### 1. Apply Migration
Run the database migration to create the notifications table:

```bash
# Navigate to project directory
cd /path/to/datastore

# Apply the migration
# If using Supabase CLI:
supabase db push

# Or run the SQL file directly in Supabase dashboard
```

### 2. Test the Flow
1. Login as an agent
2. Go to `/agent/withdrawals/request`
3. Request a withdrawal
4. Login as admin
5. Check `/admin/withdrawals` - you should see the new request

## Admin Dashboard Integration

### Viewing Notifications
Admins can query unread notifications:

```typescript
const { data: notifications } = await supabase
  .from('admin_notifications')
  .select('*')
  .eq('is_read', false)
  .order('created_at', { ascending: false })

// Count unread notifications
const unreadCount = notifications?.filter(n => !n.is_read).length
```

### Marking as Read
When admin views a withdrawal:

```typescript
await supabase
  .from('admin_notifications')
  .update({ 
    is_read: true, 
    read_at: new Date().toISOString(),
    read_by: adminUserId 
  })
  .eq('related_entity_id', withdrawalId)
```

## Key Features

✅ **Automatic Notifications**: No manual steps required  
✅ **Priority System**: High-priority for large withdrawals  
✅ **Complete Context**: All withdrawal details in notification  
✅ **Direct Links**: Click to view withdrawal details  
✅ **Read Tracking**: Admins can mark notifications as read  
✅ **Audit Trail**: Full history of notifications with timestamps

## Notification Priority

- **Low**: Withdrawals under GHS 50
- **Normal**: Withdrawals GHS 50 - GHS 1000
- **High**: Withdrawals over GHS 1000
- **Urgent**: System alerts or critical issues

## Next Steps (Optional Enhancements)

1. **Email Notifications**: Send email to admins when withdrawals are requested
2. **Push Notifications**: Browser notifications for admins
3. **Notification Dashboard**: Dedicated page for viewing all notifications
4. **Notification Preferences**: Let admins choose what notifications to receive
5. **Batch Processing**: Process multiple withdrawals at once

## Files Modified/Created

### Created
- `supabase/migrations/005_create_notifications.sql`
- `WITHDRAWAL_NOTIFICATIONS_SETUP.md` (this file)

### Modified
- `app/api/agent/withdrawals/create/route.ts` - Added notification creation

### Frontend (Already Exist)
- `app/(agent)/agent/withdrawals/page.tsx` - Agent withdrawals listing
- `app/(agent)/agent/withdrawals/request/page.tsx` - Request form
- `app/(admin)/admin/withdrawals/page.tsx` - Admin view

## Notes

- The notification system works automatically via database trigger
- All withdrawal requests create notifications immediately
- Admins can view and process withdrawals from the admin panel
- The system maintains full audit trail of all actions

