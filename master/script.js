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
                    <input type="text" id="name" name="name" placeholder="Пароль" required>
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
                const response = await fetch('http://master-vite/master/login.php', {
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
    orders: 'http://master-vite/master/orders.php',
    messages: 'http://master-vite/api/feedback/getFeedback/',
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

function renderRecords(records, title) {
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
                .filter(([key]) => !/date|time|created|updated/i.test(key))
                .map(([key, val]) => `<div class="card-line"><strong>${key}:</strong><span>${sanitizeValue(val)}</span></div>`)
                .join('');

            return `
        <article class="data-card">
            <div class="card-title">${title} #${idx + 1}</div>
            <div class="card-meta">${meta || 'Без даты'}</div>
            ${lines}
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

        setContent(renderRecords(data, type === 'orders' ? 'Заказ' : 'Сообщение'));
        setStatus('Готово');
    } catch (error) {
        console.error(error);
        setContent(renderError('Не удалось загрузить данные. Проверьте orders.php/messages.php.'));
        setStatus('Ошибка');
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