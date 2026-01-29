// Обработка формы заказа
import { showNotification } from '/scripts/notification.js'
import { postOrder } from '/scripts/axios/post/postOrder.js';
// Проверка email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export  async function  sendOrder (e) {
    e.preventDefault();
    const formData = new FormData(document.getElementById('orderForm'));
if (!formData) return
    const order = formData.get('order');
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const message = formData.get('message');

    // Базовая проверка обязательных полей
    if (!name || !email || !message) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }
    if (!order) {
        showNotification('Не выбран памятник', 'error');
        return;
    }

    // Валидация телефона: +7-xxx-xxx-xx-xx
    const phonePattern = /^\+7-\d{3}-\d{3}-\d{2}-\d{2}$/;
    if (phone && !phonePattern.test(phone)) {
        showNotification('Пожалуйста, введите телефон в формате +7-xxx-xxx-xx-xx', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Пожалуйста, введите корректный email адрес', 'error');
        return;
    }
    const submitBtn = document.getElementById('orderForm').querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Отправка...';
    submitBtn.disabled = true;

    try {
        // const response = await fetch('/api/orders/postOrder/', {
        //     method: 'POST',
        //     body: formData
        // })
        debugger
        const { response: data } = await postOrder(formData)
        if (data.success) {
            showNotification(data.message || 'Заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.', 'success');
            //document.getElementById('orderForm').reset();
            document.querySelector('.order-modal').classList.remove('active')
        } else {
            showNotification(data.message || 'Ошибка при отправке заказа', 'error');
        }
    } catch (err) {
        showNotification('Ошибка связи с сервером.', 'error');
    }
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
}
