import { GoogleGenAI } from "@google/genai";

// Fallback messages in case API key is missing or request fails
const FALLBACK_COMMENTS = [
  "你的努力得到了回報，表現太棒了！",
  "太驚人了！這就是實力的證明！",
  "絕佳的表現，繼續保持這種熱情！",
  "無懈可擊的成績，你是我們的驕傲！"
];

export const fetchEncouragement = async (name?: string, grade?: string, extraContext?: string): Promise<string> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("API Key not found, using fallback.");
    return FALLBACK_COMMENTS[Math.floor(Math.random() * FALLBACK_COMMENTS.length)];
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Construct a dynamic prompt
    const studentName = name || "學生";
    const studentGrade = grade || "A";
    const context = extraContext ? `特別值得稱讚的地方是：「${extraContext}」。` : "";

    const prompt = `這是一個給學生的期末成績揭曉頁面。
    學生姓名：${studentName}
    成績：${studentGrade}
    ${context}
    請給出一句針對這個學生的簡短、充滿活力、溫暖且令人振奮的評語（繁體中文，40字以內）。
    語氣要像是老師對學生說話，請包含學生的名字。`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text;
    return text ? text.trim() : FALLBACK_COMMENTS[0];
  } catch (error) {
    console.error("Error fetching encouragement:", error);
    return FALLBACK_COMMENTS[Math.floor(Math.random() * FALLBACK_COMMENTS.length)];
  }
};