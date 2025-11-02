# ValueDock® Documentation Index

**Quick navigation guide to all project documentation**

---

## 🆕 Latest Updates (2025-10-21)

### Engagement Summary KV Migration (NEW!)
- **[ENGAGEMENT_SUMMARY_KV_COMPLETE.md](ENGAGEMENT_SUMMARY_KV_COMPLETE.md)** ⭐ Migration summary
- **[ENGAGEMENT_SUMMARY_KV_MIGRATION.md](ENGAGEMENT_SUMMARY_KV_MIGRATION.md)** 📖 Complete migration guide
- **[ENGAGEMENT_SUMMARY_KV_QUICK_REF.md](ENGAGEMENT_SUMMARY_KV_QUICK_REF.md)** 🚀 Quick reference
- **[ENGAGEMENT_SUMMARY_BEFORE_AFTER.md](ENGAGEMENT_SUMMARY_BEFORE_AFTER.md)** 🔄 Before/After comparison
- **[TEST_ENGAGEMENT_SUMMARY_KV.md](TEST_ENGAGEMENT_SUMMARY_KV.md)** 🧪 Test guide

**What Changed**:
- ✅ **KV Store Migration** - Moved from database table to KV store for compliance
- ✅ **System Guidelines Compliant** - No new database tables created
- ✅ **Zero Breaking Changes** - API contract unchanged, frontend untouched
- ✅ **Better Performance** - KV lookups 3-5x faster than database queries
- ✅ **Simplified Cleanup** - Easy key-based deletion vs SQL queries

**Key Pattern**: `engagement:{domain}:{run_id}`

**Example**: `engagement:acmecorp.com:550e8400-e29b-41d4-a716-446655440000`

---

## Previous Updates (2025-10-17)

### Backend Connection Verifier & Complete API Guide (NEW!)
- **[BACKEND_ENDPOINTS_COMPLETE_GUIDE.md](BACKEND_ENDPOINTS_COMPLETE_GUIDE.md)** ⭐ Complete API reference
- **[OPENAI_KEY_TROUBLESHOOTING.md](OPENAI_KEY_TROUBLESHOOTING.md)** 🔧 Fix OpenAI API key issues
- **Component:** `/components/BackendConnectionVerifier.tsx`

**Features Added**:
- ✅ **Backend Connection Verifier** - Test all API endpoints with one click
- ✅ **Real-time endpoint testing** - Tests Core, AI, Fathom, Gamma, and Analytics endpoints
- ✅ **Environment variable detection** - Shows which secrets are configured
- ✅ **Category filtering** - Filter tests by endpoint type
- ✅ **Response viewer** - Expand to see full API responses
- ✅ **Status indicators** - Success (✓), Warning (⚠️), Error (✗)
- ✅ **Missing endpoints added** - fathom-fetch, solution-composer, gamma-export, telemetry-log, billing-feed, predictive-roi-feed, revise-content
- ✅ **Admin integration** - Available in Admin → API/Webhooks tab
- ✅ **Comprehensive documentation** - All endpoints documented with examples

**New API Endpoints**:
- `POST /fathom-fetch` - Consolidate Fathom discovery calls
- `POST /solution-composer` - Generate solution architecture and SOW
- `POST /gamma-export` - Create Gamma presentations
- `POST /telemetry-log` - Log execution metrics
- `GET /predictive-roi-feed` - Analytics and predictions
- `GET /billing-feed` - Cost analytics and alerts
- `POST /revise-content` - AI content revision with brand guidelines
- `GET /ping` - Health check with environment status

**Troubleshooting**:
- Complete guide for fixing "OpenAI API key not configured" errors
- Step-by-step redeployment instructions
- CLI and Dashboard workflows
- Verification tests and expected outputs

