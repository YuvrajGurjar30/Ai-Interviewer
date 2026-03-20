import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface InterviewQuestion {
  question: string;
  context?: string;
}

export interface Feedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  overallFeedback: string;
}

export const startInterview = async (resumeText: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert interviewer. Based on the following resume, generate the first interview question. 
    The question should be professional and tailored to the candidate's experience.
    
    Resume:
    ${resumeText}
    
    Return only the question text.`,
  });

  return response.text || "Could you tell me a bit about yourself and your background?";
};

export const getNextQuestion = async (resumeText: string, chatHistory: { role: string; text: string }[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        text: `You are an expert interviewer. Based on the candidate's resume and the interview conversation so far, ask the next relevant question. 
        Keep the interview professional and challenging. If you feel enough questions have been asked (around 5-7), you can signal the end of the interview by saying "INTERVIEW_COMPLETE".
        
        Resume:
        ${resumeText}
        
        Conversation History:
        ${chatHistory.map(h => `${h.role}: ${h.text}`).join("\n")}
        
        Next question (or INTERVIEW_COMPLETE):`
      }
    ],
  });

  return response.text || "Tell me more about your experience.";
};

export const getFeedback = async (resumeText: string, chatHistory: { role: string; text: string }[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        text: `Analyze the following interview transcript and candidate resume. Provide a detailed feedback report.
        
        Resume:
        ${resumeText}
        
        Interview Transcript:
        ${chatHistory.map(h => `${h.role}: ${h.text}`).join("\n")}
        
        Return the feedback in JSON format with the following structure:
        {
          "score": number (0-100),
          "strengths": string[],
          "weaknesses": string[],
          "suggestions": string[],
          "overallFeedback": string
        }`
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          overallFeedback: { type: Type.STRING }
        },
        required: ["score", "strengths", "weaknesses", "suggestions", "overallFeedback"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as Feedback;
  } catch (e) {
    console.error("Failed to parse feedback JSON", e);
    return null;
  }
};
