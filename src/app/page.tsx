"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUploader } from "@/components/ImageUploader";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Roadmap } from "@/components/Roadmap";
import { useAuth } from "@/lib/AuthContext";
import { Sparkles, ArrowLeft, RefreshCw, Zap, LogOut, LogIn } from "lucide-react";

export default function Home() {
  const { user, login, logout, loginWithEmail, registerWithEmail, loading: authLoading } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth Form State
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleAuthError = (err: any) => {
    let msg = "Authentication failed.";
    if (err.code === "auth/user-not-found") msg = "User not found. Try registering!";
    if (err.code === "auth/wrong-password") msg = "Incorrect password.";
    if (err.code === "auth/email-already-in-use") msg = "Email already registered.";
    setError(msg);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegister) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const analyzeImage = async (selectedImage: File) => {
    setImage(selectedImage);
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setImage(null);
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-16">
          <div className="w-full flex justify-between items-center mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <span className="font-bold tracking-tight text-xl">NextSelf</span>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-medium text-white/90">{user.displayName || user.email?.split('@')[0]}</span>
                  <span className="text-[10px] text-white/40">{user.email}</span>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                    {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <button onClick={logout} className="p-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : null}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Sparkles className="text-primary w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary-light">AI Scaling Vision</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
          >
            Next<span className="gradient-text">Self</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg md:text-xl max-w-xl mx-auto"
          >
            {user ? "Discover your true potential. Get an instant attractiveness score." : "Sign in to discover your potential and get a custom roadmap."}
          </motion.p>
        </header>

        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 md:p-12 rounded-[32px] border-primary/20 max-w-md mx-auto w-full"
          >
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
              <Zap size={32} className="text-white" />
            </div>

            <h3 className="text-2xl font-bold mb-8 text-center">{isRegister ? "Create Account" : "Welcome Back"}</h3>

            <div className="space-y-4">
              {isEmailMode ? (
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isRegister && (
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all"
                    />
                  )}
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl gradient-bg text-white font-bold text-lg"
                  >
                    {isRegister ? "Sign Up" : "Sign In"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEmailMode(false)}
                    className="w-full text-sm text-white/40 hover:text-white transition-colors"
                  >
                    ← Back to other options
                  </button>
                </form>
              ) : (
                <>
                  <button
                    onClick={login}
                    className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/90 transition-all"
                  >
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
                    Continue with Google
                  </button>
                  <button
                    onClick={() => setIsEmailMode(true)}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                  >
                    Continue with Email
                  </button>
                </>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm">
              <span className="text-white/40">
                {isRegister ? "Already have an account?" : "Don't have an account?"}
              </span>
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="ml-2 text-primary font-bold hover:underline"
              >
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </div>

            {error && (
              <p className="mt-4 text-red-500 text-sm font-medium text-center">{error}</p>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing && (
              <motion.section
                key="uploader"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <ImageUploader onImageSelected={analyzeImage} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                  {[
                    { icon: Zap, title: "Instant Analysis", desc: "Powered by Groq Vision for real-time feedback." },
                    { icon: RefreshCw, title: "Consistent", desc: "Same face, same score. No random ratings." },
                    { icon: Sparkles, title: "Growth Roadmap", desc: "Actionable tips tailored just for you." }
                  ].map((feature, i) => (
                    <div key={i} className="glass p-6 rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                        <feature.icon className="text-primary w-5 h-5" />
                      </div>
                      <h4 className="font-bold mb-2">{feature.title}</h4>
                      <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {isAnalyzing && (
              <motion.section
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-8"
              >
                <div className="relative w-64 h-80 rounded-3xl overflow-hidden glass scanning-effect">
                  <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-primary animate-bounce">
                      <Zap size={48} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Analyzing your features...</h3>
                  <p className="text-white/60 animate-pulse">Running NextSelf algorithms on Groq Vision</p>
                </div>
              </motion.section>
            )}

            {result && (
              <motion.section
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-16"
              >
                <div className="flex justify-start">
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium"
                  >
                    <ArrowLeft size={16} /> Start Over
                  </button>
                </div>

                <div className="glass rounded-[32px] p-8 md:p-12 border-primary/20 shadow-2xl shadow-primary/10">
                  <ScoreDisplay
                    score={result.score}
                    summary={result.summary}
                    detailedScores={result.detailedScores}
                  />
                  <div className="w-full h-px bg-white/5 my-12" />
                  <Roadmap steps={result.roadmap} />
                </div>
              </motion.section>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm"
              >
                {error}
                <button onClick={reset} className="ml-4 underline font-bold">Try again</button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <footer className="mt-24 text-center text-white/20 text-xs">
          Built with Groq Vision & Next.js • © 2026 NextSelf
        </footer>
      </div>
    </main>
  );
}
