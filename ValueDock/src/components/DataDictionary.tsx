import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { BookOpen, Database } from 'lucide-react';

interface DictionaryEntry {
  fieldName: string;
  uiLabel: string;
  dataType: string;
  unit: string;
  defaultValue: string;
  notes: string;
}

const inputFields: DictionaryEntry[] = [
  {
    fieldName: "input_hourly_wage",
    uiLabel: "Average Hourly Wage",
    dataType: "Currency",
    unit: "$",
    defaultValue: "40",
    notes: "Fully loaded hourly cost including salary, benefits, and overhead. Provided by HR or calculated from annual compensation."
  },
  {
    fieldName: "input_tasks_per_month",
    uiLabel: "Tasks per Month",
    dataType: "Number",
    unit: "tasks",
    defaultValue: "100",
    notes: "Total volume of repetitive tasks performed monthly that are candidates for automation. Count all instances across the team."
  },
  {
    fieldName: "input_time_per_task",
    uiLabel: "Time per Task",
    dataType: "Number",
    unit: "minutes",
    defaultValue: "15",
    notes: "Average time to complete one task manually, including data entry, verification, and any follow-up actions. Use time studies for accuracy."
  },
  {
    fieldName: "input_automation_coverage",
    uiLabel: "Automation Coverage",
    dataType: "Percentage",
    unit: "%",
    defaultValue: "80",
    notes: "Percentage of tasks that can be successfully automated. Consider technical feasibility, edge cases, and required manual oversight."
  },
  {
    fieldName: "input_software_cost",
    uiLabel: "Software Cost",
    dataType: "Currency",
    unit: "$/month",
    defaultValue: "500",
    notes: "Monthly cost of automation software including licenses, hosting, maintenance, and implementation costs amortized over time."
  },
  {
    fieldName: "input_task_type",
    uiLabel: "Task Type",
    dataType: "Enum",
    unit: "batch|real-time",
    defaultValue: "real-time",
    notes: "Classification of work pattern: batch jobs (large periodic operations) vs real-time tasks (continuous small operations)"
  },
  {
    fieldName: "input_time_of_day",
    uiLabel: "Time of Day",
    dataType: "Enum",
    unit: "business|off-hours|any",
    defaultValue: "business-hours",
    notes: "When tasks are typically performed. Off-hours work may incur overtime premiums that automation can eliminate."
  },
  {
    fieldName: "input_overtime_rate",
    uiLabel: "Overtime Rate",
    dataType: "Currency",
    unit: "$",
    defaultValue: "60",
    notes: "Hourly rate for overtime work, typically 1.5x regular rate. Used to calculate savings from eliminating off-hours manual work."
  },
  {
    fieldName: "input_temp_staff_cost",
    uiLabel: "Temp Staff Hourly Rate",
    dataType: "Currency",
    unit: "$",
    defaultValue: "60",
    notes: "Cost per hour for temporary staff during peak periods. Automation can eliminate need for seasonal temporary workers."
  },
  {
    fieldName: "input_seasonal_enabled",
    uiLabel: "Seasonal Pattern Enabled",
    dataType: "Boolean",
    unit: "true|false",
    defaultValue: "false",
    notes: "Whether the workload has seasonal variations with peak periods requiring additional resources."
  },
  {
    fieldName: "input_peak_multiplier",
    uiLabel: "Peak Season Multiplier",
    dataType: "Number",
    unit: "multiplier",
    defaultValue: "2.0",
    notes: "Factor by which workload increases during peak season (e.g., 2.0 = double the normal volume)."
  },
  {
    fieldName: "input_sla_fines_prevented",
    uiLabel: "SLA Fines Prevented",
    dataType: "Currency",
    unit: "$/month",
    defaultValue: "0",
    notes: "Monthly penalties avoided through automation's improved compliance and faster processing."
  },
  {
    fieldName: "input_implementation_timeline",
    uiLabel: "Implementation Timeline",
    dataType: "Number",
    unit: "months",
    defaultValue: "3",
    notes: "Expected time to fully implement and optimize the automation solution."
  }
];

