import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, ComposedChart, Scatter, ScatterChart, Area, Line } from 'recharts';
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


const CustomTooltip = ({ active, payload, label, theme, formatter, unit = '', extraField, extraFieldFormatter }: any) => {
  const tooltipBg = theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)';
  const textColor = theme === 'dark' ? '#f3f4f6' : '#1e293b';
  const labelColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  if (active && payload && payload.length) {
    const data = payload[0];
    const extraData = data.payload[extraField];
    const formattedValue = formatter ? formatter(data.value) : `${data.value}${unit}`;
    const formattedExtra = extraFieldFormatter ? extraFieldFormatter(extraData) : extraData;

    return (
      <div style={{ backgroundColor: tooltipBg }} className="p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-md z-50">
        <p style={{ color: labelColor }} className="text-xs font-bold uppercase tracking-wider mb-2">{label || data.name}</p>
        <p style={{ color: textColor }} className="text-base font-sans">
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

const COLORS_LIGHT = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];
const COLORS_DARK = ['#60a5fa', '#34d399', '#fbbf24', '#818cf8', '#f472b6', '#a78bfa'];

const ProfitabilityCharts: React.FC<ProfitabilityChartsProps> = ({ products, allProducts, hoveredProductId, setHoveredProductId, theme, onCategorySelect, selectedCategory }) => {
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [chartSize, setChartSize] = useState<ChartSize>('normal');

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


    const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
    const COLORS = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

    const currencyFormatter = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const percentFormatter = (value: number) => `${value.toFixed(1)}%`;

    const filterBadge = selectedCategory ? (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-primary text-white shadow-sm ring-2 ring-white dark:ring-gray-800">
            {selectedCategory}
            <button
                onClick={() => onCategorySelect(null)}
                className="ml-2 hover:text-red-200 focus:outline-none"
                aria-label={`Remove ${selectedCategory} filter`}
            >
                <XCircleIcon />
            </button>
        </span>
    ) : null;
    
    const actions = (
        <button
            onClick={() => setChartSize(prev => prev === 'normal' ? 'large' : 'normal')}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
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
            cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
        />;
        
        const showXAxisLabels = products.length <= 15;

        // Container Height Logic
        const containerHeight = chartSize === 'normal' ? 380 : 680;

        switch (chartType) {
            case 'line':
                return (
                     <ResponsiveContainer width="100%" height={containerHeight}>
                         <ComposedChart data={products} {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="name" tick={showXAxisLabels ? { fill: tickColor, fontSize: 11 } : false} angle={-25} textAnchor="end" height={showXAxisLabels ? 70 : 20} interval={0} axisLine={false} tickLine={false}/>
                            <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                            {commonTooltip}
                            <defs>
                                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="weeklyProfit" fillOpacity={1} fill="url(#profitGradient)" stroke="none" />
                            <Line type="monotone" dataKey="weeklyProfit" name="Weekly Profit" stroke={COLORS[0]} strokeWidth={3} dot={{r: 4, fill: COLORS[0], strokeWidth: 2, stroke: theme === 'dark' ? '#0f172a' : '#fff'}} isAnimationActive={true} />
                        </ComposedChart>
                    </ResponsiveContainer>
                );
            case 'scatter':
                return (
                     <ResponsiveContainer width="100%" height={containerHeight}>
                        <ScatterChart data={products} {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis type="category" dataKey="name" name="Product" tick={showXAxisLabels ? { fill: tickColor, fontSize: 11 } : false} angle={-25} textAnchor="end" height={showXAxisLabels ? 70 : 20} interval={0} tickLine={false} axisLine={false}/>
                            <YAxis type="number" dataKey="weeklyProfit" name="Weekly Profit" tickFormatter={(value) => `$${value}`} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} />
                            {commonTooltip}
                            <Scatter name="Weekly Profit" dataKey="weeklyProfit" fill={COLORS[0]}/>
                        </ScatterChart>
                    </ResponsiveContainer>
                );
            case 'bar':
            default:
                // FIX for vertical stretching: 
                // We use a fixed height for each bar to ensure readability.
                // If the total height exceeds the container, the parent div will scroll.
                const barHeight = 40; 
                const chartContentHeight = Math.max(containerHeight, products.length * barHeight);

                return (
                    <div style={{ height: containerHeight, overflowY: 'auto', paddingRight: '10px' }} className="custom-scrollbar">
                         <ResponsiveContainer width="100%" height={chartContentHeight}>
                            <BarChart
                                layout="vertical"
                                data={products}
                                {...commonProps}
                                barCategoryGap="20%"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                                <XAxis type="number" tickFormatter={(value) => `$${value}`} tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} orientation="top" />
                                <YAxis type="category" dataKey="name" width={120} tick={{ fill: tickColor, fontSize: 11 }} interval={0} axisLine={false} tickLine={false} />
                                {commonTooltip}
                                <Bar dataKey="weeklyProfit" name="Weekly Profit" radius={[0, 4, 4, 0]}>
                                    {products.map((entry, index) => (
                                        <Cell key={`cell-${entry.id}`} fill={entry.id === hoveredProductId ? (theme === 'dark' ? '#ef4444' : '#1d4ed8') : COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );
        }
    };
    
    return (
        <Card title="Visual Reports" icon={<PresentationChartLineIcon />} badge={filterBadge} actions={actions}>
            <div className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Weekly Profit Chart */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                             <h3 className="text-lg font-bold font-display text-gray-800 dark:text-gray-200">Weekly Profit</h3>
                             <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner">
                                 <ChartTypeToggle icon={<ChartBarIcon className="w-4 h-4"/>} type="bar" activeType={chartType} setType={setChartType} />
                                 <ChartTypeToggle icon={<LineChartIcon className="w-4 h-4"/>} type="line" activeType={chartType} setType={setChartType} />
                                 <ChartTypeToggle icon={<ScatterChartIcon className="w-4 h-4"/>} type="scatter" activeType={chartType} setType={setChartType} />
                             </div>
                        </div>
                        <div 
                            className="transition-all duration-300 ease-in-out bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-2 overflow-hidden"
                            style={{ height: chartSize === 'normal' ? '400px' : '700px' }}
                        >
                             {renderWeeklyProfitChart()}
                        </div>
                    </div>

                    {/* Profit Margin Chart */}
                    <div>
                        <h3 className="text-lg font-bold font-display text-gray-800 dark:text-gray-200 mb-6">Profit Margin %</h3>
                        <div 
                            className="transition-all duration-300 ease-in-out bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4"
                            style={{ height: chartSize === 'normal' ? '400px' : '700px' }}
                        >
                           <ResponsiveContainer width="100%" height="100%">
                               <ComposedChart
                                    data={products}
                                    margin={{ top: 15, right: 20, left: 20, bottom: 5 }}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false}/>
                                    <XAxis dataKey="name" tick={products.length <= 15 ? { fontSize: 11, fill: tickColor } : false} angle={-25} textAnchor="end" height={products.length <= 15 ? 70 : 20} interval={0} axisLine={false} tickLine={false}/>
                                    <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false}/>
                                    <Tooltip
                                        content={<CustomTooltip theme={theme} unit="%" extraField="weeklyProfit" extraFieldFormatter={currencyFormatter} />}
                                        cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                    />
                                    <Bar dataKey="margin" name="Margin" barSize={8} radius={[4, 4, 0, 0]} fill={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                                    <Scatter dataKey="margin" name="Margin" fill={COLORS[1]} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {(revenueByCategory.length > 0 || marginByCategory.length > 0) && (
                <div className="mt-12 pt-10 border-t border-gray-100 dark:border-gray-800">
                     <div className="flex items-center space-x-3 mb-8">
                        <div className="p-2 rounded-xl bg-blue-50 text-brand-primary dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-100 dark:ring-blue-800">
                             <BriefcaseIcon />
                        </div>
                        <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">Category Deep Dive</h2>
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {revenueByCategory.length > 0 && (
                            <div className="bg-white/50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-700/50 p-6 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Revenue Distribution</h3>
                                <div className="relative h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                            <Pie 
                                                data={revenueByCategory} 
                                                dataKey="value" 
                                                nameKey="name" 
                                                cx="50%" 
                                                cy="50%" 
                                                outerRadius={110} 
                                                innerRadius={70}
                                                paddingAngle={3}
                                                cornerRadius={6}
                                                stroke="none"
                                                onClick={(data) => onCategorySelect(data.name)}
                                                cursor="pointer"
                                            >
                                                {revenueByCategory.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={currencyFormatter} content={<CustomTooltip theme={theme}/>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total Revenue</span>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{currencyFormatter(totalRevenue)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                         {marginByCategory.length > 0 && (
                            <div className="bg-white/50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-700/50 p-6 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Avg Margin by Category</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        layout="vertical"
                                        data={marginByCategory}
                                        margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                                        <XAxis type="number" tickFormatter={(value) => `${value.toFixed(0)}%`} tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false}/>
                                        <YAxis type="category" dataKey="name" width={80} tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            formatter={percentFormatter}
                                            content={<CustomTooltip theme={theme} />}
                                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                        />
                                        <Bar dataKey="value" name="Avg. Margin" barSize={24} radius={[0, 6, 6, 0]} onClick={(data) => onCategorySelect(data.name)} cursor="pointer">
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
            className={`p-2 rounded-lg transition-all duration-200 ${
                isActive
                    ? 'bg-white dark:bg-gray-700 text-brand-primary dark:text-white shadow-sm scale-105'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
            aria-label={`Switch to ${type} chart`}
        >
            {icon}
        </button>
    );
};

export default ProfitabilityCharts;