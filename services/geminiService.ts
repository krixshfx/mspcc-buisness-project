

import { GoogleGenAI, Type } from '@google/genai';
import { CalculatedProduct, ComplianceTask, Product, ForecastedProduct, ReportData, ChartData, DetailedReportContent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatProductDataForPrompt = (products: CalculatedProduct[]): string => {
    let dataStr = "ProductID, Name, Purchase Price, Selling Price, Units Sold/Week, Profit Margin (%), Weekly Profit ($), Category, Stock Level, Supplier\n";
    products.forEach(p => {
        dataStr += `${p.id}, ${p.name}, ${p.purchasePrice.toFixed(2)}, ${p.sellingPrice.toFixed(2)}, ${p.unitsSoldWeek}, ${p.margin.toFixed(1)}%, ${p.weeklyProfit.toFixed(2)}, ${p.category || 'N/A'}, ${p.stockLevel || 'N/A'}, ${p.supplier || 'N/A'}\n`;
    });
    return dataStr;
};

// Helper function to sanitize and validate numerical data from AI
const cleanAndValidateNumber = (input: any): number => {
    if (typeof input === 'number') {
        return input;
    }
    if (typeof input === 'string') {
        const cleaned = input.replace(/[$,\s]/g, '');
        const number = parseFloat(cleaned);
        return isNaN(number) ? 0 : number;
    }
    return 0;
};


export const getAiInsight = async (products: CalculatedProduct[], question: string): Promise<{ insight: string, visualization?: ChartData }> => {
    const dataStr = formatProductDataForPrompt(products);
    const prompt = `
        Act as a senior retail business analyst for a small store owner. Your goal is to provide clear, actionable insights and a helpful visualization to maximize profit.

        Based on the following product performance data:
        --- DATA ---
        ${dataStr}
        --- END DATA ---

        The store owner asks: "${question}"

        Please provide your response in a structured JSON format. Your response must follow the provided schema precisely.

        **Instructions for your response:**
        1.  **"insight"**: Your analysis, formatted as simple markdown text. Structure it with a **Key Takeaway** and **Actionable Recommendations**. Be concise and direct.
        2.  **"visualization"**: Create a simple and clear visualization that directly supports your analysis.
            -   **Identify the most important metric** to visualize based on the question (e.g., 'weeklyProfit', 'margin', 'unitsSoldWeek').
            -   **Structure the data** as an array of objects, where each object has a "name" (string label) and a "value" (the numerical metric).
            -   **Ensure all "value" properties are actual numbers**, not strings. Do not include currency symbols or commas.
            -   **Keep it focused**: For bar charts, select the top 5-7 most relevant items to keep the chart readable.
            -   **Configuration**:
                -   Set \`config.xAxisKey\` to "name".
                -   Set \`config.dataKeys\` to be an array with a single object: \`[{ "name": "value", "color": "#4ECDC4" }]\`.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
             config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        insight: {
                            type: Type.STRING,
                            description: "The textual insight formatted in simple markdown."
                        },
                        visualization: {
                            type: Type.OBJECT,
                            nullable: true,
                            description: "A visualization object to support the insight. Must be null if no relevant chart can be made.",
                            properties: {
                                type: { type: Type.STRING, enum: ['bar', 'pie'] },
                                title: { type: Type.STRING },
                                data: {
                                    type: Type.ARRAY,
                                    description: "Data for the chart. The 'value' property must be a NUMBER.",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: {
                                                type: Type.STRING,
                                                description: "The label for the data point (e.g., product name)."
                                            },
                                            value: {
                                                type: Type.NUMBER,
                                                description: "The numerical value for the data point."
                                            }
                                        },
                                        required: ["name", "value"]
                                    }
                                },
                                config: {
                                    type: Type.OBJECT,
                                    description: "Configuration for rendering the chart. For this schema, dataKeys should always contain one item with name: 'value'.",
                                    properties: {
                                        dataKeys: { 
                                            type: Type.ARRAY, 
                                            items: { 
                                                type: Type.OBJECT, 
                                                properties: { 
                                                    name: { type: Type.STRING, description: "Should be 'value'." }, 
                                                    color: { type: Type.STRING, description: "A hex color code." } 
                                                },
                                                required: ["name", "color"]
                                            }
                                        },
                                        xAxisKey: { type: Type.STRING, description: "Should be 'name'." }
                                    },
                                    required: ["dataKeys", "xAxisKey"]
                                }
                            },
                            required: ["type", "title", "data", "config"]
                        }
                    },
                    required: ["insight"]
                }
            }
        });
        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        
        // Data cleaning for visualization
        if (parsed.visualization && parsed.visualization.data) {
            parsed.visualization.data = parsed.visualization.data.map((item: any) => ({
                ...item,
                value: cleanAndValidateNumber(item.value)
            })).filter((item: any) => item.name); // Ensure items have a name
        }
        
        return {
            insight: parsed.insight,
            visualization: parsed.visualization
        };
    } catch (error) {
        console.error("Error fetching AI insight:", error);
        throw new Error("Failed to communicate with the Gemini API.");
    }
};


export const generateComplianceChecklist = async (location: string, businessType: string): Promise<ComplianceTask[]> => {
    const prompt = `
        Generate a general business compliance checklist for a small "${businessType}" located in "${location}".
        Do not provide legal advice, but a general checklist of common requirements.
        Focus on categories like licenses/permits, tax, employee relations, and health/safety specific to that business type.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        checklist: {
                            type: Type.ARRAY,
                            description: "List of compliance tasks.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    task: {
                                        type: Type.STRING,
                                        description: "The name of the compliance task.",
                                    },
                                    details: {
                                        type: Type.STRING,
                                        description: "A brief, one-sentence explanation of the task.",
                                    },
                                },
                                required: ["task", "details"]
                            },
                        },
                    },
                     required: ["checklist"]
                },
            },
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.checklist as ComplianceTask[];

    } catch (error) {
        console.error("Error generating compliance checklist:", error);
        throw new Error("Failed to generate checklist from the Gemini API.");
    }
};

