# 🔐 Quick Fix: Authentication Errors

**Seeing "Invalid login credentials"? Fix it in 30 seconds!**

---

## ⚡ Instant Fix

### Step 1: Go to Login Screen
Open ValueDock® in your browser

### Step 2: Click This Button
**"Initialize Database & Create Test Accounts"**

### Step 3: Wait for Success
Green message will appear with credentials

### Step 4: Sign In
Credentials auto-filled → Click "Sign In" → Done! ✅

---

## 📋 Default Credentials

### Admin Account
```
Email:    admin@valuedock.com
Password: admin123
```

### User Account
```
Email:    finance@testorganization.com
Password: Test123!
```

---

## ❌ Still Not Working?

### Check 1: Supabase Project
Is your Supabase project set up?
- Go to https://supabase.com/dashboard
- Verify project exists
- Check Authentication is enabled

### Check 2: Edge Function
Is the backend deployed?
```bash
supabase functions list
```
Should see: `server`

If not:
```bash
supabase functions deploy server
```

### Check 3: Environment Variables
Are your keys correct?
- `SUPABASE_URL` = https://[project].supabase.co
- `SUPABASE_ANON_KEY` = [your-anon-key]

---

## 📖 Need More Help?

### Detailed Guides
- [AUTH_TROUBLESHOOTING_GUIDE.md](./AUTH_TROUBLESHOOTING_GUIDE.md) - Complete troubleshooting
- [LOGIN_CREDENTIALS.md](./LOGIN_CREDENTIALS.md) - All about accounts
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - General issues

### Quick Commands

**Test backend health:**
```
https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/health
```

**Check database status:**
```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/debug/status')
  .then(r => r.json())
  .then(console.log);
```

**Initialize manually:**
```javascript
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-888f4514/init', {
  method: 'POST'
}).then(r => r.json()).then(console.log);
```

---

## 🎯 What You Get After Init

✅ Test Tenant (Test Tenant Inc.)  
✅ Test Organization (Test Organization Inc.)  
✅ Admin User (full system access)  
✅ Finance User (organization access)  
✅ Ready to use immediately!

---

## 🔒 Security Note

⚠️ **These are TEST credentials only!**

For production:
1. Change passwords
2. Delete test accounts
3. Create real users
4. Enable email confirmation

---

## 💡 Pro Tips

### First Time Setup
- Use Admin account to explore admin panel
- Use Finance account to test ROI calculations
- Create more users from Admin Panel → Users

### Common Mistakes
- ❌ Typing credentials manually (use initialize button)
- ❌ Not waiting for success message
- ❌ Clicking Sign In before initialization
- ❌ Using wrong Supabase project

### Best Practice
1. Initialize once
2. Note down credentials
3. Can reinitialize anytime
4. Safe to run multiple times

---

**That's it! You should be logged in now.** 🎉

**Still stuck?** → [AUTH_TROUBLESHOOTING_GUIDE.md](./AUTH_TROUBLESHOOTING_GUIDE.md)
