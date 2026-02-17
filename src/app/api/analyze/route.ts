import { NextRequest, NextResponse } from "next/server";
import { groq, ANALYSIS_MODEL, VISION_MODEL } from "@/lib/groq";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const hash = crypto.createHash("sha256").update(buffer).digest("hex");

        // Cache check
        const cachedDoc = await getDoc(doc(db, "analyses", hash));
        if (cachedDoc.exists()) {
            const data = cachedDoc.data();
            if (data.detailedScores) {
                return NextResponse.json(data);
            }
        }

        // AI-Driven Face Analysis (No more Math.random)
        const base64Image = buffer.toString("base64");
        const analysisPrompt = `
            You are a professional human facial aesthetics and grooming analyzer.
            
            STEP 1: Check if the uploaded image is a CLEAR HUMAN SELFIE or FRONT-FACING PORTRAIT.
            If the image is an animal, a tree, a cartoon, an object, or too blurry to see a face, stop immediately.
            
            STEP 2: If valid, provide a DEEP AND COMPREHENSIVE analysis of the selfie. 
            The goal is to provide elite-level value to the user.
            
            1. Analyze facial structure (jawline, cheekbones, etc.) with technical precision.
            2. Evaluate grooming standards (hair texture, skin health, beard/masculinity).
            3. Provide a long, detailed "summary" that feels premium and insightful.
            
            For the "roadmap", provide EXACTLY 6-7 HIGHLY SPECIFIC steps.
            EACH suggestion MUST BE A DETAILED PARAGRAPH (minimum 30-50 words). 
            Explain THE WHY and THE HOW. Mention specific products (e.g., niacinamide, hyaluronic acid) or specific exercises (e.g., tongue posture - mewing).
            
            STRICTLY DO NOT USE ANY EMOJIS IN YOUR RESPONSE.
            CATEGORIES MUST BE TITLE-CASED.

            Respond STRICTLY in this JSON format:
            {
              "isValid": true,
              "error": null,
              "score": 78,
              "detailedScores": {
                "jawline": 85,
                "skin": 70,
                "masculinity": 88,
                "cheekbones": 72,
                "hair": 75
              },
              "roadmap": [
                { "category": "Category Name", "suggestion": "A full, detailed paragraph explaining the exact science and steps..." }
              ],
              "summary": "A long, architectural, and premium 3-4 sentence analysis."
            }
        `;

        const response = await groq.chat.completions.create({
            model: VISION_MODEL,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: analysisPrompt },
                        {
                            type: "image_url",
                            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content || "{}";
        console.log("AI Analysis Result:", content);
        const result = JSON.parse(content);

        // Validation to ensure it's a human face
        if (result.isValid === false) {
            return NextResponse.json({ error: result.error || "Bhai, ye insaan ka chehra nahi lag raha. Kripya ek saaf selfie upload karein." }, { status: 400 });
        }

        if (!result.detailedScores) {
            throw new Error("AI failed to provide detailed scores.");
        }

        // Save to DB
        await setDoc(doc(db, "analyses", hash), {
            ...result,
            createdAt: new Date().toISOString(),
            imageHash: hash,
            metrics: result.detailedScores
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze" }, { status: 500 });
    }
}
