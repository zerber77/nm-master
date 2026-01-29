// Импорт необходимых модулей
import { showNotification } from '/scripts/notification.js'
import { usePost } from '/scripts/axios/axiosPostApi.js'
import { initAuthMenu } from '/scripts/initAuthMenu.js'

// Переключение между вкладками входа и регистрации
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');

authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        // Обновляем активные вкладки
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Обновляем активные формы
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${targetTab}Form`) {
                form.classList.add('active');
            }
        });
    });
});

// Переключение видимости пароля
document.querySelectorAll('.password-toggle-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const targetId = icon.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        const iconElement = icon;
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            iconElement.classList.remove('fa-eye');
            iconElement.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            iconElement.classList.remove('fa-eye-slash');
            iconElement.classList.add('fa-eye');
        }
    });
});

// Валидация email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Валидация формы входа
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        
        // Сброс ошибок
        emailInput.classList.remove('error');
        passwordInput.classList.remove('error');
        
        let isValid = true;
        
        // Валидация email
        if (!email || !isValidEmail(email)) {
            emailInput.classList.add('error');
            isValid = false;
        }
        
        // Валидация пароля
        if (!password || password.length < 6) {
            passwordInput.classList.add('error');
            isValid = false;
        }
        
        if (!isValid) {
            showNotification('Пожалуйста, заполните все поля корректно', 'error');
            return;
        }
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> Вход...';
        submitBtn.disabled = true;
        
        try {
            const { request } = usePost('/api/auth/login/', { login: email, password }, {});
            const data = await request();
            
            if (data?.error) {
                showNotification(data.error || 'Ошибка при входе. Проверьте данные.', 'error');
                return;
            }
            if (data?.token) {
                localStorage.setItem('authToken', data.token);
                // Обновляем меню авторизации сразу после сохранения токена
                initAuthMenu();
            }
            showNotification('Вход выполнен успешно!', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch (err) {
            console.error('Login error:', err);
            showNotification('Ошибка связи с сервером.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Удаление ошибок при вводе
document.querySelectorAll('.auth-form input').forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('error');
    });
});
