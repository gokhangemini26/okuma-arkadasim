"use client";

import Image from "next/image";
import { Character, AVAILABLE_CHARACTERS } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharacterSelectorProps {
    selectedCharacters: Character[];
    onToggle: (character: Character) => void;
}

export function CharacterSelector({ selectedCharacters, onToggle }: CharacterSelectorProps) {
    const isSelected = (id: string) => selectedCharacters.some(c => c.id === id);
    const isMaxSelected = selectedCharacters.length >= 3;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
            {AVAILABLE_CHARACTERS.map((character) => {
                const selected = isSelected(character.id);
                const disabled = !selected && isMaxSelected;

                return (
                    <Card
                        key={character.id}
                        className={cn(
                            "cursor-pointer transition-all duration-200 relative overflow-hidden border-2",
                            selected
                                ? "border-green-500 bg-green-50 shadow-md scale-95"
                                : "border-slate-200 hover:border-blue-300 hover:shadow-sm",
                            disabled && "opacity-50 grayscale cursor-not-allowed"
                        )}
                        onClick={() => !disabled && onToggle(character)}
                    >
                        <CardContent className="p-3 flex flex-col items-center">
                            <div className="relative w-24 h-24 mb-2">
                                <Image
                                    src={character.imagePath}
                                    alt={character.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100px, 150px"
                                />
                            </div>
                            <span className={cn(
                                "font-bold text-sm text-center",
                                selected ? "text-green-700" : "text-slate-700"
                            )}>
                                {character.name}
                            </span>

                            {selected && (
                                <div className="absolute top-2 right-2">
                                    <CheckCircle2 className="w-6 h-6 text-green-500 fill-white" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
