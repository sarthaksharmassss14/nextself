import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const bytes = await image.arrayBuffer();
        const base64Image = Buffer.from(bytes).toString("base64");

        console.log(`[Fitness API] Image processed. Base64 size: ${(base64Image.length / 1024).toFixed(2)} KB`);

        let completion;
        try {
            completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a professional fitness analyst. return strictly JSON."
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Analyze this full-body photo for fitness and posture. 
                                Respond with a JSON object:
                                {
                                    "valid": boolean (true if human full body is visible),
                                    "score": number (0-100),
                                    "summary": "2-sentence analysis",
                                    "workout_items": [{"title": "string", "description": "string"}],
                                    "dietary_recommendations": [{"title": "string", "description": "string"}]
                                }`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                },
                            },
                        ],
                    },
                ],
                model: "llama-3.2-11b-vision-preview",
                response_format: { type: "json_object" },
                temperature: 0.1,
            });
        } catch (apiError: any) {
            console.error("[Fitness API] Groq Error:", apiError.message);
            return NextResponse.json({
                error: "The AI engine is currently overloaded or image is too large. Please try a smaller photo."
            }, { status: 503 });
        }

        const rawJson = completion.choices[0].message.content || "{}";
        console.log(`[Fitness API] AI Response: ${rawJson.substring(0, 50)}...`);

        let result;
        try {
            // Defensive cleaning of JSON string
            const cleanJson = rawJson.replace(/```json|```/g, "").trim();
            result = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("[Fitness API] Parse Error:", parseError);
            return NextResponse.json({ error: "Neural processing failed to format data. Try another shot." }, { status: 500 });
        }

        if (result.valid === false) {
            return NextResponse.json({
                error: "The AI could not detect a clear full-body human subject. Please stand back and ensure you are fully visible."
            }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[Fitness API] General API Error:", error);
        return NextResponse.json({
            error: "Neural system processing failed. Please check your internet or try a different photo."
        }, { status: 500 });
    }
}
