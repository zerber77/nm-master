// ========== ИМПОРТЫ ==========
import { markAsWritten } from './written.js';
import { deleteRecord } from './delete.js';

// ========== МОДАЛЬНОЕ ОКНО ВХОДА ==========
function initPassModal() {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'pass-modal';
    modal.innerHTML = `
    <div class="order-modal-overlay"></div>
    <div class="order-modal-content">
        <div class="contact-form" style="width:100% !important">
        <h2 class="section-title">Введите пароль</h2>
        <button class="order-modal-close">&times;</button>
            <form id="passwordForm">
                <div class="form-group">
                    <input type="text" id="name" name="name" placeholder="Имя" required>
                </div>
                <div class="form-group">
                    <input type="text" id="pass" name="pass" placeholder="Пароль" required>
                </div>
                <p class="message"></p>
                <button type="submit" class="btn btn-primary">ВОЙТИ</button>
            </form>
        </div>
    </div>
    `;
    document.body.appendChild(modal);

    // Функция открытия модального окна
    window.openPassModal = function () {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Функция закрытия модального окна
    function closePassModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        window.location.href = "/";
    }

    modal.querySelector('.order-modal-overlay').addEventListener('click', closePassModal);
    modal.querySelector('.order-modal-close').addEventListener('click', closePassModal);
}

function sendPassword() {
    const passwordForm = document.getElementById('passwordForm');
    const message = document.querySelector('.message');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(passwordForm);
            const name = formData.get('name');

            // Базовая проверка обязательных полей
            if (!name) {
                if (message) message.innerHTML = 'Пожалуйста, заполните все обязательные поля';
                return;
            }

            const submitBtn = passwordForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="loading"></span> Отправка...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/auth/login/', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    document.querySelector('.pass-modal').classList.remove('active');
                    document.getElementById('adminLayout').classList.remove('hidden');
                    passwordForm.reset();
                } else {
                    if (message) message.innerHTML = data.message || 'Ошибка при отправке сообщения';
                }
            } catch (err) {
                if (message) message.innerHTML = 'Ошибка сервера';
            }
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
}

// ========== АДМИН-ПАНЕЛЬ ==========
const API_MAP = {
    orders: '/api/orders/getOrders/',
    messages: '/api/feedback/getFeedback/',
};

const statusBadge = document.getElementById('statusBadge');
const content = document.getElementById('content');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileOverlay = document.getElementById('mobileOverlay');

function setStatus(text) {
    if (statusBadge) statusBadge.textContent = text;
}

function setContent(html) {
    const body = content.querySelector('.content-body');
    if (body) body.innerHTML = html;
}

function renderLoader(label = 'Загружаю данные...') {
    return `
    <div class="loader">
        <span></span><span></span><span></span>
        <div>${label}</div>
    </div>
    `;
}

function renderError(message) {
    return `<div class="error-box">${message}</div>`;
}

function sanitizeValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    return String(value);
}

function renderRecords(records, title, dataType) {
    if (!Array.isArray(records) || records.length === 0) {
        return `<div class="empty-state"><i class="fa fa-inbox"></i><p>Нет данных для отображения</p></div>`;
    }

    const cards = records
        .map((record, idx) => {
            const entries = Object.entries(record);
            const meta = entries
                .filter(([key]) => /date|time|created|updated/i.test(key))
                .map(([key, val]) => `<span>${key}: ${sanitizeValue(val)}</span>`)
                .join(' • ');

            const lines = entries
                .filter(([key]) => !/date|time|created|updated|written/i.test(key))
                .map(([key, val]) => `<div class="card-line"><strong>${key}:</strong><span>${sanitizeValue(val)}</span></div>`)
                .join('');

            // Проверяем поле written (0 или false = не отработан, 1 или true = отработан)
            const isWritten = record.written === 1 || record.written === true || record.written === '1';
            const orderId = record.id || record.ID || null;
            
            // Проверяем, что orderId существует
            if (orderId === null || orderId === undefined) {
                console.warn('Заказ без ID:', record);
                console.warn('Доступные ключи:', Object.keys(record));
            } else {
                console.log('Заказ ID:', orderId, 'written:', record.written, 'isWritten:', isWritten);
            }
            
            const buttonClass = isWritten ? 'written-btn written-btn-done' : 'written-btn written-btn-pending';
            const buttonText = isWritten ? 'ОТРАБОТАН' : 'НЕ ОТРАБОТАН';
            const buttonDisabled = isWritten ? 'disabled' : '';

            return `
        <article class="data-card">
            <button class="delete-btn" data-record-id="${orderId || ''}" data-record-type="${dataType || ''}" title="Удалить">
                <i class="fa fa-trash"></i>
            </button>
            <div class="card-title">${title} #${idx + 1}</div>
            <div class="card-meta">${meta || 'Без даты'}</div>
            ${lines}
            <div class="card-actions">
                <button class="${buttonClass}" data-order-id="${orderId || ''}" ${buttonDisabled}>
                    ${buttonText}
                </button>
            </div>
        </article>
        `;
        })
        .join('');

    return `<div class="data-grid">${cards}</div>`;
}

