-- =============================================================================
-- AdaahJewels — MySQL Stored Procedures (v3)
-- IDs: INT AUTO_INCREMENT
-- Categories: single self-referencing table (parent_id = NULL → top-level)
--             image_url added; subcategories table removed
-- Products: category_id FK → categories; no sizes/colors
-- Orders: stock auto-restored on cancel via TRIGGER (in schema)
-- =============================================================================

USE adaah_jewels_v2;
DELIMITER $$

-- =============================================================================
-- USERS
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_create_user $$
CREATE PROCEDURE sp_create_user(
  IN p_name     VARCHAR(255),
  IN p_email    VARCHAR(255),
  IN p_phone    VARCHAR(20),
  IN p_password VARCHAR(255),
  IN p_role     ENUM('customer','admin')
)
BEGIN
  INSERT INTO users (name, email, phone, password, role)
  VALUES (p_name, p_email, NULLIF(p_phone,''), p_password, p_role);
  SELECT LAST_INSERT_ID() AS id;
END $$

DROP PROCEDURE IF EXISTS sp_get_user_by_id $$
CREATE PROCEDURE sp_get_user_by_id(IN p_id INT)
BEGIN
  SELECT id, name, email, phone, role,
         reset_password_token, reset_password_expires,
         refresh_token, created_at
  FROM users WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_get_user_by_email $$
CREATE PROCEDURE sp_get_user_by_email(IN p_email VARCHAR(255))
BEGIN
  SELECT * FROM users WHERE email = p_email LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_get_user_by_email_or_phone $$
CREATE PROCEDURE sp_get_user_by_email_or_phone(IN p_identifier VARCHAR(255))
BEGIN
  SELECT * FROM users
  WHERE email = p_identifier OR phone = p_identifier
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_update_user_refresh_token $$
CREATE PROCEDURE sp_update_user_refresh_token(
  IN p_id    INT,
  IN p_token TEXT
)
BEGIN
  UPDATE users SET refresh_token = p_token WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_update_user_profile $$
CREATE PROCEDURE sp_update_user_profile(
  IN p_id    INT,
  IN p_name  VARCHAR(255),
  IN p_email VARCHAR(255),
  IN p_phone VARCHAR(20)
)
BEGIN
  UPDATE users
  SET name  = COALESCE(NULLIF(p_name,''),  name),
      email = COALESCE(NULLIF(p_email,''), email),
      phone = COALESCE(NULLIF(p_phone,''), phone)
  WHERE id = p_id;
  SELECT id, name, email, phone, role FROM users WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_update_user_password $$
CREATE PROCEDURE sp_update_user_password(
  IN p_id           INT,
  IN p_new_password VARCHAR(255)
)
BEGIN
  UPDATE users
  SET password = p_new_password,
      reset_password_token   = NULL,
      reset_password_expires = NULL
  WHERE id = p_id;
END $$


DROP PROCEDURE IF EXISTS sp_set_reset_password_token $$
CREATE PROCEDURE sp_set_reset_password_token(
  IN p_id      INT,
  IN p_token   VARCHAR(255),
  IN p_expires DATETIME
)
BEGIN
  UPDATE users
  SET reset_password_token = p_token,
      reset_password_expires = p_expires
  WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_get_user_by_reset_token $$
CREATE PROCEDURE sp_get_user_by_reset_token(IN p_token VARCHAR(255))
BEGIN
  SELECT * FROM users
  WHERE reset_password_token = p_token
    AND reset_password_expires > NOW()
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_check_email_exists_excluding $$
CREATE PROCEDURE sp_check_email_exists_excluding(
  IN p_email   VARCHAR(255),
  IN p_exclude INT
)
BEGIN
  SELECT COUNT(*) AS cnt FROM users
  WHERE email = p_email AND id != p_exclude;
END $$

DROP PROCEDURE IF EXISTS sp_check_phone_exists_excluding $$
CREATE PROCEDURE sp_check_phone_exists_excluding(
  IN p_phone   VARCHAR(20),
  IN p_exclude INT
)
BEGIN
  SELECT COUNT(*) AS cnt FROM users
  WHERE phone = p_phone AND id != p_exclude;
