import { isTokenExpired } from './tokenExpired.js';

export function initAuthMenu() {
    const slot = document.getElementById('authMenuSlot');
    if (!slot) {
        // Если элемент еще не загружен, попробуем позже
        setTimeout(initAuthMenu, 100);
        return;
    }

    const token = localStorage.getItem('authToken');
    
    // Проверяем наличие токена и его истечение
    if (!token || isTokenExpired(token)) {
        // Если токен истек или отсутствует, удаляем его и показываем кнопку входа
        if (token) {
            localStorage.removeItem('authToken');
        }
        slot.classList.remove('dropdown');
        slot.innerHTML = '<a href="/login/" class="nav-link">Войти</a>';
        return;
    }

    slot.classList.add('dropdown');
    
    // Декодируем токен для получения роли пользователя
    let userRole = 'user';
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userRole = payload?.data?.role || 'user';
    } catch (err) {
        console.error('Ошибка при декодировании токена:', err);
    }
    
    // Определяем ссылку в зависимости от роли
    const cabinetLink = userRole === 'admin' ? '/master/' : '/cabinet/';
    const cabinetText = userRole === 'admin' ? 'Панель управления' : 'Личный кабинет';
    
    slot.innerHTML = `
        <a href="${cabinetLink}" class="nav-link dropdown-toggle" aria-haspopup="true" aria-expanded="false">
            <i class="fas fa-user"></i>
        </a>
        <ul class="dropdown-menu">
            <li><a href="${cabinetLink}" class="dropdown-link">${cabinetText}</a></li>
            <li><a href="#" class="dropdown-link" data-action="logout">Выйти</a></li>
        </ul>
    `;

    const logoutLink = slot.querySelector('[data-action="logout"]');
    logoutLink?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        // Закрываем меню и отправляем на главную
        slot.classList.remove('active');
        window.location.href = '/';
    });
}

// Обработчик события загрузки header
window.addEventListener('header:loaded', initAuthMenu);

// Вызываем при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Небольшая задержка, чтобы дать время header загрузиться через include.js
    setTimeout(initAuthMenu, 150);
});

// Также вызываем при полной загрузке страницы (на случай, если события пропущены)
window.addEventListener('load', () => {
    setTimeout(initAuthMenu, 50);
});

// Вызываем сразу, если скрипт загрузился после загрузки DOM
if (document.readyState !== 'loading') {
    setTimeout(initAuthMenu, 200);
}