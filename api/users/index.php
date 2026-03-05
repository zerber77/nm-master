<?php
header('Content-Type: application/json; charset=utf-8');

// Подключаем централизованную обработку CORS
require_once(__DIR__ . '/../cors.php');

// Подключаем класс Database для централизованного подключения к БД
require_once(__DIR__ . '/../Database.php');

// Получаем подключение к базе данных
try {
    $database = Database::getInstance();
    $pdo = $database->getConnection();
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}

try {
    // Получаем все данные из таблицы users, кроме поля password
    $stmt = $pdo->query("SELECT id, name, email, phone, role, registered, last_visit FROM users ORDER BY registered DESC");
    $arr = $stmt->fetchAll();
    
    echo json_encode($arr);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка выполнения запроса: ' . $e->getMessage()]);
    exit;
}
