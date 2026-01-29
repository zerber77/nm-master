// import { initCars } from './products/pictures.js';
// import { lazyLoadImages } from './scripts/lazyLoadImg.js';
// DOM-элементы
function initHeaderInteractions() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Обработка выпадающего меню на мобильных устройствах
    dropdowns.forEach((dropdown) => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        if (!dropdownToggle) return;
        dropdownToggle.addEventListener('click', (e) => {
            // На мобильных устройствах предотвращаем переход по ссылке и открываем меню
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation(); // Предотвращаем всплытие события к обработчику navLinks
                dropdown.classList.toggle('active');
            }
        });

        // Предотвращаем закрытие dropdown при клике внутри dropdown-menu на мобильных
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.stopPropagation(); // Предотвращаем всплытие события
                }
            });
        }
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // На мобильных устройствах не закрываем меню при клике на dropdown-toggle
            if (window.innerWidth <= 768 && link.classList.contains('dropdown-toggle')) {
                return; // Позволяем обработчику dropdown-toggle обработать клик
            }
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
            // Закрываем dropdown при переходе по ссылке
            dropdowns.forEach((dropdown) => dropdown.classList.remove('active'));
        });
    });
    
    // Подсветка активного пункта по текущему пути
    let path = location.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
    navLinks.forEach(a => {
        a.classList.remove('active');
        const href = a.getAttribute('href') || '';
        const hrefPath = href.replace(/\/$/, '') || '/';
        if (hrefPath === path) {
            a.classList.add('active');
        }
        // Подсветка пункта "Услуги"
        if (path.includes('services')) {
            const servicesToggle = document.querySelector('a.dropdown-toggle[href^="/services/"]');
            servicesToggle?.classList.add('active');
        }
    });
    
    // Подсветка активного пункта в dropdown и закрытие меню при клике
    const dropdownLinks = document.querySelectorAll('.dropdown-link');
    dropdownLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const hrefPath = href.replace(/\/$/, '') || '/';
        if (hrefPath === path) {
            link.style.color = 'rgb(235, 128, 46)';
            link.style.fontWeight = '600';
        }
        // Закрываем dropdown и мобильное меню при клике на ссылку
        link.addEventListener('click', () => {
            dropdowns.forEach((dropdown) => dropdown.classList.remove('active'));
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    const logo = document.querySelector('.logo');
    logo?.addEventListener('dblclick', () => {
        window.location.href = '/master/'
    })
}
window.addEventListener('header:loaded', initHeaderInteractions);
document.addEventListener('DOMContentLoaded', initHeaderInteractions);
const dots = document.querySelectorAll('.dot');

// Плавная прокрутка для навигационных ссылок (для якорей)
document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a.nav-link');
    if (!link) return;
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';
        // Плавная прокрутка только для якорных ссылок внутри текущей страницы
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(href);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        }
    });
});

// Слайдер 
let currentSlide = 0;
const slides = document.querySelectorAll('.car-slide');
const totalSlides = slides.length;

function showSlide(index) {
    if (!totalSlides) return;
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function nextSlide() {
    if (!totalSlides) return;
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
    if (!totalSlides) return;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

// Автоматическая прокрутка слайдов
if (totalSlides) {
    setInterval(nextSlide, 5000);
}

// Навигация по точкам
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
    });
});


// Анимация элементов при прокрутке
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
}

// Эффект смены фона/тени у шапки при скролле
function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
//        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
//        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
}

// Подсветка активной секции навигации
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    const navLinks = document.querySelectorAll('.nav-link');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}


// Ограничение частоты срабатывания функции (throttle)
// Функция throttle используется для ограничения частоты вызова переданной функции func.
// Это нужно для того, чтобы функция не вызывалась слишком часто, например, при прокрутке страницы (scroll),
// что может быть ресурсоёмко и ухудшать производительность.
// В данном случае throttle принимает два аргумента:
//   func — функция, которую нужно ограничить по частоте вызова;
//   wait — минимальный интервал (в миллисекундах) между вызовами (здесь 16 мс, примерно 60 раз в секунду).
function throttle(func, wait) {
    let timeout; // локальная переменная для хранения id таймера
    return function executedFunction(...args) {
        // console.log('executedFunction', ...args);
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

// Ниже мы создаём обёртку для обработки скролла, чтобы все функции (animations, header, nav) вызывались с throttling.
const throttledScrollHandler = throttle(() => {
    handleScrollAnimations(); // анимации появления элементов на скролле
    handleHeaderScroll();     // смена фона/тени у шапки при скролле
    updateActiveNavLink();    // подсветка активной секции меню
}, 16); // 16 мс = примерно 60 кадров в секунду (60fps)

// Сначала удаляем возможные старые обработчики прокрутки, если они назначены отдельно
window.removeEventListener('scroll', handleScrollAnimations);
window.removeEventListener('scroll', handleHeaderScroll);
window.removeEventListener('scroll', updateActiveNavLink);

// Затем добавляем только один "правильный" throttled обработчик скролла
window.addEventListener('scroll', throttledScrollHandler);

// Инициализация рендера карточек автомобилей
//initCars(lazyLoadImages);

// Определение портретных изображений в карточках и установка класса контейнеру
function markPortraitImages() {
    const images = document.querySelectorAll('.car-image img');
    const checkAndMark = (img) => {
        const wrapper = img.closest('.car-image');
        if (!wrapper) return;
        if (img.naturalHeight > img.naturalWidth) {
            wrapper.classList.add('portrait');
        } else {
            wrapper.classList.remove('portrait');
        }
    };
    images.forEach(img => {
        if (img.complete && img.naturalWidth) {
            checkAndMark(img);
        } else {
            img.addEventListener('load', () => checkAndMark(img), { once: true });
        }
    });
}

document.addEventListener('DOMContentLoaded', markPortraitImages);
window.addEventListener('load', markPortraitImages);

// Плавная анимация появления числовых данных (статистика)
function animateStats() {
    const stats = document.querySelectorAll('.stat h3');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = parseInt(target.textContent.replace(/\D/g, ''));
                const suffix = target.textContent.replace(/\d/g, '');
                let currentValue = 0;
                const increment = finalValue / 50;
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= finalValue) {
                        currentValue = finalValue;
                        clearInterval(timer);
                    }
                    target.textContent = Math.floor(currentValue) + suffix;
                }, 30);
                statsObserver.unobserve(target);
            }
        });
    });
    stats.forEach(stat => statsObserver.observe(stat));
}

// Инициализация анимации статистики
document.addEventListener('DOMContentLoaded', animateStats);

// Модальное окно для увеличенного изображения
function initImageModal() {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-overlay"></div>
        <div class="image-modal-content">
            <button class="image-modal-close">&times;</button>
            <img src="" alt="">
        </div>
    `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('img');

    // Функция открытия модального окна
    window.openImageModal = function(imageSrc, imageAlt) {
        modalImg.src = imageSrc;
        modalImg.alt = imageAlt || 'Увеличенное изображение';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Функция закрытия модального окна
    function closeImageModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Очищаем src после закрытия для экономии памяти
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                modalImg.src = '';
            }
        }, 300);
    }

    // Закрытие по клику на overlay или кнопку закрытия
    modal.querySelector('.image-modal-overlay').addEventListener('click', closeImageModal);
    modal.querySelector('.image-modal-close').addEventListener('click', closeImageModal);

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeImageModal();
        }
    });
}
// Инициализация модального окна для изображений
document.addEventListener('DOMContentLoaded', initImageModal);

