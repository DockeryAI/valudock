# Comprehensive Update Plan

## Status: IN PROGRESS

This document tracks the extensive list of improvements requested for ValueDock®.

---

## ✅ COMPLETED - BATCH 1: CRITICAL FIXES

### Critical Calculation Fixes
- [x] Fixed $NaN errors in soft savings (fteProductivityUplift calculation)
- [x] Fixed process breakdown field names (annualSavings → annualNetSavings, processName → name)
- [x] Fixed process unselection bug (double toggle issue in ResultsScreen)
- [x] Added hourly wage rounding UP to 2 decimal places when calculated from salary

### Comprehensive Number Input Fixes (35+ fields)
- [x] **ImplementationScreen.tsx** (6 fields): softwareCost, automationCoverage, implementationTimelineMonths, upfrontCosts, trainingCosts, consultingCosts
- [x] **ProcessEditor.tsx** (2 fields): taskVolume, timePerTask
- [x] **ProcessStandardMetrics.tsx** (2 fields): taskVolume, timePerTask
- [x] **InputsScreenTable.tsx** (8 fields): hourlyWage, annualSalary, overtimeMultiplier, turnoverRate, costToReplace, discountRate, inflationRate, taxRate, SLA fields (2)
- [x] **ProcessAdvancedMetricsDialog.tsx** (9 fields): cyclicalMultiplier, SLA fields (2), peakMultiplier, overtimeMultiplier, revenueFields (2), itSupportMaintenance, redeploymentValuePercentage
- [x] **ScenarioScreen.tsx** (1 field): scenario coverage
- [x] **PresentationScreen.tsx** (9 fields): automation%, manual%, challenge fields (2), SOW costs (4)

All number inputs now show blank when value is 0, providing better UX consistency.

---

## ✅ COMPLETED - BATCH 2: UX IMPROVEMENTS

### Task Volume & Time Period Features
- [x] Add yearly and quarterly task volume options
  - Updated ProcessData interface to include 'quarter' and 'year' options
  - Updated getMonthlyTaskVolume() to handle quarterly (÷3) and yearly (÷12) calculations
  - Updated ProcessEditor.tsx dropdown to show 5 options
  - Updated ProcessStandardMetrics.tsx dropdown to show 5 options

### Advanced Metrics UX Fixes
- [x] Fix cyclical range input (e.g., "24-31" no longer disappears)
  - Created MonthlyDatesInput component with local state management
  - Input preserves dashes while typing, only parses on blur or completion
  - Maintains user-friendly range notation (1, 15, 25-31)
- [x] Remove all prepopulated default values from Advanced Metrics
  - Changed cyclical multiplier default from 1.5 to blank (|| '' instead of || 1.5)
  - Changed seasonal peak multiplier default from 2.0 to blank (|| '' instead of || 2.0)
  - Changed overtime multiplier default from 1.5 to blank (|| '' instead of || 1.5)
  - All fields now start completely blank for cleaner UX

---

## 🔄 IN PROGRESS - BATCH 3

### Data Structure Changes ✅
- [x] New processes automatically use global hourly wage default
  - Updated createDefaultProcess() to accept globalDefaults parameter
  - Updated all 4 calls to pass data.globalDefaults
  - New processes now inherit averageHourlyWage, salaryMode, and annualSalary from global settings

### UX Improvements ✅
- [x] Process name: Enter key should save
  - Added onKeyDown handler to blur input on Enter key
- [x] Process name: Auto-highlight text when clicking to edit
  - Added onFocus handler with e.target.select()
- [x] Added quarter/year options to table view
  - Updated InputsScreenTable.tsx taskVolumeUnit dropdown

### Remaining Batch 3 Tasks
- [ ] Data persistence (preserve test data after system refresh)
- [ ] Add optional default salary/hourly rate to group creation
- [ ] Implement proper tab navigation flow through sections

### Advanced Metrics Changes ✅
- [x] Add Prompt Payment Discount option under Business Impact
  - Added promptPaymentDiscountPercentage field (default blank, tooltip: "average is 2%")
  - Added promptPaymentWindowDays field (default blank, tooltip: "average is 10 days")
  - Updated RevenueImpact interface in calculations.ts
  - Added UI section in ProcessAdvancedMetricsDialog.tsx
  - Benefit will be weighted by automation percentage in calculation