async function fetchData(type) {
    const endpoint = API_MAP[type];
    if (!endpoint) return;

    setStatus('Загружаю данные…');
    setContent(renderLoader());

    try {
        const response = await fetch(endpoint, { cache: 'no-cache' });
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            data = text;
        }

        if (typeof data === 'string') {
            setContent(`<pre>${data}</pre>`);
            setStatus('Готово (текстовый ответ)');
            return;
        }

        if (!Array.isArray(data) && data?.data) {
            data = data.data;
        }

        setContent(renderRecords(data, type === 'orders' ? 'Заказ' : 'Сообщение', type));
        setStatus('Готово');
        
        // Инициализируем обработчики кнопок для заказов и сообщений
        if (type === 'orders' || type === 'messages') {
            // Используем делегирование событий для избежания дублирования обработчиков
            initWrittenButtons(type);
            initDeleteButtons(type);
        }
    } catch (error) {
        console.error(error);
        setContent(renderError('Не удалось загрузить данные. Проверьте orders.php/messages.php.'));
        setStatus('Ошибка');
    }
}

// Инициализация обработчиков кнопок "НЕ ОТРАБОТАН" / "ОТРАБОТАН"
// Используем делегирование событий для избежания дублирования обработчиков
let writtenButtonsInitialized = false;
let currentDataType = null;

function initWrittenButtons(type) {
    // Используем делегирование событий на контейнере
    const contentBody = document.querySelector('.content-body');
    if (!contentBody) return;
    
    // Сохраняем текущий тип данных
    currentDataType = type;
    
    // Удаляем старый обработчик, если он был добавлен
    if (writtenButtonsInitialized) {
        contentBody.removeEventListener('click', handleWrittenButtonClick);
    }
    
    // Добавляем обработчик на контейнер (делегирование событий)
    contentBody.addEventListener('click', handleWrittenButtonClick);
    writtenButtonsInitialized = true;
}