END $$

DROP PROCEDURE IF EXISTS sp_get_users $$
CREATE PROCEDURE sp_get_users(
  IN p_limit  INT,
  IN p_offset INT
)
BEGIN
  SELECT id, name, email, phone, role, created_at
  FROM users
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset;
END $$

-- =============================================================================
-- CATEGORIES  (unified — handles both top-level categories AND subcategories)
--
--  parent_id = NULL  →  top-level category  (e.g. "Necklaces")
--  parent_id = <id>  →  subcategory         (e.g. "Choker Necklace")
--
--  Both levels have name, slug, image_url, description, is_active.
--  SP naming kept the same as existing API routes to avoid breaking changes.
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_create_category $$
CREATE PROCEDURE sp_create_category(
  IN p_name        VARCHAR(255),
  IN p_slug        VARCHAR(255),
  IN p_image_url   TEXT,
  IN p_description TEXT
)
BEGIN
  INSERT INTO categories (name, slug, parent_id, image_url, description)
  VALUES (p_name, p_slug, NULL, NULLIF(p_image_url,''), NULLIF(p_description,''));
  SELECT * FROM categories WHERE id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_get_categories $$
CREATE PROCEDURE sp_get_categories()
BEGIN
  SELECT c.*,
    (SELECT COUNT(*) FROM categories ch WHERE ch.parent_id = c.id AND ch.is_active = 1) AS subcategory_count
  FROM categories c
  WHERE c.parent_id IS NULL AND c.is_active = 1
  ORDER BY c.name ASC;
END $$

DROP PROCEDURE IF EXISTS sp_get_categories_admin $$
CREATE PROCEDURE sp_get_categories_admin()
BEGIN
  SELECT c.*,
    (SELECT COUNT(*) FROM categories ch WHERE ch.parent_id = c.id) AS subcategory_count
  FROM categories c
  WHERE c.parent_id IS NULL
  ORDER BY c.name ASC;
END $$

DROP PROCEDURE IF EXISTS sp_get_category_by_id $$
CREATE PROCEDURE sp_get_category_by_id(IN p_id INT)
BEGIN
  SELECT * FROM categories WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_update_category $$
CREATE PROCEDURE sp_update_category(
  IN p_id          INT,
  IN p_name        VARCHAR(255),
  IN p_slug        VARCHAR(255),
  IN p_image_url   TEXT,
  IN p_description TEXT,
  IN p_is_active   TINYINT(1)
)
BEGIN
  UPDATE categories
  SET name        = p_name,
      slug        = p_slug,
      image_url   = NULLIF(p_image_url,''),
      description = NULLIF(p_description,''),
      is_active   = p_is_active
  WHERE id = p_id;
  SELECT * FROM categories WHERE id = p_id;
END $$

-- Blocks deletion if the category has child subcategories
DROP PROCEDURE IF EXISTS sp_delete_category $$
CREATE PROCEDURE sp_delete_category(IN p_id INT)
BEGIN
  DECLARE child_count INT;
  SELECT COUNT(*) INTO child_count FROM categories WHERE parent_id = p_id;
  IF child_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot delete category: subcategories exist';
  ELSE
    DELETE FROM categories WHERE id = p_id;
  END IF;
END $$

-- ── Subcategory SPs (children of a top-level category) ──────────────────────

DROP PROCEDURE IF EXISTS sp_create_subcategory $$
CREATE PROCEDURE sp_create_subcategory(
  IN p_name        VARCHAR(255),
  IN p_slug        VARCHAR(255),
  IN p_parent_id   INT,
  IN p_image_url   TEXT,
  IN p_description TEXT
)
BEGIN
  INSERT INTO categories (name, slug, parent_id, image_url, description)
  VALUES (p_name, p_slug, p_parent_id, NULLIF(p_image_url,''), NULLIF(p_description,''));
  SELECT c.*, p.name AS parent_name
  FROM categories c
  JOIN categories p ON c.parent_id = p.id
  WHERE c.id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_get_subcategories $$
