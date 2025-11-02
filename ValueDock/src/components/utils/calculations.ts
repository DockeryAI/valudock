export interface OverheadCosts {
  benefits: number; // % of salary
  payrollTaxes: number; // % of salary
  paidTimeOff: number; // % of salary
  trainingOnboarding: number; // % of salary
  overheadGA: number; // % of salary
}

export interface ErrorReworkCosts {
  errorRate: number; // % of tasks that require rework
  reworkCostPerError: number; // DEPRECATED: cost to fix each error (for backward compatibility)
  reworkCostPercentage: number; // % of process labor cost per error
  // Note: error reduction is calculated based on automation coverage, not input here
}

export interface ComplianceRisk {
  hasComplianceRisk: boolean;
  annualPenaltyRisk: number; // DEPRECATED: potential annual penalties/fines (for backward compatibility)
  
  // New fine structure (detailed compliance modeling)
  fineType?: 'daily' | 'per-incident' | 'per-record' | 'percent-revenue';
  
  // Fine type specific fields
  amountPerDay?: number; // For daily fines
  expectedDurationDays?: number; // For daily fines
  
  amountPerIncident?: number; // For per-incident fines
  expectedIncidentsPerYear?: number; // For per-incident fines
  
  amountPerRecord?: number; // For per-record fines
  recordsAtRisk?: number; // For per-record fines
  
  percentageRate?: number; // For % of revenue fines
  revenueAtRisk?: number; // For % of revenue fines
  
  // Modifiers
  probabilityOfOccurrence?: number; // % probability (0-100)
  
  // Note: risk reduction is calculated based on automation coverage and probability
}

export interface RevenueImpact {
  hasRevenueImpact: boolean;
  revenueTypes: ('speed' | 'quality' | 'capacity' | 'customer-satisfaction')[]; // multiple benefit types
  annualProcessRevenue: number; // how much revenue this process generates annually
  upliftPercentageIf100Automated: number; // % increase in revenue if 100% automated
  // Note: final uplift is calculated as: annualProcessRevenue * upliftPercentage * automationCoverage
  
  // Prompt payment discount benefit (for invoice processing / accounts payable)
  annualInvoiceProcessingVolume?: number; // Annual spend on invoices processed (accounts payable)
  promptPaymentDiscountPercentage?: number; // % discount offered for early payment (e.g., 2%)
  promptPaymentWindowDays?: number; // payment window in days (e.g., 10 days)
  // Note: benefit is calculated as: annualInvoiceProcessingVolume * discountPercentage * automationCoverage
}

export interface AttritionCosts {
  annualTurnoverRate: number; // % of employees who leave annually
  costToReplacePercentage: number; // % of annual salary to replace an employee (default 60%)
  // Note: turnover reduction is calculated based on FTEs freed, not input here
}

export interface InternalCosts {
  // Labor & Workforce (all as % of total process cost)
  trainingOnboardingCosts: number; // % - training & onboarding for new hires
  overtimePremiums: number; // % - overtime premiums tied to cyclical demand/SLA
  shadowSystemsCosts: number; // % - Excel, Access DBs, manual trackers
  
  // IT & Operations (all as % of total process cost)
  softwareLicensing: number; // % - legacy tools/software subscriptions
  infrastructureCosts: number; // % - servers, storage, cloud resources
  itSupportMaintenance: number; // % - IT support, patching, troubleshooting
  
  // Compliance & Risk (all as % of total process cost)
  errorRemediationCosts: number; // % - error correction/rework
  auditComplianceCosts: number; // % - audit prep & compliance reporting
  downtimeCosts: number; // % - business continuity/downtime costs
  
  // Opportunity Costs (all as % of total process cost)
  decisionDelays: number; // % - cost of decision-making delays
  staffCapacityDrag: number; // % - skilled staff tied up with low-value work
  customerImpactCosts: number; // % - SLA breaches, slow turnaround impact
}

export interface SystemIntegrationCosts {
  apiLicensing: number; // annual API/integration licensing costs
  itSupportHoursPerMonth: number; // hours of IT support needed monthly
  itHourlyRate: number; // IT support hourly rate
}

export interface FinancialAssumptions {
  discountRate: number; // cost of capital / discount rate for NPV (as %, e.g., 8 for 8%)
  inflationRate: number; // annual inflation rate
  yearsToProject: number; // number of years for financial projections
  taxRate: number; // corporate tax rate for EBITDA calculations
  riskPremiumFactor?: number; // risk premium multiplier for complexity (default 0.03)
  globalRiskFactor?: number; // optional global risk factor override (0-10 scale) - overrides process complexity scores
}

export interface CostClassification {
  organizationId: string;
  hardCosts: string[]; // Array of cost attribute keys classified as hard costs
  softCosts: string[]; // Array of cost attribute keys classified as soft costs
  lastModified?: string;
  modifiedBy?: string;
  modifiedByName?: string;
}

export interface UtilizationImpact {
  ftesFreedUp: number; // number of FTEs freed by automation (calculated, not user input)
  utilizationType: 'redeployed' | 'eliminated' | 'mixed';
  redeploymentValuePercentage: number; // % of annual salary as redeployment value (default 100%)
}

export interface ComplexityMetrics {
  // Auto-gather toggle (defaults to true)
  autoGatherFromWorkflow: boolean; // Whether to auto-gather from workflow editor (default: true)
  
  // Raw counts (manual override or auto-gathered from workflow)
  // Manual entries in Advanced Metrics override workflow values
  inputsCount: number; // number of distinct systems, APIs, or data sources
  stepsCount: number; // number of tasks or nodes in the workflow
  dependenciesCount: number; // number of distinct teams or roles involved
  
  // Normalized scores (0-10 scale) - calculated automatically
  inputsScore: number; // normalized from inputsCount
  stepsScore: number; // normalized from stepsCount
  dependenciesScore: number; // normalized from dependenciesCount
  
  // Manual override flags (track if user manually overrode auto-gathered values)
  manualInputsOverride?: boolean;
  manualStepsOverride?: boolean;
  manualDependenciesOverride?: boolean;
  
  // Technology & Change factors (optional, for Implementation section only)
  technologyNovelty?: number; // complexity due to new/unfamiliar technology (NOT used in complexity index)
  changeScope?: number; // organizational change management scope (NOT used in complexity index)
  
  // Calculated values
  complexityIndex?: number; // (0.4 * inputsScore) + (0.4 * stepsScore) + (0.2 * dependenciesScore)
  riskCategory?: 'Simple' | 'Moderate' | 'Complex'; // mapped from complexityIndex
  riskValue?: number; // 2, 5, or 8 based on category
}

/**
 * Normalize inputs count to 0-10 score
 * 0-2 inputs → 1-3
 * 3-5 inputs → 4-6
 * 6+ inputs → 7-10
 */
export function normalizeInputsScore(inputsCount: number): number {
  if (inputsCount <= 2) {
    // Map 0-2 to 1-3 linearly
    return Math.min(3, Math.max(1, 1 + inputsCount));
  } else if (inputsCount <= 5) {
    // Map 3-5 to 4-6 linearly
    return 4 + ((inputsCount - 3) / 2) * 2;
  } else {
    // Map 6+ to 7-10, capping at 10
    return Math.min(10, 7 + ((inputsCount - 6) / 4) * 3);
  }
}

/**
 * Normalize steps count to 0-10 score
 * 1-5 steps → 1-3
 * 6-15 steps → 4-6
 * 16+ steps → 7-10
 */
export function normalizeStepsScore(stepsCount: number): number {
  if (stepsCount <= 5) {
    // Map 1-5 to 1-3 linearly
    return Math.min(3, Math.max(1, 1 + ((stepsCount - 1) / 4) * 2));
  } else if (stepsCount <= 15) {
    // Map 6-15 to 4-6 linearly
    return 4 + ((stepsCount - 6) / 9) * 2;
  } else {
    // Map 16+ to 7-10, capping at 10
    return Math.min(10, 7 + ((stepsCount - 16) / 10) * 3);
  }
}

/**
 * Normalize dependencies count to 0-10 score
 * 0-1 team → 1-3
 * 2-3 teams → 4-6
 * 4+ teams → 7-10
 */
export function normalizeDependenciesScore(dependenciesCount: number): number {
  if (dependenciesCount <= 1) {
    // Map 0-1 to 1-3 linearly
    return Math.min(3, Math.max(1, 1 + dependenciesCount * 2));
  } else if (dependenciesCount <= 3) {
    // Map 2-3 to 4-6 linearly
    return 4 + ((dependenciesCount - 2) / 1) * 2;
  } else {
    // Map 4+ to 7-10, capping at 10
    return Math.min(10, 7 + ((dependenciesCount - 4) / 3) * 3);
  }
}

/**
 * Calculate Complexity Index based on CFO Score methodology
 * Formula: Complexity_Index = (0.4 * Inputs_Score) + (0.4 * Steps_Score) + (0.2 * Dependencies_Score)
 */
export function calculateComplexityIndex(metrics: ComplexityMetrics): number {
  const { inputsScore, stepsScore, dependenciesScore } = metrics;
  
  // Weight: 40% inputs, 40% steps, 20% dependencies
  const index = (
    inputsScore * 0.4 +
    stepsScore * 0.4 +
    dependenciesScore * 0.2
  );
  
  return Math.round(index * 10) / 10; // Round to 1 decimal place
}

/**
 * Map Complexity Index to Risk Category and Risk Value
 * 0.0 – 3.9 → Simple → Risk_Value = 2
 * 4.0 – 6.9 → Moderate → Risk_Value = 5
 * 7.0 – 10.0 → Complex → Risk_Value = 8
 */
export function mapComplexityToRisk(complexityIndex: number): {
  category: 'Simple' | 'Moderate' | 'Complex';
  riskValue: number;
} {
  if (complexityIndex < 4.0) {
    return { category: 'Simple', riskValue: 2 };
  } else if (complexityIndex < 7.0) {
    return { category: 'Moderate', riskValue: 5 };
  } else {
    return { category: 'Complex', riskValue: 8 };
  }
}

/**
 * @deprecated Use calculateComplexityIndex instead
 * Calculate overall complexity score (legacy)
 * Weighted average of all complexity factors
 */
export function calculateOverallComplexityScore(metrics: ComplexityMetrics): number {
  // For backward compatibility, use the new formula
  return calculateComplexityIndex(metrics);
}

export interface SLARequirements {
  hasSLA: boolean;
  slaTarget: string; // e.g., "2 hours", "99.9% uptime"
  costOfMissing: number; // cost of missing SLA
  costUnit: 'per-minute' | 'per-hour' | 'per-day' | 'per-week' | 'per-month' | 'per-year'; // unit for cost calculation
  averageMissesPerMonth: number; // how often SLAs are missed on average
}

export interface ImplementationCosts {
  useGlobalSettings: boolean; // whether to use global implementation settings or custom values
  softwareCost: number; // monthly software cost for this process
  automationCoverage: number; // percentage of tasks that can be automated
  implementationTimelineMonths: number; // months to implement this process
  upfrontCosts: number; // one-time setup costs
  trainingCosts: number; // one-time training costs
  consultingCosts: number; // one-time consulting costs
  startMonth: number; // which month to start implementation (for timeline)
  // System integration costs
  apiLicensing: number; // annual API/integration licensing costs
  itSupportHoursPerMonth: number; // hours of IT support needed monthly
  itHourlyRate: number; // IT support hourly rate
  // NPV-based CFO Score fields
  budget?: number; // approved budget for this process (USD)
  eac?: number; // Estimate at Completion (USD)
  emv?: number; // Expected Monetary Value of risks (USD)
}