### Proposal Run Log Panel (NEW!)
- **[PROPOSAL_RUN_LOG_IMPLEMENTATION.md](PROPOSAL_RUN_LOG_IMPLEMENTATION.md)** ⭐ Complete implementation guide
- **[PROPOSAL_RUN_LOG_VISUAL_GUIDE.md](PROPOSAL_RUN_LOG_VISUAL_GUIDE.md)** 🎨 Visual design guide
- **[PROPOSAL_RUN_LOG_QUICK_START.md](PROPOSAL_RUN_LOG_QUICK_START.md)** 🚀 Quick start guide

**Features Added**:
- ✅ **Run Log Panel** - Right side panel (1/3 width) in Proposal Builder
- ✅ **Phase Progress Bar** - Discovery → ROI → Solution → Export with visual indicator
- ✅ **Log Table** - Columns: Time, Phase, Step, Status, Duration, Notes
- ✅ **Real-time Updates** - Auto-refresh every 5 seconds (toggleable)
- ✅ **Filtering** - Filter by tenant_id, org_id, deal_id, run_id
- ✅ **Status Badges** - Pending, Running, Completed, Error with color coding
- ✅ **API Endpoints** - GET and POST `/proposal-logs` for fetching and creating logs
- ✅ **Responsive Layout** - Sticky on desktop, full-width on mobile
- ✅ **Empty State** - Helpful message when no logs exist

### Gamma Export in Presentation Builder (Updated v2.0)
- **[GAMMA_EXPORT_IMPLEMENTATION.md](GAMMA_EXPORT_IMPLEMENTATION.md)** ⭐ Complete implementation guide
- **[GAMMA_EXPORT_UPDATE_SUMMARY.md](GAMMA_EXPORT_UPDATE_SUMMARY.md)** 🎯 Mode-aware labels update

**Features Added**:
- ✅ **"Export (Gamma or Storage)" button** - Purple/blue gradient button in Presentation Builder footer
- ✅ **Mode-aware button labels** - "Open in Gamma" for live mode, "Open Proposal (Markdown)" / "Open Deck Outline (JSON)" for storage
- ✅ **API integration** - Calls `/functions/v1/gamma-export` with `{tenant_id, org_id, deal_id, title}`
- ✅ **Enhanced success display** - Shows preview, step status badges, and mode-specific messages
- ✅ **Step status tracking** - Displays Fathom, Proposal, and Gamma step completion
- ✅ **Preview display** - Shows first 150 characters of final_output
- ✅ **Persistent storage** - URLs saved to proposal record for current version
- ✅ **Beautiful UI** - Professional success card with organized links and confirmation message

### Solution Composer & SOW Generation
- **[SOLUTION_COMPOSER_IMPLEMENTATION.md](SOLUTION_COMPOSER_IMPLEMENTATION.md)** ⭐ Complete implementation guide

**Features Added**:
- ✅ **Updated progress header** - "Agent 2 of 20 — Step 2.6.2 of N ✓ Solution Composer Verified"
- ✅ **"Compose Solution & SOW" button** - Green gradient button calling `/functions/v1/solution-composer`
- ✅ **Solution Composer Results Panel** - Displays generated solution and SOW
- ✅ **Backend integration** - Saves composed data to `/data/solution-composer` for PresentationScreen
- ✅ **AI-powered generation** - Uses deal data, workflows, and ROI to compose comprehensive solution
- ✅ **Auto-population** - Solution and SOW editor panes auto-fill with agent output

### Discovery + ROI Summary & Progress Update
- **[DISCOVERY_ROI_SUMMARY_IMPLEMENTATION.md](DISCOVERY_ROI_SUMMARY_IMPLEMENTATION.md)** ⭐ Complete implementation guide

