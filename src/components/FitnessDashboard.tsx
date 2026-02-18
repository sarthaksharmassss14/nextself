"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dumbbell,
    TrendingUp,
    Scale,
    Flame,
    Plus,
    Camera,
    ChevronRight,
    Target,
    Activity,
    Calendar,
    Zap,
    User,
    ArrowRight,
    Utensils,
    Edit3,
    Check,
    X,
    Clock,
    ZapOff,
    History,
    Shield
} from "lucide-react";

interface UserBio {
    gender: string;
    age: number;
    height: number;
    weight: number;
    activity: string;
    goal: string;
    photo: File | null;
}

interface PlanItem {
    id: string;
    title: string;
    description: string;
}

interface FitnessPlan {
    diet: PlanItem[];
    workout: PlanItem[];
}

export const FitnessDashboard: React.FC = () => {
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [bio, setBio] = useState<UserBio>({
        gender: "Male",
        age: 25,
        height: 175,
        weight: 75,
        activity: "Moderate",
        goal: "Muscle Gain",
        photo: null
    });

    const [plan, setPlan] = useState<FitnessPlan | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'roadmap' | 'diet'>('overview');

    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Persistence: Load from localStorage on mount
    React.useEffect(() => {
        const savedData = localStorage.getItem('fitness_tracker_data');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setBio(prev => ({ ...prev, ...parsed.bio }));
            if (parsed.plan) setPlan(parsed.plan);
            if (parsed.isOnboarded) setIsOnboarded(true);
        }
    }, []);

    const generatePlan = async () => {
        if (!bio.photo) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            // High-Performance Image Resizer (Client Side)
            const resizeImage = (file: File): Promise<Blob> => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            const max = 800; // Reduced for even better reliability
                            if (width > height) {
                                if (width > max) {
                                    height *= max / width;
                                    width = max;
                                }
                            } else {
                                if (height > max) {
                                    width *= max / height;
                                    height = max;
                                }
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
                        };
                        img.src = e.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                });
            };

            const resizedBlob = await resizeImage(bio.photo);
            const formData = new FormData();
            formData.append("image", resizedBlob, "profile.jpg");
            formData.append("bio", JSON.stringify(bio));

            const response = await fetch("/api/fitness", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            // AI Vision Fallback Logic
            let finalDiet = data.dietary_recommendations;
            let finalWorkout = data.workout_items;

            if (!response.ok) {
                console.warn("AI Vision busy, falling back to data-driven logic");
                // Generate high-quality fallback plan based on goal if vision fails
                if (bio.goal === "Fix Posture") {
                    finalDiet = [
                        { title: "Anti-Inflammatory Breakfast", description: "Turmeric ginger oats with walnuts and chia seeds." },
                        { title: "High Magnesium Lunch", description: "Spinach and kale salad with pumpkin seeds and chicken." },
                        { title: "Core Support Snack", description: "Bone broth or collagen-rich smoothie." },
                        { title: "Recovery Dinner", description: "Rich fatty fish (Mackerel/Salmon) with asparagus." }
                    ];
                    finalWorkout = [
                        { title: "Thoracic Opening", description: "Wall slides and foam rolling thoracic spine (3x15)." },
                        { title: "Scapular Retraction", description: "Face pulls and Band Pull-aparts (3x20)." },
                        { title: "Posterior Chain", description: "Bird-dog and Deadbugs for pelvic stability." },
                        { title: "Deep Neck Flexors", description: "Chin tucks to counteract forward head posture." }
                    ];
                } else if (bio.goal === "Fat Loss") {
                    finalDiet = [
                        { title: "Calorie Deficit Breakfast", description: "Egg white scramble with lots of veggies." },
                        { title: "Metabolic Lunch", description: "Large mixed green salad with lean protein (Tuna/Turkey)." },
                        { title: "Fiber Snack", description: "Greek yogurt with berries or a handful of almonds." },
                        { title: "Light Dinner", description: "Grilled white fish with steamed zucchini and broccoli." }
                    ];
                    finalWorkout = [
                        { title: "High Intensity Cardio", description: "15 min HIIT circuit (Burpees, Mountain Climbers)." },
                        { title: "Functional Strength", description: "Full body kettlebell or dumbbell circuit (3x15)." },
                        { title: "Core Blast", description: "Plank variations and Russian twists." },
                        { title: "NEAT Walk", description: "30 min brisk walk after the final meal." }
                    ];
                }
            }

            const generatedPlan: FitnessPlan = {
                diet: finalDiet?.map((d: any, i: number) => ({
                    id: `d${i}`,
                    title: d.title || "Meal Suggestion",
                    description: d.description || d
                })) || [
                        { id: 'd1', title: "High Protein Breakfast", description: "3 whole eggs, 1/2 cup oats with blueberries." },
                        { id: 'd2', title: "Balanced Lunch", description: "150g grilled chicken, 1 cup brown rice, steamed broccoli." },
                        { id: 'd3', title: "Post-Workout Snack", description: "Protein shake with 1 banana." },
                        { id: 'd4', title: "Lean Dinner", description: "Grilled Salmon with a large green salad." }
                    ],
                workout: finalWorkout?.map((w: any, i: number) => ({
                    id: `w${i}`,
                    title: w.title || "Exercise",
                    description: w.description || w
                })) || [
                        { id: 'w1', title: "Dynamic Warmup", description: "5 min jumping jacks + shoulder rotations." },
                        { id: 'w2', title: "Compound Lift", description: "Back Squats 3x10 (Progressive Overload)." },
                        { id: 'w3', title: "Accessory Work", description: "Lat Pulldowns + Face Pulls 3x12." },
                        { id: 'w4', title: "Core Finisher", description: "3 min plank circuit." }
                    ]
            };

            setPlan(generatedPlan);
            setIsAnalyzing(false);
            setStep(4);
        } catch (err: any) {
            console.error("Analysis Error:", err);
            // Universal Fallback: Provide a high-quality baseline plan so the user is never stuck
            const baselinePlan: FitnessPlan = {
                diet: [
                    { id: 'd1', title: "Metabolic Breakfast", description: "Oats with nuts and seasonal fruit." },
                    { id: 'd2', title: "Neural Fuel Lunch", description: "Lean protein with complex carbs and greens." },
                    { id: 'd3', title: "Energy Snack", description: "Mixed nuts or a piece of dark chocolate." },
                    { id: 'd4', title: "Recovery Dinner", description: "Light protein with roasted vegetables." }
                ],
                workout: [
                    { id: 'w1', title: "Neural Warmup", description: "5 min mobility and dynamic stretching." },
                    { id: 'w2', title: "Strength Pillar", description: "Pushups, Squats, and Lunges (3x12)." },
                    { id: 'w3', title: "Core Integration", description: "Plank and Deadbugs (3x45s)." },
                    { id: 'w4', title: "Vagal Tone Walk", description: "15 min brisk walk for nervous system recovery." }
                ]
            };
            setPlan(baselinePlan);
            setIsAnalyzing(false);
            setStep(4);
        }
    };

    const handleOnboardingComplete = () => {
        setIsOnboarded(true);
        setActiveTab('overview');

        // Persist data (excluding the File object)
        const dataToSave = {
            bio: { ...bio, photo: null },
            plan,
            isOnboarded: true
        };
        localStorage.setItem('fitness_tracker_data', JSON.stringify(dataToSave));
    };

    const updatePlanItem = (type: 'diet' | 'workout', id: string, newTitle: string, newDesc: string) => {
        if (!plan) return;
        const newPlan = { ...plan };
        const items = type === 'diet' ? newPlan.diet : newPlan.workout;
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], title: newTitle, description: newDesc };
            setPlan(newPlan);
        }
    };

    if (!isOnboarded) {
        return (
            <div className={`w-full ${step === 4 ? 'max-w-none px-4 md:px-20' : 'max-w-2xl px-4'} mx-auto py-10 transition-all duration-700`}>
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass p-12 rounded-[48px] border-white/10 space-y-8"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
                                    <User className="text-white" />
                                </div>
                                <h3 className="text-3xl font-black">Bio Profile</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/30">Age</label>
                                    <input
                                        type="number"
                                        value={bio.age}
                                        onChange={(e) => setBio({ ...bio, age: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/30">Gender</label>
                                    <div className="relative">
                                        <select
                                            value={bio.gender}
                                            onChange={(e) => setBio({ ...bio, gender: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                            style={{ backgroundColor: '#1a1a1a', color: 'white' }}
                                        >
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Male</option>
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Female</option>
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Non-binary</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/30">Height (cm)</label>
                                    <input
                                        type="number"
                                        value={bio.height}
                                        onChange={(e) => setBio({ ...bio, height: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/30">Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={bio.weight}
                                        onChange={(e) => setBio({ ...bio, weight: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/30">Primary Goal</label>
                                    <div className="relative">
                                        <select
                                            value={bio.goal}
                                            onChange={(e) => setBio({ ...bio, goal: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                            style={{ backgroundColor: '#1a1a1a', color: 'white' }}
                                        >
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Fix Posture</option>
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Muscle Gain</option>
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Fat Loss</option>
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Weight Maintenance</option>
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Athletic Performance</option>
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Flexibility & Mobility</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/30">Activity Level</label>
                                    <div className="relative">
                                        <select
                                            value={bio.activity}
                                            onChange={(e) => setBio({ ...bio, activity: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                            style={{ backgroundColor: '#1a1a1a', color: 'white' }}
                                        >
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Sedentary (Office job)</option>
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Lightly Active (1-2 days/week)</option>
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Moderate (3-5 days/week)</option>
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Very Active (6-7 days/week)</option>
                                            <option style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Extra Active (Athlete/Manual labor)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-5 rounded-2xl gradient-bg text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Next Step <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass p-12 rounded-[48px] border-white/10 space-y-8"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
                                    <Camera className="text-white" />
                                </div>
                                <h3 className="text-3xl font-black">Visual Scan</h3>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-64 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all group"
                            >
                                {bio.photo ? (
                                    <img src={URL.createObjectURL(bio.photo)} className="w-full h-full object-cover rounded-3xl" />
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Plus className="text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold">Upload Full Body Photo</p>
                                            <p className="text-white/30 text-xs">For posture and frame analysis</p>
                                        </div>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={(e) => setBio({ ...bio, photo: e.target.files?.[0] || null })}
                                />
                            </div>

                            <button
                                onClick={generatePlan}
                                disabled={!bio.photo || isAnalyzing}
                                className="w-full py-5 rounded-2xl gradient-bg text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                {isAnalyzing ? "AI Processing..." : "Generate AI Plan"} <Zap size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && isAnalyzing && (
                        <motion.div
                            key="loading"
                            className="flex flex-col items-center justify-center py-20 gap-12"
                        >
                            <div className="relative w-72 h-[450px] rounded-[40px] overflow-hidden glass border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)]">
                                {/* The user's photo being scanned */}
                                {bio.photo && (
                                    <img
                                        src={URL.createObjectURL(bio.photo)}
                                        className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
                                        alt="Scanning..."
                                    />
                                )}

                                {/* Digital Scanning Grid */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/20 animate-pulse" />

                                {/* Moving Scan Line */}
                                <motion.div
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                    className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_15px_#8b5cf6] z-20"
                                />

                                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                                    <div className="p-6 rounded-full bg-primary/20 border border-primary/30 animate-bounce">
                                        <Zap size={48} className="text-white fill-white shadow-xl" />
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-light animate-pulse">Scanning Bio-Signal</div>
                                </div>

                                {/* Frame Corners */}
                                <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-primary/50" />
                                <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-primary/50" />
                                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-primary/50" />
                                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-primary/50" />
                            </div>

                            <div className="text-center space-y-4">
                                <h3 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-primary-light to-white bg-clip-text text-transparent animate-gradient-x">
                                    Decoding Physical Metrics...
                                </h3>
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-white/30 text-xs font-black uppercase tracking-[0.4em]">Running Deep-Bio Analysis</p>
                                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                            className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary to-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && plan && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative w-full px-4 md:px-12"
                        >
                            {/* Neural Background Decor */}
                            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent rotate-12 animate-pulse" />
                                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent -rotate-12 animate-pulse delay-700" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
                            </div>

                            <div className="glass p-12 md:p-24 rounded-[80px] border-white/5 space-y-24 relative overflow-hidden backdrop-blur-3xl shadow-[0_0_150px_rgba(0,0,0,0.7)]">
                                {/* Cinematic Header */}
                                <div className="text-center relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] -z-10" />
                                    <h3 className="text-4xl md:text-5xl font-black mb-3 italic tracking-tighter tabular-nums">
                                        NEURAL <span className="text-primary">BLUEPRINT</span>
                                    </h3>
                                    <div className="flex items-center justify-center gap-4 text-white/30 text-[9px] md:text-[10px] font-black uppercase tracking-[0.6em]">
                                        <div className="h-px w-8 bg-white/10" />
                                        Optimization Sequence 01 • Bio-Metric Verified
                                        <div className="h-px w-8 bg-white/10" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 max-w-[1600px] mx-auto w-full">
                                    {/* Diet Section */}
                                    <div className="space-y-12 w-full">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 border-l-4 border-cyan-500 pl-8">
                                            <div className="space-y-2">
                                                <h4 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white italic leading-none">Fuel Protocol</h4>
                                                <p className="text-cyan-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] opacity-60">Metabolic Optimization</p>
                                            </div>
                                            <div className="md:text-right flex flex-col items-start md:items-end">
                                                <div className="text-3xl md:text-4xl font-black text-white tabular-nums tracking-tighter">2,400</div>
                                                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">Kcal • Daily Target</div>
                                            </div>
                                        </div>

                                        <div className="space-y-10">
                                            {plan.diet.map((item, i) => (
                                                <motion.div
                                                    key={item.id}
                                                    whileHover={{ y: -6, scale: 1.01 }}
                                                    className="group relative bg-white/[0.03] p-8 rounded-[40px] border border-white/5 hover:border-cyan-500/30 transition-all cursor-default shadow-xl overflow-hidden"
                                                >
                                                    <div className="flex justify-between items-start gap-8 mb-6">
                                                        <textarea
                                                            rows={1}
                                                            className="bg-transparent font-black text-white text-xl md:text-2xl w-full outline-none focus:text-cyan-400 transition-colors resize-none overflow-hidden leading-[1.2] h-auto scrollbar-none"
                                                            style={{ height: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                                                            value={item.title}
                                                            onChange={(e) => {
                                                                e.target.style.height = 'auto';
                                                                e.target.style.height = e.target.scrollHeight + 'px';
                                                                updatePlanItem('diet', item.id, e.target.value, item.description)
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.height = 'auto';
                                                                e.target.style.height = e.target.scrollHeight + 'px';
                                                            }}
                                                        />
                                                        <button
                                                            onClick={(e) => {
                                                                const textarea = e.currentTarget.parentElement?.querySelector('textarea');
                                                                textarea?.focus();
                                                            }}
                                                            className="p-4 rounded-2xl bg-white/5 text-white/20 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all group-hover:opacity-100 opacity-0"
                                                        >
                                                            <Edit3 size={24} />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        className="bg-transparent text-white/50 text-base w-full outline-none focus:text-white/80 transition-colors resize-none mb-6 leading-relaxed font-medium scrollbar-none"
                                                        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                                                        value={item.description}
                                                        rows={2}
                                                        onChange={(e) => updatePlanItem('diet', item.id, item.title, e.target.value)}
                                                    />

                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-4 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/10 text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">High Protein</span>
                                                        <span className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Neural Fuel</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Workout Section */}
                                    <div className="space-y-12 w-full">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 border-l-4 border-primary pl-8">
                                            <div className="space-y-2">
                                                <h4 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white italic leading-none">Neural Loading</h4>
                                                <p className="text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.4em] opacity-60">Physical Engineering</p>
                                            </div>
                                            <div className="flex items-center gap-4 px-6 py-3 rounded-[24px] bg-white/10 border border-white/10 text-xl font-black text-white shadow-xl backdrop-blur-xl">
                                                <Clock size={24} className="text-primary" /> 65M
                                            </div>
                                        </div>

                                        <div className="space-y-10">
                                            {plan.workout.map((item, i) => (
                                                <motion.div
                                                    key={item.id}
                                                    whileHover={{ y: -6, scale: 1.01 }}
                                                    className="group relative bg-white/[0.03] p-8 rounded-[40px] border border-white/5 hover:border-primary/30 transition-all cursor-default shadow-xl overflow-hidden"
                                                >
                                                    <div className="flex justify-between items-start gap-8 mb-6">
                                                        <textarea
                                                            rows={1}
                                                            className="bg-transparent font-black text-white text-xl md:text-2xl w-full outline-none focus:text-primary transition-colors resize-none overflow-hidden leading-[1.2] h-auto scrollbar-none"
                                                            style={{ height: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                                                            value={item.title}
                                                            onChange={(e) => {
                                                                e.target.style.height = 'auto';
                                                                e.target.style.height = e.target.scrollHeight + 'px';
                                                                updatePlanItem('workout', item.id, e.target.value, item.description)
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.height = 'auto';
                                                                e.target.style.height = e.target.scrollHeight + 'px';
                                                            }}
                                                        />
                                                        <button
                                                            onClick={(e) => {
                                                                const textarea = e.currentTarget.parentElement?.querySelector('textarea');
                                                                textarea?.focus();
                                                            }}
                                                            className="p-4 rounded-2xl bg-white/5 text-white/20 hover:text-primary hover:bg-primary/10 transition-all group-hover:opacity-100 opacity-0"
                                                        >
                                                            <Edit3 size={24} />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        className="bg-transparent text-white/50 text-base w-full outline-none focus:text-white/80 transition-colors resize-none mb-6 leading-relaxed font-medium scrollbar-none"
                                                        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                                                        value={item.description}
                                                        rows={2}
                                                        onChange={(e) => updatePlanItem('workout', item.id, item.title, e.target.value)}
                                                    />

                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-4 py-1.5 rounded-xl bg-primary/10 border border-primary/10 text-[10px] font-black text-primary uppercase tracking-[0.2em]">Intermediate</span>
                                                        <span className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Growth Phase</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Refined Action Block */}
                                <div className="flex flex-col items-center gap-12 pt-20 border-t border-white/10">
                                    <div className="flex items-center gap-6 text-white/20 text-xs font-black uppercase tracking-[1em]">
                                        <div className="h-px w-20 bg-white/5" />
                                        Protocol Hardened
                                        <div className="h-px w-20 bg-white/5" />
                                    </div>

                                    <button
                                        onClick={handleOnboardingComplete}
                                        className="relative group px-24 py-10 rounded-[48px] overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_20px_60px_-15px_rgba(139,92,246,0.5)]"
                                    >
                                        <div className="absolute inset-0 bg-primary group-hover:bg-primary-light transition-colors" />
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-60 blur-[60px] bg-primary transition-opacity" />

                                        <div className="relative flex items-center gap-10 text-white font-black text-3xl uppercase tracking-[0.2em] italic">
                                            Start Transformation <ChevronRight size={40} className="group-hover:translate-x-4 transition-transform duration-500" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // DASHBOARD VIEW AFTER ONBOARDING
    return (
        <div className="w-full max-w-5xl mx-auto space-y-12">
            {/* Header with quick stats */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 glass p-8 rounded-[40px] border-white/5">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full border-4 border-primary p-1 overflow-hidden">
                        {bio.photo ? (
                            <img src={URL.createObjectURL(bio.photo)} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-2xl font-black">?</div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic">{bio.gender} • {bio.age}y</h3>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{bio.height}cm • {bio.weight}kg</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => {
                            setIsOnboarded(false);
                            setStep(1);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                        <Edit3 size={14} /> Edit Bio
                    </button>
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-2xl font-black text-primary">2,400</div>
                            <div className="text-[10px] font-black uppercase text-white/20 tracking-widest">Goal Cals</div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-emerald-400">14d</div>
                            <div className="text-[10px] font-black uppercase text-white/20 tracking-widest">Streak</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center gap-4">
                {[
                    { id: 'overview', icon: Activity, label: "Stats" },
                    { id: 'roadmap', icon: Target, label: "Workouts" },
                    { id: 'diet', icon: Utensils, label: "Diet Plan" }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${activeTab === tab.id
                            ? 'gradient-bg text-white shadow-lg shadow-primary/20 scale-105'
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-10"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: "Current Weight", val: bio.weight, unit: "KG", icon: Scale, color: "text-blue-400" },
                                { label: "Body Fat %", val: 18.5, unit: "%", icon: TrendingUp, color: "text-purple-400" },
                                { label: "Muscle Mass", val: 34.2, unit: "KG", icon: Dumbbell, color: "text-emerald-400" },
                                { label: "Daily Target", val: 2400, unit: "KCAL", icon: Flame, color: "text-orange-400" }
                            ].map((stat, i) => (
                                <div key={i} className="glass p-8 rounded-[40px] border-white/5 group hover:border-white/10 transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <stat.icon className={`${stat.color} w-6 h-6`} />
                                        <span className="text-[10px] font-black opacity-30 tracking-widest uppercase">{stat.unit}</span>
                                    </div>
                                    <div className="text-3xl font-black mb-1">{stat.val}</div>
                                    <div className="text-[10px] font-medium text-white/40 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Chart Placeholder */}
                        <div className="glass p-10 rounded-[48px] border-white/5 h-80 flex flex-col items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <TrendingUp size={48} className="text-white/5 mb-4 group-hover:text-primary transition-colors" />
                            <h4 className="text-xl font-bold mb-2">Progress Analytics</h4>
                            <p className="text-white/20 text-sm font-medium">Tracking your neural performance metrics...</p>

                            {/* Simplified CSS Chart Illustration */}
                            <div className="mt-10 flex items-end gap-3 h-24">
                                {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-3 bg-primary/20 rounded-full group-hover:bg-primary transition-all duration-700"
                                        style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'roadmap' && plan && (
                    <motion.div
                        key="roadmap"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black italic">Training Roadmap</h3>
                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">NextSelf Optimized routine</p>
                            </div>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-2 rounded-xl border transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isEditing ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                            >
                                <Edit3 size={14} /> {isEditing ? "Saving..." : "Edit Plan"}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {plan.workout.map((item) => (
                                <div key={item.id} className="glass p-8 rounded-[40px] border-white/5 group hover:border-primary/20 transition-all flex gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <Zap size={20} className="text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {isEditing ? (
                                            <>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 font-bold text-white outline-none focus:border-primary"
                                                    value={item.title}
                                                    onChange={(e) => updatePlanItem('workout', item.id, e.target.value, item.description)}
                                                />
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-sm text-white/40 outline-none focus:border-primary focus:text-white"
                                                    value={item.description}
                                                    onChange={(e) => updatePlanItem('workout', item.id, item.title, e.target.value)}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <h4 className="font-black text-xl">{item.title}</h4>
                                                <p className="text-white/40 text-sm leading-relaxed">{item.description}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'diet' && plan && (
                    <motion.div
                        key="diet"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black italic">Dietary Blueprint</h3>
                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Nutritional fuel for transformation</p>
                            </div>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-2 rounded-xl border transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isEditing ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                            >
                                <Edit3 size={14} /> {isEditing ? "Saving..." : "Edit Diet"}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {plan.diet.map((item) => (
                                <div key={item.id} className="glass p-8 rounded-[40px] border-white/5 group hover:border-emerald-500/20 transition-all flex gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <Utensils size={20} className="text-emerald-400" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {isEditing ? (
                                            <>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 font-bold text-white outline-none focus:border-emerald-500"
                                                    value={item.title}
                                                    onChange={(e) => updatePlanItem('diet', item.id, e.target.value, item.description)}
                                                />
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-sm text-white/40 outline-none focus:border-emerald-500 focus:text-white"
                                                    value={item.description}
                                                    onChange={(e) => updatePlanItem('diet', item.id, item.title, e.target.value)}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <h4 className="font-black text-xl">{item.title}</h4>
                                                <p className="text-white/40 text-sm leading-relaxed">{item.description}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
                <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                    <Plus size={20} className="text-primary group-hover:rotate-90 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Daily Check-in</span>
                </button>
                <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                    <Camera size={20} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Update Bio-Scan</span>
                </button>
            </div>

            {/* Error Popup */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass p-8 rounded-[32px] border-red-500/20 max-w-sm w-full text-center shadow-2xl shadow-red-500/20 relative overflow-hidden"
                        >
                            {/* Decorative Background for Error */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20" />

                            <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                                <X size={40} className="text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black mb-3 italic">Analysis Interrupted</h3>
                            <p className="text-white/60 text-sm leading-relaxed mb-10">
                                {error}
                            </p>
                            <button
                                onClick={() => setError(null)}
                                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs transition-all border border-white/10"
                            >
                                Close & Recalibrate
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