CREATE PROCEDURE sp_get_subcategories(IN p_parent_id INT)
BEGIN
  IF p_parent_id IS NULL OR p_parent_id = 0 THEN
    SELECT c.*, p.name AS parent_name
    FROM categories c
    JOIN categories p ON c.parent_id = p.id
    WHERE c.is_active = 1
    ORDER BY p.name ASC, c.name ASC;
  ELSE
    SELECT c.*, p.name AS parent_name
    FROM categories c
    JOIN categories p ON c.parent_id = p.id
    WHERE c.parent_id = p_parent_id AND c.is_active = 1
    ORDER BY c.name ASC;
  END IF;
END $$

DROP PROCEDURE IF EXISTS sp_get_subcategories_admin $$
CREATE PROCEDURE sp_get_subcategories_admin()
BEGIN
  SELECT c.*, p.name AS parent_name
  FROM categories c
  JOIN categories p ON c.parent_id = p.id
  ORDER BY p.name ASC, c.name ASC;
END $$

DROP PROCEDURE IF EXISTS sp_get_subcategory_by_id $$
CREATE PROCEDURE sp_get_subcategory_by_id(IN p_id INT)
BEGIN
  SELECT c.*, p.name AS parent_name
  FROM categories c
  LEFT JOIN categories p ON c.parent_id = p.id
  WHERE c.id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_update_subcategory $$
CREATE PROCEDURE sp_update_subcategory(
  IN p_id          INT,
  IN p_name        VARCHAR(255),
  IN p_slug        VARCHAR(255),
  IN p_parent_id   INT,
  IN p_image_url   TEXT,
  IN p_description TEXT,
  IN p_is_active   TINYINT(1)
)
BEGIN
  UPDATE categories
  SET name        = p_name,
      slug        = p_slug,
      parent_id   = p_parent_id,
      image_url   = NULLIF(p_image_url,''),
      description = NULLIF(p_description,''),
      is_active   = p_is_active
  WHERE id = p_id;
  SELECT c.*, p.name AS parent_name
  FROM categories c
  LEFT JOIN categories p ON c.parent_id = p.id
  WHERE c.id = p_id;
END $$

-- Blocks deletion if products are assigned to this subcategory
DROP PROCEDURE IF EXISTS sp_delete_subcategory $$
CREATE PROCEDURE sp_delete_subcategory(IN p_id INT)
BEGIN
  DECLARE prod_count INT;
  SELECT COUNT(*) INTO prod_count FROM products WHERE category_id = p_id;
  IF prod_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot delete subcategory: products assigned to it';
  ELSE
    DELETE FROM categories WHERE id = p_id;
  END IF;
END $$

-- Full nav tree: two result sets (parents, then children)
DROP PROCEDURE IF EXISTS sp_get_category_tree $$
CREATE PROCEDURE sp_get_category_tree()
BEGIN
  SELECT * FROM categories WHERE parent_id IS NULL AND is_active = 1 ORDER BY name ASC;
  SELECT c.*, p.name AS parent_name
  FROM categories c
  JOIN categories p ON c.parent_id = p.id
  WHERE c.is_active = 1
  ORDER BY p.name ASC, c.name ASC;
END $$


-- =============================================================================
-- PRODUCTS  (no sizes/colors; category_id FK → categories leaf row)
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_create_product $$
CREATE PROCEDURE sp_create_product(
  IN p_name              VARCHAR(255),
  IN p_category_id       INT,
  IN p_material_type     VARCHAR(50),
  IN p_price             DECIMAL(10,2),
  IN p_discount          DECIMAL(5,2),
  IN p_delivery_days     INT,
  IN p_description       TEXT,
  IN p_care_instructions TEXT,
  IN p_stock             INT
)
BEGIN
  INSERT INTO products (name, category_id, material_type, price, discount,
                        delivery_days, description, care_instructions, stock)
  VALUES (p_name, p_category_id, p_material_type, p_price, p_discount,
          p_delivery_days, p_description, NULLIF(p_care_instructions,''), p_stock);
  SELECT LAST_INSERT_ID() AS id;
END $$

