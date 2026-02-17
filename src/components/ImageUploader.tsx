"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Image as ImageIcon, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
    onImageSelected: (image: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isFaceCorrect, setIsFaceCorrect] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Real face detection logic
    useEffect(() => {
        let detector: any = null;
        let animationFrameId: number;
        let isComponentMounted = true;

        const setupDetector = async () => {
            try {
                const tf = await import("@tensorflow/tfjs-core");
                await import("@tensorflow/tfjs-backend-webgl");
                await import("@tensorflow/tfjs-backend-cpu");
                const blazeface = await import("@tensorflow-models/blazeface");

                // Explicitly set backend
                try {
                    await tf.setBackend("webgl");
                } catch (e) {
                    console.warn("WebGL failed, using CPU");
                    await tf.setBackend("cpu");
                }

                await tf.ready();
                detector = await blazeface.load();

                if (isComponentMounted && isCameraActive) {
                    detectFace();
                }
            } catch (err) {
                console.error("Face detection setup error:", err);
            }
        };

        const detectFace = async () => {
            if (!detector || !videoRef.current || !isCameraActive || !isComponentMounted) return;

            try {
                // Check if video is actually playing and has dimensions
                if (videoRef.current.readyState < 2) {
                    animationFrameId = requestAnimationFrame(detectFace);
                    return;
                }

                const predictions = await detector.estimateFaces(videoRef.current, false);

                if (predictions.length > 0) {
                    const face = predictions[0];
                    const start = face.topLeft as [number, number];
                    const end = face.bottomRight as [number, number];

                    const width = end[0] - start[0];
                    const height = end[1] - start[1];
                    const faceCenterX = start[0] + width / 2;
                    const faceCenterY = start[1] + height / 2;

                    const videoWidth = videoRef.current.videoWidth;
                    const videoHeight = videoRef.current.videoHeight;

                    const centerToleranceX = videoWidth * 0.25;
                    const centerToleranceY = videoHeight * 0.25;

                    const isCentered = Math.abs(faceCenterX - videoWidth / 2) < centerToleranceX &&
                        Math.abs(faceCenterY - videoHeight / 2) < centerToleranceY;

                    const minFaceSize = videoHeight * 0.25;
                    const isLargeEnough = height > minFaceSize;

                    setIsFaceCorrect(isCentered && isLargeEnough);
                } else {
                    setIsFaceCorrect(false);
                }
            } catch (err) {
                console.warn("Detection frame error:", err);
            }

            if (isCameraActive && isComponentMounted) {
                animationFrameId = requestAnimationFrame(detectFace);
            }
        };

        if (isCameraActive) {
            setupDetector();
        } else {
            setIsFaceCorrect(false);
        }

        return () => {
            isComponentMounted = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isCameraActive]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onImageSelected(file);
    };

    const startCamera = async () => {
        const constraints = [
            { video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } },
            { video: true }
        ];

        let stream = null;
        let lastError: any = null;

        for (const constraint of constraints) {
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraint);
                if (stream) break;
            } catch (err: any) {
                lastError = err;
                console.warn("Failed with constraint:", constraint, err);
            }
        }

        if (stream) {
            setIsCameraActive(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } else {
            if (lastError?.name === "NotReadableError") {
                alert("Bhai, hardware busy hai. Kisi doosre app ne camera roka hua hai.");
            } else if (lastError?.name === "NotAllowedError") {
                alert("Browser ne camera block kiya hua hai.");
            } else {
                alert("Camera connect nahi ho raha.");
            }
            setIsCameraActive(false);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d")?.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    processFile(file);
                    stopCamera();
                }
            }, "image/jpeg");
        }
    };

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
        setIsFaceCorrect(false);
    };

    const reset = () => {
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
                {!preview && !isCameraActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="glass p-10 rounded-[40px] border-dashed border-2 flex flex-col items-center justify-center gap-8 cursor-pointer hover:bg-white/10 transition-all group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform">
                            <Upload className="text-white w-10 h-10" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-2">Upload your Selfie</h3>
                            <p className="text-white/40 text-sm">Better quality means better scores</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); startCamera(); }}
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-light text-white font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            <Camera size={20} /> Use Camera
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </motion.div>
                )}

                {isCameraActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative flex flex-col items-center gap-8"
                    >
                        {/* Circular Camera Mask */}
                        <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-4 transition-colors duration-500 shadow-2xl"
                            style={{ borderColor: isFaceCorrect ? '#22c55e' : '#ef4444' }}>
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror-mode" />

                            {/* Scanning Guide Overlay */}
                            <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 rounded-full" />

                            {/* Animated Pulse Ring */}
                            <motion.div
                                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 rounded-full border-2"
                                style={{ borderColor: isFaceCorrect ? '#22c55e' : '#ef4444' }}
                            />
                        </div>

                        <div className="text-center space-y-2">
                            <h4 className={`text-lg font-bold ${isFaceCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                {isFaceCorrect ? "Perfect! Stay still" : "Align your face in the circle"}
                            </h4>
                            <p className="text-white/40 text-xs uppercase tracking-widest">
                                AI is checking facial alignment
                            </p>
                        </div>

                        <div className="flex gap-6">
                            <button
                                onClick={capturePhoto}
                                disabled={!isFaceCorrect}
                                className={`w-20 h-20 rounded-full flex items-center justify-center p-1 transition-all ${isFaceCorrect ? 'scale-110 opacity-100' : 'scale-90 opacity-50'}`}
                                style={{ background: isFaceCorrect ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.1)' }}
                            >
                                <div className="w-16 h-16 rounded-full border-4 border-white/30" />
                            </button>
                            <button
                                onClick={stopCamera}
                                className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {preview && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative glass rounded-[40px] overflow-hidden group"
                    >
                        <img src={preview} alt="Preview" className="w-full aspect-[3/4] object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={reset}
                                className="px-6 py-3 rounded-full bg-red-500 text-white font-bold flex items-center gap-2"
                            >
                                <X size={20} /> Change Photo
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
