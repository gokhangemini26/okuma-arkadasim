import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile, Story, Character, ReadingSession } from './types';

interface AppState {
    user: UserProfile | null;
    savedUsers: Record<string, UserProfile>;
    currentStory: Story | null;
    selectedCharacters: Character[];
    isRecording: boolean;

    // Actions
    login: (name: string, loadExisting?: boolean) => void;
    logout: () => void;
    setCharacters: (characters: Character[]) => void;
    setStory: (story: Story) => void;
    setRecording: (isRecording: boolean) => void;
    addReadingSession: (session: ReadingSession) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            user: null,
            savedUsers: {}, // Initialize empty
            currentStory: null,
            selectedCharacters: [],
            isRecording: false,

            login: (name, loadExisting = false) => set((state) => {
                const normalizedName = name.trim();

                // If loading existing and it exists in savedUsers
                if (loadExisting && state.savedUsers[normalizedName]) {
                    return { user: state.savedUsers[normalizedName] };
                }

                // Otherwise create new profile (or overwrite if force new)
                const newUser: UserProfile = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: normalizedName,
                    totalReadings: 0,
                    averageWpm: 0,
                    rewards: [],
                    history: []
                };

                return {
                    user: newUser,
                    // Update savedUsers with the new user immediately
                    savedUsers: {
                        ...state.savedUsers,
                        [normalizedName]: newUser
                    }
                };
            }),

            logout: () => set({ user: null }),

            setCharacters: (characters) => set({ selectedCharacters: characters }),

            setStory: (story) => set({ currentStory: story }),

            setRecording: (isRecording) => set({ isRecording }),

            addReadingSession: (session) => set((state) => {
                if (!state.user) return {};

                const newHistory = [session, ...state.user.history];
                const totalReadings = newHistory.length;
                const averageWpm = Math.round(
                    newHistory.reduce((acc, curr) => acc + curr.wpm, 0) / totalReadings
                );

                const updatedUser = {
                    ...state.user,
                    history: newHistory,
                    totalReadings,
                    averageWpm
                };

                return {
                    user: updatedUser,
                    // Sync to savedUsers
                    savedUsers: {
                        ...state.savedUsers,
                        [updatedUser.name]: updatedUser
                    }
                };
            }),
        }),
        {
            name: 'okuma-arkadasim-storage', // unique name for storage
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                savedUsers: state.savedUsers
            }),
        }
    )
);
