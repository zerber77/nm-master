<?php
/**
 * Класс для централизованного управления подключением к базе данных
 * Использует паттерн Singleton для обеспечения единственного экземпляра подключения
 */
class Database {
    private static $instance = null;
    private $pdo;
    
    /**
     * Приватный конструктор для предотвращения прямого создания экземпляра
     */
    private function __construct() {
        // Подключаем конфигурацию
        include(__DIR__ . '/const.php');
        
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false, // Отключаем эмуляцию для безопасности
        ];
        
        try {
            $this->pdo = new PDO(
                "mysql:host=$host;dbname=$db;charset=utf8mb4", 
                $user, 
                $pass, 
                $options
            );
        } catch (\PDOException $e) {
            error_log('Database connection error: ' . $e->getMessage());
            throw new \PDOException('Ошибка подключения к базе данных', 0, $e);
        }
    }
    
    /**
     * Получить единственный экземпляр класса Database
     * 
     * @return Database
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Получить объект PDO для работы с базой данных
     * 
     * @return PDO
     */
    public function getConnection() {
        return $this->pdo;
    }
    
    /**
     * Предотвращаем клонирование экземпляра
     */
    private function __clone() {}
    
    /**
     * Предотвращаем десериализацию экземпляра
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
