import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from './utils/calculations';

interface FTEImpactChartProps {
  totalFTEsFreed: number;
  utilizationType: 'redeployed' | 'eliminated' | 'mixed';
  redeploymentValue: number;
  hardSavings: number;
  attritionSavings?: number;
}

export function FTEImpactChart({ 
  totalFTEsFreed, 
  utilizationType,
  redeploymentValue,
  hardSavings,
  attritionSavings = 0
}: FTEImpactChartProps) {
  const getUtilizationLabel = () => {
    switch (utilizationType) {
      case 'redeployed':
        return 'Redeployed to Higher-Value Work';
      case 'eliminated':
        return 'Position Elimination';
      case 'mixed':
        return 'Mixed Strategy';
      default:
        return 'Unspecified';
    }
  };

  const getUtilizationColor = () => {
    switch (utilizationType) {
      case 'redeployed':
        return 'text-green-600';
      case 'eliminated':
        return 'text-blue-600';
      case 'mixed':
        return 'text-purple-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getUtilizationBg = () => {
    switch (utilizationType) {
      case 'redeployed':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'eliminated':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'mixed':
        return 'bg-purple-100 dark:bg-purple-900/20';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          FTE Impact & Productivity Uplift
        </CardTitle>
        <CardDescription>
          Full-time equivalent capacity freed and utilization strategy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* FTE Freed Display */}
          <div className={`p-6 rounded-lg ${getUtilizationBg()}`}>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Total FTEs Freed</p>
              <p className={`text-5xl font-bold ${getUtilizationColor()}`}>
                {formatNumber(totalFTEsFreed)}
              </p>
              <p className="text-sm mt-2 text-muted-foreground">
                {getUtilizationLabel()}
              </p>
            </div>
          </div>

          {/* Value Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium">Hard Cost Savings</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(hardSavings)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Direct labor cost reduction
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium">Redeployment Value</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(redeploymentValue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Value from reassignment to revenue activities
              </p>
            </div>
          </div>

          {/* Attrition Impact - Highlighted Section */}
          {attritionSavings > 0 && (
            <div className="p-5 border-2 border-green-500 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-900 dark:text-green-100">Attrition Impact Savings</h4>
              </div>
              <p className="text-3xl font-bold text-green-700 dark:text-green-500 mb-2">
                {formatCurrency(attritionSavings)}
              </p>
              <p className="text-sm text-green-800 dark:text-green-300">
                Reduced turnover costs based on replacement costs (% of annual salary) for positions freed through automation
              </p>
            </div>
          )}

          {/* Per FTE Metrics */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3 text-sm sm:text-base">Per FTE Analysis</h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-muted-foreground">Avg. Savings per FTE</p>
                <p className="font-medium text-sm sm:text-base">
                  {formatCurrency(totalFTEsFreed > 0 ? hardSavings / totalFTEsFreed : 0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg. Redeployment Value</p>
                <p className="font-medium text-sm sm:text-base">
                  {formatCurrency(totalFTEsFreed > 0 ? redeploymentValue / totalFTEsFreed : 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Utilization Strategy Info */}
          <div className="p-3 sm:p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2 text-sm sm:text-base">Utilization Strategy Impact</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {utilizationType === 'redeployed' && 
                'These FTEs can be reassigned to higher-value activities such as strategic initiatives, customer engagement, or revenue-generating projects.'}
              {utilizationType === 'eliminated' && 
                'Position elimination provides direct cost savings through headcount reduction, typically realized through attrition or role consolidation.'}
              {utilizationType === 'mixed' && 
                'A balanced approach combining position elimination for cost savings with strategic redeployment for value creation.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}