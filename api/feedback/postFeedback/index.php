<?php
header('Content-Type: application/json; charset=utf-8');

// Подключаем централизованную обработку CORS
require_once(__DIR__ . '/../../cors.php');

// Подключаем класс Database для централизованного подключения к БД
require_once(__DIR__ . '/../../Database.php');

// Подключаем утилитарные функции
require_once(__DIR__ . '/../../utils.php');

// Получаем подключение к базе данных
try {
    $database = Database::getInstance();
    $pdo = $database->getConnection();
} catch (\PDOException $e) {
    respond(false, 'Ошибка подключения к базе данных');
}

// Функция получения IP-адреса клиента
function getClientIp() {
    $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (!empty($_SERVER[$key])) {
            $ip = $_SERVER[$key];
            // Если несколько IP через запятую (прокси), берем первый
            if (strpos($ip, ',') !== false) {
                $ip = trim(explode(',', $ip)[0]);
            }
            // Валидация IP (принимаем любые валидные IP, включая локальные)
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    // Если не нашли IP, возвращаем REMOTE_ADDR или дефолтное значение
    return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
}

// Получение данных из POST
$name    = isset($_POST['name'])    ? trim($_POST['name'])    : '';
$email   = isset($_POST['email'])   ? trim($_POST['email'])   : '';
$phone   = isset($_POST['phone'])   ? trim($_POST['phone'])   : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';
$ipAddress = getClientIp();

// Валидация
if ($name === '' || $email === '' || $message === '') {
    respond(false, 'Пожалуйста, заполните все обязательные поля');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Некорректный формат email');
}
// Валидация телефона: +7-xxx-xxx-xx-xx
if ($phone !== '' && !preg_match('/^\+7-\d{3}-\d{3}-\d{2}-\d{2}$/', $phone)) {
    respond(false, 'Пожалуйста, введите телефон в формате +7-xxx-xxx-xx-xx');
}

try {
    // Проверка количества сообщений от этого IP за последние 24 часа
    $maxMessagesPerDay = 5; // Лимит сообщений в сутки
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM feedback WHERE ip_address = :ip_address AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
    $stmt->execute(['ip_address' => $ipAddress]);
    $row = $stmt->fetch();
    $messageCount = $row['count'] ?? 0;

    if ($messageCount >= $maxMessagesPerDay) {
        respond(false, 'Превышен лимит сообщений. Вы можете отправить не более ' . $maxMessagesPerDay . ' сообщений в сутки.');
    }

    // Сохраняем сообщение
    $stmt = $pdo->prepare("INSERT INTO feedback (name, email, phone, message, ip_address, created_at) VALUES (:name, :email, :phone, :message, :ip_address, NOW())");
    $stmt->execute([
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'message' => $message,
        'ip_address' => $ipAddress
    ]);

    respond(true, 'Спасибо! Ваше сообщение отправлено.');
} catch (\PDOException $e) {
    error_log('Database error in postFeedback: ' . $e->getMessage());
    respond(false, 'Ошибка при сохранении сообщения.');
}
