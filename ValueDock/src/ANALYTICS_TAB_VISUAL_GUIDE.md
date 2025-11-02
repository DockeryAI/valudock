# Analytics Tab - Visual Guide

## 🎯 What You'll See

### Admin Dashboard Tabs (Master Admin View)

```
┌────────────────────────────────────────────────────────────────┐
│  [ Users ] [ Tenants ] [ Orgs ] [ Costs ] [ Agent ]           │
│  [ Analytics ] [ API/Webhooks ] [ Docs ]                       │
└────────────────────────────────────────────────────────────────┘
                  ↑
              NEW TAB!
              (master_admin only)
```

---

## 📊 Analytics Dashboard Layout

### Top Section: KPI Cards

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│  Runs Today      │  Success Rate    │  Avg Duration    │  Total Cost      │
│  12              │  94.2%           │  3.5 min         │  $8.45           │
│  ↑ 15.2%         │  ↑ 2.1%          │  ↓ 8.3%          │  ↑ 12.5%         │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

Each card shows:
- **Main metric** (large number)
- **Trend indicator** (↑ increase, ↓ decrease)
- **Percentage change** vs baseline

---

### Middle Section: Trend Charts

#### Runs Per Day
```
     Runs
  20 ├────────────────────────────────────────
     │           ╭─╮                    ╭─╮
  15 │        ╭──╯ ╰─╮              ╭──╯ │
     │    ╭───╯      ╰─╮        ╭───╯    │
  10 │╭───╯            ╰─╮  ╭───╯        │
     │                   ╰──╯            │
   5 ├────────────────────────────────────────
     └─────────────────────────────────────────→
     1  3  5  7  9  11 13 15 17 19 21 23 25 27 29  Days
```

#### Cost Per Day
```
     USD
  $15├────────────────────────────────────────
     │        ╭╮  ╭╮              ╭╮
  $10│    ╭───╯╰──╯╰╮          ╭──╯╰─╮
     │ ╭──╯         ╰─╮    ╭───╯     ╰─╮
   $5│─╯              ╰────╯           ╰──
     └─────────────────────────────────────────→
     1  3  5  7  9  11 13 15 17 19 21 23 25 27 29
```

#### Duration Per Day
```
     Minutes
   8 ├────────────────────────────────────────
     │    ╭─╮      ╭╮                ╭─╮
   6 │╭───╯ ╰─╮╭───╯╰─╮          ╭───╯ ╰─╮
     ││       ╰╯      ╰─╮    ╭───╯       │
   4 ││                 ╰────╯           │
     │╰─────────────────────────────────╯
   2 ├────────────────────────────────────────
     └─────────────────────────────────────────→
```

---

### Bottom Left: Cost by Phase (Bar Chart)

```
         $5.00
           │
           │         █████
           │         █████
           │         █████    ████
         $3│         █████    ████
           │  ████   █████    ████    ███
           │  ████   █████    ████    ███
         $1│  ████   █████    ████    ███
           │  ████   █████    ████    ███
           └─────────────────────────────────
           Fathom   Agent  Solution Gamma
           Fetch           Composer  Export
```

Phases:
- **Fathom Fetch:** Meeting data retrieval (~$1.23)
- **Proposal Agent:** AI analysis and ROI (~$4.56)
- **Solution Composer:** SOW generation (~$1.89)
- **Gamma Export:** Presentation creation (~$0.77)

---

### Bottom Middle: Tokens by Phase (Bar Chart)

```
      50k
           │
           │         █████
           │         █████
       40k │         █████
           │         █████
           │         █████
       30k │         █████
           │         █████    ████
           │         █████    ████
       20k │  ████   █████    ████
           │  ████   █████    ████    ████
       10k │  ████   █████    ████    ████
           │  ████   █████    ████    ████
           └─────────────────────────────────
           Fathom   Agent  Solution Gamma
           Fetch           Composer  Export
```

Token usage by phase:
- **Fathom Fetch:** 12,450 tokens
- **Proposal Agent:** 45,680 tokens (largest)
- **Solution Composer:** 18,920 tokens
- **Gamma Export:** 7,730 tokens

---

### Bottom Right: Success/Fail Ratio (Pie Chart)

```
           ╱─────────╲
          ╱           ╲
         ╱   Success   ╲
        │    94.2%      │
        │   (142 runs)  │
         ╲             ╱
          ╲─────╲    ╱
           ╲     ╲  ╱  Failed
            ╲     ╲╱   5.8%
             ╲────╯    (9 runs)
```

Shows:
- **Green segment:** Successful runs
- **Red segment:** Failed runs
- **Hover:** See exact counts

---

### Recent Runs Table

```
┌─────────────────┬───────────┬──────────┬──────────┬────────┬──────────────────┐
│ Run ID          │ Tenant    │ Org      │ Duration │ Cost   │ Status           │
├─────────────────┼───────────┼──────────┼──────────┼────────┼──────────────────┤
│ run-1234-0      │ Acme Corp │ Eng Dept │ 4.2 min  │ $6.34  │ ✓ Success        │
│ run-1234-1      │ Acme Corp │ Eng Dept │ 3.8 min  │ $5.91  │ ✓ Success        │
│ run-1234-2      │ Acme Corp │ Eng Dept │ 5.1 min  │ $7.45  │ ✗ Failed         │
│ run-1234-3      │ Acme Corp │ Eng Dept │ 3.2 min  │ $4.87  │ ✓ Success        │
│ ...             │ ...       │ ...      │ ...      │ ...    │ ...              │
└─────────────────┴───────────┴──────────┴──────────┴────────┴──────────────────┘
```

