

import { Product, WidgetConfig } from './types';

export const initialProducts: Product[] = [
    { id: 1, name: 'Organic Milk', purchasePrice: 2.50, sellingPrice: 4.50, unitsSoldWeek: 100, category: 'Dairy', stockLevel: 50, supplier: 'Farm Fresh Inc.' },
    { id: 2, name: 'Artisan Bread', purchasePrice: 1.80, sellingPrice: 3.99, unitsSoldWeek: 80, category: 'Bakery', stockLevel: 40, supplier: 'Local Breads Co.' },
    { id: 3, name: 'Gourmet Coffee', purchasePrice: 8.00, sellingPrice: 15.00, unitsSoldWeek: 50, category: 'Pantry', stockLevel: 60, supplier: 'Global Beans' },
    { id: 4, name: 'Imported Cheese', purchasePrice: 5.50, sellingPrice: 9.75, unitsSoldWeek: 40, category: 'Dairy', stockLevel: 25, supplier: 'Cheese Masters' },
    { id: 5, name: 'Craft Soda', purchasePrice: 1.00, sellingPrice: 2.25, unitsSoldWeek: 150, category: 'Drinks', stockLevel: 120, supplier: 'Fizz Pop Beverages' },
    { id: 6, name: 'Hass Avocados', purchasePrice: 0.90, sellingPrice: 1.99, unitsSoldWeek: 200, category: 'Produce', stockLevel: 150, supplier: 'Green Valley Farms' },
    { id: 7, name: 'Organic Chicken Breast', purchasePrice: 6.50, sellingPrice: 11.99, unitsSoldWeek: 60, category: 'Meat', stockLevel: 30, supplier: 'Ethical Meats Co.' },
    { id: 8, name: 'Ginger Kombucha', purchasePrice: 2.00, sellingPrice: 4.25, unitsSoldWeek: 90, category: 'Drinks', stockLevel: 70, supplier: 'Healthy Brews' },
    { id: 9, name: 'Sourdough Loaf', purchasePrice: 2.50, sellingPrice: 5.50, unitsSoldWeek: 75, category: 'Bakery', stockLevel: 35, supplier: 'Local Breads Co.' },
    { id: 10, name: 'Greek Yogurt 500g', purchasePrice: 3.00, sellingPrice: 5.49, unitsSoldWeek: 110, category: 'Dairy', stockLevel: 80, supplier: 'Farm Fresh Inc.' },
    { id: 11, name: 'Organic Quinoa', purchasePrice: 4.00, sellingPrice: 7.99, unitsSoldWeek: 45, category: 'Pantry', stockLevel: 55, supplier: 'Global Beans' },
    { id: 12, name: 'Margherita Frozen Pizza', purchasePrice: 3.50, sellingPrice: 6.99, unitsSoldWeek: 85, category: 'Frozen', stockLevel: 100, supplier: 'Quick Meals LLC' },
    { id: 13, name: 'Cabernet Sauvignon', purchasePrice: 12.00, sellingPrice: 22.50, unitsSoldWeek: 30, category: 'Alcohol', stockLevel: 40, supplier: 'Vintage Estates' },
    { id: 14, name: 'Extra Virgin Olive Oil', purchasePrice: 7.00, sellingPrice: 13.50, unitsSoldWeek: 55, category: 'Pantry', stockLevel: 65, supplier: 'Mediterranean Gold' },
    { id: 15, name: 'Dark Chocolate 70%', purchasePrice: 1.50, sellingPrice: 3.49, unitsSoldWeek: 120, category: 'Snacks', stockLevel: 100, supplier: 'Sweet Treats Inc.' },
    { id: 16, name: 'Unsweetened Almond Milk', purchasePrice: 2.20, sellingPrice: 3.99, unitsSoldWeek: 95, category: 'Dairy', stockLevel: 70, supplier: 'Nutty Beverages' },
    { id: 17, name: 'Fresh Fettuccine', purchasePrice: 3.00, sellingPrice: 5.99, unitsSoldWeek: 50, category: 'Deli', stockLevel: 20, supplier: 'Pasta Masters' },
    { id: 18, name: 'Cage-Free Organic Eggs', purchasePrice: 3.50, sellingPrice: 5.99, unitsSoldWeek: 130, category: 'Dairy', stockLevel: 90, supplier: 'Happy Hen Farms' },
    { id: 19, name: 'Wildflower Local Honey', purchasePrice: 6.00, sellingPrice: 11.25, unitsSoldWeek: 40, category: 'Pantry', stockLevel: 50, supplier: 'Local B Hive' },
    { id: 20, name: 'Plant-Based Burger Patties', purchasePrice: 4.50, sellingPrice: 8.49, unitsSoldWeek: 65, category: 'Frozen', stockLevel: 75, supplier: 'Green Cuisine' }
];

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
    aiOverview: { order: 1, visible: true },
    complianceChecklist: { order: 2, visible: true },
    salesForecast: { order: 3, visible: true }, // Not a visual widget, but good to have in config
    profitabilityCharts: { order: 1, visible: true },
    geminiInsights: { order: 1, visible: true },
    marketingSimulator: { order: 2, visible: true },
    aiKnowledgeBase: { order: 3, visible: true },
    dataInput: { order: 1, visible: true },
    goalTracker: { order: 1, visible: true },
};
