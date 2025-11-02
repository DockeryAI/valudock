# 👋 Welcome to ValuDock!

**Enterprise ROI Calculator with Multi-Tenant Architecture**

---

## 🚀 Getting Started (Choose Your Path)

### 🏃 I Want to Run It Now! (10 Minutes)

**👉 [DOWNLOAD_AND_RUN.md](./DOWNLOAD_AND_RUN.md)**

Quick start guide to get ValuDock running on your local machine:
- Install prerequisites
- Configure environment
- Deploy backend
- Run the app
- Login and explore

**Perfect for:** First-time setup, quick evaluation

---

### 📚 I Want Complete Documentation

**👉 [SETUP_INDEX.md](./SETUP_INDEX.md)**

Master index of all setup documentation:
- Setup guides for every scenario
- Configuration references
- Troubleshooting resources
- Documentation roadmap

**Perfect for:** Understanding the full system

---

### 🔧 I Need Detailed Instructions

**👉 [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md)**

Comprehensive guide covering:
- Prerequisites in detail
- Step-by-step setup
- Environment variables explained
- Edge functions deployment
- Optional integrations
- Troubleshooting

**Perfect for:** Thorough understanding, complex setups

---

### ✅ I Want a Checklist

**👉 [DOWNLOAD_CHECKLIST.md](./DOWNLOAD_CHECKLIST.md)**

Step-by-step checklist with verification:
- Pre-download checklist
- Installation steps
- Post-setup verification
- Common issues and fixes
- Success criteria

**Perfect for:** Following structured steps, verifying each action

---

### ⚡ I'm Already Set Up

**👉 [LOCAL_DEV_QUICK_REFERENCE.md](./LOCAL_DEV_QUICK_REFERENCE.md)**

Daily development commands:
- Start/stop dev server
- Deploy edge functions
- Environment variables
- Common issues
- Debugging tips
- Project structure

**Perfect for:** Daily development, quick reference

---

## 🎯 Recommended Path

**New to ValuDock? Follow this flow:**

```
1. START_HERE.md (you are here!) 
   ↓
2. DOWNLOAD_AND_RUN.md (10 min setup)
   ↓
3. Login successfully ✅
   ↓
4. FIRST_TIME_SETUP.md (create tenants & orgs)
   ↓
5. Bookmark LOCAL_DEV_QUICK_REFERENCE.md
   ↓
6. Start developing! 🚀
```

---

## 📦 What is ValuDock?

ValuDock is a comprehensive ROI calculator with:

- **7 Main Screens**: Inputs, Implementation, Results, Presentation, Scenario, Timeline, Export
- **Multi-Tenant Architecture**: Isolate data by organization
- **Role-Based Access**: Master Admin, Tenant Admin, Org Admin, User
- **CFO-Grade Calculations**: NPV, IRR, Payback Period, Cash Flow
- **AI-Powered Features**: Meeting summaries, presentations, insights
- **Mobile-Optimized**: Touch-friendly responsive design
- **White-Label Ready**: Customize branding per tenant

**Built with:** React 18, TypeScript, Vite, Tailwind CSS 4, Supabase

---

## 🔑 Quick Info

### Default Login
```
Email: admin@dockery.ai
Password: admin123
```
⚠️ Change this immediately in production!

### Development Server
```bash
npm run dev
# Opens at http://localhost:5173
```

### Deploy Backend
```bash
supabase functions deploy server
```

### Environment Variables
```bash
# Copy template
cp .env.example .env.local

# Edit with your Supabase credentials
# Required:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

---

## 📋 Prerequisites

Before you start, ensure you have:

- ✅ **Node.js 18+** - https://nodejs.org/
- ✅ **npm 9+** - Comes with Node.js
- ✅ **Git** - https://git-scm.com/
- ✅ **Supabase Account** - https://supabase.com/ (free tier OK)

**Verify installations:**
```bash
node --version  # Should be v18.0.0+
npm --version   # Should be 9.0.0+
git --version   # Any recent version
```

---

## 🗂️ Project Structure

```
valuedock/
├── 📘 Documentation
│   ├── START_HERE.md ⭐ YOU ARE HERE
│   ├── SETUP_INDEX.md (master index)
│   ├── DOWNLOAD_AND_RUN.md (quick start)
│   ├── LOCAL_SETUP_GUIDE.md (detailed)
│   ├── DOWNLOAD_CHECKLIST.md (checklist)
│   ├── LOCAL_DEV_QUICK_REFERENCE.md (daily dev)
│   ├── FIRST_TIME_SETUP.md (post-install)
│   └── README.md (features & docs)
│
├── ⚙️ Configuration
│   ├── .env.example (template)
│   ├── package.json (dependencies)
│   ├── vite.config.ts (build config)
│   └── tsconfig.json (TypeScript)
│
├── 💻 Application
│   ├── App.tsx (main app)
│   ├── components/ (UI components)
│   ├── services/ (business logic)
│   ├── utils/ (utilities)
│   └── styles/ (CSS)
│
└── 🔧 Backend
    └── supabase/functions/server/ (API)
