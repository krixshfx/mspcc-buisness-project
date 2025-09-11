

import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, ComposedChart, Scatter, LabelList, Line, ScatterChart, Sector } from 'recharts';
import { CalculatedProduct } from '../types';
import Card from './shared/Card';
import { PresentationChartLineIcon, BriefcaseIcon, DairyIcon, BakeryIcon, PantryIcon, DrinksIcon, ProduceIcon, GenericProductIcon, XCircleIcon, ChartBarIcon, LineChartIcon, ScatterChartIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from './Icons';

interface ProfitabilityChartsProps {
    products: CalculatedProduct[];
    allProducts: CalculatedProduct[];
    hoveredProductId: number | null;
    setHoveredProductId: (id: number | null) => void;
    theme: string;
    onCategorySelect: (category: string | null) => void;
    selectedCategory: string | null;
}

type ChartType = 'bar' | 'line' | 'scatter';
type ChartSize = 'normal' | 'large';


const getCategoryIcon = (category?: string) => {
    switch(category?.toLowerCase()) {
        case 'dairy': return <DairyIcon />;
        case 'bakery': return <BakeryIcon />;
        case 'pantry': return <PantryIcon />;
        case 'drinks': return <DrinksIcon />;
        case 'produce': return <ProduceIcon />;
        default: return <GenericProductIcon />;
    }
};

const CustomTooltip = ({ active, payload, label, theme, formatter, unit = '', extraField, extraFieldFormatter }: any) => {
  const tooltipBg = theme === 'dark' ? 'rgba(15, 37, 87, 0.8)' : 'rgba(255, 255, 255, 0.9)';
  const textColor = theme === 'dark' ? '#f3f4f6' : '#0F2557';
  const labelColor = theme === 'dark' ? '#d1d5db' : '#4b5563';

  if (active && payload && payload.length) {
    const data = payload[0];
    const extraData = data.payload[extraField];
    const formattedValue = formatter ? formatter(data.value) : `${data.value}${unit}`;
    const formattedExtra = extraFieldFormatter ? extraFieldFormatter(extraData) : extraData;

    return (
      <div style={{ backgroundColor: tooltipBg, backdropFilter: 'blur(5px)' }} className="p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p style={{ color: labelColor }} className="text-sm font-bold font-display mb-1">{label || data.name}</p>
        <p style={{ color: textColor }} className="text-sm font-sans">
          <span className="font-semibold">{data.name}:</span> {formattedValue}
        </p>
        {extraField && extraData !== undefined && (
            <p style={{ color: labelColor }} className="text-xs font-sans mt-1">
                <span className="font-semibold">{extraField.charAt(0).toUpperCase() + extraField.slice(1)}:</span> {formattedExtra}
            </p>
        )}
      </div>
    );
  }
  return null;
};

const COLORS_LIGHT = ['#4ECDC4', '#4B8F8C', '#5A6E8C', '#2E4057', '#0F2557', '#93c5fd'];
const COLORS_DARK = ['#4ECDC4', '#58A49E', '#7B8DA8', '#5A6E8C', '#3c5a8e', '#7dd3fc'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const labelRadius = outerRadius + 25;
  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 2;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={x} y={y} textAnchor={textAnchor} fill={fill} fontSize={12} dominantBaseline="central">
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};


const ProfitabilityCharts: React.FC<ProfitabilityChartsProps> = ({ products, allProducts, hoveredProductId, setHoveredProductId, theme, onCategorySelect, selectedCategory }) => {
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [chartSize, setChartSize] = useState<ChartSize>('normal');

    const HorizontalBarLabel = (props: any) => {
        const { y, width, payload } = props;
        
        if (!payload || !payload.category) {
            return null;
        }

        const isDark = theme === 'dark';
        const iconColor = isDark ? '#F8F9FA' : '#0F2557';

        if (width < 30) {
            return null;
        }

        return (
            <g transform={`translate(${width - 25}, ${y + 2})`}>
               <foreignObject width="20" height="20" color={iconColor}>
                    {getCategoryIcon(payload.category)}
               </foreignObject>
            </g>
        );
    };

    const handleMouseMove = (state: any) => {
        if (state.isTooltipActive && state.activePayload && state.activePayload.length > 0) {
            const id = state.activePayload[0].payload.id;
            if (hoveredProductId !== id) {
                setHoveredProductId(id);
            }
        }
    };

    const handleMouseLeave = () => {
        setHoveredProductId(null);
    };

    const revenueByCategory = useMemo(() => {
        const categoryMap = new Map<string, number>();
        allProducts.forEach(p => {
            if (p.category && p.weeklyRevenue) {
                const categoryName = p.category;
                const currentRevenue = categoryMap.get(categoryName) || 0;
                categoryMap.set(categoryName, currentRevenue + p.weeklyRevenue);
            }
        });
         if (categoryMap.size === 0) return [];
        return Array.from(categoryMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [allProducts]);
    
    const marginByCategory = useMemo(() => {
        const categoryMap = new Map<string, { totalMargin: number; count: number }>();
        allProducts.forEach(p => {
            if (p.category) {
                const categoryName = p.category;
                const current = categoryMap.get(categoryName) || { totalMargin: 0, count: 0 };
                categoryMap.set(categoryName, {
                    totalMargin: current.totalMargin + p.margin,
                    count: current.count + 1,
                });
            }
        });
        if (categoryMap.size === 0) return [];
        return Array.from(categoryMap, ([name, data]) => ({
            name,
            value: data.totalMargin / data.count,
        })).sort((a, b) => b.value - a.value);
    }, [allProducts]);
    
    const totalRevenue = useMemo(() => revenueByCategory.reduce((sum, cat) => sum + cat.value, 0), [revenueByCategory]);


    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
    const COLORS = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

    const currencyFormatter = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const percentFormatter = (value: number) => `${value.toFixed(1)}%`;

    const filterBadge = selectedCategory ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-gray-200">
            Filter: {selectedCategory}
            <button
                onClick={() => onCategorySelect(null)}
                className="flex-shrink-0 ml-1.5 p-0.5 rounded-full inline-flex items-center justify-center text-brand-primary/50 hover:text-brand-primary hover:bg-brand-primary/20 focus:outline-none focus:bg-brand-primary/20 focus:text-brand-primary"
                aria-label={`Remove ${selectedCategory} filter`}
            >
                <XCircleIcon />
            </button>
        </span>
    ) : null;
    
    const actions = (
        <button
            onClick={() => setChartSize(prev => prev === 'normal' ? 'large' : 'normal')}
            className="p-2 rounded-full text-brand-text-secondary dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-colors"
            aria-label={chartSize === 'normal' ? 'Enlarge charts' : 'Shrink charts'}
        >
            {chartSize === 'normal' ? <ArrowsPointingOutIcon /> : <ArrowsPointingInIcon />}
        </button>
    );

    const renderWeeklyProfitChart = () => {
        const commonProps = {
            margin: { top: 15, right: 30, left: 20, bottom: 5 },
            onMouseMove: handleMouseMove,
            onMouseLeave: handleMouseLeave
        };

        const commonTooltip = <Tooltip
            content={<CustomTooltip theme={theme} formatter={currencyFormatter} extraField="margin" extraFieldFormatter={percentFormatter}/>}
            cursor={{ fill: 'rgba(15, 37, 87, 0.05)' }}
        />;
        
        const showXAxisLabels = products.length <= 15;

        switch (chartType) {
            case 'line':
                return (
                     <ComposedChart data={products} {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="name" tick={showXAxisLabels ? { fill: tickColor, fontSize: 12 } : false} angle={-25} textAnchor="end" height={showXAxisLabels ? 70 : 20} interval={0}/>
                        <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: tickColor, fontSize: 12 }} />
                        {commonTooltip}
                        <Line type="monotone" dataKey="weeklyProfit" name="Weekly Profit" stroke={theme === 'dark' ? COLORS_DARK[0] : COLORS_LIGHT[0]} strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={500} animationEasing="ease-in-out" />
                        <Scatter dataKey="weeklyProfit" name="Weekly Profit" isAnimationActive={true} animationDuration={500} animationEasing="ease-in-out" />
                    </ComposedChart>
                );
            case 'scatter':
                return (
                    <ScatterChart data={products} {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis type="category" dataKey="name" name="Product" tick={showXAxisLabels ? { fill: tickColor, fontSize: 12 } : false} angle={-25} textAnchor="end" height={showXAxisLabels ? 70 : 20} interval={0}/>
                        <YAxis type="number" dataKey="weeklyProfit" name="Weekly Profit" tickFormatter={(value) => `$${value}`} tick={{ fill: tickColor, fontSize: 12 }} />
                        {commonTooltip}
                        <Scatter name="Weekly Profit" dataKey="weeklyProfit" isAnimationActive={true} animationDuration={500} animationEasing="ease-in-out" fill={theme === 'dark' ? COLORS_DARK[0] : COLORS_LIGHT[0]}/>
                    </ScatterChart>
                );
            case 'bar':
            default:
                const barHeight = 40; 
                const chartHeight = Math.max(350, products.length * barHeight);
                return (
                     <ResponsiveContainer width="100%" height={chartHeight}>
                        <BarChart
                            layout="vertical"
                            data={products}
                            {...commonProps}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                            <XAxis type="number" tickFormatter={(value) => `$${value}`} tick={{ fill: tickColor, fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fill: tickColor, fontSize: 12 }} interval={0} />
                            {commonTooltip}
                            <Bar dataKey="weeklyProfit" name="Weekly Profit" barSize={25} isAnimationActive={true} animationDuration={500} animationEasing="ease-in-out">
                                {products.map((entry, index) => (
                                    <Cell key={`cell-${entry.id}`} fill={entry.id === hoveredProductId ? (theme === 'dark' ? '#FF6B6B' : '#0A1A3A') : COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
        }
    };
    
    return (
        <Card title="Visual Reports" icon={<PresentationChartLineIcon />} badge={filterBadge} actions={actions}>
            <div className="p-6 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <div className="flex items-center justify-center space-x-4 mb-4">
                             <h3 className="text-lg font-semibold font-display text-brand-primary dark:text-gray-300">Weekly Profit by Product</h3>
                             <div className="flex items-center space-x-1 bg-gray-200/50 dark:bg-gray-900/50 p-1 rounded-lg">
                                 <ChartTypeToggle icon={<ChartBarIcon className="w-5 h-5"/>} type="bar" activeType={chartType} setType={setChartType} />
                                 <ChartTypeToggle icon={<LineChartIcon className="w-5 h-5"/>} type="line" activeType={chartType} setType={setChartType} />
                                 <ChartTypeToggle icon={<ScatterChartIcon className="w-5 h-5"/>} type="scatter" activeType={chartType} setType={setChartType} />
                             </div>
                        </div>
                        <div 
                            className="transition-all duration-300 ease-in-out"
                            style={{ height: chartSize === 'normal' ? '350px' : '700px' }}
                        >
                            <div className="w-full h-full" style={chartType === 'bar' ? { overflowY: 'auto' } : {}}>
                                <div key={chartType} className="animate-fade-in-fast w-full h-full">
                                    {renderWeeklyProfitChart()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold font-display text-brand-primary dark:text-gray-300 mb-4 text-center">Profit Margin by Product</h3>
                        <div 
                            className="transition-all duration-300 ease-in-out"
                            style={{ height: chartSize === 'normal' ? '350px' : '700px' }}
                        >
                           <ResponsiveContainer width="100%" height="100%">
                               <ComposedChart
                                    data={products}
                                    margin={{ top: 15, right: 20, left: 20, bottom: 5 }}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                    <XAxis dataKey="name" tick={products.length <= 15 ? { fontSize: 12, fill: tickColor } : false} angle={-25} textAnchor="end" height={products.length <= 15 ? 70 : 20} interval={0} />
                                    <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: tickColor }} />
                                    <Tooltip
                                        content={<CustomTooltip theme={theme} unit="%" extraField="weeklyProfit" extraFieldFormatter={currencyFormatter} />}
                                        cursor={{ fill: 'rgba(78, 205, 196, 0.1)' }}
                                    />
                                    <Bar dataKey="margin" name="Margin" barSize={4} isAnimationActive={true} animationDuration={500} animationEasing="ease-in-out">
                                        {products.map((entry) => (
                                            <Cell key={`cell-${entry.id}`} fill={theme === 'dark' ? '#7B8DA8' : '#AAB7CD'} />
                                        ))}
                                    </Bar>
                                    <Scatter dataKey="margin" name="Margin" isAnimationActive={true} animationDuration={500} animationEasing="ease-in-out" fill="#4ECDC4" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>

            {(revenueByCategory.length > 0 || marginByCategory.length > 0) && (
                <div className="mt-6">
                    <div className="p-6 border-t border-gray-200/80 dark:border-gray-700/80">
                         <div className="flex items-center space-x-3 mb-6">
                            <span className="text-brand-primary dark:text-brand-accent-profit"><BriefcaseIcon /></span>
                            <h2 className="text-xl font-semibold font-display text-brand-primary dark:text-gray-200">Category Analysis</h2>
                        </div>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {revenueByCategory.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold font-display text-brand-primary dark:text-gray-300 mb-4 text-center">Revenue by Category</h3>
                                    <div className="relative h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                                                <Pie 
                                                    data={revenueByCategory} 
                                                    dataKey="value" 
                                                    nameKey="name" 
                                                    cx="50%" 
                                                    cy="50%" 
                                                    outerRadius={100} 
                                                    innerRadius={60}
                                                    paddingAngle={2}
                                                    fill="#8884d8" 
                                                    isAnimationActive={true}
                                                    animationDuration={500}
                                                    animationEasing="ease-in-out"
                                                    onClick={(data) => onCategorySelect(data.name)}
                                                >
                                                    {revenueByCategory.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={currencyFormatter} content={<CustomTooltip theme={theme}/>} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-sm text-brand-text-secondary dark:text-gray-400">Total Revenue</span>
                                            <span className="text-2xl font-bold font-display text-brand-primary dark:text-white">{currencyFormatter(totalRevenue)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                             {marginByCategory.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold font-display text-brand-primary dark:text-gray-300 mb-4 text-center">Average Margin by Category</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            layout="vertical"
                                            data={marginByCategory}
                                            margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                                            <XAxis type="number" tickFormatter={(value) => `${value.toFixed(0)}%`} tick={{ fill: tickColor, fontSize: 12 }} />
                                            <YAxis type="category" dataKey="name" width={80} tick={{ fill: tickColor, fontSize: 12 }} />
                                            <Tooltip
                                                formatter={percentFormatter}
                                                content={<CustomTooltip theme={theme} />}
                                                cursor={false}
                                            />
                                            <Bar dataKey="value" name="Avg. Margin" barSize={25} onClick={(data) => onCategorySelect(data.name)} isAnimationActive={true} animationDuration={500} animationEasing="ease-in-out">
                                                {marginByCategory.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

const ChartTypeToggle: React.FC<{
    icon: React.ReactNode;
    type: ChartType;
    activeType: ChartType;
    setType: (type: ChartType) => void;
}> = ({ icon, type, activeType, setType }) => {
    const isActive = type === activeType;
    return (
        <button
            onClick={() => setType(type)}
            className={`p-1.5 rounded-md transition-colors ${
                isActive
                    ? 'bg-brand-primary text-white shadow'
                    : 'text-brand-text-secondary dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60'
            }`}
            aria-label={`Switch to ${type} chart`}
        >
            {icon}
        </button>
    );
};

export default ProfitabilityCharts;