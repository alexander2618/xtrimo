
import { GoogleGenAI } from "@google/genai";

export const generateAIResponse = async (
  prompt: string, 
  systemInstruction?: string, 
  useSearch: boolean = false
) => {
  // Always use process.env.API_KEY directly for initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const config: any = {
      systemInstruction: systemInstruction || "You are xTrimo, a specialized AI assistant for life sciences and bioinformatics.",
      temperature: 0.7,
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // Using gemini-3-pro-preview for complex life sciences reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: config,
    });

    // Access the text property directly, do not call as a method
    const text = response.text;
    
    // Extract grounding chunks if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => {
      if (chunk.web) {
        return {
          title: chunk.web.title,
          uri: chunk.web.uri
        };
      }
      return null;
    }).filter(Boolean) || [];

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      text: "I encountered an error processing your request. Please check your API key and try again.",
      sources: []
    };
  }
};
