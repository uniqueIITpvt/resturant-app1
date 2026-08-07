import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { RevenueData } from '@/services/dashboardService';

interface AdvancedRevenueChartProps {
  data: RevenueData[];
}

// Custom tooltip component
type CustomTooltipProps = TooltipProps<number, string> & {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
  }>;
  label?: string;
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white p-2 sm:p-3 border border-gray-200 shadow-md rounded-md'>
        <p className='text-xs sm:text-sm font-medium'>{`${label}`}</p>
        <p className='text-xs sm:text-sm text-amber-600'>
          <span className='font-medium'>Revenue:</span> $
          {payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const AdvancedRevenueChart: React.FC<AdvancedRevenueChartProps> = ({
  data,
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Check initially
    checkMobile();

    // Add listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Format large numbers for axis
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  // Format x-axis labels to be shorter on mobile
  const formatXAxis = (value: string) => {
    // On smaller screens, return first 3 chars of month name
    if (isMobile) {
      return value.substring(0, 3);
    }
    return value;
  };

  return (
    <div className='w-full h-full'>
      <div className='flex justify-end mb-4'>
        <div className='inline-flex rounded-md shadow-sm' role='group'>
          <button
            type='button'
            className={`px-3 py-1 text-xs font-medium rounded-l-lg ${
              chartType === 'area'
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setChartType('area')}
          >
            Area
          </button>
          <button
            type='button'
            className={`px-3 py-1 text-xs font-medium rounded-r-lg ${
              chartType === 'bar'
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setChartType('bar')}
          >
            Bar
          </button>
        </div>
      </div>

      <div className='h-[calc(100%-40px)]'>
        <ResponsiveContainer width='100%' height='100%'>
          {chartType === 'area' ? (
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 20,
              }}
            >
              <defs>
                <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#F59E0B' stopOpacity={0.8} />
                  <stop offset='95%' stopColor='#F59E0B' stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                opacity={0.1}
              />
              <XAxis
                dataKey='month'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickMargin={10}
                tickFormatter={formatXAxis}
                angle={-45}
                textAnchor='end'
                height={60}
                minTickGap={2}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={formatYAxis}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type='monotone'
                dataKey='amount'
                name='Revenue'
                stroke='#F59E0B'
                fillOpacity={1}
                fill='url(#colorRevenue)'
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 20,
              }}
              barSize={20}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                opacity={0.1}
              />
              <XAxis
                dataKey='month'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickMargin={10}
                tickFormatter={formatXAxis}
                angle={-45}
                textAnchor='end'
                height={60}
                minTickGap={2}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={formatYAxis}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey='amount'
                name='Revenue'
                fill='#F59E0B'
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdvancedRevenueChart;