export const getMarketingAdvice = async (
    product: Product,
    discount: number,
    lift: number,
    newPrice: number,
    simulatedProfit: number
): Promise<{ advice: string; visualization: ChartData; }> => {
    const originalProfit = (product.sellingPrice - product.purchasePrice) * product.unitsSoldWeek;
    const prompt = `
        Act as a marketing strategist for a small retail business.
        The owner is considering a promotion. Analyze the provided data and return a JSON object containing your advice and data for a comparison visualization.

        --- Promotion Data ---
        - Product: ${product.name}
        - Current Price: $${product.sellingPrice.toFixed(2)}
        - Current Weekly Units Sold: ${product.unitsSoldWeek}
        - Current Weekly Profit from this product: $${originalProfit.toFixed(2)}
        - Proposed Discount: ${discount}%
        - New Price: $${newPrice.toFixed(2)}
        - Estimated Weekly Sales Increase (Lift): ${lift}%
        - Simulated New Weekly Units: ${Math.round(product.unitsSoldWeek * (1 + lift/100))}
        - Simulated Weekly Profit: $${simulatedProfit.toFixed(2)}
        --- End Data ---

        Your JSON response must include:
        1. "advice": A brief, expert markdown-formatted text. Cover **Potential Pros**, **Potential Cons/Risks**, an **Alternative Idea**, and a final **Recommendation** ("Go" or "No-Go").
        2. "visualization": A 'comparison' bar chart object. The data should compare 'Original' vs 'Simulated' for these three metrics: 'Weekly Profit', 'Selling Price', and 'Units Sold'.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        advice: { type: Type.STRING },
                        visualization: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['comparison'] },
                                title: { type: Type.STRING },
                                data: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            metric: { type: Type.STRING },
                                            Original: { type: Type.NUMBER },
                                            Simulated: { type: Type.NUMBER },
                                        },
                                        required: ["metric", "Original", "Simulated"]
                                    }
                                },
                                config: {
                                    type: Type.OBJECT,
                                    properties: {
                                        dataKeys: { type: Type.ARRAY, items: { 
                                            type: Type.OBJECT, 
                                            properties: { name: { type: Type.STRING }, color: { type: Type.STRING } }
                                        }},
                                        xAxisKey: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    },
                    required: ["advice", "visualization"]
                }
            }
        });
        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);

        // Data cleaning for visualization
        if (parsed.visualization && parsed.visualization.data) {
             parsed.visualization.data = parsed.visualization.data.map((item: any) => ({
                ...item,
                Original: cleanAndValidateNumber(item.Original),
                Simulated: cleanAndValidateNumber(item.Simulated)
            }));
        }

        return {
            advice: parsed.advice,
            visualization: parsed.visualization,
        };
    } catch (error) {
        console.error("Error fetching marketing advice:", error);
        throw new Error("Failed to communicate with the Gemini API.");
    }
};

export const parseUnstructuredData = async (fileContent: string): Promise<Omit<Product, 'id'>[]> => {
    const prompt = `
        Act as an intelligent data extraction and sanitation engine. Your task is to analyze the following unstructured text data and convert it into a structured JSON array of products. This data may come from a file upload or a web data extraction.

        The data could be in CSV, JSON, TXT with different delimiters, or just copy-pasted text.
        Be smart about mapping column headers. For example:
        - 'Product Name', 'Item', 'title' should map to 'name' field.
        - 'Cost', 'Purchase Price', 'Buy Price', 'costPrice' should map to 'purchasePrice'.
        - 'Price', 'Selling Price', 'Retail Price', 'sellPrice' should map to 'sellingPrice'.
        - 'Units Sold', 'Weekly Sales', 'Qty Sold', 'unitsSoldWeek' should map to 'unitsSoldWeek'.

        **CRITICAL: Data may be incomplete.** You must handle missing fields gracefully to avoid errors.
        - The 'name' and 'sellingPrice' fields are essential. If a row does not contain enough information to determine a name and a selling price, **you must skip that row**.
        - If 'purchasePrice' is missing or cannot be determined, **default it to 0**.
        - If 'unitsSoldWeek' is missing or cannot be determined, **default it to 0**.

        Ignore any currency symbols (like $), thousands separators (like ,), or extra whitespace in numbers. Extract only the numerical values.
        If a row is clearly a header or completely malformed, ignore it. Only return entries that contain at least a valid 'name' and 'sellingPrice'.

        --- DATA ---
        ${fileContent}
        --- END DATA ---

        Return ONLY the structured JSON array adhering to the provided schema. If no valid products can be extracted, return an empty "products" array.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        products: {
                            type: Type.ARRAY,
                            description: "An array of extracted product objects.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: {
                                        type: Type.STRING,
                                        description: "The name of the product.",
                                    },
                                    purchasePrice: {
                                        type: Type.NUMBER,
                                        description: "The cost or purchase price of the product.",
                                    },
                                    sellingPrice: {
                                        type: Type.NUMBER,
                                        description: "The retail or selling price of the product.",
                                    },
                                    unitsSoldWeek: {
                                        type: Type.NUMBER,
                                        description: "The number of units sold per week. Must be an integer.",
                                    },
                                },
                                required: ["name", "purchasePrice", "sellingPrice", "unitsSoldWeek"]
                            },
                        },
                    },
                    required: ["products"]
                },
            },
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        
        if (!parsed.products || !Array.isArray(parsed.products)) {
            throw new Error("AI returned data in an unexpected format.");
        }
        return parsed.products as Omit<Product, 'id'>[];

    } catch (error: any) {
        console.error("Error parsing unstructured data with Gemini:", error);
        if (error.message.includes('JSON')) {
             throw new Error("AI failed to return valid JSON. The file might be too complex or not text-based.");
        }
        throw new Error("AI model failed to parse the file. Please check the file content and try again.");
    }
};

