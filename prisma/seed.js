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

  console.log('--- Seeding 8 Exclusive Dining Tables ---');
  const tableData = [
    { tableNumber: 'T01', capacity: 2, qrToken: 'qr-table-01', area: 'Indoor Romantic Chamber' },
    { tableNumber: 'T02', capacity: 2, qrToken: 'qr-table-02', area: 'Indoor Romantic Chamber' },
    { tableNumber: 'T03', capacity: 4, qrToken: 'qr-table-03', area: 'Grand Salon Dining Room' },
    { tableNumber: 'T04', capacity: 4, qrToken: 'qr-table-04', area: 'Grand Salon Dining Room' },
    { tableNumber: 'T05', capacity: 6, qrToken: 'qr-table-05', area: 'Garden Terrace Veranda' },
    { tableNumber: 'T06', capacity: 6, qrToken: 'qr-table-06', area: 'Garden Terrace Veranda' },
    { tableNumber: 'T07', capacity: 8, qrToken: 'qr-table-07', area: 'Royal Heritage Mezzanine (Lantai 2)' },
    { tableNumber: 'T08', capacity: 10, qrToken: 'qr-table-08', area: 'Presidential VIP Salon' },
  ];

  for (const t of tableData) {
    await prisma.table.create({ data: t });
  }

  console.log('--- Seeding 7 Culinary Categories ---');
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
  const catNusantaraAsia = await prisma.category.create({
    data: { name: 'Asian & Nusantara Heritage Reimagined', slug: 'nusantara-asia', sortOrder: 5 },
  });
  const catDesserts = await prisma.category.create({
    data: { name: 'Chef\'s Atelier Desserts & Pâtisserie', slug: 'desserts', sortOrder: 6 },
  });
  const catBeverages = await prisma.category.create({
    data: { name: 'Grands Crus, Elixirs & Mocktails', slug: 'beverages', sortOrder: 7 },
  });

  console.log('--- Seeding Raw Ingredients for Recipe BOM ---');
  const rawIngredients = [
    { name: 'Miyazaki Wagyu A5 BMS 12 (g)', unit: 'g', stockQuantity: 30000, minStock: 3000 },
    { name: 'Australian Black Angus MB7 (g)', unit: 'g', stockQuantity: 45000, minStock: 5000 },
    { name: 'NZ Lumina Lamb Rack (g)', unit: 'g', stockQuantity: 25000, minStock: 2500 },
    { name: 'Oscietra Royal Caviar (g)', unit: 'g', stockQuantity: 6000, minStock: 500 },
    { name: 'Périgord Black Truffle (g)', unit: 'g', stockQuantity: 4000, minStock: 300 },
    { name: 'Brittany Blue Lobster (ekor)', unit: 'ekor', stockQuantity: 80, minStock: 10 },
    { name: 'Barents Sea King Crab (g)', unit: 'g', stockQuantity: 20000, minStock: 2000 },
    { name: 'Chilean Sea Bass Fillet (g)', unit: 'g', stockQuantity: 22000, minStock: 2000 },
    { name: 'Hokkaido Scallop Sashimi (g)', unit: 'g', stockQuantity: 15000, minStock: 1500 },
    { name: 'Rougié Foie Gras (g)', unit: 'g', stockQuantity: 10000, minStock: 1000 },
    { name: 'French Magret Duck Breast (g)', unit: 'g', stockQuantity: 18000, minStock: 1500 },
    { name: 'Valrhona Guanaja 70% Dark Chocolate (g)', unit: 'g', stockQuantity: 20000, minStock: 2000 },
    { name: 'Dom Pérignon Vintage Bottles (botol)', unit: 'botol', stockQuantity: 40, minStock: 5 },
    { name: 'Jamaica Blue Mountain Grade 1 Beans (g)', unit: 'g', stockQuantity: 12000, minStock: 1000 },
    { name: 'Carnaroli Superfino Rice (g)', unit: 'g', stockQuantity: 35000, minStock: 5000 },
    { name: 'Parmigiano-Reggiano 36 Mo (g)', unit: 'g', stockQuantity: 18000, minStock: 2000 },
  ];

  const ingMap = {};
  for (const ing of rawIngredients) {
    const created = await prisma.ingredient.create({ data: ing });
    ingMap[ing.name] = created.id;
  }

  console.log('--- Seeding 50 Worldwide Gourmet Menus with Modifiers ---');

  // Complete 50 Dishes
  const dishes = [
    // 1. APPETIZERS & STARTERS (7 Items)
    {
      categoryId: catAppetizers.id,
      name: 'Caviar Kristal Oscietra Royal (30g)',
      country: 'Kaspia',
      description: 'Kaviar sturgeon Oscietra royal dengan blinis hangat buatan tangan, crème fraîche Normandy, dan cincangan telur puyuh organik.',
      price: 850000,
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
      modifiers: [
        {
          name: 'Pilihan Pendamping Blinis',
          minSelection: 1,
          maxSelection: 1,
          options: [
            { name: 'Traditional Warm Sourdough Blinis', price: 0 },
            { name: 'Gluten-Free Buckwheat Blinis', price: 25000 },
          ],
        },
      ],
      recipes: [{ ingName: 'Oscietra Royal Caviar (g)', qty: 30 }],
    },
    {
      categoryId: catAppetizers.id,
      name: 'Hokkaido Scallop Carpaccio & Yuzu',
      country: 'Jepang',
      description: 'Kerang simping Hokkaido segar diiris tipis, mutiara jeruk yuzu, minyak zaitun Liguria, dan serpihan sea salt Maldon.',
      price: 320000,
      image: 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Hokkaido Scallop Sashimi (g)', qty: 90 }],
    },
    {
      categoryId: catAppetizers.id,
      name: 'French Truffle Escargot à la Bourguignonne',
      country: 'Prancis',
      description: 'Bekicot liar Burgundy Prancis dipanggang dengan garlic herb butter, percikan Chablis white wine, dan sourdough renyah.',
      price: 260000,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catAppetizers.id,
      name: 'Wagyu Beef Tartare with Black Truffle',
      country: 'Prancis',
      description: 'Daging Wagyu segar cincang halus, bumbu kapulaga dijon, kuning telur puyuh organik, dan serutan truffle Périgord.',
      price: 340000,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      recipes: [
        { ingName: 'Miyazaki Wagyu A5 BMS 12 (g)', qty: 80 },
        { ingName: 'Périgord Black Truffle (g)', qty: 5 },
      ],
    },
    {
      categoryId: catAppetizers.id,
      name: 'Wild Forest Porcini Velouté',
      country: 'Italia',
      description: 'Sup krim beludru jamur porcini liar, minyak truffle putih Alba, daun thyme segar, dan crouton brioche renyah.',
      price: 185000,
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catAppetizers.id,
      name: 'Foie Gras Poêlé au Vinaigre Balsamique',
      country: 'Prancis',
      description: 'Hati angsa Rougié Prancis panggang gurih, saus reduksi cuka balsamik Modena 12 tahun, dan brioche kismis hangat.',
      price: 420000,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Rougié Foie Gras (g)', qty: 70 }],
    },
    {
      categoryId: catAppetizers.id,
      name: 'Burrata Pugliese con Pomodorini Confit',
      country: 'Italia',
      description: 'Keju Burrata segar lembut dari Puglia, tomat ceri confit karamel madu, minyak zaitun extra virgin, dan daun basil wangi.',
      price: 210000,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    },

    // 2. WORLD SIGNATURE MAINS & STEAKS (7 Items)
    {
      categoryId: catMains.id,
      name: 'Miyazaki Wagyu A5 Tenderloin Rossini',
      country: 'Jepang',
      description: 'Wagyu A5 BMS 12, pan-seared Rougié Foie Gras, Périgord Black Truffle, kentang purée mentega Prancis, dan Madeira jus.',
      price: 1450000,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      modifiers: [
        {
          name: 'Tingkat Kematangan Daging (Doneness)',
          minSelection: 1,
          maxSelection: 1,
          options: [
            { name: 'Rare (Dingin di tengah, merah marun)', price: 0 },
            { name: 'Medium Rare (Rekomendasi Chef - Sangat Empuk & Juicy)', price: 0 },
            { name: 'Medium (Merah muda hangat di tengah)', price: 0 },
            { name: 'Medium Well (Matang hampir merata)', price: 0 },
          ],
        },
      ],
      recipes: [
        { ingName: 'Miyazaki Wagyu A5 BMS 12 (g)', qty: 200 },
        { ingName: 'Rougié Foie Gras (g)', qty: 50 },
        { ingName: 'Périgord Black Truffle (g)', qty: 10 },
      ],
    },
    {
      categoryId: catMains.id,
      name: 'Australian Tomahawk Wagyu MB7 (1.2kg)',
      country: 'Australia',
      description: 'Steak tomahawk bertulang utuh panggang arang kayu apel, roasted garlic bulb, bone marrow butter, dan 3 saus signature.',
      price: 1850000,
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
      modifiers: [
        {
          name: 'Tingkat Kematangan Daging',
          minSelection: 1,
          maxSelection: 1,
          options: [
            { name: 'Medium Rare (Rekomendasi Chef)', price: 0 },
            { name: 'Medium', price: 0 },
            { name: 'Medium Well', price: 0 },
          ],
        },
      ],
      recipes: [{ ingName: 'Australian Black Angus MB7 (g)', qty: 1200 }],
    },
    {
      categoryId: catMains.id,
      name: 'NZ Lumina Lamb Rack with Herb Crust',
      country: 'Selandia Baru',
      description: 'Iga domba Lumina lembut berbalut rempah panko aromatik, purée kacang polong manis mint, dan saus jus rosemary wangi.',
      price: 680000,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'NZ Lumina Lamb Rack (g)', qty: 350 }],
    },
    {
      categoryId: catMains.id,
      name: 'USDA Prime Dry-Aged Ribeye 350g',
      country: 'Amerika Serikat',
      description: 'Potongan ribeye prime berusia 45 hari dry-aged dengan rasa gurih nutty intens, chimichurri segar, dan kentang truffle.',
      price: 890000,
      image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Australian Black Angus MB7 (g)', qty: 350 }],
    },
    {
      categoryId: catMains.id,
      name: 'Magret de Canard Rôti au Miel et Cerises',
      country: 'Prancis',
      description: 'Dada bebek Prancis kulit krispi terpanggang madu lavender, jus ceri liar asam manis, dan puree ubi jalar beludru.',
      price: 480000,
      image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'French Magret Duck Breast (g)', qty: 280 }],
    },
    {
      categoryId: catMains.id,
      name: 'Ibérico Pork Pluma & Smoked Apple Purée',
      country: 'Spanyol',
      description: 'Daging babi Ibérico acorn-fed bagian sayap yang sangat empuk, purée apel panggang berasap, dan jus sherry Spanyol.',
      price: 550000,
      image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catMains.id,
      name: 'Slow-Braised Wagyu Beef Cheek Bourguignon',
      country: 'Prancis',
      description: 'Pipi sapi Wagyu dimasak lambat 16 jam dalam anggur merah Pinot Noir Burgundy, wortel glacé, jamur mutiara, dan kentang lumer.',
      price: 410000,
      image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Australian Black Angus MB7 (g)', qty: 260 }],
    },

    // 3. ARTISANAL PASTA & TRUFFLE RISOTTO (7 Items)
    {
      categoryId: catPasta.id,
      name: 'Risotto al Tartufo Bianco d\'Alba',
      country: 'Italia',
      description: 'Beras Carnaroli superfino, kaldu capon emas, mentega Normandia, Parmigiano-Reggiano 36 bulan, dan parutan White Truffle segar.',
      price: 690000,
      image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
      recipes: [
        { ingName: 'Carnaroli Superfino Rice (g)', qty: 100 },
        { ingName: 'Parmigiano-Reggiano 36 Mo (g)', qty: 30 },
      ],
    },
    {
      categoryId: catPasta.id,
      name: 'Handcrafted Tagliolini with Blue Lobster',
      country: 'Italia',
      description: 'Pasta telur buatan tangan dengan lobster biru Brittany, bisque tomat ceri San Marzano, minyak cabai Calabria, dan basil.',
      price: 750000,
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Brittany Blue Lobster (ekor)', qty: 1 }],
    },
    {
      categoryId: catPasta.id,
      name: 'Wagyu Beef Cheek Ragù Pappardelle',
      country: 'Italia',
      description: 'Pasta lebar pappardelle dengan daging pipi sapi Wagyu direbus 12 jam bersama anggur Chianti dan keju Pecorino Romano.',
      price: 380000,
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catPasta.id,
      name: 'Ravioli di Ricotta e Spinaci al Burro e Salvia',
      country: 'Italia',
      description: 'Ravioli buatan tangan isi keju ricotta susu kerbau dan bayam liar dengan siraman mentega herba salvia harum dan pine nuts.',
      price: 260000,
      image: 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catPasta.id,
      name: 'Spaghetti alle Vongole Veraci con Bottarga',
      country: 'Italia',
      description: 'Spaghetti artisanal Gragnano dengan kerang laut hidup, bawang putih manis, anggur putih, dan serutan telur ikan Bottarga.',
      price: 350000,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catPasta.id,
      name: 'Gnocchi di Patate al Gorgonzola e Noci',
      country: 'Italia',
      description: 'Gnocchi kentang lumer berbalut saus krim keju Gorgonzola Dolce DOP, kacang kenari renyah panggang, dan madu akasia.',
      price: 240000,
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catPasta.id,
      name: 'Fettuccine ai Funghi Porcini e Tartufo Nero',
      country: 'Italia',
      description: 'Fettuccine telur artisanal dengan tumisan jamur porcini segar, minyak zaitun Tuscan, dan serutan truffle hitam Norcia.',
      price: 310000,
      image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
    },

    // 4. SEAFOOD EXTRAVAGANZA & OCEAN TREASURES (7 Items)
    {
      categoryId: catSeafood.id,
      name: 'Lobster Thermidor au Hennessy Cognac',
      country: 'Prancis',
      description: 'Lobster biru utuh dipanggang dalam cangkang dengan velouté krim Dijon mustard, keju Gruyère Swiss 18 bulan, dan flambé Cognac.',
      price: 920000,
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Brittany Blue Lobster (ekor)', qty: 1 }],
    },
    {
      categoryId: catSeafood.id,
      name: 'Barents Sea King Crab au Beurre Fumé',
      country: 'Norwegia',
      description: 'Kaki kepiting raja raksasa dari Laut Barents dipanggang mentega asap kayu apel, emulsi daun adas dill, dan brioche renyah.',
      price: 980000,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Barents Sea King Crab (g)', qty: 350 }],
    },
    {
      categoryId: catSeafood.id,
      name: 'Chilean Sea Bass en Papillote',
      country: 'Chili',
      description: 'Fillet kakap Chili salju dipanggang dalam kertas perkamen bersama jamur shiitake, jahe muda, serai wangi, dan kaldu dashi.',
      price: 620000,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Chilean Sea Bass Fillet (g)', qty: 220 }],
    },
    {
      categoryId: catSeafood.id,
      name: 'Crispy Skin Tasmanian Salmon Saffron',
      country: 'Australia',
      description: 'Salmon liar Tasmania berkulit garing lumer di lidah, kentang fondue mentega, asparagus panggang, dan saus saffron emas.',
      price: 390000,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catSeafood.id,
      name: 'Mediterranean Grilled Octopus Romesco',
      country: 'Spanyol',
      description: 'Tentakel gurita laut dalam dipanggang empuk dengan saus Romesco kacang almond Catalunya, kentang baby confit, dan paprika.',
      price: 430000,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catSeafood.id,
      name: 'Brittany Turbot Meunière au Beurre Noisette',
      country: 'Prancis',
      description: 'Ikan turbot tangkapan liar pesisir Brittany Prancis dimasak meunière mentega cokelat hazelnut, perasan lemon, dan peterseli.',
      price: 720000,
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catSeafood.id,
      name: 'Pan-Seared Yellowfin Tuna Sesame Tataki',
      country: 'Jepang',
      description: 'Tuna sirip kuning segar berbalut biji wijen dua warna, irisan lobak daikon renyah, saus ponzu jahe, dan microgreens.',
      price: 360000,
      image: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=800&q=80',
    },

    // 5. ASIAN & NUSANTARA HERITAGE (8 Items)
    {
      categoryId: catNusantaraAsia.id,
      name: 'Rendang Short Ribs Wagyu 48-Hour',
      country: 'Indonesia',
      description: 'Iga sapi Wagyu marbling 9 sous-vide 48 jam lumer di lidah, kelapa gongseng Payakumbuh, gel santan asam kandis, dan keripik singkong.',
      price: 580000,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Australian Black Angus MB7 (g)', qty: 350 }],
    },
    {
      categoryId: catNusantaraAsia.id,
      name: 'Miyazaki Wagyu A5 Sukiyaki Royale',
      country: 'Jepang',
      description: 'Daging Wagyu A5 Miyazaki direbus perlahan dalam warishita manis-gurih 50 tahun, jamur Matsutake, dan telur onsen emas.',
      price: 1250000,
      image: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Miyazaki Wagyu A5 BMS 12 (g)', qty: 180 }],
    },
    {
      categoryId: catNusantaraAsia.id,
      name: 'Bebek Betutu Confit aux Epices Nobles',
      country: 'Indonesia',
      description: 'Paha bebek confit 18 bumbu base genep Bali, kuah gulai saffron kecombrang, lawar asap, dan sambal matah kelapa murni.',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'French Magret Duck Breast (g)', qty: 250 }],
    },
    {
      categoryId: catNusantaraAsia.id,
      name: 'Omakase Nigiri: Otoro & Uni Hokkaido',
      country: 'Jepang',
      description: 'Nigiri tuna Otoro aburi bertabur kaviar dan landak laut Uni segar Hokkaido di atas nasi akazu cuka merah 3 tahun.',
      price: 880000,
      image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catNusantaraAsia.id,
      name: 'Singapore Golden Mud Crab Claypot',
      country: 'Singapura',
      description: 'Kepiting lumpur jumbo segar dimasak dalam claypot dengan bihun kaca kaldu kepiting pekat lada hitam Sarawak dan daun ketumbar.',
      price: 780000,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catNusantaraAsia.id,
      name: 'Thai Royal Tom Yum River Prawn',
      country: 'Thailand',
      description: 'Sup tom yum tradisi istana Thailand dengan udang galah sungai raksasa berlemak manis, galangal, serai segar, dan minyak cabai.',
      price: 320000,
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catNusantaraAsia.id,
      name: 'Rawon Sengkel Wagyu Sambal Terasi Bakar',
      country: 'Indonesia',
      description: 'Sengkel Wagyu empuk dimasak kuah kluwek hitam legendaris Jawa Timur, tauge pendek renyah, telur bebek asin, dan emping melinjo.',
      price: 280000,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Australian Black Angus MB7 (g)', qty: 220 }],
    },
    {
      categoryId: catNusantaraAsia.id,
      name: 'Black Truffle Siew Mai & Xiao Long Bao',
      country: 'Hong Kong',
      description: 'Duet dimsum mewah isi daging cincang udang galah dan serutan black truffle dengan kaldu sup harum di dalam kulit tipis halus.',
      price: 195000,
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    },

    // 6. CHEF'S ATELIER DESSERTS & PÂTISSERIE (7 Items)
    {
      categoryId: catDesserts.id,
      name: 'Sphère Chocolat Noir Valrhona 70%',
      country: 'Prancis',
      description: 'Bola cokelat hitam Valrhona 70% meleleh tersiram saus karamel mentega asin panas, berisi mousse hazelnut Piedmont.',
      price: 320000,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Valrhona Guanaja 70% Dark Chocolate (g)', qty: 80 }],
    },
    {
      categoryId: catDesserts.id,
      name: 'Soufflé Chaud au Grand Marnier',
      country: 'Prancis',
      description: 'Kue soufflé klasik lembut beraroma kulit jeruk Grand Marnier, gelato vanila Tahiti, dan serpihan emas 24k murni.',
      price: 280000,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catDesserts.id,
      name: 'Basque Burnt Cheesecake White Truffle',
      country: 'Spanyol',
      description: 'Cheesecake hangus Spanyol bertekstur lava lumer lembut disiram madu bunga liar white truffle dan buah beri segar.',
      price: 220000,
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catDesserts.id,
      name: 'Tahitian Vanilla Bean Mille-Feuille',
      country: 'Prancis',
      description: 'Lapisan puff pastry karamel renyah tipis dengan krim diplomatik vanila polong Tahiti dan glasir gula halus glasir cermin.',
      price: 195000,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catDesserts.id,
      name: 'Pistachio Paris-Brest Praliné',
      country: 'Prancis',
      description: 'Roda choux pastry khas Prancis diisi mousseline pistachio Sisilia panggang, krim praline hazelnut renyah, dan garam Maldon.',
      price: 210000,
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catDesserts.id,
      name: 'Kyoto Matcha Molten Lava & Sesame',
      country: 'Jepang',
      description: 'Kue lava hangat matcha ceremonial grade Uji Kyoto berlelehan cokelat putih, disajikan bersama gelato wijen hitam sangrai.',
      price: 185000,
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catDesserts.id,
      name: 'Tiramisù Tradizionale al Mascarpone',
      country: 'Italia',
      description: 'Biskuit savoiardi dicelup kopi espresso murni dan liqueur Marsala, keju mascarpone lembut krimi, dan taburan cokelat Valrhona.',
      price: 175000,
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    },

    // 7. GRANDS CRUS, ELIXIRS & MOCKTAILS (7 Items)
    {
      categoryId: catBeverages.id,
      name: 'Dom Pérignon Vintage Brut Champagne',
      country: 'Prancis',
      description: 'Sampanye legendaris dari Épernay Prancis dengan buih halus, aroma brioche ragi hangat, almond sangrai, dan buah pir putih.',
      price: 5500000,
      image: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Dom Pérignon Vintage Bottles (botol)', qty: 1 }],
    },
    {
      categoryId: catBeverages.id,
      name: 'Royal Passionfruit & Yuzu Fizz',
      country: 'Jepang',
      description: 'Sari jeruk yuzu Kochi Jepang, bulir buah markisa segar, sirup bunga elderflower organik, daun mint, dan soda dingin.',
      price: 95000,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      modifiers: [
        {
          name: 'Tingkat Kemanisan & Es',
          minSelection: 1,
          maxSelection: 1,
          options: [
            { name: 'Normal Sweet & Chilled Ice', price: 0 },
            { name: 'Less Sweet (50%)', price: 0 },
            { name: 'No Added Sugar', price: 0 },
          ],
        },
      ],
    },
    {
      categoryId: catBeverages.id,
      name: 'Earl Grey Lavender with Rose Smoke',
      country: 'Inggris',
      description: 'Ekstraksi dingin teh Earl Grey lavender 24 jam disajikan di bawah tudung kaca beraroma asap kelopak mawar organik.',
      price: 110000,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catBeverages.id,
      name: 'Ceremonial Uji Matcha Latte 24k Gold',
      country: 'Jepang',
      description: 'Bubuk teh hijau matcha kualitas upacara Uji Kyoto dikocok tradisional dengan susu oat gandum dan serpihan emas 24k.',
      price: 135000,
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catBeverages.id,
      name: 'Dragon Fruit Lychee Blossom Elixir',
      country: 'Indonesia',
      description: 'Campuran sari buah naga merah tropis, buah leci utuh segar, perasan jeruk nipis kaffir, dan sentuhan air mawar Persia.',
      price: 85000,
      image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    },
    {
      categoryId: catBeverages.id,
      name: 'Jamaica Blue Mountain Grade 1 Pour-Over',
      country: 'Jamaika',
      description: 'Biji kopi single origin pegunungan Blue Mountain Jamaika diseduh presisi dengan notes cokelat lembut dan keasaman seimbang.',
      price: 145000,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      recipes: [{ ingName: 'Jamaica Blue Mountain Grade 1 Beans (g)', qty: 18 }],
    },
    {
      categoryId: catBeverages.id,
      name: 'Smoked Rosemary & Blood Orange Tonic',
      country: 'Italia',
      description: 'Sari jeruk darah Sisilia merah segar, air tonik artesius berkarbonasi tinggi, dan tangkai rosemary segar dibakar wangi.',
      price: 90000,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const item of dishes) {
    const createdMenu = await prisma.menu.create({
      data: {
        categoryId: item.categoryId,
        name: item.name,
        country: item.country,
        description: item.description,
        price: item.price,
        image: item.image,
        isAvailable: true,
      },
    });

    // Create modifiers if any
    if (item.modifiers && item.modifiers.length > 0) {
      for (const mod of item.modifiers) {
        await prisma.modifierGroup.create({
          data: {
            menuId: createdMenu.id,
            name: mod.name,
            minSelection: mod.minSelection,
            maxSelection: mod.maxSelection,
            options: {
              create: mod.options,
            },
          },
        });
      }
    }

    // Create recipes if any
    if (item.recipes && item.recipes.length > 0) {
      for (const rec of item.recipes) {
        const ingredientId = ingMap[rec.ingName];
        if (ingredientId) {
          await prisma.recipe.create({
            data: {
              menuId: createdMenu.id,
              ingredientId: ingredientId,
              quantityNeeded: rec.qty,
            },
          });
        }
      }
    }
  }

  console.log(`\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!`);
  console.log(`- 3 Dedicated Role Accounts (admin, kasir, user) with unique keys.`);
  console.log(`- 8 Exclusive Dining Tables (T01 - T08).`);
  console.log(`- 7 Culinary Categories.`);
  console.log(`- ${dishes.length} Haute Cuisine Global Dishes created.`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
