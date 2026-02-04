<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Обработка OPTIONS запроса для CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include __DIR__ . '/../const.php';

// Получаем все данные из таблицы users, кроме поля password
$result = mysqli_query($conn, "SELECT id, name, email, phone, role, registered, last_visit FROM users ORDER BY registered DESC");

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка выполнения запроса: ' . mysqli_error($conn)]);
    exit;
}

$arr = array();
while ($row = mysqli_fetch_assoc($result)) {
    $arr[] = $row;
}

echo json_encode($arr);
