// Модуль регистрации
import { showNotification } from '/scripts/notification.js'
import { phoneValidation, phonePaste, phoneFocus } from '/scripts/phoneValidation.js'
import { usePost } from '/scripts/axios/axiosPostApi.js'
import { initAuthMenu } from '/scripts/initAuthMenu.js'

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phonePattern = /^\+7-\d{3}-\d{3}-\d{2}-\d{2}$/;
    return phonePattern.test(phone);
}

function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    phoneValidation();
    phonePaste();
    phoneFocus();

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('registerPassword').value;

        const nameInput = document.getElementById('registerName');
        const emailInput = document.getElementById('registerEmail');
        const phoneInput = document.getElementById('phone');
        const passwordInput = document.getElementById('registerPassword');

        nameInput.classList.remove('error');
        emailInput.classList.remove('error');
        phoneInput.classList.remove('error');
        passwordInput.classList.remove('error');

        let isValid = true;

        if (!name || name.length < 2) {
            nameInput.classList.add('error');
            isValid = false;
        }
        if (!email || !isValidEmail(email)) {
            emailInput.classList.add('error');
            isValid = false;
        }
        if (!phone || !isValidPhone(phone)) {
            phoneInput.classList.add('error');
            isValid = false;
        }
        if (!password || password.length < 6) {
            passwordInput.classList.add('error');
            isValid = false;
        }

        if (!isValid) {
            showNotification('Пожалуйста, заполните все поля корректно', 'error');
            return;
        }

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> Регистрация...';
        submitBtn.disabled = true;

        try {
            const { request } = usePost('/api/auth/register/', {
                user: { 
                    name, 
                    email,
                    phone, 
                    password 
                },
                login: email
            }, {});

            const data = await request();

            if (data?.error) {
                showNotification(data.error || 'Ошибка при регистрации.', 'error');
                return;
            }

            if (data?.token) {
                // Сохраняем JWT токен в localStorage для последующей авторизации
                localStorage.setItem('authToken', data.token);
                // Обновляем меню авторизации сразу после сохранения токена
                initAuthMenu();
                showNotification('Регистрация выполнена успешно! Вы автоматически авторизованы.', 'success');
                
                // Перенаправляем на главную страницу после успешной регистрации
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                showNotification('Регистрация выполнена успешно! Теперь вы можете войти.', 'success');
                setTimeout(() => {
                    const loginTab = document.querySelector('[data-tab="login"]');
                    if (loginTab) loginTab.click();
                    registerForm.reset();
                }, 1500);
            }
        } catch (err) {
            console.error('Registration error:', err);
            showNotification('Ошибка при регистрации. Попробуйте позже.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

initRegisterForm();
