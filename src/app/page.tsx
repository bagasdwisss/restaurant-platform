"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import {
  SIGNATURE_POPULAR_DISHES,
  ALL_CATALOG_DISHES,
  MENU_FILTER_TABS,
} from "@/data/landing-menu";
import {
  Navbar,
  HeroSection,
  WhyChooseUsSection,
  PopularDishesSection,
  AboutSection,
  MenuCatalogSection,
  ReservationSection,
  ReviewsSection,
  VideoStoryModal,
  Footer,
} from "@/components/landing";

export default function DribbbleModernLandingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Cart & Wishlist state
  const [cartCount, setCartCount] = useState(2);
  const [wishlist, setWishlist] = useState<number[]>([102]);

  // Active Menu Category Filter
  const [activeTab, setActiveTab] = useState("all");

  // Reservation Widget State
  const [resGuests, setResGuests] = useState("2 People");
  const [resDate, setResDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [resTime, setResTime] = useState("07:30 PM");

  // Video Modal State
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleWishlist = (id: number) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((x) => x !== id));
      toast.info("Menu dihapus dari daftar favorit.", "Favorit");
    } else {
      setWishlist([...wishlist, id]);
      toast.success("Menu ditambahkan ke daftar favorit!", "Favorit");
    }
  };

  const handleAddToCart = (dishName: string) => {
    setCartCount((prev) => prev + 1);
    toast.success(`"${dishName}" berhasil ditambahkan ke keranjang pesanan!`, "Menu Ditambahkan");
  };

  const handleInlineReservation = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/reservation?guests=${encodeURIComponent(resGuests)}&date=${resDate}&time=${encodeURIComponent(resTime)}`
    );
  };

  const filteredDishes = ALL_CATALOG_DISHES.filter((d) => {
    if (activeTab === "all") return true;
    return d.category === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex flex-col justify-between selection:bg-[#EA580C] selection:text-white font-sans antialiased">

      {/* 1. Header & Navigation */}
      <Navbar
        mounted={mounted}
        user={user}
        logout={logout}
        cartCount={cartCount}
      />

      {/* 2. Hero Section */}
      <HeroSection onOpenStory={() => setShowVideoModal(true)} />

      {/* 3. Why Choose Us */}
      <WhyChooseUsSection />

      {/* 4. Signature Popular Dishes */}
      <PopularDishesSection
        dishes={SIGNATURE_POPULAR_DISHES}
        wishlist={wishlist}
        onToggleWishlist={toggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* 5. About Our Story */}
      <AboutSection />

      {/* 6. Explore Full Menu Catalog */}
      <MenuCatalogSection
        tabs={MENU_FILTER_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dishes={filteredDishes}
        onAddToCart={handleAddToCart}
      />

      {/* 7. Instant Reservation Widget */}
      <ReservationSection
        resGuests={resGuests}
        setResGuests={setResGuests}
        resDate={resDate}
        setResDate={setResDate}
        resTime={resTime}
        setResTime={setResTime}
        onSubmit={handleInlineReservation}
      />

      {/* 8. Testimonials / Reviews */}
      <ReviewsSection />

      {/* 9. Video Story Modal */}
      <VideoStoryModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />

      {/* 10. Footer */}
      <Footer />
    </div>
  );
}
