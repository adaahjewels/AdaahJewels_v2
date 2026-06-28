/**
 * MySQL seed script
 * Creates admin user, sample categories, subcategories, and products.
 *
 * Run with:  npm run seed
 */

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB, closePool, callProcedure } from './config/db';
import * as userRepo    from './repositories/user.repository';
import * as catRepo     from './repositories/category.repository';
import * as productRepo from './repositories/product.repository';

dotenv.config();

async function seed() {
  try {
    await connectDB();
    console.log('🌱 Starting MySQL seed...\n');

    // ── Users ────────────────────────────────────────────────────────────────
    console.log('👤 Creating users...');

    await callProcedure('sp_get_users', [100, 0]);

    const adminPass    = await bcrypt.hash('admin123', 10);
    const customerPass = await bcrypt.hash('password123', 10);

    const { id: adminId } = await userRepo.createUser(
      'Admin', 'admin@adaahjewels.com', null, adminPass, 'admin'
    );
    console.log(`   ✅ Admin created (id=${adminId})`);

    const { id: custId } = await userRepo.createUser(
      'Priya Sharma', 'priya@example.com', '+919876543210', customerPass, 'customer'
    );
    console.log(`   ✅ Customer created (id=${custId})\n`);

    // ── Categories ────────────────────────────────────────────────────────────
    console.log('📂 Creating categories...');

    const categoryData = [
      {
        name: 'Necklaces',
        slug: 'necklaces',
        desc: 'Beautiful necklace collections — from delicate pendants to statement chokers',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
      },
      {
        name: 'Earrings',
        slug: 'earrings',
        desc: 'Elegant earring collections — studs, hoops, jhumkas, and drops',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
      },
      {
        name: 'Bangles',
        slug: 'bangles',
        desc: 'Traditional and modern bangles — gold, silver, and kundan',
        image: 'https://images.unsplash.com/photo-1573408301185-9519f94815fd?w=600&q=80',
      },
      {
        name: 'Rings',
        slug: 'rings',
        desc: 'Stunning ring collections — solitaires, bands, and cocktail rings',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
      },
      {
        name: 'Bracelets',
        slug: 'bracelets',
        desc: 'Stylish bracelet collections — charm bracelets, tennis bracelets, and cuffs',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
      },
      {
        name: 'Maang Tikka',
        slug: 'maang-tikka',
        desc: 'Bridal and festive maang tikka for the perfect Indian look',
        image: 'https://images.unsplash.com/photo-1617397912087-4f40d1a00e60?w=600&q=80',
      },
      {
        name: 'Nose Pins',
        slug: 'nose-pins',
        desc: 'Delicate nose pins and nath in gold and silver',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
      },
      {
        name: 'Anklets',
        slug: 'anklets',
        desc: 'Traditional payal and modern anklets',
        image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80',
      },
    ];

    const createdCategories: Record<string, number> = {};
    for (const cat of categoryData) {
      const row = await catRepo.createCategory(cat.name, cat.slug, cat.image, cat.desc);
      createdCategories[cat.slug] = row.id;
      console.log(`   ✅ Category: ${cat.name} (id=${row.id})`);
    }

    // ── Subcategories ─────────────────────────────────────────────────────────
    console.log('\n📁 Creating subcategories...');

    const subCategories = [
      {
        name: 'Choker Necklace',
        slug: 'choker-necklace',
        parent: 'necklaces',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80',
      },
      {
        name: 'Pendant Necklace',
        slug: 'pendant-necklace',
        parent: 'necklaces',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
      },
      {
        name: 'Layered Necklace',
        slug: 'layered-necklace',
        parent: 'necklaces',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
      },
      {
        name: 'Stud Earrings',
        slug: 'stud-earrings',
        parent: 'earrings',
        image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&q=80',
      },
      {
        name: 'Jhumka Earrings',
        slug: 'jhumka-earrings',
        parent: 'earrings',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
      },
      {
        name: 'Hoop Earrings',
        slug: 'hoop-earrings',
        parent: 'earrings',
        image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&q=80',
      },
      {
        name: 'Drop Earrings',
        slug: 'drop-earrings',
        parent: 'earrings',
        image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80',
      },
      {
        name: 'Gold Bangles',
        slug: 'gold-bangles',
        parent: 'bangles',
        image: 'https://images.unsplash.com/photo-1573408301185-9519f94815fd?w=400&q=80',
      },
      {
        name: 'Kundan Bangles',
        slug: 'kundan-bangles',
        parent: 'bangles',
        image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=400&q=80',
      },
      {
        name: 'Silver Bangles',
        slug: 'silver-bangles',
        parent: 'bangles',
        image: 'https://images.unsplash.com/photo-1543964198-d54e4f0e44e3?w=400&q=80',
      },
      {
        name: 'Solitaire Rings',
        slug: 'solitaire-rings',
        parent: 'rings',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80',
      },
      {
        name: 'Band Rings',
        slug: 'band-rings',
        parent: 'rings',
        image: 'https://images.unsplash.com/photo-1548630435-998e3e97c0e7?w=400&q=80',
      },
      {
        name: 'Cocktail Rings',
        slug: 'cocktail-rings',
        parent: 'rings',
        image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&q=80',
      },
      {
        name: 'Charm Bracelets',
        slug: 'charm-bracelets',
        parent: 'bracelets',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80',
      },
      {
        name: 'Tennis Bracelets',
        slug: 'tennis-bracelets',
        parent: 'bracelets',
        image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&q=80',
      },
      {
        name: 'Bridal Maang Tikka',
        slug: 'bridal-maang-tikka',
        parent: 'maang-tikka',
        image: 'https://images.unsplash.com/photo-1617397912087-4f40d1a00e60?w=400&q=80',
      },
      {
        name: 'Simple Nose Pin',
        slug: 'simple-nose-pin',
        parent: 'nose-pins',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
      },
      {
        name: 'Payal Anklets',
        slug: 'payal-anklets',
        parent: 'anklets',
        image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=400&q=80',
      },
    ];

    const createdSubs: Record<string, number> = {};
    for (const sub of subCategories) {
      const parentId = createdCategories[sub.parent];
      if (!parentId) continue;
      const row = await catRepo.createSubcategory(sub.name, sub.slug, parentId, sub.image, null);
      createdSubs[sub.slug] = row.id;
      console.log(`   ✅ Subcategory: ${sub.name} (id=${row.id})`);
    }

    // ── Products ──────────────────────────────────────────────────────────────
    console.log('\n💎 Creating products...');

    const products = [
      {
        name: 'Gold Choker Necklace',
        categorySlug: 'choker-necklace',
        materialType: 'Gold',
        price: 4999, discount: 10, deliveryDays: 3, stock: 25,
        description: 'Elegant 22K gold choker necklace with intricate filigree work. Perfect for weddings and festive occasions.',
        images: [
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
        ],
      },
      {
        name: 'Pearl Pendant Necklace',
        categorySlug: 'pendant-necklace',
        materialType: 'Silver',
        price: 2499, discount: 15, deliveryDays: 2, stock: 40,
        description: 'Graceful silver pendant necklace adorned with freshwater pearls. Everyday elegance.',
        images: [
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
          'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80',
        ],
      },
      {
        name: 'Diamond Stud Earrings',
        categorySlug: 'stud-earrings',
        materialType: 'Gold',
        price: 6999, discount: 5, deliveryDays: 4, stock: 15,
        description: 'Classic 18K gold stud earrings with certified diamond solitaires. Timeless and versatile.',
        images: [
          'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80',
          'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80',
        ],
      },
      {
        name: 'Traditional Jhumka Earrings',
        categorySlug: 'jhumka-earrings',
        materialType: 'Gold',
        price: 3499, discount: 20, deliveryDays: 2, stock: 30,
        description: 'Traditional jhumka earrings in antique gold finish with ruby and emerald accents.',
        images: [
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
          'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
        ],
      },
      {
        name: 'Kundan Gold Bangles Set',
        categorySlug: 'kundan-bangles',
        materialType: 'Gold',
        price: 8999, discount: 12, deliveryDays: 5, stock: 20,
        description: 'Set of 4 Kundan bangles in 22K gold with intricate meenakari enamel work.',
        images: [
          'https://images.unsplash.com/photo-1573408301185-9519f94815fd?w=600&q=80',
          'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80',
        ],
      },
      {
        name: 'Oxidised Silver Bangles',
        categorySlug: 'silver-bangles',
        materialType: 'Silver',
        price: 1299, discount: 8, deliveryDays: 2, stock: 60,
        description: 'Set of 6 oxidised silver bangles with tribal motif engravings. Boho chic style.',
        images: [
          'https://images.unsplash.com/photo-1543964198-d54e4f0e44e3?w=600&q=80',
        ],
      },
      {
        name: 'Diamond Solitaire Ring',
        categorySlug: 'solitaire-rings',
        materialType: 'Gold',
        price: 12999, discount: 0, deliveryDays: 7, stock: 10,
        description: '18K white gold ring with a 0.5ct certified solitaire diamond. The ultimate symbol of love.',
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
          'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&q=80',
        ],
      },
      {
        name: 'Gold Band Ring',
        categorySlug: 'band-rings',
        materialType: 'Gold',
        price: 2999, discount: 5, deliveryDays: 3, stock: 45,
        description: 'Sleek 22K gold band ring — minimalist design for everyday wear.',
        images: [
          'https://images.unsplash.com/photo-1548630435-998e3e97c0e7?w=600&q=80',
        ],
      },
      {
        name: 'Silver Charm Bracelet',
        categorySlug: 'charm-bracelets',
        materialType: 'Silver',
        price: 1799, discount: 18, deliveryDays: 3, stock: 35,
        description: 'Sterling silver charm bracelet with 7 unique charms — luck, love, and joy.',
        images: [
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
        ],
      },
      {
        name: 'Bridal Maang Tikka',
        categorySlug: 'bridal-maang-tikka',
        materialType: 'Gold',
        price: 5499, discount: 10, deliveryDays: 5, stock: 18,
        description: 'Stunning bridal maang tikka with kundan and polki stones. Perfect centrepiece for your bridal look.',
        images: [
          'https://images.unsplash.com/photo-1617397912087-4f40d1a00e60?w=600&q=80',
        ],
      },
      {
        name: 'Gold Hoop Earrings',
        categorySlug: 'hoop-earrings',
        materialType: 'Gold',
        price: 2299, discount: 10, deliveryDays: 2, stock: 50,
        description: 'Classic 22K gold hoop earrings — timeless and versatile for any occasion.',
        images: [
          'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80',
        ],
      },
      {
        name: 'Layered Gold Necklace',
        categorySlug: 'layered-necklace',
        materialType: 'Gold',
        price: 3799, discount: 8, deliveryDays: 3, stock: 22,
        description: 'Multi-layered gold necklace set — effortlessly stylish for festive and casual wear.',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
        ],
      },
    ];

    for (const p of products) {
      const catId = createdSubs[p.categorySlug];
      if (!catId) {
        console.log(`   ⚠️  Skipping "${p.name}" — subcategory "${p.categorySlug}" not found`);
        continue;
      }

      const { id } = await productRepo.createProduct({
        name:             p.name,
        categoryId:       catId,
        materialType:     p.materialType,
        price:            p.price,
        discount:         p.discount,
        deliveryDays:     p.deliveryDays,
        description:      p.description,
        careInstructions: null,
        stock:            p.stock,
      });

      for (let i = 0; i < p.images.length; i++) {
        await productRepo.addProductImage(id, p.images[i], i);
      }

      console.log(`   ✅ Product: ${p.name} (id=${id})`);
    }

    console.log('\n🎉 Seed complete!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin:    admin@adaahjewels.com  /  admin123');
    console.log('   Customer: priya@example.com      /  password123');
  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await closePool();
    process.exit(0);
  }
}

seed();
