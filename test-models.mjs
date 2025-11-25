import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("Available Models:");
            data.models?.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods?.join(', ')})`));
        }
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

listModels();
