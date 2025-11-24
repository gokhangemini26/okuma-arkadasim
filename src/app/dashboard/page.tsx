"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, Trophy, History, BarChart3, Gift } from "lucide-react";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import Image from "next/image";

export default function DashboardPage() {
    const user = useStore((state) => state.user);
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 pt-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Merhaba, {user.name}! 👋</h1>
                    <p className="text-slate-500">Bugün okumaya hazır mısın?</p>
                </div>
                <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            {/* Main Action */}
            <Link href="/story/setup" className="block mb-8">
                <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none shadow-lg shadow-indigo-200 transform transition-all active:scale-95">
                    <CardContent className="p-6 flex items-center justify-between text-white">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Yeni Hikaye</h2>
                            <p className="text-indigo-100">Karakterlerini seç ve oku!</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-full">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                    </CardContent>
                </Card>
            </Link>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="bg-orange-100 p-2 rounded-full mb-2">
                            <BookOpen className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">{user.totalReadings}</span>
                        <span className="text-xs text-slate-500">Okunan Hikaye</span>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="bg-green-100 p-2 rounded-full mb-2">
                            <Trophy className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">{user.averageWpm}</span>
                        <span className="text-xs text-slate-500">Ortalama Hız (dk/kelime)</span>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for History, Analytics */}
            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="history">Geçmiş</TabsTrigger>
                    <TabsTrigger value="analytics">Analiz</TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="space-y-3">
                    {user.history.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed">
                            Henüz hiç hikaye okumadın.
                        </div>
                    ) : (
                        user.history.map((session) => (
                            <Card key={session.id} className="border-none shadow-sm bg-white">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                        <div className="font-medium text-slate-900">Hikaye Okuması</div>
                                        <div className="text-xs text-slate-500">
                                            {new Date(session.createdAt).toLocaleDateString('tr-TR')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">{session.wpm} Hız</div>
                                        <div className="text-xs text-slate-500">{session.accuracyScore}% Doğruluk</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="analytics">
                    <ProgressChart history={user.history} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
