CREATE TABLE IF NOT EXISTS `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(128) NOT NULL,
    `email` VARCHAR(128) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `registered` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_visit` DATETIME NULL DEFAULT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'user',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_email` (`email`),
    INDEX `idx_registered` (`registered`),
    INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
