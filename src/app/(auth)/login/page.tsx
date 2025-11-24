"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { User, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [name, setName] = useState("");
    const router = useRouter();
    const login = useStore((state) => state.login);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        // Login with the entered name
        login(name);

        router.push("/dashboard");
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-full p-4 bg-gradient-to-b from-blue-50 to-white">
            <Card className="w-full max-w-md border-2 border-blue-100 shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-2">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-blue-900">Giriş Yap</CardTitle>
                    <CardDescription className="text-blue-600">
                        İsmini yaz ve maceraya başla!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="Senin Adın Ne?"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-14 text-lg text-center border-blue-200 focus-visible:ring-blue-400 rounded-xl"
                                autoFocus
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg rounded-xl bg-blue-500 hover:bg-blue-600 shadow-md transition-all hover:shadow-lg"
                            disabled={!name.trim()}
                        >
                            Başla
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
