import React, { useState, useMemo, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Product, CalculatedProduct, WidgetConfig, WidgetId, ForecastedProduct, AIInsight, ChartData } from './types';
import { initialProducts, DEFAULT_WIDGET_CONFIG } from './constants';
import { generateFullPdfReportContent, getSalesForecastAndSuggestions, getBusinessOverviewStream, parseUnstructuredData } from './services/geminiService';
import { generatePdfReport } from './services/reportGenerator';
import Header from './components/Header';
import ProductDataTable from './components/ProductDataTable';
import ProfitabilityCharts from './components/ProfitabilityCharts';
import GeminiInsights from './components/GeminiInsights';
import ComplianceChecklist from './components/ComplianceChecklist';
import MarketingSimulator from './components/MarketingSimulator';
import Card from './components/shared/Card';
import DataUpload from './components/DataUpload';
import EditProductModal from './components/EditProductModal';
import Footer from './components/Footer';
import CustomizeDashboardModal from './components/CustomizeDashboardModal';
import ExportDropdown from './components/ExportDropdown';
import Spinner from './components/shared/Spinner';
import AIOverview from './components/AIOverview';
import SalesForecastModal from './components/SalesForecastModal';
import SetGoalModal from './components/SetGoalModal';
import GoalTrackerCard from './components/GoalTrackerCard';
import AIKnowledgeBase from './components/AIKnowledgeBase';
import KPICard from './components/KPICard';
import DataInputPane from './components/DataInputPane';
import { ChartBarIcon, SparklesIcon, TrendingUpIcon, ChartTrendingUpIcon, TrophyIcon } from './components/Icons';


type Tab = 'dashboard' | 'ai_analysis';

/**
 * Performs a fuzzy search to check if a needle is a subsequence of the haystack.
 */
const fuzzySearch = (needle: string, haystack: string): boolean => {
    if (!needle) return true;
    if (!haystack) return false;

    const hlen = haystack.length;
    const nlen = needle.length;

    if (nlen > hlen) return false;
    if (nlen === hlen) return needle === haystack;

    outer: for (let i = 0, j = 0; i < nlen; i++) {
        const nch = needle[i];
        while (j < hlen) {
            if (haystack[j++] === nch) {
                continue outer;
            }
        }
        return false;
    }
    return true;
};

