import React from 'react';
import { TargetIcon, PencilIcon } from './Icons';

interface GoalTrackerCardProps {
    currentProfit: number;
    profitGoal: number;
    onSetGoal: () => void;
}

const GoalTrackerCard: React.FC<GoalTrackerCardProps> = ({ currentProfit, profitGoal, onSetGoal }) => {
    const progress = profitGoal > 0 ? Math.min((currentProfit / profitGoal) * 100, 100) : 0;
    const isGoalMet = progress >= 100;

    return (
        <div className="glass-effect rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full group border border-white/50 dark:border-gray-700/50">
            <div className="flex justify-between items-start mb-4 z-10 relative">
                 <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wide">Weekly Profit Goal</p>
                    <div className="flex items-baseline space-x-2">
                        <p className="text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight">
                            ${profitGoal.toLocaleString()}
                        </p>
                    </div>
                 </div>
                 <button onClick={onSetGoal} className="p-2 rounded-xl text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-brand-primary dark:hover:text-blue-300 transition-all shadow-sm opacity-0 group-hover:opacity-100" aria-label="Edit goal">
                     <PencilIcon className="w-4 h-4" />
                 </button>
            </div>
            
            <div className="w-full z-10 relative">
                <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wider">Progress</span>
                    <span className={isGoalMet ? 'text-emerald-500' : 'text-brand-primary dark:text-blue-400'}>
                        {progress.toFixed(0)}%
                    </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isGoalMet ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-blue-400 to-brand-primary'}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
             <div className="absolute top-[-15px] right-[-15px] opacity-[0.03] dark:opacity-[0.05] rotate-12 pointer-events-none transform scale-150 group-hover:scale-125 transition-transform duration-500">
                 <div className="text-brand-primary p-4"><TargetIcon /></div> 
             </div>
        </div>
    );
};

export default GoalTrackerCard;