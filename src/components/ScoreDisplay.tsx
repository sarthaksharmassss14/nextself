"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import confetti from "canvas-confetti";

interface ScoreDisplayProps {
    score: number;
    summary: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, summary }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const controls = useAnimation();

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

    return (
        <div className="flex flex-col items-center gap-6 py-10">
            <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-white/5"
                    />
                    <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="transparent"
                        stroke="url(#score-gradient)"
                        strokeWidth="12"
                        strokeDasharray={552}
                        initial={{ strokeDashoffset: 552 }}
                        animate={{ strokeDashoffset: 552 - (552 * score) / 100 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                    <defs>
                        <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-6xl font-black gradient-text tracking-tighter">
                        {displayScore}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-semibold">
                        Score
                    </span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center max-w-sm"
            >
                <h2 className="text-2xl font-bold mb-2">{summary}</h2>
                <p className="text-white/60 text-sm">
                    Based on AI analysis of facial symmetry, grooming, and presentation.
                </p>
            </motion.div>
        </div>
    );
};