- [x] Add mouseover tooltips to ALL tab buttons in Advanced Metrics
  - Created TabTriggerWithTooltip component
  - Added tooltips to all 11 tabs:
    - Process Characteristics: Task Type, Cyclical, SLA
    - Risk Metrics: Errors, Compliance, Risk Mitigation
    - Internal Cost Savings: Labor, IT/Ops, Opportunity
    - Business Impact: Revenue Impact, FTE Utilization
    
### Advanced Metrics - Remaining
- [ ] Change Cost Per Error to percentage-based calculation
- [ ] Remove Staff Capacity Drag from Opportunity section
- [ ] IT Support Hours/Rate should populate from Advanced Metrics IT/Ops tab
  - Auto-carry to Implementation section
  - Reduce by automation percentage

### Results Screen Enhancements (Priority 3)
- [ ] EBITDA section redesign:
  - Show Year 1, Year 2, Year 3 by default (left side of container)
  - Calculate based on upfront cost and cashflow
  - Add expand button to show additional years (based on NPV slider)
  - Keep current frame height (fit 3 years in current space)
- [ ] Display Average Redeployment Value (right of Attrition Impact in FTE section)

### AI Integration Features (Priority 4)
- [ ] Meeting History: Add "Generate with AI" button
  - Uses Fathom integration
  - Pulls transcripts by domain name
  - Sends to ChatGPT for summary (# meetings, topics, attendees)
- [ ] Business Goals: Add "Generate with AI" button
  - Remove AI Assist toggle
  - Replace "Draft from Notes" with "Generate with AI"
  - Summarizes goals from Fathom call scripts
- [ ] Challenges: Add "Generate with AI" button
  - Remove AI Assist toggle
  - Replace "Draft from Notes" with "Generate with AI"
  - Summarizes challenges from Fathom scripts
- [ ] Solutions Summary: Add "Generate with AI" button
  - Sends ROI & Impact data to ChatGPT via AgentKit
  - Summarizes: upfront cost, yearly cost, 3-year ROI, NPV, yearly savings
- [ ] Timeline: Remove AI toggle button

### API Configuration (Priority 4)
- [ ] Create API Configuration section
- [ ] Add ChatGPT API key configuration
- [ ] Add Gamma API key configuration
- [ ] Store keys securely

---

## 📋 DETAILED REQUIREMENTS

### 1. Group Default Compensation
**Requirement**: When creating a new group, provide optional (not required) fields to define default salary or hourly rate for that group.

**Implementation**:
- Add optional `defaultHourlyWage` and `defaultAnnualSalary` to ProcessGroup interface
- Update group creation dialog to include these optional fields
- When creating process in group, check for group defaults first, then fall back to global defaults

### 2. Hourly Wage Rounding
**Requirement**: When adjusting annual salary, hourly wage should round UP to 2nd decimal place.

**Current**: Direct division (salary / 2080)
**New**: Math.ceil((salary / 2080) * 100) / 100

### 3. Tab Navigation
**Requirement**: Tab key should flow through fields in logical order within sections and containers.

**Implementation**:
- Add explicit `tabIndex` attributes to maintain proper flow
- Order: fields in current section → next section in container → next container

### 4. Process Name Editing
**Requirements**:
- Enter key: Save the name
- Click to edit: Auto-highlight all text

**Implementation**:
- Add onKeyDown handler for Enter key
- Add onFocus handler to select all text
- Consider using inline editing pattern

### 5. Task Volume Units
**Current**: day, week, month
**New**: day, week, month, quarter, year

**Implementation**:
- Update taskVolumeUnit type in ProcessData interface
- Add 'quarter' | 'year' to union type
- Update all volume calculations to handle quarterly (91.25 days) and yearly (365 days)

### 6. Cyclical Range Input Fix
**Problem**: Entering "24-31" in monthly cyclical pattern disappears after "24"

**Likely Cause**: Input validation or onChange handler cutting off input prematurely

**Solution**: Debug and fix the range parsing logic to allow full range entry before validation

### 7. Remove Prepopulated Advanced Metrics Data
**Current**: Fields have default values (5%, $50, etc.)
**New**: All fields start completely blank (empty strings)

**Implementation**:
- Update all default values in defaultErrorReworkCosts, defaultInternalCosts, etc. to 0 or empty
- Ensure placeholder text provides guidance

### 8. Cost Per Error as Percentage
**Current**: Flat dollar amount per error
**New**: Percentage of total process cost

**Benefits Calculation**: Error reduction benefit should be weighted by automation coverage percentage

### 9. Prompt Payment Discount
**Location**: Advanced Metrics > Business Impact (new tab or section)

**Fields**:
- Discount Percentage (%) - tooltip: "Average is 2%"
- Discount Window (days) - tooltip: "Average is 10 days"

**Calculation**:
```
annualBenefit = (annualProcessVolume * avgInvoiceValue * discountPercentage / 100) * (automationCoverage / 100)
```

**Display**: Show in ROI section next to revenue uplift

### 10. Remove Staff Capacity Drag
**Location**: Advanced Metrics > Opportunity Costs
**Reason**: Captured under FTE Utilization

**Action**: Remove the field entirely from opportunity tab

### 11. Advanced Metrics Tab Tooltips
**Requirement**: Every tab button needs mouseover tooltip describing that section

**Tabs Needing Tooltips**:
- Task Type
- Cyclical
- SLA
- Errors
- Compliance
- Risk Mitigation
- Labor
- IT/Ops
- Opportunity
- Revenue Impact
- FTE Utilization

### 12. IT Support Integration
**Current**: IT Support Hours and IT Hourly Rate in Implementation section

**New Flow**:
1. Capture in Advanced Metrics > IT/Ops tab
2. Auto-populate to Implementation section
3. Apply automation reduction: `finalITCost = originalITCost * (1 - automationCoverage/100)`

### 13. EBITDA Year Breakdown
**Current**: Single EBITDA value

**New**:
- Default view: Year 1, Year 2, Year 3 (side by side, left of current data)
- Calculation: Based on upfront costs + cashflow per year
- Additional years: Based on NPV Time Horizon slider value
- Expand button: Shows all years when clicked
- Height: Maintain current container height

**Formula**:
```
EBITDA_Year_N = Revenue_Year_N - Operating_Expenses_Year_N - Depreciation
```

### 14. Average Redeployment Value Display
**Location**: Results Screen > FTE section
**Position**: Right of Attrition Impact
**Data**: Average of all redeployment values across selected processes

### 15. Fathom Integration
**Meeting History**:
- "Generate with AI" button
- Pulls all meeting transcripts for company (matched by attendee domain)
- ChatGPT summarizes: count, topics discussed, attendees

**Business Goals/Challenges**:
- "Generate with AI" buttons
- Remove AI Assist toggles
- Replace "Draft from Notes"
- Summarize from Fathom transcripts

**Solutions Summary**:
- "Generate with AI" button
- Send ROI data to ChatGPT via AgentKit
- Generate summary with key metrics

**Timeline**:
- Remove AI toggle button

### 16. API Configuration UI
**New Section** (possibly in Settings or Admin):
- ChatGPT API Key input (secure)
- Gamma API Key input (secure)
- Test connection buttons
- Save/Update functionality

---

## TESTING CHECKLIST

### Input Field Blank States
- [ ] Test every number input with backspace
- [ ] Verify field shows blank (not default value)
- [ ] Verify calculations still work with 0 values

### Calculations
- [ ] Soft savings calculation
- [ ] Total annual benefit calculation
- [ ] Process breakdown per-process calculations
- [ ] EBITDA year-by-year calculations
- [ ] Prompt payment discount calculations
- [ ] Cost per error percentage calculations

### Navigation
- [ ] Tab key flows properly through all sections
- [ ] Enter key saves process names
- [ ] Process name auto-highlights on click

### AI Features
- [ ] Fathom API connection
- [ ] ChatGPT API connection
- [ ] Gamma API connection
- [ ] AI generation for each section
- [ ] Error handling for failed API calls

### Data Persistence
- [ ] Test data preserved after refresh
- [ ] New features don't break existing data
- [ ] Backward compatibility maintained

---

## NOTES

- User wants test data preserved after updates (no reset)
- All changes must maintain backward compatibility
- Performance should not degrade with additional calculations
- Mobile responsiveness must be maintained

---

## NEXT STEPS

1. Fix critical calculation errors ($NaN, $0 breakdowns)
2. Complete remaining input field blank state fixes
3. Implement data structure changes (groups, task units, etc.)
4. Add new features (prompt payment, EBITDA breakdown)
5. Implement AI integrations
6. Add API configuration UI
7. Comprehensive testing
8. Documentation updates