export interface GlobalDefaults {
  // Process defaults
  averageHourlyWage: number;
  salaryMode: boolean; // true if using salary input instead of hourly
  annualSalary: number; // annual salary (if salaryMode is true)
  taskType: 'batch' | 'real-time' | 'seasonal';
  timeOfDay: 'business-hours' | 'off-hours' | 'any';
  overtimeMultiplier: number;
  overheadCosts: OverheadCosts;
  slaRequirements: SLARequirements;
  seasonalPattern: SeasonalPattern;
  
  // Implementation defaults
  softwareCost: number;
  automationCoverage: number;
  implementationTimelineMonths: number;
  upfrontCosts: number;
  trainingCosts: number;
  consultingCosts: number;
  
  // Other global settings
  tempStaffCostPerHour: number;
  overtimeRate: number;
  businessHours: {
    start: string; // e.g., "09:00"
    end: string; // e.g., "17:00"
    timezone: string; // e.g., "America/New_York"
  };
  
  // CFO-focused global inputs (not per-process)
  attritionCosts: AttritionCosts;
  financialAssumptions: FinancialAssumptions;
  
  // Effort Calculation Anchors (for absolute effort scoring)
  effortAnchors?: {
    costTarget: number; // Target cost in USD for "moderate effort" project (default: 100000)
    timeTarget: number; // Target time in months for "moderate effort" project (default: 6)
  };
}

export interface SeasonalPattern {
  peakMonths: number[];
  peakMultiplier: number;
}

export interface CyclicalPattern {
  type: 'hourly' | 'daily' | 'monthly' | 'none';
  peakHours: number[]; // 0-23 for hours of day
  peakDays: number[]; // 0-6 for days of week (0=Sunday)
  peakDatesOfMonth: number[]; // 1-31 for dates of month
  multiplier: number; // multiplier for peak periods
}

export interface ProcessData {
  id: string;
  name: string;
  group: string; // Process group (e.g., "Operations", "Marketing", "Finance")
  selected: boolean; // Whether this process is selected for calculation
  
  // Basic inputs
  averageHourlyWage: number;
  salaryMode: boolean; // true if using salary input instead of hourly
  annualSalary: number; // annual salary (if salaryMode is true)
  taskVolume: number; // number of tasks
  taskVolumeUnit: 'day' | 'week' | 'month' | 'quarter' | 'year'; // unit for task volume
  timePerTask: number; // time per task
  timeUnit: 'minutes' | 'hours'; // unit for time per task
  fteCount: number; // number of FTEs working on this process
  
  // Task configuration
  taskType: 'batch' | 'real-time' | 'seasonal';
  timeOfDay: 'business-hours' | 'off-hours' | 'any';
  overtimeMultiplier: number;
  
  // Seasonal pattern (only used if taskType is 'seasonal')
  seasonalPattern: SeasonalPattern;
  
  // Cyclical patterns for peak hours/days/months
  cyclicalPattern: CyclicalPattern;
  
  // SLA requirements
  slaRequirements: SLARequirements;
  
  // Implementation costs and timeline
  implementationCosts: ImplementationCosts;
  
  // CFO-focused process-level inputs (now required per process)
  errorReworkCosts: ErrorReworkCosts;
  complianceRisk: ComplianceRisk;
  revenueImpact: RevenueImpact;
  internalCosts: InternalCosts;
  
  // Per-process FTE utilization settings
  utilizationImpact: UtilizationImpact;
  
  // Process complexity metrics for risk calculation
  complexityMetrics?: ComplexityMetrics;
  
  // Workflow integration
  workflowId?: string; // ID of the saved workflow for this process
}

export interface ProcessGroup {
  id: string;
  name: string;
  description?: string;
  averageHourlyWage?: number;
  annualSalary?: number;
  engine?: 'Value Creation' | 'Marketing and Sales' | 'Value Delivery' | 'Finance';
}

export interface InputData {
  processes: ProcessData[];
  groups: ProcessGroup[];
  globalDefaults: GlobalDefaults;
}

export interface ProcessROIResults {
  processId: string;
  name: string;
  group: string;
  annualNetSavings: number;
  roiPercentage: number;
  paybackPeriod: number;
  monthlySavings: number;
  monthlyTimeSaved: number;
  annualTimeSavings: number;
  fullyLoadedHourlyRate: number;
  peakSeasonSavings: number;
  overtimeSavings: number;
  slaComplianceValue: number;
  
  // Implementation and timeline data
  implementationCosts: ImplementationCosts;
  paybackPeriodMonths: number;
  startMonth: number;
  endMonth: number;
  currentProcessCost: number;
  newProcessCost: number;
  netCostReduction: number;
  totalInvestment: number;
  breakEvenMonth: number;
  
  // CFO-focused outputs
  errorReductionSavings: number;
  complianceRiskReduction: number;
  revenueUplift: number;
  promptPaymentBenefit: number;
  ftesFreed: number;
  hardSavings: number; // Labor + error + compliance
  softSavings: number; // Revenue uplift + prompt payment + redeployment value
  
  // Internal cost savings breakdown
  internalCostSavings: {
    // Labor & Workforce
    trainingOnboardingSavings: number;
    overtimePremiumsSavings: number;
    shadowSystemsSavings: number;
    
    // IT & Operations
    softwareLicensingSavings: number;
    infrastructureSavings: number;
    itSupportSavings: number;
    
    // Compliance & Risk
    errorRemediationSavings: number;
    auditComplianceSavings: number;
    downtimeSavings: number;
    
    // Opportunity Costs
    decisionDelaySavings: number;
    staffCapacityDragSavings: number;
    customerImpactSavings: number;
    
    // Totals
    totalLaborWorkforceSavings: number;
    totalITOperationsSavings: number;
    totalComplianceRiskSavings: number;
    totalOpportunityCostSavings: number;
    totalInternalCostSavings: number;
    
    // Hard vs Soft categorization
    hardDollarSavings: number; // Labor, IT, some compliance
    softDollarSavings: number; // Opportunity costs, some compliance
  };
  
  // Ongoing costs from advanced metrics (after automation reduction)
  ongoingITSupportCosts: number;
  ongoingTrainingCosts: number;
  ongoingOvertimeCosts: number;
  ongoingShadowSystemsCosts: number;
}

export interface ROIResults {
  // Aggregate results
  annualNetSavings: number;
  roiPercentage: number;
  paybackPeriod: number;
  monthlySavings: number;
  monthlyTimeSaved: number;
  annualCost: number;
  annualTimeSavings: number;
  
  // Enhanced results
  peakSeasonSavings: number;
  overtimeSavings: number;
  tempStaffSavings: number;
  slaComplianceValue: number;
  implementationROI: number[];
  
  // CFO-focused results
  npv: number; // Net Present Value
  irr: number; // Internal Rate of Return (%)
  totalHardSavings: number; // Labor + error + compliance
  totalSoftSavings: number; // Revenue + redeployment
  ebitdaImpact: number; // Impact on EBITDA (Year 1)
  ebitdaByYear: { year1: number; year2: number; year3: number }; // EBITDA breakdown by year
  totalFTEsFreed: number; // Total FTEs freed up
  fteProductivityUplift: number; // Value per FTE
  totalErrorReductionSavings: number;
  totalComplianceRiskReduction: number;
  totalRevenueUplift: number;
  totalPromptPaymentBenefit: number;
  totalAttritionSavings: number;
  totalSystemIntegrationCosts: number;
  totalInternalCostSavings: number; // Total internal cost savings across all processes
  totalInternalHardDollarSavings: number; // Hard dollar portion of internal savings
  totalInternalSoftDollarSavings: number; // Soft dollar portion of internal savings
  
  // Ongoing costs from advanced metrics (after automation reduction)
  ongoingITSupportCosts: number;
  ongoingTrainingCosts: number;
  ongoingOvertimeCosts: number;
  ongoingShadowSystemsCosts: number;
  
  // Sensitivity analysis
  sensitivityAnalysis: {
    conservative: number; // ROI % at -20% automation coverage
    likely: number; // ROI % at baseline
    optimistic: number; // ROI % at +20% automation coverage
  };
  
  // Process breakdown
  processResults: ProcessROIResults[];
}

export interface CashflowData {
  month: number;
  cumulativeSavings: number;
  cumulativeCost: number;
  netCashflow: number;
}

function calculateProcessOverheadRate(overhead: OverheadCosts): number {
  const totalPercentage = overhead.benefits + overhead.payrollTaxes + overhead.paidTimeOff + 
                         overhead.trainingOnboarding + overhead.overheadGA;
  return totalPercentage / 100;
}

// Helper function to calculate NPV
function calculateNPV(cashFlows: number[], discountRate: number): number {
  return cashFlows.reduce((npv, cashFlow, year) => {
    return npv + (cashFlow / Math.pow(1 + discountRate / 100, year));
  }, 0);
}

/**
 * Calculate Risk-Adjusted NPV for CFO Score
 * Uses discount rate + risk premium based on complexity
 * @param initialCost Total investment cost (C0)
 * @param savingsYears Array of annual savings projections
 * @param startYear First year of benefit realization (1-based)
 * @param discountRate Base discount rate (as decimal, e.g., 0.08 for 8%)
 * @param complexityIndex Complexity index (0-10 scale)
 * @param riskPremiumFactor Risk premium multiplier (default 0.03)
 * @returns Risk-adjusted NPV with prudence adjustment
 */
export function calculateRiskAdjustedNPV(
  initialCost: number,
  savingsYears: number[],
  startYear: number,
  discountRate: number,
  complexityIndex: number = 0,
  riskPremiumFactor: number = 0.03
): number {
  // Calculate risk-adjusted discount rate
  const r_adj = discountRate + (riskPremiumFactor * (complexityIndex / 10));
  
  // Calculate NPV with risk-adjusted rate
  let npv_risk = -initialCost;
  
  savingsYears.forEach((savings, index) => {
    const year = index + 1;
    if (year >= startYear) {
      npv_risk += savings / Math.pow(1 + r_adj, year);
    }
  });
  
  // Apply prudence adjustment for complexity
  const prudenceAdjustment = 1 - (0.05 * (complexityIndex / 10));
  const npv_final = npv_risk * prudenceAdjustment;
  
  return npv_final;
}

/**
 * Calculate CFO Score components for a process
 * @returns Object with all CFO Score components and final score
 */
