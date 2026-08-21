
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Client initialisation using the exact environment token matching logic
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateBookOutline = async (topic, title, description, genre, targetAudience, writingTone, language, chapterCount) => {
  try {
    const prompt = `You are an expert eBook creator. Create a comprehensive structured book layout.
    Topic: "${topic}"
    Title: "${title || 'Auto-generate a title'}"
    Description: "${description}"
    Genre: "${genre}"
    Target Audience: "${targetAudience}"
    Writing Tone: "${writingTone}"
    Language: "${language}"
    Number of Chapters: ${chapterCount}
    
    Provide a JSON payload response containing a recommended professional "title", a compelling "subtitle", and an array of "chapters". 
    Each object inside the "chapters" array must include a "title" and a "description" mapping out the goals of that chapter.
    There MUST be exactly ${chapterCount} chapters in the array.
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

export const generateChapterContent = async (book, chapter, sequenceContext = '') => {
  try {
    const prompt = `You are an elite author drafting a book titled "${book.title}".
    Genre: ${book.genre || 'Non-fiction'}. 
    Target Audience: ${book.targetAudience || 'General'}.
    Tone: ${book.writingTone || 'Professional'}.
    Language: ${book.language || 'English'}.
    
    Write the full content for the chapter: "${chapter.title}".
    Chapter Purpose: ${chapter.description}.
    ${sequenceContext}
    Provide high-quality Markdown outputs. Do not output anything other than the chapter content itself.`;

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

export const processAIAssist = async (action, book, chapter, selectedText = '', instruction = '', nearbyContext = '') => {
  try {
    let promptInstruction = '';
    
    switch (action) {
      case 'continueWriting':
        promptInstruction = `Continue writing the following section logically. Maintain the current tone.`;
        break;
      case 'improveWriting':
        promptInstruction = `Improve the clarity, grammar, flow, and readability of the following text while preserving its original meaning.`;
        break;
      case 'rewrite':
        promptInstruction = `Rewrite the following text completely to improve its wording, but preserve the exact meaning. Do not introduce unrelated information.`;
        break;
      case 'expand':
        promptInstruction = `Expand the following text by adding helpful context, explanations, and examples. Preserve original ideas without generating meaningless filler.`;
        break;
      case 'shorten':
        promptInstruction = `Shorten the following text while preserving its core meaning and all important information.`;
        break;
      case 'simplify':
        promptInstruction = `Rewrite the following text using simpler language suitable for a general audience. Preserve meaning.`;
        break;
      case 'tone_professional':
        promptInstruction = `Rewrite the following text in a highly Professional tone.`;
        break;
      case 'tone_academic':
        promptInstruction = `Rewrite the following text in an Academic tone.`;
        break;
      case 'tone_conversational':
        promptInstruction = `Rewrite the following text in a Conversational and friendly tone.`;
        break;
      case 'summarize':
        promptInstruction = `Provide a concise summary of the following text, optionally including key points.`;
        break;
      case 'generateIdeas':
        promptInstruction = `Generate 5 to 10 useful ideas or sub-topics based on the following text or topic.`;
        break;
      case 'customPrompt':
        promptInstruction = `Follow these specific instructions: "${instruction}". Apply them to the following text.`;
        break;
      default:
        throw new Error('Unknown AI action requested');
    }

    const systemContext = `You are an elite AI Writing Assistant working on a book titled "${book.title}".
Chapter: "${chapter.title}"
Tone: ${book.writingTone || 'Professional'}
Audience: ${book.targetAudience || 'General'}

Your task is to follow the user's instructions strictly.
Do NOT include any meta-commentary like "Here is the improved text:".
Only return the requested content output.

Instruction:
${promptInstruction}

${nearbyContext ? `For context, the nearby surrounding text is:\n"${nearbyContext}"\n\n` : ''}
Target Text to Process:
"""
${selectedText || (action === 'continueWriting' ? nearbyContext : '(No text provided)')}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemContext,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini AI Assistant Stack Trace:", error);
    throw error;
  }
};