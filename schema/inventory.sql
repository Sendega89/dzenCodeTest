-- Inventory logical schema.
-- Open in MySQL Workbench: File -> Open SQL Script.
-- The running application creates the same tables on startup (packages/db).

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  login VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_login (login)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_groups (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(512) NOT NULL,
  description TEXT NULL,
  created_at DATE NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT NOT NULL AUTO_INCREMENT,
  serial_number VARCHAR(64) NOT NULL,
  is_new TINYINT NOT NULL DEFAULT 1,
  photo VARCHAR(512) NULL,
  title VARCHAR(512) NOT NULL,
  type VARCHAR(128) NOT NULL,
  specification VARCHAR(255) NOT NULL,
  status ENUM('free', 'repair') NOT NULL DEFAULT 'free',
  guarantee_start DATE NOT NULL,
  guarantee_end DATE NOT NULL,
  order_id INT NOT NULL,
  group_id INT NULL,
  user_id INT NULL,
  created_at DATE NOT NULL,
  PRIMARY KEY (id),
  KEY idx_products_order (order_id),
  KEY idx_products_type (type),
  KEY idx_products_spec (specification),
  CONSTRAINT fk_products_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_products_group FOREIGN KEY (group_id) REFERENCES product_groups (id) ON DELETE SET NULL,
  CONSTRAINT fk_products_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_prices (
  id INT NOT NULL AUTO_INCREMENT,
  product_id INT NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  symbol VARCHAR(8) NOT NULL,
  is_default TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_prices_product (product_id),
  CONSTRAINT fk_prices_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS presence (
  client_id VARCHAR(64) NOT NULL,
  last_seen BIGINT NOT NULL,
  PRIMARY KEY (client_id),
  KEY idx_presence_seen (last_seen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS outbox (
  id BIGINT NOT NULL AUTO_INCREMENT,
  type VARCHAR(64) NOT NULL,
  payload JSON NOT NULL,
  created_at DATETIME NOT NULL,
  processed_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_outbox_processed (processed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meta (
  k VARCHAR(64) NOT NULL,
  v VARCHAR(255) NOT NULL,
  PRIMARY KEY (k)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
