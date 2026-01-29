<?php
header('Access-Control-Allow-Origin: http://localhost:9000');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


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
  $pdo = new PDO("mysql:host=$db_analitika;dbname=$dbname_analitika;charset=utf8mb4", $dbuser_analitika, $dbpasswd_analitika, $options);
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

  $login = $data['login'];
  $plainPassword = $data['password'];

  // Проверяем существование пользователя с указанным логином
  try {
    $stmt = $pdo->prepare("SELECT user_id, name, password FROM users WHERE login = :login");
    $stmt->execute(['login' => $login]);
  }catch (\PDOException $e) {
    echo json_encode(['error' => 'Ошибка БД'.$e->getMessage()]);
    exit;
  }
  $user = $stmt->fetch();

  if (!$user || !password_verify($plainPassword, $user['password'])) {
//    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Неверный логин / пароль или вы не зарегистрированы в системе']);
    exit;
  }

    // Генерируем JWT токен
  $payload = [
    "iss" => "http://news-analitika.org",
    "aud" => "http://news-analitika.com",
    "iat" => time(),
    // "nbf" => time() + 60,
    "exp" => time() + 3600,
    "data" => [
      "user_id" => $user['user_id'],
      "login" => $login,
      "name" => $user['name'],
    ]
  ];
  $jwt = JWT::encode($payload, $key,'HS256');

    // Возвращаем токен клиенту
    http_response_code(200); // OK
    echo json_encode(['token_data' => $payload,'token' => $jwt]);
}
?>
