
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Client initialisation using the exact environment token matching logic
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateBookOutline = async (topic) => {
  try {
    const prompt = `You are an expert eBook creator. Create a comprehensive structured book layout for the topic: "${topic}". 
    Provide a JSON payload response containing a recommended professional "title", a compelling "subtitle", and an array of "chapters". 
    Each object inside the "chapters" array must include a "title" and a "description" mapping out the goals of that chapter.
    Return ONLY a raw valid JSON schema syntax. Do not wrap inside markdown format ticks.`;

    // Explicit model-level parameters execution schema matrix 
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (!response || !response.text) {
      throw new Error("No data buffer stream caught from Google API pipeline.");
    }

    const cleanData = response.text.trim();
    return JSON.parse(cleanData);

  } catch (error) {
    console.error("Gemini Internal Outliner Stack Trace:", error);
    throw error; // Let the real error pass to controller so we can debug accurately
  }
};

export const generateChapterContent = async (bookTitle, chapterTitle, chapterDescription, sequenceContext = '') => {
  try {
    const prompt = `You are an elite author drafting a book titled "${bookTitle}".
    Write the full content for the chapter: "${chapterTitle}".
    Chapter Purpose: ${chapterDescription}.
    ${sequenceContext}
    Provide high-quality Markdown outputs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Internal Writing Stack Trace:", error);
    throw error;
  }
};