import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface KPICardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    description?: string;
    trendData?: number[];
    tooltipFormatter?: (value: number) => string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, description, trendData, tooltipFormatter }) => {
    const isPositiveTrend = trendData && trendData.length > 1 ? trendData[trendData.length - 1] >= trendData[0] : true;
    const trendColor = isPositiveTrend ? '#4ECDC4' : '#FF6B6B';
    const uniqueId = `trendGradient-${title.replace(/\s/g, '')}`;

    return (
        <div className="bg-gradient-to-br from-white/80 to-gray-50/50 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-lg rounded-xl shadow-2xl p-5 flex items-center justify-between border border-white/30 dark:border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-brand-primary/20">
            <div className="flex items-center min-w-0">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-brand-primary text-white mr-4">
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-brand-text-secondary dark:text-gray-400 font-medium">{title}</p>
                    <p className="text-2xl font-bold font-display text-brand-primary dark:text-white truncate" title={value}>{value}</p>
                    {description && <p className="text-xs text-brand-text-secondary dark:text-gray-500 truncate">{description}</p>}
                </div>
            </div>
             <div className="w-28 h-12 flex-shrink-0 ml-4">
                {trendData && trendData.length > 1 && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData.map(v => ({ value: v }))} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                             <defs>
                                <linearGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={trendColor} stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor={trendColor} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip
                                formatter={(value: number) => [tooltipFormatter ? tooltipFormatter(value) : value, null]}
                                cursor={{ stroke: '#4B5563', strokeWidth: 1, strokeDasharray: '3 3' }}
                                labelStyle={{ display: 'none' }}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(4px)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    fontSize: '12px',
                                    padding: '4px 8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                itemStyle={{
                                    fontWeight: 'bold'
                                }}
                                wrapperClassName="dark:[&_.recharts-tooltip-wrapper]:!bg-gray-900/80 dark:[&_.recharts-tooltip-wrapper]:!border-gray-700 dark:[&_.recharts-tooltip-item]:!text-gray-100"
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={trendColor}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#${uniqueId})`}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 1, stroke: trendColor, fill: '#fff' }}
                                isAnimationActive={true}
                                animationDuration={500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default KPICard;