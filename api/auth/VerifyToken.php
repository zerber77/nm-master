<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require("Firebase/JWT.php");
require("Firebase/Key.php");

function verifyToken($key):array
{
 // $JWT = new JWT();
  // Проверяем, является ли запрос preflight
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 204 No Content");
    return   ['error' => 'Invalid token format'];

  }

  // Получаем токен из заголовка Authorization
  if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    return  ['error' => 'Missing Authorization header'];
  }

  $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
  if (strpos($auth_header, 'Bearer ') !== 0) {
    return  ['error' => 'Вы не авторизовались в системе, отсутствует токен. Пожалуйста авторизуйтесь  разделе "Войти на сайт"'];
  }

  $jwt = substr($auth_header, 7); // Удаляем "Bearer " из начала строки

  try {
    // Декодируем токен
    $decoded = JWT::decode($jwt, new Key($key, 'HS256'));
    // Проверяем данные токена
    if ($decoded->exp < time()) {
      return  ['error' => 'Период авторизации истек, пожалуйста авторизуйтесь заново в разделе "Войти на сайт"'];
    }
    else return ['decoded_token' =>  $decoded ];
    // Если всё хорошо, продолжаем обработку запроса
    // echo json_encode(['message' => 'Token is valid', 'token_data' => $decoded]);
  } catch (\Exception $e) {
    return  ['error' => 'Период авторизации истек, пожалуйста авторизуйтесь заново в разделе "Войти на сайт"' ];//$e->getMessage()
  }
}
