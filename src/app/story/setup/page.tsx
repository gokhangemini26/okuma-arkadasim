"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AIService } from "@/lib/ai-service";
import { CharacterSelector } from "@/components/story/CharacterSelector";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

export default function StorySetupPage() {
    const router = useRouter();
    const {
        user,
        selectedCharacters,
        setCharacters,
        setStory
    } = useStore();

    const [isGenerating, setIsGenerating] = useState(false);

    const handleToggleCharacter = (character: any) => {
        const isSelected = selectedCharacters.some(c => c.id === character.id);
        if (isSelected) {
            setCharacters(selectedCharacters.filter(c => c.id !== character.id));
        } else {
            if (selectedCharacters.length < 3) {
                setCharacters([...selectedCharacters, character]);
            }
        }
    };

    const handleCreateStory = async () => {
        if (!user || selectedCharacters.length === 0) return;

        setIsGenerating(true);
        try {
            const story = await AIService.generateStory(user.name, selectedCharacters);
            setStory(story);
            router.push("/story/read");
        } catch (error) {
            console.error("Failed to generate story:", error);
            // TODO: Show error toast
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center max-w-3xl mx-auto w-full">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="mr-2">
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-bold text-slate-800">Hikaye Oluştur</h1>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-4 max-w-3xl mx-auto w-full pb-24">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Karakterlerini Seç</h2>
                    <p className="text-slate-500 text-sm">
                        Hikayende kimler olsun istersin? (En fazla 3 tane)
                    </p>
                </div>

                <CharacterSelector
                    selectedCharacters={selectedCharacters}
                    onToggle={handleToggleCharacter}
                />
            </main>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-600">
                        {selectedCharacters.length} / 3 Seçildi
                    </div>

                    <Button
                        onClick={handleCreateStory}
                        disabled={selectedCharacters.length === 0 || isGenerating}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md rounded-xl px-8 h-12"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Yazılıyor...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Hikayeyi Yaz
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
