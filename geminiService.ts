
import { GoogleGenAI, Type } from '@google/genai';
import { Question, Difficulty } from "./types";
import { Storage } from "./storage";

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
    difficulty: Difficulty,
    onProgress?: (current: number, total: number) => void
  ): Promise<Question[]> {
    try {
      let apiKey = await Storage.getSystemConfig('GEMINI_API_KEY');
      
      if (!apiKey) {
        apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY;
      }

      if (!apiKey) {
        throw new Error("Gemini API Key not found in Supabase or Environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      if (count > 20) count = 20;
      if (count < 1) count = 5;

      const batchSize = 3;
      let allQuestions: Question[] = [];

      for (let i = 0; i < count; i += batchSize) {
        const toGenerate = Math.min(batchSize, count - allQuestions.length);
        if (toGenerate <= 0) break;
        
        if (onProgress) {
           onProgress(allQuestions.length + 1, count);
        }

        const systemPrompt = `You are an expert academic examiner. Your task is to generate exactly ${toGenerate} high-quality multiple choice questions (MCQs) based on the provided source materials. This is batch ${(i/batchSize) + 1}.
        
        Requirements:
        1. Difficulty Level: ${difficulty || 'Medium'}.
        2. Format: Each question must have exactly 4 distinct options.
        3. Correct Answer: Specify the zero-based index (0-3) of the correct option.
        4. Explanation: Provide a clear, concise educational explanation for the correct answer.
        5. Content Coverage: Ensure questions are directly derived from the provided text, images, or documents. Explicitly ensure the questions are diverse.
        6. Output: Return ONLY a valid JSON array of objects. Do not include any markdown formatting or extra text.`;

        const finalParts = parts.map((p: any) => {
          if (p.text) return { text: p.text };
          if (p.inlineData) return { inlineData: p.inlineData };
          return { text: "" };
        });
        
        finalParts.push({ text: `Please generate exactly ${toGenerate} NEW multiple choice questions based on the provided materials.` });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
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
            console.error("Failed to parse this batch, skipping...");
            continue;
          }
        }

        const batchQs = questions.map((q: any) => ({
          ...q,
          id: Math.random().toString(36).substring(2, 9),
          difficulty
        }));

        allQuestions.push(...batchQs);
        
        if (onProgress) {
          onProgress(Math.min(allQuestions.length, count), count);
        }

        // Delay to prevent hitting API rate limits immediately
        if (i + batchSize < count) {
           await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      return allQuestions.slice(0, count);
    } catch (e) {
      console.error("Failed to fetch from AI API", e);
      throw e;
    }
  }
};