**Features Added**:
- ✅ **Updated progress header** - "Agent 2 of 20 — Step 2.5.2 of N ✓ Discovery + ROI Summary Verified"
- ✅ **Discovery + ROI Summary section** - Auto-populated content block in Presentation Editor
- ✅ **Copy to Executive Summary button** - One-click clipboard copy
- ✅ **Download as Text button** - Download as `.txt` file with date in filename
- ✅ **Agent Generated badge** - Purple badge indicating AI-generated content
- ✅ **Editable textarea** - Monospace font, 8 rows, manual editing supported

## 🆕 Latest Updates (2025-10-16)

### WorkfloDock Tool Timeline & Auto-Merge Badge
- **[WORKFLODOCK_TOOL_TIMELINE_COMPLETE.md](WORKFLODOCK_TOOL_TIMELINE_COMPLETE.md)** ⭐ Complete implementation guide

**Features Added**:
- ✅ **Tool Call Timeline Card** - Visual flow showing fetch_url → fathom_fetch → valuedock_get_financials → valuedock_put_*
- ✅ **Status badges** for each tool (Success / Running / Error / Skipped / Pending)
- ✅ **"Replay Last Run" button** - Re-execute with saved JSON payload
- ✅ **Updated progress header** - "Agent 2 of 20 — Step 2.3.1 of N ✓ Fathom tool wired"
- ✅ **Auto-merge badge** - "Challenges & Goals: Auto-merged from Fathom" with tooltip
- ✅ **WorkfloDock-style hierarchical step numbering** (2.3.1, 2.3.2, etc.)

## 🆕 Latest Updates (2025-10-16)

### Manual Transcript Upload Feature
- **[MANUAL_TRANSCRIPT_UPLOAD_COMPLETE.md](MANUAL_TRANSCRIPT_UPLOAD_COMPLETE.md)** ⭐ Complete feature guide
- **[MANUAL_TRANSCRIPT_QUICK_REF.md](MANUAL_TRANSCRIPT_QUICK_REF.md)** - 30-second quick reference

**Features Added**:
- ✅ **"Upload Notes/Transcript" fallback card** in Challenges & Goals
- ✅ **Toggle switch** to enable manual transcript mode
- ✅ **Textarea input** for pasting meeting notes/transcripts
- ✅ **Dual mode support** - Switch between Fathom API and manual input
- ✅ **Section counter** - Shows detected sections (split by blank lines)
- ✅ **Agent tool reference** - Updated UI documentation with `fathom_fetch` tool
- ✅ **Auto-extraction** - AI extracts challenges/goals from manual text
- ✅ **Smart parsing** - Splits by double newlines into sections array

### Fathom Fetch Enhancements
- **[FATHOM_FETCH_ENHANCEMENTS_COMPLETE.md](FATHOM_FETCH_ENHANCEMENTS_COMPLETE.md)** - Complete enhancement guide

**Features**:
- ✅ **Collapsible "Fathom Response" panel** with meeting count badge
- ✅ **ValuDock® registered trademark symbol** in main header
- ✅ **"Fetch from Fathom" button** in Challenges & Goals panel
- ✅ Auto-refresh content after successful Fathom fetch
- ✅ Date range auto-calculated (last 30 days)
- ✅ Loading states and toast notifications

### Fathom Integration Settings Card
- **[FATHOM_INTEGRATION_CARD.md](FATHOM_INTEGRATION_CARD.md)** - Complete implementation guide
- **[FATHOM_CARD_QUICK_START.md](FATHOM_CARD_QUICK_START.md)** - 30-second quick start

**Features**:
- ✅ Dedicated Fathom Integration settings card in Proposal Agent Admin
- ✅ API Status indicator with "Connected ✅" badge (stub-ok)
- ✅ Start/End date pickers for date range selection
- ✅ Tag filter input for meeting filtering
- ✅ "Test Fetch" button that posts to /functions/v1/fathom-fetch
- ✅ JSON response viewer with scrollable area
- ✅ Meeting count summary and error handling
- ✅ Loading states and toast notifications

