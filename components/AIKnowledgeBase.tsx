

import React, { useState, useMemo } from 'react';
import { AIInsight } from '../types';
import Card from './shared/Card';
import InsightVisualization from './shared/InsightVisualization';
import { BookOpenIcon, LightBulbIcon, CalculatorIcon, XIcon, SearchIcon, PresentationChartLineIcon } from './Icons';
import { formatDistanceToNow } from 'date-fns';

interface AIKnowledgeBaseProps {
    insights: AIInsight[];
    onDismissInsight: (id: number) => void;
    theme: string;
}

const parseMarkdownToHTML = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-brand-primary dark:text-white">$1</strong>')
        .replace(/^\s*[\-\*]\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/\n/g, '<br />')
        .replace(/<\/li><br \/>/g, '</li>')
        .replace(/<br \/><ul>/g, '<ul>')
        .replace(/<\/ul><br \/>/g, '</ul>');
};

const InsightCard: React.FC<{ insight: AIInsight; onDismiss: (id: number) => void; theme: string; }> = ({ insight, onDismiss, theme }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showChart, setShowChart] = useState(false);

    const InsightIcon = insight.type === 'General Insight' ? LightBulbIcon : CalculatorIcon;
    const bgColor = insight.type === 'General Insight' ? 'bg-blue-50 dark:bg-blue-500/10' : 'bg-teal-50 dark:bg-teal-500/10';
    const borderColor = insight.type === 'General Insight' ? 'border-blue-200 dark:border-blue-500/30' : 'border-teal-200 dark:border-teal-500/30';

    return (
        <div className={`rounded-lg border ${borderColor} ${bgColor} transition-shadow hover:shadow-md`}>
            <div className="p-4 flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <InsightIcon />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-brand-primary dark:text-gray-200 truncate">{insight.title}</p>
                            <p className="text-xs text-brand-text-secondary dark:text-gray-400">
                                {formatDistanceToNow(new Date(insight.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                        <button 
                            onClick={() => onDismiss(insight.id)} 
                            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            aria-label="Dismiss insight"
                        >
                            <XIcon />
                        </button>
                    </div>
                    <div className={`mt-2 prose prose-sm max-w-none text-brand-text-secondary dark:text-gray-300 ${!isExpanded ? 'line-clamp-2' : ''}`}
                        dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(insight.content) }}
                    />
                     <div className="flex items-center space-x-4">
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm font-bold text-brand-primary hover:underline mt-2">
                            {isExpanded ? 'Show Less' : 'Show More'}
                        </button>
                        {insight.visualization && (
                             <button onClick={() => setShowChart(!showChart)} className="text-sm font-bold text-brand-primary hover:underline mt-2 flex items-center space-x-1">
                                 <PresentationChartLineIcon className="h-4 w-4" />
                                <span>{showChart ? 'Hide Chart' : 'Show Chart'}</span>
                            </button>
                        )}
                    </div>
                    {showChart && insight.visualization && (
                        <div className="mt-4">
                            <h4 className="text-md font-semibold font-display text-brand-primary dark:text-gray-300 mb-2 text-center">{insight.visualization.title}</h4>
                            <div className="h-64">
                                <InsightVisualization chart={insight.visualization} theme={theme} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const AIKnowledgeBase: React.FC<AIKnowledgeBaseProps> = ({ insights, onDismissInsight, theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'All' | 'General Insight' | 'Marketing Advice'>('All');

    const filteredInsights = useMemo(() => {
        return insights.filter(insight => {
            const filterMatch = filter === 'All' || insight.type === filter;
            const searchMatch = searchTerm === '' || 
                insight.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                insight.content.toLowerCase().includes(searchTerm.toLowerCase());
            return filterMatch && searchMatch;
        });
    }, [insights, searchTerm, filter]);

    return (
        <Card title="AI Knowledge Base" icon={<BookOpenIcon />}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                 <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search insights..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full bg-gray-100 dark:bg-gray-900 border-transparent rounded-lg py-2 pl-10 pr-4 text-brand-text-primary dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition"
                        />
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                        <FilterButton name="All" activeFilter={filter} setFilter={setFilter} />
                        <FilterButton name="General Insight" activeFilter={filter} setFilter={setFilter} />
                        <FilterButton name="Marketing Advice" activeFilter={filter} setFilter={setFilter} />
                    </div>
                </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                {filteredInsights.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {filteredInsights.map(insight => (
                            <InsightCard key={insight.id} insight={insight} onDismiss={onDismissInsight} theme={theme} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                         <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-primary/10 mb-5">
                            <BookOpenIcon />
                        </div>
                        <h3 className="text-lg font-display font-medium text-brand-primary dark:text-white">Your Knowledge Base is Empty</h3>
                        <p className="text-brand-text-secondary dark:text-gray-400 mt-2 max-w-sm mx-auto">
                           Use the "AI-Powered Insights" or "Marketing Simulator" tools to generate advice. It will be automatically saved here for you to review later.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};

const FilterButton: React.FC<{
    name: 'All' | 'General Insight' | 'Marketing Advice', 
    activeFilter: string, 
    setFilter: (filter: 'All' | 'General Insight' | 'Marketing Advice') => void 
}> = ({ name, activeFilter, setFilter }) => {
    const isActive = name === activeFilter;
    const displayName = name === 'General Insight' ? 'Insights' : name === 'Marketing Advice' ? 'Marketing' : 'All';
    return (
        <button
            onClick={() => setFilter(name)}
            className={`${
                isActive ? 'bg-white dark:bg-gray-800 shadow text-brand-primary dark:text-white' : 'text-brand-text-secondary dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
            } rounded-md px-3 py-1.5 text-xs font-bold font-display transition-all duration-200`}
        >
            {displayName}
        </button>
    );
};

export default AIKnowledgeBase;