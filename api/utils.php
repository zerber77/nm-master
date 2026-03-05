<?php
/**
 * Утилитарные функции для API
 */

/**
 * Быстрая функция для отправки JSON ответа
 * 
 * @param bool $success Успешность операции
 * @param string $msg Сообщение
 */
if (!function_exists('respond')) {
    function respond($success, $msg) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => $success, 'message' => $msg]);
        exit;
    }
}
