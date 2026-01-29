// Обработка формы обратной связи
import { showNotification } from '/scripts/notification.js'
import {phoneValidation, phonePaste, phoneFocus} from '/scripts/phoneValidation.js'
phoneValidation()
phoneFocus()
phonePaste()
const contactForm = document.getElementById('contactForm');
if (contactForm) contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    debugger
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const message = formData.get('message');

    // Базовая проверка обязательных полей
    if (!name || !email || !message) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
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

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Отправка...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/feedback/postFeedback/', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            showNotification(data.message || 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
            contactForm.reset();
        } else {
            showNotification(data.message || 'Ошибка при отправке сообщения', 'error');
        }
    } catch (err) {
        showNotification('Ошибка связи с сервером.', 'error');
    }
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
});

// Проверка email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}