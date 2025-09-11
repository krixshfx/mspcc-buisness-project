import React, { useState, useRef, useEffect } from 'react';
import ProductInputForm from './ProductInputForm';
import DataExtractor from './DataExtractor';
import { Product, CalculatedProduct } from '../types';
import { PlusCircleIcon, GlobeAltIcon, ChevronDownIcon } from './Icons';

interface DataInputPaneProps {
    addProduct: (product: Omit<Product, 'id'>) => void;
    products: CalculatedProduct[];
    onLoadData: (data: { headers: string[], data: any[][] }) => Promise<number>;
}

type ActiveView = 'addProduct' | 'webExtractor';

const viewConfig: Record<ActiveView, { title: string; icon: React.ReactNode }> = {
    addProduct: {
        title: 'Add New Product',
        icon: <PlusCircleIcon />,
    },
    webExtractor: {
        title: 'Web Data Extractor',
        icon: <GlobeAltIcon />,
    },
};

const DataInputPane: React.FC<DataInputPaneProps> = ({ addProduct, products, onLoadData }) => {
    const [activeView, setActiveView] = useState<ActiveView>('addProduct');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectView = (view: ActiveView) => {
        setActiveView(view);
        setIsDropdownOpen(false);
    };

    const headerContent = (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between text-left"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
            >
                <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-brand-primary dark:text-brand-accent-profit">{viewConfig[activeView].icon}</span>
                    <h2 className="text-lg font-bold font-display text-brand-primary dark:text-gray-200 truncate">{viewConfig[activeView].title}</h2>
                </div>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
                <div
                    className="origin-top-right absolute left-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="py-1" role="none">
                        <DropdownItem
                            icon={<PlusCircleIcon />}
                            text="Add New Product"
                            onClick={() => handleSelectView('addProduct')}
                            isActive={activeView === 'addProduct'}
                        />
                        <DropdownItem
                            icon={<GlobeAltIcon />}
                            text="Web Data Extractor"
                            onClick={() => handleSelectView('webExtractor')}
                            isActive={activeView === 'webExtractor'}
                        />
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg`}>
            <div className="p-5 border-b border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between">
                {headerContent}
            </div>
            <div>
                {activeView === 'addProduct' && <ProductInputForm addProduct={addProduct} />}
                {activeView === 'webExtractor' && <DataExtractor products={products} onLoadData={onLoadData} />}
            </div>
        </div>
    );
};

const DropdownItem: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void; isActive: boolean }> = ({ icon, text, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`w-full text-left flex items-center space-x-3 px-4 py-2 text-sm ${
            isActive
                ? 'font-bold text-brand-primary bg-gray-100 dark:bg-gray-700'
                : 'text-brand-text-primary dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        role="menuitem"
    >
        {icon}
        <span>{text}</span>
    </button>
);


export default DataInputPane;