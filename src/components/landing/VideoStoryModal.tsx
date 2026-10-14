"use client";

import React from "react";
import Image from "next/image";
import { X, Play } from "lucide-react";

interface VideoStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoStoryModal({ isOpen, onClose }: VideoStoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#14281D] text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-white/20 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          title="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EA580C]/20 text-[#EA580C] text-xs font-mono font-bold">
            <Play className="w-3 h-3 fill-[#EA580C]" />
            <span>SAVORIA STORY BEHIND THE KITCHEN</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-white">
            Seni Memasak & Filosofi Warisan Koki
          </h3>
        </div>

        <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden relative bg-black border border-white/10 flex items-center justify-center">
          <Image
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
            alt="Kitchen preview"
            fill
            className="object-cover opacity-60"
          />
          <div className="relative z-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#EA580C] text-white flex items-center justify-center mx-auto shadow-cta animate-pulse">
              <Play className="w-7 h-7 fill-white ml-1" />
            </div>
            <p className="text-xs text-stone-200">
              Video profil dapur bintang lima Savoria Restaurant.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
        >
          Tutup Video
        </button>
      </div>
    </div>
  );
}