### ROI Quick Stats Server Pill & Calculated Badge
- **[ROI_QUICK_STATS_SERVER_PILL.md](ROI_QUICK_STATS_SERVER_PILL.md)** - Server pill implementation guide
- **[QUICK_TEST_ROI_SERVER_PILL.md](QUICK_TEST_ROI_SERVER_PILL.md)** - 5-minute visual test guide

**Features**:
- ✅ "Quick Stats (Server)" pill badge indicating server-side calculation
- ✅ Green "Calculated" badge on ROI Summary tab when data available
- ✅ Immediate value display when API returns `status: 'completed'`
- ✅ Enhanced status-based rendering with backward compatibility
- ✅ Visual confirmation of server-computed metrics

### WorkfloDock Progress UI & ROI Quick Stats
- **[WORKFLODOCK_AND_ROI_STATS_IMPLEMENTATION.md](WORKFLODOCK_AND_ROI_STATS_IMPLEMENTATION.md)** - Complete implementation guide
- **[QUICK_TEST_WORKFLODOCK_ROI.md](QUICK_TEST_WORKFLODOCK_ROI.md)** - Testing and verification guide
- **[WORKFLODOCK_PROGRESS_UI.md](WORKFLODOCK_PROGRESS_UI.md)** - Detailed progress UI specifications

**Features**:
- ✅ Hierarchical step tracking: "Agent 1 of 20 — Step 1.19.3 of N"
- ✅ Sticky progress bar with 5 milestone segments
- ✅ Copy command buttons for each step
- ✅ ROI Quick Stats card reading from `v_roi_quick_stats` view
- ✅ Backend API endpoints: `/proposal-roi/quick-stats` and `/proposal-roi/recalculate`

---

## 🚀 Start Here

### ⚠️ Can't Log In?
1. **[QUICK_FIX_AUTH.md](./QUICK_FIX_AUTH.md)** ⭐ **30-second fix for login errors**
2. **[LOGIN_CREDENTIALS.md](./LOGIN_CREDENTIALS.md)** - Default test accounts
3. **[AUTH_TROUBLESHOOTING_GUIDE.md](./AUTH_TROUBLESHOOTING_GUIDE.md)** - Complete auth guide

### New to ValueDock®?
1. **[README.md](./README.md)** - Project overview and features
2. **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
3. **[FIRST_TIME_SETUP.md](./FIRST_TIME_SETUP.md)** - Initial configuration guide

### Migrating to Loveable?
1. **[MIGRATION_READY_SUMMARY.md](./MIGRATION_READY_SUMMARY.md)** ⭐ **START HERE**
2. **[LOVEABLE_IMPORT_CHECKLIST.md](./LOVEABLE_IMPORT_CHECKLIST.md)** - Printable checklist
3. **[LOVEABLE_MIGRATION_GUIDE.md](./LOVEABLE_MIGRATION_GUIDE.md)** - Complete step-by-step guide

---

## 🔐 Authentication & Login

### Quick Reference
| Document | Purpose | When to Use |
|----------|---------|-------------|
| [QUICK_FIX_AUTH.md](./QUICK_FIX_AUTH.md) ⭐ | **30-second fix** | Login errors |
| [LOGIN_CREDENTIALS.md](./LOGIN_CREDENTIALS.md) | Default accounts | Need credentials |
| [AUTH_TROUBLESHOOTING_GUIDE.md](./AUTH_TROUBLESHOOTING_GUIDE.md) | Complete auth guide | Deep debugging |
| [AUTH_FIXES_SUMMARY.md](./AUTH_FIXES_SUMMARY.md) | What was fixed | Understanding fixes |

---

## 📚 Core Documentation

### Essential Guides
| Document | Purpose | When to Use |
|----------|---------|-------------|
| [README.md](./README.md) | Project overview | First-time visitors |
| [QUICK_START.md](./QUICK_START.md) | Quick feature tour | Learning the app |
| [CHANGELOG.md](./CHANGELOG.md) | Version history | Tracking changes |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues | When stuck |

