import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from './utils/calculations';

interface WaterfallChartProps {
  grossSavings: number;
  implementation: number;
  training: number;
  software: number;
  integration: number;
  netSavings: number;
}

export function WaterfallChart({ 
  grossSavings, 
  implementation, 
  training, 
  software, 
  integration,
  netSavings 
}: WaterfallChartProps) {
  // Build waterfall data
  const data = [
    {
      name: 'Gross Savings',
      value: grossSavings,
      start: 0,
      fill: '#10b981'
    },
    {
      name: 'Implementation',
      value: -implementation,
      start: grossSavings,
      fill: '#ef4444'
    },
    {
      name: 'Training',
      value: -training,
      start: grossSavings - implementation,
      fill: '#ef4444'
    },
    {
      name: 'Software',
      value: -software,
      start: grossSavings - implementation - training,
      fill: '#ef4444'
    },
    {
      name: 'Integration',
      value: -integration,
      start: grossSavings - implementation - training - software,
      fill: '#ef4444'
    },
    {
      name: 'Net Savings',
      value: netSavings,
      start: 0,
      fill: '#3b82f6'
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium">{item.name}</p>
          <p className={`text-sm ${item.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(item.value))}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value)}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="var(--border)" strokeWidth={2} />
        <Bar dataKey="value" stackId="a">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}