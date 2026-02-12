import { GoogleGenAI } from "@google/genai";

// 模拟响应生成器
const generateMockResponse = (prompt: string) => {
  const responses = [
    `我理解您的问题："${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}"。

这是一个很好的研究问题。建议您可以：
1. 查阅相关领域的最新文献
2. 使用专业数据库进行检索
3. 考虑与领域专家讨论

如需更详细的分析，请配置 Gemini API Key。`,

    `感谢您的提问。关于这个问题，我建议：

**研究思路：**
- 确定核心假设
- 设计对照实验
- 收集和分析数据

**注意事项：**
- 确保实验可重复
- 记录详细实验条件
- 考虑伦理和安全问题

当前使用的是演示模式，配置 API Key 后可获得 AI 驱动的深度分析。`,

    `收到您的请求。作为生命科学 AI 助手，我建议您：

1. **文献调研** - 检索 PubMed、Google Scholar 等数据库
2. **数据分析** - 使用 R/Python 进行统计分析
3. **实验设计** - 考虑样本量、对照组设置

⚠️ 当前为离线演示模式，未连接 Gemini API。`
  ];
  
  // 根据 prompt 长度选择一个响应
  const index = prompt.length % responses.length;
  return {
    text: responses[index],
    sources: []
  };
};

export const generateAIResponse = async (
  prompt: string, 
  systemInstruction?: string, 
  useSearch: boolean = false
) => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  // 如果没有 API Key，返回模拟响应
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.log('No API Key found, using mock response');
    return generateMockResponse(prompt);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const config: any = {
      systemInstruction: systemInstruction || "You are xTrimo, a specialized AI assistant for life sciences and bioinformatics.",
      temperature: 0.7,
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: config,
    });

    const text = response.text;
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
    // API 出错时也返回模拟响应，而不是报错
    return generateMockResponse(prompt);
  }
};