DROP PROCEDURE IF EXISTS sp_add_product_image $$
CREATE PROCEDURE sp_add_product_image(
  IN p_product_id INT,
  IN p_image_url  TEXT,
  IN p_sort_order INT
)
BEGIN
  INSERT INTO product_images (product_id, image_url, sort_order)
  VALUES (p_product_id, p_image_url, p_sort_order);
END $$

DROP PROCEDURE IF EXISTS sp_replace_product_images $$
CREATE PROCEDURE sp_replace_product_images(IN p_product_id INT)
BEGIN
  DELETE FROM product_images WHERE product_id = p_product_id;
END $$

DROP PROCEDURE IF EXISTS sp_get_products $$
CREATE PROCEDURE sp_get_products(
  IN p_category_id   INT,
  IN p_material_type VARCHAR(50),
  IN p_min_price     DECIMAL(10,2),
  IN p_max_price     DECIMAL(10,2),
  IN p_search        VARCHAR(255),
  IN p_limit         INT,
  IN p_offset        INT
)
BEGIN
  SELECT
    p.*,
    c.name  AS subcategory_name,
    c.image_url AS subcategory_image,
    par.id   AS parent_category_id,
    par.name AS parent_category_name,
    GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order SEPARATOR ',') AS images
  FROM products p
  JOIN categories c   ON p.category_id = c.id
  LEFT JOIN categories par ON c.parent_id = par.id
  LEFT JOIN product_images pi ON pi.product_id = p.id
  WHERE p.is_active = 1
    AND (p_category_id   IS NULL OR p_category_id = 0  OR p.category_id   = p_category_id)
    AND (p_material_type IS NULL OR p_material_type = '' OR p.material_type = p_material_type)
    AND (p_min_price     IS NULL OR p.price >= p_min_price)
    AND (p_max_price     IS NULL OR p.price <= p_max_price)
    AND (p_search        IS NULL OR p_search = ''
         OR MATCH(p.name, p.description) AGAINST(p_search IN BOOLEAN MODE)
         OR p.name LIKE CONCAT('%', p_search, '%'))
  GROUP BY p.id
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END $$

DROP PROCEDURE IF EXISTS sp_get_product_by_id $$
CREATE PROCEDURE sp_get_product_by_id(IN p_id INT)
BEGIN
  SELECT
    p.*,
    c.name    AS subcategory_name,
    c.image_url AS subcategory_image,
    par.id    AS parent_category_id,
    par.name  AS parent_category_name,
    GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order SEPARATOR ',') AS images
  FROM products p
  JOIN categories c   ON p.category_id = c.id
  LEFT JOIN categories par ON c.parent_id = par.id
  LEFT JOIN product_images pi ON pi.product_id = p.id
  WHERE p.id = p_id
  GROUP BY p.id;
END $$

DROP PROCEDURE IF EXISTS sp_update_product $$
CREATE PROCEDURE sp_update_product(
  IN p_id                INT,
  IN p_name              VARCHAR(255),
  IN p_category_id       INT,
  IN p_material_type     VARCHAR(50),
  IN p_price             DECIMAL(10,2),
  IN p_discount          DECIMAL(5,2),
  IN p_delivery_days     INT,
  IN p_description       TEXT,
  IN p_care_instructions TEXT,
  IN p_stock             INT,
  IN p_is_active         TINYINT(1)
)
BEGIN
  UPDATE products
  SET name = p_name, category_id = p_category_id,
      material_type = p_material_type, price = p_price,
      discount = p_discount, delivery_days = p_delivery_days,
      description = p_description,
      care_instructions = NULLIF(p_care_instructions,''),
      stock = p_stock, is_active = p_is_active
  WHERE id = p_id;
  SELECT ROW_COUNT() AS affected;
END $$

DROP PROCEDURE IF EXISTS sp_delete_product $$
CREATE PROCEDURE sp_delete_product(IN p_id INT)
BEGIN
  UPDATE products SET is_active = 0 WHERE id = p_id;
  SELECT ROW_COUNT() AS affected;
END $$

DROP PROCEDURE IF EXISTS sp_update_product_stock $$
CREATE PROCEDURE sp_update_product_stock(
  IN p_product_id INT,
  IN p_delta      INT
)
BEGIN
  UPDATE products SET stock = stock + p_delta WHERE id = p_product_id;
  SELECT stock FROM products WHERE id = p_product_id;
