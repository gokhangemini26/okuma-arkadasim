import { Character, Story, ReadingSession } from './types';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) console.warn("Missing NEXT_PUBLIC_GEMINI_API_KEY");

const genAI = new GoogleGenerativeAI(apiKey || "mock-key");
const storyModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const AIService = {
    async generateStory(childName: string, characters: Character[]): Promise<Story> {
        const characterNames = characters.map(c => c.name).join(', ');
        const prompt = `Kullanıcının ismi: ${childName}\nSeçilen karakterler: ${characterNames}\n\nBu isimleri kullanarak didaktik ve sürükleyici bir hikaye yaz.\n\nKURALLAR:\n1. Hikaye EN AZ 300 kelime olmalı (Lütfen kısa kesme).\n2. Giriş, gelişme ve sonuç bölümleri belirgin olmalı.\n3. Olaylar ve mekanlar detaylı betimlenmeli.\n4. Okuyucular 5-10 yaş aralığında, dil akıcı ve anlaşılır olmalı.\n5. Etnik, ahlaki sorunlar içermemeli.\n6. Mutlaka bir başlığı olmalı.\n\nÇıktı formatı JSON olmalı:\n{\n  "title": "Hikaye Başlığı",\n  "content": "Hikaye metni... (Uzun ve detaylı)",\n  "theme": "Ana tema"\n}`;
        try {
            const result = await storyModel.generateContent(prompt);
            const text = result.response.text();
            let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) cleanText = jsonMatch[0];
            const data = JSON.parse(cleanText);
            return { id: crypto.randomUUID(), title: data.title, content: data.content, theme: data.theme, createdAt: new Date(), characters };
        } catch (error: any) {
            console.error("Story generation failed:", error);
            // HATA AYIKLAMA İÇİN: Hatayı hikaye metni olarak göster
            const errorMessage = error?.message || "Bilinmeyen hata";
            return {
                id: crypto.randomUUID(),
                title: "Hata Oluştu",
                content: `Üzgünüm, hikaye oluşturulurken bir sorun çıktı.\n\nHata Detayı: ${errorMessage}\n\nLütfen Vercel Environment Variables ayarlarını kontrol et.`,
                theme: "Hata",
                createdAt: new Date(),
                characters
            };
        }
    },

    async analyzeReading(audioBlob: Blob, storyText: string, durationSeconds: number): Promise<Partial<ReadingSession>> {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(audioBlob);
        });
        const audioBase64 = await base64Promise;
        const prompt = `Aşağ ıdaki ses kaydı, şu metnin okunmasıdır: "${storyText.substring(0, 100)}..."\n\nLütfen bu okumayı analiz et ve şu formatta JSON çıktısı ver.\nÖNEMLİ: Sadece JSON döndür, başka hiçbir metin ekleme.\n\n{\n  "correctWordCount": (okunan doğru kelime sayısı, sayı),\n  "accuracyScore": (0-100 arası doğruluk puanı, sayı),\n  "feedback": (çocuğa yönelik motive edici ve düzeltici kısa bir geri bildirim, Türkçe)\n}`;
        try {
            const result = await storyModel.generateContent([prompt, { inlineData: { mimeType: "audio/webm", data: audioBase64 } }]);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const cleanText = jsonMatch ? jsonMatch[0] : text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanText);
            const wpm = Math.round((data.correctWordCount / Math.max(1, durationSeconds)) * 60);
            return { wpm, accuracyScore: data.accuracyScore, feedback: data.feedback, wordCount: storyText.split(' ').length, durationSeconds };
        } catch (error) {
            console.error("Gemini Analysis Error:", error);
            return { wpm: 0, accuracyScore: 0, feedback: "Ses analizi şu an yapılamadı.", wordCount: storyText.split(' ').length, durationSeconds };
        }
    },

    async generateRewardImage(story: Story): Promise<string> {
        console.log("🎨 Starting image generation for:", story.title);
        const promptRequest = `Based on this story, create a SHORT English description for a simple coloring page for kids 5-10.\n\nTitle: ${story.title}\nTheme: ${story.theme}\nStory: ${story.content.substring(0, 200)}...\n\nRequirements:\n- Maximum 15 words\n- Simple objects/characters only\n- No complex details\n- Focus on main character/scene\n- English only, no special characters\n\nExample: "happy cat playing with ball in garden"\n\nYour output (SHORT, simple English):`;

        try {
            const promptModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            console.log("📝 Generating prompt with Gemini 2.0 Flash...");
            const result = await promptModel.generateContent(promptRequest);
            const sceneDescription = result.response.text().trim();
            console.log("✅ Scene:", sceneDescription);

            const finalPrompt = `coloring page for kids, ${sceneDescription}, black and white, line art, no shading`;
            console.log("🎨 Final prompt:", finalPrompt);

            const encodedPrompt = encodeURIComponent(finalPrompt);
            const timestamp = Date.now();
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=1024&nologo=true&seed=${timestamp}&model=turbo`;

            console.log("🔗 Pollinations URL:", imageUrl);
            return imageUrl;
        } catch (error) {
            console.error("❌ Failed:", error);
            return `https://placehold.co/768x1024/FEF3C7/92400E?text=Coloring+Page`;
        }
    },
};
