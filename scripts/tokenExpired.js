// Функция для проверки истечения токена
export function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        // Декодируем payload токена (вторая часть JWT)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Проверяем наличие поля exp (expiration time)
        if (!payload.exp) {
            return true; // Если нет поля exp, считаем токен невалидным
        }
        
        // Проверяем, не истек ли токен (exp в секундах, сравниваем с текущим временем)
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (err) {
        console.error('Ошибка при проверке токена:', err);
        return true; // При ошибке декодирования считаем токен невалидным
    }
}