END $$


-- =============================================================================
-- ORDERS  (stock restored automatically by TRIGGER on cancel)
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_create_order $$
CREATE PROCEDURE sp_create_order(
  IN p_user_id          INT,
  IN p_total_amount     DECIMAL(10,2),
  IN p_payment_method   VARCHAR(50),
  IN p_shipping_name    VARCHAR(255),
  IN p_shipping_phone   VARCHAR(20),
  IN p_shipping_address TEXT,
  IN p_shipping_city    VARCHAR(100),
  IN p_shipping_state   VARCHAR(100),
  IN p_shipping_pincode VARCHAR(10),
  -- JSON array: [{"product_id":1,"qty":2,"price":999.00}, ...]
  IN p_items_json       JSON
)
BEGIN
  DECLARE i          INT DEFAULT 0;
  DECLARE item_cnt   INT;
  DECLARE v_prod_id  INT;
  DECLARE v_qty      INT;
  DECLARE v_price    DECIMAL(10,2);
  DECLARE v_order_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  INSERT INTO orders (user_id, total_amount, payment_method,
                      shipping_name, shipping_phone, shipping_address,
                      shipping_city, shipping_state, shipping_pincode)
  VALUES (p_user_id, p_total_amount, p_payment_method,
          p_shipping_name, p_shipping_phone, p_shipping_address,
          p_shipping_city, p_shipping_state, p_shipping_pincode);

  SET v_order_id = LAST_INSERT_ID();
  SET item_cnt = JSON_LENGTH(p_items_json);

  WHILE i < item_cnt DO
    SET v_prod_id = JSON_EXTRACT(p_items_json, CONCAT('$[',i,'].product_id'));
    SET v_qty     = JSON_EXTRACT(p_items_json, CONCAT('$[',i,'].qty'));
    SET v_price   = JSON_EXTRACT(p_items_json, CONCAT('$[',i,'].price'));

    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (v_order_id, v_prod_id, v_qty, v_price);

    UPDATE products SET stock = stock - v_qty WHERE id = v_prod_id;

    SET i = i + 1;
  END WHILE;

  COMMIT;

  CALL sp_get_order_by_id(v_order_id);
END $$

DROP PROCEDURE IF EXISTS sp_get_order_by_id $$
CREATE PROCEDURE sp_get_order_by_id(IN p_id INT)
BEGIN
  SELECT o.*, u.name AS user_name, u.email AS user_email
  FROM orders o
  LEFT JOIN users u ON o.user_id = u.id
  WHERE o.id = p_id;

  SELECT oi.*, p.name AS product_name, c.name AS subcategory_name,
         GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order SEPARATOR ',') AS images
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  JOIN categories c ON p.category_id = c.id
  LEFT JOIN product_images pi ON pi.product_id = p.id
  WHERE oi.order_id = p_id
  GROUP BY oi.id;
END $$

DROP PROCEDURE IF EXISTS sp_get_orders_by_user $$
CREATE PROCEDURE sp_get_orders_by_user(IN p_user_id INT)
BEGIN
  SELECT o.*,
         oi.id AS item_id, oi.product_id, oi.quantity,
         oi.price AS item_price, p.name AS product_name
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.user_id = p_user_id
  ORDER BY o.created_at DESC;
END $$

DROP PROCEDURE IF EXISTS sp_get_orders_admin $$
CREATE PROCEDURE sp_get_orders_admin()
BEGIN
  SELECT o.*, u.name AS user_name, u.email AS user_email
  FROM orders o
  JOIN users u ON o.user_id = u.id
  ORDER BY o.created_at DESC;
END $$

-- Note: stock is restored automatically by trg_restore_stock_on_cancel trigger
DROP PROCEDURE IF EXISTS sp_update_order_status $$
CREATE PROCEDURE sp_update_order_status(
  IN p_id     INT,
  IN p_status ENUM('pending','confirmed','shipped','delivered','cancelled')
)
BEGIN
  UPDATE orders SET status = p_status WHERE id = p_id;
  -- Trigger fires automatically if status = 'cancelled'
  SELECT o.*, u.name AS user_name, u.email AS user_email,
         u.phone AS user_phone
  FROM orders o
  JOIN users u ON o.user_id = u.id
  WHERE o.id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_update_order_payment $$