export function calculateCFOScoreComponents(params: {
  initialCost: number;
  savingsYears: number[];
  startYear: number;
  discountRate: number;
  complexityIndex: number;
  budget: number;
  eac: number;
  emv: number;
  riskPremiumFactor?: number;
  estimatedCost?: number;
  estimatedTime?: number;
  costTarget?: number; // Absolute anchor for cost (default: 100000)
  timeTarget?: number; // Absolute anchor for time in months (default: 6)
  globalRiskFactor?: number; // optional global risk factor override (0-10 scale) - overrides process complexity
}): {
  npv_final: number;
  roi_a: number;
  implementation_effort: number;
  execution_health: number;
  risk_factor: number;
  r_adj: number;
  cfo_score_raw: number;
  cfo_score_norm: number;
  quadrant: 'Quick Win' | 'Strategic Bet' | 'Nice to Have' | 'Deprioritize';
} {
  const {
    initialCost,
    savingsYears,
    startYear,
    discountRate,
    complexityIndex = 0,
    budget,
    eac,
    emv,
    riskPremiumFactor = 0.03,
    estimatedCost,
    estimatedTime,
    costTarget = 100000, // Default: $100,000
    timeTarget = 6, // Default: 6 months
    globalRiskFactor // optional global risk factor override
  } = params;
  
  // Determine which risk factor to use: global override or process complexity
  const effectiveRiskFactor = (globalRiskFactor !== undefined && globalRiskFactor !== null) 
    ? globalRiskFactor 
    : complexityIndex;
  
  // 1. Calculate risk-adjusted discount rate using effective risk factor
  const r_adj = discountRate + (riskPremiumFactor * (effectiveRiskFactor / 10));
  
  // 2. Calculate risk-adjusted NPV using effective risk factor
  const npv_final = calculateRiskAdjustedNPV(
    initialCost,
    savingsYears,
    startYear,
    discountRate,
    effectiveRiskFactor,
    riskPremiumFactor
  );
  
  // 3. Calculate BASE ROI (from NPV)
  const roi_raw = npv_final / Math.max(initialCost, 1);
  
  // 4. Apply ADDITIONAL Risk Adjustment Factor
  // Risk_Factor = effectiveRiskFactor / 10 (uses global override if set, otherwise complexity)
  // Risk_Adjustment = 1 - (0.5 * Risk_Factor)
  // This scales ROI down by up to 50% for the riskiest (10/10) projects
  const risk_factor_adjustment = effectiveRiskFactor / 10;
  const risk_adjustment_multiplier = 1 - (0.5 * risk_factor_adjustment);
  const roi_a = roi_raw * risk_adjustment_multiplier;
  
  
  console.log('    🎲 RISK ADJUSTMENT:');
  console.log('       ' + (globalRiskFactor !== undefined ? 'Global Risk Factor: ' + globalRiskFactor.toFixed(1) + '/10 (OVERRIDE)' : 'Complexity Index: ' + complexityIndex.toFixed(1) + '/10'));
  console.log('       Risk Adjustment Multiplier: ' + (risk_adjustment_multiplier * 100).toFixed(1) + '%');
  console.log('       ROI (raw): ' + (roi_raw * 100).toFixed(1) + '%');
  console.log('       ROI (risk-adjusted): ' + (roi_a * 100).toFixed(1) + '%');
  

  
  
  // 5. Calculate Execution Health (budget control) - kept for backward compatibility
  const execution_health_raw = 1 - ((eac - budget) / Math.max(budget, 1));
  const execution_health = Math.max(0, Math.min(1, execution_health_raw));
  
  // 6. Calculate Risk Factor (exposure normalization)
  const risk_exposure = emv / Math.max(initialCost, 1);
  const risk_factor_raw = 1 - risk_exposure;
  const risk_factor = Math.max(0, Math.min(1, risk_factor_raw));
  
  // 7. Calculate Weighted Implementation Effort (ABSOLUTE ANCHOR MODEL)
  // Uses fixed benchmarks instead of portfolio-relative scaling
  
  
  // Defensive checks - use defaults if values are invalid
  const safeEstimatedCost = (estimatedCost !== undefined && estimatedCost !== null && !isNaN(estimatedCost)) ? estimatedCost : initialCost;
  const safeEstimatedTime = (estimatedTime !== undefined && estimatedTime !== null && !isNaN(estimatedTime)) ? estimatedTime : 1;
  
  // Convert time from weeks to months for comparison with anchor (if time is in weeks)
  // The field implementationTimelineMonths actually stores weeks (legacy naming)
  // We need to determine if this is weeks or months - check if timeTarget is reasonable
  const timeInMonths = safeEstimatedTime / 4.33; // Convert weeks to months (avg 4.33 weeks/month)
  
  // Calculate Cost Score (0-1.2 scale, clamped)
  // Score = Estimated Cost / Cost Target
  const cost_score_raw = safeEstimatedCost / costTarget;
  const cost_factor = Math.max(0, Math.min(1.2, cost_score_raw));
  
  // Calculate Time Score (0-1.2 scale, clamped)
  // Score = Estimated Time / Time Target
  const time_score_raw = timeInMonths / timeTarget;
  const time_factor = Math.max(0, Math.min(1.2, time_score_raw));
  
  // Calculate Complexity Score (0-1 scale from 0-10)
  // Use effectiveRiskFactor (which respects global override) instead of just complexityIndex
  const complexity_factor = Math.max(0, Math.min(1, effectiveRiskFactor / 10));
  
  // Debug logging
  console.log(`    💡 ABSOLUTE EFFORT CALCULATION (50% Cost + 30% Time + 20% Complexity):`);
  console.log(`       Estimated Cost: ${safeEstimatedCost.toLocaleString()}`);
  console.log(`       Cost Target: ${costTarget.toLocaleString()}`);
  console.log(`       Cost Score: ${(cost_factor * 100).toFixed(1)}% (${safeEstimatedCost < costTarget ? 'below' : 'above'} target)`);
  console.log(`       Estimated Time: ${safeEstimatedTime} weeks (${timeInMonths.toFixed(1)} months)`);
  console.log(`       Time Target: ${timeTarget} months`);
  console.log(`       Time Score: ${(time_factor * 100).toFixed(1)}% (${timeInMonths < timeTarget ? 'below' : 'above'} target)`);
  console.log(`       ${globalRiskFactor !== undefined ? `Global Risk Override: ${globalRiskFactor.toFixed(1)}/10 (OVERRIDE)` : `Complexity Index: ${complexityIndex.toFixed(1)}/10`}`);
  console.log(`       Complexity Score: ${(complexity_factor * 100).toFixed(1)}%`);
  
  // Step 2: Weighted combination
  // CFO-aligned weights: 50% Cost, 30% Time, 20% Complexity
  const implementation_effort_raw = 
    (0.5 * cost_factor) + 
    (0.3 * time_factor) + 
    (0.2 * complexity_factor);
  
  console.log(`       WEIGHTED CALCULATION:`);
  console.log(`         Cost Component:       ${(cost_factor * 100).toFixed(1)}% × 50% = ${((0.5 * cost_factor) * 100).toFixed(1)}%`);
  console.log(`         Time Component:       ${(time_factor * 100).toFixed(1)}% × 30% = ${((0.3 * time_factor) * 100).toFixed(1)}%`);
  console.log(`         Complexity Component: ${(complexity_factor * 100).toFixed(1)}% × 20% = ${((0.2 * complexity_factor) * 100).toFixed(1)}%`);
  console.log(`         TOTAL EFFORT (raw):   ${(implementation_effort_raw * 100).toFixed(1)}%`);
  
  // Step 3: Clamp to 0-1 range
  const implementation_effort = Math.max(0, Math.min(1, implementation_effort_raw));
  
  console.log(`         TOTAL EFFORT (final): ${(implementation_effort * 100).toFixed(1)}% ${implementation_effort_raw !== implementation_effort ? '(clamped)' : '(no clamp)'}`);
  console.log(``);
  
  // 8. Calculate CFO Score (raw) - kept for backward compatibility
  const cfo_score_raw = (0.5 * roi_a) + (0.3 * execution_health) + (0.2 * risk_factor);
  
  // 9. Calculate CFO Score (normalized to 0-10 scale) - kept for backward compatibility
  const roi_capped = Math.min(roi_a, 3.0);
  const cfo_score_norm = 10 * (
    (0.5 * (roi_capped / 3.0)) +
    (0.3 * execution_health) +
    (0.2 * risk_factor)
  );
  
  // 10. Determine quadrant based on TRADITIONAL 2x2 MATRIX:
  // X-axis: ROI_a (threshold = 0.5 = 50%)
  // Y-axis: Implementation_Effort (threshold = 0.4 = 40%)
  // Traditional positioning: High ROI + Low Effort = Bottom-Right
  
  let quadrant: 'Quick Win' | 'Strategic Bet' | 'Nice to Have' | 'Deprioritize';
  
  if (roi_a >= 0.5 && implementation_effort <= 0.4) {
    quadrant = 'Quick Win'; // High ROI (≥50%), Low Effort (≤40%)
  } else if (roi_a >= 0.5 && implementation_effort > 0.4) {
    quadrant = 'Strategic Bet'; // High ROI (≥50%), High Effort (>40%)
  } else if (roi_a < 0.5 && implementation_effort <= 0.4) {
    quadrant = 'Nice to Have'; // Low ROI (<50%), Low Effort (≤40%)
  } else {
    // roi_a < 0.5 && implementation_effort > 0.4
    quadrant = 'Deprioritize'; // Low ROI (<50%), High Effort (>40%)
  }
  
  return {
    npv_final,
    roi_a,
    implementation_effort,
    execution_health,
    risk_factor,
    r_adj,
    cfo_score_raw,
    cfo_score_norm,
    quadrant
  };
}

// Helper function to calculate IRR using Newton-Raphson method
function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
  const maxIterations = 100;
  const tolerance = 0.0001;
  let rate = guess;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;
    
    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j);
      dnpv += (-j * cashFlows[j]) / Math.pow(1 + rate, j + 1);
    }
    
    const newRate = rate - npv / dnpv;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100; // Convert to percentage
    }
    
    rate = newRate;
  }
  
  return 0; // If it doesn't converge, return 0
}

function getEffectiveProcessValue<T>(process: ProcessData, field: keyof GlobalDefaults, globalDefaults: GlobalDefaults): T {
  // Now just return the process value since there are no global toggles
  return (process as any)[field] as T;
}

// Helper function to convert task volume to monthly tasks
export function getMonthlyTaskVolume(volume: number, unit: 'day' | 'week' | 'month' | 'quarter' | 'year'): number {
  switch (unit) {
    case 'day': return volume * 22; // Assuming 22 working days per month
    case 'week': return volume * 4.33; // Assuming 4.33 weeks per month
    case 'quarter': return volume / 3; // Divide quarterly by 3 months
    case 'year': return volume / 12; // Divide yearly by 12 months
    case 'month': return volume;
  }
}

// Helper function to convert time per task to minutes
export function getTimePerTaskInMinutes(time: number, unit: 'minutes' | 'hours'): number {
  switch (unit) {
    case 'minutes': return time;
    case 'hours': return time * 60;
  }
}

// Helper function to get effective hourly wage (from salary or direct)
export function getEffectiveHourlyWage(process: ProcessData): number {
  if (process.salaryMode) {
    return process.annualSalary / 2080; // Standard 2080 working hours per year
  }
  return process.averageHourlyWage;
}

