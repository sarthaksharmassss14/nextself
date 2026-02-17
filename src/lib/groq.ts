import Groq from "groq-sdk";

export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const VISION_MODEL = "llama-3.2-90b-vision-preview";
// Alternatively: "llama-3.2-90b-vision-preview" or "llava-v1.5-7b-4096"
