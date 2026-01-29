// Ограничение частоты срабатывания функции (throttle)
// Функция throttle используется для ограничения частоты вызова переданной функции func.
// Это нужно для того, чтобы функция не вызывалась слишком часто, например, при прокрутке страницы (scroll),
// что может быть ресурсоёмко и ухудшать производительность.
// В данном случае throttle принимает два аргумента:
//   func — функция, которую нужно ограничить по частоте вызова;
//   wait — минимальный интервал (в миллисекундах) между вызовами (здесь 200 мс).
function throttle(func, wait) {
    let timeout; // локальная переменная для хранения id таймера
    return function executedFunction(...args) {
        // Эта функция будет вызываться каждый раз при событии,
        // но реальное выполнение func произойдёт только после паузы wait мс.
        const later = () => {
            clearTimeout(timeout); // на всякий случай очищаем таймер
            func(...args);         // вызываем их с правильными аргументами
        };
        clearTimeout(timeout);     // сбрасываем предыдущий таймер, если он ещё не сработал
        timeout = setTimeout(later, wait); // запускаем новый отсчёт времени
    };
}

// Кнопка "ВВЕРХ" (Scroll to Top)
function initScrollToTop() {
    // Создаем кнопку
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-to-top';
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollButton.setAttribute('aria-label', 'Прокрутить вверх');
    document.body.appendChild(scrollButton);

    // Функция для показа/скрытия кнопки
    function toggleScrollButton() {
        if (window.scrollY > 300) {
            scrollButton.classList.add('show');
        } else {
            scrollButton.classList.remove('show');
        }
    }

    // Обработчик прокрутки throttle - ранее объявленная функция для ограничения количества вызовов
    window.addEventListener('scroll', throttle(toggleScrollButton, 200));

    // Обработчик клика - плавная прокрутка вверх
    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Проверяем при загрузке страницы
    toggleScrollButton();
}

// Экспорт функции для использования в других модулях
export { initScrollToTop, throttle };
