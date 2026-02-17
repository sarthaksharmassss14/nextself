"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Lightbulb, RefreshCw } from "lucide-react";

interface RoadmapStep {
    category: string;
    suggestion: string;
}

interface RoadmapProps {
    steps: RoadmapStep[];
}

export const Roadmap: React.FC<RoadmapProps> = ({ steps }) => {
    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20">
                    <Lightbulb className="text-white w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold">Transformation Roadmap</h3>
            </div>

            <div className="space-y-4">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass p-6 rounded-[32px] border border-white/5 backdrop-blur-md flex gap-6 group hover:border-primary/40 hover:bg-white/[0.05] transition-all cursor-default"
                    >
                        <div className="flex flex-col items-center pt-1">
                            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-white group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-xl">
                                {index + 1}
                            </div>
                            {index !== steps.length - 1 && (
                                <div className="w-px h-full bg-gradient-to-b from-white/10 to-transparent mt-3" />
                            )}
                        </div>
                        <div className="pb-2">
                            <h4 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2 group-hover:from-primary-light group-hover:to-primary transition-all">
                                {step.category}
                            </h4>
                            <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/60 transition-colors font-medium">
                                {step.suggestion}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 text-center backdrop-blur-sm"
            >
                <p className="text-xs font-black text-white/40 uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                    <RefreshCw size={14} className="animate-spin-slow" /> Follow this roadmap for 30 days to see visible results.
                </p>
            </motion.div>
        </div>
    );
};
