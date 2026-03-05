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

    // Нормализация телефона: оставляем только + и цифры (убираем пробелы, дефисы, скобки)
    $phoneNormalized = preg_replace('/[\s\-\(\)]/u', '', $phone);

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

    // Валидация телефона (после нормализации: +7-442-323-44-99 → +74423234499)
    if (empty($phone) || !preg_match('/^\+?[0-9]{10,15}$/', $phoneNormalized)) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверный формат номера телефона']);
        exit;
    }
    $phone = $phoneNormalized;

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
                    "user_id" => $userId,
                    "email" => $email,
                    "phone" => $phone,
                    "name" => $name,
                ]
            ];
            
            // Проверяем наличие ключа перед кодированием
            if (empty($key)) {
                throw new \Exception('JWT секретный ключ не установлен');
            }
            
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