// REBUILD MARKER: 2025-10-12-00-24 - Fixed data.processes undefined error in PresentationROIBreakdown
// HARD GATE: ROI Controller Pattern - 2025-10-21
// This function should ONLY be called through the ROI controller with valid classification
function calculateProcessROI(process: ProcessData, globalData: InputData, costClassification?: CostClassification): ProcessROIResults {
  const globalDefaults = globalData.globalDefaults;
  
  // 🚫 CRITICAL HARD GATE: Block calculation if cost classification is invalid
  // This should NEVER execute if ROI controller is working properly
  if (!costClassification || costClassification === null || costClassification === undefined || typeof costClassification !== 'object') {
    console.error('[calculateProcessROI] 🚨 BLOCKED - Invalid cost classification provided', {
      process: process.name,
      costClassification,
      type: typeof costClassification,
      stackTrace: new Error().stack,
    });
    // Return zero results instead of using defaults
    return {
      processId: process.id,
      name: process.name,
      group: process.group,
      annualNetSavings: 0,
      roiPercentage: 0,
      paybackPeriod: 0,
      monthlySavings: 0,
      monthlyTimeSaved: 0,
      annualTimeSavings: 0,
      fullyLoadedHourlyRate: 0,
      peakSeasonSavings: 0,
      overtimeSavings: 0,
      slaComplianceValue: 0,
      implementationCosts: process.implementationCosts,
      paybackPeriodMonths: 0,
      startMonth: process.implementationCosts.startMonth || 0,
      endMonth: (process.implementationCosts.startMonth || 0) + (process.implementationCosts.implementationTimelineMonths || 0),
      currentProcessCost: 0,
      newProcessCost: 0,
      netCostReduction: 0,
      totalInvestment: 0,
      breakEvenMonth: 0,
      errorReductionSavings: 0,
      complianceRiskReduction: 0,
      revenueUplift: 0,
      promptPaymentBenefit: 0,
      ftesFreed: 0,
      hardSavings: 0,
      softSavings: 0,
      internalCostSavings: {
        trainingOnboardingSavings: 0,
        overtimePremiumsSavings: 0,
        shadowSystemsSavings: 0,
        softwareLicensingSavings: 0,
        infrastructureSavings: 0,
        itSupportSavings: 0,
        errorRemediationSavings: 0,
        auditComplianceSavings: 0,
        downtimeSavings: 0,
        decisionDelaySavings: 0,
        staffCapacityDragSavings: 0,
        customerImpactSavings: 0,
        totalLaborWorkforceSavings: 0,
        totalITOperationsSavings: 0,
        totalComplianceRiskSavings: 0,
        totalOpportunityCostSavings: 0,
        totalInternalCostSavings: 0,
        hardDollarSavings: 0,
        softDollarSavings: 0,
      },
      ongoingITSupportCosts: 0,
      ongoingTrainingCosts: 0,
      ongoingOvertimeCosts: 0,
      ongoingShadowSystemsCosts: 0,
    };
  }
  
  // Skip calculation if process is not selected
  if (!process.selected) {
    return {
      processId: process.id,
      name: process.name,
      group: process.group,
      annualNetSavings: 0,
      roiPercentage: 0,
      paybackPeriod: 0,
      monthlySavings: 0,
      monthlyTimeSaved: 0,
      annualTimeSavings: 0,
      fullyLoadedHourlyRate: 0,
      peakSeasonSavings: 0,
      overtimeSavings: 0,
      slaComplianceValue: 0,
      implementationCosts: process.implementationCosts,
      paybackPeriodMonths: 0,
      startMonth: process.implementationCosts.startMonth,
      endMonth: process.implementationCosts.startMonth + process.implementationCosts.implementationTimelineMonths,
      currentProcessCost: 0,
      newProcessCost: 0,
      netCostReduction: 0,
      totalInvestment: 0,
      breakEvenMonth: 0,
      errorReductionSavings: 0,
      complianceRiskReduction: 0,
      revenueUplift: 0,
      promptPaymentBenefit: 0,
      ftesFreed: 0,
      hardSavings: 0,
      softSavings: 0,
      internalCostSavings: {
        trainingOnboardingSavings: 0,
        overtimePremiumsSavings: 0,
        shadowSystemsSavings: 0,
        softwareLicensingSavings: 0,
        infrastructureSavings: 0,
        itSupportSavings: 0,
        errorRemediationSavings: 0,
        auditComplianceSavings: 0,
        downtimeSavings: 0,
        decisionDelaySavings: 0,
        staffCapacityDragSavings: 0,
        customerImpactSavings: 0,
        totalLaborWorkforceSavings: 0,
        totalITOperationsSavings: 0,
        totalComplianceRiskSavings: 0,
        totalOpportunityCostSavings: 0,
        totalInternalCostSavings: 0,
        hardDollarSavings: 0,
        softDollarSavings: 0
      }
    };
  }
  
  // Get effective values using new helper functions
  const effectiveWage = getEffectiveHourlyWage(process);
  const effectiveOvertimeMultiplier = getEffectiveProcessValue<number>(process, 'overtimeMultiplier', globalDefaults);
  
  // Convert to standardized units
  const monthlyTasks = getMonthlyTaskVolume(process.taskVolume, process.taskVolumeUnit);
  const timePerTaskMinutes = getTimePerTaskInMinutes(process.timePerTask, process.timeUnit);
  
  // Calculate fully loaded hourly rate including overhead (always use global overhead)
  const overheadRate = calculateProcessOverheadRate(globalDefaults.overheadCosts);
  const fullyLoadedHourlyRate = effectiveWage * (1 + overheadRate);
  
  // Get automation coverage from implementation costs
  const effectiveAutomationCoverage = process.implementationCosts.automationCoverage;
  
  // Calculate monthly time savings in hours
  const monthlyTimeSavedMinutes = (monthlyTasks * timePerTaskMinutes * effectiveAutomationCoverage) / 100;
  const monthlyTimeSaved = monthlyTimeSavedMinutes / 60; // Convert to hours
  
  // Calculate current process cost (before automation)
  const currentMonthlyTimeCost = (monthlyTasks * timePerTaskMinutes) / 60 * fullyLoadedHourlyRate;
  const currentProcessCost = currentMonthlyTimeCost * 12;
  
  // Calculate new process cost (after automation)
  const automatedTimeCost = currentMonthlyTimeCost * (1 - effectiveAutomationCoverage / 100);
  const processSoftwareCost = process.implementationCosts.softwareCost;
  const newProcessCost = (automatedTimeCost * 12) + (processSoftwareCost * 12);
  
  // Net cost reduction
  const netCostReduction = currentProcessCost - newProcessCost;
  
  // Apply task pattern multipliers
  const overtimeMultiplier = process.timeOfDay === 'off-hours' ? effectiveOvertimeMultiplier : 1;
  
  // Apply cyclical pattern multipliers if applicable
  let cyclicalMultiplier = 1;
  if (process.cyclicalPattern && process.cyclicalPattern.type !== 'none') {
    cyclicalMultiplier = process.cyclicalPattern.multiplier || 1.5;
  }
  
  const effectiveHourlyRate = fullyLoadedHourlyRate * overtimeMultiplier * cyclicalMultiplier;
  
  // Calculate base monthly cost savings
  const baseMonthlySavings = monthlyTimeSaved * effectiveHourlyRate;
  
  // Calculate seasonal adjustments for seasonal task types
  let annualTimeSavings = monthlyTimeSaved * 12;
  let annualGrossSavings = baseMonthlySavings * 12;
  let peakSeasonSavings = 0;
  
  if (process.taskType === 'seasonal') {
    const peakMonthsCount = process.seasonalPattern.peakMonths.length;
    const regularMonthsCount = 12 - peakMonthsCount;
    
    const peakMonthlySavings = baseMonthlySavings * process.seasonalPattern.peakMultiplier;
    annualGrossSavings = (regularMonthsCount * baseMonthlySavings) + (peakMonthsCount * peakMonthlySavings);
    annualTimeSavings = (regularMonthsCount * monthlyTimeSaved) + (peakMonthsCount * monthlyTimeSaved * process.seasonalPattern.peakMultiplier);
    peakSeasonSavings = (peakMonthlySavings - baseMonthlySavings) * peakMonthsCount;
  }
  
  // Calculate overtime savings based on business hours and cyclical patterns
  let overtimeSavings = 0;
  if (process.timeOfDay === 'off-hours') {
    overtimeSavings = monthlyTimeSaved * (globalDefaults.overtimeRate - fullyLoadedHourlyRate) * 12;
  }
  
  // Add cyclical overtime savings if peak periods fall outside business hours
  if (process.cyclicalPattern?.type === 'hourly' && process.cyclicalPattern.peakHours.length > 0) {
    const businessStart = parseInt(globalDefaults.businessHours.start.split(':')[0]);
    const businessEnd = parseInt(globalDefaults.businessHours.end.split(':')[0]);
    const afterHoursPeaks = process.cyclicalPattern.peakHours.filter(hour => 
      hour < businessStart || hour >= businessEnd
    );
    
    if (afterHoursPeaks.length > 0) {
      const afterHoursRatio = afterHoursPeaks.length / process.cyclicalPattern.peakHours.length;
      overtimeSavings += monthlyTimeSaved * afterHoursRatio * 
        (globalDefaults.overtimeRate - fullyLoadedHourlyRate) * 12;
    }
  }
    
  // Calculate SLA compliance value (annual savings from meeting SLA requirements)
  let slaComplianceValue = 0;
  if (process.slaRequirements.hasSLA) {
    const missCount = process.slaRequirements.averageMissesPerMonth;
    const costPerMiss = process.slaRequirements.costOfMissing;
    
    switch (process.slaRequirements.costUnit) {
      case 'per-minute':
        // Cost is per minute, misses per hour -> annual
        slaComplianceValue = costPerMiss * missCount * 8760; // hours per year
        break;
      case 'per-hour':
        // Cost is per hour, misses per day -> annual
        slaComplianceValue = costPerMiss * missCount * 365; // days per year
        break;
      case 'per-day':
        // Cost is per day, misses per week -> annual
        slaComplianceValue = costPerMiss * missCount * 52; // weeks per year
        break;
      case 'per-week':
        // Cost is per week, misses per month -> annual
        slaComplianceValue = costPerMiss * missCount * 12; // months per year
        break;
      case 'per-month':
        // Cost is per month, misses per year -> annual
        slaComplianceValue = costPerMiss * missCount; // already annual
        break;
      case 'per-year':
        // Cost is per year, misses per year -> annual
        slaComplianceValue = costPerMiss * missCount; // already annual
        break;
      default:
        slaComplianceValue = costPerMiss * missCount * 12;
        break;
    }
  }
  
  // Total annual savings including all factors
  const totalAnnualSavings = annualGrossSavings + overtimeSavings + slaComplianceValue;
  
  // Calculate total implementation costs
  const totalImplementationCosts = process.implementationCosts.upfrontCosts + 
    process.implementationCosts.trainingCosts + process.implementationCosts.consultingCosts;
  
  // Calculate payback period for this process
  const monthlySavingsAfterSoftware = (totalAnnualSavings / 12) - processSoftwareCost;
  const paybackPeriodMonths = monthlySavingsAfterSoftware > 0 ? 
    totalImplementationCosts / monthlySavingsAfterSoftware : 999;
  
  // Calculate implementation timeline
  const implementationMonths = process.implementationCosts.implementationTimelineMonths;
  const startMonth = process.implementationCosts.startMonth;
  const endMonth = startMonth + implementationMonths;
  
  // Calculate error reduction savings (process-level)
  // Error reduction is proportional to automation coverage
  const errorRework = process.errorReworkCosts || defaultErrorReworkCosts;
  const annualErrors = monthlyTasks * 12 * (errorRework.errorRate / 100);
  const automationCoverage = process.implementationCosts.automationCoverage / 100;
  
  // Use percentage-based calculation if available, otherwise fall back to fixed cost
  const costPerError = (errorRework.reworkCostPercentage && errorRework.reworkCostPercentage > 0)
    ? (currentProcessCost / (monthlyTasks * 12)) * (errorRework.reworkCostPercentage / 100)
    : (errorRework.reworkCostPerError || 0);
  
  const errorReductionSavings = annualErrors * costPerError * automationCoverage;
  
  // Calculate compliance risk reduction (process-level)
  // Risk reduction is proportional to automation coverage and probability
  const compliance = process.complianceRisk || defaultComplianceRisk;
  
  let complianceRiskReduction = 0;
  
  if (compliance.hasComplianceRisk) {
    // Calculate base fine amount based on fine type
    let baseFineAmount = 0;
    
    if (compliance.fineType) {
      switch (compliance.fineType) {
        case 'daily':
          baseFineAmount = (compliance.amountPerDay || 0) * (compliance.expectedDurationDays || 0);
          break;
        case 'per-incident':
          baseFineAmount = (compliance.amountPerIncident || 0) * (compliance.expectedIncidentsPerYear || 0);
          break;
        case 'per-record':
          baseFineAmount = (compliance.amountPerRecord || 0) * (compliance.recordsAtRisk || 0);
          break;
        case 'percent-revenue':
          baseFineAmount = (compliance.revenueAtRisk || 0) * ((compliance.percentageRate || 0) / 100);
          break;
      }
      
      // Apply probability and automation coverage
      const probability = (compliance.probabilityOfOccurrence || 100) / 100;
      complianceRiskReduction = baseFineAmount * probability * automationCoverage;
    } else {
      // Backward compatibility: use legacy annualPenaltyRisk field
      complianceRiskReduction = compliance.annualPenaltyRisk * automationCoverage;
    }
  }
  
  // Calculate revenue uplift (process-level)
  // Final uplift = annualProcessRevenue * upliftPercentage * automationCoverage
  const revenue = process.revenueImpact || defaultRevenueImpact;
  const revenueUplift = revenue.hasRevenueImpact ? 
    revenue.annualProcessRevenue * (revenue.upliftPercentageIf100Automated / 100) * automationCoverage : 0;
  
  // Calculate prompt payment discount benefit (process-level)
  // Benefit = annualInvoiceProcessingVolume * discountPercentage * automationCoverage
  const promptPaymentBenefit = (
    (revenue.promptPaymentDiscountPercentage !== undefined && revenue.promptPaymentDiscountPercentage > 0) && 
    (revenue.promptPaymentWindowDays !== undefined && revenue.promptPaymentWindowDays > 0) && 
    (revenue.annualInvoiceProcessingVolume !== undefined && revenue.annualInvoiceProcessingVolume > 0)
  ) ? revenue.annualInvoiceProcessingVolume * (revenue.promptPaymentDiscountPercentage / 100) * automationCoverage : 0;
  
  // Total revenue benefit includes both uplift and prompt payment discount
  const totalRevenueBenefit = revenueUplift + promptPaymentBenefit;
  
  // Calculate system integration costs (now part of implementation costs)
  // IT support hours are reduced by automation coverage percentage
  const reducedITSupportHours = process.implementationCosts.itSupportHoursPerMonth * (1 - automationCoverage);
  const processSystemIntegrationCosts = process.implementationCosts.apiLicensing + 
    (reducedITSupportHours * 12 * process.implementationCosts.itHourlyRate);
  
  // Calculate FTEs freed (use process FTE count if available, else calculate from hours)
  const ftesFreed = process.fteCount || (annualTimeSavings / 2080); // 2080 working hours per year
  
  // Calculate internal cost savings (all are % of current process cost)
  const internalCosts = process.internalCosts || defaultInternalCosts;
  
  // Labor & Workforce savings
  const trainingOnboardingSavings = currentProcessCost * (internalCosts.trainingOnboardingCosts / 100) * automationCoverage;
  const overtimePremiumsSavings = currentProcessCost * (internalCosts.overtimePremiums / 100) * automationCoverage;
  const shadowSystemsSavings = currentProcessCost * (internalCosts.shadowSystemsCosts / 100) * automationCoverage;
  
  // IT & Operations savings
  const softwareLicensingSavings = currentProcessCost * (internalCosts.softwareLicensing / 100) * automationCoverage;
  const infrastructureSavings = currentProcessCost * (internalCosts.infrastructureCosts / 100) * automationCoverage;
  const itSupportSavings = currentProcessCost * (internalCosts.itSupportMaintenance / 100) * automationCoverage;
  
  // Compliance & Risk savings
  const errorRemediationSavings = currentProcessCost * (internalCosts.errorRemediationCosts / 100) * automationCoverage;
  const auditComplianceSavings = currentProcessCost * (internalCosts.auditComplianceCosts / 100) * automationCoverage;
  const downtimeSavings = currentProcessCost * (internalCosts.downtimeCosts / 100) * automationCoverage;
  
  // Opportunity Costs savings (fixed variable naming - 2025-10-11)
  const decisionDelaySavings = currentProcessCost * (internalCosts.decisionDelays / 100) * automationCoverage;
  const staffCapacityDragSavings = currentProcessCost * (internalCosts.staffCapacityDrag / 100) * automationCoverage;
  const customerImpactSavings = currentProcessCost * (internalCosts.customerImpactCosts / 100) * automationCoverage;
  
  console.log('[calculateProcessROI] Opportunity cost savings:', {
    processName: process.name,
    currentProcessCost,
    automationCoverage,
    decisionDelays: internalCosts.decisionDelays,
    staffCapacityDrag: internalCosts.staffCapacityDrag,
    customerImpactCosts: internalCosts.customerImpactCosts,
    decisionDelaySavings,
    staffCapacityDragSavings,
    customerImpactSavings
  });
  
  // Category totals
  const totalLaborWorkforceSavings = trainingOnboardingSavings + overtimePremiumsSavings + shadowSystemsSavings;
  const totalITOperationsSavings = softwareLicensingSavings + infrastructureSavings + itSupportSavings;
  const totalComplianceRiskSavings = errorRemediationSavings + auditComplianceSavings + downtimeSavings;
  const totalOpportunityCostSavings = decisionDelaySavings + staffCapacityDragSavings + customerImpactSavings;
  const totalInternalCostSavings = totalLaborWorkforceSavings + totalITOperationsSavings + 
    totalComplianceRiskSavings + totalOpportunityCostSavings;
  
  // Hard vs Soft dollar categorization
  // Use custom cost classification if provided, otherwise use defaults
  // 
  // IMPORTANT: This section maps all 16 cost attributes from the Cost Classification UI
  // to their corresponding savings values. Some attributes (laborCosts, turnoverCosts,
  // apiLicensing, slaPenalties) are not tracked as separate internal cost savings,
  // so they map to 0 in the internal costs calculation. However, laborCosts is handled
  // separately below as it represents the base FTE/labor savings.
  let internalHardDollarSavings = 0;
  let internalSoftDollarSavings = 0;
  
  if (costClassification) {
    // Use organization's custom classification
    console.log('[calculateProcessROI] Using custom cost classification:', {
      hardCosts: costClassification.hardCosts,
      softCosts: costClassification.softCosts
    });
    
    // Map all 16 cost attributes to their savings values
    // Note: laborCosts, turnoverCosts, apiLicensing, and slaPenalties are not currently
    // tracked as separate internal cost savings, so they map to 0
    const savingsMap: Record<string, number> = {
      // Labor & Workforce (5 attributes)
      'laborCosts': 0, // Base labor cost - not a savings category
      'trainingOnboardingCosts': trainingOnboardingSavings,
      'overtimePremiums': overtimePremiumsSavings,
      'shadowSystemsCosts': shadowSystemsSavings,
      'turnoverCosts': 0, // Not currently tracked as separate savings
      
      // IT & Operations (4 attributes)
      'softwareLicensing': softwareLicensingSavings,
      'infrastructureCosts': infrastructureSavings,
      'itSupportMaintenance': itSupportSavings,
      'apiLicensing': 0, // Part of implementation costs, not internal savings
      
      // Compliance & Risk (3 attributes)
      'errorRemediationCosts': errorRemediationSavings,
      'auditComplianceCosts': auditComplianceSavings,
      'downtimeCosts': downtimeSavings,
      
      // Opportunity Costs (4 attributes)
      'decisionDelays': decisionDelaySavings,
      'staffCapacityDrag': staffCapacityDragSavings,
      'customerImpactCosts': customerImpactSavings,
      'slaPenalties': 0 // Not currently tracked as separate savings
    };
    
    // Sum up hard costs based on classification
    const hardCostDetails: Record<string, number> = {};
    costClassification.hardCosts.forEach(costKey => {
      const value = savingsMap[costKey] || 0;
      if (value > 0) {
        hardCostDetails[costKey] = value;
        internalHardDollarSavings += value;
      }
    });
    
    // Sum up soft costs based on classification
    const softCostDetails: Record<string, number> = {};
    costClassification.softCosts.forEach(costKey => {
      const value = savingsMap[costKey] || 0;
      if (value > 0) {
        softCostDetails[costKey] = value;
        internalSoftDollarSavings += value;
      }
    });
    
    console.log('[calculateProcessROI] Cost categorization results:', {
      processName: process.name,
      totalInternalCostSavings,
      internalHardDollarSavings,
      internalSoftDollarSavings,
      hardCostDetails,
      softCostDetails,
      hardCostCount: Object.keys(hardCostDetails).length,
      softCostCount: Object.keys(softCostDetails).length
    });
  } else {
    // Default classification (Software Licensing and Infrastructure are hard, rest are soft)
    // NOTE: This should rarely/never execute if ROI controller is working properly
    console.warn('[calculateProcessROI] ⚠️ Using default cost classification - custom classification not provided');
    internalHardDollarSavings = softwareLicensingSavings + infrastructureSavings;
    internalSoftDollarSavings = trainingOnboardingSavings + shadowSystemsSavings + 
      overtimePremiumsSavings + itSupportSavings + 
      errorRemediationSavings + auditComplianceSavings + downtimeSavings + 
      totalOpportunityCostSavings;
  }
  
  // Determine if base labor savings should be hard or soft based on classification
  let laborSavingsHard = 0;
  let laborSavingsSoft = 0;
  
  if (costClassification) {
    // Use organization's classification for labor costs
    if (costClassification.hardCosts.includes('laborCosts')) {
      laborSavingsHard = annualGrossSavings;
    } else {
      laborSavingsSoft = annualGrossSavings;
    }
  } else {
    // Default: labor costs are hard savings
    // NOTE: This should rarely/never execute if ROI controller is working properly
    laborSavingsHard = annualGrossSavings;
  }
  
  // Determine classification for other process-level benefits
  // When a custom classification exists, we check if specific attributes are classified as hard
  // Otherwise, these default to hard savings
  let processOvertimeSavingsHard = 0;
  let processOvertimeSavingsSoft = 0;
  let errorSavingsHard = 0;
  let errorSavingsSoft = 0;
  let slaSavingsHard = 0;
  let slaSavingsSoft = 0;
  let promptPaymentHard = 0;
  let promptPaymentSoft = 0;
  
  if (costClassification) {
    // Overtime savings: classify based on overtimePremiums setting
    if (costClassification.hardCosts.includes('overtimePremiums')) {
      processOvertimeSavingsHard = overtimeSavings;
    } else {
      processOvertimeSavingsSoft = overtimeSavings;
    }
    
    // Error reduction: classify based on errorRemediationCosts setting
    if (costClassification.hardCosts.includes('errorRemediationCosts')) {
      errorSavingsHard = errorReductionSavings;
    } else {
      errorSavingsSoft = errorReductionSavings;
    }
    
    // SLA compliance: classify based on slaPenalties or customerImpactCosts setting
    if (costClassification.hardCosts.includes('slaPenalties') || costClassification.hardCosts.includes('customerImpactCosts')) {
      slaSavingsHard = slaComplianceValue;
    } else {
      slaSavingsSoft = slaComplianceValue;
    }
    
    // Prompt payment follows the overall classification mode:
    // If ALL costs are soft (hardCosts is empty), prompt payment is also soft
    // Otherwise, prompt payment is hard (it's actual cash flow improvement)
    if (costClassification.hardCosts.length === 0) {
      promptPaymentSoft = promptPaymentBenefit;
    } else {
      promptPaymentHard = promptPaymentBenefit;
    }
  } else {
    // Default: all process-level benefits are hard savings
    // NOTE: This should rarely/never execute if ROI controller is working properly
    processOvertimeSavingsHard = overtimeSavings;
    errorSavingsHard = errorReductionSavings;
    slaSavingsHard = slaComplianceValue;
    promptPaymentHard = promptPaymentBenefit;
  }
  
  // Hard savings (direct cost reduction) - subtract integration costs, add internal hard savings
  const hardSavings = laborSavingsHard + processOvertimeSavingsHard + slaSavingsHard + 
    errorSavingsHard + promptPaymentHard + internalHardDollarSavings - processSystemIntegrationCosts;
  
  // Soft savings (revenue/value uplift + compliance cost avoidance + internal soft savings)
  const softSavings = laborSavingsSoft + processOvertimeSavingsSoft + slaSavingsSoft + 
    errorSavingsSoft + promptPaymentSoft + revenueUplift + complianceRiskReduction + internalSoftDollarSavings;
  
  console.log('[calculateProcessROI] Hard vs Soft breakdown:', {
    processName: process.name,
    laborSavingsHard,
    laborSavingsSoft,
    processOvertimeSavingsHard,
    processOvertimeSavingsSoft,
    errorSavingsHard,
    errorSavingsSoft,
    slaSavingsHard,
    slaSavingsSoft,
    promptPaymentHard,
    promptPaymentSoft,
    internalHardDollarSavings,
    internalSoftDollarSavings,
    totalHardSavings: hardSavings,
    totalSoftSavings: softSavings,
    laborClassification: costClassification?.hardCosts.includes('laborCosts') ? 'hard' : 'soft'
  });
  
  // Total net savings including internal costs and revenue benefits
  const totalNetSavings = totalAnnualSavings + errorReductionSavings + complianceRiskReduction + 
    totalRevenueBenefit + totalInternalCostSavings;
  
  // Calculate ongoing costs from advanced metrics (what remains AFTER automation)
  // These are NOT savings - they are ongoing costs that still need to be paid
  const ongoingTrainingCosts = currentProcessCost * (internalCosts.trainingOnboardingCosts / 100) * (1 - automationCoverage);
  const ongoingOvertimeCosts = currentProcessCost * (internalCosts.overtimePremiums / 100) * (1 - automationCoverage);
  const ongoingShadowSystemsCosts = currentProcessCost * (internalCosts.shadowSystemsCosts / 100) * (1 - automationCoverage);
  const ongoingITSupportCosts = reducedITSupportHours * 12 * process.implementationCosts.itHourlyRate;
  
  return {
    processId: process.id,
    name: process.name,
    group: process.group,
    annualNetSavings: totalNetSavings,
    roiPercentage: totalNetSavings > 0 && processSoftwareCost > 0 ? (totalNetSavings / (processSoftwareCost * 12)) * 100 : 0,
    paybackPeriod: paybackPeriodMonths,
    monthlySavings: totalNetSavings / 12,
    monthlyTimeSaved,
    annualTimeSavings,
    fullyLoadedHourlyRate,
    peakSeasonSavings,
    overtimeSavings,
    slaComplianceValue,
    implementationCosts: process.implementationCosts,
    paybackPeriodMonths,
    startMonth,
    endMonth,
    currentProcessCost,
    newProcessCost,
    netCostReduction,
    totalInvestment: totalImplementationCosts,
    breakEvenMonth: startMonth + Math.ceil(paybackPeriodMonths),
    errorReductionSavings,
    complianceRiskReduction,
    revenueUplift,
    promptPaymentBenefit,
    ftesFreed,
    hardSavings,
    softSavings,
    internalCostSavings: {
      // Labor & Workforce
      trainingOnboardingSavings,
      overtimePremiumsSavings,
      shadowSystemsSavings,
      
      // IT & Operations
      softwareLicensingSavings,
      infrastructureSavings,
      itSupportSavings,
      
      // Compliance & Risk
      errorRemediationSavings,
      auditComplianceSavings,
      downtimeSavings,
      
      // Opportunity Costs
      decisionDelaySavings,
      staffCapacityDragSavings,
      customerImpactSavings,
      
      // Totals
      totalLaborWorkforceSavings,
      totalITOperationsSavings,
      totalComplianceRiskSavings,
      totalOpportunityCostSavings,
      totalInternalCostSavings,
      
      // Hard vs Soft categorization
      hardDollarSavings: internalHardDollarSavings,
      softDollarSavings: internalSoftDollarSavings
    },
    
    // Ongoing costs from advanced metrics (after automation reduction)
    ongoingITSupportCosts,
    ongoingTrainingCosts,
    ongoingOvertimeCosts,
    ongoingShadowSystemsCosts
  };
}

