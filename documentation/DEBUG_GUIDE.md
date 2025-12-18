# OAuth & Database Troubleshooting Guide

## 1. Google Error: `redirect_uri_mismatch`
**Fix**: Update Google Console "Authorized redirect URI" to:
```
http://localhost:5000/api/auth/google/callback
```

## 2. Microsoft Error: `Invalid client secret provided`
**Fix**: Generate a new secret, copy the **Value** (not ID), and paste into `.env`.

## 3. Database Error: `Access denied for user 'root'@'localhost'`
**ISSUE FOUND**: Your phpMyAdmin screenshot shows that your `root` user has **NO PASSWORD**.

**Fix**:
1. Open `backend/.env`.
2. Delete the word `password` from the `MYSQL_URL` line, but keep the structure.
   - **Correct**: `MYSQL_URL=mysql://root:@localhost:3306/employee_portal`
   - (Notice there is nothing between `root:` and `@localhost`)
3. **Restart the Server**: Stop the current process and run `npm start` again.
