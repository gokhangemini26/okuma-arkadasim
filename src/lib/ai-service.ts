import { Character, Story, ReadingSession } from './types';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
    console.warn("Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey || "mock-key");
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
      
      Çıktı formatı JSON olmalı:
      {
        "title": "Hikaye Başlığı",
        "content": "Hikaye metni...",
        "theme": "Hikayenin ana teması (örn: Dostluk)"
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Robust JSON extraction
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const cleanText = jsonMatch ? jsonMatch[0] : text.replace(/```json/g, '').replace(/```/g, '').trim();

            const data = JSON.parse(cleanText);

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
        // 1. Generate a prompt for the image using Gemini
        const promptGen = `
      Aşağıdaki hikaye için bir boyama sayfası görseli oluşturma komutu (prompt) hazırla.
      
      Hikaye Başlığı: ${story.title}
      Tema: ${story.theme}
      İçerik: ${story.content}
      
      Lütfen aşağıdaki İngilizce şablonu, hikayeye uygun şekilde doldurarak bana ver. Köşeli parantez içindeki yerleri hikayeden çıkarımlarla doldur.
      
      ŞABLON:
      "Create a coloring page illustration designed for children aged 5-10.
      
      Subject: Depict [ANA_KARAKTER_ADLARI_VE_CINSIYETLERI] while [HİKAYENİN_TEMEL_KONUSU/ORTAMI]. The scene must also include [EK_NESNELER_VEYA_DETAYLAR].
      
      Style & Technique:
      
      Line Art: Extremely bold, clean, and distinct black lines. The lines must be thick enough for easy coloring by young children, with clearly defined closed shapes.
      
      Color: Strictly black and white line art only. No shading, no gray tones, and no colors. Pure line art suitable for printing and manual coloring.
      
      Detail Level: The complexity should be appropriate for a 5-10 year old, having enough detail to be engaging but not so much as to be overwhelming. Focus on simple, fun, and recognizable shapes.
      
      Resolution: Generate the image at the maximum possible resolution (e.g., Ultra-High Resolution, 8K) to ensure crisp, clean edges for high-quality printing on standard paper sizes (like A4 or US Letter).
      
      Example Keywords for AI Model: children's coloring book style, thick lines, no fill, clean line art, print quality, high resolution, 8K, black and white."
      
      Sadece doldurulmuş İngilizce metni ver, başka açıklama yapma.
    `;

        try {
            const result = await model.generateContent(promptGen);
            const imagePrompt = result.response.text().trim();
            console.log("Image Prompt:", imagePrompt);

            // 2. Use Pollinations AI to generate the image (Free, no key required)
            // Encode the prompt for URL
            const encodedPrompt = encodeURIComponent(imagePrompt);
            // Add random seed to prevent caching
            const randomSeed = Math.floor(Math.random() * 1000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${randomSeed}`;
            console.log("Generated Image URL:", imageUrl);
            return imageUrl;

        } catch (error) {
            console.error("Image Gen Error:", error);
            return `https://placehold.co/600x400/orange/white?text=${encodeURIComponent(story.title)}`;
        }
    }
};
