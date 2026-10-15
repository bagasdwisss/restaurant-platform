"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { useCartStore } from "@/lib/cart-store";
import {
  SIGNATURE_POPULAR_DISHES,
  ALL_CATALOG_DISHES,
  MENU_FILTER_TABS,
} from "@/data/landing-menu";
import dynamic from "next/dynamic";
import {
  Navbar,
  HeroSection,
  WhyChooseUsSection,
  PopularDishesSection,
  AboutSection,
  MenuCatalogSection,
  ReservationSection,
  ReviewsSection,
  Footer,
} from "@/components/landing";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ShieldCheck, ArrowRight } from "lucide-react";

const VideoStoryModal = dynamic(
  () => import("@/components/landing").then((m) => m.VideoStoryModal),
  { ssr: false }
);

export default function DribbbleModernLandingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Cart Store Integration
  const { items, addItem } = useCartStore();
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const cartCount = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  // Wishlist state
  const [wishlist, setWishlist] = useState<number[]>([1]);

  // Live Menus synchronized with database API
  const [liveCatalog, setLiveCatalog] = useState<any[]>(ALL_CATALOG_DISHES);
  const [livePopular, setLivePopular] = useState<any[]>(SIGNATURE_POPULAR_DISHES);

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

  const isStaff = Boolean(user && (user.role === "admin" || user.role === "kasir"));

  useEffect(() => {
    setMounted(true);

    // Fetch unified menus from API so landing page & reservation page are 100% in sync
    fetch("/api/v1/customer/menus")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: any[] = data.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            category: m.category?.slug || "mains",
            description: m.description,
            priceUSD: `$${(m.price / 15000).toFixed(2)}`,
            priceIDR: m.price,
            rating: 5.0,
            country: m.country || "Internasional",
            image: m.image,
          }));
          setLiveCatalog(mapped);

          const popularNames = [
            "Miyazaki Wagyu A5 Tenderloin Rossini",
            "Lobster Thermidor au Hennessy Cognac",
            "Risotto al Tartufo Bianco d'Alba",
            "Rendang Short Ribs Wagyu 48-Hour",
          ];
          const pop = mapped.filter((d: any) => popularNames.includes(d.name));
          if (pop.length >= 3) {
            setLivePopular(
              pop.map((p: any, idx: number) => ({
                ...p,
                badge: idx === 0 ? "Chef's Signature" : idx === 1 ? "Popular Pick" : "Michelin Award",
                calories: "520 kcal",
                prepTime: "20 mins",
                reviewsCount: 200 + idx * 40,
              }))
            );
          }
        }
      })
      .catch(() => {});
  }, []);

  const toggleWishlist = (id: number) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((x) => x !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const handleAddToCart = (dish: any) => {
    addItem({
      menuId: dish.id,
      name: dish.name,
      price: dish.priceIDR || 0,
      image: dish.image || null,
      quantity: 1,
      notes: "",
      selectedVariants: [],
    });
    setShowCartDrawer(true);
  };

  const handleInlineReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStaff) {
      toast.warning(
        "Akun Admin & Kasir tidak dapat melakukan booking reservasi. Harap gunakan akun pembeli/pelanggan.",
        "Akses Terbatas"
      );
      return;
    }
    router.push(
      `/reservation?guests=${encodeURIComponent(resGuests)}&date=${resDate}&time=${encodeURIComponent(resTime)}`
    );
  };

  const filteredDishes = liveCatalog.filter((d) => {
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
        onOpenCart={() => setShowCartDrawer(true)}
      />

      {/* 2. Hero Section */}
      <HeroSection onOpenStory={() => setShowVideoModal(true)} />

      {/* 3. Why Choose Us */}
      <WhyChooseUsSection />

      {/* 4. Signature Popular Dishes */}
      <PopularDishesSection
        dishes={livePopular}
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

      {/* 7. Instant Reservation Widget (Completely hidden/replaced for Staff) */}
      {!isStaff ? (
        <ReservationSection
          resGuests={resGuests}
          setResGuests={setResGuests}
          resDate={resDate}
          setResDate={setResDate}
          resTime={resTime}
          setResTime={setResTime}
          onSubmit={handleInlineReservation}
        />
      ) : (
        <section className="py-12 bg-white border-y border-[#E2E8F0]">
          <div className="max-w-[1280px] mx-auto px-4 text-center space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#EA580C] bg-[#EA580C]/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Mode Staf Aktif
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#18181B]">
              Anda Sedang Masuk Sebagai {user?.role === "admin" ? "Administrator" : "Kasir"}
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
              Hak akses booking reservasi meja dinonaktifkan khusus untuk akun staf operasional demi integritas antrean tamu. Silakan beralih ke Dashboard kerja Anda.
            </p>
            <div className="pt-2">
              <Link
                href={user?.role === "admin" ? "/admin" : "/pos"}
                className="px-6 py-2.5 rounded-full bg-[#18181B] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Buka Dashboard {user?.role === "admin" ? "Admin" : "Kasir"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 8. Testimonials / Reviews */}
      <ReviewsSection />

      {/* 9. Video Story Modal */}
      <VideoStoryModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />

      {/* 10. Interactive Cart Drawer */}
      <CartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
      />

      {/* 11. Footer */}
      <Footer />
    </div>
  );
}