### Setup & Configuration
| Document | Purpose | When to Use |
|----------|---------|-------------|
| [FIRST_TIME_SETUP.md](./FIRST_TIME_SETUP.md) | Initial setup | New installation |
| [AUTH_SETUP.md](./AUTH_SETUP.md) | Authentication config | Setting up auth |
| [QUICK_ADMIN_CREATION_GUIDE.md](./QUICK_ADMIN_CREATION_GUIDE.md) | Create first admin | Initial setup |

---

## 🏗️ Technical Documentation

### Architecture & Design
| Document | Purpose | Audience |
|----------|---------|----------|
| [docs/architecture-schema.md](./docs/architecture-schema.md) | System architecture | Developers |
| [docs/domain-model.md](./docs/domain-model.md) | Data structures | Developers |
| [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) | Component design | Developers |

### API & Backend
| Document | Purpose | Audience |
|----------|---------|----------|
| [docs/api-contracts.md](./docs/api-contracts.md) | API endpoints | Developers |
| [docs/validation-rules.md](./docs/validation-rules.md) | Input validation | Developers |
| [KV_STORE_FIX.md](./KV_STORE_FIX.md) | Storage system | Backend devs |

### Permissions & Security
| Document | Purpose | Audience |
|----------|---------|----------|
| [docs/permissions-matrix.md](./docs/permissions-matrix.md) | Role permissions | Admins, Developers |
| [ADMIN_RIGHTS_ASSIGNMENT.md](./ADMIN_RIGHTS_ASSIGNMENT.md) | Admin assignment | System admins |

---

## 👨‍💼 Admin Documentation

### Complete Admin Guide
| Document | Purpose | Audience |
|----------|---------|----------|
| [docs/admin/ADMIN_COMPLETE_GUIDE.md](./docs/admin/ADMIN_COMPLETE_GUIDE.md) ⭐ | **Master admin guide** | All admins |
| [GLOBAL_ADMIN_DOCUMENTATION.md](./GLOBAL_ADMIN_DOCUMENTATION.md) | Global admin features | Master admins |
| [ADMIN_PANEL_REORGANIZATION.md](./ADMIN_PANEL_REORGANIZATION.md) | Panel structure | Admins |

### User Management
| Document | Purpose | Audience |
|----------|---------|----------|
| [USER_MANAGEMENT_REDESIGN_SUMMARY.md](./USER_MANAGEMENT_REDESIGN_SUMMARY.md) | User UI overview | Admins |
| [HOW_TO_CREATE_NEW_ORGS_TENANTS.md](./HOW_TO_CREATE_NEW_ORGS_TENANTS.md) | Creating orgs | Admins |
| [ADMIN_ASSIGNMENT_VISUAL_GUIDE.md](./ADMIN_ASSIGNMENT_VISUAL_GUIDE.md) | Visual admin guide | Admins |

### Testing & Verification
| Document | Purpose | Audience |
|----------|---------|----------|
| [TEST_SCENARIOS.md](./TEST_SCENARIOS.md) | Test procedures | QA, Admins |
| [QUICK_TEST_TENANT_ADMIN.md](./QUICK_TEST_TENANT_ADMIN.md) | Tenant admin tests | Admins |
| [USER_CREATION_TEST_GUIDE.md](./USER_CREATION_TEST_GUIDE.md) | User creation tests | Admins |

---

## 🎨 Feature Documentation

### Core Features
| Document | Purpose | Users |
|----------|---------|-------|
| [COST_CLASSIFICATION_FEATURE.md](./COST_CLASSIFICATION_FEATURE.md) | Cost categorization | All users |
| [GROUP_BASED_FILTERING_IMPLEMENTATION.md](./GROUP_BASED_FILTERING_IMPLEMENTATION.md) | Group filtering | All users |
| [NPV_TIME_HORIZON_FEATURE.md](./NPV_TIME_HORIZON_FEATURE.md) | NPV calculations | Finance users |
| [CONTEXT_SWITCHER_IMPLEMENTATION.md](./CONTEXT_SWITCHER_IMPLEMENTATION.md) | Multi-tenant switching | Admins |

