# 🚀 Getting Started Guide

**Quick Links:**
- 📋 **TODO_TASK_LIST.md** ← Complete production roadmap
- ⚡ **This guide** ← Get running NOW
- 🔒 **SECURITY_AUDIT.md** ← Fix security issues  
- 📖 **COMPREHENSIVE_DIAGNOSIS.md** ← Full analysis

---

## Option 1: Automated Quick Start (Recommended)

```bash
# Run the quick-start script
./quick-start.sh

# Follow the prompts to configure environment variables
# Then start development:
npm run dev
```

Open http://localhost:3000 🎉

---

## Option 2: Manual Setup

### Step 1: Install Dependencies (2 minutes)
```bash
npm install
```

### Step 2: Configure Environment (5 minutes)

```bash
# Copy the template
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials:

**Get Firebase Config:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new one)
3. Click ⚙️ Settings → Project Settings → General
4. Scroll to "Your apps" → Web app
5. Copy the config values

**Get Firebase Admin SDK:**
1. Still in Project Settings → Service Accounts
2. Click "Generate new private key"
3. Copy the values from downloaded JSON

**Required Variables:**
```env
# Client (from Firebase Web config)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=yourapp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=yourapp.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123

# Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@yourapp.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Step 3: Start Development (1 minute)
```bash
# Start the dev server
npm run dev

# Open in browser
# http://localhost:3000
```

---

## First Time Setup: Create Admin User

The app needs at least one user to get started. You have two options:

### Option A: Use Firebase Console (Easiest)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication → Users → Add User
4. Create a user with email/password
5. Go to Firestore Database
6. Create collection: `users`
7. Add document with ID matching the user's UID:
   ```json
   {
     "email": "admin@example.com",
     "role": "admin",
     "createdAt": [Firebase server timestamp]
   }
   ```

### Option B: Use Admin Script
1. Ensure dependencies are installed
2. Update `archive/scripts/setup-admin.js` with your credentials
3. Run: `node archive/scripts/setup-admin.js`

---

## Testing It Works

### 1. Check the Build
```bash
npm run build
```
Should complete without critical errors.

### 2. Login
- Go to http://localhost:3000
- Login with the admin user you created
- You should see the home page with 3 options:
  - Trade-In Form
  - Manager Dashboard  
  - Admin Panel

### 3. Test Key Features
- ✅ Click "Trade-In Form" → Should load submission form
- ✅ Click "Manager Dashboard" → Should load dashboard
- ✅ Click "Admin Panel" → Should load user management

---

## Next Steps

### Immediate (This Week)
1. **Read TODO_TASK_LIST.md** - See all production tasks
2. **Fix Security Issues** - See SECURITY_AUDIT.md
   - Update Next.js to 14.2.33+
   - Update Firebase to 12.6.0+

### Short-term (Next 2 Weeks)
3. **Refactor Large Components** - See TODO_TASK_LIST.md Phase 2
4. **Add Testing** - See TODO_TASK_LIST.md Phase 5
5. **Deploy to Production** - See TODO_TASK_LIST.md Phase 6

---

## Common Issues

### Issue: `npm install` fails
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build fails with Firebase errors
```bash
# Solution: Check environment variables
# Make sure .env.local has all required variables
# Check for typos in variable names
```

### Issue: Login doesn't work
```bash
# Solution: Verify Firebase Auth is enabled
# 1. Firebase Console → Authentication
# 2. Enable Email/Password authentication
# 3. Create a test user
```

### Issue: "Module not found" errors
```bash
# Solution: Reinstall dependencies
npm install
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Check for security vulnerabilities
npm audit

# Fix security vulnerabilities
npm audit fix
```

---

## Project Structure Quick Reference

```
enhanced-vehicle-appraisal-v10/
├── app/                          # Next.js app directory
│   ├── page.tsx                  # Home/login page
│   ├── submit/                   # Vehicle submission
│   ├── manager-dashboard/        # Manager view
│   ├── admin/                    # Admin panel
│   └── api/                      # API routes
├── components/                   # React components
│   ├── EnhancedTradeInForm.tsx  # Main form (needs refactoring)
│   ├── EnhancedManagerDashboard.tsx  # Dashboard (needs refactoring)
│   └── ui/                       # ShadCN components
├── lib/                          # Utilities
│   ├── firebaseconfig.ts         # Client Firebase
│   ├── firebase-admin.ts         # Server Firebase
│   └── auth-utils.ts             # Role management
├── TODO_TASK_LIST.md            # ← Production roadmap
├── SECURITY_AUDIT.md            # ← Security fixes needed
└── COMPREHENSIVE_DIAGNOSIS.md   # ← Full analysis
```

---

## Need Help?

1. **Check existing docs:**
   - TODO_TASK_LIST.md (production tasks)
   - SECURITY_AUDIT.md (security issues)
   - COMPREHENSIVE_DIAGNOSIS.md (full analysis)
   - README.md (project overview)

2. **Common issues:**
   - Environment variables misconfigured
   - Firebase project not set up
   - Dependencies not installed
   - Admin user not created

3. **Still stuck?**
   - Check Firebase Console for errors
   - Check browser console for errors
   - Check terminal for build errors
   - Review .env.local configuration

---

## Success Criteria

You're ready to develop when:
- ✅ `npm run dev` starts without errors
- ✅ http://localhost:3000 loads
- ✅ You can login with admin user
- ✅ You can see the home page options
- ✅ You can navigate to different sections

---

**Ready? Run `./quick-start.sh` or follow Manual Setup above! 🚀**

**Then read TODO_TASK_LIST.md for your production roadmap.**