export const generateFullPdfReportContent = async (
    metrics: { totalWeeklyProfit: number; totalWeeklyRevenue: number; topProductByProfit?: CalculatedProduct | null; averageMargin: number; },
    products: CalculatedProduct[]
): Promise<DetailedReportContent> => {
    
    // 1. Calculate Aggregations Locally to pass to Gemini (ensures data accuracy)
    const categoryMap = new Map<string, { revenue: number, profit: number, count: number }>();
    products.forEach(p => {
        const cat = p.category || 'Uncategorized';
        const current = categoryMap.get(cat) || { revenue: 0, profit: 0, count: 0 };
        categoryMap.set(cat, {
            revenue: current.revenue + p.weeklyRevenue,
            profit: current.profit + p.weeklyProfit,
            count: current.count + 1
        });
    });
    
    const categoryStats = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        revenue: stats.revenue,
        profit: stats.profit,
        margin: stats.revenue > 0 ? (stats.profit / stats.revenue) * 100 : 0,
        itemCount: stats.count
    }));

    const dataStr = formatProductDataForPrompt(products.slice(0, 30)); // Send top 30 products for detail
    
    const prompt = `
        Act as a professional Senior Business Analyst preparing a comprehensive "Weekly Performance Audit Report" for a retail business owner.
        
        You have access to the following aggregated data and a sample of product details.
        
        --- AGGREGATED METRICS ---
        Total Revenue: $${metrics.totalWeeklyRevenue.toFixed(2)}
        Total Profit: $${metrics.totalWeeklyProfit.toFixed(2)}
        Avg Margin: ${metrics.averageMargin.toFixed(1)}%
        Active SKUs: ${products.length}
        Top Product: ${metrics.topProductByProfit?.name} ($${metrics.topProductByProfit?.weeklyProfit.toFixed(2)} profit)
        
        --- CATEGORY PERFORMANCE ---
        ${JSON.stringify(categoryStats)}
        
        --- PRODUCT SAMPLE (Top 30) ---
        ${dataStr}
        
        **Your Task:**
        Generate a strictly structured JSON object for the report. The tone should be professional, insightful, and data-driven.
        
        **Requirements for Specific Sections:**
        1. **Executive Summary**: A high-level narrative of the business health.
        2. **Data Quality**: Analyze the provided product data for completeness (e.g., missing categories, suppliers, low stock). Rate the quality.
        3. **Market Analysis**: Identify top performers and underperformers based on the data.
        4. **Strategic Recommendations**: Provide high-impact advice. Assign a priority (High/Medium/Low) and estimated impact.
        
        Return ONLY the JSON object matching the schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        reportTitle: { type: Type.STRING },
                        reportDate: { type: Type.STRING },
                        executiveSummary: {
                            type: Type.OBJECT,
                            properties: {
                                overview: { type: Type.STRING },
                                keyMetrics: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            label: { type: Type.STRING },
                                            value: { type: Type.STRING },
                                            status: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] }
                                        },
                                        required: ["label", "value", "status"]
                                    }
                                }
                            },
                            required: ["overview", "keyMetrics"]
                        },
                        dataQuality: {
                            type: Type.OBJECT,
                            properties: {
                                summary: { type: Type.STRING },
                                score: { type: Type.STRING, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
                                checks: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            metric: { type: Type.STRING },
                                            status: { type: Type.STRING, enum: ['Pass', 'Fail', 'Warning'] },
                                            details: { type: Type.STRING }
                                        },
                                        required: ["metric", "status", "details"]
                                    }
                                }
                            },
                            required: ["summary", "score", "checks"]
                        },
                        categoryAnalysis: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: { type: Type.STRING },
                                    revenue: { type: Type.NUMBER },
                                    profit: { type: Type.NUMBER },
                                    margin: { type: Type.NUMBER },
                                    itemCount: { type: Type.NUMBER }
                                },
                                required: ["category", "revenue", "profit", "margin", "itemCount"]
                            }
                        },
                        marketAnalysis: {
                            type: Type.OBJECT,
                            properties: {
                                topPerformers: { type: Type.ARRAY, items: { type: Type.STRING } },
                                underPerformers: { type: Type.ARRAY, items: { type: Type.STRING } },
                                opportunityGaps: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["topPerformers", "underPerformers", "opportunityGaps"]
                        },
                        strategicRecommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                                    impact: { type: Type.STRING }
                                },
                                required: ["title", "description", "priority", "impact"]
                            }
                        },
                        conclusion: { type: Type.STRING }
                    },
                    required: ["reportTitle", "reportDate", "executiveSummary", "dataQuality", "categoryAnalysis", "marketAnalysis", "strategicRecommendations", "conclusion"]
                },
            },
        });
        
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as DetailedReportContent;

    } catch (error) {
        console.error("Error generating PDF report content:", error);
        throw new Error("Failed to generate report content from the Gemini API.");
    }
};

export const getSalesForecastAndSuggestions = async (products: CalculatedProduct[]): Promise<ForecastedProduct[]> => {
    const productData = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category || 'N/A',
        sellingPrice: p.sellingPrice,
        unitsSoldWeek: p.unitsSoldWeek,
        stockLevel: p.stockLevel || 0,
    }));

    const prompt = `
        Act as an expert supply chain analyst for a small retail store.
        Based on the following product data (which represents recent weekly sales), provide a sales forecast for the next 7 days for each product.

        --- DATA ---
        ${JSON.stringify(productData, null, 2)}
        --- END DATA ---

        Consider potential simple trends but do not over-complicate. The forecast should be a single integer.
        Return ONLY the structured JSON array adhering to the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        forecasts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.NUMBER },
                                    forecastedSales: { type: Type.NUMBER, description: "Predicted sales for the next 7 days." }
                                },
                                required: ["id", "forecastedSales"]
                            }
                        }
                    },
                    required: ["forecasts"]
                },
            },
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        const forecastMap = new Map<number, number>(
            parsed.forecasts?.map((f: { id: number; forecastedSales: number; }) => [f.id, f.forecastedSales]) || []
        );

        return products.map(p => {
            const forecastedSales = forecastMap.get(p.id) ?? p.unitsSoldWeek; // Default to current sales if no forecast
            const stock = p.stockLevel || 0;
            const reorderAmount = Math.max(0, forecastedSales - stock);
            let reorderSuggestion = `Reorder ${Math.ceil(reorderAmount)}`;
            if (reorderAmount === 0) {
                reorderSuggestion = "Sufficient Stock";
            }
            if (stock > forecastedSales * 2) { // Example of overstock
                reorderSuggestion = "Potentially Overstocked";
            }
            return {
                ...p,
                forecastedSales,
                reorderSuggestion,
            };
        });

    } catch (error) {
        console.error("Error generating sales forecast:", error);
        throw new Error("Failed to generate forecast from the Gemini API.");
    }
};

