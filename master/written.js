/**
 * Отправляет запрос на бэкенд для обновления статуса записи (written = 1)
 * @param {number} id - ID записи (заказа или сообщения)
 * @param {string} type - Тип записи: 'orders' для заказов или 'feedback' для сообщений
 * @returns {Promise<Object>} - Результат запроса {success: boolean, message: string}
 */
export async function markAsWritten(id, type) {
    try {
        // Определяем эндпоинт и имя параметра в зависимости от типа
        let endpoint;
        let paramName;
        let entityName;

        if (type === 'orders' || type === 'order') {
            endpoint = '/api/orders/writtenOrders/';
            paramName = 'orderId';
            entityName = 'заказа';
        } else if (type === 'feedback' || type === 'messages') {
            endpoint = '/api/feedback/writtenFeedback/';
            paramName = 'feedbackId';
            entityName = 'сообщения';
        } else {
            return {
                success: false,
                message: 'Неверный тип записи. Используйте "orders" или "feedback"'
            };
        }

        const formData = new FormData();
        formData.append(paramName, id.toString());

        console.log(`Отправка запроса на ${endpoint} с ${paramName}:`, id);

        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            console.error('HTTP ошибка:', response.status, response.statusText);
            const text = await response.text();
            console.error('Ответ сервера:', text);
            return {
                success: false,
                message: 'Ошибка сервера: ' + response.status
            };
        }

        const data = await response.json();
        console.log('Получен ответ от сервера:', data);
        return data;
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
        return {
            success: false,
            message: `Ошибка сервера при обновлении статуса ${entityName}: ` + error.message
        };
    }
}
