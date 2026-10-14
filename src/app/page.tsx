"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { formatIDR } from "@/lib/utils";
import {
  Sparkles,
  Star,
  ShoppingBag,
  ArrowRight,
  Play,
  Heart,
  Plus,
  Clock,
  Flame,
  Calendar,
  Users,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  LogIn,
  LogOut,
  X,
  Phone,
  MapPin,
  Menu as MenuIcon,
  Award,
  Coffee,
  Check,
} from "lucide-react";

// Dribbble Modern Restaurant Popular Dishes
const SIGNATURE_POPULAR_DISHES = [
  {
    id: 101,
    name: "Miyazaki Wagyu A5 Tenderloin Rossini",
    category: "mains",
    description: "Wagyu A5 BMS 12 dipanggang medium rare, pan-seared Rougié Foie Gras, Périgord Black Truffle segar, dan saus Madeira jus.",
    priceUSD: "$95.00",
    priceIDR: 1450000,
    rating: 5.0,
    reviewsCount: 312,
    calories: "580 kcal",
    prepTime: "25 mins",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    badge: "Chef's Signature",
  },
  {
    id: 102,
    name: "Lobster Thermidor au Hennessy Cognac",
    category: "seafood",
    description: "Lobster biru utuh dipanggang dalam cangkang dengan velouté krim Dijon mustard, keju Gruyère Swiss 18 bulan, dan flambé Cognac.",
    priceUSD: "$62.00",
    priceIDR: 920000,
    rating: 4.9,
    reviewsCount: 248,
    calories: "510 kcal",
    prepTime: "22 mins",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80",
    badge: "Popular Pick",
  },
  {
    id: 103,
    name: "Risotto al Tartufo Bianco d'Alba",
    category: "pasta-risotto",
    description: "Beras Carnaroli superfino, mentega Normandia, keju Parmigiano-Reggiano usia 36 bulan, dan parutan White Truffle segar dari Alba.",
    priceUSD: "$46.00",
    priceIDR: 690000,
    rating: 4.9,
    reviewsCount: 184,
    calories: "430 kcal",
    prepTime: "20 mins",
    image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80",
    badge: "Michelin Award",
  },
  {
    id: 104,
    name: "Rendang Short Ribs Wagyu 48-Hour",
    category: "nusantara-asia",
    description: "Iga sapi Wagyu marbling 9 sous-vide 48 jam lumer di lidah, kelapa gongseng Payakumbuh, gel santan asam kandis, dan keripik singkong.",
    priceUSD: "$39.00",
    priceIDR: 580000,
    rating: 5.0,
    reviewsCount: 290,
    calories: "560 kcal",
    prepTime: "18 mins",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    badge: "Heritage Gem",
  },
];

