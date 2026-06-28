/**
 * MongoDB → MySQL Migration Script  (v2 — Final)
 * AdaahJewels / श्री Sootra
 *
 * Changes from v1:
 *   - IDs are MySQL AUTO_INCREMENT (no UUID mapping needed)
 *   - product sizes/colors not migrated (columns removed)
 *   - products.category_id resolved via subcategory name → MySQL categories.id lookup
 *   - banners/coupons: no existing MongoDB data, skipped
 *   - No live production data → simple truncate + insert
 *
 * Usage:  node 03_migrate.js
 * Deps:   npm install mongoose mysql2 dotenv
 */

require('dotenv').config({ path: '.env.migration' });
const mongoose = require('mongoose');
const mysql    = require('mysql2/promise');

const log  = (msg) => console.log(`[INFO]  ${new Date().toISOString()}  ${msg}`);
const warn = (msg) => console.warn(`[WARN]  ${new Date().toISOString()}  ${msg}`);
const fail = (msg) => { console.error(`[ERROR] ${new Date().toISOString()}  ${msg}`); };

// ──────────────────────────────────────────────────────────────────────────────
// ID maps:  mongoId (string) → MySQL auto-increment id (number)
// ──────────────────────────────────────────────────────────────────────────────
const userMap     = {};  // mongo _id string → mysql id
const catMap      = {};  // mongo _id string → mysql id
const subCatMap   = {};  // mongo _id string → mysql id
const productMap  = {};  // mongo _id string → mysql id
// subCatNameMap: "subcategory name (lowercase)" → mysql id  (for products that store name string)
const subCatNameMap = {};

// ──────────────────────────────────────────────────────────────────────────────
// MONGOOSE SCHEMAS  (minimal — read only)
// ──────────────────────────────────────────────────────────────────────────────
const S = mongoose.Schema;
const UserModel       = mongoose.model('User',       new S({}, { strict:false, collection:'users'        }));
const CategoryModel   = mongoose.model('Category',   new S({}, { strict:false, collection:'categories'   }));
const SubCatModel     = mongoose.model('SubCategory',new S({}, { strict:false, collection:'subcategories' }));
const ProductModel    = mongoose.model('Product',    new S({}, { strict:false, collection:'products'     }));
const OrderModel      = mongoose.model('Order',      new S({}, { strict:false, collection:'orders'       }));
const OTPModel        = mongoose.model('OTP',        new S({}, { strict:false, collection:'otps'         }));
const SettingsModel   = mongoose.model('SiteSettings',new S({},{ strict:false, collection:'sitesettings' }));


