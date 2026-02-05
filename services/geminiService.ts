
import { GoogleGenAI } from "@google/genai";
import { AssetType, AIInsight } from "../types";

/**
 * Fetches market insights using Gemini 3 Flash with Google Search grounding.
 */
export const getMarketInsights = async (symbols: string[], baseCurrency: string = 'PHP'): Promise<AIInsight> => {
  if (symbols.length === 0) return { title: "Portfolio Intelligence", content: "Add assets to get insights.", sentiment: "neutral", sources: [] };
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const symbolsStr = symbols.join(", ");
  const prompt = `Provide a brief market summary and sentiment analysis for the following assets: ${symbolsStr}. 
  The user's portfolio base currency is ${baseCurrency}. 
  Focus on recent price action and news relevant to these assets. 
  Format the response as a clear summary.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No insights available.";
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Source",
      uri: chunk.web?.uri || "#"
    })) || [];

    const sentiment = text.toLowerCase().includes("bullish") || text.toLowerCase().includes("positive") ? "positive" : 
                    text.toLowerCase().includes("bearish") || text.toLowerCase().includes("negative") ? "negative" : "neutral";

    return {
      title: "Portfolio Intelligence",
      content: text,
      sentiment: sentiment as any,
      sources: sources
    };
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      title: "Market Insight Error",
      content: "Failed to fetch real-time market data.",
      sentiment: "neutral",
      sources: []
    };
  }
};

/**
 * Fetches current asset prices using Gemini 3 Flash.
 * Explicitly requests prices in the user's base currency to avoid USD/PHP confusion.
 */
export const getAssetPrices = async (symbols: string[], baseCurrency: string = 'PHP'): Promise<Record<string, number>> => {
  if (symbols.length === 0) return {};
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Find the CURRENT market price for the following assets: ${symbols.join(", ")}.
  CRITICAL: You MUST return the prices in ${baseCurrency}. 
  If an asset is a cryptocurrency (like BTC, LINK, etc.), fetch its USD price and convert it to ${baseCurrency} using the latest exchange rate.
  If an asset is a Philippine stock (like SM, BDO, TEL), fetch its price from the PSE in PHP.
  
  Return ONLY a raw JSON object where keys are the symbols and values are numeric current prices in ${baseCurrency}. 
  No markdown, no backticks, no extra text. 
  Example: {"BTC": 3600000, "SM": 950, "LINK": 600}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = (response.text || "").trim();
    // Use a more robust JSON extraction in case the model adds fluff
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Price JSON parsing error:", e, text);
      }
    }
    return {};
  } catch (error) {
    console.error("Price Fetch Error:", error);
    return {};
  }
};
