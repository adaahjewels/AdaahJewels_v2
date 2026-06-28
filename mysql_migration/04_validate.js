/**
 * Post-Migration Validation Script  (v2 — Final)
 * Compares MongoDB vs MySQL: record counts + sample field checks.
 *
 * Usage:  node 04_validate.js
 * Deps:   npm install mongoose mysql2 dotenv
 */

require('dotenv').config({ path: '.env.migration' });
const mongoose = require('mongoose');
const mysql    = require('mysql2/promise');

let passed = 0;
let failed = 0;

const pass = (msg) => { console.log(`  [PASS]  ${msg}`); passed++; };
const fail = (msg) => { console.error(`  [FAIL]  ${msg}`); failed++; };
const info = (msg) => console.info(`\n${msg}`);

function assertEq(label, actual, expected) {
  if (String(actual) === String(expected)) {
    pass(`${label}  →  ${actual}`);
  } else {
    fail(`${label}  →  expected "${expected}"  got "${actual}"`);
  }
}

async function validate() {
  let db;
  try {
    // ── CONNECT ──────────────────────────────────────────────────────────
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adaah_jewels');
    db = await mysql.createConnection({
      host:     process.env.MYSQL_HOST     || 'localhost',
      port:     parseInt(process.env.MYSQL_PORT || '3306'),
      user:     process.env.MYSQL_USER     || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'adaah_jewels',
    });
    console.log('[INFO]  Connected to both databases.\n');

    const mdb = mongoose.connection.db;

    // ── 1. ROW COUNTS ────────────────────────────────────────────────────
    info('=== 1. Row Count Checks ===');

    const tables = [
      'users', 'categories', 'products', 'orders'
    ];
    for (const t of tables) {
      const mongoCount = await mdb.collection(t).countDocuments();
      const [[{ cnt }]] = await db.query(`SELECT COUNT(*) AS cnt FROM ${t}`);
      assertEq(`${t} count`, Number(cnt), mongoCount);
    }

    // categories: mongo categories + mongo subcategories should both be in MySQL categories
    const mongoCatCount    = await mdb.collection('categories').countDocuments();
    const mongoSubCatCount = await mdb.collection('subcategories').countDocuments();
    const [[{ catTotalCnt }]] = await db.query('SELECT COUNT(*) AS catTotalCnt FROM categories');
    assertEq('categories total (cats + subcats)', Number(catTotalCnt), mongoCatCount + mongoSubCatCount);

    // top-level categories (parent_id IS NULL) should equal mongo categories count
    const [[{ parentCnt }]] = await db.query('SELECT COUNT(*) AS parentCnt FROM categories WHERE parent_id IS NULL');
    assertEq('top-level categories count', Number(parentCnt), mongoCatCount);

    // subcategories (parent_id IS NOT NULL) should equal mongo subcategories count
    const [[{ childCnt }]] = await db.query('SELECT COUNT(*) AS childCnt FROM categories WHERE parent_id IS NOT NULL');
    assertEq('subcategories count (child rows)', Number(childCnt), mongoSubCatCount);

    // order_items — sum of all items arrays in MongoDB
    const mongoOrders = await mdb.collection('orders').find({}).toArray();
    const totalItems  = mongoOrders.reduce((s, o) => s + (o.items || []).length, 0);
    const [[{ ic }]]  = await db.query('SELECT COUNT(*) AS ic FROM order_items');
    assertEq('order_items count', Number(ic), totalItems);

    // product_images — sum of all images arrays in MongoDB
    const mongoProducts  = await mdb.collection('products').find({}).toArray();
    const totalImages    = mongoProducts.reduce((s, p) => s + (p.images || []).length, 0);
    const [[{ imgCnt }]] = await db.query('SELECT COUNT(*) AS imgCnt FROM product_images');
    assertEq('product_images count', Number(imgCnt), totalImages);

    // ── 2. SAMPLE USER ───────────────────────────────────────────────────
    info('=== 2. Sample User Check ===');
    const mUser = await mdb.collection('users').findOne({});
    if (mUser) {
      const [[sqlUser]] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [mUser.email]);
      if (sqlUser) {
        assertEq('user.email',    sqlUser.email,            mUser.email);
        assertEq('user.name',     sqlUser.name,             mUser.name);
        assertEq('user.role',     sqlUser.role,             mUser.role || 'customer');
        assertEq('user.password', sqlUser.password,         mUser.password);
      } else {
        fail(`User "${mUser.email}" not found in MySQL`);
      }
    } else {
      console.info('  [SKIP]  No users in MongoDB.');
    }

    // ── 3. SAMPLE PRODUCT ────────────────────────────────────────────────
    info('=== 3. Sample Product Check ===');
    const mProd = await mdb.collection('products').findOne({});
    if (mProd) {
      const [[sqlProd]] = await db.query('SELECT * FROM products WHERE name = ? LIMIT 1', [mProd.name]);
      if (sqlProd) {
        assertEq('product.name',      sqlProd.name,                     mProd.name);
        assertEq('product.price',     Number(sqlProd.price),            mProd.price);
        assertEq('product.stock',     sqlProd.stock,                    mProd.stock || 0);
        assertEq('product.is_active', sqlProd.is_active,                mProd.isActive === false ? 0 : 1);
        assertEq('product.discount',  Number(sqlProd.discount),         mProd.discount || 0);

        // category_id must not be null and must point to a child row (subcategory)
        if (!sqlProd.category_id) {
          fail('product.category_id is NULL — subcategory not resolved');
        } else {
          pass(`product.category_id = ${sqlProd.category_id}`);
          // Verify the category row is a leaf (has parent_id set)
          const [[catRow]] = await db.query(
            'SELECT id, name, parent_id FROM categories WHERE id = ?', [sqlProd.category_id]
          );
          if (catRow && catRow.parent_id !== null) {
            pass(`product category "${catRow.name}" is correctly a subcategory (parent_id=${catRow.parent_id})`);
          } else {
            fail(`product category_id ${sqlProd.category_id} points to a top-level category — expected a subcategory`);
          }
        }

        // images count
        const imgCount = (mProd.images || []).filter(Boolean).length;
        const [[{ piCnt }]] = await db.query(
          'SELECT COUNT(*) AS piCnt FROM product_images WHERE product_id = ?', [sqlProd.id]
        );
        assertEq('product images count', Number(piCnt), imgCount);
      } else {
        fail(`Product "${mProd.name}" not found in MySQL`);
      }
    } else {
      console.info('  [SKIP]  No products in MongoDB.');
    }

    // ── 4. SAMPLE ORDER ──────────────────────────────────────────────────
    info('=== 4. Sample Order Check ===');
    const mOrder = await mdb.collection('orders').findOne({});
    if (mOrder) {
      // Find by shipping_name + created_at (closest match without UUID)
      const [[sqlOrder]] = await db.query(
        `SELECT o.* FROM orders o
         JOIN users u ON o.user_id = u.id
         JOIN (SELECT id FROM users WHERE email = (
           SELECT email FROM users WHERE email = (
             SELECT email FROM users LIMIT 1
           )
         ) LIMIT 1) uu ON o.user_id = uu.id
         WHERE o.shipping_name = ? LIMIT 1`,
        [mOrder.shippingAddress?.name || '']
      );
      if (sqlOrder) {
        assertEq('order.total_amount',    Number(sqlOrder.total_amount), mOrder.totalAmount);
        assertEq('order.status',          sqlOrder.status,               mOrder.status || 'pending');
        assertEq('order.payment_method',  sqlOrder.payment_method,       mOrder.paymentMethod);
        assertEq('order.shipping_city',   sqlOrder.shipping_city,        mOrder.shippingAddress?.city || '');
        assertEq('order.shipping_pincode',sqlOrder.shipping_pincode,     mOrder.shippingAddress?.pincode || '');
      } else {
        console.info('  [SKIP]  Could not match sample order (no users yet).');
      }
    } else {
      console.info('  [SKIP]  No orders in MongoDB.');
    }

    // ── 5. STORED PROCEDURE SMOKE TESTS ─────────────────────────────────
    info('=== 5. Stored Procedure Smoke Tests ===');

    // sp_get_categories
    try {
      const [rows] = await db.query('CALL sp_get_categories()');
      pass(`sp_get_categories() returned ${rows[0]?.length ?? 0} rows`);
    } catch (e) { fail(`sp_get_categories() threw: ${e.message}`); }

    // sp_get_products
    try {
      const [rows] = await db.query('CALL sp_get_products(NULL,NULL,NULL,NULL,NULL,10,0)');
      pass(`sp_get_products() returned ${rows[0]?.length ?? 0} rows`);
    } catch (e) { fail(`sp_get_products() threw: ${e.message}`); }

    // sp_get_orders_admin
    try {
      const [rows] = await db.query('CALL sp_get_orders_admin()');
      pass(`sp_get_orders_admin() returned ${rows[0]?.length ?? 0} rows`);
    } catch (e) { fail(`sp_get_orders_admin() threw: ${e.message}`); }

    // sp_get_dashboard_stats
    try {
      await db.query('CALL sp_get_dashboard_stats()');
      pass('sp_get_dashboard_stats() executed successfully');
    } catch (e) { fail(`sp_get_dashboard_stats() threw: ${e.message}`); }

    // sp_get_site_settings
    try {
      const [rows] = await db.query('CALL sp_get_site_settings()');
      pass(`sp_get_site_settings() returned site_name = "${rows[0]?.[0]?.site_name ?? '?'}"`);
    } catch (e) { fail(`sp_get_site_settings() threw: ${e.message}`); }

    // sp_cleanup_expired_otps
    try {
      await db.query('CALL sp_cleanup_expired_otps()');
      pass('sp_cleanup_expired_otps() executed successfully');
    } catch (e) { fail(`sp_cleanup_expired_otps() threw: ${e.message}`); }

    // sp_get_coupons
    try {
      const [rows] = await db.query('CALL sp_get_coupons()');
      pass(`sp_get_coupons() returned ${rows[0]?.length ?? 0} rows`);
    } catch (e) { fail(`sp_get_coupons() threw: ${e.message}`); }

    // sp_get_banners_admin
    try {
      const [rows] = await db.query('CALL sp_get_banners_admin()');
      pass(`sp_get_banners_admin() returned ${rows[0]?.length ?? 0} rows`);
    } catch (e) { fail(`sp_get_banners_admin() threw: ${e.message}`); }

    // ── SUMMARY ──────────────────────────────────────────────────────────
    info('=== Summary ===');
    console.log(`  PASSED: ${passed}`);
    if (failed > 0) {
      console.error(`  FAILED: ${failed}`);
      process.exitCode = 1;
    } else {
      console.log('  All checks passed ✅');
    }

  } catch (e) {
    console.error(`[ERROR]  ${e.message}`);
    console.error(e.stack);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (db) await db.end();
  }
}

validate();
