<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
// Настройки подключения
include __DIR__ . '/../../const.php';

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
$order   = isset($_POST['order'])    ? trim($_POST['order'])    : '';
$ipAddress = getClientIp();

// Валидация
if ($name === '' || $email === '' || $message === ''|| $order === '') {
    respond(false, 'Пожалуйста, заполните все обязательные поля');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Некорректный формат email');
}
// Валидация телефона: +7-xxx-xxx-xx-xx
if ($phone !== '' && !preg_match('/^\+7-\d{3}-\d{3}-\d{2}-\d{2}$/', $phone)) {
    respond(false, 'Пожалуйста, введите телефон в формате +7-xxx-xxx-xx-xx');
}

// Подключение к БД


// Проверка количества сообщений от этого IP за последние 24 часа
$maxMessagesPerDay = 5; // Лимит сообщений в сутки
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM orders WHERE ip_address = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
if (!$stmt) {
    respond(false, 'Ошибка подготовки запроса');
}
$stmt->bind_param('s', $ipAddress);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$messageCount = $row['count'];
$stmt->close();

if ($messageCount >= $maxMessagesPerDay) {
    $conn->close();
    respond(false, 'Превышен лимит сообщений. Вы можете отправить не более ' . $maxMessagesPerDay . ' сообщений в сутки.');
}

// Сохраняем сообщение
$stmt = $conn->prepare("INSERT INTO orders (name, email, phone, message, `order`, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
if (!$stmt) {
    respond(false, 'Ошибка подготовки запроса');
}
$stmt->bind_param('ssssss', $name, $email, $phone, $message, $order, $ipAddress);
$ok = $stmt->execute();
$stmt->close();
$conn->close();

if ($ok) {
    respond(true, 'Спасибо! Ваше сообщение отправлено.');
} else {
    respond(false, 'Ошибка при сохранении сообщения.');
}
