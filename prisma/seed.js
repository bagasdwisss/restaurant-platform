const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning previous database records ---');
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cashierShift.deleteMany();
  await prisma.waiterCall.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.modifierOption.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  console.log('--- Seeding 3 Roles with Dedicated Unique Keys ---');
  // 1. ADMIN
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@royale.com',
      password: 'admin123',
      name: 'Executive Chef Alexandre de Fontaine',
      role: 'admin',
      uniqueKey: 'ROYALE-ADMIN-SECRET-KEY',
      phone: '+62 811 9900 1111',
    },
  });

  // 2. KASIR
  const kasirUser = await prisma.user.create({
    data: {
      username: 'kasir',
      email: 'kasir@royale.com',
      password: 'kasir123',
      name: 'Jean-Luc Laurent (Head Maître D\' & Cashier)',
      role: 'kasir',
      uniqueKey: 'ROYALE-CASHIER-ACCESS-KEY',
      phone: '+62 811 9900 2222',
    },
  });

  // 3. USER
  const customerUser = await prisma.user.create({
    data: {
      username: 'user',
      email: 'user@royale.com',
      password: 'user123',
      name: 'Lord Aditya Pratama (VIP Patron)',
      role: 'user',
      uniqueKey: 'ROYALE-VIP-CUSTOMER-KEY',
      phone: '+62 811 9900 3333',
    },
  });

  console.log('--- Seeding Luxury 5-Star Tables & Salons ---');
  const tablesData = [
    { tableNumber: 'Meja 01 - Emerald Window', capacity: 2, qrToken: 'royale-tbl-01', status: 'available', area: 'Grand Salon Royale' },
    { tableNumber: 'Meja 02 - Baccarat Chandelier', capacity: 4, qrToken: 'royale-tbl-02', status: 'available', area: 'Grand Salon Royale' },
    { tableNumber: 'Meja 03 - Velvet Alcove', capacity: 4, qrToken: 'royale-tbl-03', status: 'occupied', area: 'Grand Salon Royale' },
    { tableNumber: 'Meja 04 - Imperial Round Table', capacity: 6, qrToken: 'royale-tbl-04', status: 'available', area: 'Grand Salon Royale' },
    { tableNumber: 'Meja 05 - Rose Garden Pavilion', capacity: 2, qrToken: 'royale-tbl-05', status: 'available', area: 'The Glasshouse Veranda' },
    { tableNumber: 'Meja 06 - Starry Sky Terrace', capacity: 4, qrToken: 'royale-tbl-06', status: 'available', area: 'The Glasshouse Veranda' },
    { tableNumber: 'Meja 07 - Courtyard Water Fountain', capacity: 6, qrToken: 'royale-tbl-07', status: 'available', area: 'The Glasshouse Veranda' },
    { tableNumber: 'VIP Suite 01 - Salon Impérial', capacity: 8, qrToken: 'royale-tbl-vip01', status: 'available', area: 'Private Suite Impériale' },
    { tableNumber: 'VIP Suite 02 - Presidential Chamber', capacity: 12, qrToken: 'royale-tbl-vip02', status: 'reserved', area: 'Private Suite Impériale' },
    { tableNumber: 'The Chef\'s Atelier - Omakase Counter', capacity: 6, qrToken: 'royale-tbl-chef01', status: 'available', area: 'Chef\'s Culinary Theater' },
  ];

  const createdTables = [];
  for (const t of tablesData) {
    const table = await prisma.table.create({ data: t });
    createdTables.push(table);
  }

  console.log('--- Seeding Worldwide Haute Cuisine Categories ---');
  const catHors = await prisma.category.create({
    data: { name: 'Premier Hors d\'œuvres & Caviar', slug: 'appetizers', sortOrder: 1 },
  });
  const catMains = await prisma.category.create({
    data: { name: 'Plats Principaux (Signature World Mains)', slug: 'mains', sortOrder: 2 },
  });
  const catNusantara = await prisma.category.create({
    data: { name: 'Nusantara Heritage Reimagined', slug: 'nusantara', sortOrder: 3 },
  });
  const catDesserts = await prisma.category.create({
    data: { name: 'Desserts d\'Exception & Pâtisserie', slug: 'desserts', sortOrder: 4 },
  });
  const catBeverages = await prisma.category.create({
    data: { name: 'Grands Crus Cellar & Elixirs', slug: 'beverages', sortOrder: 5 },
  });

  console.log('--- Seeding Worldwide Gourmet Ingredients for Recipes ---');
  const ingWagyu = await prisma.ingredient.create({
    data: { name: 'Miyazaki Wagyu A5 BMS 12 (g)', unit: 'g', stockQuantity: 15000, minStock: 2000 },
  });
  const ingCaviar = await prisma.ingredient.create({
    data: { name: 'Oscietra Royal Caviar (g)', unit: 'g', stockQuantity: 2000, minStock: 300 },
  });
  const ingTruffle = await prisma.ingredient.create({
    data: { name: 'Perigord Black Truffle (g)', unit: 'g', stockQuantity: 1200, minStock: 150 },
  });
  const ingLobster = await prisma.ingredient.create({
    data: { name: 'Brittany Blue Lobster (ekor)', unit: 'ekor', stockQuantity: 40, minStock: 5 },
  });
  const ingFoieGras = await prisma.ingredient.create({
    data: { name: 'Rougié Foie Gras (g)', unit: 'g', stockQuantity: 5000, minStock: 800 },
  });
  const ingKingCrab = await prisma.ingredient.create({
    data: { name: 'Barents Sea Red King Crab (g)', unit: 'g', stockQuantity: 8000, minStock: 1000 },
  });

  console.log('--- Seeding Worldwide Dishes with Modifiers & Recipes ---');

  // DISH 1: PRANCIS - Miyazaki Wagyu A5 Rossini
  const mWagyuRossini = await prisma.menu.create({
    data: {
      categoryId: catMains.id,
      name: 'Miyazaki Wagyu A5 Tenderloin Rossini',
      country: 'Prancis',
      description: 'Daging Wagyu Jepang A5 BMS 12 dipanggang sempurna, dilapisi pan-seared Rougié Foie Gras, irisan Périgord Black Truffle segar, kentang purée mentega Prancis, dan saus jus Madeira.',
      price: 1450000,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  await prisma.modifierGroup.create({
    data: {
      menuId: mWagyuRossini.id,
      name: 'Tingkat Kematangan Daging (Doneness)',
      minSelection: 1,
      maxSelection: 1,
      options: {
        create: [
          { name: 'Rare (Warm Red Center)', price: 0 },
          { name: 'Medium Rare (Rekomendasi Chef)', price: 0 },
          { name: 'Medium (Pink Tender Center)', price: 0 },
          { name: 'Medium Well', price: 0 },
        ],
      },
    },
  });

  await prisma.recipe.createMany({
    data: [
      { menuId: mWagyuRossini.id, ingredientId: ingWagyu.id, quantityNeeded: 200 },
      { menuId: mWagyuRossini.id, ingredientId: ingFoieGras.id, quantityNeeded: 60 },
      { menuId: mWagyuRossini.id, ingredientId: ingTruffle.id, quantityNeeded: 10 },
    ],
  });

  // DISH 2: PRANCIS - Caviar Kristal Oscietra Royal
  const mCaviar = await prisma.menu.create({
    data: {
      categoryId: catHors.id,
      name: 'Caviar Kristal Oscietra Royal (30g)',
      country: 'Prancis',
      description: '30 gram butiran telur sturgeon Oscietra terbaik disajikan di atas mangkuk es kristal Baccarat, dilengkapi blinis hangat buatan tangan, crème fraîche Normandy, dan cincangan telur puyuh organik.',
      price: 850000,
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  await prisma.recipe.create({
    data: { menuId: mCaviar.id, ingredientId: ingCaviar.id, quantityNeeded: 30 },
  });

  // DISH 3: PRANCIS - Lobster Thermidor au Cognac
  const mLobster = await prisma.menu.create({
    data: {
      categoryId: catMains.id,
      name: 'Lobster Thermidor au Hennessy Cognac',
      country: 'Prancis',
      description: 'Lobster biru utuh dipanggang dalam cangkangnya dengan velouté krim Dijon mustard, keju Gruyère Swiss berusia 18 bulan, dan flambé aroma Hennessy XO Cognac.',
      price: 920000,
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  await prisma.recipe.create({
    data: { menuId: mLobster.id, ingredientId: ingLobster.id, quantityNeeded: 1 },
  });

  // DISH 4: JEPANG - Miyazaki Wagyu A5 Sukiyaki Royale
  const mSukiyaki = await prisma.menu.create({
    data: {
      categoryId: catMains.id,
      name: 'Miyazaki Wagyu A5 Sukiyaki Royale BMS 12',
      country: 'Jepang',
      description: 'Irisan daging Wagyu A5 bersertifikasi halal dari prefektur Miyazaki direbus perlahan dalam warishita manis-gurih berusia 50 tahun, jamur Matsutake, tahu bakar artisan, dan telur onsen omega berbalut emas.',
      price: 1250000,
      image: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // DISH 5: JEPANG - Omakase Nigiri Otoro & Uni Hokkaido
  const mOmakase = await prisma.menu.create({
    data: {
      categoryId: catHors.id,
      name: 'Omakase Nigiri Duo: Hon Maguro Otoro & Uni Hokkaido',
      country: 'Jepang',
      description: 'Sajian dua potong nigiri legendaris: tuna Otoro berlemak tebal dibakar tipis aburi dengan caviar, serta landak laut Uni segar langsung dari perairan dingin Hokkaido di atas nasi cuka merah akazu.',
      price: 880000,
      image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // DISH 6: ITALIA - Risotto al Tartufo Bianco d'Alba
  const mRisotto = await prisma.menu.create({
    data: {
      categoryId: catMains.id,
      name: 'Risotto al Tartufo Bianco d\'Alba con Parmigiano 36 Bulan',
      country: 'Italia',
      description: 'Beras Carnaroli superfino dimasak perlahan dengan kaldu capon emas, mentega Normandia, keju Parmigiano-Reggiano usia 36 bulan, dan parutan White Truffle segar dari perbukitan Alba, Italia.',
      price: 690000,
      image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // DISH 7: SKANDINAVIA - Barents Sea King Crab au Beurre Fumé
  const mKingCrab = await prisma.menu.create({
    data: {
      categoryId: catMains.id,
      name: 'Barents Sea King Crab au Beurre Fumé & Emulsion d\'Aneth',
      country: 'Skandinavia',
      description: 'Kaki kepiting raja raksasa dari Laut Barents yang manis gurih, dipanggang dengan mentega asap kayu apel, emulsi daun adas dill Norwegia, dan remah brioche mentega renyah.',
      price: 980000,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  await prisma.recipe.create({
    data: { menuId: mKingCrab.id, ingredientId: ingKingCrab.id, quantityNeeded: 250 },
  });

  // DISH 8: AMERIKA LATIN / NIKKEI - Ceviche de Langouste Royale
  const mCeviche = await prisma.menu.create({
    data: {
      categoryId: catHors.id,
      name: 'Ceviche de Langouste Royale aux Perles de Yuzu',
      country: 'Peru',
      description: 'Daging lobster karang dingin dimarinasi dalam kuah asam segar Leche de Tigre buah markisa dan air jeruk yuzu, disajikan dengan irisan bawang merah chulpe, ubi ungu krispi, dan kaviar zaitun.',
      price: 540000,
      image: 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // DISH 9: NUSANTARA - Rendang Wagyu Short Ribs 48-Hour Sous Vide
  const mRendang = await prisma.menu.create({
    data: {
      categoryId: catNusantara.id,
      name: 'Rendang Short Ribs Wagyu 48-Hour Sous Vide',
      country: 'Nusantara',
      description: 'Iga pendek Wagyu marbling 9 dimasak lambat metode sous-vide selama 48 jam hingga lumer, dibalut pasta rendang karamel kelapa parut gongseng Payakumbuh, gel santan asam kandis, dan keripik singkong emas.',
      price: 580000,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // DISH 10: NUSANTARA - Gulai Bebek Betutu Confit Warisan Keraton
  const mBebek = await prisma.menu.create({
    data: {
      categoryId: catNusantara.id,
      name: 'Bebek Betutu Confit aux Epices Nobles',
      country: 'Nusantara',
      description: 'Paha bebek Prancis dimasak confit dalam minyak rempah 18 bumbu base genep Bali, disajikan dengan kuah gulai kental saffron kecombrang, lawar kacang panjang asap, dan sambal matah minyak kelapa murni.',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1514944298352-7a8e0f6c2578?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // DISH 11: PRANCIS DESSERT - Soufflé Chaud au Grand Marnier
  const mSouffle = await prisma.menu.create({
    data: {
      categoryId: catDesserts.id,
      name: 'Soufflé Chaud au Grand Marnier Cuvée du Centenaire',
      country: 'Prancis',
      description: 'Kue soufflé klasik Prancis mengembang lembut dengan aroma kulit jeruk likur Grand Marnier 100th anniversary, disajikan dengan es krim vanila Madagaskar buatan tangan dan lembaran emas 24k.',
      price: 280000,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // DISH 12: PRANCIS DESSERT - Sphère Chocolat Noir Valrhona 70%
  const mSphere = await prisma.menu.create({
    data: {
      categoryId: catDesserts.id,
      name: 'Sphère Chocolat Noir Valrhona Guanaja 70%',
      country: 'Prancis',
      description: 'Bola cokelat hitam Valrhona 70% berkilau yang meleleh saat disiram saus karamel mentega asin Isigny Sainte-Mère panas, mengungkap mousse praline hazelnut Piedmont di dalamnya.',
      price: 320000,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // DISH 13: CHAMPAGNE - Dom Pérignon Vintage Brut Champagne
  const mChampagne = await prisma.menu.create({
    data: {
      categoryId: catBeverages.id,
      name: 'Dom Pérignon Vintage Brut Champagne (Botol 750ml)',
      country: 'Prancis',
      description: 'Koleksi Champagne legendaris dari Épernay Prancis dengan aroma pir mentega, bunga putih, brioche panggang, dan buih gelembung ultra-halus yang menari di lidah.',
      price: 4500000,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // DISH 14: ARTISANAL COFFEE - Jamaica Blue Mountain Specialty Pour-Over
  const mCoffee = await prisma.menu.create({
    data: {
      categoryId: catBeverages.id,
      name: 'Jamaica Blue Mountain Grade 1 Reserve Pour-Over',
      country: 'Kuba / Karibia',
      description: 'Biji kopi paling bergengsi di dunia dari lereng berkabut Blue Mountains Jamaika, diseduh manual dengan air mineral mata air pegunungan pada suhu presisi 92°C.',
      price: 180000,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  console.log('--- Seeding Sample Active Shift for Maître D\' ---');
  await prisma.cashierShift.create({
    data: {
      cashierName: 'Jean-Luc Laurent (Head Maître D\')',
      userId: kasirUser.id,
      startCash: 1000000,
      status: 'open',
    },
  });

  console.log('--- Seeding Initial VIP Reservation Order ---');
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20261014-9901',
      tableId: createdTables[7].id, // VIP Suite 01
      userId: customerUser.id,
      customerName: 'Lord Aditya Pratama (VIP Patron)',
      customerPhone: '+62 811 9900 3333',
      reservationDate: '2026-10-14',
      reservationTime: '19:30 - Grand Dinner Gala',
      guestCount: 4,
      specialRequests: 'Perayaan ulang tahun VIP, sediakan sommelier untuk wine pairing.',
      orderType: 'reservation',
      status: 'confirmed',
      subtotal: 3220000,
      taxAmount: 322000,
      serviceCharge: 161000,
      totalAmount: 3703000,
      paymentStatus: 'paid',
      paymentMethod: 'qris',
      items: {
        create: [
          {
            menuId: mWagyuRossini.id,
            quantity: 2,
            unitPrice: 1450000,
            subtotal: 2900000,
            notes: 'Medium Rare, extra Perigord Truffle',
          },
          {
            menuId: mSouffle.id,
            quantity: 1,
            unitPrice: 280000,
            subtotal: 280000,
            notes: 'Sajikan tepat 20 menit setelah hidangan utama',
          },
          {
            menuId: mCoffee.id,
            quantity: 2,
            unitPrice: 180000,
            subtotal: 360000,
            notes: 'Single Origin Black',
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: sampleOrder.id,
      method: 'qris',
      amountPaid: 3703000,
      changeAmount: 0,
      paymentRef: 'QRIS-ROYALE-GALA-001',
    },
  });

  console.log('✅ Database Seeding completed successfully with Worldwide Fine-Dining Menus & 3 Role Unique Keys!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