export const getBusinessOverviewStream = async (
    metrics: { totalWeeklyProfit: number; },
    products: CalculatedProduct[]
): Promise<AsyncGenerator<string>> => {
    const topProduct = [...products].sort((a,b) => b.weeklyProfit - a.weeklyProfit)[0];
    const bottomProduct = [...products].sort((a,b) => a.weeklyProfit - b.weeklyProfit)[0];

    const prompt = `
        Act as a live business operations AI for a small retail store owner.
        Provide a very brief, streaming summary of the current business situation and highlight any CRITICAL alerts.
        Use simple markdown. Start with a 1-2 sentence summary, then list alerts if any.
        An alert should be for something that requires immediate attention, like a potential stockout of a key item.

        --- DATA ---
        Total Weekly Profit: $${metrics.totalWeeklyProfit.toFixed(2)}
        Top Product: ${topProduct?.name} ($${topProduct?.weeklyProfit.toFixed(2)} profit, ${topProduct?.stockLevel || 0} in stock, ${topProduct?.unitsSoldWeek} sold/wk)
        Lowest Profit Product: ${bottomProduct?.name} ($${bottomProduct?.weeklyProfit.toFixed(2)} profit, ${bottomProduct?.stockLevel || 0} in stock)
        --- END DATA ---

        Generate the summary and alerts now.
    `;
    
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    async function* stream() {
        for await (const chunk of response) {
            yield chunk.text;
        }
    }
    return stream();
};