const outputFields: DictionaryEntry[] = [
  {
    fieldName: "output_annual_net_savings",
    uiLabel: "Annual Net Savings",
    dataType: "Currency",
    unit: "$",
    defaultValue: "n/a",
    notes: "Formula: (Total Annual Savings) - (Annual Software Cost). Includes labor, overtime, seasonal, and compliance savings."
  },
  {
    fieldName: "output_roi_percentage",
    uiLabel: "ROI Percentage",
    dataType: "Percentage",
    unit: "%",
    defaultValue: "n/a",
    notes: "Formula: (Annual Net Savings ÷ Annual Software Cost) × 100. Measures return on automation investment."
  },
  {
    fieldName: "output_payback_period",
    uiLabel: "Payback Period",
    dataType: "Number",
    unit: "months",
    defaultValue: "n/a",
    notes: "Formula: Annual Software Cost ÷ Monthly Net Savings. Time required to recover the automation investment."
  },
  {
    fieldName: "output_monthly_savings",
    uiLabel: "Monthly Labor Savings",
    dataType: "Currency",
    unit: "$/month",
    defaultValue: "n/a",
    notes: "Formula: (Monthly Time Saved × Effective Hourly Rate). Includes overtime premiums for off-hours work."
  },
  {
    fieldName: "output_monthly_time_saved",
    uiLabel: "Monthly Time Saved",
    dataType: "Number",
    unit: "hours",
    defaultValue: "n/a",
    notes: "Formula: (Tasks per Month × Time per Task × Automation Coverage) ÷ 60. Hours of manual work eliminated monthly."
  },
  {
    fieldName: "output_annual_time_savings",
    uiLabel: "Annual Time Savings",
    dataType: "Number",
    unit: "hours",
    defaultValue: "n/a",
    notes: "Formula: Monthly Time Saved × 12 (adjusted for seasonal patterns). Total annual hours freed up through automation."
  },
  {
    fieldName: "output_peak_season_savings",
    uiLabel: "Peak Season Savings",
    dataType: "Currency",
    unit: "$",
    defaultValue: "n/a",
    notes: "Additional savings during peak periods when manual work would require overtime or temporary staff."
  },
  {
    fieldName: "output_overtime_savings",
    uiLabel: "Overtime Savings",
    dataType: "Currency",
    unit: "$",
    defaultValue: "n/a",
    notes: "Annual savings from eliminating overtime premiums for off-hours task execution."
  },
  {
    fieldName: "output_sla_compliance_value",
    uiLabel: "SLA Compliance Value",
    dataType: "Currency",
    unit: "$",
    defaultValue: "n/a",
    notes: "Annual value of penalties avoided through automation's improved speed and reliability."
  },
  {
    fieldName: "output_implementation_roi",
    uiLabel: "Implementation ROI Timeline",
    dataType: "Array",
    unit: "$/month",
    defaultValue: "n/a",
    notes: "Month-by-month savings progression during implementation phase as automation coverage scales up."
  }
];

const getDataTypeColor = (dataType: string) => {
  switch (dataType.toLowerCase()) {
    case 'currency': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'percentage': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'number': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
  }
};

const DictionaryTable = ({ 
  title, 
  description, 
  fields,
  icon: Icon 
}: { 
  title: string; 
  description: string; 
  fields: DictionaryEntry[];
  icon: React.ElementType;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {title}
      </CardTitle>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Field Name</TableHead>
                <TableHead className="text-xs sm:text-sm">UI Label</TableHead>
                <TableHead className="text-xs sm:text-sm">Data Type</TableHead>
                <TableHead className="text-xs sm:text-sm">Unit</TableHead>
                <TableHead className="text-xs sm:text-sm">Default/Range</TableHead>
                <TableHead className="text-xs sm:text-sm">Notes & Formula</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.fieldName}>
                  <TableCell className="font-mono text-xs sm:text-sm">{field.fieldName}</TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">{field.uiLabel}</TableCell>
                  <TableCell>
                    <Badge className={`${getDataTypeColor(field.dataType)} text-xs`}>
                      {field.dataType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm">{field.unit}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{field.defaultValue}</TableCell>
                  <TableCell className="text-xs sm:text-sm max-w-md">{field.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function DataDictionary() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl">Data Dictionary</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Complete reference for all input parameters and calculated outputs in the ROI analysis
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <h4 className="font-medium mb-2">Purpose</h4>
              <p className="text-muted-foreground">
                This data dictionary defines all variables used in ValuDock, 
                including their data types, units, and calculation formulas.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Usage</h4>
              <p className="text-muted-foreground">
                Reference this guide when collecting data, validating inputs, 
                or explaining calculations to stakeholders.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Types</h4>
              <div className="space-y-1">
                <Badge className={getDataTypeColor('Currency')}>Currency</Badge>
                <Badge className={getDataTypeColor('Percentage')}>Percentage</Badge>
                <Badge className={getDataTypeColor('Number')}>Number</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Fields */}
      <DictionaryTable
        title="Input Parameters"
        description="User-provided values that drive the ROI calculation"
        fields={inputFields}
        icon={Database}
      />

      {/* Output Fields */}
      <DictionaryTable
        title="Calculated Outputs"
        description="Results computed from input parameters using the specified formulas"
        fields={outputFields}
        icon={BookOpen}
      />

      {/* Calculation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Calculation Methodology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Core Formulas</h4>
            <div className="space-y-2 text-sm font-mono bg-muted p-4 rounded-lg">
              <div>Monthly Time Saved = (Tasks per Month × Time per Task × Coverage %) ÷ 60</div>
              <div>Monthly Labor Savings = Monthly Time Saved × Hourly Wage</div>
              <div>Annual Net Savings = (Monthly Labor Savings × 12) - (Software Cost × 12)</div>
              <div>ROI % = (Annual Net Savings ÷ Annual Software Cost) × 100</div>
              <div>Payback Period = Annual Software Cost ÷ Monthly Net Savings</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Assumptions</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Automation coverage remains constant over time</li>
              <li>Hourly wages include fully loaded costs (benefits, overhead)</li>
              <li>Software costs include all implementation and maintenance expenses</li>
              <li>Time savings are immediately realized and do not require additional training</li>
              <li>No additional hardware or infrastructure costs are considered</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Data Quality Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Use time studies or historical data for accurate task timing</li>
              <li>Account for peak and off-peak periods in task volume</li>
              <li>Include realistic automation coverage based on technical feasibility</li>
              <li>Factor in all software-related costs including support and training</li>
              <li>Validate assumptions with subject matter experts</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}