export function calculateROI(data: InputData, timeHorizonMonths: number = 36, costClassification?: CostClassification): ROIResults {
  // Calculate ROI for each process (both selected and unselected for comparison)
  const processResults = data.processes.map(process => calculateProcessROI(process, data, costClassification));
  
  // Filter to only selected processes for aggregation
  const selectedResults = processResults.filter(result => 
    data.processes.find(p => p.name === result.name)?.selected
  );
  
  // Aggregate results across selected processes only
  const totalAnnualNetSavings = selectedResults.reduce((sum, result) => sum + result.annualNetSavings, 0);
  const totalMonthlySavings = selectedResults.reduce((sum, result) => sum + result.monthlySavings, 0);
  const totalMonthlyTimeSaved = selectedResults.reduce((sum, result) => sum + result.monthlyTimeSaved, 0);
  const totalAnnualTimeSavings = selectedResults.reduce((sum, result) => sum + result.annualTimeSavings, 0);
  const totalPeakSeasonSavings = selectedResults.reduce((sum, result) => sum + result.peakSeasonSavings, 0);
  const totalOvertimeSavings = selectedResults.reduce((sum, result) => sum + result.overtimeSavings, 0);
  const totalSlaComplianceValue = selectedResults.reduce((sum, result) => sum + result.slaComplianceValue, 0);
  
  // Calculate temp staff savings for selected seasonal processes
  const selectedSeasonalProcesses = data.processes.filter(p => p.taskType === 'seasonal' && p.selected);
  const tempStaffSavings = selectedSeasonalProcesses.reduce((sum, process) => {
    const effectiveAutomationCoverage = process.implementationCosts.automationCoverage;
    const monthlyTasks = getMonthlyTaskVolume(process.taskVolume, process.taskVolumeUnit);
    const timePerTaskMinutes = getTimePerTaskInMinutes(process.timePerTask, process.timeUnit);
    const monthlyTimeSaved = (monthlyTasks * timePerTaskMinutes * effectiveAutomationCoverage) / 100 / 60;
    const effectiveWage = getEffectiveHourlyWage(process);
    return sum + (process.seasonalPattern.peakMonths.length * monthlyTimeSaved * 
                 (data.globalDefaults.tempStaffCostPerHour - effectiveWage));
  }, 0);
  
  // Calculate total annual software costs across selected processes only
  const annualCost = selectedResults.reduce((sum, result) => {
    const processSoftwareCost = result.implementationCosts.softwareCost;
    return sum + (processSoftwareCost * 12);
  }, 0);
  const annualNetSavings = totalAnnualNetSavings - annualCost;
  
  // Calculate ROI percentage
  const roiPercentage = annualCost > 0 ? (annualNetSavings / annualCost) * 100 : 0;
  
  // Calculate overall payback period (weighted average)
  const totalMonthlyCost = annualCost / 12;
  const paybackPeriod = totalMonthlySavings > totalMonthlyCost 
    ? totalMonthlyCost / (totalMonthlySavings - totalMonthlyCost) 
    : totalMonthlySavings > 0 
      ? totalMonthlyCost / totalMonthlySavings 
      : 0;

  // Calculate implementation timeline ROI based on the longest implementation (selected processes only)
  const maxImplementationMonths = selectedResults.length > 0 ? Math.max(...selectedResults.map(r => r.endMonth)) : 0;
  const implementationROI = [];
  for (let month = 1; month <= maxImplementationMonths; month++) {
    let partialSavings = 0;
    selectedResults.forEach(result => {
      if (month >= result.startMonth && month <= result.endMonth) {
        const progressPercentage = (month - result.startMonth) / (result.endMonth - result.startMonth);
        partialSavings += result.monthlySavings * progressPercentage;
      } else if (month > result.endMonth) {
        partialSavings += result.monthlySavings;
      }
    });
    implementationROI.push(partialSavings);
  }

  // Calculate CFO-focused metrics
  const totalErrorReductionSavings = selectedResults.reduce((sum, r) => sum + r.errorReductionSavings, 0);
  const totalComplianceRiskReduction = selectedResults.reduce((sum, r) => sum + r.complianceRiskReduction, 0);
  const totalRevenueUplift = selectedResults.reduce((sum, r) => sum + r.revenueUplift, 0);
  const totalPromptPaymentBenefit = selectedResults.reduce((sum, r) => sum + r.promptPaymentBenefit, 0);
  const totalFTEsFreed = selectedResults.reduce((sum, r) => sum + r.ftesFreed, 0);
  const totalHardSavings = selectedResults.reduce((sum, r) => sum + r.hardSavings, 0);
  const totalSoftSavings = selectedResults.reduce((sum, r) => sum + r.softSavings, 0);
  const totalInternalCostSavings = selectedResults.reduce((sum, r) => sum + r.internalCostSavings.totalInternalCostSavings, 0);
  const totalInternalHardDollarSavings = selectedResults.reduce((sum, r) => sum + r.internalCostSavings.hardDollarSavings, 0);
  const totalInternalSoftDollarSavings = selectedResults.reduce((sum, r) => sum + r.internalCostSavings.softDollarSavings, 0);
  
  // Calculate attrition savings based on FTEs freed
  // Assumes that automation reduces turnover for the FTEs that are freed up
  // Calculate based on each process's actual salary/hourly wage
  const attrition = data.globalDefaults.attritionCosts || defaultAttritionCosts;
  const totalAttritionSavings = data.processes
    .filter(p => p.selected)
    .reduce((sum, process) => {
      // Find the corresponding result to get FTEs freed for this process
      const processResult = selectedResults.find(r => r.processId === process.id);
      if (!processResult) return sum;
      
      // Calculate annual compensation for this process
      const annualCompensation = process.salaryMode 
        ? process.annualSalary 
        : process.averageHourlyWage * 2080; // 2080 = 52 weeks × 40 hours/week
      
      // Calculate replacement cost as percentage of annual compensation
      const replacementCost = annualCompensation * (attrition.costToReplacePercentage / 100);
      
      // Calculate savings for this process
      const processSavings = processResult.ftesFreed * 
        (attrition.annualTurnoverRate / 100) * 
        replacementCost;
      
      return sum + processSavings;
    }, 0);
  
  // Calculate total system integration costs from all selected processes (now in implementation costs)
  const totalSystemIntegrationCosts = data.processes
    .filter(p => p.selected)
    .reduce((sum, p) => {
      return sum + p.implementationCosts.apiLicensing + 
        (p.implementationCosts.itSupportHoursPerMonth * 12 * p.implementationCosts.itHourlyRate);
    }, 0);
  
  // Calculate NPV and IRR with backward compatibility
  const financialAssumptions = data.globalDefaults.financialAssumptions || defaultFinancialAssumptions;
  const yearsToProject = financialAssumptions.yearsToProject;
  const discountRate = financialAssumptions.discountRate;
  const inflationRate = financialAssumptions.inflationRate;
  
  // Build cash flow array for NPV/IRR using time horizon in months
  const totalUpfrontCosts = selectedResults.reduce((sum, r) => sum + r.totalInvestment, 0);
  const cashFlows = [-totalUpfrontCosts]; // Month 0: negative cash flow (investment)
  
  // Calculate monthly cash flows for the time horizon
  const monthlyNetSavings = (annualNetSavings + totalErrorReductionSavings + 
    totalComplianceRiskReduction + totalRevenueUplift + totalAttritionSavings - 
    totalSystemIntegrationCosts) / 12;
  const monthlySoftwareCosts = annualCost / 12;
  
  // Build monthly cash flows with inflation
  for (let month = 1; month <= timeHorizonMonths; month++) {
    const year = month / 12;
    const inflationMultiplier = Math.pow(1 + inflationRate / 100, year);
    const monthlyNet = (monthlyNetSavings - monthlySoftwareCosts) * inflationMultiplier;
    cashFlows.push(monthlyNet);
  }
  
  // Adjust discount rate from annual to monthly
  const monthlyDiscountRate = discountRate / 12;
  const npv = calculateNPV(cashFlows, monthlyDiscountRate);
  const irr = calculateIRR(cashFlows) * 12; // Convert back to annual rate
  
  // Calculate EBITDA impact (net savings before tax)
  const taxRate = financialAssumptions.taxRate / 100;
  const baseEBITDA = annualNetSavings + totalErrorReductionSavings + 
    totalComplianceRiskReduction + totalRevenueUplift + totalPromptPaymentBenefit + 
    totalAttritionSavings + totalInternalCostSavings - totalSystemIntegrationCosts;
  
  const ebitdaImpact = baseEBITDA * (1 - taxRate);
  
  // Calculate EBITDA by year with inflation (dynamic based on time horizon)
  const numberOfYears = Math.ceil(timeHorizonMonths / 12);
  const ebitdaByYear: Record<string, number> = {};
  for (let year = 1; year <= numberOfYears; year++) {
    ebitdaByYear[`year${year}`] = baseEBITDA * Math.pow(1 + inflationRate / 100, year - 1) * (1 - taxRate);
  }
  
  // Keep backward compatibility with year1, year2, year3 properties
  const ebitdaByYearCompat = {
    year1: ebitdaByYear.year1 || 0,
    year2: ebitdaByYear.year2 || 0,
    year3: ebitdaByYear.year3 || 0,
    ...ebitdaByYear // Include all years for dynamic display
  };
  
  // Calculate FTE productivity uplift using per-process utilization settings
  // Sum up redeployment value from each process based on its actual compensation
  const fteProductivityUplift = selectedResults.reduce((total, processResult) => {
    const process = data.processes.find(p => p.id === processResult.processId);
    if (!process) return total;
    
    const utilization = process.utilizationImpact || defaultUtilizationImpact;
    if (utilization.utilizationType === 'eliminated') return total;
    
    // Calculate annual compensation for this process
    const annualCompensation = process.salaryMode 
      ? (process.annualSalary || 0)
      : ((process.averageHourlyWage || 0) * 2080);
    
    // Redeployment value = ftesFreed * annualCompensation * (percentage / 100)
    const processRedeploymentValue = processResult.ftesFreed * annualCompensation * 
      (utilization.redeploymentValuePercentage / 100);
    
    return total + processRedeploymentValue;
  }, 0);
  
  // Calculate total ongoing costs from advanced metrics
  const ongoingITSupportCosts = selectedResults.reduce((sum, r) => sum + (r.ongoingITSupportCosts || 0), 0);
  const ongoingTrainingCosts = selectedResults.reduce((sum, r) => sum + (r.ongoingTrainingCosts || 0), 0);
  const ongoingOvertimeCosts = selectedResults.reduce((sum, r) => sum + (r.ongoingOvertimeCosts || 0), 0);
  const ongoingShadowSystemsCosts = selectedResults.reduce((sum, r) => sum + (r.ongoingShadowSystemsCosts || 0), 0);
  
  // Sensitivity analysis - calculate manually to avoid recursion
  const avgCoverage = selectedResults.length > 0 
    ? selectedResults.reduce((sum, r) => sum + r.implementationCosts.automationCoverage, 0) / selectedResults.length 
    : 80;
  const conservativeCoverage = avgCoverage * 0.8;
  const optimisticCoverage = avgCoverage * 1.2;
  
  // Simple sensitivity calculation without full recursion
  const sensitivityMultiplier = (coverage: number) => coverage / avgCoverage;
  const conservativeROI = roiPercentage * sensitivityMultiplier(conservativeCoverage);
  const optimisticROI = roiPercentage * sensitivityMultiplier(optimisticCoverage);

  return {
    annualNetSavings,
    roiPercentage,
    paybackPeriod,
    monthlySavings: totalMonthlySavings,
    monthlyTimeSaved: totalMonthlyTimeSaved,
    annualCost,
    annualTimeSavings: totalAnnualTimeSavings,
    peakSeasonSavings: totalPeakSeasonSavings,
    overtimeSavings: totalOvertimeSavings,
    tempStaffSavings,
    slaComplianceValue: totalSlaComplianceValue,
    implementationROI,
    npv,
    irr,
    totalHardSavings,
    totalSoftSavings,
    ebitdaImpact,
    ebitdaByYear: ebitdaByYearCompat,
    totalFTEsFreed,
    fteProductivityUplift,
    totalErrorReductionSavings,
    totalComplianceRiskReduction,
    totalRevenueUplift,
    totalPromptPaymentBenefit,
    totalAttritionSavings,
    totalSystemIntegrationCosts,
    totalInternalCostSavings,
    totalInternalHardDollarSavings,
    totalInternalSoftDollarSavings,
    ongoingITSupportCosts,
    ongoingTrainingCosts,
    ongoingOvertimeCosts,
    ongoingShadowSystemsCosts,
    sensitivityAnalysis: {
      conservative: conservativeROI,
      likely: roiPercentage,
      optimistic: optimisticROI
    },
    processResults
  };
}

