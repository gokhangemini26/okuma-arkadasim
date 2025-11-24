"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useStore } from "@/lib/store";

export default function Home() {
    const [name, setName] = useState("");
    const [isReturningUser, setIsReturningUser] = useState(false);
    const [foundProfile, setFoundProfile] = useState<string | null>(null); // Name of found profile

    const router = useRouter();
    const login = useStore((state) => state.login);
    const logout = useStore((state) => state.logout);
    const user = useStore((state) => state.user);
    const savedUsers = useStore((state) => state.savedUsers);

    // Check for returning user on mount
    useEffect(() => {
        if (user) {
            setIsReturningUser(true);
        }
    }, [user]);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) return;

        // Check if this user exists in saved history
        if (savedUsers[trimmedName]) {
            setFoundProfile(trimmedName);
        } else {
            // New user, login directly
            login(trimmedName, false);
            router.push("/dashboard");
        }
    };

    const handleConfirmProfile = (useExisting: boolean) => {
        if (!foundProfile) return;

        // useExisting = true -> Load old profile
        // useExisting = false -> Create new (overwrite)
        login(foundProfile, useExisting);
        router.push("/dashboard");
    };

    const handleContinueSession = () => {
        router.push("/dashboard");
    };

    const handleResetSession = () => {
        logout();
        setIsReturningUser(false);
        setName("");
        setFoundProfile(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-500 flex flex-col items-center justify-center p-4 overflow-hidden relative">

            {/* Background Characters */}
            <div className="absolute top-20 left-[-20px] w-40 h-40 md:w-64 md:h-64 animate-bounce duration-[3000ms]">
                <Image
                    src="/characters/landing-leo.png"
                    alt="Aslan Leo"
                    fill
                    className="object-contain -rotate-[30deg]"
                    priority
                />
            </div>
            <div className="absolute top-20 right-[-20px] w-40 h-40 md:w-64 md:h-64 animate-bounce duration-[3500ms]">
                <Image
                    src="/characters/landing-pamuk.png"
                    alt="Kedi Pamuk"
                    fill
                    className="object-contain rotate-[30deg]"
                    priority
                />
            </div>

            <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-8 text-center relative z-10 mt-32">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        Okuma Arkadaşım
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">
                        Yapay zeka ile kendi hikayeni yarat, oku ve eğlen!
                    </p>
                </div>

                <div className="relative py-10 animate-bounce duration-[3000ms]">
                    <div className="relative z-10 bg-white px-12 py-8 rounded-[3rem] shadow-xl border-4 border-sky-100 flex items-center justify-center transform hover:scale-105 transition-transform">
                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 drop-shadow-sm">
                            Okuma Zamanı
                        </span>

                        {/* Cloud Bumps */}
                        <div className="absolute -top-6 -left-4 w-20 h-20 bg-white rounded-full z-[-1] border-t-4 border-l-4 border-sky-100"></div>
                        <div className="absolute -top-10 left-10 w-24 h-24 bg-white rounded-full z-[-1] border-t-4 border-sky-100"></div>
                        <div className="absolute -top-4 right-8 w-20 h-20 bg-white rounded-full z-[-1] border-t-4 border-r-4 border-sky-100"></div>
                        <div className="absolute -bottom-6 right-4 w-24 h-24 bg-white rounded-full z-[-1] border-b-4 border-r-4 border-sky-100"></div>
                        <div className="absolute -bottom-4 left-8 w-16 h-16 bg-white rounded-full z-[-1] border-b-4 border-l-4 border-sky-100"></div>
                    </div>
                </div>

                {/* 1. Returning Session (Already Logged In) */}
                {isReturningUser && user && !foundProfile && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100">
                            <p className="text-blue-800 font-medium text-lg">
                                Tekrar hoşgeldin, <span className="font-bold">{user.name}</span>! 👋
                            </p>
                            <p className="text-blue-600 text-sm mt-1">
                                Kaldığın yerden devam etmek ister misin?
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={handleResetSession}
                                variant="outline"
                                className="h-14 text-lg font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-2xl"
                            >
                                Hayır, Çıkış Yap
                            </Button>
                            <Button
                                onClick={handleContinueSession}
                                className="h-14 text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 shadow-lg shadow-green-200 rounded-2xl"
                            >
                                Evet, Devam Et
                            </Button>
                        </div>
                    </div>
                )}

                {/* 2. Found Existing Profile (During Login) */}
                {foundProfile && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-100">
                            <p className="text-amber-800 font-medium text-lg">
                                <span className="font-bold">{foundProfile}</span> isminde eski bir kayıt buldum! 🕵️‍♂️
                            </p>
                            <p className="text-amber-600 text-sm mt-1">
                                Eski puanlarınla devam etmek ister misin?
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => handleConfirmProfile(false)}
                                variant="outline"
                                className="h-14 text-sm font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-2xl whitespace-normal leading-tight"
                            >
                                Hayır, Sıfırdan Başla
                            </Button>
                            <Button
                                onClick={() => handleConfirmProfile(true)}
                                className="h-14 text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-200 rounded-2xl whitespace-normal leading-tight"
                            >
                                Evet, Eski Hesabı Aç
                            </Button>
                        </div>
                    </div>
                )}

                {/* 3. Login Form (Default) */}
                {!isReturningUser && !foundProfile && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="Adın ne?"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-14 text-lg text-center rounded-2xl border-2 border-purple-100 focus:border-purple-400 focus:ring-purple-200 bg-white/80"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-14 text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 shadow-xl shadow-orange-200 transform hover:scale-105 transition-all duration-300 rounded-2xl"
                        >
                            Hadi Başlayalım! 🚀
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
