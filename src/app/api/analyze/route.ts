import { NextRequest, NextResponse } from "next/server";
import { groq, VISION_MODEL } from "@/lib/groq";
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

        // Convert image to buffer for hashing
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate SHA-256 hash for consistency
        const hash = crypto.createHash("sha256").update(buffer).digest("hex");

        // Check if this image has been analyzed before
        const cachedDoc = await getDoc(doc(db, "analyses", hash));
        if (cachedDoc.exists()) {
            return NextResponse.json(cachedDoc.data());
        }

        // Convert to base64 for Groq
        const base64Image = buffer.toString("base64");
        const imageUrl = `data:${image.type};base64,${base64Image}`;

        const prompt = `
      Analyze this selfie/photo of a person. Provide:
      1. A facial attractiveness/grooming score out of 100.
      2. A detailed roadmap for improvement (focusing on grooming, skin care, hairstyle, outfit, or expression).
      
      Respond STRICTLY in the following JSON format:
      {
        "score": number,
        "roadmap": [
          { "category": "category name", "suggestion": "detailed advice" }
        ],
        "summary": "a short punchy summary of the rating"
      }
      
      Be honest but constructive. Highlight the strengths first.
    `;

        const response = await groq.chat.completions.create({
            model: VISION_MODEL,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");

        // Store in Firestore for future requests
        await setDoc(doc(db, "analyses", hash), {
            ...result,
            createdAt: new Date().toISOString(),
            imageHash: hash,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
    }
}