export function generateCashflowData(data: InputData, months: number = 24, customResults?: ROIResults, costClassification?: CostClassification): CashflowData[] {
  const results = customResults || calculateROI(data, 36, costClassification);
  const cashflowData: CashflowData[] = [];
  
  let cumulativeSavings = 0;
  let cumulativeCost = 0;
  
  for (let month = 0; month <= months; month++) {
    if (month === 0) {
      // Initial state - include upfront implementation costs for selected processes only
      const selectedResults = results.processResults.filter(result => 
        data.processes.find(p => p.name === result.name)?.selected
      );
      const upfrontCosts = selectedResults.reduce((sum, result) => 
        sum + result.implementationCosts.upfrontCosts + 
        result.implementationCosts.trainingCosts + 
        result.implementationCosts.consultingCosts, 0);
      
      cashflowData.push({
        month,
        cumulativeSavings: 0,
        cumulativeCost: upfrontCosts,
        netCashflow: -upfrontCosts
      });
      cumulativeCost = upfrontCosts;
    } else {
      // Calculate monthly savings based on implementation progress
      let monthlySavings = 0;
      let monthlySoftwareCost = 0;
      
      // Filter to only selected processes
      const selectedResults = results.processResults.filter(result => 
        data.processes.find(p => p.name === result.name)?.selected
      );
      
      selectedResults.forEach(result => {
        if (month >= result.startMonth && month <= result.endMonth) {
          const progressPercentage = (month - result.startMonth + 1) / (result.endMonth - result.startMonth);
          monthlySavings += result.monthlySavings * progressPercentage;
        } else if (month > result.endMonth) {
          monthlySavings += result.monthlySavings;
        }
        
        // Add software costs for active processes
        if (month >= result.startMonth) {
          const processSoftwareCost = result.implementationCosts.softwareCost;
          monthlySoftwareCost += processSoftwareCost;
        }
      });
      
      cumulativeSavings += monthlySavings;
      cumulativeCost += monthlySoftwareCost;
      
      cashflowData.push({
        month,
        cumulativeSavings,
        cumulativeCost,
        netCashflow: cumulativeSavings - cumulativeCost
      });
    }
  }
  
  return cashflowData;
}