CREATE PROCEDURE sp_update_order_payment(
  IN p_id               INT,
  IN p_status           ENUM('pending','confirmed','shipped','delivered','cancelled'),
  IN p_payment_method   VARCHAR(50),
  IN p_payment_id       VARCHAR(255),
  IN p_razorpay_order_id VARCHAR(255)
)
BEGIN
  UPDATE orders
  SET status = p_status, payment_method = p_payment_method,
      payment_id = p_payment_id, razorpay_order_id = p_razorpay_order_id
  WHERE id = p_id;
END $$


-- =============================================================================
-- OTPs
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_create_otp $$
CREATE PROCEDURE sp_create_otp(
  IN p_email      VARCHAR(255),
  IN p_phone      VARCHAR(20),
  IN p_otp        VARCHAR(10),
  IN p_expires_at DATETIME,
  IN p_type       ENUM('registration','login','password-reset')
)
BEGIN
  IF p_email IS NOT NULL AND p_email != '' THEN
    DELETE FROM otps WHERE email = p_email AND type = p_type;
  END IF;
  IF p_phone IS NOT NULL AND p_phone != '' THEN
    DELETE FROM otps WHERE phone = p_phone AND type = p_type;
  END IF;
  INSERT INTO otps (email, phone, otp, expires_at, type)
  VALUES (NULLIF(p_email,''), NULLIF(p_phone,''), p_otp, p_expires_at, p_type);
  SELECT LAST_INSERT_ID() AS id;
END $$

DROP PROCEDURE IF EXISTS sp_get_otp $$
CREATE PROCEDURE sp_get_otp(
  IN p_email    VARCHAR(255),
  IN p_phone    VARCHAR(20),
  IN p_type     ENUM('registration','login','password-reset'),
  IN p_verified TINYINT(1)
)
BEGIN
  SELECT * FROM otps
  WHERE type = p_type AND verified = p_verified
    AND (
      (p_email IS NOT NULL AND p_email != '' AND email = p_email) OR
      (p_phone IS NOT NULL AND p_phone != '' AND phone = p_phone)
    )
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_increment_otp_attempts $$
CREATE PROCEDURE sp_increment_otp_attempts(IN p_id INT)
BEGIN
  UPDATE otps SET attempts = attempts + 1 WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_verify_otp $$
CREATE PROCEDURE sp_verify_otp(IN p_id INT)
BEGIN
  UPDATE otps SET verified = 1 WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_delete_otp $$
CREATE PROCEDURE sp_delete_otp(IN p_id INT)
BEGIN
  DELETE FROM otps WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_cleanup_expired_otps $$
CREATE PROCEDURE sp_cleanup_expired_otps()
BEGIN
  DELETE FROM otps WHERE expires_at < NOW();
  SELECT ROW_COUNT() AS deleted_count;
END $$

-- =============================================================================
-- COUPONS
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_create_coupon $$
CREATE PROCEDURE sp_create_coupon(
  IN p_code           VARCHAR(50),
  IN p_discount_type  ENUM('percentage','fixed'),
  IN p_discount_value DECIMAL(10,2),
  IN p_max_uses       INT,
  IN p_valid_from     DATE,
  IN p_valid_to       DATE,
  IN p_is_active      TINYINT(1)
)
BEGIN
  INSERT INTO coupons (code, discount_type, discount_value, max_uses,
                       valid_from, valid_to, is_active)
  VALUES (UPPER(p_code), p_discount_type, p_discount_value,
          NULLIF(p_max_uses, 0), NULLIF(p_valid_from,''), NULLIF(p_valid_to,''),
          p_is_active);
  SELECT * FROM coupons WHERE id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_get_coupons $$
CREATE PROCEDURE sp_get_coupons()
BEGIN
  SELECT * FROM coupons ORDER BY created_at DESC;
END $$

