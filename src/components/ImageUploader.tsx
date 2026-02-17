"use client";

import React, { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
    onImageSelected: (image: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            setIsCameraActive(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err: any) {
            console.error("Camera error:", err);
            if (err.name === "NotReadableError") {
                alert("Camera is already in use by another application. Please close it and try again.");
            } else if (err.name === "NotAllowedError") {
                alert("Camera permission denied. Please allow camera access in your browser settings.");
            } else {
                alert("Could not start camera. Please try uploading a file instead.");
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass p-8 rounded-3xl border-dashed border-2 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center shadow-lg shadow-primary/20">
                            <Upload className="text-white w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">Upload your Selfie</h3>
                            <p className="text-white/60 text-sm">Drag & drop or click to browse</p>
                        </div>
                        <div className="flex gap-4 mt-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); startCamera(); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                            >
                                <Camera size={18} /> Take Photo
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </motion.div>
                )}

                {isCameraActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative glass rounded-3xl overflow-hidden aspect-[3/4]"
                    >
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                            <button
                                onClick={capturePhoto}
                                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1"
                            >
                                <div className="w-full h-full rounded-full bg-white shadow-lg" />
                            </button>
                            <button
                                onClick={stopCamera}
                                className="absolute right-6 bottom-8 w-10 h-10 rounded-full bg-red-500/80 flex items-center justify-center"
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
                        className="relative glass rounded-3xl overflow-hidden"
                    >
                        <img src={preview} alt="Preview" className="w-full aspect-[3/4] object-cover" />
                        <button
                            onClick={reset}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