// Full Menu Items with 7 Filter Categories (50 Curated Worldwide Dishes)
const ALL_CATALOG_DISHES = [
  // 1. APPETIZERS & STARTERS (7 Items)
  {
    id: 201,
    name: "Caviar Kristal Oscietra Royal (30g)",
    category: "appetizers",
    description: "Kaviar sturgeon Oscietra royal dengan blinis hangat buatan tangan, crème fraîche Normandy, dan cincangan telur puyuh organik.",
    priceUSD: "$56.00",
    priceIDR: 850000,
    rating: 5.0,
    country: "Kaspia",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 202,
    name: "Hokkaido Scallop Carpaccio & Yuzu",
    category: "appetizers",
    description: "Kerang simping Hokkaido segar diiris tipis, mutiara jeruk yuzu, minyak zaitun Liguria, dan serpihan sea salt Maldon.",
    priceUSD: "$21.00",
    priceIDR: 320000,
    rating: 4.9,
    country: "Jepang",
    image: "https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 203,
    name: "French Truffle Escargot à la Bourguignonne",
    category: "appetizers",
    description: "Bekicot liar Burgundy Prancis dipanggang dengan garlic herb butter, percikan Chablis white wine, dan sourdough renyah.",
    priceUSD: "$17.00",
    priceIDR: 260000,
    rating: 4.8,
    country: "Prancis",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 204,
    name: "Wagyu Beef Tartare with Black Truffle",
    category: "appetizers",
    description: "Daging Wagyu segar cincang halus, bumbu kapulaga dijon, kuning telur puyuh organik, dan serutan truffle Périgord.",
    priceUSD: "$23.00",
    priceIDR: 340000,
    rating: 4.9,
    country: "Prancis",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 205,
    name: "Wild Forest Porcini Velouté",
    category: "appetizers",
    description: "Sup krim beludru jamur porcini liar, minyak truffle putih Alba, daun thyme segar, dan crouton brioche renyah.",
    priceUSD: "$12.50",
    priceIDR: 185000,
    rating: 4.8,
    country: "Italia",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 206,
    name: "Foie Gras Poêlé au Vinaigre Balsamique",
    category: "appetizers",
    description: "Hati angsa Rougié Prancis panggang gurih, saus reduksi cuka balsamik Modena 12 tahun, dan brioche kismis hangat.",
    priceUSD: "$28.00",
    priceIDR: 420000,
    rating: 5.0,
    country: "Prancis",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 207,
    name: "Burrata Pugliese con Pomodorini Confit",
    category: "appetizers",
    description: "Keju Burrata segar lembut dari Puglia, tomat ceri confit karamel madu, minyak zaitun extra virgin, dan daun basil wangi.",
    priceUSD: "$14.00",
    priceIDR: 210000,
    rating: 4.9,
    country: "Italia",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d69102a56?auto=format&fit=crop&w=800&q=80",
  },

  // 2. WORLD SIGNATURE MAINS & STEAKS (7 Items)
  {
    id: 208,
    name: "Miyazaki Wagyu A5 Tenderloin Rossini",
    category: "mains",
    description: "Wagyu A5 BMS 12, pan-seared Rougié Foie Gras, Périgord Black Truffle, kentang purée mentega Prancis, dan Madeira jus.",
    priceUSD: "$95.00",
    priceIDR: 1450000,
    rating: 5.0,
    country: "Jepang",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 209,
    name: "Australian Tomahawk Wagyu MB7 (1.2kg)",
    category: "mains",
    description: "Steak tomahawk bertulang utuh panggang arang kayu apel, roasted garlic bulb, bone marrow butter, dan 3 saus signature.",
    priceUSD: "$125.00",
    priceIDR: 1850000,
    rating: 5.0,
    country: "Australia",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 210,
    name: "NZ Lumina Lamb Rack with Herb Crust",
    category: "mains",
    description: "Iga domba Lumina lembut berbalut rempah panko aromatik, purée kacang polong manis mint, dan saus jus rosemary wangi.",
    priceUSD: "$45.00",
    priceIDR: 680000,
    rating: 4.9,
    country: "Selandia Baru",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 211,
    name: "USDA Prime Dry-Aged Ribeye 350g",
    category: "mains",
    description: "Potongan ribeye prime berusia 45 hari dry-aged dengan rasa gurih nutty intens, chimichurri segar, dan kentang truffle.",
    priceUSD: "$59.00",
    priceIDR: 890000,
    rating: 4.9,
    country: "Amerika Serikat",
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 212,
    name: "Magret de Canard Rôti au Miel et Cerises",
    category: "mains",
    description: "Dada bebek Prancis kulit krispi terpanggang madu lavender, jus ceri liar asam manis, dan puree ubi jalar beludru.",
    priceUSD: "$32.00",
    priceIDR: 480000,
    rating: 4.9,
    country: "Prancis",
    image: "https://images.unsplash.com/photo-1514944298352-7a8e0f6c2578?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 213,
    name: "Ibérico Pork Pluma & Smoked Apple Purée",
    category: "mains",
    description: "Daging babi Ibérico acorn-fed bagian sayap yang sangat empuk, purée apel panggang berasap, dan jus sherry Spanyol.",
    priceUSD: "$36.50",
    priceIDR: 550000,
    rating: 4.8,
    country: "Spanyol",
    image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 214,
    name: "Slow-Braised Wagyu Beef Cheek Bourguignon",
    category: "mains",
    description: "Pipi sapi Wagyu dimasak lambat 16 jam dalam anggur merah Pinot Noir Burgundy, wortel glacé, jamur mutiara, dan kentang lumer.",
    priceUSD: "$27.00",
    priceIDR: 410000,
    rating: 4.9,
    country: "Prancis",
    image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80",
  },

  // 3. ARTISANAL PASTA & TRUFFLE RISOTTO (7 Items)
  {
    id: 215,
    name: "Risotto al Tartufo Bianco d'Alba",
    category: "pasta-risotto",
    description: "Beras Carnaroli superfino, kaldu capon emas, mentega Normandia, Parmigiano-Reggiano 36 bulan, dan parutan White Truffle segar.",
    priceUSD: "$46.00",
    priceIDR: 690000,
    rating: 4.9,
    country: "Italia",
    image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 216,
    name: "Handcrafted Tagliolini with Blue Lobster",
    category: "pasta-risotto",
    description: "Pasta telur buatan tangan dengan lobster biru Brittany, bisque tomat ceri San Marzano, minyak cabai Calabria, dan basil.",
    priceUSD: "$50.00",
    priceIDR: 750000,
    rating: 5.0,
    country: "Italia",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 217,
    name: "Wagyu Beef Cheek Ragù Pappardelle",
    category: "pasta-risotto",
    description: "Pasta lebar pappardelle dengan daging pipi sapi Wagyu direbus 12 jam bersama anggur Chianti dan keju Pecorino Romano.",
    priceUSD: "$25.00",
    priceIDR: 380000,
    rating: 4.8,
    country: "Italia",
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 218,
    name: "Ravioli di Ricotta e Spinaci al Burro e Salvia",
    category: "pasta-risotto",
    description: "Ravioli buatan tangan isi keju ricotta susu kerbau dan bayam liar dengan siraman mentega herba salvia harum dan pine nuts.",
    priceUSD: "$17.50",
    priceIDR: 260000,
    rating: 4.8,
    country: "Italia",
    image: "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 219,
    name: "Spaghetti alle Vongole Veraci con Bottarga",
    category: "pasta-risotto",
    description: "Spaghetti artisanal Gragnano dengan kerang laut hidup, bawang putih manis, anggur putih, dan serutan telur ikan Bottarga.",
    priceUSD: "$23.50",
    priceIDR: 350000,
    rating: 4.9,
    country: "Italia",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 220,
    name: "Gnocchi di Patate al Gorgonzola e Noci",
    category: "pasta-risotto",
    description: "Gnocchi kentang lumer berbalut saus krim keju Gorgonzola Dolce DOP, kacang kenari renyah panggang, dan madu akasia.",
    priceUSD: "$16.00",
    priceIDR: 240000,
    rating: 4.8,
    country: "Italia",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 221,
    name: "Fettuccine ai Funghi Porcini e Tartufo Nero",
    category: "pasta-risotto",
    description: "Fettuccine telur artisanal dengan tumisan jamur porcini segar, minyak zaitun Tuscan, dan serutan truffle hitam Norcia.",
    priceUSD: "$21.00",
    priceIDR: 310000,
    rating: 4.9,
    country: "Italia",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80",
  },

  // 4. SEAFOOD EXTRAVAGANZA & OCEAN TREASURES (7 Items)
  {
    id: 222,
    name: "Lobster Thermidor au Hennessy Cognac",
    category: "seafood",
    description: "Lobster biru utuh dipanggang dalam cangkang dengan velouté krim Dijon mustard, keju Gruyère Swiss 18 bulan, dan flambé Cognac.",
    priceUSD: "$62.00",
    priceIDR: 920000,
    rating: 5.0,
    country: "Prancis",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 223,
    name: "Barents Sea King Crab au Beurre Fumé",
    category: "seafood",
    description: "Kaki kepiting raja raksasa dari Laut Barents dipanggang mentega asap kayu apel, emulsi daun adas dill, dan brioche renyah.",
    priceUSD: "$65.00",
    priceIDR: 980000,
    rating: 5.0,
    country: "Norwegia",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 224,
    name: "Chilean Sea Bass en Papillote",
    category: "seafood",
    description: "Fillet kakap Chili salju dipanggang dalam kertas perkamen bersama jamur shiitake, jahe muda, serai wangi, dan kaldu dashi.",
    priceUSD: "$41.00",
    priceIDR: 620000,
    rating: 4.9,
    country: "Chili",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 225,
    name: "Crispy Skin Tasmanian Salmon Saffron",
    category: "seafood",
    description: "Salmon liar Tasmania berkulit garing lumer di lidah, kentang fondue mentega, asparagus panggang, dan saus saffron emas.",
    priceUSD: "$26.00",
    priceIDR: 390000,
    rating: 4.8,
    country: "Australia",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 226,
    name: "Mediterranean Grilled Octopus Romesco",
    category: "seafood",
    description: "Tentakel gurita laut dalam dipanggang empuk dengan saus Romesco kacang almond Catalunya, kentang baby confit, dan paprika.",
    priceUSD: "$28.50",
    priceIDR: 430000,
    rating: 4.9,
    country: "Spanyol",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 227,
    name: "Brittany Turbot Meunière au Beurre Noisette",
    category: "seafood",
    description: "Ikan turbot tangkapan liar pesisir Brittany Prancis dimasak meunière mentega cokelat hazelnut, perasan lemon, dan peterseli.",
    priceUSD: "$48.00",
    priceIDR: 720000,
    rating: 4.9,
    country: "Prancis",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 228,
    name: "Pan-Seared Yellowfin Tuna Sesame Tataki",
    category: "seafood",
    description: "Tuna sirip kuning segar berbalut biji wijen dua warna, irisan lobak daikon renyah, saus ponzu jahe, dan microgreens.",
    priceUSD: "$24.00",
    priceIDR: 360000,
    rating: 4.8,
    country: "Jepang",
    image: "https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=800&q=80",
  },

  // 5. ASIAN & NUSANTARA HERITAGE (8 Items)
  {
    id: 229,
    name: "Rendang Short Ribs Wagyu 48-Hour",
    category: "nusantara-asia",
    description: "Iga sapi Wagyu marbling 9 sous-vide 48 jam lumer di lidah, kelapa gongseng Payakumbuh, gel santan asam kandis, dan keripik singkong.",
    priceUSD: "$39.00",
    priceIDR: 580000,
    rating: 5.0,
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 230,
    name: "Miyazaki Wagyu A5 Sukiyaki Royale",
    category: "nusantara-asia",
    description: "Daging Wagyu A5 Miyazaki direbus perlahan dalam warishita manis-gurih 50 tahun, jamur Matsutake, dan telur onsen emas.",
    priceUSD: "$83.00",
    priceIDR: 1250000,
    rating: 5.0,
    country: "Jepang",
    image: "https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 231,
    name: "Bebek Betutu Confit aux Epices Nobles",
    category: "nusantara-asia",
    description: "Paha bebek confit 18 bumbu base genep Bali, kuah gulai saffron kecombrang, lawar asap, dan sambal matah kelapa murni.",
    priceUSD: "$30.00",
    priceIDR: 450000,
    rating: 4.9,
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1514944298352-7a8e0f6c2578?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 232,
    name: "Omakase Nigiri: Otoro & Uni Hokkaido",
    category: "nusantara-asia",
    description: "Nigiri tuna Otoro aburi bertabur kaviar dan landak laut Uni segar Hokkaido di atas nasi akazu cuka merah 3 tahun.",
    priceUSD: "$58.00",
    priceIDR: 880000,
    rating: 5.0,
    country: "Jepang",
    image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 233,
    name: "Singapore Golden Mud Crab Claypot",
    category: "nusantara-asia",
    description: "Kepiting lumpur jumbo segar dimasak dalam claypot dengan bihun kaca kaldu kepiting pekat lada hitam Sarawak dan daun ketumbar.",
    priceUSD: "$52.00",
    priceIDR: 780000,
    rating: 4.9,
    country: "Singapura",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 234,
    name: "Thai Royal Tom Yum River Prawn",
    category: "nusantara-asia",
    description: "Sup tom yum tradisi istana Thailand dengan udang galah sungai raksasa berlemak manis, galangal, serai segar, dan minyak cabai.",
    priceUSD: "$21.50",
    priceIDR: 320000,
    rating: 4.8,
    country: "Thailand",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 235,
    name: "Rawon Sengkel Wagyu Sambal Terasi Bakar",
    category: "nusantara-asia",
    description: "Sengkel Wagyu empuk dimasak kuah kluwek hitam legendaris Jawa Timur, tauge pendek renyah, telur bebek asin, dan emping melinjo.",
    priceUSD: "$18.50",
    priceIDR: 280000,
    rating: 4.9,
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 236,
    name: "Black Truffle Siew Mai & Xiao Long Bao",
    category: "nusantara-asia",
    description: "Duet dimsum mewah isi daging cincang udang galah dan serutan black truffle dengan kaldu sup harum di dalam kulit tipis halus.",
    priceUSD: "$13.00",
    priceIDR: 195000,
    rating: 4.9,
    country: "Hong Kong",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
  },

  // 6. CHEF'S ATELIER DESSERTS & PÂTISSERIE (7 Items)
  {
    id: 237,
    name: "Sphère Chocolat Noir Valrhona 70%",
    category: "desserts",
    description: "Bola cokelat hitam Valrhona 70% meleleh tersiram saus karamel mentega asin panas, berisi mousse hazelnut Piedmont.",
    priceUSD: "$21.00",
    priceIDR: 320000,
    rating: 5.0,
    country: "Prancis",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 238,
    name: "Soufflé Chaud au Grand Marnier",
    category: "desserts",
    description: "Kue soufflé klasik lembut beraroma kulit jeruk Grand Marnier, gelato vanila Tahiti, dan serpihan emas 24k murni.",
    priceUSD: "$18.50",
    priceIDR: 280000,
    rating: 4.9,
    country: "Prancis",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 239,
    name: "Basque Burnt Cheesecake White Truffle",
    category: "desserts",
    description: "Cheesecake hangus Spanyol bertekstur lava lumer lembut disiram madu bunga liar white truffle dan buah beri segar.",
    priceUSD: "$14.50",
    priceIDR: 220000,
    rating: 4.9,
    country: "Spanyol",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 240,
    name: "Tahitian Vanilla Bean Mille-Feuille",
    category: "desserts",
    description: "Lapisan puff pastry karamel renyah tipis dengan krim diplomatik vanila polong Tahiti dan glasir gula halus glasir cermin.",
    priceUSD: "$13.00",
    priceIDR: 195000,
    rating: 4.8,
    country: "Prancis",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 241,
    name: "Pistachio Paris-Brest Praliné",
    category: "desserts",
    description: "Roda choux pastry khas Prancis diisi mousseline pistachio Sisilia panggang, krim praline hazelnut renyah, dan garam Maldon.",
    priceUSD: "$14.00",
    priceIDR: 210000,
    rating: 4.9,
    country: "Prancis",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 242,
    name: "Kyoto Matcha Molten Lava & Sesame",
    category: "desserts",
    description: "Kue lava hangat matcha ceremonial grade Uji Kyoto berlelehan cokelat putih, disajikan bersama gelato wijen hitam sangrai.",
    priceUSD: "$12.50",
    priceIDR: 185000,
    rating: 4.9,
    country: "Jepang",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 243,
    name: "Tiramisù Tradizionale al Mascarpone",
    category: "desserts",
    description: "Biskuit savoiardi dicelup kopi espresso murni dan liqueur Marsala, keju mascarpone lembut krimi, dan taburan cokelat Valrhona.",
    priceUSD: "$11.50",
    priceIDR: 175000,
    rating: 4.8,
    country: "Italia",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
  },

  // 7. GRANDS CRUS, ELIXIRS & MOCKTAILS (7 Items)
  {
    id: 244,
    name: "Dom Pérignon Vintage Brut Champagne",
    category: "drinks",
    description: "Sampanye legendaris dari Épernay Prancis dengan buih halus, aroma brioche ragi hangat, almond sangrai, dan buah pir putih.",
    priceUSD: "$360.00",
    priceIDR: 5500000,
    rating: 5.0,
    country: "Prancis",
    image: "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 245,
    name: "Royal Passionfruit & Yuzu Fizz",
    category: "drinks",
    description: "Sari jeruk yuzu Kochi Jepang, bulir buah markisa segar, sirup bunga elderflower organik, daun mint, dan soda dingin.",
    priceUSD: "$6.50",
    priceIDR: 95000,
    rating: 4.9,
    country: "Jepang",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 246,
    name: "Earl Grey Lavender with Rose Smoke",
    category: "drinks",
    description: "Ekstraksi dingin teh Earl Grey lavender 24 jam disajikan di bawah tudung kaca beraroma asap kelopak mawar organik.",
    priceUSD: "$7.50",
    priceIDR: 110000,
    rating: 4.8,
    country: "Inggris",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 247,
    name: "Ceremonial Uji Matcha Latte 24k Gold",
    category: "drinks",
    description: "Bubuk teh hijau matcha kualitas upacara Uji Kyoto dikocok tradisional dengan susu oat gandum dan serpihan emas 24k.",
    priceUSD: "$9.00",
    priceIDR: 135000,
    rating: 5.0,
    country: "Jepang",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 248,
    name: "Dragon Fruit Lychee Blossom Elixir",
    category: "drinks",
    description: "Campuran sari buah naga merah tropis, buah leci utuh segar, perasan jeruk nipis kaffir, dan sentuhan air mawar Persia.",
    priceUSD: "$5.50",
    priceIDR: 85000,
    rating: 4.8,
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 249,
    name: "Jamaica Blue Mountain Grade 1 Pour-Over",
    category: "drinks",
    description: "Biji kopi single origin pegunungan Blue Mountain Jamaika diseduh presisi dengan notes cokelat lembut dan keasaman seimbang.",
    priceUSD: "$9.50",
    priceIDR: 145000,
    rating: 4.9,
    country: "Jamaika",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 250,
    name: "Smoked Rosemary & Blood Orange Tonic",
    category: "drinks",
    description: "Sari jeruk darah Sisilia merah segar, air tonik artesius berkarbonasi tinggi, dan tangkai rosemary segar dibakar wangi.",
    priceUSD: "$6.00",
    priceIDR: 90000,
    rating: 4.8,
    country: "Italia",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  },
];

