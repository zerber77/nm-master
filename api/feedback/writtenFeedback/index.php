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

// Получаем ID сообщения из POST
$feedbackId = isset($_POST['feedbackId']) ? intval($_POST['feedbackId']) : 0;

// Валидация ID
if ($feedbackId <= 0) {
    respond(false, 'Неверный ID сообщения: ' . (isset($_POST['feedbackId']) ? $_POST['feedbackId'] : 'не передан'));
}

try {
    // Сначала проверяем, существует ли сообщение
    $checkStmt = $pdo->prepare("SELECT id, written FROM feedback WHERE id = :id");
    $checkStmt->execute(['id' => $feedbackId]);
    $feedback = $checkStmt->fetch();

    if (!$feedback) {
        respond(false, 'Сообщение с ID ' . $feedbackId . ' не найдено в базе данных');
    }

    // Если сообщение уже отработано, возвращаем успех
    if ($feedback['written'] == 1) {
        respond(true, 'Сообщение уже было отмечено как отработанное');
    }

    // Обновляем поле written на 1
    $stmt = $pdo->prepare("UPDATE feedback SET written = 1 WHERE id = :id");
    $stmt->execute(['id' => $feedbackId]);

    $affectedRows = $stmt->rowCount();

    if ($affectedRows > 0) {
        respond(true, 'Сообщение отмечено как отработанное');
    } else {
        // Это не должно произойти, так как мы проверили существование сообщения
        respond(false, 'Сообщение не было обновлено');
    }
} catch (\PDOException $e) {
    error_log('Database error in writtenFeedback: ' . $e->getMessage());
    respond(false, 'Ошибка при обновлении сообщения: ' . $e->getMessage());
}