const App: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(() => {
        try {
            const savedProducts = localStorage.getItem('products');
            if (savedProducts) {
                const parsed = JSON.parse(savedProducts);
                return parsed.length > 0 ? parsed : initialProducts;
            }
        } catch (error) {
            console.error("Failed to parse products from localStorage", error);
        }
        return initialProducts;
    });
    
    const [profitGoal, setProfitGoal] = useState<number>(() => {
        try {
            const savedGoal = localStorage.getItem('profitGoal');
            return savedGoal ? parseFloat(savedGoal) : 1500;
        } catch {
            return 1500;
        }
    });

    const [aiKnowledge, setAiKnowledge] = useState<AIInsight[]>(() => {
        try {
            const saved = localStorage.getItem('aiKnowledge');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<CalculatedProduct | null>(null);
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
    const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
    const [forecastData, setForecastData] = useState<ForecastedProduct[]>([]);
    const [isSetGoalModalOpen, setIsSetGoalModalOpen] = useState(false);
    const [aiOverviewContent, setAiOverviewContent] = useState('');

    const searchContainerRef = useRef<HTMLDivElement>(null);

    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(() => {
         try {
            const savedConfig = localStorage.getItem('widgetConfig');
             if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                const mergedConfig: WidgetConfig = JSON.parse(JSON.stringify(DEFAULT_WIDGET_CONFIG)); // Deep copy

                for (const key in mergedConfig) {
                    const widgetId = key as WidgetId;
                    if (parsedConfig[widgetId]) {
                        mergedConfig[widgetId] = { ...mergedConfig[widgetId], ...parsedConfig[widgetId] };
                    }
                }
                return mergedConfig;
            }
        } catch (error) {
            console.error("Failed to parse widget config from localStorage", error);
        }
        return DEFAULT_WIDGET_CONFIG;
    });

     useEffect(() => {
        localStorage.setItem('products', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('profitGoal', profitGoal.toString());
    }, [profitGoal]);
    
     useEffect(() => {
        localStorage.setItem('aiKnowledge', JSON.stringify(aiKnowledge));
    }, [aiKnowledge]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('widgetConfig', JSON.stringify(widgetConfig));
    }, [widgetConfig]);

    // Effect to handle clicks outside the search suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const calculatedProducts: CalculatedProduct[] = useMemo(() => {
        return products.map(p => {
            const margin = p.sellingPrice > 0 ? ((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100 : 0;
            const weeklyProfit = (p.sellingPrice - p.purchasePrice) * p.unitsSoldWeek;
            const weeklyRevenue = p.sellingPrice * p.unitsSoldWeek;
            const inventoryTurnover = p.stockLevel && p.stockLevel > 0 ? p.unitsSoldWeek / p.stockLevel : 0;
            const unitsInStock = p.stockLevel || 0;
            const beginningInventory = p.unitsSoldWeek + unitsInStock;
            const sellThroughRate = beginningInventory > 0 ? (p.unitsSoldWeek / beginningInventory) * 100 : 0;
            
            return {
                ...p,
                margin,
                weeklyProfit,
                weeklyRevenue,
                inventoryTurnover,
                sellThroughRate,
            };
        });
    }, [products]);

    const filteredProducts = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
        const searchTokens = lowercasedSearchTerm.split(/\s+/).filter(Boolean);

        return calculatedProducts.filter(p => {
            const categoryMatch = selectedCategory ? p.category === selectedCategory : true;
            if (!categoryMatch) return false;

            if (searchTokens.length === 0) return true;

            const searchableText = [p.name, p.category, p.supplier].filter(Boolean).join(' ').toLowerCase();
            return searchTokens.every(token => fuzzySearch(token, searchableText));
        });
    }, [calculatedProducts, searchTerm, selectedCategory]);
    
    const dashboardMetrics = useMemo(() => {
        const source = filteredProducts;
        if (source.length === 0) {
            return { totalWeeklyProfit: 0, topProductByProfit: null, averageMargin: 0, totalWeeklyRevenue: 0, profitTrend: [], marginTrend: [] };
        }
        const totalWeeklyProfit = source.reduce((sum, p) => sum + p.weeklyProfit, 0);
        const totalWeeklyRevenue = source.reduce((sum, p) => sum + p.weeklyRevenue, 0);
        const averageMargin = source.reduce((sum, p) => sum + p.margin, 0) / source.length;
        const topProductByProfit = [...source].sort((a,b) => b.weeklyProfit - a.weeklyProfit)[0] || null;

        const generateTrend = (currentValue: number) => {
            if (currentValue === 0) return [0,0,0,0,0,0,0];
            const trend = [currentValue];
            for (let i = 0; i < 6; i++) {
                const fluctuation = (Math.random() - 0.45) * 0.15 * trend[0];
                trend.unshift(Math.max(0, trend[0] - fluctuation));
            }
            return trend;
        };

        const profitTrend = generateTrend(totalWeeklyProfit);
        const marginTrend = generateTrend(averageMargin);

        return { totalWeeklyProfit, topProductByProfit, averageMargin, totalWeeklyRevenue, profitTrend, marginTrend };
    }, [filteredProducts]);

     useEffect(() => {
        let isCancelled = false;

        const streamOverview = async () => {
            if (calculatedProducts.length === 0) {
                setAiOverviewContent("<p>Add some products to get started with AI analysis.</p>");
                return;
            }
            setAiOverviewContent('');
            try {
                const stream = await getBusinessOverviewStream(dashboardMetrics, calculatedProducts);
                for await (const chunk of stream) {
                    if (isCancelled) break;
                    setAiOverviewContent(prev => prev + chunk);
                }
            } catch (error) {
                console.error("AI Overview stream error:", error);
                if (!isCancelled) {
                    setAiOverviewContent("<p class='text-brand-accent-warning'>Could not load AI overview.</p>");
                }
            }
        };

        streamOverview();

        return () => {
            isCancelled = true;
        };
    }, [calculatedProducts, dashboardMetrics]);


    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const addProduct = (product: Omit<Product, 'id'>) => {
        setProducts(prev => [...prev, { ...product, id: Date.now() }]);
    };
    
    const loadProducts = (newProducts: Omit<Product, 'id'>[]) => {
        const productsWithIds = newProducts.map((p, index) => ({...p, id: Date.now() + index}));
        setProducts(productsWithIds);
    }

    const removeProduct = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const handleEditProduct = (product: CalculatedProduct) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setIsEditModalOpen(false);
        setEditingProduct(null);
    };
    
    const handleCategorySelect = (category: string | null) => {
        setSelectedCategory(category);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        if (term.trim()) {
            const matches = calculatedProducts
                .filter(p => p.name.toLowerCase().includes(term.toLowerCase()))
                .map(p => p.name)
                .filter(name => name.toLowerCase() !== term.toLowerCase())
                .slice(0, 5);
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionSelect = (suggestion: string) => {
        setSearchTerm(suggestion);
        setSuggestions([]);
    };

    const handleExportCsv = () => {
        if (filteredProducts.length === 0) {
            alert('No data to export.');
            return;
        }
        if (window.confirm('Are you sure you want to export the current view as a CSV file?')) {
            const dataToExport = filteredProducts.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category || '',
                supplier: p.supplier || '',
                purchasePrice: p.purchasePrice,
                sellingPrice: p.sellingPrice,
                unitsSoldWeek: p.unitsSoldWeek,
                stockLevel: p.stockLevel || 0,
                margin: parseFloat(p.margin.toFixed(2)),
                weeklyProfit: parseFloat(p.weeklyProfit.toFixed(2)),
                weeklyRevenue: parseFloat(p.weeklyRevenue.toFixed(2)),
                inventoryTurnover: parseFloat(p.inventoryTurnover.toFixed(2)),
                sellThroughRate: parseFloat(p.sellThroughRate.toFixed(2)),
            }));

            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `product_data_export_${new Date().toISOString().substring(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const handleExportPdf = async () => {
        if (filteredProducts.length === 0) {
            alert('No data to generate a report from.');
            return;
        }
        setIsGeneratingReport(true);
        try {
            const reportContent = await generateFullPdfReportContent(dashboardMetrics, filteredProducts);
            await generatePdfReport({
                reportContent,
                metrics: dashboardMetrics,
                products: filteredProducts,
                aiInsights: aiKnowledge,
            });
        } catch (error) {
            console.error("Failed to generate PDF report:", error);
            alert(`Sorry, there was an error creating the PDF report: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleGenerateForecast = async () => {
        setIsGeneratingForecast(true);
        setIsForecastModalOpen(true);
        setForecastData([]);
        try {
            const forecast = await getSalesForecastAndSuggestions(calculatedProducts);
            setForecastData(forecast);
        } catch (error) {
            console.error("Failed to generate forecast", error);
        } finally {
            setIsGeneratingForecast(false);
        }
    };
    
    const handleInsightGenerated = (question: string, content: string, visualization?: ChartData) => {
        const newInsight: AIInsight = {
            id: Date.now(),
            type: 'General Insight',
            title: `Insight for: "${question.substring(0, 40)}${question.length > 40 ? '...' : ''}"`,
            content,
            visualization,
            timestamp: new Date().toISOString(),
        };
        setAiKnowledge(prev => [newInsight, ...prev]);
    };

    const handleAdviceGenerated = (productName: string, content: string, visualization: ChartData) => {
        const newAdvice: AIInsight = {
            id: Date.now(),
            type: 'Marketing Advice',
            title: `Marketing Advice for ${productName}`,
            content,
            relatedProduct: productName,
            visualization,
            timestamp: new Date().toISOString(),
        };
        setAiKnowledge(prev => [newAdvice, ...prev]);
    };

    const handleDismissInsight = (id: number) => {
        setAiKnowledge(prev => prev.filter(item => item.id !== id));
    };

    const handleLoadExtractedData = async (extractedData: { headers: string[], data: any[][] }): Promise<number> => {
        const csvString = Papa.unparse({
            fields: extractedData.headers,
            data: extractedData.data
        });
        const newProducts = await parseUnstructuredData(csvString);
        if (!newProducts || newProducts.length === 0) {
            throw new Error("The extracted data does not contain recognizable product information (like 'name' and 'price'). Please extract data that can be mapped to your product list.");
        }
        loadProducts(newProducts);
        return newProducts.length;
    };
    
    const formatLargeNumber = (num: number): string => {
        if (num >= 10000000) return `$${(num / 10000000).toFixed(2)} Cr`;
        if (num >= 100000) return `$${(num / 100000).toFixed(2)} L`;
        return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const renderWidgets = (
        widgetComponents: Array<{ id: WidgetId; component: React.ReactNode }>
    ) => {
        return widgetComponents
            .filter((w) => widgetConfig[w.id]?.visible)
            .sort((a, b) => (widgetConfig[a.id]?.order || 0) - (widgetConfig[b.id]?.order || 0))
            .map((w) => <div key={w.id} className="animate-fade-in-up">{w.component}</div>);
    };

    const leftColumnWidgets = [
        { id: 'dataInput' as WidgetId, component: <DataInputPane addProduct={addProduct} products={calculatedProducts} onLoadData={handleLoadExtractedData} /> },
    ];

    const mainColumnWidgets = [
        { id: 'aiOverview' as WidgetId, component: <AIOverview content={aiOverviewContent} /> },
        { id: 'complianceChecklist' as WidgetId, component: <ComplianceChecklist /> },
    ];

    const dashboardTabWidgets = [
        { id: 'profitabilityCharts' as WidgetId, component: <ProfitabilityCharts products={filteredProducts} allProducts={calculatedProducts} theme={theme} hoveredProductId={hoveredProductId} setHoveredProductId={setHoveredProductId} onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory}/> },
    ];

    const aiAnalysisTabWidgets = [
        { id: 'geminiInsights' as WidgetId, component: <GeminiInsights products={calculatedProducts} onInsightGenerated={handleInsightGenerated} theme={theme}/> },
        { id: 'marketingSimulator' as WidgetId, component: <MarketingSimulator products={calculatedProducts} onAdviceGenerated={handleAdviceGenerated} theme={theme}/> },
        { id: 'aiKnowledgeBase' as WidgetId, component: <AIKnowledgeBase insights={aiKnowledge} onDismissInsight={handleDismissInsight} theme={theme} /> },
    ];

    return (
        <div className="min-h-screen font-sans bg-gradient-to-br from-brand-background to-gray-200 dark:from-brand-background-dark dark:to-gray-900">
            <Header 
                theme={theme} 
                toggleTheme={toggleTheme} 
                onCustomizeClick={() => setIsCustomizeModalOpen(true)}
                onForecastClick={handleGenerateForecast}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                suggestions={suggestions}
                onSuggestionSelect={handleSuggestionSelect}
                searchContainerRef={searchContainerRef}
            />
            <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl">

                 {/* KPI Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
                    <KPICard 
                        title="Total Weekly Profit" 
                        value={formatLargeNumber(dashboardMetrics.totalWeeklyProfit)}
                        icon={<ChartTrendingUpIcon />}
                        trendData={dashboardMetrics.profitTrend}
                        tooltipFormatter={(value) => `$${(value as number).toFixed(2)}`}
                        positive={dashboardMetrics.totalWeeklyProfit >= 0}
                    />
                    <GoalTrackerCard 
                        currentProfit={dashboardMetrics.totalWeeklyProfit}
                        profitGoal={profitGoal}
                        onSetGoal={() => setIsSetGoalModalOpen(true)}
                    />
                    <KPICard 
                        title="Average Margin" 
                        value={`${dashboardMetrics.averageMargin.toFixed(1)}%`}
                        icon={<TrendingUpIcon />}
                        trendData={dashboardMetrics.marginTrend}
                        tooltipFormatter={(value) => `${(value as number).toFixed(1)}%`}
                        positive={dashboardMetrics.averageMargin >= 0}
                    />
                    <KPICard 
                        title="Top Product" 
                        value={dashboardMetrics.topProductByProfit?.name || 'N/A'}
                        icon={<TrophyIcon />}
                        description={dashboardMetrics.topProductByProfit ? `${formatLargeNumber(dashboardMetrics.topProductByProfit.weeklyProfit)} profit` : 'No products found'}
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* Left Sidebar (Input & Tools) */}
                    <div className="xl:col-span-4 flex flex-col gap-6 order-2 xl:order-1">
                        {renderWidgets(leftColumnWidgets)}
                        <DataUpload loadProducts={loadProducts} />
                        {renderWidgets(mainColumnWidgets)}
                    </div>

                    {/* Main Content Area */}
                    <div className="xl:col-span-8 flex flex-col gap-6 order-1 xl:order-2">
                        {products.length > 0 ? (
                            <>
                                {/* Segmented Control Tab Navigation */}
                                <div className="flex justify-center xl:justify-start mb-2">
                                     <div className="bg-gray-200/50 dark:bg-gray-800/50 p-1.5 rounded-2xl inline-flex shadow-inner backdrop-blur-md">
                                        <button
                                            onClick={() => setActiveTab('dashboard')}
                                            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ease-out ${
                                                activeTab === 'dashboard' 
                                                ? 'bg-white dark:bg-brand-primary text-brand-primary dark:text-white shadow-md transform scale-105' 
                                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                            }`}
                                        >
                                            Dashboard
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('ai_analysis')}
                                            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ease-out ${
                                                activeTab === 'ai_analysis' 
                                                ? 'bg-white dark:bg-brand-primary text-brand-primary dark:text-white shadow-md transform scale-105' 
                                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                            }`}
                                        >
                                            AI Analysis
                                        </button>
                                    </div>
                                </div>

                                {activeTab === 'dashboard' && (
                                     <div className="flex flex-col gap-6 animate-fade-in-up">
                                        <Card 
                                            title="Product Inventory & Performance" 
                                            icon={<ChartBarIcon />}
                                            noPadding={true}
                                            actions={
                                                <ExportDropdown 
                                                    onExportCsv={handleExportCsv}
                                                    onExportPdf={handleExportPdf}
                                                />
                                            }
                                        >
                                            <ProductDataTable 
                                                products={filteredProducts} 
                                                removeProduct={removeProduct}
                                                editProduct={handleEditProduct}
                                                hoveredProductId={hoveredProductId}
                                                setHoveredProductId={setHoveredProductId}
                                            />
                                        </Card>
                                        <div>
                                            {renderWidgets(dashboardTabWidgets)}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'ai_analysis' && (
                                    <div className="flex flex-col gap-6 animate-fade-in-up">
                                        {renderWidgets(aiAnalysisTabWidgets)}
                                    </div>
                                )}
                            </>
                        ) : (
                             <Card title="Welcome to Your Dashboard!" icon={<SparklesIcon/>}>
                                <div className="p-12 text-center">
                                     <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-6 animate-pulse ring-4 ring-blue-100 dark:ring-blue-800/20">
                                        <SparklesIcon className="h-12 w-12 text-brand-primary" />
                                    </div>
                                    <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Your Dashboard is Ready</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-lg mx-auto text-lg leading-relaxed">
                                        Add your first product manually or upload a file using the tools on the left to unlock powerful AI insights and start optimizing your business.
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
            {isEditModalOpen && editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onSave={handleUpdateProduct}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
            {isCustomizeModalOpen && (
                <CustomizeDashboardModal
                    config={widgetConfig}
                    onSave={(newConfig) => {
                        setWidgetConfig(newConfig);
                        setIsCustomizeModalOpen(false);
                    }}
                    onClose={() => setIsCustomizeModalOpen(false)}
                />
            )}
             {isForecastModalOpen && (
                <SalesForecastModal
                    isOpen={isForecastModalOpen}
                    onClose={() => setIsForecastModalOpen(false)}
                    isLoading={isGeneratingForecast}
                    data={forecastData}
                />
            )}
            {isSetGoalModalOpen && (
                <SetGoalModal
                    currentGoal={profitGoal}
                    onSave={(newGoal) => {
                        setProfitGoal(newGoal);
                        setIsSetGoalModalOpen(false);
                    }}
                    onClose={() => setIsSetGoalModalOpen(false)}
                />
            )}
            {isGeneratingReport && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white animate-fade-in-up">
                    <div className="bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center">
                        <Spinner />
                        <h3 className="mt-6 text-2xl font-bold font-display">Generating Report...</h3>
                        <p className="text-gray-200 mt-2 text-center max-w-xs">Gemini AI is analyzing your data to create a comprehensive PDF.</p>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default App;