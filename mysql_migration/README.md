# AdaahJewels — MongoDB → MySQL Migration (v2 — Final)

## File Overview

| File | Purpose |
|---|---|
| `01_schema.sql` | Full DDL — 10 tables, FK constraints, indexes, cancel-stock trigger |
| `02_stored_procedures.sql` | ~50 stored procedures for all operations |
| `03_migrate.js` | Node.js script: reads MongoDB, inserts into MySQL |
| `04_validate.js` | Post-migration validation: counts + sample checks + SP smoke tests |
| `.env.migration.example` | Environment variable template |

---

## Schema (MongoDB → MySQL)

| MongoDB Collection | MySQL Table(s) | Key Changes |
|---|---|---|
| `users` | `users` | `INT AUTO_INCREMENT` PK |
| `categories` | `categories` | direct mapping |
| `subcategories` | `subcategories` | FK → `categories` |
| `products` | `products` + `product_images` | `sub_category_id` is FK → `subcategories`; sizes/colors columns **removed** |
| `orders` | `orders` + `order_items` | `shippingAddress` flattened; `items[]` normalized; size/color removed from order_items |
| `otps` | `otps` | TTL → app-level cleanup SP |
| `sitesettings` | `site_settings` | `socialMedia` flattened; singleton |
| *(new)* | `coupons` | code, discountType, discountValue, maxUses, validFrom/To |
| *(new)* | `banners` | title, imageUrl, link, position, displayOrder |

---

## Design Decisions (from your answers)

1. **IDs** — `INT AUTO_INCREMENT`. No UUIDs.
2. **Sizes & colors** — removed from products entirely.
3. **`sub_category_id`** — proper FK to `subcategories` table (was a string enum in Mongo).
4. **Mongoose** — removed entirely. MySQL is the only database.
5. **No live data** — migration truncates and re-inserts freely.
6. **Coupons** — new table created from `Coupons.jsx` analysis: code (unique), discount_type, discount_value, max_uses, valid_from, valid_to, is_active, used_count.
7. **Banners** — new table from `Banners.jsx`: title, image_url, link, position (hero/sidebar/footer/category), display_order, is_active.
8. **Stock restore on cancel** — handled by `trg_restore_stock_on_cancel` TRIGGER in `01_schema.sql`. Fires automatically when `orders.status` changes to `'cancelled'`. No app-level code needed.
9. **OTP cleanup** — application-level. Call `sp_cleanup_expired_otps()` on a timer.

---

## How to Run

### Step 0 — Install dependencies
```bash
cd mysql_migration
npm init -y
npm install mongoose mysql2 dotenv
```

### Step 1 — Create schema
```bash
mysql -u root -p < 01_schema.sql
```

### Step 2 — Load stored procedures
```bash
mysql -u root -p adaah_jewels < 02_stored_procedures.sql
```

### Step 3 — Configure environment
```bash
cp .env.migration.example .env.migration
# Edit with your MongoDB URI and MySQL credentials
```

### Step 4 — Run migration
```bash
node 03_migrate.js
```

### Step 5 — Validate
```bash
node 04_validate.js
```

---

## Stored Procedures Reference

### Users
| SP | Description |
|---|---|
| `sp_create_user(name, email, phone, password, role)` | Register user, returns `LAST_INSERT_ID` |
| `sp_get_user_by_id(id)` | Fetch by PK (no password) |
| `sp_get_user_by_email(email)` | Login lookup |
| `sp_get_user_by_email_or_phone(identifier)` | Login with email OR phone |
| `sp_update_user_refresh_token(id, token)` | Save JWT refresh token |
| `sp_update_user_profile(id, name, email, phone)` | Profile update |
| `sp_update_user_password(id, new_password)` | Change/reset password |
| `sp_set_reset_password_token(id, token, expires)` | Forgot-password flow |
| `sp_get_user_by_reset_token(token)` | Validate reset token |
| `sp_check_email_exists_excluding(email, exclude_id)` | Uniqueness guard on profile update |
| `sp_check_phone_exists_excluding(phone, exclude_id)` | Uniqueness guard on profile update |
| `sp_get_users(limit, offset)` | Admin: paginated user list |

### Categories
`sp_create_category`, `sp_get_categories` (active), `sp_get_categories_admin` (all), `sp_get_category_by_id`, `sp_update_category`, `sp_delete_category` (raises error if subcategories exist)

### Subcategories
`sp_create_subcategory`, `sp_get_subcategories(category_id)`, `sp_get_subcategories_admin`, `sp_get_subcategory_by_id`, `sp_update_subcategory`, `sp_delete_subcategory` (raises error if products exist)

### Products
`sp_create_product`, `sp_add_product_image`, `sp_replace_product_images`, `sp_get_products(sub_category_id, material_type, min_price, max_price, search, limit, offset)`, `sp_get_product_by_id`, `sp_update_product`, `sp_delete_product` (soft), `sp_update_product_stock(product_id, delta)`

### Orders
`sp_create_order(user_id, total, payment_method, shipping_*, items_json)` — transactional, decrements stock | `sp_get_order_by_id`, `sp_get_orders_by_user`, `sp_get_orders_admin`, `sp_update_order_status` (trigger auto-restores stock on cancel), `sp_update_order_payment`

### Coupons
`sp_create_coupon`, `sp_get_coupons`, `sp_get_coupon_by_id`, `sp_get_coupon_by_code` (validates active + date + usage limit), `sp_update_coupon`, `sp_delete_coupon`, `sp_increment_coupon_usage`

### Banners
`sp_create_banner`, `sp_get_banners(position)`, `sp_get_banners_admin`, `sp_get_banner_by_id`, `sp_update_banner`, `sp_delete_banner`

### OTPs
`sp_create_otp`, `sp_get_otp`, `sp_increment_otp_attempts`, `sp_verify_otp`, `sp_delete_otp`, `sp_cleanup_expired_otps`

### Site Settings
`sp_get_site_settings`, `sp_upsert_site_settings`

### Reporting
`sp_get_dashboard_stats` (orders by status, revenue, customers, products, coupons, banners), `sp_get_top_products(limit)`, `sp_get_revenue_by_month`

---

## OTP Cleanup — App-Level Setup

Add this to your server startup (e.g. `index.ts`):

```ts
import mysql from 'mysql2/promise';

// Run every 5 minutes
setInterval(async () => {
  try {
    await pool.query('CALL sp_cleanup_expired_otps()');
  } catch (e) {
    console.error('OTP cleanup failed:', e);
  }
}, 5 * 60 * 1000);
```

---

## Rollback Plan

**Scenario A — Migration failed:**
Re-run `node 03_migrate.js` — it truncates all tables first, so it is fully idempotent.

**Scenario B — MySQL has a bug, need to go back to MongoDB:**
Since there is no live MongoDB data to protect, simply drop the MySQL database and recreate from scratch once the issue is fixed:
```sql
DROP DATABASE adaah_jewels;
```
Then re-run from Step 1.

**Scenario C — Partial rollback of a specific table:**
```sql
TRUNCATE TABLE products;
TRUNCATE TABLE product_images;
-- Then re-run 03_migrate.js (it will re-truncate everything anyway)
```
