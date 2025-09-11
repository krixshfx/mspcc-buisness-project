import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ChartData } from '../../types';

interface InsightVisualizationProps {
    chart: ChartData;
    theme: string;
}

const CustomTooltip = ({ active, payload, label, theme, formatter, unit = '' }: any) => {
  const tooltipBg = theme === 'dark' ? 'rgba(15, 37, 87, 0.8)' : 'rgba(255, 255, 255, 0.9)';
  const textColor = theme === 'dark' ? '#f3f4f6' : '#0F2557';
  const labelColor = theme === 'dark' ? '#d1d5db' : '#4b5563';

  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: tooltipBg, backdropFilter: 'blur(5px)' }} className="p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p style={{ color: labelColor }} className="text-sm font-bold font-display mb-1">{label || payload[0].name}</p>
        {payload.map((pld: any, index: number) => (
             <p key={index} style={{ color: textColor }} className="text-sm font-sans">
                <span className="font-semibold" style={{color: pld.color || pld.payload.fill}}>{pld.name}:</span> {formatter ? formatter(pld.value) : `${pld.value}${unit}`}
            </p>
        ))}
      </div>
    );
  }
  return null;
};


const InsightVisualization: React.FC<InsightVisualizationProps> = ({ chart, theme }) => {
    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
    const isCurrency = chart.data.some(d => Object.values(d).some(v => typeof v === 'number' && (v > 10 || v < -10)));

    const currencyFormatter = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const numberFormatter = (value: number) => value.toLocaleString();
    const formatter = isCurrency ? currencyFormatter : numberFormatter;

    switch (chart.type) {
        case 'bar':
            const barHeight = 35; 
            const chartHeight = Math.max(250, chart.data.length * barHeight); 
            return (
                 <div className="w-full h-full overflow-y-auto">
                    <ResponsiveContainer width="100%" height={chartHeight}>
                        <BarChart layout="vertical" data={chart.data} margin={{ top: 15, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                            <XAxis type="number" tickFormatter={formatter} tick={{ fill: tickColor, fontSize: 12 }} />
                            <YAxis type="category" dataKey={chart.config.xAxisKey || 'name'} width={80} tick={{ fill: tickColor, fontSize: 12 }} interval={0}/>
                            <Tooltip content={<CustomTooltip theme={theme} formatter={formatter} />} cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} />
                            {chart.config.dataKeys.map(key => (
                               <Bar key={key.name} dataKey={key.name} fill={key.color} barSize={20} isAnimationActive={true} animationDuration={500} animationEasing="ease-in-out" />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        case 'pie':
             return (
                <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                             <Pie 
                                data={chart.data} 
                                dataKey={chart.config.dataKeys[0].name}
                                nameKey={chart.config.xAxisKey || 'name'} 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={80}
                                innerRadius={40}
                                isAnimationActive={true} 
                                animationDuration={500} 
                                animationEasing="ease-in-out"
                             >
                                {chart.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chart.config.dataKeys[index % chart.config.dataKeys.length].color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip theme={theme} formatter={formatter} />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            );
        case 'comparison':
             return (
                <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chart.data} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis dataKey={chart.config.xAxisKey || 'metric'} tick={{ fill: tickColor, fontSize: 12 }} />
                        <YAxis tickFormatter={formatter} tick={{ fill: tickColor, fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip theme={theme} formatter={formatter} />} cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} />
                        <Legend />
                        {chart.config.dataKeys.map(key => (
                            <Bar key={key.name} dataKey={key.name} fill={key.color} barSize={30} isAnimationActive={true} animationDuration={500} animationEasing="ease-in-out" />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            );
        default:
            return <div className="text-center text-brand-text-secondary">Unsupported chart type</div>;
    }
};

export default InsightVisualization;