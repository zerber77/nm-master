<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include __DIR__ . '/../../const.php';

// Обработка OPTIONS запроса для CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Метод не поддерживается');
}

// Получаем ID заказа из POST
$orderId = isset($_POST['orderId']) ? intval($_POST['orderId']) : 0;

// Валидация ID
if ($orderId <= 0) {
    respond(false, 'Неверный ID заказа: ' . (isset($_POST['orderId']) ? $_POST['orderId'] : 'не передан'));
}

// Сначала проверяем, существует ли заказ
$checkStmt = $conn->prepare("SELECT id, written FROM orders WHERE id = ?");
if (!$checkStmt) {
    respond(false, 'Ошибка подготовки запроса проверки: ' . $conn->error);
}
$checkStmt->bind_param('i', $orderId);
$checkStmt->execute();
$result = $checkStmt->get_result();
$order = $result->fetch_assoc();
$checkStmt->close();

if (!$order) {
    respond(false, 'Заказ с ID ' . $orderId . ' не найден в базе данных');
}

// Если заказ уже отработан, возвращаем успех
if ($order['written'] == 1) {
    respond(true, 'Заказ уже был отмечен как отработанный');
}

// Обновляем поле written на 1
$stmt = $conn->prepare("UPDATE orders SET written = 1 WHERE id = ?");
if (!$stmt) {
    respond(false, 'Ошибка подготовки запроса обновления: ' . $conn->error);
}

$stmt->bind_param('i', $orderId);
$ok = $stmt->execute();

if (!$ok) {
    $stmt->close();
    respond(false, 'Ошибка выполнения запроса: ' . $stmt->error);
}

$affectedRows = $stmt->affected_rows;
$stmt->close();

if ($affectedRows > 0) {
    respond(true, 'Заказ отмечен как отработанный');
} else {
    // Это не должно произойти, так как мы проверили существование заказа
    respond(false, 'Заказ не был обновлен (affected_rows = 0)');
}
