import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface KPICardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    description?: string;
    trendData?: number[];
    tooltipFormatter?: (value: number) => string;
    positive?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, description, trendData, tooltipFormatter, positive }) => {
    // Determine status based on explicit 'positive' prop if provided, otherwise check trend direction
    let isPositiveState = true;
    if (positive !== undefined) {
        isPositiveState = positive;
    } else if (trendData && trendData.length > 1) {
        isPositiveState = trendData[trendData.length - 1] >= trendData[0];
    }

    const trendColor = isPositiveState ? '#10B981' : '#EF4444'; // Emerald or Red
    const uniqueId = `trendGradient-${title.replace(/\s/g, '')}`;

    return (
        <div className={`glass-effect rounded-3xl p-6 flex flex-col justify-between h-full shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group border border-white/50 dark:border-gray-700/50 ${!isPositiveState ? 'dark:border-red-900/30 ring-1 ring-red-50 dark:ring-red-900/10' : ''}`}>
            <div className="flex items-start justify-between z-10 relative">
                <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wide">{title}</p>
                    <h3 className={`text-3xl font-extrabold font-display tracking-tight ${!isPositiveState ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {value}
                    </h3>
                </div>
                <div className={`p-3 rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-110 transition-transform duration-300 ${isPositiveState ? 'bg-white dark:bg-gray-800 text-brand-primary dark:text-blue-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'}`}>
                    {icon}
                </div>
            </div>
            
            <div className="mt-6 flex items-end justify-between z-10 relative">
                 {description && <p className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{description}</p>}
            </div>

            {/* Background Chart */}
            <div className="absolute bottom-0 left-0 right-0 h-28 opacity-10 dark:opacity-20 pointer-events-none group-hover:opacity-20 transition-opacity duration-500 mix-blend-multiply dark:mix-blend-normal">
                {trendData && trendData.length > 1 && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData.map(v => ({ value: v }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                             <defs>
                                <linearGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={trendColor} stopOpacity={0.6}/>
                                    <stop offset="100%" stopColor={trendColor} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={trendColor}
                                strokeWidth={3}
                                fill={`url(#${uniqueId})`}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default KPICard;