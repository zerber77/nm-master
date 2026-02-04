<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// // Обработка preflight запроса для CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require("../Firebase/JWT.php");
require("../Firebase/Key.php");
// Конфигурация подключения к БД
include("../../const.php");

$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
      $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, $options);
} catch (\PDOException $e) {
  throw new \PDOException($e->getMessage(), (int)$e->getCode());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Получаем JSON данные из POST запроса
  $json = file_get_contents('php://input');
  $data = json_decode($json, true);

  if (!$data || !isset($data['login']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request data']);
    exit;
  }

  $email = trim($data['login']); // login содержит email
  $plainPassword = $data['password'];

  // Проверяем существование пользователя с указанным email
  try {
    $stmt = $pdo->prepare("SELECT id, name, password, role FROM users WHERE email = :email");
    $stmt->execute(['email' => $email]);
  } catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка БД: ' . $e->getMessage()]);
    exit;
  }
  $user = $stmt->fetch();

  if (!$user || !password_verify($plainPassword, $user['password'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Неверный email / пароль или вы не зарегистрированы в системе']);
    exit;
  }

  // Обновляем last_visit текущим временем и датой
  try {
    $updateStmt = $pdo->prepare("UPDATE users SET last_visit = NOW() WHERE id = :id");
    $updateStmt->execute(['id' => $user['id']]);
  } catch (\PDOException $e) {
    // Логируем ошибку, но не прерываем авторизацию
    error_log('Ошибка обновления last_visit: ' . $e->getMessage());
  }

  // Генерируем JWT токен
  $payload = [
    "iss" => "http://nm-master.org",
    "aud" => "http://nm-master.com",
    "iat" => time(),
    "exp" => time() + 3600,
    "data" => [
      "user_id" => $user['id'],
      "email" => $email,
      "name" => $user['name'],
      "role" => $user['role'],
    ]
  ];

  $jwt = JWT::encode($payload, $key, 'HS256');

  // Возвращаем токен и роль клиенту
  http_response_code(200); // OK
  echo json_encode([
    'token_data' => $payload,
    'token' => $jwt,
    'role' => $user['role']
  ]);
}
?>
