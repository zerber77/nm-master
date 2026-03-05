<?php
// Подключаем централизованную обработку CORS
require_once("../../cors.php");

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require("../Firebase/JWT.php");
require("../Firebase/Key.php");

// Подключаем класс Database для централизованного подключения к БД
require_once("../../Database.php");

// Получаем подключение к базе данных
try {
    $database = Database::getInstance();
    $pdo = $database->getConnection();
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}

// Получаем JWT ключ из конфигурации
include("../../const.php");

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

  // Генерируем JWT токен с обработкой ошибок
  try {
    // Получаем настройки из переменных окружения или используем значения по умолчанию
    $appUrl = getenv('APP_URL') ?: "http://nm-master.org";
    $jwtExpiration = (int)(getenv('JWT_EXPIRATION') ?: 86400); // 24 часа по умолчанию
    
    $payload = [
      "iss" => $appUrl,
      "aud" => $appUrl,
      "iat" => time(),
      "exp" => time() + $jwtExpiration,
      "data" => [
        "user_id" => $user['id'],
        "email" => $email,
        "name" => $user['name'],
        "role" => $user['role'],
      ]
    ];
    
    // Проверяем наличие ключа перед кодированием
    if (empty($key)) {
      throw new \Exception('JWT секретный ключ не установлен');
    }
    
    $jwt = JWT::encode($payload, $key, 'HS256');

    // Возвращаем токен и роль клиенту
    http_response_code(200); // OK
    echo json_encode([
      'token' => $jwt,
      'role' => $user['role'],
      'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $email
      ]
    ]);
  } catch (\Firebase\JWT\Exception $e) {
    // Ошибка библиотеки JWT
    error_log('JWT encoding error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка генерации токена авторизации']);
    exit;
  } catch (\Exception $e) {
    // Общая ошибка при генерации токена
    error_log('Token generation error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка сервера при генерации токена']);
    exit;
  }
}
?>