// ──────────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────────
async function migrate() {
  let db;

  try {
    // ── CONNECT ────────────────────────────────────────────────────────────
    log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adaah_jewels');
    log('MongoDB connected.');

    log('Connecting to MySQL...');
    db = await mysql.createConnection({
      host:     process.env.MYSQL_HOST     || 'localhost',
      port:     parseInt(process.env.MYSQL_PORT || '3306'),
      user:     process.env.MYSQL_USER     || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'adaah_jewels',
      multipleStatements: true,
    });
    log('MySQL connected.');

    await db.query('SET FOREIGN_KEY_CHECKS = 0');

    // ── TRUNCATE ───────────────────────────────────────────────────────────
    log('Truncating tables...');
    for (const t of ['order_items','orders','product_images','products',
                     'categories','otps','users','coupons','banners']) {
      await db.query(`TRUNCATE TABLE ${t}`);
    }
    await db.query('DELETE FROM site_settings WHERE id > 0');
    log('Tables cleared.');

    // ── 1. USERS ───────────────────────────────────────────────────────────
    log('Migrating users...');
    const users = await UserModel.find().lean();
    for (const u of users) {
      const [result] = await db.query(
        `INSERT INTO users (name, email, phone, password, role,
           reset_password_token, reset_password_expires, refresh_token, created_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          u.name, u.email, u.phone || null, u.password,
          u.role || 'customer',
          u.resetPasswordToken   || null,
          u.resetPasswordExpires || null,
          u.refreshToken         || null,
          u.createdAt            || new Date(),
        ]
      );
      userMap[u._id.toString()] = result.insertId;
    }
    log(`Migrated ${users.length} users.`);

    // ── 2. CATEGORIES (top-level, parent_id = NULL) ────────────────────────
    log('Migrating categories...');
    const categories = await CategoryModel.find().lean();
    for (const c of categories) {
      const [result] = await db.query(
        `INSERT INTO categories (name, slug, parent_id, image_url, description, is_active, created_at)
         VALUES (?,?,NULL,?,?,?,?)`,
        [
          c.name, c.slug,
          c.image || c.imageUrl || null,   // imageUrl not in old schema — will be null
          c.description || null,
          c.isActive === false ? 0 : 1,
          c.createdAt || new Date(),
        ]
      );
      catMap[c._id.toString()] = result.insertId;
    }
    log(`Migrated ${categories.length} categories.`);

    // ── 3. SUBCATEGORIES → inserted into categories with parent_id set ────
    log('Migrating subcategories...');
    const subcats = await SubCatModel.find().lean();
    for (const sc of subcats) {
      const parentMysqlId = catMap[sc.category?.toString()];
      if (!parentMysqlId) {
        warn(`SubCategory "${sc.name}" has unknown category ref ${sc.category}, skipping.`);
        continue;
      }
      const [result] = await db.query(
        `INSERT INTO categories (name, slug, parent_id, image_url, description, is_active, created_at)
         VALUES (?,?,?,?,?,?,?)`,
        [
          sc.name, sc.slug, parentMysqlId,
          sc.image || sc.imageUrl || null,
          sc.description || null,
          sc.isActive === false ? 0 : 1,
          sc.createdAt || new Date(),
        ]
      );
      subCatMap[sc._id.toString()]         = result.insertId;
      subCatNameMap[sc.name.toLowerCase()] = result.insertId;
    }
    log(`Migrated ${subcats.length} subcategories → inserted into categories table.`);

    // ── 4. PRODUCTS ────────────────────────────────────────────────────────
    log('Migrating products...');
    const products = await ProductModel.find().lean();
    for (const p of products) {
      // MongoDB stored subCategory as a string name → resolve to MySQL categories.id
      const categoryId = subCatNameMap[(p.subCategory || '').toLowerCase()];
      if (!categoryId) {
        warn(`Product "${p.name}" has unresolved subCategory "${p.subCategory}", skipping.`);
        continue;
      }

      const [result] = await db.query(
        `INSERT INTO products (name, category_id, material_type, price, discount,
           delivery_days, description, care_instructions, stock, is_active, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [
          p.name, categoryId, p.materialType,
          p.price, p.discount || 0,
          p.deliveryDays || 5,
          p.description, p.careInstructions || null,
          p.stock || 0,
          p.isActive === false ? 0 : 1,
          p.createdAt || new Date(),
        ]
      );
      const mysqlProductId = result.insertId;
      productMap[p._id.toString()] = mysqlProductId;

      // Images (sizes/colors removed per spec)
      for (let i = 0; i < (p.images || []).length; i++) {
        if (p.images[i]) {
          await db.query(
            'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?,?,?)',
            [mysqlProductId, p.images[i], i]
          );
        }
      }
    }
    log(`Migrated ${products.length} products.`);

    // ── 5. ORDERS ──────────────────────────────────────────────────────────
    log('Migrating orders...');
    const orders = await OrderModel.find().lean();
    for (const o of orders) {
      const userMysqlId = userMap[o.user?.toString()];
      if (!userMysqlId) {
        warn(`Order ${o._id} has unknown user ref ${o.user}, skipping.`);
        continue;
      }
      const sa = o.shippingAddress || {};

      const [orderResult] = await db.query(
        `INSERT INTO orders (user_id, total_amount, status, payment_method,
           payment_id, razorpay_order_id,
           shipping_name, shipping_phone, shipping_address,
           shipping_city, shipping_state, shipping_pincode, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userMysqlId, o.totalAmount || 0,
          o.status || 'pending', o.paymentMethod || 'cod',
          o.paymentId       || null,
          o.razorpayOrderId || null,
          sa.name    || '', sa.phone   || '', sa.address || '',
          sa.city    || '', sa.state   || '', sa.pincode || '',
          o.createdAt || new Date(),
        ]
      );
      const mysqlOrderId = orderResult.insertId;

      for (const item of (o.items || [])) {
        const productMysqlId = productMap[item.product?.toString()];
        if (!productMysqlId) {
          warn(`Order ${mysqlOrderId}: item product ${item.product} not found, skipping item.`);
          continue;
        }
        await db.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)',
          [mysqlOrderId, productMysqlId, item.quantity || 1, item.price || 0]
        );
      }
    }
    log(`Migrated ${orders.length} orders.`);

    // ── 6. OTPs (non-expired only) ─────────────────────────────────────────
    log('Migrating OTPs...');
    const otps = await OTPModel.find({ expiresAt: { $gt: new Date() } }).lean();
    for (const o of otps) {
      await db.query(
        `INSERT INTO otps (email, phone, otp, expires_at, attempts, type, verified, created_at)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          o.email || null, o.phone || null, o.otp,
          o.expiresAt, o.attempts || 0, o.type,
          o.verified ? 1 : 0,
          o.createdAt || new Date(),
        ]
      );
    }
    log(`Migrated ${otps.length} OTPs.`);

    // ── 7. SITE SETTINGS ───────────────────────────────────────────────────
    log('Migrating site settings...');
    const settings = await SettingsModel.findOne().lean();
    if (settings) {
      const sm = settings.socialMedia || {};
      await db.query(
        `INSERT INTO site_settings
           (logo, site_name, tagline, contact_email, contact_phone,
            social_instagram, social_facebook, social_twitter, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          settings.logo || '/logo.svg',
          settings.siteName || 'श्री sootra',
          settings.tagline || null,
          settings.contactEmail || null,
          settings.contactPhone || null,
          sm.instagram || null,
          sm.facebook  || null,
          sm.twitter   || null,
          settings.updatedAt || new Date(),
        ]
      );
      log('Site settings migrated.');
    } else {
      log('No site settings in MongoDB — default row already inserted by schema.');
    }

    // ── DONE ───────────────────────────────────────────────────────────────
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    log('✅  Migration complete!');

  } catch (e) {
    fail(`Migration failed: ${e.message}`);
    console.error(e.stack);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (db) await db.end();
  }
}

migrate();
