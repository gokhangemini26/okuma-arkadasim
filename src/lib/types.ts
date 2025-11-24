export interface Character {
    id: string;
    name: string;
    imagePath: string;
}

export interface Story {
    id: string;
    title: string;
    content: string;
    characters: Character[];
    theme: string;
    createdAt: Date;
}

export interface ReadingSession {
    id: string;
    storyId: string;
    audioUrl?: string;
    durationSeconds: number;
    wordCount: number;
    wpm: number;
    accuracyScore?: number; // 0-100
    feedback?: string;
    createdAt: Date;
}

export interface Reward {
    id: string;
    imageUrl: string;
    unlockedAt: Date;
    storyTitle: string;
}

export interface UserProfile {
    id: string;
    name: string;
    totalReadings: number;
    averageWpm: number;
    rewards: Reward[];
    history: ReadingSession[];
}

export const AVAILABLE_CHARACTERS: Character[] = [
    { id: '1', name: 'Aslan Leo', imagePath: '/characters/Aslan Leo.png' },
    { id: '2', name: 'Baykus Bibo', imagePath: '/characters/Baykus Bibo.png' },
    { id: '3', name: 'Geyik Pampa', imagePath: '/characters/Geyik Pampa.png' },
    { id: '4', name: 'Kedi Pamuk', imagePath: '/characters/Kedi Pamuk.png' },
    { id: '5', name: 'Kopek Akita', imagePath: '/characters/Kopek Akita.png' },
    { id: '6', name: 'Midilli Pika', imagePath: '/characters/Midilli Pika.png' },
    { id: '7', name: 'Penguen Poni', imagePath: '/characters/Penguen Poni.png' },
    { id: '8', name: 'Rakun Riki', imagePath: '/characters/Rakun Riki.png' },
    { id: '9', name: 'Sincap Biva', imagePath: '/characters/Sincap Biva.png' },
    { id: '10', name: 'Zurafa Zipi', imagePath: '/characters/Zurafa Zipi.png' },
];