DROP PROCEDURE IF EXISTS sp_get_coupon_by_id $$
CREATE PROCEDURE sp_get_coupon_by_id(IN p_id INT)
BEGIN
  SELECT * FROM coupons WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_get_coupon_by_code $$
CREATE PROCEDURE sp_get_coupon_by_code(IN p_code VARCHAR(50))
BEGIN
  SELECT * FROM coupons
  WHERE code = UPPER(p_code) AND is_active = 1
    AND (valid_from IS NULL OR valid_from <= CURDATE())
    AND (valid_to   IS NULL OR valid_to   >= CURDATE())
    AND (max_uses   IS NULL OR used_count < max_uses)
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_update_coupon $$
CREATE PROCEDURE sp_update_coupon(
  IN p_id             INT,
  IN p_code           VARCHAR(50),
  IN p_discount_type  ENUM('percentage','fixed'),
  IN p_discount_value DECIMAL(10,2),
  IN p_max_uses       INT,
  IN p_valid_from     DATE,
  IN p_valid_to       DATE,
  IN p_is_active      TINYINT(1)
)
BEGIN
  UPDATE coupons
  SET code = UPPER(p_code), discount_type = p_discount_type,
      discount_value = p_discount_value,
      max_uses = NULLIF(p_max_uses, 0),
      valid_from = NULLIF(p_valid_from,''), valid_to = NULLIF(p_valid_to,''),
      is_active = p_is_active
  WHERE id = p_id;
  SELECT * FROM coupons WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_delete_coupon $$
CREATE PROCEDURE sp_delete_coupon(IN p_id INT)
BEGIN
  DELETE FROM coupons WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_increment_coupon_usage $$
CREATE PROCEDURE sp_increment_coupon_usage(IN p_code VARCHAR(50))
BEGIN
  UPDATE coupons SET used_count = used_count + 1 WHERE code = UPPER(p_code);
END $$


-- =============================================================================
-- BANNERS
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_create_banner $$
CREATE PROCEDURE sp_create_banner(
  IN p_title         VARCHAR(255),
  IN p_image_url     TEXT,
  IN p_link          VARCHAR(500),
  IN p_position      ENUM('hero','sidebar','footer','category'),
  IN p_display_order INT,
  IN p_is_active     TINYINT(1)
)
BEGIN
  INSERT INTO banners (title, image_url, link, position, display_order, is_active)
  VALUES (p_title, p_image_url, NULLIF(p_link,''), p_position, p_display_order, p_is_active);
  SELECT * FROM banners WHERE id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_get_banners $$
CREATE PROCEDURE sp_get_banners(IN p_position VARCHAR(20))
BEGIN
  IF p_position IS NULL OR p_position = '' THEN
    SELECT * FROM banners WHERE is_active = 1
    ORDER BY display_order ASC, created_at DESC;
  ELSE
    SELECT * FROM banners WHERE is_active = 1 AND position = p_position
    ORDER BY display_order ASC;
  END IF;
END $$

DROP PROCEDURE IF EXISTS sp_get_banners_admin $$
CREATE PROCEDURE sp_get_banners_admin()
BEGIN
  SELECT * FROM banners ORDER BY display_order ASC, created_at DESC;
END $$

DROP PROCEDURE IF EXISTS sp_get_banner_by_id $$
CREATE PROCEDURE sp_get_banner_by_id(IN p_id INT)
BEGIN
  SELECT * FROM banners WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_update_banner $$
CREATE PROCEDURE sp_update_banner(
  IN p_id            INT,
  IN p_title         VARCHAR(255),
  IN p_image_url     TEXT,
  IN p_link          VARCHAR(500),
  IN p_position      ENUM('hero','sidebar','footer','category'),
  IN p_display_order INT,
  IN p_is_active     TINYINT(1)
)
BEGIN
  UPDATE banners
  SET title = p_title, image_url = p_image_url,
      link = NULLIF(p_link,''), position = p_position,
      display_order = p_display_order, is_active = p_is_active
  WHERE id = p_id;
  SELECT * FROM banners WHERE id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_delete_banner $$
