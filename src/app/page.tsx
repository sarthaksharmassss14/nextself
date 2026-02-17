"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUploader } from "@/components/ImageUploader";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Roadmap } from "@/components/Roadmap";
import { useAuth } from "@/lib/AuthContext";
import { Sparkles, ArrowLeft, RefreshCw, Zap, LogOut, LogIn, X } from "lucide-react";

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
    <main className="min-h-screen mesh-gradient text-white selection:bg-primary/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-24">
          <div className="w-full flex justify-between items-center mb-16">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Zap size={20} className="text-white" />
              </div>
              <span className="font-black tracking-tight text-2xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">NextSelf</span>
            </div>

            {user ? (
              <div className="flex items-center gap-4 glass px-4 py-2 rounded-2xl">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-bold text-white">{user.displayName || user.email?.split('@')[0]}</span>
                  <span className="text-[10px] text-white/40">{user.email}</span>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-xl border border-white/10" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black">
                    {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <button onClick={logout} className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-red-400 transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            ) : null}
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-md"
          >
            <Sparkles className="text-primary w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">AI Neural Engine v2.0</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter"
          >
            Next<span className="gradient-text drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">Self</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto uppercase tracking-[0.3em] font-medium leading-relaxed"
          >
            {user ? "Discover your true potential." : "Sign in to discover your potential and get a custom roadmap."}
          </motion.p>
        </header>

        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-10 md:p-14 rounded-[48px] border-white/10 max-w-md mx-auto w-full shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 text-center">
              <div className="w-20 h-20 rounded-[24px] gradient-bg flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30 transform group-hover:rotate-[10deg] transition-transform">
                <Zap size={40} className="text-white" />
              </div>

              <h3 className="text-3xl font-black mb-10">{isRegister ? "Create Account" : "Access Engine"}</h3>

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
                        className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-primary/50 outline-none transition-all placeholder:text-white/20"
                      />
                    )}
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-primary/50 outline-none transition-all placeholder:text-white/20"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-primary/50 outline-none transition-all placeholder:text-white/20"
                    />
                    <button
                      type="submit"
                      className="w-full py-5 rounded-2xl gradient-bg text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      {isRegister ? "Start Transformation" : "Instant Access"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEmailMode(false)}
                      className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors pt-4"
                    >
                      ← Back to methods
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      onClick={login}
                      className="w-full py-5 rounded-2xl bg-white text-black font-black text-lg flex items-center justify-center gap-4 hover:bg-white/90 transition-all shadow-xl shadow-white/5 active:scale-95"
                    >
                      <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
                      Google Login
                    </button>
                    <button
                      onClick={() => setIsEmailMode(true)}
                      className="w-full py-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-black text-lg flex items-center justify-center gap-4 hover:bg-white/10 transition-all active:scale-95"
                    >
                      <Zap size={22} className="text-primary" />
                      Email & Pass
                    </button>
                  </>
                )}
              </div>

              <div className="mt-10 pt-10 border-t border-white/5 text-xs">
                <span className="text-white/30 uppercase tracking-widest font-bold">
                  {isRegister ? "Identified before?" : "New to the system?"}
                </span>
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="ml-3 text-primary font-black uppercase tracking-widest hover:text-primary-light transition-colors"
                >
                  {isRegister ? "Login" : "Join Now"}
                </button>
              </div>
            </div>

            {error && (
              <p className="mt-6 text-red-500 text-xs font-bold uppercase tracking-widest animate-shake">
                {error}
              </p>
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
                className="space-y-24"
              >
                <ImageUploader onImageSelected={analyzeImage} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                  {[
                    { icon: Zap, title: "Neural Analysis", desc: "Powered by Groq Vision for real-time anatomical feedback." },
                    { icon: RefreshCw, title: "Zero Variance", desc: "Same face, same score. Removing human bias from aesthetics." },
                    { icon: Sparkles, title: "Pro Roadmap", desc: "Actionable transformation steps tailored for your architecture." }
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -10 }}
                      className="glass p-8 rounded-[32px] border-white/5 group hover:border-primary/20 transition-all cursor-default"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 group-hover:gradient-bg group-hover:scale-110 transition-all duration-500 shadow-xl">
                        <feature.icon className="text-primary w-6 h-6 group-hover:text-white transition-colors" />
                      </div>
                      <h4 className="text-lg font-black mb-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:to-white">
                        {feature.title}
                      </h4>
                      <p className="text-white/30 text-sm leading-relaxed font-medium group-hover:text-white/50 transition-colors">
                        {feature.desc}
                      </p>
                    </motion.div>
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
                className="flex flex-col items-center justify-center py-20 gap-12"
              >
                <div className="relative w-72 h-96 rounded-[40px] overflow-hidden glass border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.15)]">
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
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-primary-light to-white bg-clip-text text-transparent animate-gradient-x">
                    Neural Processing...
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

                <div className="glass rounded-[48px] p-8 md:p-14 border-white/10 shadow-2xl shadow-primary/5">
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
                className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="glass p-8 rounded-[32px] border-red-500/20 max-w-sm w-full text-center shadow-2xl shadow-red-500/10"
                >
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <X size={32} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Analysis Failed</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-8">
                    {error}
                  </p>
                  <button
                    onClick={reset}
                    className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-red-500/20"
                  >
                    Try Again
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <footer className="mt-24 text-center text-white/20 text-xs">
          Built with Groq  • © 2026 NextSelf
        </footer>
      </div>
    </main>
  );
}
