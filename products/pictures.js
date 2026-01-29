import {mramor} from './img-objects/mramor.js';
import {granit} from './img-objects/granit.js';
import {komplex} from './img-objects/komplex.js';
import {cool_ofrml} from './img-objects/cool_ofrml.js';
import {sendOrder} from './order.js';
import {phoneValidation, phonePaste, phoneFocus} from '/scripts/phoneValidation.js';
import {lazyLoadImages} from '/scripts/lazyLoadImg.js';
const allData = [...mramor, ...granit, ...komplex, ...cool_ofrml]//, 
// Рендер карточек  из allData
export function renderCars(data, lazyLoadCallback) {
	const carsGrid = document.getElementById('carsGrid');
	if (!carsGrid) return;
	carsGrid.innerHTML = (data || []).map(item => `
		<div class="car-card" data-category="${item.category}">
			<div class="car-image">
				<img src="" data-src="${item.image}" alt="${item.alt}" class="lazy">
				<button class="zoom-btn" data-image="${item.image}" data-alt="${item.alt}" aria-label="Увеличить изображение">
					<i class="fas fa-search-plus"></i>
				</button>
				<div class="car-overlay">
					<button class="btn btn-primary buy-btn" data-alt="${item.title}">Заказать</button>
				</div>
			</div>
			<div class="car-info">
				<h3>${item.title}</h3>
				<p class="car-price">${item.price}</p>
			</div>
		</div>
	`).join('');

  // <div class="car-features">
				// 	<span><i class="fas fa-cog"></i> ${item.features.transmission}</span>
				// 	<span><i class="fas fa-gas-pump"></i> ${item.features.fuel}</span>
				// 	<span><i class="fas fa-road"></i> ${item.features.mileage}</span>
	// </div>
	// После рендера перевешиваем hover-события и запускаем lazyLoad для новых изображений
	attachCardHoverHandlers();
	attachZoomButtonHandlers();
	attachOrderButtonHandlers();
	if (lazyLoadCallback && typeof lazyLoadCallback === 'function') {
		lazyLoadCallback();
	}
}

// Навешиваем hover-эффекты на карточки (после рендера)
export function attachCardHoverHandlers() {
	const cards = document.querySelectorAll('.car-card');
	cards.forEach(card => {
		card.addEventListener('mouseenter', () => {
			card.classList.add('card-hover');
		});
		card.addEventListener('mouseleave', () => {
			card.classList.remove('card-hover');
		});
	});
}

// Инициализация фильтрации 
export function initCarFilters() {
	const filterButtons = document.querySelectorAll('.filter-btn');
	if (filterButtons && filterButtons.length) {
		filterButtons.forEach(button => {
			button.addEventListener('click', () => {
				filterButtons.forEach(btn => btn.classList.remove('active'));
				button.classList.add('active');
				const filter = button.getAttribute('data-filter');
				const cards = document.querySelectorAll('.car-card');
				cards.forEach(card => {
					const category = card.getAttribute('data-category');
					if (filter === 'all' || category === filter) {
						card.style.display = 'block';
						card.style.animation = 'fadeIn 0.5s ease-in-out';
					} else {
						card.style.display = 'none';
					}
				});
			});
		});
	}
}

// Инициализация рендера карточек при загрузке DOM
export function initCars(lazyLoadCallback) {
	document.addEventListener('DOMContentLoaded', () => {
		if (Array.isArray(allData)) {
			renderCars(allData, lazyLoadCallback);
			initCarFilters();
		}
	});
}

initCars(lazyLoadImages);

// Навешиваем обработчики на кнопки увеличения изображения
export function attachZoomButtonHandlers() {
	const zoomButtons = document.querySelectorAll('.zoom-btn');
	zoomButtons.forEach(button => {
		button.addEventListener('click', (e) => {
			e.stopPropagation();
			const imageSrc = button.getAttribute('data-image');
			const imageAlt = button.getAttribute('data-alt');
			// Импортируем функцию открытия модального окна с изображением из script.js
			if (window.openImageModal) {
				window.openImageModal(imageSrc, imageAlt);
			}
		});
	});
}


// Модальное окно для увеличенного изображения
function initOrderModal() {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.innerHTML = `
        <div class="order-modal-overlay"></div>
        <div class="order-modal-content">
                <div class="contact-form" style="width:100% !important">
                    <h2 class="section-title">Заказ</h2>
                    <button class="order-modal-close">&times;</button>
                        <form id="orderForm">
                            <div class="form-group">
                                <input type="text" id="order" name="order"  required>
                            </div>
							<div class="form-group">
                                <input type="text" id="name" name="name" placeholder="Ваше имя" required>
                            </div>
                            <div class="form-group">
                                <input type="email" id="email" name="email" placeholder="Ваш email" required>
                            </div>
                            <div class="form-group">
                                <input type="tel" id="phone" name="phone" placeholder="Ваш телефон">
                                <div id="phone-error" style="color: red; display: none; font-size: 13px; margin-top: 3px;">ТОЛЬКО ЦИФРЫ</div>
                            </div>
                            <div class="form-group">
                                <textarea id="message" name="message" placeholder="Ваше сообщение" rows="5" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary center-btn">Отправить сообщение</button>
                        </form>
                    </div>
                </div>
        </div>
    `;
    document.body.appendChild(modal);

    const orderField = modal.querySelector('input[name="order"]');

    // Функция открытия модального окна
    window.openOrderModal = function(orderName) {
        orderField.value = orderName;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Функция закрытия модального окна
    function closeOrderModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
	///обработка клика по кнопке заказа
	const orderForm = modal.querySelector('#orderForm')
	phoneValidation()
	phoneFocus()
	phonePaste()
	orderForm.addEventListener('submit', sendOrder);
    // Закрытие по клику на overlay или кнопку закрытия
    modal.querySelector('.order-modal-overlay').addEventListener('click', closeOrderModal);
    modal.querySelector('.order-modal-close').addEventListener('click', closeOrderModal);
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeOrderModal();
        }
    });
}

// Инициализация модального окна для заказа
document.addEventListener('DOMContentLoaded', initOrderModal);

// Навешиваем обработчики на кнопки заказа
export function attachOrderButtonHandlers() {
	const buyButtons = document.querySelectorAll('.buy-btn');
	buyButtons.forEach(button => {
		button.addEventListener('click', (e) => {
			e.stopPropagation();
			const name = button.getAttribute('data-alt');
			if (window.openOrderModal) {
				window.openOrderModal(name);
			}
		});
	});
}