export const extractWebData = async (products: CalculatedProduct[], query: string): Promise<{ headers: string[], data: (string|number)[][] }> => {
    const productNames = products.map(p => p.name).slice(0, 10).join(', ');
    const prompt = `
        Act as a highly advanced, real-time web data extraction and analysis engine. Your primary goal is to provide the most accurate, up-to-the-minute, publicly available data from the web in a clean, structured format.

        The user is a small retail store owner. Their current products for context include: ${productNames}.

        **User Query:** "${query}"

        **CRITICAL INSTRUCTIONS:**
        1.  **Real-Time Data Focus:** Your top priority is to find the most current data. Synthesize information as if you were performing a live web search right now.
        2.  **Website-Specific Extraction:** If the user's query includes a website URL (e.g., 'example.com'), you MUST recognize it and focus your data gathering on information originating from or directly related to that specific domain.
        3.  **Accuracy and Sourcing:** Accuracy is paramount. For each row of data you provide, you should add a "Source" column containing the URL or a clear description of where the information was obtained (e.g., 'Product Page', 'Q4 2023 Financial Report'). This is crucial for user verification.
        4.  **Enhanced Data Cleaning:** Rigorously clean and standardize all extracted data before outputting. This includes:
            -   Converting all prices and numerical figures to pure numbers (e.g., remove '$', ',', '€').
            -   Standardizing dates to 'YYYY-MM-DD' format if applicable.
            -   Normalizing categorical text (e.g., map 'In Stock', 'Available' to a single 'In Stock' value).
        5.  **Structured Output:** Format your response as a clean JSON object. This object must contain two keys: "headers" (an array of strings for column titles, which should include your new 'Source' column) and "data" (an array of arrays, where each inner array represents a row of data corresponding to the headers).
        6.  **Concise Response:** Return ONLY the structured JSON object. Do not include any introductory text, explanations, or summaries outside of the JSON structure.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headers: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        data: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.ARRAY,
                                items: {
                                    oneOf: [
                                        { type: Type.STRING },
                                        { type: Type.NUMBER }
                                    ]
                                }
                            }
                        }
                    },
                    required: ["headers", "data"]
                }
            }
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed;

    } catch (error) {
        console.error("Error extracting web data:", error);
        throw new Error("AI failed to extract web data. The query may be too complex or data may not be available.");
    }
};