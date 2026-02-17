"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Shield, Sparkles, User, Scissors, Zap } from "lucide-react";

interface ScoreDisplayProps {
    score: number;
    summary: string;
    detailedScores?: {
        jawline: number;
        skin: number;
        masculinity: number;
        cheekbones: number;
        hair: number;
    };
}

const CircularProgress = ({ size, strokeWidth, percentage, color, icon: Icon, label }: any) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={strokeWidth}
                    />
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <Icon size={size * 0.2} style={{ color }} className="mb-0.5 opacity-80" />
                    <span className="text-lg font-black" style={{ color }}>{percentage}</span>
                </div>
            </div>
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-white/40 text-center">{label}</span>
        </div>
    );
};

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, summary, detailedScores }) => {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = score;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setDisplayScore(end);
                clearInterval(timer);
                if (end > 70) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ["#6366f1", "#8b5cf6", "#ec4899"],
                    });
                }
            } else {
                setDisplayScore(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [score]);

    const metrics = [
        { label: "Overall", value: score, icon: Sparkles, color: "url(#main-score-gradient)", isMain: true },
        { label: "Jawline", value: detailedScores?.jawline || 0, icon: Shield, color: "#818cf8" },
        { label: "Skin", value: detailedScores?.skin || 0, icon: Sparkles, color: "#f472b6" },
        { label: "Masculinity", value: detailedScores?.masculinity || 0, icon: User, color: "#a78bfa" },
        { label: "Cheekbones", value: detailedScores?.cheekbones || 0, icon: Zap, color: "#fbbf24" },
        { label: "Hair", value: detailedScores?.hair || 0, icon: Scissors, color: "#34d399" },
    ];

    const size = 140; // Unified size for all circles
    const strokeWidth = 10;

    return (
        <div className="flex flex-col items-center gap-12 py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 w-full justify-items-center">
                <defs className="absolute">
                    <svg width="0" height="0">
                        <linearGradient id="main-score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="50%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </svg>
                </defs>

                {metrics.map((m, i) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                    >
                        <CircularProgress
                            size={size}
                            strokeWidth={strokeWidth}
                            percentage={m.isMain ? displayScore : m.value}
                            color={m.color}
                            icon={m.icon}
                            label={m.label}
                        />
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-center w-full max-w-4xl bg-white/[0.03] backdrop-blur-md p-8 rounded-[40px] border border-white/10 mt-4"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 group hover:bg-white/10 transition-colors">
                    <Sparkles size={14} className="text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">AI VERDICT</span>
                </div>
                <h2 className="text-3xl font-black mb-4 tracking-tight">{summary}</h2>
                <p className="text-white/50 text-base leading-relaxed font-medium">
                    Our AI-driven NextSelf Engine analyzed your unique features across 2,400+ data points. Your structural harmony and grooming standards are visualized above.
                </p>
            </motion.div>
        </div>
    );
};
