"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadingSession } from "@/lib/types";

interface ProgressChartProps {
    history: ReadingSession[];
}

export function ProgressChart({ history }: ProgressChartProps) {
    // Format data for the chart, reversing to show oldest to newest
    const data = [...history].reverse().map((session, index) => ({
        name: index + 1, // Session number
        wpm: session.wpm,
        date: new Date(session.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    }));

    if (data.length < 2) {
        return (
            <Card className="border-none shadow-sm bg-white h-full flex items-center justify-center p-6">
                <p className="text-slate-400 text-center">
                    Grafik için en az 2 okuma yapmalısın.
                </p>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-800">Gelişim Grafiği</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="wpm"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