### Visual Guides
| Document | Purpose | Users |
|----------|---------|-------|
| [VISUAL_GUIDE_NEW_FEATURES.md](./VISUAL_GUIDE_NEW_FEATURES.md) | Feature screenshots | All users |
| [COSTS_TAB_VISUAL_GUIDE.md](./COSTS_TAB_VISUAL_GUIDE.md) | Cost tab walkthrough | Finance users |
| [CONTEXT_SWITCHER_EXAMPLES.md](./CONTEXT_SWITCHER_EXAMPLES.md) | Context examples | Admins |

---

## 🔧 Migration & Integration

### Loveable Migration (Priority)
| Document | Purpose | Stage |
|----------|---------|-------|
| [MIGRATION_READY_SUMMARY.md](./MIGRATION_READY_SUMMARY.md) ⭐ | **Migration overview** | Start here |
| [LOVEABLE_IMPORT_CHECKLIST.md](./LOVEABLE_IMPORT_CHECKLIST.md) ⭐ | **Step checklist** | During migration |
| [LOVEABLE_MIGRATION_GUIDE.md](./LOVEABLE_MIGRATION_GUIDE.md) ⭐ | **Detailed steps** | Reference |

### Builder.io Integration
| Document | Purpose | Stage |
|----------|---------|-------|
| [BUILDER_IO_OPTIMIZATION_COMPLETE.md](./BUILDER_IO_OPTIMIZATION_COMPLETE.md) | Builder.io setup | Optional |
| [AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md) | AI features | Future |
| [GAMMA_INTEGRATION_GUIDE.md](./GAMMA_INTEGRATION_GUIDE.md) | Gamma integration | Optional |

---

## 🐛 Debugging & Fixes

### Debugging Guides
| Document | Purpose | When to Use |
|----------|---------|-------------|
| [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md) | General debugging | Any issues |
| [ON_SCREEN_DEBUG_GUIDE.md](./ON_SCREEN_DEBUG_GUIDE.md) | Debug console | Runtime issues |
| [CONSOLE_FIX_SCRIPT.md](./CONSOLE_FIX_SCRIPT.md) | Console scripts | Quick fixes |

### Common Issues
| Document | Purpose | Issue Type |
|----------|---------|------------|
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | All common issues | General |
| [DOMAIN_VALIDATION_FIX_INSTRUCTIONS.md](./DOMAIN_VALIDATION_FIX_INSTRUCTIONS.md) | Email validation | Input errors |
| [LOGIN_AND_COST_FIXES.md](./LOGIN_AND_COST_FIXES.md) | Login issues | Auth problems |
| [DIALOG_TROUBLESHOOTING.md](./DIALOG_TROUBLESHOOTING.md) | Dialog issues | UI bugs |

### Applied Fixes
| Document | Purpose | Reference |
|----------|---------|-----------|
| [COMPREHENSIVE_FIXES_APPLIED.md](./COMPREHENSIVE_FIXES_APPLIED.md) | All fixes summary | History |
| [ERROR_FIXES_COMPLETE.md](./ERROR_FIXES_COMPLETE.md) | Error resolutions | Reference |
| [FIXES_SUMMARY.md](./FIXES_SUMMARY.md) | Quick fix list | Overview |

---

## 📱 Mobile Optimization

### Mobile Documentation
| Document | Purpose | Users |
|----------|---------|-------|
| [COMPREHENSIVE_FIXES_APPLIED.md](./COMPREHENSIVE_FIXES_APPLIED.md) | Mobile fixes | Developers |
| Section: Mobile optimization | Touch interactions | Mobile users |

