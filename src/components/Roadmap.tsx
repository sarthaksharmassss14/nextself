"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Lightbulb } from "lucide-react";

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
                        className="glass p-5 rounded-2xl flex gap-5 group hover:border-primary/50 transition-colors"
                    >
                        <div className="flex flex-col items-center pt-1">
                            <div className="w-6 h-6 rounded-full border-2 border-primary/50 flex items-center justify-center text-[10px] font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                {index + 1}
                            </div>
                            {index !== steps.length - 1 && (
                                <div className="w-px h-full bg-white/10 mt-2" />
                            )}
                        </div>
                        <div className="pb-2">
                            <h4 className="text-lg font-semibold text-white/90 mb-1 group-hover:text-primary transition-colors">
                                {step.category}
                            </h4>
                            <p className="text-white/60 text-sm leading-relaxed">
                                {step.suggestion}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="p-6 rounded-3xl bg-primary/10 border border-primary/20 text-center"
            >
                <p className="text-sm font-medium text-primary-light flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Follow this roadmap for 30 days to see visible results.
                </p>
            </motion.div>
        </div>
    );
};
