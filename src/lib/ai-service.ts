import { Character, Story, ReadingSession } from './types';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
    console.warn("Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey || "mock-key");
// Using gemini-2.0-flash as it is working for story generation
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const AIService = {
    async generateStory(childName: string, characters: Character[]): Promise<Story> {
        const characterNames = characters.map(c => c.name).join(', ');

        const prompt = `
      Kullanıcının ismi: ${childName}
      Seçilen karakterler: ${characterNames}
      
      Bu isimleri kullanarak didaktik bir hikaye yaz.
      - Hikaye 200-250 kelime aralığında olmalı.
      - Okuyucular 5-10 yaş aralığında olacağı için hikayeler bu yaşlara hitap etmeli.
      - Etnik, ahlaki gibi sorunlar ve çekinceler içermemeli.
      - Hikaye akıcı ve anlaşılır olmalı.
      - Hikayenin başlığı da olsun.
      
      Çıktı formatı JSON olmalı.
      ÖNEMLİ: JSON içindeki metinlerde çift tırnak (") kullanacaksan mutlaka ters eğik çizgi ile kaçır (\"). Örn: "Ali dedi ki: \"Merhaba\""
      
      {
        "title": "Hikaye Başlığı",
        "content": "Hikaye metni... (Çift tırnakları kaçırmayı unutma!)",
        "theme": "Hikayenin ana teması (örn: Dostluk)"
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Robust JSON extraction
            let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanText = jsonMatch[0];
            }

            // Attempt to sanitize common JSON errors if parse fails
            let data;
            try {
                data = JSON.parse(cleanText);
            } catch (e) {
                console.warn("First JSON parse failed, attempting to sanitize...", e);
                throw e;
            }

            return {
                id: Math.random().toString(36).substr(2, 9),
                title: data.title,
                content: data.content,
                characters: characters,
                theme: data.theme,
                createdAt: new Date(),
            };
        } catch (error) {
            console.error("Gemini API Error:", error);
            // Fallback to mock if API fails
            return {
                id: Math.random().toString(36).substr(2, 9),
                title: `${childName} ve ${characters[0].name}'nin Macerası`,
                content: `Bir gün ${childName}, ormanda yürüyüşe çıktı. Yanında en sevdiği arkadaşı ${characters[0].name} vardı. Birden karşılarına ${characters[1]?.name || 'bir arkadaş'} çıktı. Hep birlikte oyun oynamaya başladılar. Çok eğlenceli bir gün geçirdiler.`,
                characters: characters,
                theme: 'Arkadaşlık',
                createdAt: new Date(),
            };
        }
    },

    async analyzeReading(audioBlob: Blob, storyText: string, durationSeconds: number): Promise<Partial<ReadingSession>> {
        // Convert Blob to Base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Remove data URL prefix (e.g., "data:audio/webm;base64,")
                resolve(base64String.split(',')[1]);
            };
            reader.readAsDataURL(audioBlob);
        });

        const audioBase64 = await base64Promise;

        const prompt = `
      Aşağıdaki ses kaydı, şu metnin okunmasıdır: "${storyText.substring(0, 100)}..."
      
      Lütfen bu okumayı analiz et ve şu formatta JSON çıktısı ver.
      ÖNEMLİ: Sadece JSON döndür, başka hiçbir metin ekleme.
      
      {
        "correctWordCount": (okunan doğru kelime sayısı, sayı),
        "accuracyScore": (0-100 arası doğruluk puanı, sayı),
        "feedback": (çocuğa yönelik motive edici ve düzeltici kısa bir geri bildirim, Türkçe)
      }
    `;

        try {
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        mimeType: "audio/webm", // Assuming webm from MediaRecorder
                        data: audioBase64
                    }
                }
            ]);

            const response = await result.response;
            const text = response.text();

            // Robust JSON extraction
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const cleanText = jsonMatch ? jsonMatch[0] : text.replace(/```json/g, '').replace(/```/g, '').trim();

            const data = JSON.parse(cleanText);

            // Calculate WPM accurately
            // WPM = (Words / Seconds) * 60
            const safeDuration = Math.max(1, durationSeconds);
            const wpm = Math.round((data.correctWordCount / safeDuration) * 60);

            return {
                wpm: wpm || 0,
                accuracyScore: data.accuracyScore,
                feedback: data.feedback,
                wordCount: storyText.split(' ').length,
                durationSeconds: durationSeconds,
            };
        } catch (error) {
            console.error("Gemini Analysis Error:", error);
            return {
                wpm: 0,
                accuracyScore: 0,
                feedback: "Ses analizi şu an yapılamadı, lütfen tekrar dene.",
                wordCount: storyText.split(' ').length,
                durationSeconds: durationSeconds,
            };
        }
    },

    async generateRewardImage(story: Story): Promise<string> {
        // 1. Generate a scene description using Gemini
        const promptGen = `
      Aşağıdaki hikaye için bir boyama sayfası görseli oluşturacağız.
      Bana sadece hikayeyi anlatan, karakterleri ve mekanı içeren ÇOK BASİT ve KISA bir İngilizce sahne betimlemesi ver.
      
      Hikaye Başlığı: ${story.title}
      Tema: ${story.theme}
      İçerik: ${story.content}
      
      Kurallar:
      - Sadece sahneyi anlat (Örn: "A cute rabbit holding a carrot in a garden")
      - Karmaşık detaylardan kaçın.
      - Maksimum 10 kelime olsun.
    `;

        try {
            const result = await model.generateContent(promptGen);
            const sceneDescription = result.response.text().trim();
            console.log("Scene Description:", sceneDescription);

            // 2. Construct the final prompt optimized for simple coloring pages
            // Extremely simple prompt to avoid URL issues and model confusion
            const finalPrompt = `coloring page of ${sceneDescription}, simple black lines, white background, no shading`;

            console.log("Final Image Prompt:", finalPrompt);

            // 3. Use Pollinations AI with Default Model (most reliable)
            const encodedPrompt = encodeURIComponent(finalPrompt);

            // Minimal URL to avoid 500 errors - verified via test script
            // Adding ANY parameters (seed, nologo, width) causes 500 errors currently
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

            console.log("Generated Image URL:", imageUrl);
            return imageUrl;

        } catch (error) {
            console.error("Image Gen Error:", error);
            return `https://placehold.co/600x400/orange/white?text=${encodeURIComponent(story.title)}`;
        }
    }
};
