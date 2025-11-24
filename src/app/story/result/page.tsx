"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AIService } from "@/lib/ai-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Star, Award, RefreshCw, Download, Printer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ResultPage() {
    const { user, currentStory } = useStore();
    const router = useRouter();
    const [rewardImage, setRewardImage] = useState<string | null>(null);

    const lastSession = user?.history[0];

    useEffect(() => {
        if (!user || !currentStory || !lastSession) {
            router.push("/dashboard");
            return;
        }

        // Generate reward if performance is good (mock logic: always generate for now)
        const generateReward = async () => {
            const image = await AIService.generateRewardImage(currentStory);
            setRewardImage(image);
        };

        generateReward();
    }, [user, currentStory, lastSession, router]);

    const handleDownload = async () => {
        if (!rewardImage) return;
        try {
            const response = await fetch(rewardImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `boyama-sayfasi-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed", error);
            window.open(rewardImage, '_blank');
        }
    };

    const handlePrint = () => {
        if (!rewardImage) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Yazdır - Okuma Arkadaşım</title></head>
                    <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
                        <img src="${rewardImage}" style="max-width:100%; max-height:100%;" onload="window.print();" />
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    if (!lastSession) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 pb-24">
            <div className="max-w-md mx-auto space-y-6">
                {/* Success Header */}
                <div className="text-center space-y-2 pt-8">
                    <div className="inline-block bg-green-100 p-4 rounded-full mb-4 animate-bounce">
                        <Award className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-green-800">Harika İş!</h1>
                    <p className="text-green-600 font-medium">Hikayeyi başarıyla tamamladın.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="border-green-200 bg-white shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-slate-800">{lastSession.wpm}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Hız (Kelime/Dk)</div>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-white shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-slate-800">%{lastSession.accuracyScore}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Doğruluk</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Feedback */}
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader>
                        <CardTitle className="text-lg text-blue-900 flex items-center">
                            <Star className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
                            Yapay Zeka Yorumu
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-blue-800 leading-relaxed">
                            {lastSession.feedback}
                        </p>
                    </CardContent>
                </Card>

                {/* Reward Image */}
                {rewardImage && (
                    <Card className="overflow-hidden border-2 border-amber-200 shadow-lg">
                        <CardHeader className="bg-amber-50 border-b border-amber-100 py-3">
                            <CardTitle className="text-center text-amber-800 text-base">
                                🎁 Boyama Sayfan Hazır!
                            </CardTitle>
                        </CardHeader>
                        <div className="relative aspect-[3/4] w-full bg-white">
                            <Image
                                src={rewardImage}
                                alt="Reward"
                                fill
                                className="object-contain p-2"
                                unoptimized
                            />
                        </div>
                        <div className="flex border-t border-amber-100 divide-x divide-amber-100">
                            <button
                                onClick={handlePrint}
                                className="flex-1 py-3 flex items-center justify-center text-amber-700 hover:bg-amber-50 transition-colors font-medium text-sm"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Yazdır
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex-1 py-3 flex items-center justify-center text-amber-700 hover:bg-amber-50 transition-colors font-medium text-sm"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                İndir
                            </button>
                        </div>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Link href="/dashboard" className="flex-1">
                        <Button variant="outline" className="w-full h-12 border-slate-300 text-slate-600 hover:bg-slate-50">
                            <Home className="mr-2 w-4 h-4" />
                            Ana Sayfa
                        </Button>
                    </Link>
                    <Link href="/story/setup" className="flex-1">
                        <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white shadow-green-200 shadow-lg">
                            <RefreshCw className="mr-2 w-4 h-4" />
                            Yeni Hikaye
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
