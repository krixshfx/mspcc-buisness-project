

export interface Product {
    id: number;
    name: string;
    purchasePrice: number;
    sellingPrice: number;
    unitsSoldWeek: number;
    category?: string;
    stockLevel?: number;
    supplier?: string;
}

export interface CalculatedProduct extends Product {
    margin: number;
    weeklyProfit: number;
    weeklyRevenue: number;
    inventoryTurnover: number;
    sellThroughRate: number;
}

export interface ForecastedProduct extends CalculatedProduct {
    forecastedSales: number;
    reorderSuggestion: string;
}

export interface ChartData {
  type: 'bar' | 'pie' | 'comparison';
  title: string;
  data: any[];
  config: {
    dataKeys: { name: string; color: string }[];
    xAxisKey?: string;
  };
}

export interface AIInsight {
  id: number;
  type: 'General Insight' | 'Marketing Advice';
  title:string;
  content: string;
  relatedProduct?: string;
  timestamp: string;
  visualization?: ChartData;
}


export interface ComplianceTask {
    task: string;
    details: string;
}

export type WidgetId = 'complianceChecklist' | 'profitabilityCharts' | 'geminiInsights' | 'marketingSimulator' | 'aiOverview' | 'goalTracker' | 'salesForecast' | 'aiKnowledgeBase' | 'dataInput';

export interface WidgetState {
    order: number;
    visible: boolean;
}

export type WidgetConfig = Record<WidgetId, WidgetState>;

export interface DetailedReportContent {
    reportTitle: string;
    reportDate: string;
    executiveSummary: {
        overview: string;
        keyMetrics: { label: string; value: string; status: 'Positive' | 'Neutral' | 'Negative' }[];
    };
    dataQuality: {
        summary: string;
        score: 'Excellent' | 'Good' | 'Fair' | 'Poor';
        checks: { metric: string; status: 'Pass' | 'Fail' | 'Warning'; details: string }[];
    };
    categoryAnalysis: {
        category: string;
        revenue: number;
        profit: number;
        margin: number;
        itemCount: number;
    }[];
    marketAnalysis: {
        topPerformers: string[];
        underPerformers: string[];
        opportunityGaps: string[];
    };
    strategicRecommendations: {
        title: string;
        description: string;
        priority: 'High' | 'Medium' | 'Low';
        impact: string;
    }[];
    conclusion: string;
}

export interface ReportData {
    reportContent: DetailedReportContent;
    metrics: {
        totalWeeklyProfit: number;
        totalWeeklyRevenue: number;
        topProductByProfit?: CalculatedProduct | null;
        averageMargin: number;
        profitTrend: number[];
    };
    products: CalculatedProduct[];
    aiInsights: AIInsight[];
}