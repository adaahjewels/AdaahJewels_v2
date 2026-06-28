-- =============================================================================
-- AdaahJewels — MySQL Schema (v3)
-- Changes from v2:
--   • categories + subcategories merged into one self-referencing `categories`
--     table using parent_id (NULL = top-level, non-NULL = subcategory)
--   • categories gains image_url column
--   • products.category_id FKs directly to categories (the leaf row)
--   • subcategories table removed
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE DATABASE IF NOT EXISTS adaah_jewels_v2
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE adaah_jewels_v2;

-- =============================================================================
-- TABLE: users
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id                      INT             NOT NULL AUTO_INCREMENT,
  name                    VARCHAR(255)    NOT NULL,
  email                   VARCHAR(255)    NOT NULL,
  phone                   VARCHAR(20)     NULL,
  password                VARCHAR(255)    NOT NULL,
  role                    ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  reset_password_token    VARCHAR(255)    NULL,
  reset_password_expires  DATETIME        NULL,
  refresh_token           TEXT            NULL,
  created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone),
  INDEX idx_users_role (role),
  INDEX idx_users_reset_token (reset_password_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: categories  (self-referencing — handles both categories & subcategories)
--
--   parent_id = NULL   →  top-level category   (e.g. "Necklaces")
--   parent_id = <id>   →  subcategory           (e.g. "Choker Necklace")
--
--   image_url: display image shown on the storefront category card.
--              Can be set on both parent and child categories.
-- =============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id          INT          NOT NULL AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL,
  parent_id   INT          NULL DEFAULT NULL,       -- NULL = top-level category
  image_url   TEXT         NULL,                    -- category card image
  description TEXT         NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  UNIQUE KEY uq_categories_name_parent (name, parent_id),  -- name unique within its parent
  INDEX idx_categories_parent_id (parent_id),
  INDEX idx_categories_is_active (is_active),
  CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: products
-- category_id → references categories(id); should point to a subcategory row
--              (a row where parent_id IS NOT NULL), but the FK allows any row.
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
  id                INT            NOT NULL AUTO_INCREMENT,
  name              VARCHAR(255)   NOT NULL,
  category_id       INT            NOT NULL,        -- FK to categories (leaf/subcategory)
  material_type     VARCHAR(50)    NOT NULL,
  price             DECIMAL(10,2)  NOT NULL,
  discount          DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
  delivery_days     INT            NOT NULL DEFAULT 5,
  description       TEXT           NOT NULL,
  care_instructions TEXT           NULL,
  stock             INT            NOT NULL DEFAULT 0,
  is_active         TINYINT(1)     NOT NULL DEFAULT 1,
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_products_category_id (category_id),
  INDEX idx_products_material_type (material_type),
  INDEX idx_products_price (price),
  INDEX idx_products_is_active (is_active),
  FULLTEXT INDEX ft_products_search (name, description),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: product_images
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_images (
  id          INT  NOT NULL AUTO_INCREMENT,
  product_id  INT  NOT NULL,
  image_url   TEXT NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  INDEX idx_product_images_product_id (product_id),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: orders
-- shippingAddress flattened; status changes auto-restore stock via TRIGGER
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id                  INT            NOT NULL AUTO_INCREMENT,
  user_id             INT            NOT NULL,
  total_amount        DECIMAL(10,2)  NOT NULL,
  status              ENUM('pending','confirmed','shipped','delivered','cancelled')
                      NOT NULL DEFAULT 'pending',
  payment_method      VARCHAR(50)    NOT NULL,
  payment_id          VARCHAR(255)   NULL,
  razorpay_order_id   VARCHAR(255)   NULL,
  shipping_name       VARCHAR(255)   NOT NULL,
  shipping_phone      VARCHAR(20)    NOT NULL,
  shipping_address    TEXT           NOT NULL,
  shipping_city       VARCHAR(100)   NOT NULL,
  shipping_state      VARCHAR(100)   NOT NULL,
  shipping_pincode    VARCHAR(10)    NOT NULL,
  created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_orders_user_id (user_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created_at (created_at),
  INDEX idx_orders_payment_id (payment_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: order_items
-- =============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id          INT            NOT NULL AUTO_INCREMENT,
  order_id    INT            NOT NULL,
  product_id  INT            NOT NULL,
  quantity    INT            NOT NULL,
  price       DECIMAL(10,2)  NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_order_items_order_id (order_id),
  INDEX idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- TRIGGER: trg_restore_stock_on_cancel
-- When an order status changes TO 'cancelled', restore stock for all its items
-- =============================================================================
DELIMITER $$
CREATE TRIGGER trg_restore_stock_on_cancel
  AFTER UPDATE ON orders
  FOR EACH ROW
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE products p
    JOIN order_items oi ON oi.product_id = p.id
    SET p.stock = p.stock + oi.quantity
    WHERE oi.order_id = NEW.id;
  END IF;
END $$
DELIMITER ;

-- =============================================================================
-- TABLE: otps
-- =============================================================================
CREATE TABLE IF NOT EXISTS otps (
  id          INT          NOT NULL AUTO_INCREMENT,
  email       VARCHAR(255) NULL,
  phone       VARCHAR(20)  NULL,
  otp         VARCHAR(10)  NOT NULL,
  expires_at  DATETIME     NOT NULL,
  attempts    INT          NOT NULL DEFAULT 0,
  type        ENUM('registration','login','password-reset') NOT NULL,
  verified    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_otps_email_type (email, type),
  INDEX idx_otps_phone_type (phone, type),
  INDEX idx_otps_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: coupons
-- Fields derived from Coupons.jsx frontend analysis
-- =============================================================================
CREATE TABLE IF NOT EXISTS coupons (
  id              INT            NOT NULL AUTO_INCREMENT,
  code            VARCHAR(50)    NOT NULL,
  discount_type   ENUM('percentage','fixed') NOT NULL DEFAULT 'percentage',
  discount_value  DECIMAL(10,2)  NOT NULL,
  max_uses        INT            NULL,          -- NULL = unlimited
  used_count      INT            NOT NULL DEFAULT 0,
  valid_from      DATE           NULL,
  valid_to        DATE           NULL,
  is_active       TINYINT(1)     NOT NULL DEFAULT 1,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_coupons_code (code),
  INDEX idx_coupons_is_active (is_active),
  INDEX idx_coupons_valid_to (valid_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: banners
-- Fields derived from Banners.jsx frontend analysis
-- =============================================================================
CREATE TABLE IF NOT EXISTS banners (
  id            INT          NOT NULL AUTO_INCREMENT,
  title         VARCHAR(255) NOT NULL,
  image_url     TEXT         NOT NULL,
  link          VARCHAR(500) NULL,
  position      ENUM('hero','sidebar','footer','category') NOT NULL DEFAULT 'hero',
  display_order INT          NOT NULL DEFAULT 0,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_banners_position (position),
  INDEX idx_banners_is_active (is_active),
  INDEX idx_banners_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: site_settings  (singleton)
-- =============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id                INT          NOT NULL AUTO_INCREMENT,
  logo              TEXT         NOT NULL,
  site_name         VARCHAR(255) NOT NULL DEFAULT 'श्री sootra',
  tagline           VARCHAR(255) NULL,
  contact_email     VARCHAR(255) NULL,
  contact_phone     VARCHAR(20)  NULL,
  social_instagram  VARCHAR(255) NULL,
  social_facebook   VARCHAR(255) NULL,
  social_twitter    VARCHAR(255) NULL,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO site_settings (logo, site_name, tagline)
VALUES ('/logo.svg', 'Adaah Jewels', 'Elegance in Every Thread');

SET FOREIGN_KEY_CHECKS = 1;
