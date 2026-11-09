CREATE DATABASE IF NOT EXISTS gadgetlens
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gadgetlens;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE processors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    manufacturer VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    performance_score INT NULL,
    generation VARCHAR(50) NULL,
    explanation TEXT NULL
);

CREATE TABLE gpus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    performance_score INT NULL,
    description TEXT NULL
);

CREATE TABLE laptops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(150) NOT NULL,
    price INT NOT NULL,
    processor_id INT NULL,
    gpu_id INT NULL,
    ram INT NOT NULL,
    storage INT NOT NULL,
    storage_type VARCHAR(30) NOT NULL,
    display_size DECIMAL(4,1) NULL,
    display_type VARCHAR(50) NULL,
    resolution VARCHAR(30) NULL,
    refresh_rate INT NULL,
    battery VARCHAR(100) NULL,
    battery_hours DECIMAL(4,1) NULL,
    weight DECIMAL(4,2) NULL,
    os VARCHAR(50) NULL,
    upgradeability VARCHAR(150) NULL,
    connectivity TEXT NULL,
    image_url VARCHAR(500) NULL,
    CONSTRAINT fk_laptop_processor FOREIGN KEY (processor_id) REFERENCES processors(id) ON DELETE SET NULL,
    CONSTRAINT fk_laptop_gpu FOREIGN KEY (gpu_id) REFERENCES gpus(id) ON DELETE SET NULL
);

CREATE TABLE tech_glossary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    term VARCHAR(80) NOT NULL UNIQUE,
    simple_description TEXT NOT NULL,
    detailed_description TEXT NULL,
    category VARCHAR(80) NULL
);

CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    purpose VARCHAR(50) NULL,
    gaming_level VARCHAR(30) NULL,
    budget_min INT NULL,
    budget_max INT NULL,
    priority_order JSON NOT NULL,
    simple_preferences JSON NOT NULL,
    advanced_preferences JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE saved_laptops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    laptop_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_saved_user_laptop UNIQUE (user_id, laptop_id),
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_laptop FOREIGN KEY (laptop_id) REFERENCES laptops(id) ON DELETE CASCADE
);

CREATE TABLE recommendation_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    search_parameters JSON NOT NULL,
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE website_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ease_of_use INT NULL,
    explanation_clarity INT NULL,
    recommendation_usefulness INT NULL,
    filtering_ease INT NULL,
    overall_experience INT NULL,
    comment TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
