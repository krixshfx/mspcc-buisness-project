

import React, { useState } from 'react';
import Papa from 'papaparse';
import { CalculatedProduct } from '../types';
import { extractWebData } from '../services/geminiService';
import Button from './Button';
import Spinner from './shared/Spinner';
import { DocumentArrowDownIcon, CheckCircleIcon } from './Icons';

interface DataExtractorProps {
    products: CalculatedProduct[];
    onLoadData: (data: { headers: string[], data: any[][] }) => Promise<number>;
}

const ShimmerLoader: React.FC = () => (
    <div className="space-y-3 p-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-shimmer"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/4 animate-shimmer"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-shimmer"></div>
            </div>
        ))}
    </div>
);

const DataExtractor: React.FC<DataExtractorProps> = ({ products, onLoadData }) => {
    const [query, setQuery] = useState("Latest prices for 'Gourmet Coffee' from starbucks.com");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [extractedData, setExtractedData] = useState<{ headers: string[], data: any[][] } | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [processError, setProcessError] = useState('');
    const [processSuccess, setProcessSuccess] = useState('');

    const handleExtractData = async () => {
        if (!query) {
            setError('Please enter a query for the data you want to extract.');
            return;
        }
        setIsLoading(true);
        setError('');
        setExtractedData(null);
        setProcessError('');
        setProcessSuccess('');
        try {
            const result = await extractWebData(products, query);
            if (!result || result.data.length === 0) {
                setError("AI couldn't find any matching data for your query.");
            } else {
                setExtractedData(result);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProcessData = async () => {
        if (!extractedData) return;
        setIsProcessing(true);
        setProcessError('');
        setProcessSuccess('');
        try {
            const productCount = await onLoadData(extractedData);
            setProcessSuccess(`${productCount} products were successfully processed and loaded!`);
        } catch (e: any) {
            setProcessError(e.message || 'An unknown error occurred while processing the data.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadCsv = () => {
        if (!extractedData) return;
        const csv = Papa.unparse({
            fields: extractedData.headers,
            data: extractedData.data
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        const fileName = query.substring(0, 20).replace(/\s/g, '_');
        link.setAttribute('download', `web_extract_${fileName}_${new Date().toISOString().substring(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="ai-data-query" className="block text-sm font-medium text-brand-text-secondary dark:text-gray-300 mb-2">
                        Describe the data you want to find:
                    </label>
                    <textarea
                        id="ai-data-query"
                        rows={2}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary dark:bg-gray-900/50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., Get current pricing for 'Organic Milk' from CompetitorA.com or Find customer reviews for 'Gourmet Coffee' from ReviewSite.com"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-semibold">Disclaimer: AI extracts and synthesizes publicly available web data. Always verify critical information from the provided sources.</p>
                </div>
                <Button onClick={handleExtractData} disabled={isLoading || products.length === 0} fullWidth>
                    {isLoading ? <Spinner /> : 'Extract Data from Web'}
                </Button>
                {error && <div className="p-3 bg-brand-accent-warning/10 text-brand-accent-warning rounded-md text-sm font-medium">{error}</div>}
            </div>

            {(isLoading || extractedData) && (
                 <div className="border-t border-gray-200 dark:border-gray-700">
                    {isLoading ? (
                        <ShimmerLoader />
                    ) : extractedData && (
                        <div>
                            <div className="p-4 flex flex-wrap justify-between items-center gap-2">
                                <h4 className="font-semibold text-brand-primary dark:text-gray-200">Extraction Results</h4>
                                 <div className="flex items-center space-x-2">
                                     <Button onClick={handleDownloadCsv} variant="secondary" className="!py-1 !px-3 !text-xs !font-semibold">
                                        <DocumentArrowDownIcon/>
                                        <span className="ml-2">Download CSV</span>
                                    </Button>
                                    <Button onClick={handleProcessData} disabled={isProcessing}>
                                        {isProcessing ? <Spinner /> : 'Process and Load Data'}
                                    </Button>
                                 </div>
                            </div>
                            {processError && <div className="p-3 mx-4 mb-2 bg-brand-accent-warning/10 text-brand-accent-warning rounded-md text-sm font-medium">{processError}</div>}
                            {processSuccess && <div className="p-3 mx-4 mb-2 flex items-center space-x-2 bg-brand-accent-profit/10 text-brand-accent-profit rounded-md text-sm font-medium"><CheckCircleIcon /> <span>{processSuccess}</span></div>}
                            <div className="overflow-x-auto max-h-80">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                                        <tr>
                                            {extractedData.headers.map((header, index) => (
                                                <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-text-secondary dark:text-gray-400 uppercase tracking-wider">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {extractedData.data.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-gray-300">{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};

export default DataExtractor;