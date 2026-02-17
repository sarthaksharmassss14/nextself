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

const CircularProgress = ({ size, strokeWidth, percentage, icon: Icon, label, isMain }: any) => {
    const [displayVal, setDisplayVal] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Dynamic Color Logic
    const getColor = (val: number) => {
        if (isMain) return "url(#main-score-gradient)";
        if (val < 50) return "#ef4444"; // Red
        if (val < 75) return "#fbbf24"; // Yellow
        return "#22c55e"; // Neon Green
    };

    const color = getColor(percentage || 0);
    const displayColor = getColor(displayVal);

    useEffect(() => {
        let start = 0;
        const end = percentage || 0;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setDisplayVal(end);
                clearInterval(timer);
            } else {
                setDisplayVal(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [percentage]);

    const offset = circumference - (displayVal / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-4 relative group">
            {/* Dynamic Glow Effect */}
            <div
                className="absolute inset-0 blur-[40px] opacity-20 rounded-full transition-all duration-700 group-hover:opacity-40"
                style={{ backgroundColor: displayColor.includes('url') ? '#8b5cf6' : displayColor }}
            />

            <div className="relative glass p-5 rounded-[36px] border border-white/10 backdrop-blur-md shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-white/20">
                <div className="relative" style={{ width: size, height: size }}>
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke="rgba(255,255,255,0.03)"
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
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 8px ${displayColor.includes('url') ? '#a78bfa' : displayColor}aa)` }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-black text-white tracking-tighter">{displayVal}</span>
                    </div>
                </div>
            </div>
            <span className="text-[12px] uppercase tracking-[0.25em] font-extrabold text-white/40 text-center whitespace-nowrap mt-3">{label}</span>
        </div>
    );
};

const Typewriter = ({ text, delay = 25 }: { text: string; delay?: number }) => {
    const [currentText, setCurrentText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText((prevText) => prevText + text[currentIndex]);
                setCurrentIndex((prevIndex) => prevIndex + 1);
            }, delay);

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, delay, text]);

    return <span>{currentText}</span>;
};

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, summary, detailedScores }) => {
    useEffect(() => {
        if (score > 70) {
            const timer = setTimeout(() => {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ["#6366f1", "#8b5cf6", "#3b82f6"],
                });
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [score]);

    const metrics = [
        { label: "Overall", value: score, icon: Sparkles, isMain: true },
        { label: "Jawline", value: detailedScores?.jawline, icon: Shield },
        { label: "Skin", value: detailedScores?.skin, icon: Sparkles },
        { label: "Masculinity", value: detailedScores?.masculinity, icon: User },
        { label: "Cheekbones", value: detailedScores?.cheekbones, icon: Zap },
        { label: "Hair", value: detailedScores?.hair, icon: Scissors },
    ];

    const size = 130;
    const strokeWidth = 10;

    return (
        <div className="flex flex-col items-center gap-16 py-10 w-full">
            <div className="flex flex-wrap justify-center gap-10 md:gap-14 w-full max-w-6xl px-4">
                <defs className="absolute">
                    <svg width="0" height="0">
                        <linearGradient id="main-score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="50%" stopColor="#93c5fd" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </svg>
                </defs>

                {metrics.map((m, i) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex-shrink-0"
                    >
                        <CircularProgress
                            size={size}
                            strokeWidth={strokeWidth}
                            percentage={m.value}
                            icon={m.icon}
                            label={m.label}
                            isMain={m.isMain}
                        />
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-center w-full max-w-4xl bg-white/[0.03] backdrop-blur-md p-10 rounded-[48px] border border-white/10 mt-4 shadow-2xl"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 group hover:bg-white/10 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">AI VERDICT</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tight leading-tight min-h-[4rem] text-white/90">
                    <Typewriter text={summary} />
                </h2>
                <p className="text-white/40 text-sm md:text-base leading-relaxed font-medium max-w-2xl mx-auto">
                    Our AI-driven NextSelf Engine analyzed your unique features across 2,400+ data points. Your structural harmony and grooming standards are visualized above.
                </p>
            </motion.div>
        </div>
    );
};
