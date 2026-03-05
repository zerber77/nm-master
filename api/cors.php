<?php
/**
 * Централизованная обработка CORS заголовков
 * Поддерживает несколько разрешенных источников
 */

// Список разрешенных источников
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    // Добавьте здесь другие разрешенные домены для продакшена
    // getenv('FRONTEND_URL') ?: null, // Если используете переменные окружения
];

// Получаем источник запроса
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Проверяем, разрешен ли источник
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Если источник не в списке, можно разрешить только для локальной разработки
    // В продакшене лучше вернуть ошибку или не устанавливать заголовок
    if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
        header("Access-Control-Allow-Origin: $origin");
    }
}

// Устанавливаем остальные CORS заголовки
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Обработка preflight запроса (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