Click on any row to see detailed breakdown of that run.

---

## 🎬 Optional: Current Run Progress

If a run is currently executing, you'll see this banner:

```
┌───────────────────────────────────────────────────────────────┐
│  🔄 RUN IN PROGRESS                                           │
│  Step 2.6.1 - Analyzing customer data                        │
│  [████████████████████░░░░░░░░] 67%  •  ETA: 2 min           │
└───────────────────────────────────────────────────────────────┘
```

Shows:
- Current step name
- Progress bar
- Percentage complete
- Estimated time remaining

---

## 🎛️ Filter Controls

At the top of the Analytics tab:

```
┌────────────────────────────────────────────────────────────────┐
│  Tenant: [ All Tenants ▼ ]  Org: [ All Orgs ▼ ]             │
│  Date Range: [ Last 30 days ▼ ]              [ ↻ Refresh ]    │
└────────────────────────────────────────────────────────────────┘
```

Filters:
- **Tenant:** Filter by specific tenant (or All)
- **Organization:** Filter by specific org (or All)
- **Date Range:** Last 7 / 14 / 30 days
- **Refresh:** Manually refresh data

---

## 🖱️ Interactive Features

### Hover Effects
- **Charts:** Hover to see exact values at each point
- **KPI Cards:** Hover to see baseline comparison
- **Table Rows:** Hover to highlight

### Click Actions
- **Table Rows:** Click to open detailed run breakdown in side panel
- **Chart Points:** Click to filter by that date
- **Legend Items:** Click to toggle visibility

---

## 🎨 Color Scheme

- **Success:** Green (#10b981)
- **Failed:** Red (#ef4444)
- **Running:** Blue (#3b82f6)
- **Primary Chart Color:** Purple/Blue gradient
- **Secondary Chart Color:** Teal/Cyan gradient
- **Cost Chart:** Gold/Yellow
- **Token Chart:** Blue gradient

---

## 📱 Mobile View

On mobile, the layout stacks vertically:

```
┌──────────────┐
│ Runs Today   │
│ 12  ↑ 15.2% │
├──────────────┤
│ Success Rate │
│ 94.2% ↑ 2.1%│
├──────────────┤
│ ...          │
└──────────────┘

[Runs Chart]
(full width)

[Cost Chart]
(full width)

[Duration Chart]
(full width)

[Cost by Phase]
(full width)

...
```

---

## 🔒 Access Control

### Master Admin (Global Admin)
```
✓ Can see Analytics tab
✓ Can view ALL tenant data
✓ Can filter by tenant/org
✓ Can see system-wide metrics
```

### Tenant Admin
```
✗ Cannot see Analytics tab
```

### Org Admin
```
✗ Cannot see Analytics tab
```

### Regular User
```
✗ Cannot see Analytics tab
```

---

## 💡 What's Real vs Mock

### Currently Mock Data:
- ✓ KPI numbers and trends
- ✓ Chart data points
- ✓ Recent runs list
- ✓ Phase breakdowns

### Will Be Real When Integrated:
- Actual proposal agent runs
- Real cost calculations
- Live token usage
- Actual duration measurements
- Real-time progress tracking

The mock data structure matches the real implementation, so once the proposal agent runs are integrated, the dashboard will automatically show real data.

---

## 🚀 Next Steps

1. **Verify Access:** Confirm you can see Analytics tab as master_admin
2. **Explore Features:** Click around, test filters, hover on charts
3. **Check Console:** Ensure no errors during interaction
4. **Test Filters:** Change date range, tenant, org selections
5. **Click Run:** Click a row in Recent Runs to see details panel

---

## 📸 Screenshot Checklist

When testing, verify you see:
- [ ] Analytics tab in tab bar
- [ ] 4 KPI cards with numbers
- [ ] 3 line charts (Runs, Cost, Duration)
- [ ] 2 bar charts (Cost by Phase, Tokens by Phase)
- [ ] 1 pie chart (Success/Fail)
- [ ] Recent Runs table with 10 rows
- [ ] Filter controls at top
- [ ] Refresh button works

---

## 🐛 If Something Looks Wrong

### Charts Not Rendering
- Check browser console for Recharts errors
- Verify data structure matches expected format
- Try refreshing the page

### No Data Showing
- Check if user is master_admin
- Verify API endpoint returns data
- Check Network tab for failed requests

### Styling Issues
- Check if Tailwind classes are loading
- Verify chart colors are visible (not white-on-white)
- Try different screen sizes

---

## 📚 Related Files

- `/components/AnalyticsDashboard.tsx` - Main component
- `/supabase/functions/server/index.tsx` - Backend endpoints
- `/AUTH_AND_ANALYTICS_FIXES.md` - Technical details
- `/QUICK_FIX_VERIFICATION.md` - Testing guide
