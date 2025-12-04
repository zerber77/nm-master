<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
// Настройки подключения
$host = 'localhost';
$db = 'master';
$user = 'root';
$pass = '';

// Функция быстрой JSON-ответы
function respond($success, $msg) {
    echo json_encode(['success' => $success, 'message' => $msg]);
    exit;
}

// Получение данных из POST
$name    = isset($_POST['name'])    ? trim($_POST['name'])    : '';
$email   = isset($_POST['email'])   ? trim($_POST['email'])   : '';
$phone   = isset($_POST['phone'])   ? trim($_POST['phone'])   : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

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

// Подключение к БД
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    respond(false, 'Ошибка подключения к базе данных');
}
$conn->set_charset('utf8mb4');

// Сохраняем сообщение
$stmt = $conn->prepare("INSERT INTO feedback (name, email, phone, message, created_at) VALUES (?, ?, ?, ?, NOW())");
if (!$stmt) {
    respond(false, 'Ошибка подготовки запроса');
}
$stmt->bind_param('ssss', $name, $email, $phone, $message);
$ok = $stmt->execute();
$stmt->close();
$conn->close();

if ($ok) {
    respond(true, 'Спасибо! Ваше сообщение отправлено.');
} else {
    respond(false, 'Ошибка при сохранении сообщения.');
}
