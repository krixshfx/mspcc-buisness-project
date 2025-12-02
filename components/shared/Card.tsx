import React from 'react';

interface CardProps {
    title: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    badge?: React.ReactNode;
    noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ title, icon, actions, children, className = '', badge, noPadding = false }) => {
    return (
        <div className={`glass-effect rounded-3xl shadow-sm flex flex-col transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/20 overflow-hidden ${className}`}>
            <div className={`px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0 bg-white/40 dark:bg-gray-800/40`}>
                <div className="flex items-center space-x-3 min-w-0">
                    {icon && (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-brand-primary dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                            {icon}
                        </div>
                    )}
                    <div className="flex items-center space-x-3 min-w-0">
                        <h2 className="text-lg font-bold font-display text-gray-800 dark:text-gray-100 truncate tracking-tight">{title}</h2>
                        {badge && <div>{badge}</div>}
                    </div>
                </div>
                {actions && <div className="flex-shrink-0 ml-4">{actions}</div>}
            </div>
            <div className={`flex-grow ${noPadding ? '' : 'p-6'}`}>
                {children}
            </div>
        </div>
    );
};

export default Card;