CREATE PROCEDURE sp_delete_banner(IN p_id INT)
BEGIN
  DELETE FROM banners WHERE id = p_id;
END $$

-- =============================================================================
-- SITE SETTINGS
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_get_site_settings $$
CREATE PROCEDURE sp_get_site_settings()
BEGIN
  SELECT * FROM site_settings LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_upsert_site_settings $$
CREATE PROCEDURE sp_upsert_site_settings(
  IN p_logo             TEXT,
  IN p_site_name        VARCHAR(255),
  IN p_tagline          VARCHAR(255),
  IN p_contact_email    VARCHAR(255),
  IN p_contact_phone    VARCHAR(20),
  IN p_social_instagram VARCHAR(255),
  IN p_social_facebook  VARCHAR(255),
  IN p_social_twitter   VARCHAR(255)
)
BEGIN
  IF EXISTS (SELECT 1 FROM site_settings LIMIT 1) THEN
    UPDATE site_settings
    SET logo = p_logo, site_name = p_site_name, tagline = NULLIF(p_tagline,''),
        contact_email = NULLIF(p_contact_email,''),
        contact_phone = NULLIF(p_contact_phone,''),
        social_instagram = NULLIF(p_social_instagram,''),
        social_facebook  = NULLIF(p_social_facebook,''),
        social_twitter   = NULLIF(p_social_twitter,''),
        updated_at = NOW()
    LIMIT 1;
  ELSE
    INSERT INTO site_settings (logo, site_name, tagline, contact_email,
                                contact_phone, social_instagram, social_facebook, social_twitter)
    VALUES (p_logo, p_site_name, NULLIF(p_tagline,''), NULLIF(p_contact_email,''),
            NULLIF(p_contact_phone,''), NULLIF(p_social_instagram,''),
            NULLIF(p_social_facebook,''), NULLIF(p_social_twitter,''));
  END IF;
  SELECT * FROM site_settings LIMIT 1;
END $$

-- =============================================================================
-- REPORTING
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_get_dashboard_stats $$
CREATE PROCEDURE sp_get_dashboard_stats()
BEGIN
  SELECT
    COUNT(*)                                                 AS total_orders,
    COALESCE(SUM(total_amount),0)                            AS total_revenue,
    SUM(CASE WHEN status='pending'   THEN 1 ELSE 0 END)      AS pending_orders,
    SUM(CASE WHEN status='confirmed' THEN 1 ELSE 0 END)      AS confirmed_orders,
    SUM(CASE WHEN status='shipped'   THEN 1 ELSE 0 END)      AS shipped_orders,
    SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END)      AS delivered_orders,
    SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END)      AS cancelled_orders
  FROM orders;

  SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer';
  SELECT COUNT(*) AS total_products   FROM products WHERE is_active = 1;
  SELECT COUNT(*) AS total_coupons    FROM coupons WHERE is_active = 1;
  SELECT COUNT(*) AS total_banners    FROM banners WHERE is_active = 1;
END $$

DROP PROCEDURE IF EXISTS sp_get_top_products $$
CREATE PROCEDURE sp_get_top_products(IN p_limit INT)
BEGIN
  SELECT
    p.id, p.name, c.name AS subcategory,
    p.price, p.stock,
    SUM(oi.quantity)            AS total_sold,
    SUM(oi.quantity * oi.price) AS total_revenue
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  JOIN categories c ON p.category_id = c.id
  JOIN orders o ON oi.order_id = o.id
  WHERE o.status != 'cancelled'
  GROUP BY p.id, p.name, c.name, p.price, p.stock
  ORDER BY total_sold DESC
  LIMIT p_limit;
END $$

DROP PROCEDURE IF EXISTS sp_get_revenue_by_month $$
CREATE PROCEDURE sp_get_revenue_by_month()
BEGIN
  SELECT
    YEAR(created_at)  AS yr,
    MONTH(created_at) AS mo,
    COUNT(*)          AS order_count,
    SUM(total_amount) AS revenue
  FROM orders
  WHERE status != 'cancelled'
    AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
  GROUP BY yr, mo
  ORDER BY yr ASC, mo ASC;
END $$

DELIMITER ;
-- End of stored procedures
