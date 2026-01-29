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
        top: 100px;
        right: 0px;
        z-index: 10000;`;
    document.body.appendChild(notification);
    // Кнопка закрытия уведомления
    notification.querySelector('.notification-close').onclick = () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 2000); // Ждем завершения анимации
    };
    
    // Добавляем класс show для отображения уведомления с анимацией
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 2000); // Ждем завершения анимации
        }
    }, 5000);
}
