"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AIService } from "@/lib/ai-service";
import { VoiceRecorder } from "@/components/reading/VoiceRecorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";

export default function StoryReadPage() {
    const { currentStory, user, addReadingSession } = useStore();
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (!currentStory) {
            router.push("/story/setup");
        }
    }, [currentStory, router]);

    const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
        if (!currentStory || !user) return;

        setIsAnalyzing(true);
        try {
            const analysis = await AIService.analyzeReading(audioBlob, currentStory.content, duration);

            addReadingSession({
                id: Math.random().toString(36).substr(2, 9),
                storyId: currentStory.id,
                audioUrl: URL.createObjectURL(audioBlob),
                durationSeconds: duration,
                wordCount: analysis.wordCount || 0,
                wpm: analysis.wpm || 0,
                accuracyScore: analysis.accuracyScore || 0,
                feedback: analysis.feedback || "",
                createdAt: new Date(),
            });

            router.push("/story/result");
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Analiz sırasında bir hata oluştu.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!currentStory) return null;

    return (
        <div className="min-h-screen bg-amber-50 pb-24">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-amber-100 p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between max-w-3xl mx-auto w-full">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="text-amber-900 hover:bg-amber-100"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div className="font-bold text-amber-900 truncate max-w-[200px]">
                        {currentStory.title}
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-3xl mx-auto w-full p-4 space-y-6">
                {/* Characters Strip */}
                <div className="flex justify-center -space-x-4 mb-6 overflow-x-auto py-2">
                    {currentStory.characters.map((char, i) => (
                        <div
                            key={char.id}
                            className="relative w-16 h-16 rounded-full border-4 border-white shadow-md bg-white z-0"
                            style={{ zIndex: i }}
                        >
                            <Image
                                src={char.imagePath}
                                alt={char.name}
                                fill
                                className="object-cover rounded-full"
                            />
                        </div>
                    ))}
                </div>

                {/* Story Content */}
                <Card className="bg-white border-none shadow-lg shadow-amber-100/50">
                    <CardContent className="p-6 md:p-10">
                        <div className="prose prose-lg prose-amber max-w-none font-medium leading-loose text-slate-800">
                            {currentStory.content.split('\n').map((paragraph, idx) => (
                                <p key={idx} className="mb-4 last:mb-0">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Recording Controls */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-amber-50 via-amber-50 to-transparent pt-12 pb-8 flex justify-center px-4 pointer-events-none">
                <div className="pointer-events-auto">
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center bg-white p-4 rounded-2xl shadow-xl border border-amber-100">
                            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-2" />
                            <span className="text-amber-800 font-medium">Okuman analiz ediliyor...</span>
                        </div>
                    ) : (
                        <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
                    )}
                </div>
            </div>
        </div>
    );
}