export function calculateScenarioROI(data: InputData, coveragePercentage: number): ROIResults {
  const scenarioData = {
    ...data,
    processes: data.processes.map(process => ({
      ...process,
      implementationCosts: {
        ...process.implementationCosts,
        automationCoverage: coveragePercentage
      }
    }))
  };
  return calculateROI(scenarioData);
}

// Round up to 1 decimal place
export function roundToOneDecimal(value: number): number {
  return Math.ceil(value * 10) / 10;
}

export function formatCurrency(amount: number): string {
  // Handle NaN, Infinity, and null/undefined
  if (!isFinite(amount) || amount === null || amount === undefined) {
    return '$0';
  }
  // Round UP to the nearest dollar
  const roundedUp = Math.ceil(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundedUp);
}

export function formatPercentage(value: number): string {
  // Handle NaN, Infinity, and null/undefined
  if (!isFinite(value) || value === null || value === undefined) {
    return '0.0%';
  }
  const rounded = roundToOneDecimal(value);
  return `${rounded.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  // Handle NaN, Infinity, and null/undefined
  if (!isFinite(value) || value === null || value === undefined) {
    return '0';
  }
  const rounded = roundToOneDecimal(value);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(rounded);
}

// Export utilities for PDF/Excel generation
export function generatePDFData(data: InputData, results: ROIResults) {
  const seasonalProcesses = data.processes.filter(p => p.taskType === 'seasonal');
  
  return {
    title: 'ROI Analysis Report',
    timestamp: new Date().toLocaleDateString(),
    inputs: data,
    results: results,
    summary: {
      roi: formatPercentage(results.roiPercentage),
      payback: `${formatNumber(results.paybackPeriod)} months`,
      annualSavings: formatCurrency(results.annualNetSavings),
      processCount: data.processes.length,
      hasSeasonality: seasonalProcesses.length > 0
    }
  };
}

export function generateExcelData(data: InputData, results: ROIResults, cashflowData: CashflowData[]) {
  return {
    worksheets: [
      {
        name: 'Summary',
        data: [
          ['Metric', 'Value'],
          ['ROI Percentage', formatPercentage(results.roiPercentage)],
          ['Annual Net Savings', formatCurrency(results.annualNetSavings)],
          ['Payback Period (months)', formatNumber(results.paybackPeriod)],
          ['Monthly Time Saved (hours)', formatNumber(results.monthlyTimeSaved)],
          ['Peak Season Savings', formatCurrency(results.peakSeasonSavings)],
          ['Overtime Savings', formatCurrency(results.overtimeSavings)],
          ['SLA Compliance Value', formatCurrency(results.slaComplianceValue)],
          ['Number of Processes', data.processes.length]
        ]
      },
      {
        name: 'Process Breakdown',
        data: [
          ['Process Name', 'Task Type', 'Monthly Savings', 'Monthly Time Saved (hrs)', 'Annual Net Savings', 'Payback Period (months)', 'Start Month', 'End Month', 'Current Cost', 'New Cost'],
          ...results.processResults.map(result => {
            const process = data.processes.find(p => p.id === result.processId)!;
            return [
              result.name,
              process.taskType,
              formatCurrency(result.monthlySavings),
              formatNumber(result.monthlyTimeSaved),
              formatCurrency(result.annualNetSavings),
              formatNumber(result.paybackPeriodMonths),
              result.startMonth,
              result.endMonth,
              formatCurrency(result.currentProcessCost),
              formatCurrency(result.newProcessCost)
            ];
          })
        ]
      },
      {
        name: 'Global Settings',
        data: [
          ['Parameter', 'Value'],
          ['Software Cost (Monthly)', formatCurrency(data.globalDefaults.softwareCost)],
          ['Default Implementation Timeline (months)', data.globalDefaults.implementationTimelineMonths],
          ['Default Upfront Costs', formatCurrency(data.globalDefaults.upfrontCosts)],
          ['Default Training Costs', formatCurrency(data.globalDefaults.trainingCosts)],
          ['Default Consulting Costs', formatCurrency(data.globalDefaults.consultingCosts)],
          ['Temp Staff Cost (per hour)', formatCurrency(data.globalDefaults.tempStaffCostPerHour)],
          ['Overtime Rate', formatCurrency(data.globalDefaults.overtimeRate)]
        ]
      },
      {
        name: 'Cashflow',
        data: [
          ['Month', 'Cumulative Savings', 'Cumulative Cost', 'Net Cashflow'],
          ...cashflowData.map(item => [
            item.month,
            item.cumulativeSavings,
            item.cumulativeCost,
            item.netCashflow
          ])
        ]
      }
    ]
  };
}

export const defaultOverheadCosts: OverheadCosts = {
  benefits: 20,          // ~50% of total overhead - health, dental, vision, retirement, life insurance, wellness
  payrollTaxes: 8,       // ~20% of total overhead - Social Security, Medicare, unemployment, workers' comp
  paidTimeOff: 5,        // ~12.5% of total overhead - vacation, holidays, sick leave
  trainingOnboarding: 2, // ~5% of total overhead - initial onboarding, ongoing skills development
  overheadGA: 5          // ~12.5% of total overhead - facilities, IT, HR, finance, legal overhead
};

export const defaultErrorReworkCosts: ErrorReworkCosts = {
  errorRate: 0, // 0% error rate - user should set this
  reworkCostPerError: 0, // $0 per error - deprecated, user should set reworkCostPercentage instead
  reworkCostPercentage: 0 // 0% by default - user should set this
};

export const defaultComplianceRisk: ComplianceRisk = {
  hasComplianceRisk: false,
  annualPenaltyRisk: 0,
  fineType: undefined,
  amountPerDay: 0,
  expectedDurationDays: 0,
  amountPerIncident: 0,
  expectedIncidentsPerYear: 0,
  amountPerRecord: 0,
  recordsAtRisk: 0,
  percentageRate: 0,
  revenueAtRisk: 0,
  probabilityOfOccurrence: 100
};

export const defaultRevenueImpact: RevenueImpact = {
  hasRevenueImpact: false,
  revenueTypes: [],
  annualProcessRevenue: 0,
  upliftPercentageIf100Automated: 0,
  annualInvoiceProcessingVolume: 0,
  promptPaymentDiscountPercentage: 0,
  promptPaymentWindowDays: 0
};

export const defaultInternalCosts: InternalCosts = {
  // Labor & Workforce (% of total process cost)
  trainingOnboardingCosts: 0, // 0% - user should set this
  overtimePremiums: 0, // 0% - user should set this
  shadowSystemsCosts: 0, // 0% - user should set this
  
  // IT & Operations (% of total process cost)
  softwareLicensing: 0, // 0% - user should set this
  infrastructureCosts: 0, // 0% - user should set this
  itSupportMaintenance: 0, // 0% - user should set this
  
  // Compliance & Risk (% of total process cost)
  errorRemediationCosts: 0, // 0% - user should set this
  auditComplianceCosts: 0, // 0% - user should set this
  downtimeCosts: 0, // 0% - user should set this
  
  // Opportunity Costs (% of total process cost)
  decisionDelays: 0, // 0% - user should set this
  staffCapacityDrag: 0, // 0% - user should set this
  customerImpactCosts: 0 // 0% - user should set this
};

export const defaultAttritionCosts: AttritionCosts = {
  annualTurnoverRate: 15, // 15% annual turnover
  costToReplacePercentage: 60 // 60% of annual salary to replace an employee
};

export const defaultSystemIntegrationCosts: SystemIntegrationCosts = {
  apiLicensing: 1200, // $1,200 annual API costs
  itSupportHoursPerMonth: 5, // 5 hours/month IT support
  itHourlyRate: 75 // $75/hr IT rate
};

export const defaultFinancialAssumptions: FinancialAssumptions = {
  discountRate: 10, // 10% discount rate
  inflationRate: 3, // 3% inflation
  yearsToProject: 5, // 5-year projection
  taxRate: 25 // 25% corporate tax rate
};

export const defaultUtilizationImpact: UtilizationImpact = {
  ftesFreedUp: 0,
  utilizationType: 'redeployed',
  redeploymentValuePercentage: 100 // 100% of annual salary as redeployment value
};

export const defaultSLARequirements: SLARequirements = {
  hasSLA: false,
  slaTarget: '',
  costOfMissing: 0,
  costUnit: 'per-month',
  averageMissesPerMonth: 1
};

export const defaultSeasonalPattern: SeasonalPattern = {
  peakMonths: [],
  peakMultiplier: 2.0
};

export const defaultCyclicalPattern: CyclicalPattern = {
  type: 'none',
  peakHours: [],
  peakDays: [],
  peakDatesOfMonth: [],
  multiplier: 1.5
};

export const defaultImplementationCosts: ImplementationCosts = {
  useGlobalSettings: false, // unchecked by default - user must opt-in to use global settings
  softwareCost: 0,
  automationCoverage: 80,
  implementationTimelineMonths: 3,
  upfrontCosts: 0,
  trainingCosts: 0,
  consultingCosts: 0,
  startMonth: 1,
  apiLicensing: 0,
  itSupportHoursPerMonth: 0,
  itHourlyRate: 0
};

export const defaultGlobalDefaults: GlobalDefaults = {
  // Process defaults
  averageHourlyWage: 20,
  salaryMode: false,
  annualSalary: 41600, // $20/hr * 2080 hours
  taskType: 'real-time',
  timeOfDay: 'business-hours',
  overtimeMultiplier: 1.5,
  overheadCosts: { ...defaultOverheadCosts },
  slaRequirements: { ...defaultSLARequirements },
  seasonalPattern: { ...defaultSeasonalPattern },
  
  // Implementation defaults - all start at 0 until user adds them
  softwareCost: 0,
  automationCoverage: 80,
  implementationTimelineMonths: 3,
  upfrontCosts: 0,
  trainingCosts: 0,
  consultingCosts: 0,
  
  // Other global settings
  tempStaffCostPerHour: 60,
  overtimeRate: 60,
  businessHours: {
    start: "09:00",
    end: "17:00",
    timezone: "America/New_York"
  },
  
  // CFO-focused global inputs
  attritionCosts: { ...defaultAttritionCosts },
  financialAssumptions: { ...defaultFinancialAssumptions },
  
  // Effort Calculation Anchors
  effortAnchors: {
    costTarget: 100000, // $100,000 default for mid-sized company
    timeTarget: 6 // 6 months default
  }
};

export function createDefaultProcess(id: string, name: string = 'New Process', startMonth: number = 1, group: string = '', globalDefaults?: GlobalDefaults): ProcessData {
  return {
    id,
    name,
    group, // Empty string by default - no automatic group assignment
    selected: false, // Not selected by default - users must manually select
    averageHourlyWage: globalDefaults?.averageHourlyWage ?? 0, // Use global default if available
    salaryMode: globalDefaults?.salaryMode ?? false,
    annualSalary: globalDefaults?.annualSalary ?? 0, // Use global default if available
    taskVolume: 0, // Set to 0 by default
    taskVolumeUnit: 'month',
    timePerTask: 0, // Set to 0 by default
    timeUnit: 'minutes',
    fteCount: 0, // Set to 0 by default
    taskType: 'real-time',
    timeOfDay: 'business-hours',
    overtimeMultiplier: 1.5,
    seasonalPattern: { peakMonths: [], peakMultiplier: 2.0 }, // No peak months by default
    cyclicalPattern: { type: 'none', peakHours: [], peakDays: [], peakDatesOfMonth: [], multiplier: 1.5 },
    slaRequirements: { hasSLA: false, slaTarget: '', costOfMissing: 0, costUnit: 'per-month', averageMissesPerMonth: 0 },
    implementationCosts: { 
      useGlobalSettings: false, // unchecked by default - user must opt-in to use global settings
      softwareCost: 0,
      automationCoverage: 80,
      implementationTimelineMonths: 3,
      upfrontCosts: 0,
      trainingCosts: 0,
      consultingCosts: 0,
      startMonth,
      apiLicensing: 0,
      itSupportHoursPerMonth: 0,
      itHourlyRate: 0
    },
    errorReworkCosts: { errorRate: 0, reworkCostPerError: 0, reworkCostPercentage: 0 }, // No errors by default
    complianceRisk: { hasComplianceRisk: false, annualPenaltyRisk: 0 }, // No compliance risk by default
    revenueImpact: { hasRevenueImpact: false, revenueTypes: [], annualProcessRevenue: 0, upliftPercentageIf100Automated: 0, promptPaymentDiscountPercentage: 0, promptPaymentWindowDays: 0 }, // No revenue impact by default
    internalCosts: { ...defaultInternalCosts },
    utilizationImpact: { ...defaultUtilizationImpact }
  };
}

// Default groups
export const defaultGroups: ProcessGroup[] = [
  { id: 'operations', name: 'Operations', description: 'Operational processes and workflows' },
  { id: 'finance', name: 'Finance', description: 'Financial and accounting processes' },
  { id: 'support', name: 'Support', description: 'Customer support and service processes' },
  { id: 'marketing', name: 'Marketing', description: 'Marketing and sales processes' },
  { id: 'hr', name: 'HR', description: 'Human resources processes' }
];

// Helper function to merge loaded data with defaults for backward compatibility
export function mergeWithDefaults(data: Partial<InputData>): InputData {
  return {
    groups: data.groups || defaultGroups,
    processes: (data.processes || []).map(p => ({
      ...p,
      selected: p.selected !== undefined ? p.selected : true, // Default to true if not explicitly set
      fteCount: p.fteCount || 1,
      // Merge error rework costs with new percentage field
      errorReworkCosts: {
        ...defaultErrorReworkCosts,
        ...(p.errorReworkCosts || {}),
        reworkCostPercentage: p.errorReworkCosts?.reworkCostPercentage ?? defaultErrorReworkCosts.reworkCostPercentage
      },
      complianceRisk: p.complianceRisk || defaultComplianceRisk,
      // Merge revenue impact with prompt payment fields
      revenueImpact: {
        ...defaultRevenueImpact,
        ...(p.revenueImpact || {}),
        promptPaymentDiscountPercentage: p.revenueImpact?.promptPaymentDiscountPercentage ?? 0,
        promptPaymentWindowDays: p.revenueImpact?.promptPaymentWindowDays ?? 0
      },
      internalCosts: p.internalCosts || defaultInternalCosts,
      utilizationImpact: p.utilizationImpact || defaultUtilizationImpact,
      // Ensure implementation costs include integration fields and useGlobalSettings
      implementationCosts: {
        ...defaultImplementationCosts,
        ...p.implementationCosts,
        useGlobalSettings: p.implementationCosts?.useGlobalSettings ?? true // default to true if not set
      }
    })),
    globalDefaults: {
      ...defaultGlobalDefaults,
      ...(data.globalDefaults || {}),
      attritionCosts: (() => {
        const attrition = data.globalDefaults?.attritionCosts || defaultAttritionCosts;
        // Migrate old costToReplace to costToReplacePercentage if needed
        if ('costToReplace' in attrition && !('costToReplacePercentage' in attrition)) {
          return {
            annualTurnoverRate: attrition.annualTurnoverRate,
            costToReplacePercentage: 60 // default to 60% for migrated data
          };
        }
        return attrition;
      })(),
      financialAssumptions: data.globalDefaults?.financialAssumptions || defaultFinancialAssumptions
    }
  };
}

export const defaultInputData: InputData = {
  groups: [],
  processes: [],
  globalDefaults: { ...defaultGlobalDefaults }
};