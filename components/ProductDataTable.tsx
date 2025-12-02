import React, { useMemo } from 'react';
import { CalculatedProduct } from '../types';
import { PencilIcon, TrashIcon } from './Icons';

interface ProductDataTableProps {
    products: CalculatedProduct[];
    removeProduct: (id: number) => void;
    editProduct: (product: CalculatedProduct) => void;
    hoveredProductId: number | null;
    setHoveredProductId: (id: number | null) => void;
}

const ProductDataTable: React.FC<ProductDataTableProps> = ({ products, removeProduct, editProduct, hoveredProductId, setHoveredProductId }) => {
    
    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const totals = useMemo(() => {
        return products.reduce((acc, p) => {
            acc.unitsSoldWeek += p.unitsSoldWeek;
            acc.weeklyProfit += p.weeklyProfit;
            return acc;
        }, { unitsSoldWeek: 0, weeklyProfit: 0 });
    }, [products]);

    const handleRemoveClick = (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            removeProduct(id);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead className="bg-gray-50/50 dark:bg-gray-900/30">
                    <tr>
                        <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                        <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost / Price</th>
                        <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Units/Week</th>
                        <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margin</th>
                        <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weekly Profit</th>
                        <th scope="col" className="relative px-6 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-transparent divide-y divide-gray-100 dark:divide-gray-800">
                    {products.map((product) => (
                        <tr 
                            key={product.id} 
                            className={`transition-colors duration-200 ${
                                product.id === hoveredProductId ? 'bg-blue-50/60 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                            }`}
                            onMouseEnter={() => setHoveredProductId(product.id)}
                            onMouseLeave={() => setHoveredProductId(null)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900 dark:text-white">{product.name}</div>
                                <div className="text-xs font-medium text-gray-400 dark:text-gray-500">{product.category} {product.supplier && `• ${product.supplier}`}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(product.sellingPrice)}</div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">Buy: {formatCurrency(product.purchasePrice)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-medium">{product.unitsSoldWeek}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-3 py-1 inline-flex text-xs leading-4 font-bold rounded-full ${
                                    product.margin >= 40 
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
                                        : product.margin >= 20 
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' 
                                            : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                                }`}>
                                    {product.margin.toFixed(1)}%
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">{formatCurrency(product.weeklyProfit)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{opacity: product.id === hoveredProductId ? 1 : 0.6}}>
                                    <button onClick={() => editProduct(product)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all" aria-label={`Edit ${product.name}`}>
                                      <PencilIcon className="w-4 h-4"/>
                                    </button>
                                    <button onClick={() => handleRemoveClick(product.id, product.name)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all" aria-label={`Delete ${product.name}`}>
                                      <TrashIcon/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
                 <tfoot className="bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800">
                    <tr>
                        <th scope="row" colSpan={2} className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                            Totals
                        </th>
                        <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">{totals.unitsSoldWeek}</td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4 text-sm font-extrabold text-brand-primary dark:text-white">{formatCurrency(totals.weeklyProfit)}</td>
                        <td className="px-6 py-4"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default ProductDataTable;