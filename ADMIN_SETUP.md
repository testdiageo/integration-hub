# Admin Dashboard Setup Guide

## Overview

The admin dashboard allows authorized users to:
- View all registered users
- Monitor subscription status (trial/paid)
- Grant or revoke admin privileges
- Upgrade users to paid subscriptions
- Downgrade paid users to trial status

## Making Your First Admin User

Since the admin dashboard requires admin access to view, you need to manually promote your first admin user. Here are three methods:

### Method 1: Using the Database Tool (Recommended for Development)

1. Log in to the application with your account first to create a user record
2. Note your email address used for login
3. Use the Replit database tool or Railway database console
4. Run this SQL query (replace with your email):

```sql
UPDATE users 
SET "isAdmin" = true 
WHERE email = 'your-email@example.com';
```

### Method 2: Using the Make Admin Script

1. Log in to the application to create your user record
2. Run the make-admin script with your email:

```bash
tsx scripts/make-admin.ts your-email@example.com
```

### Method 3: Using Railway/Production Database Console

1. Access your Railway project dashboard
2. Navigate to your PostgreSQL database
3. Open the Query tab
4. Run the SQL query from Method 1

## Accessing the Admin Dashboard

Once you've been granted admin privileges:

1. **Refresh your browser** or log out and log back in
2. You'll see an **"Admin"** link in the navigation bar
3. Click "Admin" to access the dashboard

## Admin Dashboard Features

### User Management

The admin dashboard displays all users with:

- **User Information**: Name, email, join date
- **Admin Status**: Badge showing if user has admin privileges
- **Subscription Status**: Trial or Paid badge
- **Subscription Tier**: Starter, Professional, or Enterprise (for paid users)

### Admin Controls

For each user (except yourself), you can:

1. **Toggle Admin Status**
   - Click "Make Admin" to grant admin privileges
   - Click "Remove Admin" to revoke admin privileges

2. **Manage Subscriptions**
   - Click "Upgrade to Paid" to convert trial users to Professional tier
   - Click "Downgrade to Trial" to revert paid users back to trial

3. **View Statistics**
   - Total registered users
   - Number of paid subscribers
   - Number of trial users

### Security Notes

- Admin actions require both authentication and admin privileges
- You cannot modify your own admin status or subscription from the dashboard
- All admin actions are validated on the server using middleware
- The `requireAdmin` middleware checks both `isAuthenticated()` and `isAdmin` flags

## Production Setup

For production environments:

1. Create your admin user immediately after deployment
2. Use the Railway/Supabase database console for the initial admin setup
3. After that, use the admin dashboard to manage other admins
4. Regularly audit admin users and remove unused admin privileges

## Troubleshooting

**Problem**: Admin link doesn't appear after making user admin

**Solution**: 
- Log out and log back in to refresh your session
- Clear browser cache and cookies
- Verify the database update was successful with:
  ```sql
  SELECT email, "isAdmin" FROM users WHERE email = 'your-email@example.com';
  ```

**Problem**: "Admin Access Required" message appears even with admin privileges

**Solution**:
- Ensure your session is fresh (log out and back in)
- Check that `isAdmin` is exactly `true` in the database (not null or false)
- Verify you're logged in with the correct account

**Problem**: Cannot update other users

**Solution**:
- Ensure you're not trying to modify your own account
- Check browser console for error messages
- Verify admin API endpoints are responding (check Network tab in browser dev tools)

## API Endpoints

The admin system uses these protected endpoints:

- `GET /api/admin/users` - List all users (admin only)
- `PATCH /api/admin/users/:id/admin` - Toggle admin status (admin only)
- `PATCH /api/admin/users/:id/subscription` - Update subscription (admin only)

All endpoints require:
1. Valid authentication session
2. `isAdmin = true` flag on the user record