```

---

## ❓ Common Questions

### Q: I'm new to React/TypeScript. Can I use this?

**A:** Yes! The setup documentation assumes no prior knowledge. Follow [DOWNLOAD_AND_RUN.md](./DOWNLOAD_AND_RUN.md) for step-by-step instructions.

### Q: Do I need to pay for Supabase?

**A:** No, the free tier is sufficient for development. You only need to upgrade for production with high traffic.

### Q: Can I use this without AI features?

**A:** Yes! AI features (OpenAI, Gamma, Fathom) are optional. The core ROI calculator works without them.

### Q: How long does setup take?

**A:** 10-15 minutes for experienced developers, 20-30 minutes if new to the stack.

### Q: What if I get stuck?

**A:** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues, or use [DOWNLOAD_CHECKLIST.md](./DOWNLOAD_CHECKLIST.md) for step-by-step verification.

---

## 🆘 Need Help?

**Choose your support path:**

| Issue | Document to Check |
|-------|-------------------|
| Installation problems | [DOWNLOAD_CHECKLIST.md](./DOWNLOAD_CHECKLIST.md) |
| Runtime errors | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |
| Environment variables | [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md) |
| Daily commands | [LOCAL_DEV_QUICK_REFERENCE.md](./LOCAL_DEV_QUICK_REFERENCE.md) |
| Understanding features | [README.md](./README.md) |
| API questions | [docs/api-contracts.md](./docs/api-contracts.md) |

**Still stuck?**
1. Check browser console (F12) for errors
2. Check edge function logs: `supabase functions logs server`
3. Review error messages carefully
4. Search documentation (Ctrl+F in .md files)

---

## 🎯 Success Criteria

**You'll know you're ready to develop when:**

✅ Dev server starts without errors  
✅ App loads at http://localhost:5173  
✅ Can login with default credentials  
✅ See "Welcome, Global Admin" message  
✅ Can navigate between screens  
✅ No errors in browser console  

**If all checked, you're ready! 🎉**

---

## 🚀 Next Steps

### After Successful Setup:

1. **Create Your First Data**
   - Follow [FIRST_TIME_SETUP.md](./FIRST_TIME_SETUP.md)
   - Create tenant, organization, users

2. **Change Default Password**
   - Menu → Admin → Users
   - Edit admin@dockery.ai
   - Set strong password

3. **Explore Features**
   - Read [README.md](./README.md) features section
   - Try creating processes
   - View ROI results

4. **Start Developing**
   - Bookmark [LOCAL_DEV_QUICK_REFERENCE.md](./LOCAL_DEV_QUICK_REFERENCE.md)
   - Make your first change
   - See hot reload in action

---

## 📚 Documentation Hierarchy

```
START_HERE.md (you are here)
    │
    ├─> Quick Start → DOWNLOAD_AND_RUN.md
    │   └─> Success → FIRST_TIME_SETUP.md
    │       └─> Daily Dev → LOCAL_DEV_QUICK_REFERENCE.md
    │
    ├─> Detailed Setup → LOCAL_SETUP_GUIDE.md
    │   └─> Verification → DOWNLOAD_CHECKLIST.md
    │
    ├─> Documentation Index → SETUP_INDEX.md
    │   └─> All guides organized
    │
    └─> Troubleshooting → TROUBLESHOOTING.md
        └─> Common issues solved
```

---

## 🏆 What Makes ValuDock Special?

### For Business Users
- CFO-grade financial calculations
- Professional reports and exports
- Scenario analysis and sensitivity testing
- Executive-ready presentations

### For Developers
- Modern tech stack (React 18, TypeScript, Vite)
- Clean architecture (FSM, services, utils)
- Comprehensive documentation
- Hot module replacement
- Type safety throughout

### For Organizations
- Multi-tenant architecture
- Role-based permissions
- White-label customization
- Data isolation per organization

---

## 🔐 Security Notes

- ✅ `.env.local` is gitignored (never commit secrets)
- ✅ `.env.example` is a template (no real values)
- ✅ Default passwords documented (change in production)
- ✅ Service role key stays server-side only
- ✅ Supabase handles authentication securely

**Always follow security best practices documented in guides!**

---

## 💡 Tips for Success

### Before Starting
- Read through quick start first
- Verify all prerequisites
- Have Supabase account ready
- Allocate 15-20 minutes

### During Setup
- Follow steps in order
- Verify each step before continuing
- Keep browser console open
- Save important passwords

### After Setup
- Complete first-time configuration
- Change default passwords
- Test all core features
- Bookmark quick reference

---

## 🎉 Ready to Begin?

**Choose your path:**

- **🏃 Fast Track**: [DOWNLOAD_AND_RUN.md](./DOWNLOAD_AND_RUN.md) (10 min)
- **📚 Complete Guide**: [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md) (detailed)
- **✅ Checklist**: [DOWNLOAD_CHECKLIST.md](./DOWNLOAD_CHECKLIST.md) (step-by-step)
- **📖 All Docs**: [SETUP_INDEX.md](./SETUP_INDEX.md) (master index)

**Most Popular**: Start with [DOWNLOAD_AND_RUN.md](./DOWNLOAD_AND_RUN.md)! 🚀

---

**Welcome to ValuDock - Let's build something amazing! 🎯**

---

**Last Updated**: November 2, 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready for Local Development

---

**Quick Links:**
- 🚀 [Quick Start](./DOWNLOAD_AND_RUN.md)
- 📚 [Documentation Index](./SETUP_INDEX.md)
- 🔧 [Detailed Setup](./LOCAL_SETUP_GUIDE.md)
- ⚡ [Quick Reference](./LOCAL_DEV_QUICK_REFERENCE.md)
- 🐛 [Troubleshooting](./TROUBLESHOOTING.md)
- 📖 [Features & Docs](./README.md)
