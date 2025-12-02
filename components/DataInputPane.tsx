import React, { useState } from 'react';
import ProductInputForm from './ProductInputForm';
import DataExtractor from './DataExtractor';
import { Product, CalculatedProduct } from '../types';
import { PlusCircleIcon, GlobeAltIcon } from './Icons';
import Card from './shared/Card';

interface DataInputPaneProps {
    addProduct: (product: Omit<Product, 'id'>) => void;
    products: CalculatedProduct[];
    onLoadData: (data: { headers: string[], data: any[][] }) => Promise<number>;
}

type ActiveView = 'addProduct' | 'webExtractor';

const DataInputPane: React.FC<DataInputPaneProps> = ({ addProduct, products, onLoadData }) => {
    const [activeView, setActiveView] = useState<ActiveView>('addProduct');

    return (
        <Card title="Quick Actions" icon={<PlusCircleIcon />} noPadding={true}>
            <div className="px-6 pt-4 pb-0">
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900/60 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveView('addProduct')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
                            activeView === 'addProduct'
                                ? 'bg-white dark:bg-gray-800 text-brand-primary dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'
                        }`}
                    >
                        <PlusCircleIcon />
                        <span>Add Product</span>
                    </button>
                    <button
                        onClick={() => setActiveView('webExtractor')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
                            activeView === 'webExtractor'
                                ? 'bg-white dark:bg-gray-800 text-brand-primary dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'
                        }`}
                    >
                        <GlobeAltIcon />
                        <span>Web Extractor</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-transparent animate-fade-in-up">
                {activeView === 'addProduct' && <ProductInputForm addProduct={addProduct} />}
                {activeView === 'webExtractor' && <DataExtractor products={products} onLoadData={onLoadData} />}
            </div>
        </Card>
    );
};

export default DataInputPane;