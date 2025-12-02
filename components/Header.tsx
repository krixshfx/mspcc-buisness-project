import React, { useState, useEffect } from 'react';
import { MoonIcon, SunIcon, CogIcon, UserCircleIcon, SearchIcon, ClipboardListIcon } from './Icons';

interface HeaderProps {
    theme: string;
    toggleTheme: () => void;
    onCustomizeClick: () => void;
    onForecastClick: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    suggestions: string[];
    onSuggestionSelect: (suggestion: string) => void;
    searchContainerRef: React.RefObject<HTMLDivElement>;
}

const Header: React.FC<HeaderProps> = ({ 
    theme, 
    toggleTheme, 
    onCustomizeClick,
    onForecastClick,
    searchTerm, 
    onSearchChange, 
    suggestions, 
    onSuggestionSelect, 
    searchContainerRef 
}) => {
    const [activeIndex, setActiveIndex] = useState(-1);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setActiveIndex(-1);
    }, [suggestions]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        } else if (e.key === 'Enter') {
            if (activeIndex > -1) {
                e.preventDefault();
                onSuggestionSelect(suggestions[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            onSearchChange(''); 
        }
    };

    return (
        <header className={`sticky top-0 z-30 transition-all duration-500 ease-in-out ${scrolled ? 'bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-800/50 py-3' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
                {/* Left Side */}
                <div className="flex items-center space-x-3 group cursor-pointer">
                     <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-tr from-brand-primary to-blue-600 text-white shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                     </div>
                    <span className="text-2xl font-bold font-display text-gray-900 dark:text-white hidden sm:block tracking-tight group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">MSPCC<span className="text-brand-primary">.ai</span></span>
                </div>

                {/* Center Search */}
                <div className="flex-1 flex justify-center px-4 max-w-xl mx-auto">
                    <div ref={searchContainerRef} className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className="text-gray-400 group-focus-within:text-brand-primary transition-colors h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products, suppliers..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                            className="block w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all shadow-sm group-focus-within:shadow-lg group-focus-within:w-full"
                        />
                        {suggestions.length > 0 && (
                            <ul className="absolute mt-3 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden z-20 border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                                {suggestions.map((suggestion, index) => (
                                    <li 
                                        key={suggestion}
                                        className={`px-5 py-3.5 cursor-pointer text-sm font-medium transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0 ${
                                            index === activeIndex 
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-brand-primary dark:text-blue-300' 
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                        onClick={() => onSuggestionSelect(suggestion)}
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                 {/* Right Side */}
                 <div className="flex items-center space-x-2">
                     <HeaderButton onClick={onForecastClick} aria-label="Generate sales forecast" tooltip="Sales Forecast">
                        <ClipboardListIcon />
                    </HeaderButton>
                     <HeaderButton onClick={onCustomizeClick} aria-label="Customize dashboard layout" tooltip="Layout Settings">
                        <CogIcon />
                    </HeaderButton>
                    <HeaderButton onClick={toggleTheme} aria-label="Toggle theme" tooltip="Toggle Theme">
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </HeaderButton>
                    <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>
                     <HeaderButton onClick={() => {}} aria-label="User profile">
                        <UserCircleIcon />
                    </HeaderButton>
                 </div>
            </div>
        </header>
    );
};

const HeaderButton: React.FC<{onClick: () => void, "aria-label": string, children: React.ReactNode, tooltip?: string}> = ({ onClick, "aria-label": ariaLabel, children, tooltip }) => (
    <button
        onClick={onClick}
        title={tooltip}
        className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-primary dark:hover:text-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        aria-label={ariaLabel}
    >
        {children}
    </button>
);


export default Header;