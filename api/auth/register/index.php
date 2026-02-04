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

include("../../const.php");

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Получаем JSON данные из POST запроса
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Валидация входных данных
    if (!$data || !isset($data['user'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверный формат данных. Ожидается объект user.']);
        exit;
    }

    $user = $data['user'];
    
    // Проверяем наличие обязательных полей
    if (!isset($user['name']) || !isset($user['email']) || !isset($user['password']) || !isset($user['phone'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Не все обязательные поля заполнены (name, email, password)']);
        exit;
    }

    $name = trim($user['name']);
    $email = trim($user['email']);
    $phone = trim($user['phone']);
    $password = $user['password'];

    // Валидация данных
    if (empty($name) || strlen($name) < 2) {
        http_response_code(400);
        echo json_encode(['error' => 'Имя должно содержать минимум 2 символа']);
        exit;
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверный формат email']);
        exit;
    }

    if (empty($phone) || strlen($password) < 6){
        http_response_code(400);
        echo json_encode(['error' => 'Неверный формат номера телефона']);
        exit;
    }

    if (empty($password) || strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Пароль должен содержать минимум 6 символов']);
        exit;
    }

    try {
        // Проверяем существование пользователя с таким email
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Пользователь с таким email уже зарегистрирован']);
            exit;
        }

        // Хешируем пароль перед сохранением в БД
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Сохраняем пользователя в БД
        // Поля registered и role имеют значения по умолчанию в БД
        $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password) VALUES (:name, :email, :phone, :password)");
        $result = $stmt->execute([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'password' => $hashedPassword,
        ]);

        if (!$result) {
            http_response_code(500);
            echo json_encode(['error' => 'Ошибка при сохранении пользователя. Попробуйте позже.']);
            exit;
        }

        // Получаем ID созданного пользователя
        $userId = $pdo->lastInsertId();

        // Генерируем JWT токен
        $payload = [
            "iss" => "http://nm-master.org",
            "aud" => "http://nm-master.com",
            "iat" => time(),
            "exp" => time() + 3600, // Токен действителен 1 час
            "data" => [
                "user_id" => $userId,
                "email" => $email,
                "phone" => $phone,
                "name" => $name,
            ]
        ];
        
        $jwt = JWT::encode($payload, $key, 'HS256');

        // Возвращаем токен клиенту
        http_response_code(201); // Created
        echo json_encode([
            'token' => $jwt,
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                "phone" => $phone
            ]
        ]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка базы данных: ' . $e->getMessage()]);
        exit;
    } catch (\Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка сервера: ' . $e->getMessage()]);
        exit;
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен. Используйте POST.']);
}
?>