**Key Mobile Features:**
- Card-based layouts
- Touch-friendly buttons
- No horizontal scroll
- Process reordering with arrows
- Scrollable advanced metrics

---

## 🔄 Implementation Summaries

### Batch Updates
| Document | Purpose | Date |
|----------|---------|------|
| [IMPLEMENTATION_COMPLETE_SUMMARY.md](./IMPLEMENTATION_COMPLETE_SUMMARY.md) | Final summary | Latest |
| [COMPREHENSIVE_UPDATE_PLAN.md](./COMPREHENSIVE_UPDATE_PLAN.md) | Update plan | Reference |
| [FINAL_IMPLEMENTATION_STATUS.md](./FINAL_IMPLEMENTATION_STATUS.md) | Status report | Complete |

### Specific Features
| Document | Feature | Status |
|----------|---------|--------|
| [ORGANIZATION_SCOPED_DATA_IMPLEMENTATION.md](./ORGANIZATION_SCOPED_DATA_IMPLEMENTATION.md) | Org-scoped data | ✅ Complete |
| [GROUP_UX_IMPROVEMENTS.md](./GROUP_UX_IMPROVEMENTS.md) | Group UX | ✅ Complete |
| [PRESENTATION_UPDATES_SUMMARY.md](./PRESENTATION_UPDATES_SUMMARY.md) | Presentation | ✅ Complete |

---

## 📊 Testing Documentation

### Test Guides
| Document | Purpose | Tester |
|----------|---------|--------|
| [TEST_SCENARIOS.md](./TEST_SCENARIOS.md) | Complete test suite | QA team |
| [QUICK_TEST_TENANT_ADMIN.md](./QUICK_TEST_TENANT_ADMIN.md) | Admin tests | Admins |
| [USER_CREATION_TEST_GUIDE.md](./USER_CREATION_TEST_GUIDE.md) | User tests | Admins |

### Specific Feature Tests
| Document | Feature | Type |
|----------|---------|------|
| [COST_CLASSIFICATION_QUICK_TEST.md](./COST_CLASSIFICATION_QUICK_TEST.md) | Cost system | Quick test |
| [TEST_GROUPS_FIX.md](./TEST_GROUPS_FIX.md) | Groups | Verification |
| [TEST_DOMAIN_REGEX.md](./TEST_DOMAIN_REGEX.md) | Validation | Unit test |

---

## 🎯 Quick Reference

### Most Important Documents (Priority Order)

1. **Starting Migration?**
   - [MIGRATION_READY_SUMMARY.md](./MIGRATION_READY_SUMMARY.md)
   - [LOVEABLE_IMPORT_CHECKLIST.md](./LOVEABLE_IMPORT_CHECKLIST.md)
   - [LOVEABLE_MIGRATION_GUIDE.md](./LOVEABLE_MIGRATION_GUIDE.md)

2. **Using the Application?**
   - [QUICK_START.md](./QUICK_START.md)
   - [docs/admin/ADMIN_COMPLETE_GUIDE.md](./docs/admin/ADMIN_COMPLETE_GUIDE.md)
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

3. **Developing/Customizing?**
   - [docs/architecture-schema.md](./docs/architecture-schema.md)
   - [docs/api-contracts.md](./docs/api-contracts.md)
   - [BUILDER_IO_OPTIMIZATION_COMPLETE.md](./BUILDER_IO_OPTIMIZATION_COMPLETE.md)

4. **Got Issues?**
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)
   - [COMPREHENSIVE_FIXES_APPLIED.md](./COMPREHENSIVE_FIXES_APPLIED.md)

---

## 📁 Documentation by Category

### By User Role

**Master Admin**
- Admin Complete Guide
- Global Admin Documentation
- Permissions Matrix
- Admin Assignment Guide

**Tenant Admin**
- Admin Complete Guide (Tenant section)
- Org Creation Guide
- Tenant Admin Tests

