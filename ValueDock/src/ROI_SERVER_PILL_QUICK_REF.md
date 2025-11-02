# 🎯 ROI Server Pill - Quick Reference

## 📍 Location
**Admin → Proposal Agent → Edit Content → ROI Summary Tab**

---

## 🎨 Visual Elements

### 1. Server Pill Badge
```
💵 Quick Stats [Server] ℹ️
```
- **Location**: Card header, next to title
- **Color**: Blue (light: #3B82F6, dark: #1E40AF)
- **Label**: "Server"
- **Purpose**: Indicates server-side computation

### 2. Calculated Tab Badge
```
[💵 ROI Summary ✓ Calculated]
```
- **Location**: Tab trigger in tab bar
- **Color**: Green (#10B981)
- **Label**: "Calculated"
- **Shows when**: ROI stats are loaded from server
- **Hides when**: No stats available

---

## 📊 Metrics Displayed

| # | Metric | Icon | Format | Example |
|---|--------|------|--------|---------|
| 1 | Annual Savings | 📈 | Currency | $450,000 |
| 2 | Payback Period | 📉 | Months (1 dec) | 8.5 months |
| 3 | Before → After | → | Comparison | $100K → $50K |
| 4 | Upfront | 💵 | Currency | $75,000 |
| 5 | Ongoing | 💵 | Currency/yr | $25,000/yr |

---

## 🔌 API Response

### Format A: Status Completed (Immediate Display)
```json
{
  "status": "completed",
  "stats": {
    "annual_savings": 450000,
    "payback_months": 8.5,
    "before_cost": 100000,
    "after_cost": 50000,
    "upfront_investment": 75000,
    "ongoing_investment": 25000
  }
}
```
✅ Values display **immediately** - no secondary fetch

### Format B: Success Only (Backward Compatible)
```json
{
  "success": true,
  "stats": { ... }
}
```
✅ Values display after parsing

---

## ⚡ Quick Actions

### Load Stats
**Automatic on mount**
```typescript
useEffect(() => {
  loadROIQuickStats();
}, [dealId, organizationId, versionId]);
```

### Recalculate
**User triggered**
```
Click [Recalculate] → API call → Immediate update
```

---

## 🎨 Color Palette

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Server Pill BG | `#DBEAFE` | `#1E3A8A` |
| Server Pill Text | `#1D4ED8` | `#93C5FD` |
| Calculated Badge | `#10B981` | `#10B981` |
| Annual Savings | `#10B981` | `#10B981` |
| Payback Period | `#3B82F6` | `#3B82F6` |
| Before→After | `#F97316` | `#F97316` |
| Investment | `#9333EA` | `#9333EA` |

---

## 🔍 Status Detection

```typescript
// Check 1: Status completed (preferred)
if (response.status === 'completed' && response.stats) {
  setRoiQuickStats(response.stats); // ✅ Immediate
}

// Check 2: Success fallback (compatible)
else if (response.success && response.stats) {
  setRoiQuickStats(response.stats); // ✅ Still works
}
```

---

## 🎯 Visual States

| State | Server Pill | Calculated Badge | Metrics |
|-------|-------------|------------------|---------|
| Loading | ✅ Visible | ❌ Hidden | Spinner |
| Data Loaded | ✅ Visible | ✅ Visible | Displayed |
| No Data | ✅ Visible | ❌ Hidden | Empty msg |
| Error | ✅ Visible | ❌ Hidden | Error msg |

---

## 📱 Responsive

### Desktop (≥768px)
- 2×2 grid layout
- Inline pill and title
- Side-by-side metrics

### Mobile (<768px)
- Stacked layout
- Wrapped pill if needed
- Vertical metrics

---

## 🐛 Troubleshooting

| Issue | Check | Fix |
|-------|-------|-----|
| No pill | Import Badge | Add Badge component |
| No badge | Check roiQuickStats | Verify API response |
| No immediate display | Check response.status | Ensure `status: 'completed'` |
| Stuck loading | Check network | Verify API endpoint |

---

## 📚 Related Docs

- [ROI_QUICK_STATS_SERVER_PILL.md](ROI_QUICK_STATS_SERVER_PILL.md) - Full guide
- [QUICK_TEST_ROI_SERVER_PILL.md](QUICK_TEST_ROI_SERVER_PILL.md) - Test guide
- [WORKFLODOCK_AND_ROI_STATS_IMPLEMENTATION.md](WORKFLODOCK_AND_ROI_STATS_IMPLEMENTATION.md) - Complete system

---

**Updated**: 2025-10-16  
**Status**: ✅ Production Ready  
**Version**: 1.0
