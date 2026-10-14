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
      email: 'admin@savoria.com',
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
      email: 'kasir@savoria.com',
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
      email: 'user@savoria.com',
      password: 'user123',
      name: 'Lord Aditya Pratama (VIP Patron)',
      role: 'user',
      uniqueKey: 'ROYALE-VIP-CUSTOMER-KEY',
      phone: '+62 811 9900 3333',
    },
  });

  console.log('--- Seeding Luxury 5-Star Tables & Salons ---');
  const tablesData = [
    { tableNumber: 'Meja 01 - Emerald Window', capacity: 2, qrToken: 'savoria-tbl-01', status: 'available', area: 'Grand Salon Royale' },
    { tableNumber: 'Meja 02 - Baccarat Chandelier', capacity: 4, qrToken: 'savoria-tbl-02', status: 'available', area: 'Grand Salon Royale' },
    { tableNumber: 'Meja 03 - Velvet Alcove', capacity: 4, qrToken: 'savoria-tbl-03', status: 'occupied', area: 'Grand Salon Royale' },
    { tableNumber: 'Meja 04 - Imperial Round Table', capacity: 6, qrToken: 'savoria-tbl-04', status: 'available', area: 'Grand Salon Royale' },
    { tableNumber: 'Meja 05 - Rose Garden Pavilion', capacity: 2, qrToken: 'savoria-tbl-05', status: 'available', area: 'The Glasshouse Veranda' },
    { tableNumber: 'Meja 06 - Starry Sky Terrace', capacity: 4, qrToken: 'savoria-tbl-06', status: 'available', area: 'The Glasshouse Veranda' },
    { tableNumber: 'Meja 07 - Courtyard Water Fountain', capacity: 6, qrToken: 'savoria-tbl-07', status: 'available', area: 'The Glasshouse Veranda' },
    { tableNumber: 'VIP Suite 01 - Salon Impérial', capacity: 8, qrToken: 'savoria-tbl-vip01', status: 'available', area: 'Private Suite Impériale' },
    { tableNumber: 'VIP Suite 02 - Presidential Chamber', capacity: 12, qrToken: 'savoria-tbl-vip02', status: 'reserved', area: 'Private Suite Impériale' },
    { tableNumber: 'The Chef\'s Atelier - Omakase Counter', capacity: 6, qrToken: 'savoria-tbl-chef01', status: 'available', area: 'Chef\'s Culinary Theater' },
  ];

  const createdTables = [];
  for (const t of tablesData) {
    const table = await prisma.table.create({ data: t });
    createdTables.push(table);
  }

  console.log('--- Seeding 7 Rich Culinary Categories ---');
  const catAppetizers = await prisma.category.create({
    data: { name: 'Premier Appetizers & Starters', slug: 'appetizers', sortOrder: 1 },
  });
  const catMains = await prisma.category.create({
    data: { name: 'World Signature Mains & Steaks', slug: 'mains', sortOrder: 2 },
  });
  const catPasta = await prisma.category.create({
    data: { name: 'Artisanal Pasta & Truffle Risotto', slug: 'pasta-risotto', sortOrder: 3 },
  });
  const catSeafood = await prisma.category.create({
    data: { name: 'Seafood Extravaganza & Ocean Treasures', slug: 'seafood', sortOrder: 4 },
  });
  const catAsian = await prisma.category.create({
    data: { name: 'Asian & Nusantara Heritage Reimagined', slug: 'nusantara-asia', sortOrder: 5 },
  });
  const catDesserts = await prisma.category.create({
    data: { name: 'Chef\'s Atelier Desserts & Pâtisserie', slug: 'desserts', sortOrder: 6 },
  });
  const catBeverages = await prisma.category.create({
    data: { name: 'Grands Crus, Elixirs & Mocktails', slug: 'beverages', sortOrder: 7 },
  });

  console.log('--- Seeding Raw Ingredients for Recipe BOM ---');
  const ingWagyuA5 = await prisma.ingredient.create({
    data: { name: 'Miyazaki Wagyu A5 BMS 12 (g)', unit: 'g', stockQuantity: 25000, minStock: 3000 },
  });
  const ingAngus = await prisma.ingredient.create({
    data: { name: 'Australian Black Angus Beef (g)', unit: 'g', stockQuantity: 40000, minStock: 5000 },
  });
  const ingLamb = await prisma.ingredient.create({
    data: { name: 'NZ Lumina Lamb Rack (g)', unit: 'g', stockQuantity: 20000, minStock: 2500 },
  });
  const ingCaviar = await prisma.ingredient.create({
    data: { name: 'Oscietra Royal Caviar (g)', unit: 'g', stockQuantity: 5000, minStock: 500 },
  });
  const ingTruffle = await prisma.ingredient.create({
    data: { name: 'Périgord Black Truffle (g)', unit: 'g', stockQuantity: 3000, minStock: 300 },
  });
  const ingLobster = await prisma.ingredient.create({
    data: { name: 'Brittany Blue Lobster (ekor)', unit: 'ekor', stockQuantity: 60, minStock: 10 },
  });
  const ingKingCrab = await prisma.ingredient.create({
    data: { name: 'Barents Sea King Crab (g)', unit: 'g', stockQuantity: 15000, minStock: 2000 },
  });
  const ingSeaBass = await prisma.ingredient.create({
    data: { name: 'Chilean Sea Bass Fillet (g)', unit: 'g', stockQuantity: 18000, minStock: 2000 },
  });
  const ingScallop = await prisma.ingredient.create({
    data: { name: 'Hokkaido Scallop Sashimi (g)', unit: 'g', stockQuantity: 12000, minStock: 1500 },
  });
  const ingFoieGras = await prisma.ingredient.create({
    data: { name: 'Rougié Foie Gras (g)', unit: 'g', stockQuantity: 8000, minStock: 1000 },
  });
  const ingDuck = await prisma.ingredient.create({
    data: { name: 'French Magret Duck Breast (g)', unit: 'g', stockQuantity: 14000, minStock: 1500 },
  });
  const ingValrhona = await prisma.ingredient.create({
    data: { name: 'Valrhona Guanaja 70% Dark Chocolate (g)', unit: 'g', stockQuantity: 15000, minStock: 2000 },
  });
  const ingChampagne = await prisma.ingredient.create({
    data: { name: 'Dom Pérignon Vintage Bottles (botol)', unit: 'botol', stockQuantity: 30, minStock: 5 },
  });
  const ingCoffeeBeans = await prisma.ingredient.create({
    data: { name: 'Jamaica Blue Mountain Grade 1 Beans (g)', unit: 'g', stockQuantity: 10000, minStock: 1000 },
  });

  console.log('--- Seeding Menus & Modifiers ---');

  // ==========================================
  // CATEGORY 1: APPETIZERS & STARTERS (5 items)
  // ==========================================
  const mCaviar = await prisma.menu.create({
    data: {
      categoryId: catAppetizers.id,
      name: 'Caviar Kristal Oscietra Royal (30g)',
      country: 'Prancis',
      description: '30 gram butiran kaviar sturgeon Oscietra royal disajikan di atas mangkuk kristal es, dilengkapi blinis hangat buatan tangan, crème fraîche Normandy, dan cincangan telur puyuh organik.',
      price: 850000,
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });
  await prisma.recipe.create({
    data: { menuId: mCaviar.id, ingredientId: ingCaviar.id, quantityNeeded: 30 },
  });

  const mScallop = await prisma.menu.create({
    data: {
      categoryId: catAppetizers.id,
      name: 'Hokkaido Scallop Carpaccio & Yuzu Pearls',
      country: 'Jepang',
      description: 'Kerang simping Hokkaido segar diiris tipis, disajikan dengan mutiara perasan jeruk yuzu, minyak zaitun Liguria, microgreens, dan taburan sea salt Maldon kristal.',
      price: 320000,
      image: 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });
  await prisma.recipe.create({
    data: { menuId: mScallop.id, ingredientId: ingScallop.id, quantityNeeded: 120 },
  });

  const mEscargot = await prisma.menu.create({
    data: {
      categoryId: catAppetizers.id,
      name: 'French Truffle Escargot à la Bourguignonne',
      country: 'Prancis',
      description: 'Bekicot liar Burgundy Prancis dipanggang dalam cangkangnya dengan mentega herba bawang putih, peterseli segar, percikan anggur putih Chablis, dan irisan sourdough panggang hangat.',
      price: 260000,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mBeefTartare = await prisma.menu.create({
    data: {
      categoryId: catAppetizers.id,
      name: 'Wagyu Beef Tartare with Quail Egg & Black Truffle',
      country: 'Prancis',
      description: 'Daging sapi Wagyu segar dicincang pisau tangan, dibumbui capers, mustard dijon, saus Worcestershire, kuning telur puyuh organik, dan serutan truffle Périgord segar di atas roti brioche renyah.',
      price: 340000,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });
  await prisma.recipe.create({
    data: { menuId: mBeefTartare.id, ingredientId: ingWagyuA5.id, quantityNeeded: 100 },
  });

  const mMushroomVeloute = await prisma.menu.create({
    data: {
      categoryId: catAppetizers.id,
      name: 'Wild Forest Mushroom Velouté with Garlic Brioche',
      country: 'Italia',
      description: 'Sup krim kental dari perpaduan jamur Porcini, Morels, dan Chanterelles dengan minyak truffle putih Italia, busa krim susu alpine, dan brioche bawang putih panggang renyah.',
      price: 180000,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // ==========================================
  // CATEGORY 2: WORLD SIGNATURE MAINS & STEAKS (5 items)
  // ==========================================
  const mWagyuRossini = await prisma.menu.create({
    data: {
      categoryId: catMains.id,
      name: 'Miyazaki Wagyu A5 Tenderloin Rossini',
      country: 'Prancis',
      description: 'Daging Wagyu Jepang A5 BMS 12 dipanggang sempurna, dilapisi pan-seared Rougié Foie Gras, irisan Périgord Black Truffle segar, kentang purée mentega Prancis, dan saus jus anggur Madeira.',
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
      { menuId: mWagyuRossini.id, ingredientId: ingWagyuA5.id, quantityNeeded: 200 },
      { menuId: mWagyuRossini.id, ingredientId: ingFoieGras.id, quantityNeeded: 60 },
      { menuId: mWagyuRossini.id, ingredientId: ingTruffle.id, quantityNeeded: 10 },
    ],
  });

  const mTomahawk = await prisma.menu.create({
    data: {
      categoryId: catMains.id,
      name: 'Australian Black Angus Tomahawk MB7 (1.2kg Sharing)',
      country: 'Australia',
      description: 'Steak tomahawk bertulang utuh 1.2 kg dari sapi Black Angus Australia marbling 7, dipanggang di atas arang kayu apel, disajikan dengan roasted garlic bulb, bone marrow butter, dan 3 pilihan saus istimewa.',
      price: 1850000,
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  await prisma.modifierGroup.create({
    data: {
      menuId: mTomahawk.id,
      name: 'Pilihan Saus Steak',
      minSelection: 1,
      maxSelection: 2,
      options: {
        create: [
          { name: 'Truffle Mushroom Demi-Glace', price: 0 },
          { name: 'Green Peppercorn Cognac', price: 0 },
          { name: 'Chimichurri Fresh Herbs', price: 0 },
          { name: 'Béarnaise Classic Butter', price: 25000 },
        ],
      },
    },
  });

  await prisma.recipe.create({
    data: { menuId: mTomahawk.id, ingredientId: ingAngus.id, quantityNeeded: 1200 },
  });

  const mLambRack = await prisma.menu.create({
    data: {
      categoryId: catMains.id,
      name: 'New Zealand Lumina Lamb Rack with Herb Crust',
      country: 'Selandia Baru',
      description: 'Iga domba Lumina lembut berbalut rempah panko aromatik, disajikan bersama purée kacang polong manis mint, wortel madu panggang, dan saus jus rosemary wangi.',
      price: 680000,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });
  await prisma.recipe.create({
    data: { menuId: mLambRack.id, ingredientId: ingLamb.id, quantityNeeded: 350 },
  });

  const mDuckBreast = await prisma.menu.create({
    data: {
      categoryId: catMains.id,
      name: 'Roasted French Duck Breast with Cherry Port Reduction',
      country: 'Prancis',
      description: 'Dada bebek Magret Prancis dipanggang medium rare dengan kulit renyah berkilau madu lavender, purée ubi parsnip lembut, dan saus reduksi buah ceri anggur Port asam manis seimbang.',
      price: 480000,
      image: 'https://images.unsplash.com/photo-1514944298352-7a8e0f6c2578?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });
  await prisma.recipe.create({
    data: { menuId: mDuckBreast.id, ingredientId: ingDuck.id, quantityNeeded: 280 },
  });

  const mRibeye = await prisma.menu.create({
    data: {
      categoryId: catMains.id,
      name: 'USDA Prime Dry-Aged Ribeye 350g (45 Days Aged)',
      country: 'Amerika Serikat',
      description: 'Potongan daging ribeye kualitas USDA Prime yang melalui proses dry-aging selama 45 hari untuk cita rasa gurih kacang yang intens, disajikan dengan kentang panggang truffle dan mentega bawang putih herba.',
      price: 890000,
      image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // ==========================================
  // CATEGORY 3: ARTISANAL PASTA & TRUFFLE RISOTTO (5 items)
  // ==========================================
  const mRisotto = await prisma.menu.create({
    data: {
      categoryId: catPasta.id,
      name: 'Risotto al Tartufo Bianco d\'Alba con Parmigiano 36 Bulan',
      country: 'Italia',
      description: 'Beras Carnaroli superfino dimasak perlahan dengan kaldu capon emas, mentega Normandia, keju Parmigiano-Reggiano usia 36 bulan, dan parutan White Truffle segar dari perbukitan Alba, Italia.',
      price: 690000,
      image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });
  await prisma.recipe.create({
    data: { menuId: mRisotto.id, ingredientId: ingTruffle.id, quantityNeeded: 15 },
  });

  const mTaglioliniLobster = await prisma.menu.create({
    data: {
      categoryId: catPasta.id,
      name: 'Handcrafted Tagliolini with Brittany Blue Lobster',
      country: 'Italia',
      description: 'Pasta telur tagliolini buatan tangan setiap pagi, disajikan dengan daging lobster biru Brittany, bisque tomat ceri San Marzano manis, minyak cabai Calabria, dan daun basil segar.',
      price: 750000,
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });
  await prisma.recipe.create({
    data: { menuId: mTaglioliniLobster.id, ingredientId: ingLobster.id, quantityNeeded: 1 },
  });

  const mPappardelleRagu = await prisma.menu.create({
    data: {
      categoryId: catPasta.id,
      name: 'Wagyu Beef Cheek Ragù Pappardelle',
      country: 'Italia',
      description: 'Pasta pipih lebar pappardelle dengan daging pipi sapi Wagyu yang dimasak lambat selama 12 jam bersama anggur Chianti dan sayuran akar, ditaburi keju Pecorino Romano berusia matang.',
      price: 380000,
      image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mRavioli = await prisma.menu.create({
    data: {
      categoryId: catPasta.id,
      name: 'Ravioli di Ricotta e Spinaci al Burro e Salvia',
      country: 'Italia',
      description: 'Bantal pasta ravioli buatan tangan berisi keju ricotta susu kerbau dan bayam liar, disajikan dengan saus mentega Prancis cokelat (beurre noisette), daun sage renyah, dan kacang pinus panggang.',
      price: 290000,
      image: 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mVongole = await prisma.menu.create({
    data: {
      categoryId: catPasta.id,
      name: 'Spaghetti alle Vongole Veraci con Bottarga di Muggine',
      country: 'Italia',
      description: 'Spaghetti artisanal Gragnano dengan kerang vongole segar, emulsi minyak zaitun extra virgin, bawang putih, peterseli, percikan anggur putih, dan serutan telur ikan Bottarga dari Sardinia.',
      price: 360000,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // ==========================================
  // CATEGORY 4: SEAFOOD EXTRAVAGANZA (5 items)
  // ==========================================
  const mLobsterThermidor = await prisma.menu.create({
    data: {
      categoryId: catSeafood.id,
      name: 'Lobster Thermidor au Hennessy Cognac',
      country: 'Prancis',
      description: 'Lobster biru utuh dipanggang dalam cangkangnya dengan velouté krim mustard Dijon, keju Gruyère Swiss berusia 18 bulan, dan flambé aroma Hennessy XO Cognac.',
      price: 920000,
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });
  await prisma.recipe.create({
    data: { menuId: mLobsterThermidor.id, ingredientId: ingLobster.id, quantityNeeded: 1 },
  });

  const mKingCrab = await prisma.menu.create({
    data: {
      categoryId: catSeafood.id,
      name: 'Barents Sea King Crab au Beurre Fumé',
      country: 'Skandinavia',
      description: 'Kaki kepiting raja raksasa dari Laut Barents yang manis gurih, dipanggang dengan mentega asap kayu apel, emulsi daun adas dill Norwegia, dan remah brioche mentega renyah.',
      price: 980000,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });
  await prisma.recipe.create({
    data: { menuId: mKingCrab.id, ingredientId: ingKingCrab.id, quantityNeeded: 300 },
  });

  const mSeaBass = await prisma.menu.create({
    data: {
      categoryId: catSeafood.id,
      name: 'Chilean Sea Bass en Papillote with Lemongrass Emulsion',
      country: 'Chili',
      description: 'Fillet ikan kakap Chili putih bersisik salju dipanggang dalam bungkusan kertas perkamen dengan jamur shiitake, jahe muda, daun serai wangi, dan kaldu dashi jernih beraroma laut.',
      price: 620000,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });
  await prisma.recipe.create({
    data: { menuId: mSeaBass.id, ingredientId: ingSeaBass.id, quantityNeeded: 220 },
  });

  const mTasmanianSalmon = await prisma.menu.create({
    data: {
      categoryId: catSeafood.id,
      name: 'Crispy Skin Tasmanian Salmon with Saffron Velouté',
      country: 'Australia',
      description: 'Salmon liar Tasmania dengan kulit renyah sempurna, daging lembut lumer berlemak omega, disajikan di atas kentang fondue mentega, asparagus panggang, dan saus beludru saffron emas.',
      price: 390000,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mGrilledOctopus = await prisma.menu.create({
    data: {
      categoryId: catSeafood.id,
      name: 'Mediterranean Grilled Octopus with Romesco Sauce',
      country: 'Spanyol',
      description: 'Tentakel gurita Mediterania yang direbus lambat lalu dipanggang arang hingga harum, disajikan dengan saus romesco kacang almond panggang paprika asap, kentang fingerling, dan minyak peterseli.',
      price: 350000,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // ==========================================
  // CATEGORY 5: ASIAN & NUSANTARA HERITAGE (6 items)
  // ==========================================
  const mRendang = await prisma.menu.create({
    data: {
      categoryId: catAsian.id,
      name: 'Rendang Short Ribs Wagyu 48-Hour Sous Vide',
      country: 'Nusantara',
      description: 'Iga pendek Wagyu marbling 9 dimasak lambat metode sous-vide selama 48 jam hingga lumer, dibalut pasta rendang karamel kelapa parut gongseng Payakumbuh, gel santan asam kandis, dan keripik singkong emas.',
      price: 580000,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mBebekBetutu = await prisma.menu.create({
    data: {
      categoryId: catAsian.id,
      name: 'Bebek Betutu Confit aux Epices Nobles',
      country: 'Nusantara',
      description: 'Paha bebek Prancis dimasak confit dalam minyak rempah 18 bumbu base genep Bali, disajikan dengan kuah gulai kental saffron kecombrang, lawar kacang panjang asap, dan sambal matah minyak kelapa murni.',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1514944298352-7a8e0f6c2578?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mSukiyaki = await prisma.menu.create({
    data: {
      categoryId: catAsian.id,
      name: 'Miyazaki Wagyu A5 Sukiyaki Royale BMS 12',
      country: 'Jepang',
      description: 'Irisan daging Wagyu A5 bersertifikasi halal dari prefektur Miyazaki direbus perlahan dalam warishita manis-gurih berusia 50 tahun, jamur Matsutake, tahu bakar artisan, dan telur onsen omega berbalut emas.',
      price: 1250000,
      image: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });
  await prisma.recipe.create({
    data: { menuId: mSukiyaki.id, ingredientId: ingWagyuA5.id, quantityNeeded: 200 },
  });

  const mOmakaseNigiri = await prisma.menu.create({
    data: {
      categoryId: catAsian.id,
      name: 'Omakase Nigiri Duo: Hon Maguro Otoro & Uni Hokkaido',
      country: 'Jepang',
      description: 'Sajian dua potong nigiri legendaris: tuna Otoro berlemak tebal dibakar tipis aburi dengan kaviar, serta landak laut Uni segar langsung dari perairan dingin Hokkaido di atas nasi cuka merah akazu berumur 3 tahun.',
      price: 880000,
      image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mCrabVermicelli = await prisma.menu.create({
    data: {
      categoryId: catAsian.id,
      name: 'Singapore Golden Mud Crab Vermicelli Claypot',
      country: 'Singapura',
      description: 'Kepiting lumpur segar montok dimasak di mangkuk tanah liat panas membara bersama bihun lembut yang menyerap kaldu kepiting pekat, jahe iris wangi, bawang daun, dan minyak wijen bakar.',
      price: 720000,
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mTomYum = await prisma.menu.create({
    data: {
      categoryId: catAsian.id,
      name: 'Thai Royal Tom Yum Goong with Giant River Prawn',
      country: 'Thailand',
      description: 'Udang galah sungai raksasa dengan kepala sarat gurih lemak, berpadu dalam kuah tom yum rempah aromatik kaffir lime, serai segar, lengkuas merah, jamur jerami, dan minyak cabai panggang khas istana Siam.',
      price: 360000,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // ==========================================
  // CATEGORY 6: DESSERTS & PÂTISSERIE (6 items)
  // ==========================================
  const mSouffle = await prisma.menu.create({
    data: {
      categoryId: catDesserts.id,
      name: 'Soufflé Chaud au Grand Marnier Cuvée du Centenaire',
      country: 'Prancis',
      description: 'Kue soufflé klasik Prancis mengembang lembut dengan aroma kulit jeruk likur Grand Marnier 100th anniversary, disajikan dengan es krim vanila Madagaskar buatan tangan dan lembaran emas murni 24k.',
      price: 280000,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

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
  await prisma.recipe.create({
    data: { menuId: mSphere.id, ingredientId: ingValrhona.id, quantityNeeded: 80 },
  });

  const mCheesecake = await prisma.menu.create({
    data: {
      categoryId: catDesserts.id,
      name: 'Basque Burnt Cheesecake with White Truffle Honey',
      country: 'Spanyol',
      description: 'Kue keju panggang hangus khas San Sebastián Spanyol bertekstur lava lumer lembut di tengah, disajikan dengan tetesan madu bunga liar beraroma white truffle dan buah beri segar.',
      price: 220000,
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mMilleFeuille = await prisma.menu.create({
    data: {
      categoryId: catDesserts.id,
      name: 'Classic Tahitian Vanilla Bean Mille-Feuille',
      country: 'Prancis',
      description: 'Lapisan pastry karamel mentega super renyah diselingi krim diplomat vanila Tahiti berbutir hitam wangi harum, glasir gula fondant tradisional, dan stroberi alpine.',
      price: 190000,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mParisBrest = await prisma.menu.create({
    data: {
      categoryId: catDesserts.id,
      name: 'Pistachio Paris-Brest with Salted Praline Cream',
      country: 'Prancis',
      description: 'Kue choux Prancis berbentuk cincin bertabur kacang almond cincang, diisi melimpah dengan krim praline kacang pistachio Sisilia murni dan selai karamel mentega gurih.',
      price: 210000,
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mMatchaLava = await prisma.menu.create({
    data: {
      categoryId: catDesserts.id,
      name: 'Matcha Molten Lava Cake with Black Sesame Gelato',
      country: 'Jepang',
      description: 'Kue lava cokelat putih teh hijau matcha Uji Kyoto yang meleleh hangat saat dibelah, dipadukan secara kontras dengan gelato wijen hitam artisanal panggang yang dingin harum.',
      price: 1850000,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  // ==========================================
  // CATEGORY 7: GRANDS CRUS, ELIXIRS & MOCKTAILS (6 items)
  // ==========================================
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
  await prisma.recipe.create({
    data: { menuId: mChampagne.id, ingredientId: ingChampagne.id, quantityNeeded: 1 },
  });

  const mYuzuFizz = await prisma.menu.create({
    data: {
      categoryId: catBeverages.id,
      name: 'Royal Passionfruit & Yuzu Sparkling Fizz',
      country: 'Jepang',
      description: 'Racikan mocktail segar dari sari jeruk yuzu Kochi Jepang, bulir buah markisa segar, sirup bunga elderflower organik, daun mint hancur, dan soda air mineral pegunungan dingin.',
      price: 95000,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mEarlGreyColdBrew = await prisma.menu.create({
    data: {
      categoryId: catBeverages.id,
      name: 'Earl Grey Lavender Cold Brew with Rose Smoke',
      country: 'Inggris',
      description: 'Ekstraksi dingin daun teh Earl Grey bergamot murni selama 24 jam dengan kuncup bunga lavender Provence, disajikan di bawah tudung kaca beraroma asap kelopak mawar organik.',
      price: 110000,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mDragonFruitElixir = await prisma.menu.create({
    data: {
      categoryId: catBeverages.id,
      name: 'Dragon Fruit Lychee Blossom Elixir',
      country: 'Nusantara',
      description: 'Jus buah naga merah organik dingin dikocok bersama sari buah leci manis harum, perasan jeruk nipis segar, dan air tebu murni dingin tanpa gula buatan.',
      price: 85000,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    },
  });

  const mBlueMountainCoffee = await prisma.menu.create({
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
  await prisma.recipe.create({
    data: { menuId: mBlueMountainCoffee.id, ingredientId: ingCoffeeBeans.id, quantityNeeded: 20 },
  });

  const mMatchaLatte = await prisma.menu.create({
    data: {
      categoryId: catBeverages.id,
      name: 'Ceremonial Uji Matcha Latte with 24k Gold Flakes',
      country: 'Jepang',
      description: 'Bubuk teh hijau matcha kualitas upacara dari perkebunan kuno Uji Kyoto, dikocok bambu chasen tradisional dengan susu oat gandum artisan hangat dan taburan serpihan emas 24 karat murni.',
      price: 135000,
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=1200&q=80',
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
      specialRequests: 'Perayaan gala dinner VIP, sediakan sommelier untuk wine pairing.',
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
            notes: 'Medium Rare, extra Périgord Truffle',
          },
          {
            menuId: mSouffle.id,
            quantity: 1,
            unitPrice: 280000,
            subtotal: 280000,
            notes: 'Sajikan tepat 20 menit setelah hidangan utama',
          },
          {
            menuId: mBlueMountainCoffee.id,
            quantity: 2,
            unitPrice: 180000,
            subtotal: 360000,
            notes: 'Single Origin Pour-Over',
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
      paymentRef: 'QRIS-SAVORIA-GALA-001',
    },
  });

  console.log('✅ Database Seeding completed successfully with 35+ Worldwide Fine-Dining Menus & 7 Categories!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