**Organization Admin**
- Quick Start Guide
- User Management sections
- Group Management

**Regular User**
- Quick Start Guide
- Feature Guides
- Visual Guides

**Developer**
- Architecture docs
- API Contracts
- Component Architecture
- Builder.io Optimization

**QA Tester**
- Test Scenarios
- All test guides
- Debugging guides

---

## 🔍 Finding Specific Information

### I want to know about...

**Authentication**
→ [AUTH_SETUP.md](./AUTH_SETUP.md), [LOGIN_AND_COST_FIXES.md](./LOGIN_AND_COST_FIXES.md)

**Cost Classifications**
→ [COST_CLASSIFICATION_FEATURE.md](./COST_CLASSIFICATION_FEATURE.md), [COSTS_TAB_VISUAL_GUIDE.md](./COSTS_TAB_VISUAL_GUIDE.md)

**Groups**
→ [GROUP_BASED_FILTERING_IMPLEMENTATION.md](./GROUP_BASED_FILTERING_IMPLEMENTATION.md), [GROUP_UX_IMPROVEMENTS.md](./GROUP_UX_IMPROVEMENTS.md)

**Multi-tenant Architecture**
→ [ORGANIZATION_SCOPED_DATA_IMPLEMENTATION.md](./ORGANIZATION_SCOPED_DATA_IMPLEMENTATION.md), [CONTEXT_SWITCHER_IMPLEMENTATION.md](./CONTEXT_SWITCHER_IMPLEMENTATION.md)

**NPV Calculations**
→ [NPV_TIME_HORIZON_FEATURE.md](./NPV_TIME_HORIZON_FEATURE.md), [HARD_COSTS_ONLY_NPV_FIX.md](./HARD_COSTS_ONLY_NPV_FIX.md)

**Mobile Optimization**
→ [COMPREHENSIVE_FIXES_APPLIED.md](./COMPREHENSIVE_FIXES_APPLIED.md) (Mobile sections)

**Builder.io**
→ [BUILDER_IO_OPTIMIZATION_COMPLETE.md](./BUILDER_IO_OPTIMIZATION_COMPLETE.md)

**Loveable Migration**
→ [LOVEABLE_MIGRATION_GUIDE.md](./LOVEABLE_MIGRATION_GUIDE.md), [MIGRATION_READY_SUMMARY.md](./MIGRATION_READY_SUMMARY.md)

---

## 📈 Documentation Status

### Complete & Up-to-Date ✅
- All migration guides
- Admin documentation
- Feature guides
- API documentation
- Architecture docs
- Troubleshooting guides

### Historical Reference 📚
- Fix summaries (completed issues)
- Implementation batches (completed work)
- Debug guides (resolved issues)

### Living Documents 📝
- CHANGELOG.md (updated with each release)
- README.md (updated with major features)
- TROUBLESHOOTING.md (updated with new issues)

---

## 🆘 Still Can't Find What You Need?

1. **Search the project**: Use your editor's search (Ctrl/Cmd + Shift + F)
2. **Check TROUBLESHOOTING.md**: Most common issues covered
3. **Review CHANGELOG.md**: Track when features were added
4. **Check /docs folder**: Technical deep-dives

---

## 📝 Document Naming Convention

- **ALL_CAPS.md** = Top-level guides (README, CHANGELOG)
- **Feature_Name.md** = Feature documentation
- **GUIDE_NAME.md** = How-to guides
- **FIX_DESCRIPTION.md** = Applied fixes (historical)
- **TEST_NAME.md** = Test procedures
- **/docs/*.md** = Technical specifications

---

**Last Updated**: January 12, 2025  
**Total Documents**: 100+  
**Categories**: 12  
**Status**: Complete & Production Ready

---

**Ready to get started? → [MIGRATION_READY_SUMMARY.md](./MIGRATION_READY_SUMMARY.md)**
