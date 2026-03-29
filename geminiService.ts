
import { GoogleGenAI, Type } from '@google/genai';
import { Question, Difficulty } from "./types";

export interface ContentPart {
  inlineData?: {
    mimeType: string;
    data: string;
  };
  text?: string;
}

export const GeminiService = {
  async generateQuestions(
    parts: ContentPart[], 
    count: number, 
    difficulty: Difficulty
  ): Promise<Question[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      if (count > 20) count = 20;
      if (count < 1) count = 5;

      const systemPrompt = `You are an expert academic examiner. Your task is to generate exactly ${count || 10} high-quality multiple choice questions (MCQs) based on the provided source materials.
      
      Requirements:
      1. Difficulty Level: ${difficulty || 'Medium'}.
      2. Format: Each question must have exactly 4 distinct options.
      3. Correct Answer: Specify the zero-based index (0-3) of the correct option.
      4. Explanation: Provide a clear, concise educational explanation for the correct answer.
      5. Content Coverage: Ensure questions are directly derived from the provided text, images, or documents. Explicitly ensure the questions cover different aspects, topics, and sections of the provided material to provide a broad and comprehensive assessment.
      6. Output: Return ONLY a valid JSON array of objects. Do not include any markdown formatting or extra text.`;

      const finalParts = parts.map((p: any) => {
        if (p.text) return { text: p.text };
        if (p.inlineData) return { inlineData: p.inlineData };
        return { text: "" };
      });
      
      finalParts.push({ text: `Please generate ${count} multiple choice questions based on the provided materials.` });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: finalParts
        },
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "The question text" },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Array of exactly 4 options"
                },
                correctAnswer: { 
                  type: Type.INTEGER, 
                  description: "Index (0-3) of the correct answer" 
                },
                explanation: { type: Type.STRING, description: "Brief explanation of why the answer is correct" }
              },
              required: ["text", "options", "correctAnswer", "explanation"]
            },
          },
        },
      });

      const jsonStr = response.text?.trim() || '[]';
      let questions = [];
      try {
        questions = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Response Text:", jsonStr);
        const match = jsonStr.match(/\[[\s\S]*\]/);
        if (match) {
          questions = JSON.parse(match[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      return questions.map((q: any) => ({
        ...q,
        id: Math.random().toString(36).substring(2, 9),
        difficulty
      }));
    } catch (e) {
      console.error("Failed to fetch from AI API", e);
      throw e;
    }
  }
};
