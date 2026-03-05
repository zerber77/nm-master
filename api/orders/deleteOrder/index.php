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

try {
    // Сначала проверяем, существует ли заказ
    $checkStmt = $pdo->prepare("SELECT id FROM orders WHERE id = :id");
    $checkStmt->execute(['id' => $orderId]);
    $order = $checkStmt->fetch();

    if (!$order) {
        respond(false, 'Заказ с ID ' . $orderId . ' не найден в базе данных');
    }

    // Удаляем заказ
    $stmt = $pdo->prepare("DELETE FROM orders WHERE id = :id");
    $stmt->execute(['id' => $orderId]);

    $affectedRows = $stmt->rowCount();

    if ($affectedRows > 0) {
        respond(true, 'Заказ успешно удален');
    } else {
        // Это не должно произойти, так как мы проверили существование заказа
        respond(false, 'Заказ не был удален');
    }
} catch (\PDOException $e) {
    error_log('Database error in deleteOrder: ' . $e->getMessage());
    respond(false, 'Ошибка при удалении заказа: ' . $e->getMessage());
}