async function handleWrittenButtonClick(event) {
    // Проверяем, что клик был по кнопке "НЕ ОТРАБОТАН"
    const button = event.target.closest('.written-btn-pending:not([disabled])');
    if (!button) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const orderIdAttr = button.getAttribute('data-order-id');
    const orderId = orderIdAttr ? parseInt(orderIdAttr, 10) : null;
    
    if (!orderId || isNaN(orderId)) {
        console.error('Неверный orderId:', orderIdAttr, 'Атрибут:', button.getAttribute('data-order-id'));
        alert('Ошибка: не удалось получить ID заказа. Проверьте консоль для деталей.');
        return;
    }

    console.log('Отправка запроса для заказа ID:', orderId);

    // Блокируем кнопку на время запроса
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Обработка...';

    try {
        // Определяем тип для передачи в markAsWritten
        // Если currentDataType === 'messages', используем 'feedback', иначе 'orders'
        const typeForRequest = currentDataType === 'messages' ? 'feedback' : 'orders';
        const result = await markAsWritten(orderId, typeForRequest);
        console.log('Результат запроса:', result);
        
        if (result.success) {
            // Обновляем кнопку: делаем её зеленой и заблокированной
            button.classList.remove('written-btn-pending');
            button.classList.add('written-btn-done');
            button.textContent = 'ОТРАБОТАН';
            button.disabled = true;
        } else {
            // Восстанавливаем кнопку при ошибке
            button.disabled = false;
            button.textContent = originalText;
            alert(result.message || 'Ошибка при обновлении статуса заказа');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        button.disabled = false;
        button.textContent = originalText;
        alert('Ошибка при обновлении статуса заказа: ' + (error.message || error));
    }
}

// Инициализация обработчиков кнопок удаления
// Используем делегирование событий для избежания дублирования обработчиков
let deleteButtonsInitialized = false;

function initDeleteButtons(type) {
    // Используем делегирование событий на контейнере
    const contentBody = document.querySelector('.content-body');
    if (!contentBody) return;
    
    // Удаляем старый обработчик, если он был добавлен
    if (deleteButtonsInitialized) {
        contentBody.removeEventListener('click', handleDeleteButtonClick);
    }
    
    // Добавляем обработчик на контейнер (делегирование событий)
    contentBody.addEventListener('click', handleDeleteButtonClick);
    deleteButtonsInitialized = true;
}

async function handleDeleteButtonClick(event) {
    // Проверяем, что клик был по кнопке удаления
    const deleteButton = event.target.closest('.delete-btn');
    if (!deleteButton) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const recordIdAttr = deleteButton.getAttribute('data-record-id');
    const recordType = deleteButton.getAttribute('data-record-type');
    const recordId = recordIdAttr ? parseInt(recordIdAttr, 10) : null;
    
    if (!recordId || isNaN(recordId)) {
        console.error('Неверный recordId:', recordIdAttr);
        alert('Ошибка: не удалось получить ID записи. Проверьте консоль для деталей.');
        return;
    }
    
    if (!recordType) {
        console.error('Не указан тип записи');
        alert('Ошибка: не указан тип записи.');
        return;
    }
    
    // Подтверждение удаления
    const confirmMessage = recordType === 'orders' ? 'Вы уверены, что хотите удалить этот заказ?' : 'Вы уверены, что хотите удалить это сообщение?';
    if (!confirm(confirmMessage)) {
        return;
    }
    
    console.log('Отправка запроса на удаление записи ID:', recordId, 'тип:', recordType);
    
    // Блокируем кнопку на время запроса
    deleteButton.disabled = true;
    const originalHTML = deleteButton.innerHTML;
    deleteButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
    
    try {
        // Определяем тип для передачи в deleteRecord
        // Если recordType === 'messages', используем 'feedback', иначе 'orders'
        const typeForRequest = recordType === 'messages' ? 'feedback' : 'orders';
        const result = await deleteRecord(recordId, typeForRequest);
        console.log('Результат запроса на удаление:', result);
        
        if (result.success) {
            // Удаляем карточку из DOM
            const card = deleteButton.closest('.data-card');
            if (card) {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    card.remove();
                    // Проверяем, остались ли карточки
                    const grid = document.querySelector('.data-grid');
                    if (grid && grid.children.length === 0) {
                        const contentBody = document.querySelector('.content-body');
                        if (contentBody) {
                            contentBody.innerHTML = '<div class="empty-state"><i class="fa fa-inbox"></i><p>Нет данных для отображения</p></div>';
                        }
                    }
                }, 300);
            }
        } else {
            // Восстанавливаем кнопку при ошибке
            deleteButton.disabled = false;
            deleteButton.innerHTML = originalHTML;
            alert(result.message || 'Ошибка при удалении записи');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalHTML;
        alert('Ошибка при удалении записи: ' + (error.message || error));
    }
}

function closeMobileMenu() {
    sidebar.classList.remove('open');
    mobileOverlay.classList.remove('visible');
}

function toggleSidebar() {
    if (window.matchMedia('(max-width: 960px)').matches) {
        sidebar.classList.toggle('open');
        mobileOverlay.classList.toggle('visible');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

function initNav() {
    const links = document.querySelectorAll('[data-action]');

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            const action = link.dataset.action;

            if (action === 'home') {
                // Для мобильных сразу закрываем меню
                closeMobileMenu();
                return;
            }
            event.preventDefault();
            fetchData(action);
            closeMobileMenu();
        });
    });
}

function initSidebar() {
    sidebarToggle?.addEventListener('click', toggleSidebar);
    mobileOverlay?.addEventListener('click', closeMobileMenu);
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация модального окна для входа
    initPassModal();
    window.openPassModal();
    sendPassword();

    // Инициализация админ-панели
    initNav();
    initSidebar();
    setStatus('Ожидаю действия…');
});