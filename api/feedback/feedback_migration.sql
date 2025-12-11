-- Миграция для добавления поля ip_address в существующую таблицу feedback
-- Выполните этот скрипт, если таблица feedback уже существует без поля ip_address

ALTER TABLE `feedback` 
ADD COLUMN `ip_address` VARCHAR(45) NOT NULL DEFAULT '0.0.0.0' AFTER `message`,
ADD INDEX `idx_ip_created` (`ip_address`, `created_at`);