const MENU_FILTER_TABS = [
  { id: "all", label: "✨ Semua Hidangan" },
  { id: "appetizers", label: "🥗 Starters & Caviar" },
  { id: "mains", label: "🥩 Signature Mains & Steaks" },
  { id: "pasta-risotto", label: "🍝 Pasta & Risotto" },
  { id: "seafood", label: "🦞 Seafood & Lobster" },
  { id: "nusantara-asia", label: "🍛 Asian & Nusantara" },
  { id: "desserts", label: "🍰 Desserts & Pâtisserie" },
  { id: "drinks", label: "🍹 Elixirs & Mocktails" },
];

export default function DribbbleModernLandingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Cart & Wishlist state
  const [cartCount, setCartCount] = useState(2);
  const [wishlist, setWishlist] = useState<number[]>([102]);
  const [cartToast, setCartToast] = useState<string | null>(null);

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleWishlist = (id: number) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((x) => x !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const handleAddToCart = (dishName: string) => {
    setCartCount((prev) => prev + 1);
    setCartToast(`"${dishName}" ditambahkan ke keranjang pesanan!`);
    setTimeout(() => setCartToast(null), 3000);
  };

  const handleInlineReservation = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/reservation?guests=${encodeURIComponent(resGuests)}&date=${resDate}&time=${encodeURIComponent(resTime)}`);
  };

  const filteredDishes = ALL_CATALOG_DISHES.filter((d) => {
    if (activeTab === "all") return true;
    return d.category === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex flex-col justify-between selection:bg-[#EA580C] selection:text-white font-sans antialiased">
      {/* Toast Notification */}
      {cartToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#14281D] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-emerald-500/30">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{cartToast}</span>
        </div>
      )}

      {/* Modern Floating / Sticky Navbar (Section 3.1) */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E2E8F0]/70 px-6 lg:px-12 py-4 transition-all">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-display font-black text-xl shadow-cta group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="font-display text-2xl font-black tracking-tight text-[#18181B]">
                SAVOR<span className="text-[#EA580C]">IA</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold text-[#64748B] uppercase tracking-widest font-mono">
                HAUTE RESTAURANT
              </span>
            </div>
          </Link>

          {/* Center Navigation Links with Active Dot */}
          <nav className="hidden lg:flex items-center gap-8 text-[14px] font-semibold text-[#18181B]">
            <a href="#" className="text-[#EA580C] flex flex-col items-center">
              <span>Home</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mt-0.5" />
            </a>
            <a href="#popular" className="hover:text-[#EA580C] transition-colors">
              Chef&apos;s Special
            </a>
            <a href="#menu" className="hover:text-[#EA580C] transition-colors">
              Menu
            </a>
            <a href="#about" className="hover:text-[#EA580C] transition-colors">
              About Us
            </a>
            <a href="#reviews" className="hover:text-[#EA580C] transition-colors">
              Reviews
            </a>
          </nav>

          {/* Right Action Group */}
          <div className="flex items-center gap-3">
            {/* Cart Icon with Badge */}
            <Link
              href="/reservation"
              className="relative p-2.5 rounded-full bg-white hover:bg-[#F3EFE6] text-[#18181B] border border-[#E2E8F0] transition-colors shadow-sm cursor-pointer"
              title="Cart Items"
            >
              <ShoppingBag className="w-4 h-4 text-[#18181B]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EA580C] text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Session or Login */}
            {mounted && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={user.role === "admin" ? "/admin" : user.role === "kasir" ? "/pos" : "/user"}
                  className="px-4 py-2 rounded-full bg-[#14281D] hover:bg-[#0f1f16] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  title="Keluar"
                  className="p-2 rounded-full bg-white hover:bg-rose-50 text-[#64748B] hover:text-rose-600 border border-[#E2E8F0] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full border border-[#18181B]/20 hover:border-[#18181B] text-[#18181B] font-semibold text-xs bg-white transition-all shadow-sm flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Unique Key</span>
                </Link>

                <Link
                  href="/reservation"
                  className="px-5 py-2.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-cta transition-all flex items-center gap-1.5"
                >
                  <span>Reserve a Table</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-white border border-[#E2E8F0] text-[#18181B]"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[#E2E8F0] space-y-2 pb-2">
            <a
              href="#popular"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#18181B] hover:bg-[#F3EFE6]"
            >
              Chef&apos;s Special
            </a>
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#18181B] hover:bg-[#F3EFE6]"
            >
              Menu
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#18181B] hover:bg-[#F3EFE6]"
            >
              About Us
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#18181B] hover:bg-[#F3EFE6]"
            >
              Reviews
            </a>
            <div className="pt-2 border-t border-[#E2E8F0] flex gap-2">
              <Link
                href="/login"
                className="flex-1 text-center py-2 text-xs font-semibold rounded-full border border-[#18181B]/20 text-[#18181B]"
              >
                Unique Key Login
              </Link>
              <Link
                href="/reservation"
                className="flex-1 text-center py-2 text-xs font-bold rounded-full bg-[#EA580C] text-white"
              >
                Reserve Table
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Floating Elements (Section 3.2 & 4 Blueprint) */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (55% width): Editorial & Appetizing Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/25 text-[#EA580C] text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>#1 Best Culinary Experience in Town</span>
            </div>

            {/* H1 Display Title */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[64px] font-bold tracking-tight text-[#18181B] leading-[1.08]">
              Savor the Art of <br />
              <span className="text-[#EA580C] italic font-normal">Authentic & Fresh</span> <br />
              Gastronomy.
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-lg text-[#64748B] font-normal leading-relaxed max-w-[52ch]">
              Nikmati keajaiban cita rasa bintang lima yang diracik dari bahan organik segar langsung dari perkebunan terpilih, disajikan hangat dengan sentuhan seni kuliner modern.
            </p>

            {/* Dual CTA Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#popular"
                className="px-8 py-4 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-cta hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Explore Menu</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => setShowVideoModal(true)}
                className="px-6 py-4 rounded-full bg-white hover:bg-[#F3EFE6] text-[#18181B] font-bold text-sm border border-[#E2E8F0] shadow-sm transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                </div>
                <span>Watch Our Story</span>
              </button>
            </div>

            {/* Trust Metric Bar (Stacked Avatars + Rating) */}
            <div className="pt-6 border-t border-[#E2E8F0] flex items-center gap-4">
              <div className="flex -space-x-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-amber-400 overflow-hidden relative">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                    alt="Diner"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-400 overflow-hidden relative">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                    alt="Diner"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-purple-400 overflow-hidden relative">
                  <Image
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
                    alt="Diner"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-[#14281D] text-white flex items-center justify-center text-xs font-bold">
                  +12k
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  <Star className="w-4 h-4 fill-[#F59E0B]" />
                  <span className="font-bold text-xs text-[#18181B]">4.9</span>
                  <span className="text-xs text-[#64748B]">(1,420+ Reviews)</span>
                </div>
                <p className="text-xs text-[#64748B] font-medium">
                  Dipercaya oleh lebih dari 15,000+ pelanggan pencinta kuliner.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (45% width): Floating Dish Plate with Floating Cards */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Soft Ambient Glow */}
            <div className="absolute w-[420px] h-[420px] bg-gradient-to-tr from-[#EA580C]/20 via-[#F59E0B]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Main Floating Plate Container */}
            <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full p-4 bg-white/60 backdrop-blur-sm border border-[#E2E8F0] shadow-float">
              <div className="w-full h-full rounded-full overflow-hidden relative shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
                  alt="Signature Dish Plate"
                  fill
                  priority
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating Card 1 (Top-Left): 20 Mins Delivery */}
              <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-2xl p-3.5 shadow-float flex items-center gap-3 animate-float">
                <div className="w-10 h-10 rounded-xl bg-[#EA580C]/15 text-[#EA580C] flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#EA580C] font-mono block">
                    Freshly Cooked
                  </span>
                  <span className="text-xs font-bold text-[#18181B]">
                    20 Mins Serving Speed
                  </span>
                </div>
              </div>

              {/* Floating Card 2 (Bottom-Right): Mini Review Card */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-2xl p-3.5 shadow-float flex items-center gap-3 animate-float-delayed max-w-[210px]">
                <div className="w-9 h-9 rounded-full overflow-hidden relative shrink-0 border border-white">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                    alt="Reviewer"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="leading-tight">
                  <div className="flex text-[#F59E0B] text-[10px]">
                    ★★★★★
                  </div>
                  <span className="text-xs font-bold text-[#18181B] block mt-0.5">
                    Sarah Jenkins
                  </span>
                  <p className="text-[10px] text-[#64748B] line-clamp-1 italic">
                    &quot;Best Wagyu steak in town!&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Value Proposition (Section 4 Blueprint) */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono">
              WHY CHOOSE US
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#18181B]">
              The Gold Standard of Dining Experience
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Tiga pilar keunggulan yang membuat setiap jamuan Anda di Savoria tak terlupakan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-[#FDFBF7] border border-[#E2E8F0] hover:border-[#EA580C]/40 hover:shadow-card transition-all space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform">
                🥗
              </div>
              <h3 className="font-display text-xl font-bold text-[#18181B]">
                100% Fresh Ingredients
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Bahan organik bersertifikasi dipetik setiap fajar langsung dari petani lokal dan nelayan terpercaya tanpa bahan pengawet.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#FDFBF7] border border-[#E2E8F0] hover:border-[#EA580C]/40 hover:shadow-card transition-all space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform">
                👨‍🍳
              </div>
              <h3 className="font-display text-xl font-bold text-[#18181B]">
                Master Chefs Artistry
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Dipimpin langsung oleh Executive Chef pemenang penghargaan kuliner internasional dengan teknik presisi haute cuisine.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#FDFBF7] border border-[#E2E8F0] hover:border-[#EA580C]/40 hover:shadow-card transition-all space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="font-display text-xl font-bold text-[#18181B]">
                Seamless & Fast Service
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Penyajian hidangan hangat tepat waktu dengan keramahan pelayan pribadi yang sigap melayani setiap preferensi diet Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Signature Popular Dishes (Section 3.3 & 4 Blueprint) */}
      <section id="popular" className="py-20 sm:py-28 bg-[#FDFBF7] border-b border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono">
                POPULAR PICKS
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#18181B]">
                Our Signature Popular Dishes
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-xl">
                Kreasi terfavorit pilihan para tamu minggu ini. Dibuat fresh per porsi dengan bahan pilihan dan presentasi artistik.
              </p>
            </div>

            <a
              href="#menu"
              className="self-start md:self-auto px-6 py-3 rounded-full bg-white hover:bg-[#F3EFE6] text-[#18181B] font-bold text-xs border border-[#E2E8F0] shadow-sm transition-all flex items-center gap-2"
            >
              <span>Explore Full Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 4 Interactive Dish Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            {SIGNATURE_POPULAR_DISHES.map((dish) => {
              const isFav = wishlist.includes(dish.id);
              return (
                <div
                  key={dish.id}
                  className="bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group relative"
                >
                  {/* Top Edge: Circular Plate Overlapping Image */}
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-stone-100 mb-4">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-bold text-[#EA580C] uppercase tracking-wider shadow-sm">
                      {dish.badge}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(dish.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors shadow-sm ${
                        isFav
                          ? "bg-[#EA580C] text-white"
                          : "bg-white/90 text-[#64748B] hover:text-[#EA580C]"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                    </button>

                    {/* Prep & Calorie tag */}
                    <div className="absolute bottom-2 left-3 text-[10px] font-semibold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {dish.calories} • {dish.prepTime}
                    </div>
                  </div>

                  {/* Dish Details */}
                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating Line */}
                      <div className="flex items-center gap-1.5 text-xs text-[#F59E0B]">
                        <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                        <span className="font-bold text-[#18181B]">{dish.rating}</span>
                        <span className="text-[#64748B] text-[11px]">({dish.reviewsCount} reviews)</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-lg font-bold text-[#18181B] group-hover:text-[#EA580C] transition-colors line-clamp-1 mt-1">
                        {dish.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#64748B] line-clamp-2 mt-1 leading-relaxed min-h-[36px]">
                        {dish.description}
                      </p>
                    </div>

                    {/* Card Footer: Price & Add Button Aligned */}
                    <div className="pt-4 border-t border-[#E2E8F0] mt-auto flex items-center justify-between gap-2">
                      <div className="leading-tight">
                        <span className="text-[10px] text-[#64748B] font-mono block">Harga Porsi</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display text-lg font-bold text-[#18181B]">
                            {dish.priceUSD}
                          </span>
                          <span className="text-[10px] text-[#64748B] font-mono">
                            ({formatIDR(dish.priceIDR)})
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(dish.name)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#18181B] group-hover:bg-[#EA580C] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                        title="Pesan Menu"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                        <span className="leading-none">Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Our Story (Section 4 Blueprint) */}
      <section id="about" className="py-20 sm:py-28 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Photo Composition & Floating Experience Badge */}
          <div className="lg:col-span-6 relative">
            <div className="relative h-[380px] sm:h-[460px] rounded-3xl overflow-hidden shadow-2xl border border-[#E2E8F0]">
              <Image
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80"
                alt="Executive Chef preparing gourmet dish"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Overlapping Experience Badge */}
            <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:right-6 bg-[#14281D] text-white p-5 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-4 max-w-xs">
              <div className="w-12 h-12 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-bold text-2xl shrink-0">
                10+
              </div>
              <div className="leading-tight">
                <span className="font-display text-base font-bold text-white block">
                  Years of Culinary Mastery
                </span>
                <span className="text-[11px] text-stone-300 font-light">
                  Menyajikan kelezatan berkelas sejak 2015.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Story Copy & Metrics */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono">
                ABOUT OUR STORY
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#18181B] leading-tight">
                Crafting Memorable Flavors <br />
                <span className="text-[#EA580C] italic font-normal">Since 2015.</span>
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              Savoria lahir dari kecintaan mendalam terhadap seni gastronomi otentik. Kami memadukan warisan resep klasik dengan inovasi teknik kuliner modern untuk menghadirkan pengalaman bersantap yang menggugah emosi dan memori indah.
            </p>

            <p className="text-sm text-[#64748B] leading-relaxed">
              Setiap menu diuji coba secara teliti oleh Master Chef kami demi menjamin keharmonisan rasa, aroma, serta estetika tata piring berstandar internasional.
            </p>

            {/* Highlighted Pills */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E2E8F0]">
                <span className="font-display text-2xl font-bold text-[#EA580C] block">35+</span>
                <span className="text-xs font-semibold text-[#18181B]">Signature Recipes</span>
              </div>
              <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E2E8F0]">
                <span className="font-display text-2xl font-bold text-[#EA580C] block">100%</span>
                <span className="text-xs font-semibold text-[#18181B]">Halal & Organic</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/reservation"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#18181B] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-md group"
              >
                <span>Learn More About Us</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Regular Menu with Category Filter Pills (Section 3.4 & 4 Blueprint) */}
      <section id="menu" className="py-20 sm:py-28 bg-[#FDFBF7] border-b border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono">
              OUR MENUS
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#18181B]">
              Explore Our Full Culinary Menu
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Pilih dari beragam kategori hidangan lezat yang disiapkan fresh setiap hari oleh tim dapur kami.
            </p>
          </div>

          {/* Category Filter Pills (Horizontal Scroll - Section 3.4) */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {MENU_FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-pill text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-sm ${
                  activeTab === tab.id
                    ? "bg-[#EA580C] text-white shadow-cta"
                    : "bg-white text-[#64748B] hover:text-[#18181B] border border-[#E2E8F0] hover:bg-[#F3EFE6]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Menu Catalog Grid with Perfectly Aligned Cards and Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex gap-4 items-stretch hover:shadow-card hover:border-[#EA580C]/30 transition-all group h-full"
              >
                {/* Image Container with high-res object cover */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden relative shrink-0 bg-stone-100 self-center border border-[#E2E8F0]/60">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 96px, 112px"
                  />
                </div>

                {/* Content Container: flex flex-col justify-between with mt-auto on action row */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#F59E0B]">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#F59E0B]" />
                        <span className="font-bold text-[#18181B]">{item.rating}</span>
                      </div>
                      {item.country && (
                        <span className="text-[10px] text-[#64748B] font-medium bg-[#FDFBF7] px-2 py-0.5 rounded-full border border-[#E2E8F0] truncate max-w-[90px]">
                          {item.country}
                        </span>
                      )}
                    </div>

                    <h3
                      className="font-display text-base font-bold text-[#18181B] group-hover:text-[#EA580C] transition-colors line-clamp-1 mt-1"
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed mt-0.5 min-h-[32px]">
                      {item.description}
                    </p>
                  </div>

                  {/* Aligned Bottom Action Bar (Sejajar Sempurna) */}
                  <div className="pt-2 border-t border-[#F3EFE6] mt-auto flex items-center justify-between gap-2">
                    <div className="leading-tight">
                      <span className="font-display text-sm font-bold text-[#EA580C] block">
                        {item.priceUSD}
                      </span>
                      <span className="text-[10px] text-[#64748B] font-mono">
                        ({formatIDR(item.priceIDR)})
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item.name)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#18181B] group-hover:bg-[#EA580C] hover:bg-[#EA580C] text-white text-[11px] font-bold transition-all shadow-sm shrink-0 active:scale-95 cursor-pointer"
                      title={`Pesan ${item.name}`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                      <span className="leading-none">Order</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inline Table Reservation Widget (Section 3.5 & 4 Blueprint) */}
      <section className="py-16 sm:py-24 bg-[#FDFBF7]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="bg-[#14281D] text-white rounded-section p-8 sm:p-14 shadow-2xl relative overflow-hidden">
            {/* Background Accent Circle */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#EA580C]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B] font-mono">
                INSTANT RESERVATION
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-white">
                Reserve Your Table For Tonight
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto font-light">
                Pesan meja favorit Anda lebih awal untuk makan malam romantis, perjamuan keluarga, atau rapat bisnis eksekutif tanpa antrean.
              </p>
            </div>

            {/* 4 Inputs Modern Form Widget */}
            <form
              onSubmit={handleInlineReservation}
              className="relative z-10 max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {/* 1. Guests */}
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5 font-mono">
                  <Users className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Jumlah Tamu</span>
                </label>
                <select
                  value={resGuests}
                  onChange={(e) => setResGuests(e.target.value)}
                  className="w-full text-xs font-semibold text-white bg-white/10 border border-white/20 rounded-xl px-3.5 py-3 focus:outline-none focus:border-[#EA580C] cursor-pointer"
                >
                  <option value="1 Person" className="text-black">1 Person</option>
                  <option value="2 People" className="text-black">2 People (Romantic)</option>
                  <option value="4 People" className="text-black">4 People (Family Table)</option>
                  <option value="6 People" className="text-black">6 People</option>
                  <option value="8+ People" className="text-black">8+ People (VIP Chamber)</option>
                </select>
              </div>

              {/* 2. Date */}
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Tanggal</span>
                </label>
                <input
                  type="date"
                  value={resDate}
                  onChange={(e) => setResDate(e.target.value)}
                  className="w-full text-xs font-semibold text-white bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              {/* 3. Time */}
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Waktu Santap</span>
                </label>
                <select
                  value={resTime}
                  onChange={(e) => setResTime(e.target.value)}
                  className="w-full text-xs font-semibold text-white bg-white/10 border border-white/20 rounded-xl px-3.5 py-3 focus:outline-none focus:border-[#EA580C] cursor-pointer"
                >
                  <option value="12:00 PM" className="text-black">12:00 PM (Lunch)</option>
                  <option value="01:00 PM" className="text-black">01:00 PM (Lunch)</option>
                  <option value="06:30 PM" className="text-black">06:30 PM (Dinner)</option>
                  <option value="07:30 PM" className="text-black">07:30 PM (Peak Dinner)</option>
                  <option value="08:30 PM" className="text-black">08:30 PM (Evening)</option>
                </select>
              </div>

              {/* 4. Action Button */}
              <div className="space-y-1 flex flex-col justify-end">
                <button
                  type="submit"
                  className="w-full h-[44px] bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow-cta transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book a Table Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Customer Reviews / Testimonials (Section 3.1 & 4 Blueprint) */}
      <section id="reviews" className="py-20 sm:py-28 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono">
              TESTIMONIALS
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#18181B]">
              Loved by Foodies Around the Globe
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Pengalaman nyata dari ribuan tamu kehormatan yang menikmati jamuan istimewa di Savoria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-card bg-[#FDFBF7] border border-[#E2E8F0] space-y-4 shadow-sm">
              <div className="flex text-[#F59E0B] text-sm">★★★★★</div>
              <p className="text-xs sm:text-sm text-[#18181B] italic leading-relaxed">
                &quot;Miyazaki Wagyu Tenderloin A5 nya benar-benar lumer di lidah. Pelayanan sangat cepat, ramah, dan suasana restorannya begitu hangat nan elegan.&quot;
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden relative border border-[#E2E8F0]">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Customer"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#18181B]">Jessica Wijaya</h4>
                  <span className="text-[11px] text-[#64748B]">Food Critic & Blogger</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-card bg-[#FDFBF7] border border-[#E2E8F0] space-y-4 shadow-sm">
              <div className="flex text-[#F59E0B] text-sm">★★★★★</div>
              <p className="text-xs sm:text-sm text-[#18181B] italic leading-relaxed">
                &quot;Pemesanan meja lewat website sangat mulus dalam 1 klik. Struk digital dengan QR pass nya memudahkan proses check-in saat kami tiba.&quot;
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden relative border border-[#E2E8F0]">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    alt="Customer"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#18181B]">Dr. Michael Tan</h4>
                  <span className="text-[11px] text-[#64748B]">VIP Patron</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-card bg-[#FDFBF7] border border-[#E2E8F0] space-y-4 shadow-sm">
              <div className="flex text-[#F59E0B] text-sm">★★★★★</div>
              <p className="text-xs sm:text-sm text-[#18181B] italic leading-relaxed">
                &quot;Truffle Pesto Linguine dan Tasmanian Salmon adalah mahakarya terbaik! Bahan organiknya terasa begitu segar. Sangat direkomendasikan.&quot;
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden relative border border-[#E2E8F0]">
                  <Image
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
                    alt="Customer"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#18181B]">Amanda Roberts</h4>
                  <span className="text-[11px] text-[#64748B]">Culinary Enthusiast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Story Modal Dialog */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14281D] text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-white/20 relative shadow-2xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
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
              onClick={() => setShowVideoModal(false)}
              className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-xl text-xs"
            >
              Tutup Video
            </button>
          </div>
        </div>
      )}

      {/* Modern Deep Obsidian Footer (Section 4 Blueprint) */}
      <footer className="bg-[#14281D] text-white px-6 lg:px-12 py-16 text-xs border-t border-[#1a3527]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Logo & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-display font-black text-lg">
                S
              </div>
              <span className="font-display text-2xl font-bold text-white tracking-tight">
                SAVOR<span className="text-[#EA580C]">IA</span>
              </span>
            </div>
            <p className="text-xs text-stone-300 font-light leading-relaxed">
              Modern culinary sanctuary blending artisanal heritage recipes with contemporary gastronomic artistry.
            </p>
            <p className="text-[11px] text-stone-400 font-mono">
              The Grand Pavilion • SCBD Jakarta • Open Daily: 10:00 - 22:00
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[#F59E0B] text-xs font-mono">
              Quick Navigation
            </h4>
            <div className="flex flex-col space-y-2 text-stone-300">
              <a href="#" className="hover:text-white transition-colors">Home</a>
              <a href="#popular" className="hover:text-white transition-colors">Chef&apos;s Specials</a>
              <a href="#menu" className="hover:text-white transition-colors">Full Menu Catalog</a>
              <a href="#about" className="hover:text-white transition-colors">About Our Story</a>
              <Link href="/reservation" className="hover:text-white transition-colors">Reserve a Table</Link>
            </div>
          </div>

          {/* Col 3: Hours & Contact */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[#F59E0B] text-xs font-mono">
              Opening Hours & Contact
            </h4>
            <div className="space-y-1.5 text-stone-300">
              <p>Senin - Jumat: 10:00 - 22:00</p>
              <p>Sabtu - Minggu: 09:30 - 23:00</p>
              <p className="pt-2 text-white font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>+62 21 515 8899</span>
              </p>
              <p className="text-stone-400">reservations@savoria-resto.com</p>
            </div>
          </div>

          {/* Col 4: Unique Key Security Portal */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[#F59E0B] text-xs font-mono">
              Portal Akses (Unique Key)
            </h4>
            <p className="text-[11px] text-stone-300">
              Otorisasi otomatis sesuai wewenang Unique Security Key Anda:
            </p>
            <div className="flex flex-col space-y-2 text-stone-300">
              <Link href="/login" className="hover:text-[#EA580C] transition-colors flex items-center gap-1.5 font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-[#EA580C]" />
                <span>Login Unique Key</span>
              </Link>
              <Link href="/user" className="hover:text-white transition-colors">
                Portal Pelanggan VIP
              </Link>
              <Link href="/pos" className="hover:text-white transition-colors">
                Terminal POS Kasir
              </Link>
              <Link href="/admin" className="hover:text-white transition-colors">
                Dashboard Admin GM
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-3">
          <span>© 2026 Savoria Modern Restaurant Ltd • All Rights Reserved</span>
          <div className="flex gap-4">
            <span className="hover:text-white">Privacy Policy</span>
            <span className="hover:text-white">Terms of Dining</span>
            <span className="hover:text-white">Halal & Dietary Transparency</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
