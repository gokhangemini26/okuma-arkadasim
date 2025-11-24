"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob, duration: number) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startTimeRef = useRef<number>(0);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                // Calculate duration from start time
                const finalDuration = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
                onRecordingComplete(blob, finalDuration);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Start timer
            startTimeRef.current = Date.now();
            timerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Mikrofon erişimi sağlanamadı. Lütfen izinleri kontrol edin.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {isRecording && (
                <div className="text-2xl font-mono font-bold text-red-500 animate-pulse">
                    {formatTime(duration)}
                </div>
            )}

            <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                    "rounded-full w-20 h-20 shadow-xl transition-all duration-300",
                    isRecording
                        ? "bg-white border-4 border-red-500 hover:bg-red-50 hover:scale-105"
                        : "bg-red-500 hover:bg-red-600 hover:scale-110 text-white shadow-red-200"
                )}
            >
                {isRecording ? (
                    <Square className="w-8 h-8 text-red-500 fill-red-500" />
                ) : (
                    <Mic className="w-10 h-10" />
                )}
            </Button>

            <p className="text-sm text-slate-500 font-medium">
                {isRecording ? "Okumayı bitirince bas" : "Okumaya başlamak için bas"}
            </p>
        </div>
    );
}
