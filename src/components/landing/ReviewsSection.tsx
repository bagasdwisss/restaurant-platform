"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, Quote, Award } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  category: "Master Chef" | "Actor & Icon" | "World Leader" | "VIP Patron";
  quote: string;
  avatar: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Chef Gordon Ramsay",
    role: "Michelin 3-Star Chef & Global Restaurateur",
    category: "Master Chef",
    quote:
      "Perfection on every single plate. The A5 Miyazaki Wagyu and precision searing technique here is truly world-class. Remarkable culinary mastery.",
    avatar:
      "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
  {
    id: 2,
    name: "Leonardo DiCaprio",
    role: "Academy Award Winning Actor & UN Messenger of Peace",
    category: "Actor & Icon",
    quote:
      "Savoria's dedication to locally farmed, eco-friendly organic ingredients and sustainable seafood sets a golden culinary benchmark for modern gastronomy.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
  {
    id: 3,
    name: "Chef Massimo Bottura",
    role: "Osteria Francescana • 3-Star Michelin Master Chef",
    category: "Master Chef",
    quote:
      "Culinary poetry in motion. The balance of acidity, umami, and heritage flavors makes this restaurant an absolute international treasure.",
    avatar:
      "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
  {
    id: 4,
    name: "Anne Hathaway",
    role: "Academy Award Winning Actress",
    category: "Actor & Icon",
    quote:
      "The ambience is enchanting, the hospitality warm and discreet. My favorite private dining sanctuary whenever I visit. Truly an unforgettable night.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
  {
    id: 5,
    name: "Barack Obama",
    role: "44th President of the United States & Global Leader",
    category: "World Leader",
    quote:
      "Outstanding culinary craft and exceptional Indonesian hospitality. An unforgettable, deeply memorable dining experience for our family.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
  {
    id: 6,
    name: "Michelle Yeoh",
    role: "Oscar-Winning Actress & Cultural Icon",
    category: "Actor & Icon",
    quote:
      "Incredible depth of flavor and immaculate attention to detail. Savoria turns every single dish into culinary high art. Truly inspiring.",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
  {
    id: 7,
    name: "Chef Alain Ducasse",
    role: "Legendary 21-Star Michelin Master",
    category: "Master Chef",
    quote:
      "The technique displayed in the truffle reductions and seafood broths is quintessential haute cuisine at its absolute finest. Bravo to the kitchen.",
    avatar:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
  {
    id: 8,
    name: "Keanu Reeves",
    role: "Actor & Philanthropist",
    category: "Actor & Icon",
    quote:
      "Genuine, soulful food and the most humble, welcoming staff. The Wagyu Ribeye and wine pairing was simply out of this world.",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
  {
    id: 9,
    name: "David Beckham",
    role: "Global Sports & Culture Icon",
    category: "VIP Patron",
    quote:
      "Superb atmosphere, phenomenal steak cuts, and top-tier wine pairings. A masterclass restaurant in every single way. Cannot wait to return.",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
];

// Duplicate items for continuous seamless loop
const DISPLAY_LIST = [...TESTIMONIALS, ...TESTIMONIALS];

export function ReviewsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isHoveredOrDragging, setIsHoveredOrDragging] = useState(false);

  // Auto-scroll animation via requestAnimationFrame
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let animId: number;
    let isPaused = false;

    const tick = () => {
      if (!isPaused && !isDraggingRef.current) {
        el.scrollLeft += 0.85; // Smooth continuous glide
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft -= el.scrollWidth / 2;
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    const onEnter = () => {
      isPaused = true;
      setIsHoveredOrDragging(true);
    };
    const onLeave = () => {
      if (!isDraggingRef.current) {
        isPaused = false;
        setIsHoveredOrDragging(false);
      }
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Mouse Drag Events
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    setIsHoveredOrDragging(true);
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!isDraggingRef.current || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftRef.current - walk;

    // Handle seamless wrap when dragging
    if (el.scrollLeft >= el.scrollWidth / 2) {
      el.scrollLeft -= el.scrollWidth / 2;
      scrollLeftRef.current = el.scrollLeft;
      startXRef.current = e.pageX - el.offsetLeft;
    } else if (el.scrollLeft <= 0) {
      el.scrollLeft += el.scrollWidth / 2;
      scrollLeftRef.current = el.scrollLeft;
      startXRef.current = e.pageX - el.offsetLeft;
    }
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setIsHoveredOrDragging(false);
  };

  // Manual scroll with arrow buttons
  const scrollStep = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const offset = direction === "left" ? -380 : 380;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section id="reviews" className="py-14 sm:py-24 lg:py-28 bg-[#FCFBF7] border-b border-[#E2E8F0] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 lg:px-12 space-y-8 sm:space-y-12">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 text-[#EA580C] text-[11px] font-bold uppercase tracking-wider font-mono">
              <Award className="w-3.5 h-3.5" />
              <span>TESTIMONIALS & ENDORSEMENTS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#18181B] tracking-tight">
              Honored by World Leaders & Renowned Chefs
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Pengakuan istimewa dari para tokoh dunia, master chef berbintang Michelin, dan selebritas internasional yang menikmati jamuan terbaik Savoria.
            </p>
          </div>

          {/* Carousel Step Controls */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <span className="text-[11px] text-[#64748B] font-medium mr-2 hidden sm:inline">
              Geser untuk menjelajahi
            </span>
            <button
              type="button"
              onClick={() => scrollStep("left")}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollStep("right")}
              className="w-10 h-10 rounded-full border border-[#EA580C] bg-[#EA580C] hover:bg-[#C2410C] text-white flex items-center justify-center shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Infinite Scroll & Draggable Track */}
      <div className="mt-8 relative">
        {/* Subtle Edge Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-[#FCFBF7] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-[#FCFBF7] to-transparent z-10 pointer-events-none" />

        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          className={`flex gap-4 sm:gap-6 px-4 sm:px-12 overflow-x-auto scrollbar-none py-3 select-none ${
            isHoveredOrDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ willChange: "scroll-position" }}
        >
          {DISPLAY_LIST.map((item, index) => {
            const categoryBadgeColor =
              item.category === "Master Chef"
                ? "bg-amber-100 text-amber-900 border-amber-200"
                : item.category === "World Leader"
                ? "bg-blue-100 text-blue-900 border-blue-200"
                : item.category === "Actor & Icon"
                ? "bg-purple-100 text-purple-900 border-purple-200"
                : "bg-emerald-100 text-emerald-900 border-emerald-200";

            return (
              <div
                key={`${item.id}-${index}`}
                className="w-[290px] xs:w-[330px] sm:w-[380px] shrink-0 p-5 sm:p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#EA580C]/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Stars & Category Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex text-[#F59E0B]">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#F59E0B]" />
                      ))}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono tracking-tight uppercase ${categoryBadgeColor}`}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Quote with decorative icon */}
                  <div className="relative">
                    <Quote className="w-6 h-6 text-[#EA580C]/15 absolute -top-1.5 -left-1 pointer-events-none" />
                    <p className="text-xs sm:text-[13px] text-[#18181B] leading-relaxed italic pl-3 relative z-1 font-serif">
                      &quot;{item.quote}&quot;
                    </p>
                  </div>
                </div>

                {/* Profile Card Footer */}
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden relative border-2 border-slate-100 group-hover:border-[#EA580C]/50 transition-colors shrink-0 shadow-2xs">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-[#18181B] truncate group-hover:text-[#EA580C] transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-[#64748B] truncate font-medium">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
