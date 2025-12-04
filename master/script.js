function initPassModal() {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'order-modal';
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
        </div>
    `;
    document.body.appendChild(modal);

    const orderField = modal.querySelector('input[name="name"]');

    // Функция открытия модального окна
    window.openPassModal = function() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Функция закрытия модального окна
    function closePassModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        window.location.href = "/"
    }

    modal.querySelector('.order-modal-overlay').addEventListener('click', closePassModal);
    modal.querySelector('.order-modal-close').addEventListener('click', closePassModal);
}

function sendPassword() {
    const passwordForm = document.getElementById('passwordForm');
    const message = document.querySelector('.message');
    if (passwordForm) passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        debugger
        const formData = new FormData(passwordForm);
        const name = formData.get('name');

        // Базовая проверка обязательных полей
        if (!name) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        const submitBtn = passwordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> Отправка...';
        submitBtn.disabled = true;

        try {
            debugger
            const response = await fetch('http://master-vite/master/login.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                document.querySelector('.order-modal').classList.remove('active')
                contactForm.reset();
            } else {
                message.innerHTML = data.message || 'Ошибка при отправке сообщения';
            }
        } catch (err) {
            message.innerHTML = 'Ошибка сервера'
        }
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// Инициализация модального окна для заказа
document.addEventListener('DOMContentLoaded', ()=>{
    initPassModal()
    window.openPassModal()
    sendPassword()
})

