const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");

function getApiKey() {
    try {
        const envPath = path.join(process.cwd(), ".env.local");
        const envContent = fs.readFileSync(envPath, "utf8");
        const match = envContent.match(/GROQ_API_KEY=(.*)/);
        return match ? match[1].trim() : null;
    } catch (err) {
        return null;
    }
}

const groq = new Groq({ apiKey: getApiKey() });

async function listModels() {
    try {
        const models = await groq.models.list();
        // Look for vision or multimodal models
        console.log("All Models:", models.data.map(m => m.id));
    } catch (err) {
        console.error(err);
    }
}

listModels();
