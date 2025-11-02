import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * LIVE RISK FACTOR TEST COMPONENT
 * 
 * This component provides INSTANT VISUAL FEEDBACK when you change the global risk factor.
 * Use this to verify the risk factor is working correctly.
 */

interface RiskFactorLiveTestProps {
  currentGlobalRisk?: number;
  sampleROI?: number; // Example: 2.0 = 200% ROI
}

export function RiskFactorLiveTest({ 
  currentGlobalRisk = 4.0,
  sampleROI = 2.0 
}: RiskFactorLiveTestProps) {
  const [testRisk, setTestRisk] = useState(currentGlobalRisk);
  const [previousRisk, setPreviousRisk] = useState(currentGlobalRisk);
  
  // Update when currentGlobalRisk changes from parent
  useEffect(() => {
    setTestRisk(currentGlobalRisk);
  }, [currentGlobalRisk]);
  
  // Calculate the risk-adjusted ROI
  const calculateRiskAdjustedROI = (baseROI: number, riskFactor: number) => {
    const riskMultiplier = 1 - (0.5 * (riskFactor / 10));
    return baseROI * riskMultiplier;
  };
  
  const baseROI = sampleROI;
  const currentAdjustedROI = calculateRiskAdjustedROI(baseROI, testRisk);
  const previousAdjustedROI = calculateRiskAdjustedROI(baseROI, previousRisk);
  const roiDelta = currentAdjustedROI - previousAdjustedROI;
  
  const riskMultiplier = 1 - (0.5 * (testRisk / 10));
  const riskPenalty = 0.5 * (testRisk / 10);
  
  return (
    <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🧪</span>
          Live Risk Factor Tester
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag the slider to see INSTANT changes in ROI calculations
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Global Setting */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-orange-300">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Current Global Risk Factor:</span>
            <Badge className="bg-orange-500 text-white text-lg px-3 py-1">
              {currentGlobalRisk.toFixed(1)}/10
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            This is what's currently set in Global Settings
          </p>
        </div>
        
        {/* Interactive Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-semibold">Test Different Risk Levels:</label>
            <Badge className="bg-blue-500 text-white text-lg px-3 py-1">
              {testRisk.toFixed(1)}/10
            </Badge>
          </div>
          
          <Slider
            value={[testRisk]}
            onValueChange={(value) => {
              setPreviousRisk(testRisk);
              setTestRisk(value[0]);
            }}
            min={0}
            max={10}
            step={0.5}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 (No Risk)</span>
            <span>5 (Medium)</span>
            <span>10 (Maximum)</span>
          </div>
        </div>
        
        {/* Live Calculations */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-300">
            <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
              BASE ROI (No Risk)
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {(baseROI * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-300">
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
              RISK-ADJUSTED ROI
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              {(currentAdjustedROI * 100).toFixed(1)}%
              {roiDelta !== 0 && (
                <span className={`text-sm ${roiDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roiDelta > 0 ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
                  {Math.abs(roiDelta * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Risk Details */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-300">
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span>Risk Factor:</span>
              <span className="font-bold">{testRisk.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between">
              <span>Risk Penalty:</span>
              <span className="font-bold text-red-600">{(riskPenalty * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Risk Multiplier:</span>
              <span className="font-bold text-blue-600">{(riskMultiplier * 100).toFixed(1)}%</span>
            </div>
            <div className="border-t border-gray-300 dark:border-gray-700 pt-2 mt-2">
              <div className="flex justify-between">
                <span>Formula:</span>
                <span className="text-xs">ROI × (1 - 0.5 × (Risk/10))</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Calculation:</span>
                <span className="text-xs">{(baseROI * 100).toFixed(1)}% × {(riskMultiplier * 100).toFixed(1)}% = {(currentAdjustedROI * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Test Buttons */}
        <div className="space-y-2">
          <div className="text-sm font-semibold mb-2">Quick Test Scenarios:</div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={testRisk === 0 ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setPreviousRisk(testRisk);
                setTestRisk(0);
              }}
              className="text-xs"
            >
              Risk 0<br />
              <span className="text-xs opacity-70">No Penalty</span>
            </Button>
            <Button
              variant={testRisk === 5 ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setPreviousRisk(testRisk);
                setTestRisk(5);
              }}
              className="text-xs"
            >
              Risk 5<br />
              <span className="text-xs opacity-70">25% Penalty</span>
            </Button>
            <Button
              variant={testRisk === 10 ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setPreviousRisk(testRisk);
                setTestRisk(10);
              }}
              className="text-xs"
            >
              Risk 10<br />
              <span className="text-xs opacity-70">50% Penalty</span>
            </Button>
          </div>
        </div>
        
        {/* Comparison Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-left">Risk</th>
                <th className="px-3 py-2 text-left">Penalty</th>
                <th className="px-3 py-2 text-left">Multiplier</th>
                <th className="px-3 py-2 text-left">Final ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[0, 2, 4, 6, 8, 10].map((risk) => {
                const mult = 1 - (0.5 * (risk / 10));
                const finalROI = baseROI * mult;
                const isCurrent = Math.abs(risk - testRisk) < 0.1;
                
                return (
                  <tr 
                    key={risk} 
                    className={isCurrent ? 'bg-blue-100 dark:bg-blue-900/30 font-bold' : ''}
                  >
                    <td className="px-3 py-2">{risk}/10 {isCurrent && '←'}</td>
                    <td className="px-3 py-2">{(0.5 * (risk / 10) * 100).toFixed(0)}%</td>
                    <td className="px-3 py-2">{(mult * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 font-mono">{(finalROI * 100).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-300">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                How to Verify the Global Risk Factor is Working:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-yellow-800 dark:text-yellow-200">
                <li>Go to <strong>Current State</strong> → <strong>Global Settings</strong> → <strong>Financial Assumptions</strong></li>
                <li>Change <strong>Global Risk Factor Override</strong> to a different value (e.g., from 4.0 to 0.0)</li>
                <li>Go to <strong>Results</strong> tab</li>
                <li>The ROI values should be HIGHER (0 = no penalty)</li>
                <li>Change it to 10.0 and ROI values should be LOWER (50% penalty)</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
