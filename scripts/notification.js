// Система уведомлений
export function showNotification(message, type = 'info') {
    // Удаляем предыдущие уведомления
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 25px;
        z-index: 10000;`;
    document.body.appendChild(notification);
    // Кнопка закрытия уведомления
    notification.querySelector('.notification-close').onclick = () => notification.remove();
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}
