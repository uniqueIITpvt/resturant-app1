import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

// Data interface for monthly sales
interface MonthlySalesData {
  month: string;
  sales: number;
}

interface MonthlySalesChartProps {
  data: MonthlySalesData[];
  title?: string;
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
          <span className='font-medium'>Sales:</span> $
          {payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({
  data,
  title = 'Monthly Sales',
}) => {
  // Format Y-axis labels
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  // Format x-axis labels to be shorter on mobile
  const formatXAxis = (value: string) => {
    // On smaller screens, return first 3 chars of month name
    if (window.innerWidth < 640) {
      return value.substring(0, 3);
    }
    return value;
  };

  return (
    <div className='w-full h-full'>
      {title && (
        <h3 className='text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-5 px-1'>
          {title}
        </h3>
      )}
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 0,
            bottom: 20, // Increased bottom margin for labels
          }}
          barSize={30} // Control bar width
        >
          <CartesianGrid strokeDasharray='3 3' vertical={false} opacity={0.1} />
          <XAxis
            dataKey='month'
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickMargin={12}
            tickFormatter={formatXAxis}
            angle={-45} // Angle the labels to prevent overlap
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
            dataKey='sales'
            name='Sales'
            fill='#F59E0B' // Indigo-600 color (blue as in the image)
            radius={[4, 4, 0, 0]} // Rounded top corners
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlySalesChart;
